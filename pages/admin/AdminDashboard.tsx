import React from 'react';
import { Shield, Users, Activity, BarChart2, Clock, Bell, ChevronRight } from 'lucide-react';
import { SectionHeader } from '../../components/ui/DashboardComponents';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

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
          <Card key={i}>
            <CardHeader className='flex-row items-center justify-between pb-2'>
              <div>
                <CardTitle className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>
                  {stat.title}
                </CardTitle>
                <p className='mt-2 text-2xl font-black text-card-foreground'>{stat.value}</p>
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
            {[
              { action: 'Admin "Carlos" aprovou novo usuário', time: 'há 2 horas' },
              { action: 'Backup automático concluído', time: 'há 5 horas' },
              { action: 'Nova conta premium ativada', time: 'há 1 dia' },
            ].map((item, i) => (
              <div
                key={i}
                className='flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-accent transition-all cursor-pointer group'
              >
                <span className='text-sm font-bold text-card-foreground'>{item.action}</span>
                <div className='flex items-center gap-2'>
                  <span className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>
                    {item.time}
                  </span>
                  <ChevronRight
                    size={14}
                    className='text-muted-foreground group-hover:text-primary transition-all'
                  />
                </div>
              </div>
            ))}
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
              <p className='text-xs text-muted-foreground mt-1'>Sistema operando normalmente.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
