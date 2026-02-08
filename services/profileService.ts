import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Check if Supabase is configured or if we should use mock
const env = (import.meta as any).env || {};
const isMock = !env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL.includes('placeholder');

export const profileService = {
    async getById(id: string): Promise<Profile | null> {
        if (isMock) {
            // Check session first
            const storedSession = localStorage.getItem('igloo_mock_session');
            if (storedSession) {
                const session = JSON.parse(storedSession);
                if (session.user.id === id) return session.user;
            }
            // Check specific mock profiles
            const storedProfiles = JSON.parse(localStorage.getItem('igloo_mock_profiles') || '{}');
            if (storedProfiles[id]) return storedProfiles[id];

            // Check hardcoded mocks
            if (id === 'owner-123') return {
                id: 'owner-123',
                email: 'proprietario@teste.com',
                name: 'Investidor Exemplo',
                role: 'owner',
                admin_type: null,
                permissions: [],
                is_suspended: false,
                avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwRIAHlgLaW6OqzLEr6KH9kj4TGcypVin8vG0nCnlg_EiRsv3e561_S0pU6gWh-_QTbZSo1wTTeTa1eUzsn3qDoV7F2ZkeYhUXC1qQ693w1T_qhEMSRNparuohwnqCxmtjp1WP7yfrOyV41z5DUDYQWtT2DN2BOuEvt-l4Zme5iHAST-ZPnDLEWyZDtU3KB7inrHYdgFQW0i41SlR9Gu26TEHY7zIfA7Yz2Y6_85c20Atg3MSIoA-q5EdHHyFckC73eced5eTGvEg3',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                phone: null,
                cpf: null
            };

            if (id === 'tenant-123') return {
                id: 'tenant-123',
                email: 'inquilino@teste.com',
                name: 'João Silva',
                role: 'tenant',
                admin_type: null,
                permissions: [],
                is_suspended: false,
                avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                phone: null,
                cpf: null
            };

            if (id === 'admin-123') return {
                id: 'admin-123',
                email: 'admin@teste.com',
                name: 'Super Admin',
                role: 'admin',
                admin_type: 'super',
                permissions: ['*'],
                is_suspended: false,
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                phone: null,
                cpf: null
            };

            return null;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }

        return data;
    },

    async getByEmail(email: string): Promise<Profile | null> {
        if (isMock) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            console.error('Error fetching profile by email:', error);
            return null;
        }

        return data;
    },

    async update(id: string, updates: ProfileUpdate): Promise<Profile> {
        if (isMock) {
            const profile = await this.getById(id);
            if (!profile) throw new Error("Profile not found");
            return { ...profile, ...updates } as Profile;
        }

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }

        return data;
    },

    async getTenants(): Promise<Profile[]> {
        if (isMock) return [];

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'tenant')
            .order('name');

        if (error) {
            console.error('Error fetching tenants:', error);
            throw error;
        }

        return data;
    },

    async getOwners(): Promise<Profile[]> {
        if (isMock) return [];

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'owner')
            .order('name');

        if (error) {
            console.error('Error fetching owners:', error);
            throw error;
        }

        return data;
    },
};