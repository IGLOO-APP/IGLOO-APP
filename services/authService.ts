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

const MOCK_USERS: Record<string, any> = {
  'proprietario@teste.com': {
    id: 'owner-123',
    email: 'proprietario@teste.com',
    name: 'Investidor Exemplo',
    role: 'owner',
    avatar_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDwRIAHlgLaW6OqzLEr6KH9kj4TGcypVin8vG0nCnlg_EiRsv3e561_S0pU6gWh-_QTbZSo1wTTeTa1eUzsn3qDoV7F2ZkeYhUXC1qQ693w1T_qhEMSRNparuohwnqCxmtjp1WP7yfrOyV41z5DUDYQWtT2DN2BOuEvt-l4Zme5iHAST-ZPnDLEWyZDtU3KB7inrHYdgFQW0i41SlR9Gu26TEHY7zIfA7Yz2Y6_85c20Atg3MSIoA-q5EdHHyFckC73eced5eTGvEg3',
  },
  'inquilino@teste.com': {
    id: 'tenant-123',
    email: 'inquilino@teste.com',
    name: 'João Silva',
    role: 'tenant',
    avatar_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf',
  },
  'admin@teste.com': {
    id: 'admin-123',
    email: 'admin@teste.com',
    name: 'Super Admin',
    role: 'admin',
    admin_type: 'super',
    permissions: ['*'],
  },
};

export const authService = {
  async signIn(email: string, password: string) {
    // Dev Mode Fallback for @teste.com emails
    if (email.endsWith('@teste.com')) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const user = MOCK_USERS[email];
      if (user && (password === 'teste123' || password === 'admin123')) {
        const session = { user };
        localStorage.setItem('igloo_dev_session', JSON.stringify(session));
        return { user, session };
      }
      throw new Error('Credenciais de teste inválidas.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    if (email.endsWith('@teste.com')) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  async recoverAccount(identifier: string) {
    if (identifier.includes('teste')) {
      return { email: 'p*******o@teste.com' };
    }

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
    localStorage.removeItem('igloo_dev_session');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const devSession = localStorage.getItem('igloo_dev_session');
    if (devSession) return JSON.parse(devSession);

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getCurrentUser() {
    const devSession = localStorage.getItem('igloo_dev_session');
    if (devSession) return JSON.parse(devSession).user;

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
