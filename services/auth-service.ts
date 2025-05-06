import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export class AuthService {
  static async signInWithProvider(provider: 'google' | 'github') {
    const redirectTo = process.env.NEXT_PUBLIC_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
      : 'http://localhost:3000/auth/callback';

    const { error } = await supabase.auth.signInWithOAuth({ 
      provider,
      options: {
        redirectTo
      }
    });
    if (error) throw error;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }
}
