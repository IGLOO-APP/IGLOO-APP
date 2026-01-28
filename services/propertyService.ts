
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { Property } from '../types';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

// Check if Supabase is configured or if we should use mock
const env = (import.meta as any).env || {};
const isMock = !env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL.includes('placeholder');

// Helper to map DB row to Frontend Type
const mapProperty = (row: any): Property => ({
    id: row.id,
    name: row.name,
    address: row.address,
    status: row.status,
    price: `R$ ${row.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    numeric_price: row.price,
    market_value: row.market_value || 0,
    area: `${row.area}m²`,
    image: row.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=300', // Fallback image
    status_color: row.status === 'ALUGADO' 
        ? 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' 
        : row.status === 'MANUTENÇÃO' 
            ? 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400' 
            : 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
    // In a real join, we would fetch tenant and contract data
    tenant: row.contracts?.[0]?.profiles ? {
        id: row.contracts[0].profiles.id,
        name: row.contracts[0].profiles.name,
        email: row.contracts[0].profiles.email,
        phone: row.contracts[0].profiles.phone || '',
        status: 'active',
        image: row.contracts[0].profiles.avatar_url
    } : null,
    contract: row.contracts?.[0] ? {
        id: row.contracts[0].id,
        contract_number: row.contracts[0].contract_number || 'N/A',
        property: row.name,
        tenant_name: row.contracts[0].profiles?.name || 'N/A',
        owner_name: 'Você',
        start_date: new Date(row.contracts[0].start_date).toLocaleDateString('pt-BR'),
        end_date: new Date(row.contracts[0].end_date).toLocaleDateString('pt-BR'),
        value: `R$ ${row.contracts[0].monthly_value}`,
        numeric_value: row.contracts[0].monthly_value,
        payment_day: row.contracts[0].payment_day,
        status: row.contracts[0].status,
        signers: [],
        history: []
    } : null
});

export const propertyService = {
    async getAll(): Promise<Property[]> {
        if (isMock) {
            // ... keep mock logic or return empty array if you want to force DB use
            return []; 
        }
        
        const { data, error } = await supabase
            .from('properties')
            .select(`
                *,
                contracts:contracts(
                    id, contract_number, start_date, end_date, monthly_value, payment_day, status,
                    profiles:tenant_id(id, name, email, phone, avatar_url)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching properties:', error);
            throw error;
        }

        // Filter to get only active contract for the view (mock logic usually implies one active contract)
        const processedData = data.map(p => {
            // Find active contract if exists
            const activeContract = p.contracts.find((c: any) => c.status === 'active') || p.contracts[0];
            return { ...p, contracts: activeContract ? [activeContract] : [] };
        });

        return processedData.map(mapProperty);
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

        return mapProperty(data);
    },

    async create(property: PropertyInsert): Promise<Property> {
        if (isMock) throw new Error("Create not supported in mock mode");
        
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('properties')
            .insert({ ...property, owner_id: userData.user.id })
            .select()
            .single();

        if (error) {
            console.error('Error creating property:', error);
            throw error;
        }

        return mapProperty(data);
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

        return mapProperty(data);
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
    }
};
