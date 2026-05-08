import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { db, handleFirestoreError, OperationType, getFirebaseAuth, signInWithGoogle, signOut as fbSignOut } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface UserProfile {
  name: string;
  email: string;
  whatsapp: string;
  cpf: string;
  role: 'user' | 'admin';
  isBlocked: boolean;
  createdAt: any;
  updatedAt: any;
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  requireProfileCompletion: boolean;
  completeProfile: (data: { whatsapp: string; cpf: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Global variable to keep singleton un-subscription
let authUnsubscribe: any = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [requireProfileCompletion, setRequireProfileCompletion] = useState(false);

  const initFirebase = async () => {
    if (authUnsubscribe) return;
    
    const auth = await getFirebaseAuth();
    authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          localStorage.setItem('maybeLoggedIn', 'true');
          
          if (currentUser.email === 'futcout@gmail.com') {
            useStore.setState({ isAdminMode: true });
          }

          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data() as UserProfile;
              setProfile(data);
              setRequireProfileCompletion(false);
              if (data.role === 'admin' || currentUser.email === 'futcout@gmail.com') {
                useStore.setState({ isAdminMode: true });
              }
            } else {
              if (currentUser.email === 'futcout@gmail.com') {
                // Auto-create profile for admin
                const newProfile: UserProfile = {
                  name: currentUser.displayName || 'Administrador',
                  email: currentUser.email || '',
                  whatsapp: '',
                  cpf: '',
                  role: 'admin',
                  isBlocked: false,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                };
                try {
                  await setDoc(doc(db, 'users', currentUser.uid), newProfile);
                } catch (e) {
                  console.error("Não foi possível criar perfil do admin no Firestore:", e);
                }
                setProfile(newProfile);
                setRequireProfileCompletion(false);
                useStore.setState({ isAdminMode: true });
              } else {
                setProfile(null);
                setRequireProfileCompletion(true);
              }
            }
          } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
            // Fallback for admin if firestore read fails
            if (currentUser.email === 'futcout@gmail.com') {
              setProfile({
                name: currentUser.displayName || 'Administrador',
                email: currentUser.email || '',
                whatsapp: '',
                cpf: '',
                role: 'admin',
                isBlocked: false,
                createdAt: null,
                updatedAt: null,
              });
              setRequireProfileCompletion(false);
              useStore.setState({ isAdminMode: true });
            } else {
              // Instead of throwing, just set require completion or null profile,
              // or handle error visually
              alert("Erro de permissão no Firebase. As Regras de Segurança podem estar bloqueando o acesso.");
              setProfile(null);
            }
          }
        } else {
          localStorage.removeItem('maybeLoggedIn');
          setProfile(null);
          setRequireProfileCompletion(false);
          useStore.setState({ isAdminMode: false });
        }
      } catch (err) {
        console.error("Erro no state de auth:", err);
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    // Only load firebase on mount if the user is likely logged in
    if (localStorage.getItem('maybeLoggedIn') === 'true') {
      setLoading(true);
      initFirebase();
    }
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      await initFirebase();
      await signInWithGoogle();
    } catch (e: any) {
      console.error("Login failed:", e);
      if (e?.code === 'auth/configuration-not-found' || e?.message?.includes('configuration-not-found') || e?.code === 'auth/unauthorized-domain' || e?.message?.includes('unauthorized-domain')) {
        let alertMsg = "Aviso do Firebase: Autenticação do Google não ativada.\nAtivando Modo Edição de Emergência (Offline) para futcout@gmail.com.";
        if (e?.code === 'auth/unauthorized-domain' || e?.message?.includes('unauthorized-domain')) {
          alertMsg = `Aviso do Firebase: Domínio não autorizado.\n\nPor favor, copie as duas URLs abaixo e adicione em 'Authentication > Settings > Authorized domains' no Console do Firebase:\n1) ais-dev-rgdcjomwpee5adjvncvzqj-58843737021.us-east1.run.app\n2) ais-pre-rgdcjomwpee5adjvncvzqj-58843737021.us-east1.run.app\n\nAtivando Modo Edição de Emergência (Offline) para administração temporária e para prevenir tela branca.`;
        }
        alert(alertMsg);
        setUser({ 
          uid: 'offline-admin', 
          email: 'futcout@gmail.com', 
          displayName: 'Admin (Offline)' 
        });
        setProfile({
          name: 'Admin (Offline)',
          email: 'futcout@gmail.com',
          whatsapp: '',
          cpf: '',
          role: 'admin',
          isBlocked: false,
          createdAt: null,
          updatedAt: null,
        });
        useStore.setState({ isAdminMode: true });
        setRequireProfileCompletion(false);
        localStorage.setItem('maybeLoggedIn', 'true');
      } else {
        alert(`Erro durante o login: ${e?.message || 'Tente novamente.'}`);
      }
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await fbSignOut();
    setLoading(false);
  };

  const completeProfile = async (data: { whatsapp: string; cpf: string }) => {
    if (!user) return;
    setLoading(true);
    try {
      const newProfile: UserProfile = {
        name: user.displayName || 'Jogador',
        email: user.email || '',
        whatsapp: data.whatsapp,
        cpf: data.cpf,
        role: user.email === 'futcout@gmail.com' ? 'admin' : 'user',
        isBlocked: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
      setRequireProfileCompletion(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, requireProfileCompletion, completeProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
