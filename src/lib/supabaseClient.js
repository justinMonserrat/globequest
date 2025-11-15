import { createClient } from '@supabase/supabase-js';

// Note: Create React App requires REACT_APP_ prefix for env variables
// If using Vite, change to import.meta.env.VITE_SUPABASE_URL
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
           supabaseUrl !== '' && 
           supabaseAnonKey !== '' &&
           !supabaseUrl.includes('placeholder') &&
           !supabaseAnonKey.includes('placeholder'));
};

// Only create client if properly configured
let supabaseClient = null;

if (isSupabaseConfigured()) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a mock client that throws helpful errors
  const errorMessage = 'Supabase is not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY environment variables.';
  
  if (process.env.NODE_ENV === 'development') {
    console.error(errorMessage);
    console.error('For local development, create a .env file with:');
    console.error('REACT_APP_SUPABASE_URL=your_supabase_url');
    console.error('REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key');
  }
  
  // Create a client that will throw errors on use
  supabaseClient = createClient('https://not-configured.supabase.co', 'not-configured-key');
  
  // Override auth methods to show helpful errors
  const originalAuth = supabaseClient.auth;
  supabaseClient.auth = {
    ...originalAuth,
    signInWithPassword: async () => {
      throw new Error('Supabase is not configured. Please set environment variables REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your Netlify dashboard or .env file.');
    },
    signUp: async () => {
      throw new Error('Supabase is not configured. Please set environment variables REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your Netlify dashboard or .env file.');
    },
    signOut: async () => {
      return { error: null };
    },
    getSession: async () => {
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: () => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  };
}

export const supabase = supabaseClient;

