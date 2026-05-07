import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  ChevronRight,
  TrendingDown,
  Clock,
  Check,
  X,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ModalWrapper } from '../../components/ui/ModalWrapper';
import { InfoTooltip } from '../../components/ui/InfoTooltip';

const SubscriptionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [revenuePeriod, setRevenuePeriod] = useState('Últimos 6 meses');
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsData, growth] = await Promise.all([
          adminService.getSubscriptionStats(),
          adminService.getGrowthData(),
        ]);
        setStats(statsData);
        setRevenueData(growth.map(g => ({ name: g.name, value: g.revenue })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // New Plan form state
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanMonthly, setNewPlanMonthly] = useState('');
  const [newPlanAnnual, setNewPlanAnnual] = useState('');
  const [newPlanProps, setNewPlanProps] = useState('');
  const [newPlanTenants, setNewPlanTenants] = useState('');
  const [newPlanStatus, setNewPlanStatus] = useState<'active' | 'draft'>('active');
  const [newFeature, setNewFeature] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>([]);

  const [revenueData, setRevenueData] = useState<any[]>([]);

  const movementMetrics = [
    {
      label: 'Upgrades',
      value: stats?.recentMovements?.upgrades?.toString() || '0',
      badge: '▲ 0 upgrades',
      badgeColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      filter: 'upgrades',
    },
    {
      label: 'Downgrades',
      value: stats?.recentMovements?.downgrades?.toString() || '0',
      badge: '▼ 0 downgrades',
      badgeColor: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      filter: 'downgrades',
    },
    {
      label: 'Cancelamentos',
      value: stats?.recentMovements?.cancelamentos?.toString() || '0',
      badge: '0 cancelamentos',
      badgeColor: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400',
      filter: 'canceled',
    },
  ];

  const metrics = [
    {
      label: 'MRR Global',
      value: stats?.mrr !== undefined ? `R$ ${stats.mrr.toLocaleString()}` : '...',
      change: '+0%',
      trend: 'up',
      icon: DollarSign,
      color: 'emerald',
      type: 'positive',
      tooltipTitle: 'Receita Recorrente Mensal',
      tooltipDesc:
        'Soma de todas as assinaturas ativas no mês atual. Não inclui planos Free nem pagamentos únicos.',
    },
    {
      label: 'ARR Estimado',
      value: stats?.arr !== undefined ? `R$ ${stats.arr.toLocaleString()}` : '...',
      change: '+0%',
      trend: 'up',
      icon: TrendingUp,
      color: 'blue',
      type: 'positive',
      tooltipTitle: 'ARR Estimado',
      tooltipDesc:
        'Receita Recorrente Anual estimada com base no MRR atual.',
    },
    {
      label: 'Churn Rate',
      value: '0%',
      change: '0%',
      trend: 'down',
      icon: Users,
      color: 'rose',
      type: 'negative',
      tooltipTitle: 'Taxa de Cancelamento (Churn)',
      tooltipDesc:
        'Percentual de proprietários que cancelaram no mês atual.',
    },
    {
      label: 'Ticket Médio',
      value: 'R$ 0,00',
      change: '0%',
      trend: 'up',
      icon: CreditCard,
      color: 'amber',
      type: 'positive',
      tooltipTitle: 'Ticket Médio',
      tooltipDesc:
        'Valor médio pago por assinatura na plataforma.',
    },
  ];

  const getStatColor = (stat: any) => {
    if (stat.type === 'positive') {
      return stat.trend === 'up'
        ? 'text-emerald-500 bg-emerald-500/10'
        : 'text-rose-500 bg-rose-500/10';
    }
    if (stat.type === 'negative') {
      return stat.trend === 'down'
        ? 'text-emerald-500 bg-emerald-500/10'
        : 'text-rose-500 bg-rose-500/10';
    }
    return 'text-slate-500 bg-slate-500/10';
  };

  return (
    <div className='p-8 space-y-8 animate-fadeIn'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900 dark:text-white tracking-tight'>
            Assinaturas e Receita
          </h2>
          <p className='text-sm text-slate-500'>
            Gestão de planos, pagamentos e métricas financeiras.
          </p>
        </div>
        <div className='flex gap-3'>
          <button className='flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all'>
            <Download size={18} />
            Exportar Relatório
          </button>
          <button
            onClick={() => setShowNewPlanModal(true)}
            className='flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all'
          >
            <Plus size={18} />
            Novo Plano
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {metrics.map((m) => (
          <InfoTooltip key={m.label} title={m.tooltipTitle} description={m.tooltipDesc}>
            <div className='h-full bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm'>
              <div className='flex items-center justify-between mb-4'>
                <div className={`p-3 rounded-2xl bg-${m.color}-500/10 text-${m.color}-500`}>
                  <m.icon size={22} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatColor(m)}`}>
                  {m.change}
                </span>
              </div>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>
                {m.label}
              </p>
              <h3 className='text-xl font-bold text-slate-900 dark:text-white tracking-tight'>
                {m.value}
              </h3>
            </div>
          </InfoTooltip>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-white/5'>
          <h3 className='text-lg font-bold text-slate-900 dark:text-white mb-6'>
            Distribuição por Plano
          </h3>
          <div className='space-y-6'>
            {(stats?.planDistribution || [
                { name: 'Elite', count: 0, percentage: 0, mrr: '0', color: 'primary' },
                { name: 'Pro', count: 0, percentage: 0, mrr: '0', color: 'emerald' },
                { name: 'Trial', count: 0, percentage: 0, mrr: '0', color: 'amber' },
                { name: 'Free', count: 0, percentage: 0, mrr: '0', color: 'slate', isFree: true },
              ]).map((p: any) => (
              <div
                key={p.name}
                onClick={() => navigate(`/admin/users?plan=${p.name}`)}
                className='group space-y-2 cursor-pointer'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-bold text-slate-700 dark:text-white'>
                      {p.name}
                    </span>
                    <ChevronRight
                      size={14}
                      className='text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all'
                    />
                  </div>
                  <span className='text-xs font-bold text-slate-400'>
                    {p.isFree ? `${p.count} usuários` : `R$ ${p.mrr} MRR`}
                  </span>
                </div>
                <div className='h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden'>
                  <div
                    className={`h-full rounded-full ${p.isFree ? 'bg-slate-300 dark:bg-slate-700' : `bg-${p.color === 'primary' ? 'primary' : p.color + '-500'}`}`}
                    style={{ width: `${p.percentage}%` }}
                  ></div>
                </div>
                <div className='flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>
                  <span>{p.count} assinaturas</span>
                  <span>
                    {p.isFree ? `${p.percentage}% da base` : `${p.percentage}% do total`}
                  </span>
                </div>
                {p.isFree && (
                  <p className='text-[10px] text-slate-400/60 font-medium italic -mt-1'>
                    Plano gratuito — sem receita direta
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-white/5 flex flex-col'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-bold text-slate-900 dark:text-white'>
              Histórico de Receita
            </h3>
            <div className='relative group'>
              <button className='flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-100 transition-all'>
                {revenuePeriod}
                <ChevronRight size={14} className='rotate-90' />
              </button>
              <div className='absolute top-full right-0 mt-2 w-40 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-white/10 py-1.5 z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0'>
                {['Últimos 6 meses', 'Último ano', 'Todo o período'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setRevenuePeriod(opt)}
                    className='w-full text-left px-4 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-colors uppercase'
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className='flex-1 h-64 min-h-[250px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#e2e8f0' opacity={0.3} />
                <XAxis
                  dataKey='name'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  tickFormatter={(value) => `R$${value / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-white/10'>
                          <p className='text-[10px] font-bold text-slate-400 uppercase mb-1'>{label} 2024</p>
                          <p className='text-sm font-bold'>R$ {(payload[0]?.value ?? 0).toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey='value'
                  fill='#10b981'
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                >
                  {revenueData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fillOpacity={index === revenueData.length - 1 ? 1 : 0.6}
                      className='hover:fill-opacity-100 transition-all'
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className='space-y-6'>
        <h3 className='text-sm font-bold text-slate-500 uppercase tracking-widest'>
          Movimentação do Mês
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {movementMetrics.map((m) => (
            <div
              key={m.label}
              onClick={() => navigate(`/admin/users?filter=${m.filter}`)}
              className='bg-white dark:bg-surface-dark p-6 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm cursor-pointer hover:border-primary/20 transition-all group'
            >
              <div className='flex items-center justify-between mb-3'>
                <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
                  {m.label}
                </p>
                <ChevronRight
                  size={16}
                  className='text-slate-300 group-hover:text-primary transition-colors'
                />
              </div>
              <div className='flex items-end justify-between'>
                <h3 className='text-2xl font-bold text-slate-900 dark:text-white'>{m.value}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${m.badgeColor}`}>
                  {m.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Plan Modal */}
      {showNewPlanModal && (
        <ModalWrapper
          onClose={() => setShowNewPlanModal(false)}
          title='Criar Novo Plano'
          showCloseButton={true}
          className='md:max-w-2xl'
        >
          <div className='p-8 space-y-6 bg-background-light dark:bg-background-dark overflow-y-auto max-h-[80vh]'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div>
                  <label className='block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2'>
                    Nome do Plano *
                  </label>
                  <input
                    type='text'
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder='Ex: Professional'
                    className='w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none transition-all'
                  />
                </div>
                <div>
                  <label className='block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2'>
                    Descrição Curta *
                  </label>
                  <input
                    type='text'
                    value={newPlanDesc}
                    onChange={(e) => setNewPlanDesc(e.target.value)}
                    placeholder='Ex: Para gestores que buscam automação'
                    className='w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none transition-all'
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2'>
                      Preço Mensal (R$) *
                    </label>
                    <input
                      type='number'
                      value={newPlanMonthly}
                      onChange={(e) => setNewPlanMonthly(e.target.value)}
                      placeholder='0,00'
                      className='w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none transition-all'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2'>
                      Preço Anual (R$)
                    </label>
                    <div className='relative'>
                      <input
                        type='number'
                        value={newPlanAnnual}
                        onChange={(e) => setNewPlanAnnual(e.target.value)}
                        placeholder='0,00'
                        className='w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none transition-all'
                      />
                      {newPlanMonthly && newPlanAnnual && (
                        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded'>
                          -{Math.round((1 - parseFloat(newPlanAnnual) / (parseFloat(newPlanMonthly) * 12)) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2'>
                      Limite Imóveis *
                    </label>
                    <input
                      type='number'
                      value={newPlanProps}
                      onChange={(e) => setNewPlanProps(e.target.value)}
                      placeholder='-1 para ilimitado'
                      className='w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none transition-all'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2'>
                      Limite Inquilinos *
                    </label>
                    <input
                      type='number'
                      value={newPlanTenants}
                      onChange={(e) => setNewPlanTenants(e.target.value)}
                      placeholder='-1 para ilimitado'
                      className='w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none transition-all'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2'>
                    Features Incluídas
                  </label>
                  <div className='flex gap-2 mb-3'>
                    <input
                      type='text'
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (setFeaturesList([...featuresList, newFeature]), setNewFeature(''))}
                      placeholder='Ex: Assinatura Digital'
                      className='flex-1 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none text-sm'
                    />
                    <button
                      onClick={() => {
                        if (newFeature) {
                          setFeaturesList([...featuresList, newFeature]);
                          setNewFeature('');
                        }
                      }}
                      className='p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all'
                    >
                      <PlusCircle size={20} />
                    </button>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {featuresList.map((f, i) => (
                      <span key={i} className='flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold'>
                        {f}
                        <button onClick={() => setFeaturesList(featuresList.filter((_, idx) => idx !== i))}>
                          <X size={12} className='text-slate-400 hover:text-red-500' />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2'>
                    Status Inicial
                  </label>
                  <div className='flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-fit'>
                    <button
                      onClick={() => setNewPlanStatus('active')}
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${newPlanStatus === 'active' ? 'bg-white dark:bg-surface-dark text-emerald-500 shadow-sm' : 'text-slate-400'}`}
                    >
                      ATIVO
                    </button>
                    <button
                      onClick={() => setNewPlanStatus('draft')}
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${newPlanStatus === 'draft' ? 'bg-white dark:bg-surface-dark text-amber-500 shadow-sm' : 'text-slate-400'}`}
                    >
                      RASCUNHO
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className='pt-6 border-t border-gray-100 dark:border-white/5 flex gap-4'>
              <button
                onClick={() => setShowNewPlanModal(false)}
                className='flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-sm transition-all hover:bg-slate-200'
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('Plano criado com sucesso!');
                  setShowNewPlanModal(false);
                }}
                disabled={!newPlanName || !newPlanMonthly || !newPlanProps || !newPlanTenants}
                className='flex-[2] py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Salvar Plano
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default SubscriptionManagement;
