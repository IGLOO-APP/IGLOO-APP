import React from 'react';
import { Shield, Users, Activity, BarChart2, Clock, Bell, ChevronRight } from 'lucide-react';
import { SectionHeader } from '../../components/ui/DashboardComponents';

const AdminDashboard = () => {
  const stats = [
    { title: 'Total de Usuários', value: '1,284', icon: Users, trend: '+12%' },
    { title: 'MRR Total', value: 'R$ 84k', icon: BarChart2, trend: '+5%' },
    { title: 'Atividade (24h)', value: '452', icon: Activity, trend: '+2%' },
    { title: 'Segurança', value: '99.9%', icon: Shield, trend: 'Estável' },
  ];

  return (
    <div className='p-8 space-y-8 animate-fadeIn'>
      <SectionHeader
        title='Governance Hub'
        subtitle='Monitoramento centralizado e operações do sistema.'
        icon={Shield}
        iconColor='text-primary'
      />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, i) => (
          <div
            key={i}
            className='bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group'
          >
            <div className='flex items-center justify-between mb-6'>
              <div>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  {stat.title}
                </p>
                <p className='mt-2 text-2xl font-black text-slate-900 dark:text-white'>
                  {stat.value}
                </p>
              </div>
              <div className='p-3.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform'>
                <stat.icon className='h-6 w-6' />
              </div>
            </div>
            <p className='text-xs font-black text-emerald-500 flex items-center gap-1.5'>
              <span className='w-2 h-2 rounded-full bg-emerald-500' />
              {stat.trend} este mês
            </p>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm space-y-6'>
          <SectionHeader
            title='Ações Recentes'
            icon={Clock}
            iconColor='text-slate-400'
          />
          <div className='space-y-2'>
            {[
              { action: 'Admin "Carlos" aprovou novo usuário', time: 'há 2 horas' },
              { action: 'Backup automático concluído', time: 'há 5 horas' },
              { action: 'Nova conta premium ativada', time: 'há 1 dia' },
            ].map((item, i) => (
              <div
                key={i}
                className='flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer group'
              >
                <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>
                  {item.action}
                </span>
                <div className='flex items-center gap-2'>
                  <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    {item.time}
                  </span>
                  <ChevronRight size={14} className='text-slate-300 group-hover:text-primary transition-all' />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm space-y-6'>
          <SectionHeader
            title='Alertas de Sistema'
            icon={Bell}
            iconColor='text-slate-400'
          />
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 mb-4'>
              <Bell size={24} />
            </div>
            <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
              Nenhum alerta crítico pendente
            </p>
            <p className='text-xs text-slate-500 mt-1'>Sistema operando normalmente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
