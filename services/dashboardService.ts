import { propertyService } from './propertyService';

export const dashboardService = {
  async getDashboardData() {
    // In a real app, this would be a single API call or multiple parallel calls
    // For now, we'll use existing services where possible and mock the rest
    const properties = await propertyService.getAll();

    const totalProperties = properties.length;
    const occupiedProperties = properties.filter((p) => p.status === 'ALUGADO').length;
    const occupancyRate =
      totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

    // Mocking other data for now, but keeping it in the service layer
    return {
      metrics: {
        totalWealth: 'R$ 1.5M',
        mrr: 'R$ 16.2k',
        occupancyRate,
        avgRoi: '7.2%',
        trends: {
          wealth: '+2.5%',
          mrr: '+12%',
          occupancy: occupancyRate < 80 ? '-15%' : '+2%',
          roi: '+0.8%',
        },
      },
      financialHistory: [
        { month: 'Set', income: 12500, expense: 4200, net: 8300, projected: false },
        { month: 'Out', income: 13200, expense: 3800, net: 9400, projected: false },
        { month: 'Nov', income: 14100, expense: 5100, net: 9000, projected: false },
        { month: 'Dez', income: 15800, expense: 6200, net: 9600, projected: false },
        { month: 'Jan', income: 14500, expense: 4500, net: 10000, projected: false },
        { month: 'Fev', income: 16200, expense: 4100, net: 12100, projected: false },
        { month: 'Mar', income: 16500, expense: 4000, net: 12500, projected: true },
        { month: 'Abr', income: 17000, expense: 3800, net: 13200, projected: true },
        { month: 'Mai', income: 17500, expense: 3500, net: 14000, projected: true },
      ],
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
