import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Users, Activity, BarChart3, Clock, Bell, ChevronRight, Building2 } from 'lucide-react';
import { SectionHeader } from '../../components/ui/DashboardComponents';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { adminService } from '../../services/adminService';

interface RecentActivity {
  id: string;
  action: string;
  target_type: string;
  admin: { name: string | null } | null;
  created_at: string;
}

const formatActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    update_plan: 'Plano atualizado',
    update_role: 'Role atualizada',
    export_data: 'Dados exportados',
    suspend_user: 'Usuário suspenso',
    unsuspend_user: 'Usuário reativado',
    refund_processed: 'Reembolso processado',
  };
  return labels[action] || action;
};

const formatRelativeTime = (dateStr: string): string => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `há ${diffD}d`;
};

const AdminDashboard = () => {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminService.getStats(),
  });

  const { data: recentActivity, isLoading: loadingActivity } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: () => adminService.getRecentActivity(5),
  });

  const [now] = useState(() => new Date());

  const metrics = [
    {
      title: 'Proprietários Ativos',
      value: stats?.active_owners ?? '...',
      icon: Users,
      trend: stats ? `${stats.active_owners} contas` : '—',
    },
    {
      title: 'MRR Global',
      value:
        stats?.mrr !== undefined ? `R$ ${(stats.mrr / 1000).toFixed(1)}k` : '...',
      icon: BarChart3,
      trend: stats ? `Recorrente mensal` : '—',
    },
    {
      title: 'Trials Ativos',
      value: stats?.active_trials ?? '...',
      icon: Activity,
      trend: stats ? `${stats.active_trials} testes` : '—',
    },
    {
      title: 'Tickets Abertos',
      value: stats?.open_tickets ?? '...',
      icon: Shield,
      trend: stats ? `${stats.open_tickets} pendentes` : '—',
    },
  ];

  const activities: RecentActivity[] = (recentActivity as RecentActivity[]) || [];

  return (
    <div className='p-8 space-y-8 animate-fadeIn'>
      <SectionHeader
        title='Governance Hub'
        subtitle='Monitoramento centralizado e operações do sistema.'
        icon={Shield}
        iconColor='text-primary'
      />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {metrics.map((stat, i) => (
          <Card key={i}>
            <CardHeader className='flex-row items-center justify-between pb-2'>
              <div>
                <CardTitle className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>
                  {stat.title}
                </CardTitle>
                <p className='mt-2 text-2xl font-black text-card-foreground'>
                  {loadingStats ? '...' : stat.value}
                </p>
              </div>
              <div className='p-3.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform'>
                <stat.icon className='h-6 w-6' />
              </div>
            </CardHeader>
            <CardContent>
              <p className='text-xs font-black text-emerald-500 flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-emerald-500' />
                {stat.trend} este mês
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <Card>
          <CardHeader>
            <SectionHeader title='Ações Recentes' icon={Clock} iconColor='text-muted-foreground' />
          </CardHeader>
          <CardContent className='space-y-2'>
            {loadingActivity ? (
              <div className='p-8 text-center text-muted-foreground font-bold text-xs'>
                Carregando atividade...
              </div>
            ) : activities.length === 0 ? (
              <div className='p-8 text-center text-muted-foreground font-bold text-xs'>
                Nenhuma atividade recente registrada.
              </div>
            ) : (
              activities.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-accent transition-all cursor-pointer group'
                >
                  <span className='text-sm font-bold text-card-foreground'>
                    <span className='text-muted-foreground font-medium'>
                      {item.admin?.name || 'Sistema'}:
                    </span>{' '}
                    {formatActionLabel(item.action)}
                  </span>
                  <div className='flex items-center gap-2'>
                    <span className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>
                      {formatRelativeTime(item.created_at)}
                    </span>
                    <ChevronRight
                      size={14}
                      className='text-muted-foreground group-hover:text-primary transition-all'
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionHeader
              title='Alertas de Sistema'
              icon={Bell}
              iconColor='text-muted-foreground'
            />
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <div className='w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4'>
                <Bell size={24} />
              </div>
              <p className='text-[10px] font-black uppercase tracking-widest text-muted-foreground'>
                Nenhum alerta crítico pendente
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
                Sistema operando normalmente. Última verificação:{' '}
                {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
