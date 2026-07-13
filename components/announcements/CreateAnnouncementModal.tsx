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
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { announcementService } from '../../services/announcementService';
import { AnnouncementType, AnnouncementTargetType, Property } from '../../types';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';

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

interface AnnouncementTemplate {
  id?: string;
  title: string;
  content: string;
  type: AnnouncementType;
}

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onSuccess?: () => void;
  initialData?: AnnouncementTemplate | null;
}

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\[([A-ZÁ-Ú]+)\]/g);
  return [...new Set(matches || [])];
}

const STEPS = ['Modelo', 'Conteúdo', 'Destino'];

const announcementTypes = [
  { value: 'info' as AnnouncementType, label: 'Informativo', icon: Info },
  { value: 'maintenance' as AnnouncementType, label: 'Manutenção', icon: Clock },
  { value: 'warning' as AnnouncementType, label: 'Alerta', icon: AlertTriangle },
  { value: 'event' as AnnouncementType, label: 'Evento', icon: CheckCircle2 },
];

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

  const [templates, setTemplates] = useState<AnnouncementTemplate[]>([]);
  const [templatesError, setTemplatesError] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

  React.useEffect(() => {
    announcementService
      .getTemplates()
      .then((data) => setTemplates(data as AnnouncementTemplate[]))
      .catch(() => setTemplatesError(true));
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setStep(initialData ? 1 : 0);
      setPage(0);
      if (initialData) {
        setFormData((prev) => ({
          ...prev,
          title: initialData.title || '',
          content: initialData.content || '',
          type: initialData.type || 'info',
        }));
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
    new Set(properties.map((p) => p.address.split(',')[0].split('-')[0].trim()))
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

      let targetValue: { ids?: string[]; name?: string } | null = null;
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
      resetForm();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Erro ao criar comunicado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(0);
    setPage(0);
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
  };

  const fillTemplate = (tpl: AnnouncementTemplate) => {
    setFormData((prev) => ({ ...prev, title: tpl.title, content: tpl.content, type: tpl.type }));
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

  const canAdvanceToStep2 =
    formData.title.trim() && formData.content.trim() && !hasUnfilledPlaceholders;
  const canSubmit =
    step === 2 &&
    (!['property', 'individual'].includes(formData.target_type) ||
      formData.target_value.length > 0);

  type Action = 'prev' | 'next';
  const handleAction = (action: Action) => {
    if (action === 'next') {
      if (step === 1) setStep(2);
      else handleSubmit();
    } else {
      if (step === 2) setStep(1);
      else if (step === 1) setStep(0);
    }
  };

  if (!isOpen) return null;

  const totalPages = Math.ceil(templates.length / ITEMS_PER_PAGE);

  return (
    <div className='fixed inset-0 z-[100] flex items-end sm:items-center justify-center'>
      <div className='fixed inset-0 bg-black/40' onClick={onClose} />
      <div className='relative w-full sm:max-w-3xl max-h-[90vh] bg-background rounded-t-2xl sm:rounded-2xl shadow-lg border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300 motion-reduce:animate-none motion-reduce:duration-0'>
        <div className='h-px bg-border shrink-0' />

        <div className='px-6 pt-4 pb-2 border-b border-border flex items-center justify-between shrink-0'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
              <Megaphone size={16} />
            </div>
            <div>
              <h2 className='text-sm font-semibold text-foreground'>Novo Comunicado</h2>
              <div className='flex items-center gap-1.5'>
                {STEPS.map((label, i) => (
                  <React.Fragment key={label}>
                    {i > 0 && (
                      <div className={`w-3 h-px ${i <= step ? 'bg-primary' : 'bg-border'}`} />
                    )}
                    <span
                      className={`text-[10px] ${i === step ? 'font-semibold text-foreground' : i < step ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}
                    >
                      {label}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground'
            aria-label='Fechar'
          >
            <X size={18} />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto min-h-0'>
          <div className='px-6 py-3 space-y-4'>
            {step === 0 && (
              <div className='space-y-5'>
                <p className='text-sm text-muted-foreground'>Escolha um modelo ou comece do zero</p>

                {templatesError ? (
                  <div className='p-6 text-center text-sm text-muted-foreground bg-muted/30 rounded-2xl border border-border'>
                    Não foi possível carregar os modelos.
                  </div>
                ) : templates.length === 0 ? (
                  <div className='p-6 text-center text-sm text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border'>
                    Nenhum modelo disponível.
                  </div>
                ) : (
                  <>
                    <div className='grid gap-3 grid-cols-1 sm:grid-cols-2'>
                      {templates
                        .slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)
                        .map((tpl, i) => {
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
                              className='text-left w-full p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all space-y-2 group'
                            >
                              <div className='flex items-center gap-2'>
                                <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                                <span className='text-sm font-medium text-foreground'>
                                  {tpl.title}
                                </span>
                                <span className='ml-auto text-xs text-muted-foreground/40 group-hover:text-primary transition-colors'>
                                  Usar &rarr;
                                </span>
                              </div>
                              <p className='text-sm text-muted-foreground leading-relaxed line-clamp-2'>
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
                          className='w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-all disabled:opacity-20 disabled:pointer-events-none'
                        >
                          <ChevronRight size={14} className='rotate-180' />
                        </button>
                        <div className='flex gap-1'>
                          {Array.from({ length: totalPages }, (_, i) => (
                            <button
                              key={i}
                              onClick={() => setPage(i)}
                              className={`h-1.5 rounded-full transition-all duration-300 ${i === page ? 'bg-primary w-5' : 'bg-muted w-1.5 hover:bg-muted-foreground/30'}`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                          disabled={page === totalPages - 1}
                          className='w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-all disabled:opacity-20 disabled:pointer-events-none'
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </>
                )}

                <div className='flex justify-center'>
                  <button
                    onClick={() => {
                      setPage(0);
                      setStep(1);
                    }}
                    className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
                  >
                    Começar do zero &rarr;
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className='space-y-5'>
                <div className='grid grid-cols-4 gap-2'>
                  {announcementTypes.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setFormData((prev) => ({ ...prev, type: value }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${formData.type === value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/30'}`}
                    >
                      <Icon size={20} strokeWidth={formData.type === value ? 2.5 : 1.5} />
                      <span className='text-xs font-medium'>{label}</span>
                    </button>
                  ))}
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='ann-title' className='text-sm font-medium'>
                    Título do Aviso
                  </Label>
                  <Input
                    id='ann-title'
                    placeholder='Ex: Manutenção no Elevador'
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='ann-content' className='text-sm font-medium'>
                    Mensagem
                  </Label>
                  <textarea
                    id='ann-content'
                    placeholder='Descreva os detalhes para os inquilinos...'
                    rows={4}
                    value={resolvedContent}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, content: e.target.value }));
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
                    className='w-full bg-muted border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground resize-none'
                  />
                  {foundPlaceholders.length > 0 && (
                    <div className='mt-3 space-y-3 rounded-xl border border-border bg-muted/40 p-4'>
                      <p className='text-sm font-medium text-muted-foreground'>
                        Preencha os campos para substituir automaticamente
                      </p>
                      {foundPlaceholders.map((key) => {
                        const meta = PLACEHOLDER_META[key];
                        if (!meta) return null;
                        const isDate = key === '[DATA]';
                        const isTime = key === '[HORA]';
                        const inputValue = isDate
                          ? placeholderValues[key]?.split('/').reverse().join('-') || ''
                          : placeholderValues[key] || '';
                        return (
                          <div key={key} className='space-y-1'>
                            <Label className='text-sm text-foreground flex items-center gap-1.5'>
                              {meta.icon} {meta.label}
                            </Label>
                            {isDate || isTime ? (
                              <input
                                type={isDate ? 'date' : 'time'}
                                value={inputValue}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handlePlaceholderChange(
                                    key,
                                    isDate ? val.split('-').reverse().join('/') : val
                                  );
                                }}
                                className='w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary transition-all outline-none [color-scheme:light] dark:[color-scheme:dark]'
                              />
                            ) : (
                              <Input
                                placeholder={meta.placeholder}
                                value={placeholderValues[key] || ''}
                                onChange={(e) => handlePlaceholderChange(key, e.target.value)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className='flex items-center justify-between p-4 rounded-xl border border-border'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-destructive'>
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-foreground'>Marcar como Urgente</p>
                      <p className='text-xs text-muted-foreground'>
                        O aviso ganhará destaque visual para os inquilinos
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_urgent}
                    onCheckedChange={(v) => setFormData((prev) => ({ ...prev, is_urgent: v }))}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label className='text-sm font-medium'>Público Alvo</Label>
                  <div className='space-y-1'>
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
                      <React.Fragment key={key}>
                        <button
                          onClick={() => setFormData((prev) => ({ ...prev, target_type: key }))}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${formData.target_type === key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${formData.target_type === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                          >
                            <Icon size={18} />
                          </div>
                          <div className='text-left'>
                            <p className='text-sm font-medium text-foreground'>{label}</p>
                            <p className='text-xs text-muted-foreground'>{desc}</p>
                          </div>
                        </button>
                        {key === 'condominium' && formData.target_type === 'condominium' && (
                          <div className='relative pl-14'>
                            <select
                              value={formData.condo_name}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, condo_name: e.target.value }))
                              }
                              className='w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground appearance-none cursor-pointer focus:border-primary transition-all outline-none'
                            >
                              <option value=''>Selecionar Condomínio...</option>
                              {condominiums.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground'>
                              <ChevronRight size={14} className='rotate-90' />
                            </div>
                          </div>
                        )}
                        {key === 'individual' && formData.target_type === 'individual' && (
                          <div className='max-h-36 overflow-y-auto space-y-1 p-2 bg-muted/40 rounded-xl border border-border'>
                            {properties
                              .filter((p) => p.tenant)
                              .map((p) => (
                                <label
                                  key={p.tenant!.id}
                                  className='flex items-center gap-2 p-2 hover:bg-accent rounded-lg cursor-pointer transition-all'
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
                                    className='w-4 h-4 rounded border-muted-foreground/30 text-primary focus:ring-primary'
                                  />
                                  <div className='flex flex-col'>
                                    <span className='text-sm font-medium text-foreground'>
                                      {p.tenant!.name}
                                    </span>
                                    <span className='text-xs text-muted-foreground'>{p.name}</span>
                                  </div>
                                </label>
                              ))}
                            {properties.filter((p) => p.tenant).length === 0 && (
                              <div className='p-4 text-center text-sm text-muted-foreground italic'>
                                Nenhum imóvel alugado no momento
                              </div>
                            )}
                          </div>
                        )}
                        {key === 'property' && formData.target_type === 'property' && (
                          <div className='max-h-36 overflow-y-auto space-y-1 p-2 bg-muted/40 rounded-xl border border-border'>
                            {properties.map((p) => (
                              <label
                                key={p.id}
                                className='flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer transition-all'
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
                                  className='w-4 h-4 rounded border-muted-foreground/30 text-primary focus:ring-primary'
                                />
                                <span className='text-sm text-foreground'>{p.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-sm font-medium'>Expiração</Label>
                  <div className='space-y-1'>
                    {[
                      {
                        key: 'time' as 'time',
                        icon: CalendarDays,
                        label: 'Por tempo',
                        desc: 'Desaparece após um período',
                      },
                      {
                        key: 'views' as 'views',
                        icon: Eye,
                        label: 'Ao visualizar',
                        desc: 'Some quando todos os inquilinos alvo virem',
                      },
                    ].map(({ key, icon: Icon, label, desc }) => (
                      <React.Fragment key={key}>
                        <button
                          onClick={() => setFormData((prev) => ({ ...prev, expire_mode: key }))}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${formData.expire_mode === key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${formData.expire_mode === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                          >
                            <Icon size={18} />
                          </div>
                          <div className='text-left'>
                            <p className='text-sm font-medium text-foreground'>{label}</p>
                            <p className='text-xs text-muted-foreground'>{desc}</p>
                          </div>
                        </button>
                        {key === 'time' && formData.expire_mode === 'time' && (
                          <div className='relative pl-14'>
                            <select
                              value={formData.expires_in_days}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  expires_in_days: e.target.value,
                                }))
                              }
                              className='w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground appearance-none cursor-pointer focus:border-primary transition-all outline-none'
                            >
                              <option value='1'>1 dia</option>
                              <option value='3'>3 dias</option>
                              <option value='7'>7 dias</option>
                              <option value='15'>15 dias</option>
                              <option value='30'>30 dias</option>
                            </select>
                            <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground'>
                              <ChevronRight size={14} className='rotate-90' />
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='px-6 py-3 border-t border-border flex items-center justify-between bg-muted/20 shrink-0'>
          <div>
            {step > 0 && (
              <button
                onClick={() => handleAction('prev')}
                className='flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all'
              >
                <ArrowLeft size={14} /> Voltar
              </button>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {step === 2 && (
              <button
                onClick={onClose}
                className='px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all'
              >
                Cancelar
              </button>
            )}
            <button
              onClick={() => handleAction('next')}
              disabled={loading || (step === 1 && !canAdvanceToStep2) || (step === 2 && !canSubmit)}
              className='px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-md hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40 disabled:active:scale-100 flex items-center gap-2'
            >
              {loading ? (
                <div className='w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full' />
              ) : step === 2 ? (
                <>
                  <Send size={14} /> Enviar
                </>
              ) : (
                'Continuar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;
