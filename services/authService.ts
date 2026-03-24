import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

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

    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  async recoverAccount(identifier: string) {
    // Try to find by CPF or Phone
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .or(`cpf.eq.${identifier},phone.eq.${identifier}`)
      .single();

    if (error) throw new Error('Não encontramos nenhuma conta com esses dados.');

    // Mask the email for security: p*******o@teste.com
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
    // This is now handled better in profileService, but keeping for compatibility
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

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
