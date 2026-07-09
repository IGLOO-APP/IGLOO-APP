import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Send,
  Megaphone,
  Home,
  Building2,
  Users,
  User,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
  ChevronRight,
  Eye,
  CalendarDays,
  MapPin,
  Calendar,
  Clock as ClockIcon,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { announcementService } from '../../services/announcementService';
import { AnnouncementType, AnnouncementTargetType, Property } from '../../types';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const PLACEHOLDER_META: Record<
  string,
  { label: string; icon: React.ReactNode; placeholder: string }
> = {
  '[LOCAL]': {
    label: 'Local',
    icon: <MapPin size={14} />,
    placeholder: 'Ex: Elevador, Salão de Festas...',
  },
  '[DATA]': { label: 'Data', icon: <Calendar size={14} />, placeholder: 'Ex: 15/07/2026' },
  '[HORA]': { label: 'Horário', icon: <ClockIcon size={14} />, placeholder: 'Ex: 14:00' },
  '[ASSUNTO]': {
    label: 'Assunto',
    icon: <FileText size={14} />,
    placeholder: 'Ex: Reforma do salão',
  },
};

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onSuccess?: () => void;
  initialData?: any;
}

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\[([A-ZÁ-Ú]+)\]/g);
  return [...new Set(matches || [])];
}

