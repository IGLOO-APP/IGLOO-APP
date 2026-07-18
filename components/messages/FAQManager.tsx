import React from 'react';
import {
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  Zap,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const inputCls =
    'w-full rounded-xl px-4 py-3 text-sm font-medium bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-[#13c8ec] focus:ring-2 focus:ring-[#13c8ec]/20 outline-none transition-all';

  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-background text-foreground'>
      {/* ── Sticky Header ── */}
      <div className='flex items-center justify-between px-8 py-5 border-b border-border bg-card shrink-0'>
        <div className='flex items-center gap-4'>
          <div
            className='w-11 h-11 rounded-2xl flex items-center justify-center shrink-0'
            style={{ background: 'linear-gradient(135deg,#2f6bff 0%,#3fa9ff 100%)' }}
          >
            <Zap size={20} className='text-white' />
          </div>
          <div>
            <h1 className='text-base font-bold text-foreground leading-tight'>
              Central de Respostas Rápidas
            </h1>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Envie respostas completas com um clique durante o atendimento
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className='w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all'
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className='flex-1 overflow-hidden flex'>
        {/* Left column — Editor */}
        <div className='w-full lg:w-[42%] border-r border-border overflow-y-auto p-8 space-y-6 shrink-0'>
          <div className='rounded-2xl border border-border bg-muted/30 p-6 space-y-5'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h3 className='text-sm font-bold text-foreground'>
                  {editingFaq ? 'Editar Resposta' : 'Nova Resposta Rápida'}
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {editingFaq
                    ? 'Atualize o conteúdo abaixo'
                    : 'Crie um atalho para dúvidas frequentes'}
                </p>
              </div>
              {editingFaq && (
                <button
                  onClick={() => setEditingFaq(null)}
                  className='shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold'
                >
                  Cancelar edição
                </button>
              )}
            </div>

            {/* Title */}
            <div className='space-y-2'>
              <label className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
                Título / Gatilho
              </label>
              <input
                type='text'
                placeholder='Ex: Como pagar boleto?'
                value={editingFaq ? editingFaq.question : (newFaq.question ?? '')}
                onChange={(e) =>
                  editingFaq
                    ? setEditingFaq({ ...editingFaq, question: e.target.value })
                    : setNewFaq({ ...newFaq, question: e.target.value })
                }
                className={inputCls}
              />
            </div>

            {/* Answer */}
            <div className='space-y-2'>
              <label className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
                Conteúdo da Resposta
              </label>
              <textarea
                rows={6}
                placeholder='Digite a resposta completa que será enviada ao locatário…'
                value={editingFaq ? editingFaq.answer : (newFaq.answer ?? '')}
                onChange={(e) =>
                  editingFaq
                    ? setEditingFaq({ ...editingFaq, answer: e.target.value })
                    : setNewFaq({ ...newFaq, answer: e.target.value })
                }
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Save */}
            <Button onClick={onSave} variant='glass' className='w-full h-11 text-sm gap-2'>
              <Save size={15} />
              {editingFaq ? 'Salvar Alterações' : 'Criar Atalho'}
            </Button>
          </div>

          {/* Example suggestions */}
          <div className='space-y-2'>
            <p className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1'>
              Sugestões de resposta
            </p>
            <div className='space-y-2'>
              {faqExamples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setNewFaq(ex)}
                  className='w-full p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between group hover:border-[#13c8ec]/40 transition-all text-left'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 rounded-full bg-muted-foreground/30 group-hover:bg-[#13c8ec] transition-colors shrink-0' />
                    <div>
                      <p className='text-sm font-semibold text-foreground group-hover:text-foreground'>
                        {ex.question}
                      </p>
                      <p className='text-xs text-muted-foreground mt-0.5 line-clamp-1'>
                        {ex.answer}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={15}
                    className='text-muted-foreground/40 group-hover:text-[#13c8ec] transition-all shrink-0 ml-2'
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — FAQ list */}
        <div className='flex-1 overflow-y-auto p-8'>
          <div className='flex items-center justify-between mb-5'>
            <p className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
              Respostas Cadastradas
            </p>
            <span className='text-[11px] font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full'>
              {faqs.length} {faqs.length === 1 ? 'resposta' : 'respostas'}
            </span>
          </div>

          {faqs.length === 0 ? (
            <div className='rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16 flex flex-col items-center justify-center text-center px-8'>
              <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-5'>
                <Lightbulb size={30} />
              </div>
              <h4 className='text-base font-bold text-foreground mb-2'>
                Base de Conhecimento Vazia
              </h4>
              <p className='text-sm text-muted-foreground leading-relaxed max-w-sm'>
                Crie respostas para as dúvidas mais frequentes e agilize seu atendimento.
                Use as sugestões ao lado para começar.
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`rounded-2xl border border-border px-6 py-5 group transition-all hover:border-border/80 bg-muted/20 ${
                    !faq.is_active ? 'opacity-50' : ''
                  }`}
                >
                  <div className='flex justify-between items-start gap-4 mb-2.5'>
                    <p className='text-sm font-bold text-foreground leading-snug'>
                      {faq.question}
                    </p>
                    <div className='flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button
                        onClick={() => onToggleStatus(faq)}
                        title={faq.is_active ? 'Desativar' : 'Ativar'}
                        className={`p-2 rounded-xl transition-all ${
                          faq.is_active
                            ? 'text-emerald-500 hover:bg-emerald-500/15'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        onClick={() => setEditingFaq(faq)}
                        title='Editar'
                        className='p-2 rounded-xl text-blue-400 hover:bg-blue-500/15 transition-all'
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(faq.id)}
                        title='Excluir'
                        className='p-2 rounded-xl text-destructive hover:bg-destructive/15 transition-all'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {faq.answer}
                  </p>
                  {!faq.is_active && (
                    <span className='inline-block mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-1 rounded-full'>
                      Desativado
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
