import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];
type PropertyWithTenant = Database['public']['Views']['properties_with_tenant']['Row'];

// Check if Supabase is configured or if we should use mock
const env = (import.meta as any).env || {};
const isMock = !env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL.includes('placeholder');

export const propertyService = {
    async getAll(): Promise<Property[]> {
        if (isMock) return [];
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching properties:', error);
            throw error;
        }

        return data;
    },

    async getAllWithTenant(): Promise<PropertyWithTenant[]> {
        if (isMock) return [];
        const { data, error } = await supabase
            .from('properties_with_tenant')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching properties with tenant:', error);
            throw error;
        }

        return data;
    },

    async getById(id: string): Promise<Property | null> {
        if (isMock) return null;
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching property:', error);
            return null;
        }

        return data;
    },

    async create(property: PropertyInsert): Promise<Property> {
        if (isMock) throw new Error("Create not supported in mock mode");
        const { data, error } = await supabase
            .from('properties')
            .insert(property)
            .select()
            .single();

        if (error) {
            console.error('Error creating property:', error);
            throw error;
        }

        return data;
    },

    async update(id: string, updates: PropertyUpdate): Promise<Property> {
        if (isMock) throw new Error("Update not supported in mock mode");
        const { data, error } = await supabase
            .from('properties')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating property:', error);
            throw error;
        }

        return data;
    },

    async delete(id: string): Promise<void> {
        if (isMock) return;
        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting property:', error);
            throw error;
        }
    },

    async getByStatus(status: 'DISPONÍVEL' | 'ALUGADO' | 'MANUTENÇÃO'): Promise<Property[]> {
        if (isMock) return [];
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching properties by status:', error);
            throw error;
        }

        return data;
    },

    async getTenantProperties(): Promise<PropertyWithTenant[]> {
        if (isMock) return [];
        const { data, error } = await supabase
            .from('properties_with_tenant')
            .select('*')
            .not('tenant_id', 'is', null);

        if (error) {
            console.error('Error fetching tenant properties:', error);
            throw error;
        }

        return data;
    },
};