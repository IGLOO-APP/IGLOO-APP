import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Megaphone,
  ArrowLeft,
  Plus,
  History,
  Wrench,
  CalendarDays,
  TriangleAlert,
  Info,
  Users,
  Eye,
  ChevronRight,
  Zap,
  BellOff,
  Check,
  Calendar,
  Send,
  AlertTriangle,
  Home,
  Building2,
  User,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { announcementService } from '../services/announcementService';
import { OwnerAnnouncement, AnnouncementType, AnnouncementTargetType, Property } from '../types';
import AnnouncementsHistoryModal from '../components/announcements/AnnouncementsHistoryModal';
import { executeWorkflowAction } from '../services/workflow/workflowActions';
import { toast } from 'sonner';
import { propertyService } from '../services/propertyService';
import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';

// ─── Constants ──────────────────────────────────────────────
const TYPE_META: Record<AnnouncementType, { label: string; icon: React.ReactNode; color: string }> =
  {
    maintenance: {
      label: 'Manutenção',
      icon: <Wrench size={11} />,
      color: 'text-amber-500 dark:text-amber-400',
    },
    event: {
      label: 'Evento',
      icon: <CalendarDays size={11} />,
      color: 'text-violet-500 dark:text-violet-400',
    },
    warning: {
      label: 'Aviso',
      icon: <TriangleAlert size={11} />,
      color: 'text-rose-500 dark:text-rose-400',
    },
    info: {
      label: 'Informativo',
      icon: <Info size={11} />,
      color: 'text-sky-500 dark:text-sky-450',
    },
  };

const TARGET_META: Record<string, { label: string; icon: React.ReactNode }> = {
  all: { label: 'Todos', icon: <Users size={10} /> },
  condominium: { label: 'Condomínio', icon: <Megaphone size={10} /> },
  individual: { label: 'Individual', icon: <Check size={10} /> },
  property: { label: 'Imóvel', icon: <Check size={10} /> },
};

const ITEMS_PER_PAGE = 6;

const announcementTypes = [
  { value: 'info' as AnnouncementType, label: 'Informativo', icon: Info },
  { value: 'maintenance' as AnnouncementType, label: 'Manutenção', icon: Clock },
  { value: 'warning' as AnnouncementType, label: 'Alerta', icon: AlertTriangle },
  { value: 'event' as AnnouncementType, label: 'Evento', icon: CheckCircle2 },
];

interface AnnouncementTemplate {
  id?: string;
  title: string;
  content: string;
  type: AnnouncementType;
}

