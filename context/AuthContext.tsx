'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signOut as supaSignOut } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCurrentUser().then(({ data, error }) => {
      if (!mounted) return;
      setUser(data?.user ?? null);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 