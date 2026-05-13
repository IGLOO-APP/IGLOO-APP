import React from 'react';
import { Plus, Trash2, Edit, Save, X, HelpCircle, CheckCircle2, MessageCircle } from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
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

  return (
    <ModalWrapper title='Central de Respostas' onClose={onClose}>
      <div className='flex flex-col h-full bg-background-light dark:bg-background-dark max-h-[85vh] overflow-hidden'>
        {/* Editor Section */}
        <div className='p-6 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h3 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                {editingFaq ? 'Editar Resposta' : 'Nova Resposta Rápida'}
              </h3>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Atalhos de produtividade</p>
            </div>
            <HelpCircle size={20} className='text-primary opacity-50' />
          </div>

          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>Título / Gatilho</label>
              <input
                type='text'
                placeholder='Ex: Como pagar boleto?'
                value={editingFaq ? editingFaq.question : newFaq.question}
                onChange={(e) => editingFaq ? setEditingFaq({...editingFaq, question: e.target.value}) : setNewFaq({...newFaq, question: e.target.value})}
                className='w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-black/20 border-none text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>Conteúdo da Resposta</label>
              <textarea
                placeholder='Digite a resposta completa que será enviada ao locatário...'
                value={editingFaq ? editingFaq.answer : newFaq.answer}
                onChange={(e) => editingFaq ? setEditingFaq({...editingFaq, answer: e.target.value}) : setNewFaq({...newFaq, answer: e.target.value})}
                className='w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-black/20 border-none text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none h-28 resize-none transition-all shadow-inner'
              />
            </div>

            <div className='flex justify-end gap-3 pt-2'>
              {editingFaq && (
                <button
                  onClick={() => setEditingFaq(null)}
                  className='px-5 py-2.5 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-all'
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={onSave}
                className='px-8 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2'
              >
                <Save size={14} />
                {editingFaq ? 'Salvar Alterações' : 'Criar Atalho'}
              </button>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className='flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar'>
          <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between'>
            <span>Respostas Cadastradas</span>
            <span className='bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-500'>{faqs.length}</span>
          </h3>

          {faqs.length === 0 ? (
            <div className='py-12 flex flex-col items-center justify-center text-center px-8'>
              <div className='w-20 h-20 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4'>
                <MessageCircle size={40} />
              </div>
              <h4 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2'>Nenhuma resposta rápida cadastrada</h4>
              <p className='text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px]'>
                Crie atalhos para responder dúvidas frequentes sobre aluguel, manutenção e pagamentos de forma instantânea.
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`p-4 rounded-2xl border transition-all group ${faq.is_active ? 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5 shadow-sm' : 'bg-gray-50/50 dark:bg-black/10 border-transparent opacity-60'}`}
                >
                  <div className='flex justify-between items-start gap-4 mb-2'>
                    <p className='text-sm font-bold text-slate-900 dark:text-white tracking-tight'>{faq.question}</p>
                    <div className='flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button
                        onClick={() => onToggleStatus(faq)}
                        className={`p-2 rounded-xl transition-all ${faq.is_active ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
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
                  <p className='text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium'>{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
