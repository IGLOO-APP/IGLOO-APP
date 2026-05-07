import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  AlertTriangle,
  Info,
  Zap,
  Clock,
  Target,
} from 'lucide-react';
import { ModalWrapper } from '../../components/ui/ModalWrapper';
import { InfoTooltip } from '../../components/ui/InfoTooltip';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance' | 'feature';
  target_audience: 'all' | 'free_users' | 'paid_users';
  status: 'active' | 'draft' | 'expired';
  views: number;
  clicks: number;
  created_at: string;
  show_until?: string;
}

import { adminService } from '../../services/adminService';
// Mock announcements removed


const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState({ total_views: 0, total_clicks: 0, ctr: '0.0' });
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAnnouncements = async () => {
    try {
      const { list, stats: s } = await adminService.getAnnouncements();
      setAnnouncements((list as Announcement[]) || []);
      setStats(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<Announcement['type']>('info');
  const [newTarget, setNewTarget] = useState<Announcement['target_audience']>('all');

  const getTypeStyles = (type: Announcement['type']) => {
    switch (type) {
      case 'feature':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
      case 'warning':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20';
      case 'maintenance':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
      default:
        return 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border-slate-100 dark:border-slate-500/20';
    }
  };

  const getTypeIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'feature':
        return <Zap size={14} />;
      case 'warning':
        return <AlertTriangle size={14} />;
      case 'maintenance':
        return <Clock size={14} />;
      default:
        return <Info size={14} />;
    }
  };

  return (
    <div className='p-8 space-y-8 animate-fadeIn'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h2 className='text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
            Comunicados Globais
          </h2>
          <p className='text-sm text-slate-500'>
            Gerencie avisos e novidades para a base de proprietários.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <button className='px-4 py-2 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm'>
            <Filter size={18} />
            Filtrar
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className='px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2'
          >
            <Plus size={18} />
            Novo Comunicado
          </button>
        </div>
      </div>

      {/* Stats Quick Overview */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {[
          { 
            label: 'Visu. Totais', 
            value: stats.total_views.toLocaleString(), 
            change: '+0', 
            icon: Eye, 
            color: 'primary',
            tooltipTitle: 'Visualizações Totais',
            tooltipDesc: 'Número total de vezes que seus comunicados foram exibidos nos dashboards dos proprietários.'
          },
          { 
            label: 'Cliques Totais', 
            value: stats.total_clicks.toLocaleString(), 
            change: 'Total', 
            icon: Users, 
            color: 'amber',
            tooltipTitle: 'Engajamento Direto',
            tooltipDesc: 'Total de cliques em links ou botões de "Ver Mais" dentro dos comunicados ativos.'
          },
          { 
            label: 'CTR Médio', 
            value: `${stats.ctr}%`, 
            change: 'Interação real', 
            icon: Target, 
            color: 'emerald',
            tooltipTitle: 'Taxa de Clique (CTR)',
            tooltipDesc: 'A porcentagem de usuários que clicaram em um comunicado após visualizá-lo. Mede a eficácia da sua mensagem.'
          },
        ].map((stat) => (
          <InfoTooltip key={stat.label} title={stat.tooltipTitle} description={stat.tooltipDesc}>
            <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm h-full'>
              <div className='flex items-center justify-between mb-4'>
                <div className={`p-3 rounded-xl bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/10 text-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}`}>
                  <stat.icon size={20} />
                </div>
                <span className='text-[10px] font-bold text-emerald-500 uppercase'>{stat.change}</span>
              </div>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>{stat.label}</p>
              <h3 className='text-2xl font-extrabold text-slate-900 dark:text-white'>{stat.value}</h3>
            </div>
          </InfoTooltip>
        ))}
      </div>

      {/* Content Section */}
      <div className='bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden'>
        {/* Toolbar */}
        <div className='p-5 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div className='flex p-1 bg-slate-50 dark:bg-white/5 rounded-xl w-fit'>
            {(['all', 'active', 'draft', 'archived'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-tight ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'all' ? 'Todos' : tab === 'active' ? 'Ativos' : tab === 'draft' ? 'Rascunhos' : 'Arquivados'}
              </button>
            ))}
          </div>

          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
            <input
              type='text'
              placeholder='Buscar comunicados...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary w-full md:w-64 outline-none transition-all'
            />
          </div>
        </div>

        {/* List */}
        <div className='divide-y divide-gray-50 dark:divide-white/5'>
          {loading ? (
            <div className='p-20 text-center text-slate-400 font-bold'>Carregando comunicados...</div>
          ) : announcements.length === 0 ? (
            <div className='p-20 text-center text-slate-400 font-bold'>Nenhum comunicado encontrado.</div>
          ) : announcements.map((ann) => (
            <div key={ann.id} className='p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group flex items-start gap-4'>
              <div className={`p-3 rounded-2xl border ${getTypeStyles(ann.type)} shrink-0`}>
                <Megaphone size={24} />
              </div>
              
              <div className='flex-1 space-y-1'>
                <div className='flex items-center gap-2'>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${getTypeStyles(ann.type)}`}>
                    {getTypeIcon(ann.type)}
                    {ann.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${ann.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {ann.status}
                  </span>
                </div>
                <h4 className='text-base font-bold text-slate-900 dark:text-white'>
                  {ann.title}
                </h4>
                <p className='text-sm text-slate-500 dark:text-slate-400 line-clamp-1'>
                  {ann.content}
                </p>
                <div className='flex items-center gap-4 pt-2'>
                  <div className='flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase'>
                    <Calendar size={12} />
                    {new Date(ann.created_at).toLocaleDateString()}
                  </div>
                  <div className='flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase'>
                    <Target size={12} />
                    {ann.target_audience === 'all' ? 'Toda a base' : ann.target_audience}
                  </div>
                  <div className='flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase'>
                    <Eye size={12} />
                    {ann.views}
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                <button className='p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors'>
                  <Edit size={18} />
                </button>
                <button className='p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors'>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className='bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white relative overflow-hidden'>
        <div className='absolute top-0 right-0 p-8 opacity-10 pointer-events-none'>
          <Info size={120} />
        </div>
        <div className='relative z-10 space-y-6'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-amber-500 rounded-lg text-slate-900'>
              <Zap size={20} />
            </div>
            <h3 className='text-lg font-bold'>Dicas para Comunicados de Impacto</h3>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='space-y-2'>
              <h4 className='text-sm font-bold text-amber-500 uppercase tracking-widest'>Segmentação</h4>
              <p className='text-xs text-slate-300 leading-relaxed'>
                Use o público-alvo para enviar mensagens relevantes. Promoções de upgrade devem ir apenas para usuários no plano Free.
              </p>
            </div>
            <div className='space-y-2'>
              <h4 className='text-sm font-bold text-amber-500 uppercase tracking-widest'>Tipo de Aviso</h4>
              <p className='text-xs text-slate-300 leading-relaxed'>
                Reserve o tipo 'Alerta' apenas para urgências. Para novas ferramentas, o tipo 'Feature' gera mais engajamento visual.
              </p>
            </div>
            <div className='space-y-2'>
              <h4 className='text-sm font-bold text-amber-500 uppercase tracking-widest'>O Momento Certo</h4>
              <p className='text-xs text-slate-300 leading-relaxed'>
                O Dashboard é o local mais nobre. Evite textos longos; prefira mensagens curtas que convidam para um "Ver Detalhes".
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New Announcement Modal */}
      {showNewModal && (
        <ModalWrapper
          onClose={() => setShowNewModal(false)}
          title='Criar Novo Comunicado'
          showCloseButton={true}
          className='md:max-w-2xl'
        >
          <div className='p-6 space-y-6 bg-background-light dark:bg-background-dark'>
            <div className='space-y-4'>
              <div>
                <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1.5 block'>
                  Título do Comunicado
                </label>
                <input
                  type='text'
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder='Ex: Atualização do Termo de Uso'
                  className='w-full px-4 py-2.5 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-sm font-medium'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1.5 block'>
                    Tipo de Aviso
                  </label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className='w-full px-4 py-2.5 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-sm font-medium'
                  >
                    <option value='info'>Informação</option>
                    <option value='feature'>Novidade / Feature</option>
                    <option value='warning'>Aviso Importante</option>
                    <option value='maintenance'>Manutenção</option>
                  </select>
                </div>
                <div>
                  <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1.5 block'>
                    Público Alvo
                  </label>
                  <select 
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value as any)}
                    className='w-full px-4 py-2.5 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-sm font-medium'
                  >
                    <option value='all'>Todos os Proprietários</option>
                    <option value='free_users'>Apenas usuários Free</option>
                    <option value='paid_users'>Apenas assinantes pagos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1.5 block'>
                  Conteúdo da Mensagem
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder='Descreva as novidades aqui...'
                  className='w-full px-4 py-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-sm font-medium resize-none'
                />
              </div>
            </div>

            <div className='flex gap-3 pt-4'>
              <button
                onClick={() => setShowNewModal(false)}
                className='flex-1 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all'
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    await adminService.createAnnouncement({
                      title: newTitle,
                      content: newContent,
                      type: newType,
                      target_audience: newTarget,
                      status: 'active'
                    });
                    setShowNewModal(false);
                    loadAnnouncements();
                    setNewTitle('');
                    setNewContent('');
                  } catch (err) {
                    alert('Erro ao publicar: ' + (err as Error).message);
                  }
                }}
                disabled={!newTitle || !newContent}
                className='flex-[2] py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50'
              >
                Publicar Comunicado
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default Announcements;
