import React, { useState } from 'react';
import { X, Send, Megaphone, Home, Building2, Users, User, AlertTriangle, Info, Clock, CheckCircle2, ChevronRight, LayoutTemplate } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { announcementService } from '../../services/announcementService';
import { AnnouncementType, AnnouncementTargetType, Property } from '../../types';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onSuccess?: () => void;
  initialData?: any;
}

const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({ isOpen, onClose, properties, onSuccess, initialData }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as AnnouncementType,
    target_type: 'all' as AnnouncementTargetType,
    target_value: [] as string[],
    condo_name: '',
    expires_in_days: '7',
    is_urgent: false
  });

  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  React.useEffect(() => {
    announcementService.getTemplates().then(setTemplates);
  }, []);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        type: initialData.type || 'info',
        target_type: initialData.target_type || 'all',
        target_value: initialData.target_value?.ids || [],
        condo_name: initialData.target_value?.name || '',
        expires_in_days: '7',
        is_urgent: initialData.is_urgent || false
      });
      setStep(1); // Start at step 1 for review
    } else {
      // Reset if no initial data
      setFormData({
        title: '',
        content: '',
        type: 'info',
        target_type: 'all',
        target_value: [],
        condo_name: '',
        expires_in_days: '7',
        is_urgent: false
      });
    }
  }, [initialData, isOpen]);

  // Extract unique condominium names from properties (using address for now)
  const condominiums = Array.from(new Set(properties.map(p => {
    // Simple heuristic: get the part of the address before the comma or number
    return p.address.split(',')[0].split('-')[0].trim();
  }))).filter(Boolean);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expires_in_days));

      let targetValue = null;
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
        expires_at: expiresAt.toISOString(),
        is_urgent: formData.is_urgent
      });

      onSuccess?.();
      onClose();
      // Reset form
      setStep(1);
      setFormData({
        title: '',
        content: '',
        type: 'info',
        target_type: 'all',
        target_value: [],
        condo_name: '',
        expires_in_days: '7',
        is_urgent: false
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Erro ao criar comunicado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6'>
      <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn' onClick={onClose} />
      
      <div className='bg-white dark:bg-surface-dark w-full max-w-xl rounded-[32px] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden animate-scaleUp z-10'>
        {/* Header */}
        <div className='px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
              <Megaphone size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className='text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight'>Novo Comunicado</h2>
              <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Passo {step} de 2</p>
            </div>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-400'>
            <X size={20} />
          </button>
        </div>

        {/* Templates Banner */}
        {step === 1 && (
          <div className='px-8 py-3 bg-primary/10 border-b border-primary/10 flex justify-between items-center'>
            <div className='flex items-center gap-2 text-primary'>
              <LayoutTemplate size={14} />
              <span className='text-[10px] font-black uppercase tracking-widest'>Use um modelo pronto para agilizar</span>
            </div>
            <button 
              onClick={() => setShowTemplates(!showTemplates)}
              className='text-[10px] font-black uppercase tracking-widest text-primary hover:underline'
            >
              {showTemplates ? 'Fechar Modelos' : 'Ver Modelos'}
            </button>
          </div>
        )}

        <div className='p-8'>
          {step === 1 ? (
            <div className='space-y-6'>
              {/* Type Selection */}
              <div className='grid grid-cols-4 gap-3'>
                {(['info', 'maintenance', 'warning', 'event'] as AnnouncementType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      formData.type === t 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-slate-100 dark:border-white/5 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {t === 'info' && <Info size={20} />}
                    {t === 'maintenance' && <Clock size={20} />}
                    {t === 'warning' && <AlertTriangle size={20} />}
                    {t === 'event' && <CheckCircle2 size={20} />}
                    <span className='text-[10px] font-black uppercase tracking-widest'>{t === 'maintenance' ? 'Sistema' : t}</span>
                  </button>
                ))}
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1'>Título do Aviso</label>
                  <input
                    type='text'
                    placeholder='Ex: Manutenção no Elevador'
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className='w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-900 dark:text-white transition-all outline-none placeholder:text-slate-400'
                  />
                </div>
                <div>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1'>Mensagem</label>
                  <textarea
                    placeholder='Descreva os detalhes para os inquilinos...'
                    rows={4}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className='w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-900 dark:text-white transition-all outline-none placeholder:text-slate-400 resize-none'
                  />
                </div>

                {/* Urgent Toggle */}
                <div 
                  onClick={() => setFormData({ ...formData, is_urgent: !formData.is_urgent })}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    formData.is_urgent 
                      ? 'border-red-500 bg-red-500/5' 
                      : 'border-slate-100 dark:border-white/5 hover:border-slate-200'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.is_urgent ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-widest ${formData.is_urgent ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>Marcar como Urgente</p>
                      <p className='text-[10px] text-slate-400 font-medium'>O aviso ganhará destaque visual e pulsação</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-all ${formData.is_urgent ? 'bg-red-500' : 'bg-slate-200 dark:bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_urgent ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
              </div>

              {showTemplates && (
                <div className='grid grid-cols-2 gap-3 animate-slideUp'>
                  {templates.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setFormData({ ...formData, title: tpl.title, content: tpl.content, type: tpl.type });
                        setShowTemplates(false);
                      }}
                      className='text-left p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary/50 transition-all group'
                    >
                      <p className='text-[10px] font-black text-primary uppercase tracking-widest mb-1'>{tpl.title}</p>
                      <p className='text-[10px] text-slate-400 line-clamp-2 leading-relaxed'>{tpl.content}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Target Selection */}
              <div className='space-y-3'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1'>Público Alvo</label>
                
                <button
                  onClick={() => setFormData({ ...formData, target_type: 'all' })}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    formData.target_type === 'all' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-slate-100 dark:border-white/5 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.target_type === 'all' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                    <Users size={20} />
                  </div>
                  <div className='text-left'>
                    <p className='text-sm font-black text-slate-900 dark:text-white'>Todos os inquilinos</p>
                    <p className='text-[10px] text-slate-400 font-bold'>Enviar para todos as unidades ativas</p>
                  </div>
                </button>

                <button
                  onClick={() => setFormData({ ...formData, target_type: 'condominium' })}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    formData.target_type === 'condominium' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-slate-100 dark:border-white/5 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.target_type === 'condominium' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                    <Building2 size={20} />
                  </div>
                  <div className='text-left'>
                    <p className='text-sm font-black text-slate-900 dark:text-white'>Por Condomínio</p>
                    <p className='text-[10px] text-slate-400 font-bold'>Agrupar imóveis no mesmo endereço</p>
                  </div>
                </button>

                <button
                  onClick={() => setFormData({ ...formData, target_type: 'individual' })}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    formData.target_type === 'individual' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-slate-100 dark:border-white/5 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.target_type === 'individual' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                    <User size={20} />
                  </div>
                  <div className='text-left'>
                    <p className='text-sm font-black text-slate-900 dark:text-white'>Inquilino Específico</p>
                    <p className='text-[10px] text-slate-400 font-bold'>Enviar apenas para uma pessoa</p>
                  </div>
                </button>

                {formData.target_type === 'condominium' && (
                  <div className="relative animate-slideDown">
                    <select
                      value={formData.condo_name}
                      onChange={(e) => setFormData({ ...formData, condo_name: e.target.value })}
                      className='w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:border-primary transition-all outline-none'
                    >
                      <option value="" className="bg-white dark:bg-slate-900">Selecionar Condomínio...</option>
                      {condominiums.map(c => (
                        <option key={c} value={c} className="bg-white dark:bg-slate-900">{c}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight size={18} className="rotate-90" />
                    </div>
                  </div>
                )}

                {formData.target_type === 'individual' && (
                  <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 animate-slideDown">
                    {properties
                      .filter(p => p.tenant)
                      .map(p => (
                        <label key={p.tenant!.id} className='flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-primary/20'>
                          <input
                            type='checkbox'
                            checked={formData.target_value.includes(p.tenant!.id)}
                            onChange={(e) => {
                              const newValues = e.target.checked 
                                ? [...formData.target_value, p.tenant!.id]
                                : formData.target_value.filter(id => id !== p.tenant!.id);
                              setFormData({ ...formData, target_value: newValues });
                            }}
                            className='w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary'
                          />
                          <div className="flex flex-col">
                            <span className='text-xs font-bold text-slate-900 dark:text-white'>{p.tenant!.name}</span>
                            <span className='text-[10px] text-slate-400 uppercase font-black tracking-tight'>{p.name}</span>
                          </div>
                        </label>
                      ))}
                    {properties.filter(p => p.tenant).length === 0 && (
                      <div className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase italic">
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
                      : 'border-slate-100 dark:border-white/5 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.target_type === 'property' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                    <Home size={20} />
                  </div>
                  <div className='text-left'>
                    <p className='text-sm font-black text-slate-900 dark:text-white'>Imóveis Específicos</p>
                    <p className='text-[10px] text-slate-400 font-bold'>Selecionar unidades manualmente</p>
                  </div>
                </button>

                {formData.target_type === 'property' && (
                  <div className='max-h-40 overflow-y-auto space-y-2 p-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5'>
                    {properties.map(p => (
                      <label key={p.id} className='flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all'>
                        <input
                          type='checkbox'
                          checked={formData.target_value.includes(p.id)}
                          onChange={(e) => {
                            const newValues = e.target.checked 
                              ? [...formData.target_value, p.id]
                              : formData.target_value.filter(id => id !== p.id);
                            setFormData({ ...formData, target_value: newValues });
                          }}
                          className='w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary'
                        />
                        <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>{p.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1'>Duração do Aviso (Dias)</label>
                <div className="relative">
                  <select
                    value={formData.expires_in_days}
                    onChange={(e) => setFormData({ ...formData, expires_in_days: e.target.value })}
                    className='w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:border-primary transition-all outline-none'
                  >
                    <option value='1' className="bg-white dark:bg-slate-900">1 dia</option>
                    <option value='3' className="bg-white dark:bg-slate-900">3 dias</option>
                    <option value='7' className="bg-white dark:bg-slate-900">7 dias</option>
                    <option value='15' className="bg-white dark:bg-slate-900">15 dias</option>
                    <option value='30' className="bg-white dark:bg-slate-900">30 dias</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronRight size={18} className="rotate-90" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='px-8 py-6 bg-slate-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex gap-3'>
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className='flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-all'
            >
              Voltar
            </button>
          )}
            <button
            onClick={() => step === 1 ? setStep(2) : handleSubmit()}
            disabled={loading || !formData.title || !formData.content || (step === 2 && (formData.target_type === 'property' || formData.target_type === 'individual') && formData.target_value.length === 0)}
            className='flex-[2] py-4 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2'
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
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;
