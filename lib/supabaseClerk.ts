import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/clerk-react';
import { useMemo } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Hook para obter um cliente do Supabase autenticado via Clerk.
 * Garante que o Row Level Security (RLS) funcione corretamente.
 */
export const useSupabase = () => {
  const { session } = useSession();

  return useMemo(() => {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options = {}) => {
          // Obtém o token JWT customizado do Clerk para o Supabase
          // IMPORTANTE: Você deve criar um JWT Template chamado 'supabase' no painel do Clerk
          const clerkToken = await session?.getToken({ template: 'supabase' });

          const headers = new Headers(options.headers);
          
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    });
  }, [session]);
};
