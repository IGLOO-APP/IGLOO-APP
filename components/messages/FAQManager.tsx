import React from 'react';
import { Plus, Trash2, Edit, Save, X, HelpCircle, CheckCircle2 } from 'lucide-react';
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
    <ModalWrapper title='Gerenciar FAQs' onClose={onClose}>
      <div className='p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-background-light dark:bg-background-dark'>
        <div className='p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-4'>
          <h3 className='text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2'>
            <Plus size={18} className='text-primary' />
            {editingFaq ? 'Editar Pergunta' : 'Nova Pergunta Frequente'}
          </h3>
          <div className='space-y-3'>
            <input
              type='text'
              placeholder='Pergunta'
              value={editingFaq ? editingFaq.question : newFaq.question}
              onChange={(e) => editingFaq ? setEditingFaq({...editingFaq, question: e.target.value}) : setNewFaq({...newFaq, question: e.target.value})}
              className='w-full px-4 py-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 text-sm focus:ring-2 focus:ring-primary outline-none'
            />
            <textarea
              placeholder='Resposta'
              value={editingFaq ? editingFaq.answer : newFaq.answer}
              onChange={(e) => editingFaq ? setEditingFaq({...editingFaq, answer: e.target.value}) : setNewFaq({...newFaq, answer: e.target.value})}
              className='w-full px-4 py-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 text-sm focus:ring-2 focus:ring-primary outline-none h-24 resize-none'
            />
            <div className='flex justify-end gap-2'>
              {editingFaq && (
                <button
                  onClick={() => setEditingFaq(null)}
                  className='px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all'
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={onSave}
                className='px-6 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all'
              >
                {editingFaq ? 'Salvar Alterações' : 'Adicionar FAQ'}
              </button>
            </div>
          </div>
        </div>

        <div className='space-y-3'>
          <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
            FAQs Existentes ({faqs.length})
          </h3>
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`p-4 rounded-2xl border transition-all ${faq.is_active ? 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5' : 'bg-gray-50 dark:bg-black/20 border-transparent opacity-60'}`}
            >
              <div className='flex justify-between items-start gap-4 mb-2'>
                <p className='text-sm font-bold text-slate-900 dark:text-white'>{faq.question}</p>
                <div className='flex items-center gap-1 shrink-0'>
                  <button
                    onClick={() => onToggleStatus(faq)}
                    className={`p-1.5 rounded-lg transition-colors ${faq.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                    title={faq.is_active ? 'Desativar' : 'Ativar'}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button
                    onClick={() => setEditingFaq(faq)}
                    className='p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors'
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(faq.id)}
                    className='p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 leading-relaxed'>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </ModalWrapper>
  );
};
