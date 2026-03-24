import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// NOTE: Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env
// For demo purposes, we will default to placeholders if not found,
// to prevent runtime crash during initial render, but functionality will require valid keys.

// Safely access environment variables using Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.error(
    'ERRO: Variáveis de ambiente do Supabase não encontradas. Verifique seu arquivo .env'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const isAuthenticated = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
};

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const getCurrentProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};