const GovernanceHub: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<OwnerAnnouncement[]>([]);
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<'list' | 'create' | 'history'>('list');
  const [properties, setProperties] = useState<Property[]>([]);

  // ── Create form state ──
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    type: AnnouncementType;
    target_type: AnnouncementTargetType;
    target_value: string[];
    condo_name: string;
    expire_mode: 'time' | 'views';
    expires_in_days: string;
    is_urgent: boolean;
  }>({
    title: '',
    content: '',
    type: 'info',
    target_type: 'all',
    target_value: [],
    condo_name: '',
    expire_mode: 'time',
    expires_in_days: '1',
    is_urgent: false,
  });
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState<AnnouncementTemplate[]>([]);
  const [templatesError, setTemplatesError] = useState(false);
  const [filterType, setFilterType] = useState<AnnouncementType | null>(null);

  useEffect(() => {
    announcementService
      .getTemplates()
      .then((data) => setTemplates(data as AnnouncementTemplate[]))
      .catch(() => setTemplatesError(true));
  }, []);

  const startCreate = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      target_type: 'all',
      target_value: [],
      condo_name: '',
      expire_mode: 'time',
      expires_in_days: '1',
      is_urgent: false,
    });
    setStep(0);
    setMode('create');
  };

  const fillTemplate = (tpl: AnnouncementTemplate) => {
    setFormData((prev) => ({ ...prev, title: tpl.title, content: tpl.content, type: tpl.type }));
  };

  // ── Handle navigation state (create / duplicate) ──
  useEffect(() => {
    const state = location.state as Record<string, unknown> | null;
    if (state?.create) {
      startCreate();
      window.history.replaceState({}, '');
    } else if (state?.duplicate) {
      const ann = state.duplicate as OwnerAnnouncement;
      setFormData((prev) => ({
        ...prev,
        title: ann.title,
        content: ann.content,
        type: ann.type,
        target_type: ann.target_type,
        is_urgent: ann.is_urgent || false,
      }));
      setStep(1);
      setMode('create');
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [annData, propData] = await Promise.all([
        user.role === 'owner'
          ? announcementService.getForOwner(user.id)
          : announcementService.getForTenant(user.id),
        user.role === 'owner'
          ? propertyService.getAll().catch(() => [] as Property[])
          : Promise.resolve([]),
      ]);
      setAnnouncements(
        (annData || []).filter((a) => !a.expires_at || new Date(a.expires_at) > new Date())
      );
      if (propData) setProperties(propData);
    } catch (_error) {
      console.error('Error fetching data:', _error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Create form logic ──
  const condominiums = useMemo(
    () =>
      Array.from(
        new Set(properties.map((p) => p.address.split(',')[0].split('-')[0].trim()))
      ).filter(Boolean),
    [properties]
  );

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let expiresAt: string | undefined;
      if (formData.expire_mode === 'time') {
        const d = new Date();
        d.setDate(d.getDate() + parseInt(formData.expires_in_days));
        expiresAt = d.toISOString();
      }

      let targetValue: { ids?: string[]; name?: string } | null = null;
      if (formData.target_type === 'property' || formData.target_type === 'individual') {
        targetValue = { ids: formData.target_value };
      } else if (formData.target_type === 'condominium') {
        targetValue = { name: formData.condo_name };
      }

      await announcementService.create({
        owner_id: user.id,
        title: formData.title,
        content: formData.content,
        type: formData.type,
        target_type: formData.target_type,
        target_value: targetValue,
        expires_at: expiresAt,
        is_urgent: formData.is_urgent,
      });

      toast.success('Comunicado enviado com sucesso!');
      setMode('list');
      setFormData({
        title: '',
        content: '',
        type: 'info',
        target_type: 'all',
        target_value: [],
        condo_name: '',
        expire_mode: 'time',
        expires_in_days: '1',
        is_urgent: false,
      });
      fetchData();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Erro ao criar comunicado. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const canSubmit =
    formData.title.trim() &&
    formData.content.trim() &&
    (!['property', 'individual'].includes(formData.target_type) ||
      formData.target_value.length > 0);

  const handleAction = async (e: React.MouseEvent, endpoint: string) => {
    e.stopPropagation();
    try {
      await executeWorkflowAction(endpoint);
      fetchData();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const isOwner = user?.role === 'owner';
  const urgentCount = announcements.filter((a) => a.is_urgent).length;
  const totalPages = Math.ceil(announcements.length / ITEMS_PER_PAGE);
  const paginatedAnnouncements = announcements.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className='flex flex-col h-full w-full bg-background'>
      {/* ── Top Bar ─────────────────────────────────── */}
      <div className='flex items-center justify-between px-4 md:px-6 py-3 border-b border-border shrink-0 bg-background/95 backdrop-blur-sm sticky top-0 z-20'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => {
              if (mode === 'create' && step === 1) setStep(0);
              else navigate('/');
            }}
            className='w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all'
          >
            <ArrowLeft size={18} />
          </button>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
              <Megaphone size={16} />
            </div>
            <div>
              <p className='text-xs font-medium text-muted-foreground'>Governance Hub</p>
              <h1 className='text-sm font-bold text-foreground tracking-tight leading-tight'>
                {mode === 'create'
                  ? 'Novo Comunicado'
                  : mode === 'history'
                    ? 'Histórico'
                    : 'Comunicações'}
              </h1>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {isOwner && mode === 'list' && (
            <Button
              onClick={startCreate}
              variant='outline'
              size='sm'
              className='rounded-2xl text-xs font-semibold'
            >
              <Plus size={14} /> Novo
            </Button>
          )}
          {mode !== 'history' && (
            <Button
              onClick={() => setMode('history')}
              variant='outline'
              size='sm'
              className='rounded-2xl text-xs font-semibold'
            >
              <History size={14} /> Histórico
            </Button>
          )}
        </div>
      </div>

      {mode === 'create' && step === 0 ? (
        /* ── Templates Step ───────────────────────────── */
        <div className='flex-1 overflow-y-auto px-4 md:px-6 py-6 custom-scrollbar'>
          <div className='max-w-2xl mx-auto space-y-6'>
            {/* ── Header ── */}
            <div className='flex items-center gap-3 sm:gap-4 pb-4 border-b border-gray-100 dark:border-white/5'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg'>
                {filterType ? (
                  (() => {
                    const Icon =
                      filterType === 'maintenance'
                        ? Clock
                        : filterType === 'warning'
                          ? AlertTriangle
                          : filterType === 'event'
                            ? CheckCircle2
                            : Info;
                    return <Icon className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={2.5} />;
                  })()
                ) : (
                  <Megaphone className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={2.5} />
                )}
              </div>
              <div>
                <h2 className='text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                  {filterType
                    ? announcementTypes.find((t) => t.value === filterType)?.label || 'Modelos'
                    : 'Modelos'}
                </h2>
                <p className='text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5'>
                  {filterType
                    ? `${templates.filter((t) => t.type === filterType).length} modelos`
                    : `${templates.length} modelos disponíveis`}
                </p>
              </div>
              {filterType && (
                <button
                  onClick={() => setFilterType(null)}
                  className='ml-auto w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-400'
                >
                  <X className='w-4 h-4' />
                </button>
              )}
            </div>

            {/* ── Type filter badges ── */}
            <div className='flex gap-2 flex-wrap'>
              {announcementTypes.map(({ value, label, icon: Icon }) => {
                const isActive = filterType === value;
                const colorMap: Record<string, string> = {
                  maintenance: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                  warning: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                  event: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
                };
                return (
                  <button
                    key={value}
                    onClick={() => setFilterType(isActive ? null : value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive
                        ? `${colorMap[value]} ring-2 ring-offset-1 ring-offset-transparent`
                        : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white/70'
                    }`}
                  >
                    <Icon size={12} strokeWidth={isActive ? 2.5 : 1.5} />
                    {label}
                  </button>
                );
              })}
            </div>

            {templatesError ? (
              <div className='flex flex-col items-center justify-center py-16 text-center space-y-4'>
                <Megaphone size={40} className='text-slate-200 dark:text-white/10' />
                <p className='text-[10px] font-black text-slate-300 uppercase tracking-widest'>
                  Não foi possível carregar os modelos
                </p>
              </div>
            ) : (
              <>
                <div className='space-y-2'>
                  {/* ── Começar do zero ── */}
                  <LiquidGlassCard className='w-full cursor-pointer' onClick={() => setStep(1)}>
                    <div className='p-3 sm:p-4 flex items-center gap-3 sm:gap-4'>
                      <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 bg-slate-200 dark:bg-white/10 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all'>
                        <Plus size={16} className='sm:w-5 sm:h-5' strokeWidth={2.5} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-xs sm:text-sm font-black text-slate-500 dark:text-white/60 uppercase tracking-tight group-hover:text-slate-900 dark:group-hover:text-white transition-colors'>
                          Começar do zero
                        </h4>
                        <p className='text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5'>
                          Crie um comunicado personalizado sem usar modelo
                        </p>
                      </div>
                      <div className='w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 rounded-lg transition-all'>
                        <ChevronRight size={14} className='sm:w-4 sm:h-4' />
                      </div>
                    </div>
                  </LiquidGlassCard>

                  {(filterType ? templates.filter((t) => t.type === filterType) : templates).map(
                    (tpl, i) => {
                      const typeMeta = TYPE_META[tpl.type];
                      const bgColorMap: Record<string, string> = {
                        maintenance: 'bg-amber-500/10 text-amber-500',
                        warning: 'bg-rose-500/10 text-rose-500',
                        event: 'bg-emerald-500/10 text-emerald-500',
                        info: 'bg-sky-500/10 text-sky-500',
                      };
                      return (
                        <LiquidGlassCard
                          key={i}
                          className='w-full cursor-pointer'
                          onClick={() => {
                            fillTemplate(tpl);
                            setStep(1);
                          }}
                        >
                          <div className='p-3 sm:p-4 flex items-center gap-3 sm:gap-4'>
                            <div
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${bgColorMap[tpl.type] || 'bg-primary/10 text-primary'}`}
                            >
                              {typeMeta?.icon || <Info size={14} />}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <h4 className='text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight'>
                                {tpl.title}
                              </h4>
                              <p className='text-[10px] sm:text-xs text-slate-400 font-medium leading-relaxed line-clamp-1 mt-0.5'>
                                {tpl.content}
                              </p>
                            </div>
                            <div className='w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 rounded-lg transition-all'>
                              <ChevronRight size={14} className='sm:w-4 sm:h-4' />
                            </div>
                    </div>
                  </LiquidGlassCard>
                      );
                    }
                  )}
                </div>
                {filterType && templates.filter((t) => t.type === filterType).length === 0 && (
                  <div className='flex flex-col items-center justify-center py-16 text-center space-y-4'>
                    <Megaphone size={40} className='text-slate-200 dark:text-white/10' />
                    <p className='text-[10px] font-black text-slate-300 uppercase tracking-widest'>
                      Nenhum modelo disponível
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : mode === 'create' && step === 1 ? (
        /* ── Create Form ──────────────────────────────── */
        <div className='flex-1 overflow-y-auto px-4 md:px-6 py-6 custom-scrollbar'>
          <div className='max-w-2xl mx-auto space-y-6'>
            {/* ── Header ── */}
            <div className='flex items-center gap-3 sm:gap-4 pb-4 border-b border-gray-100 dark:border-white/5'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg'>
                <Send className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={2.5} />
              </div>
              <div>
                <h2 className='text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                  Novo Comunicado
                </h2>
                <p className='text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5'>
                  Preencha os detalhes
                </p>
              </div>
            </div>

            {/* Type */}
            <div className='flex gap-2 flex-wrap'>
              {announcementTypes.map(({ value, label, icon: Icon }) => {
                const isActive = formData.type === value;
                const colorMap: Record<string, string> = {
                  maintenance: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                  warning: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                  event: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
                };
                return (
                  <button
                    key={value}
                    onClick={() => setFormData((prev) => ({ ...prev, type: value }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive
                        ? `${colorMap[value]} ring-2 ring-offset-1 ring-offset-transparent`
                        : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white/70'
                    }`}
                  >
                    <Icon size={12} strokeWidth={isActive ? 2.5 : 1.5} />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Title */}
            <div className='space-y-1.5'>
              <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                Título
              </Label>
              <div className='bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus-within:border-primary/40 focus-within:ring-4 ring-primary/5 transition-all'>
                <input
                  id='title'
                  placeholder='Ex: Manutenção no Elevador'
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className='w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-white/20'
                />
              </div>
            </div>

            {/* Content */}
            <div className='space-y-1.5'>
              <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                Mensagem
              </Label>
              <div className='bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus-within:border-primary/40 focus-within:ring-4 ring-primary/5 transition-all'>
                <textarea
                  id='content'
                  placeholder='Descreva os detalhes para os inquilinos...'
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  className='w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-white/20 resize-none leading-relaxed'
                />
              </div>
            </div>

            {/* Urgency */}
            <button
              onClick={() => setFormData((prev) => ({ ...prev, is_urgent: !prev.is_urgent }))}
              className={`w-full text-left bg-slate-50 dark:bg-white/5 rounded-2xl border transition-all group ${
                formData.is_urgent
                  ? 'border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5'
                  : 'border-transparent hover:border-slate-200 dark:hover:border-white/10'
              }`}
            >
              <div className='p-3 sm:p-4 flex items-center gap-3 sm:gap-4'>
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    formData.is_urgent
                      ? 'bg-rose-500/10 text-rose-500'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-400 group-hover:bg-rose-500/10 group-hover:text-rose-500'
                  }`}
                >
                  <AlertTriangle size={14} className='sm:w-5 sm:h-5' />
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                    Marcar como Urgente
                  </h4>
                  <p className='text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5'>
                    O aviso ganhará destaque visual
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    formData.is_urgent
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-200 dark:bg-white/10 text-transparent group-hover:text-slate-400'
                  }`}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
              </div>
            </button>

            {/* Target */}
            <div className='space-y-2'>
              <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                Público Alvo
              </Label>
              {[
                {
                  key: 'all' as AnnouncementTargetType,
                  icon: Users,
                  label: 'Todos os inquilinos',
                  desc: 'Enviar para todas as unidades ativas',
                },
                {
                  key: 'condominium' as AnnouncementTargetType,
                  icon: Building2,
                  label: 'Por Condomínio',
                  desc: 'Agrupar imóveis no mesmo endereço',
                },
                {
                  key: 'individual' as AnnouncementTargetType,
                  icon: User,
                  label: 'Inquilino Específico',
                  desc: 'Enviar apenas para uma pessoa',
                },
                {
                  key: 'property' as AnnouncementTargetType,
                  icon: Home,
                  label: 'Imóveis Específicos',
                  desc: 'Selecionar unidades manualmente',
                },
              ].map(({ key, icon: Icon, label, desc }) => (
                <div key={key} className='space-y-1'>
                  <button
                    onClick={() => setFormData((prev) => ({ ...prev, target_type: key }))}
                    className={`w-full text-left bg-slate-50 dark:bg-white/5 rounded-2xl border transition-all group ${
                      formData.target_type === key
                        ? 'border-primary shadow-sm'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-white/10'
                    }`}
                  >
                    <div className='p-3 sm:p-4 flex items-center gap-3 sm:gap-4'>
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          formData.target_type === key
                            ? 'bg-primary/10 text-primary'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                        }`}
                      >
                        <Icon size={16} className='sm:w-5 sm:h-5' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                          {label}
                        </h4>
                        <p className='text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5'>
                          {desc}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          formData.target_type === key
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-slate-200 dark:bg-white/10 text-transparent group-hover:text-slate-400'
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </div>
                  </button>
                  {key === 'condominium' && formData.target_type === 'condominium' && (
                    <div className='pl-14'>
                      <select
                        value={formData.condo_name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, condo_name: e.target.value }))
                        }
                        className='w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-100 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:border-primary/40 focus:ring-4 ring-primary/5 transition-all outline-none'
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value='' style={{ background: '#fff', color: '#0f172a' }}>
                          Selecionar Condomínio...
                        </option>
                        {condominiums.map((c) => (
                          <option
                            key={c}
                            value={c}
                            style={{ background: '#fff', color: '#0f172a' }}
                          >
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {key === 'individual' && formData.target_type === 'individual' && (
                    <div className='max-h-36 overflow-y-auto space-y-1 p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10'>
                      {properties
                        .filter((p) => p.tenant)
                        .map((p) => (
                          <label
                            key={p.tenant!.id}
                            className='flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-all'
                          >
                            <input
                              type='checkbox'
                              checked={formData.target_value.includes(p.tenant!.id)}
                              onChange={(e) => {
                                const newValues = e.target.checked
                                  ? [...formData.target_value, p.tenant!.id]
                                  : formData.target_value.filter((id) => id !== p.tenant!.id);
                                setFormData((prev) => ({ ...prev, target_value: newValues }));
                              }}
                              className='w-4 h-4 rounded border-slate-300 dark:border-white/20 text-primary focus:ring-primary'
                            />
                            <div className='flex flex-col'>
                              <span className='text-xs sm:text-sm font-bold text-slate-900 dark:text-white'>
                                {p.tenant!.name}
                              </span>
                              <span className='text-[10px] sm:text-xs text-slate-400 font-medium'>
                                {p.name}
                              </span>
                            </div>
                          </label>
                        ))}
                    </div>
                  )}
                  {key === 'property' && formData.target_type === 'property' && (
                    <div className='max-h-36 overflow-y-auto space-y-1 p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10'>
                      {properties.map((p) => (
                        <label
                          key={p.id}
                          className='flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-all'
                        >
                          <input
                            type='checkbox'
                            checked={formData.target_value.includes(p.id)}
                            onChange={(e) => {
                              const newValues = e.target.checked
                                ? [...formData.target_value, p.id]
                                : formData.target_value.filter((id) => id !== p.id);
                              setFormData((prev) => ({ ...prev, target_value: newValues }));
                            }}
                            className='w-4 h-4 rounded border-slate-300 dark:border-white/20 text-primary focus:ring-primary'
                          />
                          <span className='text-xs sm:text-sm font-bold text-slate-900 dark:text-white'>
                            {p.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Expiration */}
            <div className='space-y-2'>
              <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                Expiração
              </Label>
              {[
                {
                  key: 'time' as const,
                  icon: CalendarDays,
                  label: 'Por tempo',
                  desc: 'Desaparece após um período',
                },
                {
                  key: 'views' as const,
                  icon: Eye,
                  label: 'Ao visualizar',
                  desc: 'Some quando todos virem',
                },
              ].map(({ key, icon: Icon, label, desc }) => (
                <div key={key} className='space-y-1'>
                  <button
                    onClick={() => setFormData((prev) => ({ ...prev, expire_mode: key }))}
                    className={`w-full text-left bg-slate-50 dark:bg-white/5 rounded-2xl border transition-all group ${
                      formData.expire_mode === key
                        ? 'border-primary shadow-sm'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-white/10'
                    }`}
                  >
                    <div className='p-3 sm:p-4 flex items-center gap-3 sm:gap-4'>
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          formData.expire_mode === key
                            ? 'bg-primary/10 text-primary'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                        }`}
                      >
                        <Icon size={16} className='sm:w-5 sm:h-5' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                          {label}
                        </h4>
                        <p className='text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5'>
                          {desc}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          formData.expire_mode === key
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-slate-200 dark:bg-white/10 text-transparent group-hover:text-slate-400'
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </div>
                  </button>
                  {key === 'time' && formData.expire_mode === 'time' && (
                    <div className='pl-14'>
                      <select
                        value={formData.expires_in_days}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, expires_in_days: e.target.value }))
                        }
                        className='w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-100 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:border-primary/40 focus:ring-4 ring-primary/5 transition-all outline-none'
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value='1' style={{ background: '#fff', color: '#0f172a' }}>
                          1 dia
                        </option>
                        <option value='3' style={{ background: '#fff', color: '#0f172a' }}>
                          3 dias
                        </option>
                        <option value='7' style={{ background: '#fff', color: '#0f172a' }}>
                          7 dias
                        </option>
                        <option value='15' style={{ background: '#fff', color: '#0f172a' }}>
                          15 dias
                        </option>
                        <option value='30' style={{ background: '#fff', color: '#0f172a' }}>
                          30 dias
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className='flex justify-end pt-2 pb-8'>
              <button
                onClick={handleSubmit}
                disabled={saving || !canSubmit}
                className='px-6 py-3 sm:px-8 sm:py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2'
              >
                {saving ? (
                  <div className='w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full' />
                ) : (
                  <>
                    <Send size={14} /> Enviar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : mode === 'history' ? (
        /* ── History Inline ──────────────────────────── */
        <div className='flex-1 overflow-hidden'>
          {user && (
            <AnnouncementsHistoryModal
              isOpen={true}
              onClose={() => setMode('list')}
              ownerId={user.id}
              onDuplicate={(ann) => {
                setMode('create');
                setFormData({
                  title: ann.title,
                  content: ann.content,
                  type: ann.type,
                  target_type: ann.target_type,
                  target_value: [],
                  condo_name: '',
                  expire_mode: 'time',
                  expires_in_days: '1',
                  is_urgent: ann.is_urgent || false,
                });
                setStep(1);
              }}
              inline
            />
          )}
        </div>
      ) : (
        /* ── List View ────────────────────────────────── */
        <>
          {/* Tabs */}
          <div className='flex gap-1 px-4 md:px-6 pt-3 pb-1'>
            <button
              onClick={() => setPage(0)}
              className='px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-sm'
            >
              Comunicados Ativos
              {announcements.length > 0 && (
                <span className='ml-2 text-xs opacity-80'>({announcements.length})</span>
              )}
            </button>
            <button
              onClick={() => setMode('history')}
              className='px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all'
            >
              Histórico
            </button>
          </div>

          <div className='flex-1 overflow-y-auto px-4 md:px-6 py-4 custom-scrollbar'>
            {loading ? (
              <div className='flex items-center justify-center h-40'>
                <div className='w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin' />
              </div>
            ) : announcements.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full gap-4 py-20 text-center'>
                <div className='w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground'>
                  <BellOff size={24} />
                </div>
                <div>
                  <p className='text-sm font-semibold text-foreground'>Nenhum comunicado ativo</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Todos os comunicados foram resolvidos ou expiraram.
                  </p>
                </div>
                {isOwner && (
                  <Button
                    onClick={startCreate}
                    variant='default'
                    size='sm'
                    className='rounded-2xl text-xs font-semibold'
                  >
                    <Plus size={14} /> Criar Comunicado
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className='space-y-3'>
                  {paginatedAnnouncements.map((ann) => {
                    const meta = TYPE_META[ann.type] ?? TYPE_META.info;
                    const targetMeta = TARGET_META[ann.target_type] ?? TARGET_META.all;
                    return (
                      <LiquidGlassCard
                        key={ann.id}
                        className='w-full cursor-default'
                      >
                        <div className='flex gap-3 p-4'>
                        <div
                          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border bg-muted border-border ${meta.color}`}
                        >
                          {meta.icon}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between gap-2'>
                            <h3 className='text-sm font-semibold text-foreground leading-tight'>
                              {ann.is_urgent && (
                                <span className='inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5 align-middle' />
                              )}
                              {ann.title}
                            </h3>
                            {ann.is_urgent && (
                              <Badge variant='destructive' className='shrink-0'>
                                <Zap size={10} /> Urgente
                              </Badge>
                            )}
                          </div>
                          <p className='mt-1.5 text-sm text-muted-foreground line-clamp-2 group-hover/row:line-clamp-none transition-all'>
                            {ann.content}
                          </p>
                          {(ann as any).acao_pendente && (
                            <Button
                              onClick={(e) => handleAction(e, (ann as any).acao_pendente.endpoint)}
                              variant='outline'
                              size='sm'
                              className='mt-2 w-full text-xs font-semibold rounded-lg'
                            >
                              {(ann as any).acao_pendente.label}
                            </Button>
                          )}
                          <div className='flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 pt-2 border-t border-border/50'>
                            <div className='flex items-center gap-1 text-[11px] text-muted-foreground'>
                              <Calendar size={11} />
                              {new Date(ann.created_at).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            {ann.expires_at && (
                              <div className='flex items-center gap-1 text-[11px] text-muted-foreground'>
                                <CalendarDays size={11} /> Expira{' '}
                                {new Date(ann.expires_at).toLocaleString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                            <Badge variant='outline' className={`text-[10px] ${meta.color}`}>
                              {meta.icon} {meta.label}
                            </Badge>
                            <span className='inline-flex items-center gap-1 text-[11px] text-muted-foreground'>
                              {targetMeta.icon} {targetMeta.label}
                            </span>
                            {ann.views_count != null && (
                              <span className='inline-flex items-center gap-1 text-[11px] text-muted-foreground'>
                                <Eye size={12} /> {ann.views_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      </LiquidGlassCard>
                    );
                  })}
                </div>

                {urgentCount > 0 && (
                  <div className='mt-4 flex items-center gap-2'>
                    <Badge variant='destructive'>
                      <Zap size={10} /> {urgentCount} urgente{urgentCount !== 1 ? 's' : ''}
                    </Badge>
                    <span className='text-xs text-muted-foreground'>
                      {announcements.length} comunicado{announcements.length !== 1 ? 's' : ''} ativo
                      {announcements.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </>
            )}

            {totalPages > 1 && (
              <div className='flex items-center justify-center gap-3 mt-6 pb-4'>
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className='w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-20 disabled:pointer-events-none'
                >
                  <ChevronRight size={16} className='rotate-180' />
                </button>
                <div className='flex gap-1.5'>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === page ? 'bg-primary w-6' : 'bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40'}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className='w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-20 disabled:pointer-events-none'
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GovernanceHub;