const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({
  isOpen,
  onClose,
  properties,
  onSuccess,
  initialData,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 4;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as AnnouncementType,
    target_type: 'all' as AnnouncementTargetType,
    target_value: [] as string[],
    condo_name: '',
    expire_mode: 'time' as 'time' | 'views',
    expires_in_days: '7',
    is_urgent: false,
  });

  const [templates, setTemplates] = useState<any[]>([]);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

  React.useEffect(() => {
    announcementService.getTemplates().then(setTemplates);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setStep(initialData ? 1 : 0);
      setPage(0);
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          content: initialData.content || '',
          type: initialData.type || 'info',
          target_type: initialData.target_type || 'all',
          target_value: initialData.target_value?.ids || [],
          condo_name: initialData.target_value?.name || '',
          expire_mode: 'time',
          expires_in_days: '7',
          is_urgent: initialData.is_urgent || false,
        });
        setStep(1);
      } else {
        setFormData({
          title: '',
          content: '',
          type: 'info',
          target_type: 'all',
          target_value: [],
          condo_name: '',
          expire_mode: 'time',
          expires_in_days: '7',
          is_urgent: false,
        });
      }
    }
  }, [initialData, isOpen]);

  const condominiums = Array.from(
    new Set(
      properties.map((p) => {
        return p.address.split(',')[0].split('-')[0].trim();
      })
    )
  ).filter(Boolean);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let expiresAt: string | undefined;
      if (formData.expire_mode === 'time') {
        const d = new Date();
        d.setDate(d.getDate() + parseInt(formData.expires_in_days));
        expiresAt = d.toISOString();
      }

      let targetValue = null;
      if (formData.target_type === 'property' || formData.target_type === 'individual') {
        targetValue = { ids: formData.target_value };
      } else if (formData.target_type === 'condominium') {
        targetValue = { name: formData.condo_name };
      }

      await announcementService.create({
        owner_id: user.id,
        title: formData.title,
        content: resolvedContent,
        type: formData.type,
        target_type: formData.target_type,
        target_value: targetValue,
        expires_at: expiresAt,
        is_urgent: formData.is_urgent,
      });

      onSuccess?.();
      onClose();
      setStep(0);
      setFormData({
        title: '',
        content: '',
        type: 'info',
        target_type: 'all',
        target_value: [],
        condo_name: '',
        expire_mode: 'time',
        expires_in_days: '7',
        is_urgent: false,
      });
      setPlaceholderValues({});
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Erro ao criar comunicado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fillTemplate = (tpl: any) => {
    setFormData({ ...formData, title: tpl.title, content: tpl.content, type: tpl.type });
    const keys = extractPlaceholders(tpl.content);
    const vals: Record<string, string> = {};
    keys.forEach((k) => (vals[k] = placeholderValues[k] || ''));
    setPlaceholderValues(vals);
  };

  const foundPlaceholders = useMemo(
    () => extractPlaceholders(formData.content),
    [formData.content]
  );

  const resolvedContent = useMemo(() => {
    let text = formData.content;
    for (const key of foundPlaceholders) {
      if (placeholderValues[key]) {
        text = text.split(key).join(placeholderValues[key]);
      }
    }
    return text;
  }, [formData.content, foundPlaceholders, placeholderValues]);

  const hasUnfilledPlaceholders = foundPlaceholders.some((k) => !placeholderValues[k]?.trim());

  const handlePlaceholderChange = useCallback((key: string, value: string) => {
    setPlaceholderValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  if (!isOpen) return null;

  const totalPages = Math.ceil(templates.length / ITEMS_PER_PAGE);

  const templateSelection = (
    <div className='space-y-4'>
      <div className='text-center space-y-1.5'>
        <p className='text-sm font-bold text-foreground'>Escolha um modelo pronto</p>
        <p className='text-xs text-muted-foreground'>Você poderá editar o conteúdo depois</p>
      </div>
      <div className='grid gap-3 grid-cols-1 sm:grid-cols-2'>
        {templates.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE).map((tpl, i) => {
          const dotColor =
            tpl.type === 'maintenance'
              ? 'bg-amber-400'
              : tpl.type === 'warning'
                ? 'bg-red-400'
                : tpl.type === 'event'
                  ? 'bg-emerald-400'
                  : 'bg-primary';
          return (
            <button
              key={i}
              onClick={() => {
                fillTemplate(tpl);
                setStep(1);
              }}
              className='text-left w-full p-4 rounded-2xl bg-white dark:bg-surface-dark border border-border hover:border-primary/40 hover:shadow-md transition-all ring-1 ring-inset ring-transparent hover:ring-primary/20 space-y-2'
            >
              <div className='flex items-center gap-2'>
                <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                <span className='text-sm font-bold text-foreground'>{tpl.title}</span>
                <span className='ml-auto text-[10px] text-muted-foreground uppercase tracking-wider font-medium'>
                  Usar →
                </span>
              </div>
              <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>
                {tpl.content}
              </p>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2'>
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className='w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-20 disabled:pointer-events-none'
          >
            <span className='rotate-180 inline-block'>
              <ChevronRight size={14} />
            </span>
          </button>
          <div className='flex gap-1'>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === page
                    ? 'bg-primary w-4'
                    : 'bg-slate-200 dark:bg-white/10 w-1.5 hover:bg-slate-300 dark:hover:bg-white/20'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className='w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-20 disabled:pointer-events-none'
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      <div className='flex justify-center'>
        <button
          onClick={() => {
            setPage(0);
            setStep(1);
          }}
          className='text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2'
        >
          Começar do zero
        </button>
      </div>
    </div>
  );

  const step1Form = (
    <div className='space-y-5'>
      {/* Type Selection */}
      <div className='grid grid-cols-4 gap-2.5'>
        {(['info', 'maintenance', 'warning', 'event'] as AnnouncementType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFormData({ ...formData, type: t })}
            className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 transition-all ${
              formData.type === t
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:border-muted-foreground/30'
            }`}
          >
            {t === 'info' && <Info size={18} />}
            {t === 'maintenance' && <Clock size={18} />}
            {t === 'warning' && <AlertTriangle size={18} />}
            {t === 'event' && <CheckCircle2 size={18} />}
            <span className='text-[10px] font-black uppercase tracking-widest'>
              {t === 'maintenance' ? 'Sistema' : t}
            </span>
          </button>
        ))}
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='ann-title'>Título do Aviso</Label>
        <Input
          id='ann-title'
          placeholder='Ex: Manutenção no Elevador'
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1'>
          Mensagem
        </label>
        <textarea
          placeholder='Descreva os detalhes para os inquilinos...'
          rows={4}
          value={resolvedContent}
          onChange={(e) => {
            setFormData({ ...formData, content: e.target.value });
            const keys = extractPlaceholders(e.target.value);
            setPlaceholderValues((prev) => {
              const next = { ...prev };
              Object.keys(next).forEach((k) => {
                if (!keys.includes(k)) delete next[k];
              });
              keys.forEach((k) => {
                if (!(k in next)) next[k] = '';
              });
              return next;
            });
          }}
          className='w-full bg-muted border-2 border-transparent focus:border-primary rounded-2xl px-5 py-3.5 text-sm font-semibold text-foreground transition-all outline-none placeholder:text-muted-foreground resize-none'
        />
      </div>

      {foundPlaceholders.length > 0 && (
        <div className='space-y-4 rounded-xl border border-border bg-muted/50 p-4'>
          <p className='text-xs font-medium text-muted-foreground'>
            Preencha para substituir automaticamente no texto
          </p>
          {foundPlaceholders.map((key) => {
            const meta = PLACEHOLDER_META[key];
            if (!meta) return null;
            return (
              <div key={key} className='space-y-1.5'>
                <Label className='text-xs font-medium text-foreground flex items-center gap-1.5'>
                  {meta.icon} {meta.label}
                </Label>
                <Input
                  placeholder={meta.placeholder}
                  value={placeholderValues[key] || ''}
                  onChange={(e) => handlePlaceholderChange(key, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Urgent Toggle */}
      <div
        onClick={() => setFormData({ ...formData, is_urgent: !formData.is_urgent })}
        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
          formData.is_urgent
            ? 'border-red-500 bg-red-500/5'
            : 'border-border hover:border-muted-foreground/30'
        }`}
      >
        <div className='flex items-center gap-3'>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.is_urgent ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}
          >
            <AlertTriangle size={16} />
          </div>
          <div>
            <p
              className={`text-xs font-black uppercase tracking-widest ${formData.is_urgent ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}
            >
              Marcar como Urgente
            </p>
            <p className='text-[10px] text-slate-400 font-medium'>
              O aviso ganhará destaque visual e pulsação
            </p>
          </div>
        </div>
        <div
          className={`w-12 h-6 rounded-full relative transition-all ${formData.is_urgent ? 'bg-red-500' : 'bg-muted'}`}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_urgent ? 'left-7' : 'left-1'}`}
          />
        </div>
      </div>
    </div>
  );

  const step2Content = (
    <div className='space-y-6'>
      {/* Target Selection */}
      <div className='space-y-3'>
        <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1'>
          Público Alvo
        </label>

        <button
          onClick={() => setFormData({ ...formData, target_type: 'all' })}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
            formData.target_type === 'all'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground/30'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.target_type === 'all' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            <Users size={20} />
          </div>
          <div className='text-left'>
            <p className='text-sm font-black text-slate-900 dark:text-white'>Todos os inquilinos</p>
            <p className='text-[10px] text-slate-400 font-bold'>
              Enviar para todos as unidades ativas
            </p>
          </div>
        </button>

        <button
          onClick={() => setFormData({ ...formData, target_type: 'condominium' })}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
            formData.target_type === 'condominium'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground/30'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.target_type === 'condominium' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
          >
            <Building2 size={20} />
          </div>
          <div className='text-left'>
            <p className='text-sm font-black text-slate-900 dark:text-white'>Por Condomínio</p>
            <p className='text-[10px] text-slate-400 font-bold'>
              Agrupar imóveis no mesmo endereço
            </p>
          </div>
        </button>

        <button
          onClick={() => setFormData({ ...formData, target_type: 'individual' })}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
            formData.target_type === 'individual'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground/30'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.target_type === 'individual' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
          >
            <User size={20} />
          </div>
          <div className='text-left'>
            <p className='text-sm font-black text-slate-900 dark:text-white'>
              Inquilino Específico
            </p>
            <p className='text-[10px] text-slate-400 font-bold'>Enviar apenas para uma pessoa</p>
          </div>
        </button>

        {formData.target_type === 'condominium' && (
          <div className='relative animate-slideDown'>
            <select
              value={formData.condo_name}
              onChange={(e) => setFormData({ ...formData, condo_name: e.target.value })}
              className='w-full bg-muted border-2 border-border rounded-2xl px-5 py-4 text-sm font-bold text-foreground appearance-none cursor-pointer focus:border-primary transition-all outline-none'
            >
              <option value='' className='bg-white dark:bg-slate-900'>
                Selecionar Condomínio...
              </option>
              {condominiums.map((c) => (
                <option key={c} value={c} className='bg-white dark:bg-slate-900'>
                  {c}
                </option>
              ))}
            </select>
            <div className='absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400'>
              <ChevronRight size={18} className='rotate-90' />
            </div>
          </div>
        )}

        {formData.target_type === 'individual' && (
          <div className='max-h-40 overflow-y-auto space-y-2 p-2 bg-muted/50 rounded-2xl border border-border animate-slideDown'>
            {properties
              .filter((p) => p.tenant)
              .map((p) => (
                <label
                  key={p.tenant!.id}
                  className='flex items-center gap-3 p-3 hover:bg-accent rounded-xl cursor-pointer transition-all border border-transparent hover:border-primary/20'
                >
                  <input
                    type='checkbox'
                    checked={formData.target_value.includes(p.tenant!.id)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...formData.target_value, p.tenant!.id]
                        : formData.target_value.filter((id) => id !== p.tenant!.id);
                      setFormData({ ...formData, target_value: newValues });
                    }}
                    className='w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary'
                  />
                  <div className='flex flex-col'>
                    <span className='text-xs font-bold text-slate-900 dark:text-white'>
                      {p.tenant!.name}
                    </span>
                    <span className='text-[10px] text-slate-400 uppercase font-black tracking-tight'>
                      {p.name}
                    </span>
                  </div>
                </label>
              ))}
            {properties.filter((p) => p.tenant).length === 0 && (
              <div className='p-4 text-center text-[10px] font-bold text-slate-400 uppercase italic'>
                Nenhum imóvel alugado no momento
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setFormData({ ...formData, target_type: 'property' })}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
            formData.target_type === 'property'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground/30'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.target_type === 'property' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
          >
            <Home size={20} />
          </div>
          <div className='text-left'>
            <p className='text-sm font-black text-slate-900 dark:text-white'>Imóveis Específicos</p>
            <p className='text-[10px] text-slate-400 font-bold'>Selecionar unidades manualmente</p>
          </div>
        </button>

        {formData.target_type === 'property' && (
          <div className='max-h-40 overflow-y-auto space-y-2 p-2 bg-muted/50 rounded-2xl border border-border'>
            {properties.map((p) => (
              <label
                key={p.id}
                className='flex items-center gap-3 p-2 hover:bg-accent rounded-xl cursor-pointer transition-all'
              >
                <input
                  type='checkbox'
                  checked={formData.target_value.includes(p.id)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...formData.target_value, p.id]
                      : formData.target_value.filter((id) => id !== p.id);
                    setFormData({ ...formData, target_value: newValues });
                  }}
                  className='w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary'
                />
                <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                  {p.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Expiration */}
      <div>
        <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1'>
          Expiração do Comunicado
        </label>

        <div className='space-y-2'>
          <button
            onClick={() => setFormData({ ...formData, expire_mode: 'time' })}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
              formData.expire_mode === 'time'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.expire_mode === 'time' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
            >
              <CalendarDays size={20} />
            </div>
            <div className='flex-1 text-left'>
              <p className='text-sm font-black text-slate-900 dark:text-white'>Por tempo</p>
              <p className='text-[10px] text-slate-400 font-bold'>
                O comunicado desaparece após um período
              </p>
            </div>
          </button>

          {formData.expire_mode === 'time' && (
            <div className='relative animate-slideDown pl-14'>
              <select
                value={formData.expires_in_days}
                onChange={(e) => setFormData({ ...formData, expires_in_days: e.target.value })}
                className='w-full bg-muted border-2 border-border rounded-2xl px-5 py-4 text-sm font-bold text-foreground appearance-none cursor-pointer focus:border-primary transition-all outline-none'
              >
                <option value='1' className='bg-white dark:bg-slate-900'>
                  1 dia
                </option>
                <option value='3' className='bg-white dark:bg-slate-900'>
                  3 dias
                </option>
                <option value='7' className='bg-white dark:bg-slate-900'>
                  7 dias
                </option>
                <option value='15' className='bg-white dark:bg-slate-900'>
                  15 dias
                </option>
                <option value='30' className='bg-white dark:bg-slate-900'>
                  30 dias
                </option>
              </select>
              <div className='absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400'>
                <ChevronRight size={18} className='rotate-90' />
              </div>
            </div>
          )}

          <button
            onClick={() => setFormData({ ...formData, expire_mode: 'views' })}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
              formData.expire_mode === 'views'
                ? 'border-primary bg-primary/5'
                : 'border-slate-100 dark:border-white/5 hover:border-slate-200'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.expire_mode === 'views' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
            >
              <Eye size={20} />
            </div>
            <div className='flex-1 text-left'>
              <p className='text-sm font-black text-slate-900 dark:text-white'>Ao visualizar</p>
              <p className='text-[10px] text-slate-400 font-bold'>
                Some depois que todos os inquilinos alvo virem
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6'>
      <div
        className='fixed inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn'
        onClick={onClose}
      />

      <div className='bg-card text-card-foreground w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl border border-border overflow-hidden animate-scaleUp z-10 flex flex-col'>
        {/* Header */}
        <div className='px-6 sm:px-8 py-4 sm:py-6 border-b border-border flex justify-between items-center bg-muted/30'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
              <Megaphone size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className='text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                Novo Comunicado
              </h2>
              <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>
                {step === 0 ? 'Modelo' : `Passo ${step} de 2`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground'
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='overflow-y-auto flex-1 min-h-0'>
          <div className='p-5 sm:p-8'>
            {step === 0 ? templateSelection : step === 1 ? step1Form : step2Content}
          </div>
        </div>

        {/* Footer */}
        {step > 0 && (
          <div className='px-6 sm:px-8 py-4 sm:py-6 bg-muted/30 border-t border-border flex gap-3'>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className='flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all'
              >
                Voltar
              </button>
            )}
            <button
              onClick={() => (step === 1 ? setStep(2) : handleSubmit())}
              disabled={
                loading ||
                !formData.title ||
                !formData.content ||
                hasUnfilledPlaceholders ||
                (step === 2 &&
                  (formData.target_type === 'property' || formData.target_type === 'individual') &&
                  formData.target_value.length === 0)
              }
              className='flex-[2] py-4 px-6 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2'
            >
              {loading ? (
                <div className='w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full' />
              ) : (
                <>
                  {step === 1 ? 'Próximo Passo' : 'Enviar Comunicado'}
                  {step === 2 && <Send size={14} />}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;
