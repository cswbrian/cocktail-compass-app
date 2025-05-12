'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { AuthService } from '@/services/auth-service';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithProvider: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    AuthService.getCurrentSession().then((user) => {
      if (!mounted) return;
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      if (!mounted) return;
      setUser(user);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithProvider = async (provider: 'google' | 'github') => {
    await AuthService.signInWithProvider(provider);
  };

  const signOut = async () => {
    await AuthService.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithProvider, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 