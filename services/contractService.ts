
import { supabase } from '../lib/supabase';
import { Contract } from '../types';
import { generateMockContracts } from '../utils/contractLogic';

// Check if Supabase is configured
const env = (import.meta as any).env || {};
const isMock = !env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL.includes('placeholder');

const mapContract = (row: any): Contract => ({
    id: row.id,
    contract_number: row.contract_number || 'N/A',
    property: row.properties?.name || 'Imóvel Desconhecido',
    tenant_name: row.profiles_tenant?.name || 'Inquilino',
    owner_name: row.profiles_owner?.name || 'Proprietário',
    start_date: row.start_date,
    end_date: row.end_date,
    value: `R$ ${row.monthly_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    numeric_value: row.monthly_value,
    payment_day: row.payment_day,
    status: row.status,
    pdf_url: row.pdf_url,
    // Mocking signers/history for now as they require separate tables not in basic schema
    signers: [
        { id: '1', role: 'owner', name: 'Você', email: '', status: 'signed' },
        { id: '2', role: 'tenant', name: row.profiles_tenant?.name, email: row.profiles_tenant?.email, status: row.status === 'active' ? 'signed' : 'pending' }
    ],
    history: []
});

export const contractService = {
    async getAll(): Promise<Contract[]> {
        if (isMock) return generateMockContracts();

        const { data, error } = await supabase
            .from('contracts')
            .select(`
                *,
                properties:property_id(name),
                profiles_tenant:tenant_id(name, email),
                profiles_owner:owner_id(name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching contracts:', error);
            throw error;
        }

        return data.map(mapContract);
    },

    async create(contractData: any): Promise<void> {
        if (isMock) {
            console.log("Mock create contract", contractData);
            return;
        }

        const { data: user } = await supabase.auth.getUser();
        
        // Transform UI data to DB data
        const payload = {
            contract_number: `CTR-${Date.now()}`,
            owner_id: user.user?.id,
            property_id: contractData.property_id, // Needs to be selected in wizard
            tenant_id: contractData.tenant_id,     // Needs to be selected in wizard
            start_date: contractData.startDate,
            end_date: new Date(new Date(contractData.startDate).setMonth(new Date(contractData.startDate).getMonth() + parseInt(contractData.duration))).toISOString(),
            monthly_value: parseFloat(contractData.rentValue),
            status: 'draft',
            payment_day: 10
        };

        const { error } = await supabase.from('contracts').insert(payload);
        if (error) throw error;
    }
};
