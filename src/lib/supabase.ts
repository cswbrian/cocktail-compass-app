import { createClient } from '@supabase/supabase-js';

// Add type declaration for Vite env variables
declare global {
  interface ImportMetaEnv {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Initializing Supabase client with:', {
  url: supabaseUrl ? 'URL is set' : 'URL is missing',
  key: supabaseAnonKey ? 'Key is set' : 'Key is missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
});

// Log initial auth state
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth state changed:', {
    event,
    hasSession: !!session,
    userId: session?.user?.id,
    expiresAt: session?.expires_at,
  });
});

// Initialize session
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error) {
    console.error('Error getting initial session:', error);
  } else {
    console.log('Initial session state:', {
      hasSession: !!session,
      userId: session?.user?.id,
      expiresAt: session?.expires_at,
      accessToken: session?.access_token ? 'present' : 'missing',
    });
  }
});
