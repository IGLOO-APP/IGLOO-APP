import React from 'react';
import {
  Trash2,
  Edit,
  Save,
  HelpCircle,
  CheckCircle2,
  Info,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { FAQ } from '../../types';

interface FAQManagerProps {
  show: boolean;
  onClose: () => void;
  faqs: FAQ[];
  editingFaq: FAQ | null;
  setEditingFaq: (faq: FAQ | null) => void;
  newFaq: Partial<FAQ>;
  setNewFaq: (faq: Partial<FAQ>) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onToggleStatus: (faq: FAQ) => void;
}

export const FAQManager: React.FC<FAQManagerProps> = ({
  show,
  onClose,
  faqs,
  editingFaq,
  setEditingFaq,
  newFaq,
  setNewFaq,
  onSave,
  onDelete,
  onToggleStatus,
}) => {
  if (!show) return null;

  const faqExamples = [
    {
      question: 'Como pagar o aluguel?',
      answer:
        'O boleto é enviado mensalmente para o seu e-mail cadastrado e também fica disponível na sua área de locatário aqui no IGLOO.',
    },
    {
      question: 'Regras de Mudança',
      answer:
        'As mudanças devem ser agendadas com 48h de antecedência. O horário permitido é de segunda a sexta, das 08h às 18h.',
    },
    {
      question: 'Solicitação de Manutenção',
      answer:
        'Para solicitar reparos, abra um chamado na seção "Manutenção" do seu painel. Anexe fotos para agilizarmos o processo.',
    },
  ];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className='max-h-[90vh] overflow-y-auto p-0 gap-0 max-w-2xl'
        showCloseButton={true}
      >
        <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Central de Respostas Rápidas</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='flex flex-col bg-background text-foreground'>
          <div>
            {/* Explanation Banner */}
            <div className='px-6 py-3 bg-primary/10 border-b border-primary/20 flex items-center gap-3'>
              <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0'>
                <Info size={16} />
              </div>
              <div className='flex-1'>
                <p className='text-[10px] font-bold text-primary uppercase tracking-widest'>
                  O que são FAQs?
                </p>
                <p className='text-[11px] text-muted-foreground font-medium'>
                  São atalhos de texto para perguntas frequentes. Ao conversar com um locatário,
                  você poderá enviar estas respostas completas com apenas um clique, economizando
                  tempo.
                </p>
              </div>
            </div>

            {/* Editor Section */}
            <div className='p-6 border-b border-border bg-card'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                    {editingFaq ? 'Editar Resposta' : 'Nova Resposta Rápida'}
                  </h3>
                  <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                    Atalhos de produtividade
                  </p>
                </div>
                <HelpCircle size={20} className='text-primary opacity-50' />
              </div>

              <div className='space-y-4'>
                <div className='space-y-1.5'>
                  <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
                    Título / Gatilho
                  </label>
                  <input
                    type='text'
                    placeholder='Ex: Como pagar boleto?'
                    value={editingFaq ? editingFaq.question : newFaq.question}
                    onChange={(e) =>
                      editingFaq
                        ? setEditingFaq({ ...editingFaq, question: e.target.value })
                        : setNewFaq({ ...newFaq, question: e.target.value })
                    }
                    className='w-full px-4 py-3 rounded-2xl bg-muted border-none text-sm font-bold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
                    Conteúdo da Resposta
                  </label>
                  <textarea
                    placeholder='Digite a resposta completa que será enviada ao locatário...'
                    value={editingFaq ? editingFaq.answer : newFaq.answer}
                    onChange={(e) =>
                      editingFaq
                        ? setEditingFaq({ ...editingFaq, answer: e.target.value })
                        : setNewFaq({ ...newFaq, answer: e.target.value })
                    }
                    className='w-full px-4 py-3 rounded-2xl bg-muted border-none text-sm font-medium text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none h-28 resize-none transition-all'
                  />
                </div>

                <div className='flex items-center justify-between gap-3 pt-2'>
                  <div className='flex items-center gap-2 overflow-x-auto pb-1 max-w-[60%] custom-scrollbar no-scrollbar'>
                    <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0'>
                      Sugestões:
                    </p>
                    {faqExamples.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setNewFaq(ex)}
                        className='shrink-0 px-2 py-1 rounded-lg bg-muted border border-border text-[9px] font-bold text-muted-foreground hover:text-primary hover:border-primary/30 transition-all'
                      >
                        {ex.question}
                      </button>
                    ))}
                  </div>

                  <div className='flex gap-2 shrink-0'>
                    {editingFaq && (
                      <button
                        onClick={() => setEditingFaq(null)}
                        className='px-4 py-2.5 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:bg-muted transition-all'
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      onClick={onSave}
                      className='px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2'
                    >
                      <Save size={12} />
                      {editingFaq ? 'Salvar' : 'Criar Atalho'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* List Section */}
            <div className='p-6 space-y-4'>
              <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between'>
                <span>Respostas Cadastradas</span>
                <span className='bg-muted px-2 py-0.5 rounded text-muted-foreground'>
                  {faqs.length}
                </span>
              </h3>

              {faqs.length === 0 ? (
                <div className='py-8 flex flex-col items-center justify-center text-center px-8 bg-muted/30 rounded-[32px] border border-dashed border-border'>
                  <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4 shadow-sm'>
                    <Lightbulb size={32} className='text-primary opacity-50' />
                  </div>
                  <h4 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2'>
                    Base de Conhecimento Vazia
                  </h4>
                  <p className='text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mb-6'>
                    Comece criando respostas para as dúvidas que você mais recebe. Isso vai
                    transformar seu atendimento em algo instantâneo e profissional.
                  </p>

                  <div className='grid grid-cols-1 gap-2 w-full max-w-sm'>
                    {faqExamples.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setNewFaq(ex)}
                        className='p-3 rounded-2xl bg-card border border-border flex items-center justify-between group hover:border-primary/50 transition-all'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary transition-colors' />
                          <span className='text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider'>
                            {ex.question}
                          </span>
                        </div>
                        <ChevronRight
                          size={14}
                          className='text-slate-300 group-hover:text-primary transition-all'
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='space-y-3'>
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className={`p-4 rounded-2xl border transition-all group ${faq.is_active ? 'bg-card border-border shadow-sm' : 'bg-muted/30 border-transparent opacity-60'}`}
                    >
                      <div className='flex justify-between items-start gap-4 mb-2'>
                        <p className='text-sm font-bold text-slate-900 dark:text-white tracking-tight'>
                          {faq.question}
                        </p>
                        <div className='flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <button
                            onClick={() => onToggleStatus(faq)}
                            className={`p-2 rounded-xl transition-all ${faq.is_active ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            onClick={() => setEditingFaq(faq)}
                            className='p-2 rounded-xl text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all'
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => onDelete(faq.id)}
                            className='p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className='text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium'>
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
