import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export class AuthService {
  static async signInWithProvider(provider: 'google' | 'github') {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider,
      options: {
        redirectTo: window.location.origin
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

  // Handle the OAuth callback manually
  static async handleAuthCallback() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }
}
