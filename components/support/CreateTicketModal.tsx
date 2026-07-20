import React from 'react';
import { Wrench, DollarSign, HelpCircle, AlertTriangle, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useTicketForm } from './hooks/useTicketForm';

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
  onSubmit,
}) => {
  const {
    subject,
    setSubject,
    description,
    setDescription,
    category,
    setCategory,
    priority,
    setPriority,
    submitting,
    handleSubmit,
  } = useTicketForm(onSubmit, onClose);

  if (!isOpen) return null;

  const categories = [
    { id: 'technical', name: 'Suporte Técnico', icon: Wrench, color: 'text-cyan-500 bg-cyan-500/10' },
    { id: 'billing', name: 'Financeiro', icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'feature_request', name: 'Sugestão', icon: Sparkles, color: 'text-purple-500 bg-purple-500/10' },
    { id: 'bug', name: 'Bug no Sistema', icon: AlertTriangle, color: 'text-rose-500 bg-rose-500/10' },
    { id: 'other', name: 'Outros', icon: HelpCircle, color: 'text-slate-500 bg-slate-500/10' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-lg p-0 gap-0 overflow-hidden'>
        <DialogHeader className='px-6 py-4 border-b border-border shrink-0'>
          <DialogTitle className='text-base font-black tracking-tight uppercase'>
            Abrir Novo Chamado
          </DialogTitle>
          <DialogDescription className='text-[9px] font-bold uppercase tracking-widest mt-0.5'>
            Equipe de Suporte Igloo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='p-6 space-y-4 overflow-y-auto max-h-[75vh]'>
          <div className='space-y-2'>
            <label className='text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1 block'>
              Categoria do Chamado
            </label>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type='button'
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${cat.color} transition-colors`}>
                      <Icon size={14} />
                    </div>
                    <span className='text-[9px] font-bold uppercase tracking-wider leading-tight'>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1 block'>
              Assunto
            </label>
            <input
              type='text'
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder='Ex: Erro ao gerar o boleto de aluguel'
              className='w-full h-11 px-4 rounded-xl bg-muted border border-input text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1 block'>
              Descrição detalhada
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Descreva detalhadamente o seu problema...'
              className='w-full p-4 rounded-xl bg-muted border border-input text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1 block'>
              Prioridade
            </label>
            <div className='flex gap-2'>
              {['Baixa', 'Média', 'Alta', 'Urgente'].map((prio) => {
                const isSelected = priority === prio;
                const getPrioColor = () => {
                  if (prio === 'Baixa') return isSelected ? 'bg-muted text-foreground border-border' : 'hover:border-border/60';
                  if (prio === 'Média') return isSelected ? 'bg-primary/10 text-primary border-primary/30' : 'hover:border-primary/20';
                  if (prio === 'Alta') return isSelected ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 'hover:border-orange-500/20';
                  return isSelected ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'hover:border-rose-500/20';
                };
                return (
                  <button
                    key={prio}
                    type='button'
                    onClick={() => setPriority(prio)}
                    className={`flex-1 py-2 rounded-lg border text-[10px] font-bold transition-all ${getPrioColor()} ${isSelected ? 'border-2' : 'border-border text-muted-foreground'}`}
                  >
                    {prio}
                  </button>
                );
              })}
            </div>
          </div>

          <div className='flex gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 py-3 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={submitting || !subject.trim() || !description.trim()}
              className='flex-grow py-3 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none'
            >
              {submitting ? (
                <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
              ) : (
                'Criar Chamado'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default CreateTicketModal;
