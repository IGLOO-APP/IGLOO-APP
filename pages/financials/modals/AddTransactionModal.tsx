import React, { useRef } from 'react';
import {
  TrendingUp,
  Tag,
  Calendar,
  Building2,
  Check,
  CheckCircle,
  Clock,
  Repeat,
  FileText,
  UploadCloud,
  Home,
  ChevronDown,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface AddTransactionModalProps {
  show: boolean;
  onClose: () => void;
  editingId?: string | null;
  transactionType: 'income' | 'expense';
  onTypeChange: (t: 'income' | 'expense') => void;
  txValue: string;
  onValueChange: (v: string) => void;
  txDescription: string;
  onDescriptionChange: (v: string) => void;
  txCategory: string;
  onCategoryChange: (v: string) => void;
  txDate: string;
  onDateChange: (v: string) => void;
  txProperty: string;
  onPropertyChange: (v: string) => void;
  txStatus: 'paid' | 'pending';
  onStatusChange: (s: 'paid' | 'pending') => void;
  isRecurring: boolean;
  onRecurringChange: (v: boolean) => void;
  hasAttachment: boolean;
  onAttachmentChange: (v: boolean) => void;
  properties: { id: string; name: string }[];
  onSave: (e: React.FormEvent) => void;
  isPending: boolean;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  show,
  onClose,
  editingId,
  transactionType,
  onTypeChange,
  txValue,
  onValueChange,
  txDescription,
  onDescriptionChange,
  txCategory,
  onCategoryChange,
  txDate,
  onDateChange,
  txProperty,
  onPropertyChange,
  txStatus,
  onStatusChange,
  isRecurring,
  onRecurringChange,
  hasAttachment,
  onAttachmentChange,
  properties,
  onSave,
  isPending,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-xl'>
        <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>
            {editingId
              ? 'Editar Lançamento'
              : transactionType === 'expense'
                ? 'Nova Despesa'
                : 'Nova Receita'}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='flex flex-col w-full bg-background text-foreground'>
          <div className='px-6 pt-2 pb-4 border-b border-border'>
            <div className='flex bg-muted p-1 rounded-xl'>
              <button
                onClick={() => onTypeChange('income')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${transactionType === 'income' ? 'bg-background text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <TrendingUp size={16} /> Receita
              </button>
              <button
                onClick={() => onTypeChange('expense')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${transactionType === 'expense' ? 'bg-background text-red-500 dark:text-red-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <TrendingUp size={16} className='rotate-180' /> Despesa
              </button>
            </div>
          </div>

          <div className='p-6 space-y-6'>
            <div>
              <label className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block text-center'>
                Valor do Lançamento
              </label>
              <div
                className={`relative flex justify-center items-center py-6 rounded-2xl border-2 transition-all ${transactionType === 'income' ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'}`}
              >
                <span
                  className={`text-2xl font-bold mr-1 ${transactionType === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                >
                  R$
                </span>
                <input
                  autoFocus
                  type='number'
                  value={txValue}
                  onChange={(e) => onValueChange(e.target.value)}
                  className={`w-40 bg-transparent text-4xl font-black focus:outline-none text-center ${transactionType === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} placeholder:text-muted-foreground`}
                  placeholder='0,00'
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block'>
                  Descrição
                </label>
                <input
                  type='text'
                  value={txDescription}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  className='w-full px-4 py-3 bg-muted border border-input rounded-xl text-base text-foreground focus:outline-none focus:border-primary transition-colors'
                  placeholder={
                    transactionType === 'expense' ? 'Ex: Conserto do portão' : 'Ex: Aluguel Apt 104'
                  }
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block'>
                    Categoria
                  </label>
                  <div className='relative'>
                    <Tag
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                      size={18}
                    />
                    <select
                      value={txCategory}
                      onChange={(e) => onCategoryChange(e.target.value)}
                      className='w-full pl-10 pr-8 py-3 bg-muted border border-input rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary appearance-none'
                    >
                      <option value='' disabled>
                        Selecione
                      </option>
                      {transactionType === 'income' ? (
                        <>
                          <option value='aluguel'>Aluguel</option>
                          <option value='condominio'>Condomínio</option>
                          <option value='iptu'>Reembolso IPTU</option>
                          <option value='extra'>Renda Extra</option>
                        </>
                      ) : (
                        <>
                          <option value='manutencao'>Manutenção</option>
                          <option value='impostos'>Impostos/Taxas</option>
                          <option value='servicos'>Serviços (Água/Luz)</option>
                          <option value='adm'>Taxa Administrativa</option>
                        </>
                      )}
                    </select>
                    <ChevronDown
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                      size={16}
                    />
                  </div>
                </div>
                <div>
                  <label className='text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block'>
                    Data
                  </label>
                  <div className='relative'>
                    <Calendar
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                      size={18}
                    />
                    <input
                      type='date'
                      value={txDate}
                      onChange={(e) => onDateChange(e.target.value)}
                      className='w-full pl-10 pr-3 py-3 bg-muted border border-input rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-foreground'
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-muted/50 p-4 rounded-xl border border-border space-y-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Building2 size={16} className='text-primary' />
                <span className='text-xs font-bold uppercase tracking-wider text-slate-500'>
                  Associação
                </span>
              </div>
              <div className='relative'>
                <label className='text-xs font-bold text-slate-500 mb-1 block'>
                  Propriedade (Opcional)
                </label>
                <div className='relative'>
                  <Home
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                    size={18}
                  />
                  <select
                    value={txProperty}
                    onChange={(e) => onPropertyChange(e.target.value)}
                    className='w-full pl-10 pr-8 py-3 bg-muted border border-input rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary appearance-none'
                  >
                    <option value=''>Geral (Sem vínculo)</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                    size={16}
                  />
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div
                onClick={() => onRecurringChange(!isRecurring)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isRecurring ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'}`}
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`p-2 rounded-lg ${isRecurring ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}
                  >
                    <Repeat size={20} />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold ${isRecurring ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      Repetir lançamento
                    </p>
                    <p className='text-xs text-slate-500'>Criar automaticamente todo mês.</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${isRecurring ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'}`}
                >
                  {isRecurring && <Check size={12} className='text-white' />}
                </div>
              </div>

              <div className='flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl'>
                <button
                  onClick={() => onStatusChange('paid')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${txStatus === 'paid' ? 'bg-background text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-muted-foreground'}`}
                >
                  <CheckCircle size={16} /> {transactionType === 'income' ? 'Recebido' : 'Pago'}
                </button>
                <button
                  onClick={() => onStatusChange('pending')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${txStatus === 'pending' ? 'bg-background text-orange-500 dark:text-orange-400 shadow-sm' : 'text-muted-foreground'}`}
                >
                  <Clock size={16} /> Pendente
                </button>
              </div>

              <div>
                <input
                  type='file'
                  ref={fileInputRef}
                  className='hidden'
                  onChange={() => onAttachmentChange(true)}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${hasAttachment ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-800 dark:text-emerald-400' : 'border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary'}`}
                >
                  {hasAttachment ? (
                    <>
                      <FileText size={18} /> Arquivo Anexado
                    </>
                  ) : (
                    <>
                      <UploadCloud size={18} /> Anexar Comprovante
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <form
            onSubmit={onSave}
            className='flex-none p-6 pt-4 bg-background border-t border-border z-20'
          >
            <button
              type='submit'
              disabled={isPending}
              className={`w-full h-14 flex items-center justify-center rounded-xl text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all duration-200 ${isPending ? 'opacity-50 cursor-not-allowed' : ''} ${transactionType === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25' : 'bg-red-500 hover:bg-red-600 shadow-red-500/25'}`}
            >
              {isPending
                ? 'Salvando...'
                : editingId
                  ? 'Atualizar Lançamento'
                  : 'Confirmar Lançamento'}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
