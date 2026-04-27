import { propertyService } from './propertyService';
import { tenantService } from './tenantService';
import { contractService } from './contractService';
import { generateCashFlowProjection } from '../utils/financialCalculations';
import { supabase } from '../lib/supabase';

export const dashboardService = {
  async getDashboardData() {
    // In a real app, this would be a single API call or multiple parallel calls
    // For now, we'll use existing services where possible and mock the rest
    // Parallelize all data fetching for maximum performance
    const [properties, tenants, contracts, authRes] = await Promise.all([
      propertyService.getAll(),
      tenantService.getAll(),
      contractService.getAll(),
      supabase.auth.getUser(),
    ]);

    const userData = authRes.data;

    const totalProperties = properties.length;
    const occupiedProperties = properties.filter((p) => p.status === 'ALUGADO').length;
    const occupancyRate =
      totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

    // Onboarding Checks - Initial state
    const onboarding = {
      step1: totalProperties > 0,
      step2: tenants.length > 0,
      step3: contracts.some((c) => c.status === 'active'),
      step4: false,
      allCompleted: false,
    };

    // Parallel fetch for profile if user exists
    if (userData?.user) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', userData.user.id)
        .single();
      onboarding.step4 = !!userProfile?.phone;
    }

    onboarding.allCompleted =
      onboarding.step1 && onboarding.step2 && onboarding.step3 && onboarding.step4;

    // Dynamic Cash Flow Projection
    const financialHistory = contracts.map(c => ({
      month: new Date(c.start_date).toLocaleString('pt-BR', { month: 'short' }),
      income: c.numeric_value || 0,
      expense: 0,
      net: c.numeric_value || 0,
      projected: false,
    }));

    // If no history, return empty state
    if (financialHistory.length === 0) {
      financialHistory.push({
        month: new Date().toLocaleString('pt-BR', { month: 'short' }),
        income: 0,
        expense: 0,
        net: 0,
        projected: false,
      });
    }

    // Mocking other data for now, but keeping it in the service layer
    return {
      onboarding,
      metrics: {
        totalWealth: `R$ ${(properties.reduce((acc, p) => acc + (p.market_value || 0), 0) / 1000).toFixed(0)}k`,
        mrr: `R$ ${(financialHistory.reduce((acc, h) => acc + h.income, 0) / 1000).toFixed(1)}k`,
        occupancyRate,
        avgRoi: '0%',
        trends: {
          wealth: '+0%',
          mrr: '+0%',
          occupancy: occupancyRate < 80 ? '-0%' : '+0%',
          roi: '+0%',
        },
      },
      financialHistory,
      topProperties: properties.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        revenue: p.numeric_price || 0,
        yield: 0.72, // Mock yield
        status: p.status === 'ALUGADO' ? 'occupied' : 'vacant',
      })),
      activities: [], // Real activity log would come from a separate 'activities' or 'audit' table
    };
  },
};
