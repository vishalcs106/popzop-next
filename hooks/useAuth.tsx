'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/types';

interface AuthContextValue {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAnon: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInAnon: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    async function init() {
      const { onAuthStateChanged } = await import('firebase/auth');
      const { doc, setDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
      const { auth, db } = await import('@/lib/firebase/client');

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          const ref = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            await setDoc(ref, {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Anonymous',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              createdAt: serverTimestamp(),
            });
          }
          const profileSnap = await getDoc(ref);
          if (profileSnap.exists()) {
            setUserProfile({ id: profileSnap.id, ...profileSnap.data() } as unknown as User);
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });

    }

    init().catch(() => setLoading(false));
    return () => unsubscribe?.();
  }, []);

  async function signInWithGoogle() {
    const { signInWithPopup } = await import('firebase/auth');
    const { auth, googleProvider } = await import('@/lib/firebase/client');
    await signInWithPopup(auth, googleProvider);
  }

  async function signInAnon() {
    const { signInAnonymously } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase/client');
    await signInAnonymously(auth);
  }

  async function logout() {
    const { signOut } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase/client');
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, signInAnon, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
