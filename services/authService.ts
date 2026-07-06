import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { handleServiceError } from '../lib/utils';

type User = Database['public']['Tables']['profiles']['Row'];

interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: 'owner' | 'tenant';
  phone?: string;
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      handleServiceError(error, 'Erro ao fazer login');
    }
    return data;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      handleServiceError(error, 'Erro ao solicitar redefinição de senha');
    }
  },

  async recoverAccount(identifier: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .or(`cpf.eq.${identifier},phone.eq.${identifier}`)
      .single();

    if (error) throw new Error('Não encontramos nenhuma conta com esses dados.');

    const email = data.email;
    const [user, domain] = email.split('@');
    const maskedUser = user[0] + '*'.repeat(user.length - 2) + user[user.length - 1];
    return { email: `${maskedUser}@${domain}` };
  },

  async signUp({ email, password, name, role, phone }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          phone,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getCurrentProfile(): Promise<User | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
