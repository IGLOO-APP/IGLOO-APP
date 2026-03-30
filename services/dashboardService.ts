import { propertyService } from './propertyService';
import { tenantService } from './tenantService';
import { contractService } from './contractService';
import { generateCashFlowProjection } from '../utils/financialCalculations';

export const dashboardService = {
  async getDashboardData() {
    // In a real app, this would be a single API call or multiple parallel calls
    // For now, we'll use existing services where possible and mock the rest
    const [properties, tenants, contracts] = await Promise.all([
      propertyService.getAll(),
      tenantService.getAll(),
      contractService.getAll(),
    ]);

    const totalProperties = properties.length;
    const occupiedProperties = properties.filter((p) => p.status === 'ALUGADO').length;
    const occupancyRate =
      totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

    // Onboarding Checks
    const onboarding = {
      step1: totalProperties > 0, // Has property
      step2: tenants.length > 0, // Has tenant
      step3: contracts.some(c => c.status === 'active'), // Has active contract
      step4: true, // Mocked for now, usually would check settings/payment methods
      allCompleted: false
    };
    
    // In dev mode with demo data, we might want to simulate "not completed" 
    // but the requirement says "don't show for users who already have all 4"
    // So we calculate it normally.
    onboarding.allCompleted = onboarding.step1 && onboarding.step2 && onboarding.step3 && onboarding.step4;

    // Dynamic Cash Flow Projection
    const pastData = [
      { name: 'Set', value: 12500 },
      { name: 'Out', value: 13200 },
      { name: 'Nov', value: 14100 },
      { name: 'Dez', value: 15800 },
      { name: 'Jan', value: 14500 },
      { name: 'Fev', value: 16200 },
    ];

    const projection = generateCashFlowProjection(pastData, contracts);

    // Map projection to expected UI format
    const financialHistory = projection.map((d) => ({
      month: d.name,
      income: d.isProjection ? d.projected : d.actual,
      expense: d.isProjection ? Math.round(d.projected * 0.25) : Math.round(d.actual * 0.3), // Mock expenses
      net: d.isProjection ? d.projected - Math.round(d.projected * 0.25) : d.actual - Math.round(d.actual * 0.3),
      projected: d.isProjection,
    }));

    // Mocking other data for now, but keeping it in the service layer
    return {
      onboarding,
      metrics: {
        totalWealth: 'R$ 1.5M',
        mrr: `R$ ${(financialHistory[financialHistory.length - 4]?.income / 1000).toFixed(1)}k`,
        occupancyRate,
        avgRoi: '7.2%',
        trends: {
          wealth: '+2.5%',
          mrr: '+12%',
          occupancy: occupancyRate < 80 ? '-15%' : '+2%',
          roi: '+0.8%',
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
      activities: [
        {
          id: 1,
          title: 'Vencimento Aluguel - Apt 104',
          type: 'payment',
          date: 'Hoje',
          time: '23:59',
        },
        {
          id: 2,
          title: 'Vistoria de Saída - Kitnet 05',
          type: 'visit',
          date: 'Amanhã',
          time: '14:00',
        },
        {
          id: 3,
          title: 'Renovação Contrato - Studio 22',
          type: 'contract',
          date: '12 Mar',
          time: '-',
        },
        {
          id: 4,
          title: 'Manutenção Elétrica - Loft',
          type: 'maintenance',
          date: '15 Mar',
          time: '09:00',
        },
      ],
    };
  },
};
