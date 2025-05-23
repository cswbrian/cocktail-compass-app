'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { AuthService } from '@/services/auth-service';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithProvider: (
    provider: 'google' | 'github',
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithProvider: async () => {},
  signOut: async () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    AuthService.getCurrentSession()
      .then(setUser)
      .finally(() => setLoading(false));

    // Listen for auth changes
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange(setUser);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithProvider = async (
    provider: 'google' | 'github',
  ) => {
    await AuthService.signInWithProvider(provider);
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithProvider, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
