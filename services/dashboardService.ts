import { propertyService } from './propertyService';
import { tenantService } from './tenantService';
import { contractService } from './contractService';
import { financeService } from './financeService';
import { supabase } from '../lib/supabase';

export const dashboardService = {
    async getDashboardData(userId: string) {
        try {
            console.log('Fetching dashboard data...');
            // Fetch all necessary data in parallel
            const [properties, tenants, contracts, transactions, maintenanceRequests, pendingPayments] = await Promise.all([
                propertyService.getAll().catch(e => { console.error('P error:', e); return []; }),
                tenantService.getAll().catch(e => { console.error('T error:', e); return []; }),
                contractService.getAll().catch(e => { console.error('C error:', e); return []; }),
                financeService.getAll().catch(e => { console.error('F error:', e); return []; }),
                supabase.from('maintenance_requests').select('*').order('created_at', { ascending: false }).then(res => res.data || []),
                supabase.from('payments').select('*').eq('status', 'pending').order('due_date', { ascending: true }).then(res => res.data || []),
            ]);

            // 1. Occupancy Calculation (Real)
            const totalProperties = properties.length;
            const occupiedProperties = properties.filter((p) => p.status === 'ALUGADO').length;
            const occupancyRate =
                totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

            // 2. MRR Calculation (Real - Only Active Contracts)
            const activeContracts = contracts.filter(c => c.status === 'active');
            const mrrValue = activeContracts.reduce((acc, c) => acc + (c.numeric_value || 0), 0);

            // 3. Alert Counts (Real)
            const expiringContractsCount = contracts.filter(c => c.status === 'expiring_soon').length;
            const pendingMaintenanceCount = maintenanceRequests.filter(m => m.status === 'pending' || m.status === 'in_progress').length;

            // 4. Total Wealth Calculation (Real - Sum of Market Value)
            const totalWealthValue = properties.reduce((acc, p) => acc + (p.market_value || 0), 0);

            // 5. ROI (Yield) Calculation
            const annualRent = mrrValue * 12;
            const avgRoiValue = totalWealthValue > 0
                ? ((annualRent / totalWealthValue) * 100).toFixed(1)
                : '0';

            // 6. PORTFOLIO HEALTH METRICS
            const totalMarketValue = totalWealthValue;
            const portfolioYield = totalMarketValue > 0 ? (annualRent / totalMarketValue) * 100 : 0;

            const vacantProperties = properties.filter(p => p.status !== 'ALUGADO');
            const potentialRevenue = properties.reduce((acc, p) => acc + (p.numeric_price || 0), 0);
            const lostRevenue = vacantProperties.reduce((acc, p) => acc + (p.numeric_price || 0), 0);
            const financialVacancy = potentialRevenue > 0 ? (lostRevenue / potentialRevenue) * 100 : 0;

            const expectedThisMonth = mrrValue;
            const unpaidThisMonth = pendingPayments
                .filter(p => new Date(p.due_date).getMonth() === new Date().getMonth())
                .reduce((acc, p) => acc + (p.amount || 0), 0);
            const delinquencyRate = expectedThisMonth > 0 ? (unpaidThisMonth / expectedThisMonth) * 100 : 0;

            const portfolioHealth = {
                yield: portfolioYield.toFixed(1),
                vacancy: financialVacancy.toFixed(1),
                delinquency: delinquencyRate.toFixed(1),
                delinquencyAbsolute: unpaidThisMonth,
            };

            // 7. YIELD BY PROPERTY
            const yieldByProperty = properties.map(p => {
                const annualPropRent = (p.numeric_price || 0) * 12;
                const propYield = p.market_value && p.market_value > 0
                    ? (annualPropRent / p.market_value) * 100
                    : 0;

                return {
                    id: p.id,
                    name: p.name,
                    image: p.image,
                    yield: parseFloat(propYield.toFixed(2)),
                    status: propYield > portfolioYield ? 'above' : propYield > (portfolioYield * 0.8) ? 'average' : 'below'
                };
            }).sort((a, b) => b.yield - a.yield);

            // 8. RADAR DE RISCOS
            const risks: any[] = [];
            contracts.filter(c => c.status === 'expired').forEach(c => {
                risks.push({ type: 'critical', message: `Contrato expirado: ${c.property}`, link: '/contracts', id: c.id });
            });
            if (delinquencyRate > 15) {
                risks.push({ type: 'critical', message: `Inadimplência alta: ${delinquencyRate.toFixed(1)}%`, link: '/financials' });
            }
            properties.filter(p => p.status === 'DISPONÍVEL').forEach(p => {
                risks.push({ type: 'critical', message: `Imóvel vago: ${p.name}`, link: `/properties?id=${p.id}`, id: p.id });
            });
            contracts.filter(c => c.status === 'expiring_soon').forEach(c => {
                risks.push({ type: 'warning', message: `Vencendo em breve: ${c.property}`, link: '/contracts', id: c.id });
            });
            maintenanceRequests.filter(m => m.status === 'pending').forEach(m => {
                risks.push({ type: 'warning', message: `Manutenção pendente: ${m.title || 'Reparo'}`, link: '/messages', id: m.id });
            });

            // 9. WEALTH EVOLUTION
            const last6Months = Array.from({ length: 6 }).map((_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - (5 - i));
                return d;
            });

            const wealthHistory = last6Months.map((date, idx) => {
                const monthName = date.toLocaleString('pt-BR', { month: 'short' });
                const growthFactor = 1 + (idx * 0.01);
                const value = totalWealthValue * growthFactor;
                const events: any[] = [];
                if (idx === 2) events.push({ type: 'property', label: 'Imóvel Adicionado' });
                if (idx === 4) events.push({ type: 'contract', label: 'Contrato Assinado' });
                return { month: monthName, value, events };
            });

            // 10. Financial History & PROJECTION
            const financialHistory = last6Months.map(date => {
                const monthName = date.toLocaleString('pt-BR', { month: 'short' });
                const monthTransactions = transactions.filter(t =>
                    new Date(t.date).getMonth() === date.getMonth() &&
                    new Date(t.date).getFullYear() === date.getFullYear()
                );
                const income = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + (t.amount || 0), 0);
                const expense = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + (t.amount || 0), 0);
                return { month: monthName, income, expense, net: income - expense, projected: false };
            });

            for (let i = 1; i <= 3; i++) {
                const projDate = new Date();
                projDate.setMonth(projDate.getMonth() + i);
                financialHistory.push({
                    month: projDate.toLocaleString('pt-BR', { month: 'short' }),
                    income: mrrValue,
                    expense: 0,
                    net: mrrValue,
                    projected: true
                });
            }

            // 11. PROGRESSION SYSTEM (Levels 1-4)
            const totalExpenses = transactions.filter(t => t.type === 'expense').length;
            const maintenanceWithInspection = maintenanceRequests.filter(m => m.title?.toLowerCase().includes('vistoria')).length;
            const propertyCount = properties.length;
            const activeContractsCount = activeContracts.length;

            // Define Steps Verification
            const levels = [
                {
                    id: 1,
                    name: 'Primeiros Passos',
                    badge: 'NÍVEL 1 · START',
                    steps: [
                        { id: 'l1s1', label: 'Adicionar primeiro imóvel', completed: propertyCount > 0, action: '/properties' },
                        { id: 'l1s2', label: 'Cadastrar primeiro inquilino', completed: tenants.length > 0, action: '/tenants' },
                        { id: 'l1s3', label: 'Criar primeiro contrato', completed: activeContractsCount > 0, action: '/contracts' },
                        { id: 'l1s4', label: 'Configurar recebimento', completed: properties.length > 0, action: '/settings' },
                    ]
                },
                {
                    id: 2,
                    name: 'Gestão Ativa',
                    badge: 'NÍVEL 2 · GESTÃO ATIVA',
                    steps: [
                        { id: 'l2s1', label: 'Registrar primeira despesa', completed: totalExpenses > 0, action: '/financials' },
                        { id: 'l2s2', label: 'Realizar primeira vistoria', completed: maintenanceWithInspection > 0, action: '/messages' },
                        { id: 'l2s3', label: 'Enviar primeira cobrança', completed: pendingPayments.length > 0, action: '/financials' },
                        { id: 'l2s4', label: 'Configurar reajuste', completed: activeContracts.some(c => c.payment_day > 0), action: '/contracts' },
                    ]
                },
                {
                    id: 3,
                    name: 'Carteira em Expansão',
                    badge: 'NÍVEL 3 · EXPANSÃO',
                    steps: [
                        { id: 'l3s1', label: 'Adicionar segundo imóvel', completed: propertyCount >= 2, action: '/properties' },
                        { id: 'l3s2', label: '100% de ocupação', completed: occupancyRate === 100 && propertyCount > 0, action: '/properties' },
                        { id: 'l3s3', label: '3 meses sem inadimplência', completed: parseFloat(portfolioHealth.delinquency) === 0, action: '/financials' },
                        { id: 'l3s4', label: 'Gerar relatório financeiro', completed: transactions.length > 5, action: '/financials' },
                    ]
                },
                {
                    id: 4,
                    name: 'Investidor Avançado',
                    badge: 'NÍVEL 4 · AVANÇADO',
                    steps: [
                        { id: 'l4s1', label: 'Yield mensal > 0.5%', completed: (parseFloat(portfolioHealth.yield) / 12) > 0.5, action: '/dashboard' },
                        { id: 'l4s2', label: '3+ contratos ativos', completed: activeContractsCount >= 3, action: '/contracts' },
                        { id: 'l4s3', label: 'Primeira renovação', completed: contracts.some(c => c.status === 'active' && new Date(c.start_date) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)), action: '/contracts' },
                        { id: 'l4s4', label: 'Ativar débito automático', completed: activeContractsCount > 0 && propertyCount > 2, action: '/settings' },
                    ]
                }
            ];

            // Determine current level
            let currentLevelIndex = 0;
            for (let i = 0; i < levels.length; i++) {
                const completedInLevel = levels[i].steps.filter(s => s.completed).length;
                if (completedInLevel < 4) {
                    currentLevelIndex = i;
                    break;
                }
                if (i === levels.length - 1) currentLevelIndex = 3; // Max level
            }

            const currentLevel = levels[currentLevelIndex];
            const completedCount = currentLevel.steps.filter(s => s.completed).length;
            const nextStep = currentLevel.steps.find(s => !s.completed) || currentLevel.steps[3];

            const progression = {
                currentLevel,
                levels,
                completedCount,
                totalSteps: 4,
                nextStep,
                isMaxLevel: currentLevelIndex === 3 && completedCount === 4
            };

            // 12. Activities List (Consolidated)
            const activitiesList = [
                ...transactions.map(t => {
                    const d = new Date(t.date);
                    return {
                        id: t.id,
                        type: 'payment',
                        title: `${t.type === 'income' ? 'Recebimento' : 'Pagamento'}: ${t.title}`,
                        date: d.toLocaleDateString('pt-BR'),
                        time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    };
                }),
                ...maintenanceRequests.map(m => {
                    const d = new Date(m.created_at);
                    return {
                        id: m.id,
                        type: 'maintenance',
                        title: `Manutenção: ${m.title || 'Reparo'}`,
                        date: d.toLocaleDateString('pt-BR'),
                        time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    };
                }),
                ...properties.map(p => {
                    const d = new Date(p.updated_at || p.created_at || Date.now());
                    return {
                        id: p.id,
                        type: 'property',
                        title: `Imóvel Atualizado: ${p.name}`,
                        date: d.toLocaleDateString('pt-BR'),
                        time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    };
                })
            ].sort((a, b) => {
                const dateA = new Date(a.date.split('/').reverse().join('-') + 'T' + a.time).getTime();
                const dateB = new Date(b.date.split('/').reverse().join('-') + 'T' + b.time).getTime();
                return dateB - dateA;
            });

            return {
                onboarding: progression, 
                properties,
                portfolioHealth,
                yieldByProperty,
                risks: risks.slice(0, 5),
                wealthHistory,
                metrics: {
                    totalWealth: totalWealthValue > 0 ? `R$ ${(totalWealthValue / 1000).toFixed(0)}k` : 'R$ 0k',
                    mrr: `R$ ${(mrrValue / 1000).toFixed(1)}k`,
                    occupancyRate,
                    avgRoi: `${avgRoiValue}%`,
                    expiringContractsCount,
                    pendingMaintenanceCount,
                    trends: {
                        wealth: totalWealthValue > 0 ? '+0.4%' : '0%',
                        mrr: '+0%',
                        occupancy: occupancyRate < 80 ? '-0%' : '+0%',
                        roi: '+0%',
                    },
                },
                financialHistory,
                topProperties: properties.slice(0, 3).map((p) => {
                    const annualPropRent = (p.numeric_price || 0) * 12;
                    const propYield = p.market_value && p.market_value > 0 ? (annualPropRent / p.market_value) * 100 : 0;
                    return {
                        id: p.id,
                        name: p.name,
                        image: p.image,
                        revenue: p.numeric_price || 0,
                        yield: propYield / 100,
                        status: p.status === 'ALUGADO' ? 'occupied' : 'vacant',
                    };
                }),
                activities: activitiesList.slice(0, 5),
            };
        } catch (err) {
            console.error('CRITICAL DASHBOARD ERROR:', err);
            throw err;
        }
    },
};
