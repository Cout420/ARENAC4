import React, { createContext, useContext, useEffect, useState } from 'react';

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
    
    // Dynamically loading firebase to save initial bandwidth
    const { db, handleFirestoreError, OperationType, getFirebaseAuth } = await import('../lib/firebase');
    const { onAuthStateChanged } = await import('firebase/auth');
    const { doc, getDoc } = await import('firebase/firestore');
    const { useStore } = await import('../store/useStore');
    
    const auth = await getFirebaseAuth();
    authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        localStorage.setItem('maybeLoggedIn', 'true');
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
            setProfile(null);
            setRequireProfileCompletion(true);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }
      } else {
        localStorage.removeItem('maybeLoggedIn');
        setProfile(null);
        setRequireProfileCompletion(false);
        useStore.setState({ isAdminMode: false });
      }
      setLoading(false);
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
      const { signInWithGoogle } = await import('../lib/firebase');
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    const { signOut: fbSignOut } = await import('../lib/firebase');
    await fbSignOut();
    setLoading(false);
  };

  const completeProfile = async (data: { whatsapp: string; cpf: string }) => {
    if (!user) return;
    setLoading(true);
    try {
      const { db, handleFirestoreError, OperationType } = await import('../lib/firebase');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
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
      const { handleFirestoreError, OperationType } = await import('../lib/firebase');
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
