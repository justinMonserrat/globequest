import { createClient } from '@supabase/supabase-js';

// Note: Create React App requires REACT_APP_ prefix for env variables
// If using Vite, change to import.meta.env.VITE_SUPABASE_URL
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Only warn in development, in production we'll let it fail gracefully
if (process.env.NODE_ENV === 'development' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Supabase environment variables are not set. Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env file');
}

// Create client with empty strings if not set (will fail on actual API calls, but won't crash the app)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

