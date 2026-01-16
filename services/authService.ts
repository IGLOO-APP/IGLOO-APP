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

// Mock User Data for Demo
const MOCK_USERS: Record<string, any> = {
    'proprietario@teste.com': {
        id: 'owner-123',
        email: 'proprietario@teste.com',
        name: 'Investidor Exemplo',
        role: 'owner',
        avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwRIAHlgLaW6OqzLEr6KH9kj4TGcypVin8vG0nCnlg_EiRsv3e561_S0pU6gWh-_QTbZSo1wTTeTa1eUzsn3qDoV7F2ZkeYhUXC1qQ693w1T_qhEMSRNparuohwnqCxmtjp1WP7yfrOyV41z5DUDYQWtT2DN2BOuEvt-l4Zme5iHAST-ZPnDLEWyZDtU3KB7inrHYdgFQW0i41SlR9Gu26TEHY7zIfA7Yz2Y6_85c20Atg3MSIoA-q5EdHHyFckC73eced5eTGvEg3'
    },
    'inquilino@teste.com': {
        id: 'tenant-123',
        email: 'inquilino@teste.com',
        name: 'João Silva',
        role: 'tenant',
        avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf'
    }
};

// Check if Supabase is configured or if we should use mock
const env = (import.meta as any).env || {};
const isMock = !env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL.includes('placeholder');

export const authService = {
    async signIn(email: string, password: string) {
        if (isMock) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const user = MOCK_USERS[email];
            if (user && password === 'teste123') {
                const session = { user };
                localStorage.setItem('igloo_mock_session', JSON.stringify(session));
                return { user, session };
            }
            throw new Error('Credenciais inválidas. Tente: proprietario@teste.com / teste123');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    async signUp({ email, password, name, role, phone }: SignUpData) {
        if (isMock) {
             await new Promise(resolve => setTimeout(resolve, 500));
             const newUser = {
                id: `user-${Date.now()}`,
                email,
                name,
                role,
                avatar_url: null,
                phone
            };
            const session = { user: newUser };
            localStorage.setItem('igloo_mock_session', JSON.stringify(session));
            // Store profile in mock storage for retrieval
            const profiles = JSON.parse(localStorage.getItem('igloo_mock_profiles') || '{}');
            profiles[newUser.id] = newUser;
            localStorage.setItem('igloo_mock_profiles', JSON.stringify(profiles));
            
            return { user: newUser, session };
        }

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
        if (isMock) {
            localStorage.removeItem('igloo_mock_session');
            return;
        }
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getSession() {
        if (isMock) {
            const stored = localStorage.getItem('igloo_mock_session');
            return stored ? JSON.parse(stored) : null;
        }
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    async getCurrentUser() {
        if (isMock) {
            const session = await this.getSession();
            return session?.user || null;
        }
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    async getCurrentProfile(): Promise<User | null> {
        // This is now handled better in profileService, but keeping for compatibility
        const user = await this.getCurrentUser();
        if (!user) return null;
        
        if (isMock) return user as any;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return data;
    },

    async resetPassword(email: string) {
        if (isMock) return;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
    },

    async updatePassword(newPassword: string) {
        if (isMock) return;
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) throw error;
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
        if (isMock) {
             // Mock subscription
             return { data: { subscription: { unsubscribe: () => {} } } };
        }
        return supabase.auth.onAuthStateChange(callback);
    },
};