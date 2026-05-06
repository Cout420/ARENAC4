import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Configuração flexível: Use as variáveis de ambiente (.env) OU cole suas chaves diretamente aqui.
const customConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || 'AIzaSyA-bb4hQ0uq1cJsQRSH1GOajvsjPzNEwvo',
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || 'c4arena-1b699.firebaseapp.com',
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || 'c4arena-1b699',
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || 'c4arena-1b699.firebasestorage.app',
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1046994099437',
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || '1:1046994099437:web:0baca171d45182466300e4',
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || 'G-5P76XHTKRL'
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export const app = initializeApp(customConfig);
export const db = getFirestore(app, customConfig.projectId === firebaseConfig.projectId ? firebaseConfig.firestoreDatabaseId : undefined);
export const storage = getStorage(app);

let _auth: any = null;
export async function getFirebaseAuth() {
  if (!_auth) {
    const { getAuth } = await import('firebase/auth');
    _auth = getAuth(app);
  }
  return _auth;
}

export async function signInWithGoogle() {
  try {
    const auth = await getFirebaseAuth();
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
}

export async function signOut() {
  const auth = await getFirebaseAuth();
  const { signOut: fbSignOut } = await import('firebase/auth');
  return fbSignOut(auth);
}

export async function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let currentUser = null;
  try {
    const auth = await getFirebaseAuth();
    currentUser = auth.currentUser;
  } catch (e) {
    // Ignore error if auth isn't initialized
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

