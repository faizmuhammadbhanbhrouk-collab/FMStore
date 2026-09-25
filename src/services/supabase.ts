import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from localStorage first (for runtime configuration in Settings) or env
const storedUrl = localStorage.getItem('fm_supabase_url');
const storedKey = localStorage.getItem('fm_supabase_anon_key');

const supabaseUrl = storedUrl || import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export function updateSupabaseConfig(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem('fm_supabase_url', url);
    localStorage.setItem('fm_supabase_anon_key', anonKey);
  } else {
    localStorage.removeItem('fm_supabase_url');
    localStorage.removeItem('fm_supabase_anon_key');
  }
}
