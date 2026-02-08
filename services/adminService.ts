import { supabase } from '../lib/supabase';
import { User, AdminActivityLog, SupportTicket } from '../types';

export const adminService = {
    // --- User Management ---

    async getUsers(page = 1, limit = 10, search = '', status?: string) {
        let query = supabase
            .from('profiles')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        if (status) {
            if (status === 'suspended') {
                query = query.eq('is_suspended', true);
            } else {
                query = query.eq('is_suspended', false); // Simplified for now
            }
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await query
            .range(from, to)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { users: data as User[], total: count };
    },

    async suspendUser(userId: string, reason: string, notes: string, notifyUser: boolean) {
        // 1. Update profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                is_suspended: true,
                suspended_reason: reason,
                suspended_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (profileError) throw profileError;

        // 2. Log activity
        await this.logActivity('suspend_user', 'user', userId, { reason, notes, notifyUser });

        // 3. (Mock) Send email logic would go here
        if (notifyUser) console.log(`[Mock] Sending suspension email to user ${userId}`);
    },

    async unsuspendUser(userId: string) {
        const { error } = await supabase
            .from('profiles')
            .update({
                is_suspended: false,
                suspended_reason: null,
                suspended_at: null,
            })
            .eq('id', userId);

        if (error) throw error;
        await this.logActivity('unsuspend_user', 'user', userId);
    },

    // --- Subscription Management ---

    async processRefund(userId: string, amount: number, type: 'full' | 'partial', reason: string, method: 'stripe' | 'credit') {
        // In a real app, this would call Stripe API via Edge Function
        console.log(`Processing ${type} refund of R$${amount} via ${method} for user ${userId}`);

        await this.logActivity('refund_processed', 'payment', userId, { amount, type, reason, method });
        return { success: true, transactionId: 'mock_refund_' + Date.now() };
    },

    // --- Logs ---

    async logActivity(action: string, targetType: string, targetId?: string, changes?: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('admin_activity_log').insert({
            admin_id: user.id,
            action,
            target_type: targetType,
            target_id: targetId,
            changes,
            user_agent: navigator.userAgent
        });
    },

    // --- System ---

    async getStats() {
        // Mock stats for dashboard
        return {
            active_owners: 1234,
            mrr: 98765,
            churn_rate: 3.2,
            nps: 72
        };
    }
};
