
import { Plan, Subscription, Invoice, BillingCycle, PlanTier } from '../types';

// --- MOCK DATA ---

const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Gratuito (Trial)',
        description: 'Período de teste para novos usuários.',
        price: {
            monthly: 0,
            semiannual: 0,
            annual: 0
        },
        limits: {
            properties: 2,
            tenants: 2,
            storage_gb: 0.5,
            users: 1
        },
        features: [
            { text: 'Até 2 Imóveis', included: true },
            { text: 'Até 2 Inquilinos', included: true },
            { text: 'Gestão Financeira Básica', included: true },
            { text: 'Assinatura Digital', included: false },
            { text: 'Cobrança Automatizada', included: false },
        ]
    },
    {
        id: 'starter',
        name: 'Starter',
        description: 'Para pequenos proprietários iniciarem a gestão digital.',
        price: {
            monthly: 49.90,
            semiannual: 44.90, // 10% off implied
            annual: 39.90 // 20% off implied
        },
        limits: {
            properties: 10,
            tenants: 15,
            storage_gb: 5,
            users: 2
        },
        features: [
            { text: 'Até 10 Imóveis', included: true },
            { text: 'Assinatura Digital (ClickSign)', included: true },
            { text: 'Recebimento via Pix', included: true },
            { text: 'Portal do Inquilino', included: true },
            { text: 'Suporte por Email', included: true },
            { text: 'Cobrança Automatizada', included: false },
            { text: 'Gestão de Equipe', included: false },
        ]
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Para gestores que buscam automação e escala.',
        highlight: true,
        price: {
            monthly: 99.90,
            semiannual: 89.90,
            annual: 79.90
        },
        limits: {
            properties: 50,
            tenants: 9999, // Unlimited
            storage_gb: 50,
            users: 5
        },
        features: [
            { text: 'Até 50 Imóveis', included: true },
            { text: 'Tudo do Starter', included: true },
            { text: 'Pix + Boleto + Cartão', included: true },
            { text: 'Cobrança WhatsApp Auto', included: true },
            { text: 'Relatórios Avançados', included: true },
            { text: 'Contratos Ilimitados', included: true },
            { text: 'Multi-usuários (5)', included: true },
        ]
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Para imobiliárias e grandes portfólios.',
        price: {
            monthly: 299.90,
            semiannual: 269.90,
            annual: 239.90
        },
        limits: {
            properties: -1, // Unlimited
            tenants: -1,
            storage_gb: 200,
            users: -1
        },
        features: [
            { text: 'Imóveis Ilimitados', included: true },
            { text: 'Tudo do Professional', included: true },
            { text: 'Marca White-label', included: true },
            { text: 'Domínio Personalizado', included: true },
            { text: 'API & Webhooks', included: true },
            { text: 'Gerente de Conta', included: true },
            { text: 'SLA de 99.9%', included: true },
        ]
    }
];

// Initial Mock Subscription
let currentSubscription: Subscription = {
    id: 'sub_12345',
    planId: 'free', // Starts free
    status: 'trialing',
    billingCycle: 'monthly',
    amount: 0,
    currentPeriodEnd: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // 30 days from now
    trialEndsAt: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    usage: {
        properties: 2,
        tenants: 2,
        storage_used_gb: 0.2
    }
};

const invoices: Invoice[] = [
    // Empty for trial user, populates after payment
];

export const subscriptionService = {
    getPlans: (): Plan[] => {
        return PLANS;
    },

    getCurrentSubscription: async (): Promise<Subscription> => {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 500));
        return currentSubscription;
    },

    getInvoices: async (): Promise<Invoice[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return invoices;
    },

    calculateTotal: (planId: PlanTier, cycle: BillingCycle) => {
        const plan = PLANS.find(p => p.id === planId);
        if (!plan) return { total: 0, savings: 0, pricePerMonth: 0, totalBilled: 0 };

        const monthlyPrice = plan.price.monthly;
        let cyclePrice = plan.price[cycle];
        let total = 0;
        let savings = 0;

        if (cycle === 'monthly') {
            total = monthlyPrice;
        } else if (cycle === 'semiannual') {
            total = cyclePrice * 6;
            savings = (monthlyPrice * 6) - total;
        } else if (cycle === 'annual') {
            total = cyclePrice * 12;
            savings = (monthlyPrice * 12) - total;
        }

        return {
            pricePerMonth: cyclePrice,
            totalBilled: total,
            savings: savings
        };
    },

    // Simulate Checkout / Upgrade
    upgradeSubscription: async (planId: PlanTier, cycle: BillingCycle, paymentMethod?: string): Promise<Subscription> => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Processing...

        const plan = PLANS.find(p => p.id === planId);
        if (!plan) throw new Error("Plan not found");

        const calc = subscriptionService.calculateTotal(planId, cycle);

        // Update mock state
        currentSubscription = {
            ...currentSubscription,
            id: `sub_${Date.now()}`,
            planId: planId,
            status: 'active',
            billingCycle: cycle,
            amount: calc.pricePerMonth,
            currentPeriodEnd: cycle === 'monthly' 
                ? new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
                : cycle === 'semiannual'
                    ? new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString()
                    : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            trialEndsAt: undefined,
            paymentMethod: {
                brand: 'visa',
                last4: '4242'
            }
        };

        // Generate Invoice
        invoices.unshift({
            id: `inv_${Date.now()}`,
            number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            date: new Date().toISOString(),
            amount: calc.totalBilled,
            status: 'paid'
        });

        return currentSubscription;
    },

    cancelSubscription: async (): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        currentSubscription.status = 'canceled';
    }
};
