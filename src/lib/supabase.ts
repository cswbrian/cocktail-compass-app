import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

// Explorer-only: allow boot without Supabase env (no client, no network)
const hasSupabaseConfig = Boolean(
  supabaseUrl && supabaseAnonKey,
);

function createDisabledClient(): SupabaseClient {
  const disabled = () => {
    throw new Error(
      'Supabase is disabled (Explorer-only mode; missing VITE_SUPABASE_* env)',
    );
  };

  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      if (prop === 'auth') {
        return {
          getSession: async () => ({
            data: { session: null },
            error: null,
          }),
          onAuthStateChange: () => ({
            data: {
              subscription: { unsubscribe: () => {} },
            },
          }),
          signInWithOAuth: disabled,
          signOut: async () => ({ error: null }),
          exchangeCodeForSession: disabled,
        };
      }
      return disabled;
    },
  });
}

export const supabase: SupabaseClient = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
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
    })
  : createDisabledClient();

if (hasSupabaseConfig) {
  // Log initial auth state
  supabase.auth.onAuthStateChange(() => {});

  // Initialize session
  supabase.auth.getSession().then(() => {});
} else {
  console.warn(
    '[supabase] Explorer-only mode: client disabled (no VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)',
  );
}
