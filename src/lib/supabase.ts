import { createClient } from '@supabase/supabase-js';

// Add type declaration for Vite env variables
declare global {
  interface ImportMetaEnv {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env
  .VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      storageKey: 'cocktail-compass-auth',
      storage: window.localStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'x-application-name': 'cocktail-compass',
      },
    },
  },
);

// Log initial auth state
supabase.auth.onAuthStateChange(() => {});

// Initialize session
supabase.auth.getSession().then(() => {});
