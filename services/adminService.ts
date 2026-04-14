import { supabase } from '../lib/supabase';
import { User, AdminActivityLog, SupportTicket } from '../types';

export const adminService = {
  // --- User Management ---

  async getUsers(
    page = 1,
    limit = 10,
    search = '',
    status?: string,
    plan?: string,
    role?: string,
    period?: string
  ) {
    let query = supabase.from('profiles').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status && status !== 'Todos') {
      if (status === 'Suspenso') {
        query = query.eq('is_suspended', true);
      } else if (status === 'Ativo') {
        query = query.eq('is_suspended', false);
      } else if (status === 'Inativo') {
        query = query.eq('is_suspended', false).is('last_login', null);
      }
      // Trial logic would depend on subscription dates, simplified here
    }

    if (plan && plan !== 'Todos') {
      query = query.eq('plan', plan);
    }

    if (role && role !== 'Todos') {
      const roleMap: Record<string, string> = {
        Proprietário: 'owner',
        Inquilino: 'tenant',
        Administrador: 'admin',
      };
      query = query.eq('role', roleMap[role] || role.toLowerCase());
    }

    if (period && period !== 'Todos') {
      const now = new Date();
      let startDate = new Date();
      if (period === 'Hoje') startDate.setHours(0, 0, 0, 0);
      else if (period === 'Últimos 7 dias') startDate.setDate(now.getDate() - 7);
      else if (period === 'Último mês') startDate.setMonth(now.getMonth() - 1);
      else if (period === 'Último ano') startDate.setFullYear(now.getFullYear() - 1);

      query = query.gte('created_at', startDate.toISOString());
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { users: data as User[], total: count };
  },

  async updateUserPlan(userId: string, plan: string) {
    const { error } = await supabase.from('profiles').update({ plan }).eq('id', userId);

    if (error) throw error;
    await this.logActivity('update_plan', 'user', userId, { plan });
  },

  async exportUserData(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;

    await this.logActivity('export_data', 'user', userId);
    return data;
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

  async processRefund(
    userId: string,
    amount: number,
    type: 'full' | 'partial',
    reason: string,
    method: 'stripe' | 'credit'
  ) {
    // In a real app, this would call Stripe API via Edge Function
    console.log(`Processing ${type} refund of R$${amount} via ${method} for user ${userId}`);

    await this.logActivity('refund_processed', 'payment', userId, { amount, type, reason, method });
    return { success: true, transactionId: 'mock_refund_' + Date.now() };
  },

  // --- Logs ---

  async logActivity(action: string, targetType: string, targetId?: string, changes?: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('admin_activity_log').insert({
      admin_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      changes,
      user_agent: navigator.userAgent,
    });
  },

  // --- System ---

  async getStats() {
    try {
      // 1. Total Active Owners
      const { count: activeOwners } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'owner')
        .eq('is_suspended', false);

      // 2. Total Properties
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // 3. Monthly Recurring Revenue (MRR) - Only active contracts
      const { data: contracts } = await supabase
        .from('contracts')
        .select('monthly_value')
        .eq('status', 'active');

      const mrr = contracts?.reduce((acc, curr) => acc + (Number(curr.monthly_value) || 0), 0) || 0;

      // 4. Active Trials (Users in Trial plan or recently converted)
      const { count: activeTrials } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('plan', 'Trial');

      // 5. Open Tickets (Active Maintenance Requests)
      const { count: openTickets } = await supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '("completed","cancelled")');

      return {
        active_owners: activeOwners || 0,
        mrr: mrr || 0,
        total_properties: totalProperties || 0,
        active_trials: activeTrials || 0,
        open_tickets: openTickets || 0,
        churn_rate: 0,
        nps: 0,
      };
    } catch (error) {
      console.error('Error fetching real stats:', error);
      return {
        active_owners: 0,
        mrr: 0,
        total_properties: 0,
        active_trials: 0,
        open_tickets: 0,
        churn_rate: 0,
        nps: 0,
      };
    }
  },

  // --- Team Management ---

  async getAdmins(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('name');

    if (error) throw error;
    return data as User[];
  },

  async getRecentActivity(limit = 10) {
    const { data, error } = await supabase
      .from('admin_activity_log')
      .select(`
        *,
        admin:profiles!admin_id(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getGrowthData() {
    // This is hard to calculate without a dedicated metrics table
    // So we'll return a more realistic but still placeholder-y data for now
    // or try to group profiles by month
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (error) return [];

    // Simple grouping by month logic...
    return data;
  },

  async createAdmin(email: string, name: string, adminType: string, permissions: string[]) {
    // In a real app, this would use supabase.auth.admin.inviteUserByEmail
    // Here we simulate adding to profiles with a pending status
    const { error } = await supabase.from('profiles').insert({
      email,
      name,
      role: 'admin',
      admin_type: adminType,
      permissions,
      is_suspended: false,
      is_pending: true,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    await this.logActivity('invite_admin', 'system', email, { adminType, permissions });
  },

  async removeAdmin(userId: string) {
    // Revert to tenant instead of deleting? Requirement says "voltar a ser um usuário comum (Tenant)"
    const { error } = await supabase
      .from('profiles')
      .update({
        role: 'tenant',
        admin_type: null,
        permissions: [],
      })
      .eq('id', userId);

    if (error) throw error;
    await this.logActivity('remove_admin_access', 'user', userId);
  },

  // --- Conversion & Analytics ---

  async getConversionStats(timeframe: string = 'last_30_days') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, trial_started_at, converted_at, plan, created_at');

      if (error) throw error;

      const totalTrials = data.filter((u) => u.trial_started_at).length;
      const totalConverted = data.filter((u) => u.converted_at).length;
      const conversionRate = totalTrials > 0 ? (totalConverted / totalTrials) * 100 : 0;

      // Calculate Time to Convert (Avg)
      const conversionTimes = data
        .filter(u => u.trial_started_at && u.converted_at)
        .map(u => {
          const start = new Date(u.trial_started_at).getTime();
          const end = new Date(u.converted_at).getTime();
          return (end - start) / (1000 * 60 * 60 * 24); // days
        });

      const avgTime = conversionTimes.length > 0
        ? Math.round(conversionTimes.reduce((acc, curr) => acc + curr, 0) / conversionTimes.length)
        : 0;

      // Weekly History (Last 4 weeks)
      const history = [];
      const now = new Date();

      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 7);

        const trials = data.filter(u => {
          if (!u.trial_started_at) return false;
          const d = new Date(u.trial_started_at);
          return d >= weekStart && d <= weekEnd;
        }).length;

        const conversions = data.filter(u => {
          if (!u.converted_at) return false;
          const d = new Date(u.converted_at);
          return d >= weekStart && d <= weekEnd;
        }).length;

        history.push({
          name: i === 0 ? 'Esta Sem' : `Sem -${i}`,
          trials,
          conversions
        });
      }

      return {
        total_trials: totalTrials,
        total_converted: totalConverted,
        conversion_rate: parseFloat(conversionRate.toFixed(2)),
        time_to_convert_avg: avgTime,
        history,
      };
    } catch (err) {
      console.warn('Erro ao buscar estatísticas reais:', err);
      return {
        total_trials: 0,
        total_converted: 0,
        conversion_rate: 0,
        time_to_convert_avg: 0,
        history: Array(4).fill(0).map((_, i) => ({ name: `Sem -${3 - i}`, trials: 0, conversions: 0 })),
      };
    }
  },

  async getSubscriptionStats() {
    try {
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('plan, role');

      const { data: contracts, error: cError } = await supabase
        .from('contracts')
        .select('monthly_value, status');

      if (pError || cError) throw pError || cError;

      const totalProfiles = profiles.length || 1;
      const getCount = (plan: string) => profiles.filter(p => p.plan === plan).length;

      const planDistribution = [
        {
          name: 'Professional',
          count: getCount('Pro'),
          percentage: (getCount('Pro') / totalProfiles) * 100,
          mrr: (getCount('Pro') * 79.90).toFixed(2),
          color: 'primary'
        },
        {
          name: 'Elite',
          count: getCount('Elite'),
          percentage: (getCount('Elite') / totalProfiles) * 100,
          mrr: (getCount('Elite') * 149.90).toFixed(2),
          color: 'amber'
        },
        {
          name: 'Free',
          count: getCount('Free'),
          percentage: (getCount('Free') / totalProfiles) * 100,
          mrr: '0',
          isFree: true,
          color: 'slate'
        },
      ];

      const activeContracts = contracts.filter(c => c.status === 'active');
      const mrr = activeContracts.reduce((acc, curr) => acc + (Number(curr.monthly_value) || 0), 0);

      return {
        mrr,
        arr: mrr * 12,
        planDistribution,
        recentMovements: {
          upgrades: 0,
          downgrades: 0,
          cancelamentos: 0
        }
      };
    } catch (err) {
      console.error('Error fetching subscription stats:', err);
      return null;
    }
  },

  async getGrowthData() {
    try {
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('created_at');

      const { data: payments, error: payError } = await supabase
        .from('payments')
        .select('amount, created_at');

      if (pError || payError) throw pError || payError;

      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const currentMonth = new Date().getMonth();

      const lastSixMonths = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(currentMonth - i);
        const monthName = months[d.getMonth()];
        const monthIndex = d.getMonth();
        const year = d.getFullYear();

        const userCount = profiles.filter(p => {
          const pd = new Date(p.created_at);
          return pd.getMonth() === monthIndex && pd.getFullYear() === year;
        }).length;

        const revenue = (payments || []).filter(p => {
          const pd = new Date(p.created_at);
          return pd.getMonth() === monthIndex && pd.getFullYear() === year;
        }).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        lastSixMonths.push({
          name: monthName,
          users: userCount,
          revenue: revenue
        });
      }

      return lastSixMonths;
    } catch (err) {
      console.error('Error fetching growth data:', err);
      return [];
    }
  },

  // --- Announcements ---

  async getAnnouncements() {
    try {
      const { data, error } = await supabase
        .from('system_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalViews = data?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;
      const totalClicks = data?.reduce((acc, curr) => acc + (curr.clicks || 0), 0) || 0;
      const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

      return {
        list: data || [],
        stats: {
          total_views: totalViews,
          total_clicks: totalClicks,
          ctr: ctr.toFixed(1)
        }
      };
    } catch (err) {
      console.warn('Erro ao carregar comunicados:', err);
      return { list: [], stats: { total_views: 0, total_clicks: 0, ctr: '0.0' } };
    }
  },

  async createAnnouncement(announcement: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.from('system_announcements').insert({
      ...announcement,
      created_by_admin_id: user.id,
    });

    if (error) throw error;
    return data;
  },

  // --- Support Tickets ---

  async getTickets() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:profiles!support_tickets_user_id_fkey(id, name, email, avatar_url),
        assignee:profiles!support_tickets_assigned_to_fkey(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getTicketMessages(ticketId: string) {
    const { data, error } = await supabase
      .from('support_messages')
      .select(`
        *,
        sender:profiles(id, name, avatar_url)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendTicketMessage(ticketId: string, senderId: string, role: string, content: string) {
    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        sender_role: role,
        content,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTicketStatus(ticketId: string, status: string) {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (error) throw error;
  },

  async assignTicket(ticketId: string, adminId: string | null) {
    const { error } = await supabase
      .from('support_tickets')
      .update({ assigned_to: adminId, updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (error) throw error;
  },

  async createTicket(ticket: { owner_id: string; subject: string; description: string; category: string; priority: string }) {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([ticket])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
