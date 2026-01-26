
import { Contract, ContractStatus, ContractHistoryEvent, Signer } from '../types';

export const getStatusColor = (status: ContractStatus) => {
    switch (status) {
        case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'pending_signature': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'draft': return 'bg-slate-100 text-slate-600 border-slate-200';
        case 'expiring_soon': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'expired': return 'bg-red-100 text-red-700 border-red-200';
        case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-200';
        case 'renewed': return 'bg-purple-100 text-purple-700 border-purple-200';
        default: return 'bg-slate-100 text-slate-600';
    }
};

export const getStatusLabel = (status: ContractStatus) => {
    switch (status) {
        case 'active': return 'Ativo';
        case 'pending_signature': return 'Aguardando Assinatura';
        case 'draft': return 'Rascunho';
        case 'expiring_soon': return 'Vencendo';
        case 'expired': return 'Vencido';
        case 'cancelled': return 'Cancelado';
        case 'renewed': return 'Renovado';
        default: return status;
    }
};

// Mock Data Generator
export const generateMockContracts = (): Contract[] => [
    {
        id: 'ctr_001',
        contract_number: 'CTR-2024-001',
        property: 'Apt 104 - Centro',
        tenant_name: 'João Silva',
        owner_name: 'Investidor Exemplo',
        start_date: '2023-10-10',
        end_date: '2026-10-10',
        value: 'R$ 1.500,00',
        numeric_value: 1500,
        payment_day: 10,
        status: 'active',
        days_remaining: 900,
        signers: [
            { id: 's1', role: 'tenant', name: 'João Silva', email: 'joao@email.com', status: 'signed', signed_at: '2023-10-09T14:00:00Z' },
            { id: 's2', role: 'owner', name: 'Investidor', email: 'inv@igloo.com', status: 'signed', signed_at: '2023-10-09T10:00:00Z' }
        ],
        history: [
            { id: 'h1', action: 'created', description: 'Contrato criado', performed_by: 'Investidor', date: '08/10/2023 09:00' },
            { id: 'h2', action: 'sent', description: 'Enviado para assinatura', performed_by: 'Sistema', date: '08/10/2023 09:05' },
            { id: 'h3', action: 'signed', description: 'Assinado por João Silva', performed_by: 'João Silva', date: '09/10/2023 14:00' },
            { id: 'h4', action: 'activated', description: 'Contrato ativo', performed_by: 'Sistema', date: '10/10/2023 00:00' }
        ]
    },
    {
        id: 'ctr_002',
        contract_number: 'CTR-2024-045',
        property: 'Kitnet 05 - Jardins',
        tenant_name: 'Maria Oliveira',
        owner_name: 'Investidor Exemplo',
        start_date: '2024-03-01',
        end_date: '2026-03-01',
        value: 'R$ 1.200,00',
        numeric_value: 1200,
        payment_day: 5,
        status: 'pending_signature',
        days_remaining: 730,
        signers: [
            { id: 's3', role: 'owner', name: 'Investidor', email: 'inv@igloo.com', status: 'signed', signed_at: '2024-02-28T10:00:00Z' },
            { id: 's4', role: 'tenant', name: 'Maria Oliveira', email: 'maria@email.com', status: 'pending' }
        ],
        history: [
            { id: 'h5', action: 'created', description: 'Contrato criado', performed_by: 'Investidor', date: '28/02/2024 09:00' },
            { id: 'h6', action: 'signed', description: 'Assinado por Investidor', performed_by: 'Investidor', date: '28/02/2024 10:00' },
            { id: 'h7', action: 'sent', description: 'Aguardando Maria Oliveira', performed_by: 'Sistema', date: '28/02/2024 10:05' }
        ]
    },
    {
        id: 'ctr_003',
        contract_number: 'CTR-2022-089',
        property: 'Studio 22 - Vila Madalena',
        tenant_name: 'Carlos Pereira',
        owner_name: 'Investidor Exemplo',
        start_date: '2022-03-15',
        end_date: '2024-03-15',
        value: 'R$ 2.400,00',
        numeric_value: 2400,
        payment_day: 15,
        status: 'expiring_soon',
        days_remaining: 15,
        signers: [],
        history: [
            { id: 'h8', action: 'created', description: 'Contrato criado', performed_by: 'Sistema', date: '15/03/2022' }
        ]
    }
];
