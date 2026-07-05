import { supabase } from '../../lib/supabase';

export const analyticsService = {
  async getStats() {
    try {
      const { count: activeOwners } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'owner')
        .eq('is_suspended', false);
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      const { data: contracts } = await supabase
        .from('contracts')
        .select('monthly_value')
        .eq('status', 'active');
      const mrr = contracts?.reduce((acc, curr) => acc + (Number(curr.monthly_value) || 0), 0) || 0;
      const { count: activeTrials } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('plan', 'Trial');
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

  async getConversionStats() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, trial_started_at, converted_at, plan, created_at');
      if (error) throw error;

      const totalTrials = data.filter((u) => u.trial_started_at).length;
      const totalConverted = data.filter((u) => u.converted_at).length;
      const conversionRate = totalTrials > 0 ? (totalConverted / totalTrials) * 100 : 0;

      const conversionTimes = data
        .filter((u) => u.trial_started_at && u.converted_at)
        .map((u) => {
          const start = new Date(u.trial_started_at!).getTime();
          const end = new Date(u.converted_at!).getTime();
          return (end - start) / (1000 * 60 * 60 * 24);
        });
      const avgTime =
        conversionTimes.length > 0
          ? Math.round(
              conversionTimes.reduce((acc, curr) => acc + curr, 0) / conversionTimes.length
            )
          : 0;

      const history = [];
      const now = new Date();
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - i * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 7);
        const trials = data.filter((u) => {
          if (!u.trial_started_at) return false;
          const d = new Date(u.trial_started_at!);
          return d >= weekStart && d <= weekEnd;
        }).length;
        const conversions = data.filter((u) => {
          if (!u.converted_at) return false;
          const d = new Date(u.converted_at!);
          return d >= weekStart && d <= weekEnd;
        }).length;
        history.push({ name: i === 0 ? 'Esta Sem' : `Sem -${i}`, trials, conversions });
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
        history: Array(4)
          .fill(0)
          .map((_, i) => ({ name: `Sem -${3 - i}`, trials: 0, conversions: 0 })),
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
      const getCount = (plan: string) => profiles.filter((p) => p.plan === plan).length;
      const planDistribution = [
        {
          name: 'Professional',
          count: getCount('Pro'),
          percentage: (getCount('Pro') / totalProfiles) * 100,
          mrr: (getCount('Pro') * 79.9).toFixed(2),
          color: 'primary',
        },
        {
          name: 'Elite',
          count: getCount('Elite'),
          percentage: (getCount('Elite') / totalProfiles) * 100,
          mrr: (getCount('Elite') * 149.9).toFixed(2),
          color: 'amber',
        },
        {
          name: 'Free',
          count: getCount('Free'),
          percentage: (getCount('Free') / totalProfiles) * 100,
          mrr: '0',
          isFree: true,
          color: 'slate',
        },
      ];
      const activeContracts = contracts.filter((c) => c.status === 'active');
      const mrr = activeContracts.reduce((acc, curr) => acc + (Number(curr.monthly_value) || 0), 0);
      return {
        mrr,
        arr: mrr * 12,
        planDistribution,
        recentMovements: { upgrades: 0, downgrades: 0, cancelamentos: 0 },
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

      const months = [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ];
      const currentMonth = new Date().getMonth();
      const lastSixMonths = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(currentMonth - i);
        const monthIndex = d.getMonth();
        const year = d.getFullYear();
        lastSixMonths.push({
          name: months[monthIndex],
          users: profiles.filter((p) => {
            const pd = new Date(p.created_at);
            return pd.getMonth() === monthIndex && pd.getFullYear() === year;
          }).length,
          revenue: (payments || [])
            .filter((p) => {
              const pd = new Date(p.created_at);
              return pd.getMonth() === monthIndex && pd.getFullYear() === year;
            })
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
        });
      }
      return lastSixMonths;
    } catch (err) {
      console.error('Error fetching growth data:', err);
      return [];
    }
  },

  async processRefund(
    userId: string,
    amount: number,
    type: 'full' | 'partial',
    reason: string,
    method: 'stripe' | 'credit'
  ) {
    console.log(`Processing ${type} refund of R$${amount} via ${method} for user ${userId}`);
    const { auditService } = await import('./auditService');
    await auditService.logActivity('refund_processed', 'payment', userId, {
      amount,
      type,
      reason,
      method,
    });
    return { success: true, transactionId: 'mock_refund_' + Date.now() };
  },
};
