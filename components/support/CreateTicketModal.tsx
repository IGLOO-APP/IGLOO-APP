import React, { useState } from 'react';
import { X, Wrench, DollarSign, HelpCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: {
    subject: string;
    description: string;
    category: string;
    priority: string;
  }) => Promise<void>;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('technical');
  const [priority, setPriority] = useState('Média');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority
      });
      setSubject('');
      setDescription('');
      setCategory('technical');
      setPriority('Média');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { id: 'technical', name: 'Suporte Técnico', icon: Wrench, color: 'text-cyan-500 bg-cyan-500/10' },
    { id: 'billing', name: 'Financeiro', icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'feature_request', name: 'Sugestão', icon: Sparkles, color: 'text-purple-500 bg-purple-500/10' },
    { id: 'bug', name: 'Bug no Sistema', icon: AlertTriangle, color: 'text-rose-500 bg-rose-500/10' },
    { id: 'other', name: 'Outros', icon: HelpCircle, color: 'text-slate-500 bg-slate-500/10' }
  ];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn'>
      <div className='w-full max-w-lg bg-white dark:bg-surface-dark border border-slate-200/60 dark:border-white/5 rounded-[32px] shadow-2xl overflow-hidden animate-scaleUp premium-glass'>
        {/* Header */}
        <div className='px-6 py-5 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-black text-slate-main dark:text-white tracking-tight uppercase'>
              Abrir Novo Chamado
            </h2>
            <p className='text-[10px] text-slate-muted font-bold uppercase tracking-widest mt-0.5'>
              Equipe de Suporte Igloo
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all'
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Category Select */}
          <div className='space-y-2.5'>
            <label className='text-[10px] font-black text-slate-muted uppercase tracking-widest px-1 block'>
              Categoria do Chamado
            </label>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type='button'
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
                        : 'border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 text-slate-500'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${cat.color} transition-colors`}>
                      <Icon size={16} />
                    </div>
                    <span className='text-[10px] font-bold uppercase tracking-wider leading-tight'>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div className='space-y-2.5'>
            <label className='text-[10px] font-black text-slate-muted uppercase tracking-widest px-1 block'>
              Assunto
            </label>
            <input
              type='text'
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder='Ex: Erro ao gerar o boleto de aluguel'
              className='w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 text-sm text-slate-main dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none'
            />
          </div>

          {/* Description */}
          <div className='space-y-2.5'>
            <label className='text-[10px] font-black text-slate-muted uppercase tracking-widest px-1 block'>
              Descrição detalhada
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Descreva detalhadamente o seu problema para que nossa equipe possa ajudar de forma mais rápida...'
              className='w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 text-sm text-slate-main dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none'
            />
          </div>

          {/* Priority select */}
          <div className='space-y-2.5'>
            <label className='text-[10px] font-black text-slate-muted uppercase tracking-widest px-1 block'>
              Prioridade
            </label>
            <div className='flex gap-2.5'>
              {['Baixa', 'Média', 'Alta', 'Urgente'].map((prio) => {
                const isSelected = priority === prio;
                const getPrioColor = () => {
                  if (prio === 'Baixa') return isSelected ? 'bg-slate-500/10 text-slate-500 border-slate-500/30' : 'hover:border-slate-500/20';
                  if (prio === 'Média') return isSelected ? 'bg-cyan-500/10 text-primary border-primary/30' : 'hover:border-primary/20';
                  if (prio === 'Alta') return isSelected ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 'hover:border-orange-500/20';
                  return isSelected ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'hover:border-rose-500/20';
                };
                return (
                  <button
                    key={prio}
                    type='button'
                    onClick={() => setPriority(prio)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${getPrioColor()} ${
                      isSelected ? 'border-2' : 'border-slate-200/60 dark:border-white/5 text-slate-500'
                    }`}
                  >
                    {prio}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className='flex gap-3 pt-2.5'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 py-3.5 rounded-2xl border border-slate-200/60 dark:border-white/5 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all active-tap'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={submitting || !subject.trim() || !description.trim()}
              className='flex-grow py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all active-tap flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none'
            >
              {submitting ? (
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              ) : (
                'Criar Chamado'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateTicketModal;
