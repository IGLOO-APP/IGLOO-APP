/**
 * SERVICE: Stripe Backend Simulator
 * 
 * In a real application, these functions would be API calls to your Node.js backend.
 * Here, we simulate network latency and responses for the frontend.
 */

export interface PaymentIntentResponse {
    clientSecret: string;
    id: string;
    amount: number;
}

export interface PaymentMethod {
    id: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    is_default: boolean;
}

// Mock Database
let savedCards: PaymentMethod[] = [
    { id: 'pm_1', brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2025, is_default: true },
];

export const stripeService = {
    // 1. Create Payment Intent (Simulates POST /api/payments/create-intent)
    createPaymentIntent: async (amount: number, metadata: any): Promise<PaymentIntentResponse> => {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency
        
        // Backend Logic Simulation:
        // 1. Calculate platform fee (Split payment)
        // const platformFee = amount * 0.05;
        // const ownerAmount = amount - platformFee;
        
        return {
            clientSecret: 'pi_mock_secret_' + Math.random().toString(36).substring(7),
            id: 'pi_' + Math.random().toString(36).substring(7),
            amount: amount
        };
    },

    // 2. Get Saved Cards (Simulates GET /api/payment-methods/:userId)
    getPaymentMethods: async (): Promise<PaymentMethod[]> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return [...savedCards];
    },

    // 3. Add Payment Method (Simulates POST /api/payment-methods/attach)
    attachPaymentMethod: async (cardDetails: Partial<PaymentMethod>): Promise<PaymentMethod> => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newCard: PaymentMethod = {
            id: 'pm_' + Math.random().toString(36).substring(7),
            brand: 'mastercard', // Simulating detection
            last4: '8888',
            exp_month: 10,
            exp_year: 2028,
            is_default: savedCards.length === 0,
            ...cardDetails
        } as PaymentMethod;

        savedCards.push(newCard);
        return newCard;
    },

    // 4. Delete Payment Method
    detachPaymentMethod: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        savedCards = savedCards.filter(c => c.id !== id);
    },

    // 5. Create Subscription (Simulates POST /api/subscriptions/create)
    createSubscription: async (priceId: string, paymentMethodId: string) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            id: 'sub_' + Math.random().toString(36).substring(7),
            status: 'active',
            current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        };
    },

    // 6. Owner Onboarding (Simulates POST /api/stripe/connect/onboard)
    createConnectAccountLink: async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        // In real app, returns stripe onboarding URL
        return { url: '#' }; 
    }
};