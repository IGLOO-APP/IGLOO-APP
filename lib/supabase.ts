import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Global variable to store the Clerk JWT
let supabaseToken: string | null = null;

/**
 * Injects the Clerk JWT into the Supabase client.
 * This should be called whenever the Clerk session changes.
 */
export const setSupabaseToken = (token: string | null) => {
  supabaseToken = token;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO: Variáveis de ambiente do Supabase não encontradas.');
}

// Create a single Supabase client with a custom fetch that injects the token
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    global: {
      fetch: async (url, options = {}) => {
        const headers = new Headers(options.headers);
        
        // If we have a token, inject it into the Authorization header
        if (supabaseToken) {
          headers.set('Authorization', `Bearer ${supabaseToken}`);
        }

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
    auth: {
      persistSession: false, // Clerk handles persistence
    },
  }
);

// Helper for quick checks (optional, but kept for compatibility)
export const isAuthenticated = () => !!supabaseToken;
