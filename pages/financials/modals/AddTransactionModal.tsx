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
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-xl border border-white/10 rounded-[22px]' style={{ background: 'rgba(12,14,26,0.92)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
        {/* Blobs for glass refraction */}
        <div aria-hidden='true' className='absolute inset-0 overflow-hidden pointer-events-none' style={{ borderRadius: 'inherit' }}>
          <div className='absolute w-[50vw] h-[50vw] top-[-20%] left-[-20%] rounded-full opacity-50' style={{ background: 'radial-gradient(circle, var(--lg-blob-1), transparent 70%)', filter: 'blur(90px)' }} />
          <div className='absolute w-[42vw] h-[42vw] bottom-[-20%] right-[-20%] rounded-full opacity-50' style={{ background: 'radial-gradient(circle, var(--lg-blob-2), transparent 70%)', filter: 'blur(80px)' }} />
        </div>
        <div className='relative z-10'>
        <DialogHeader className='px-6 py-4 border-b border-white/10 flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>
            {editingId
              ? 'Editar Lançamento'
              : transactionType === 'expense'
                ? 'Nova Despesa'
                : 'Nova Receita'}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='flex flex-col w-full'>
          <div className='px-6 pt-2 pb-4 border-b border-white/10'>
            <div className='flex bg-white/10 p-1 rounded-xl border border-white/10'>
              <button
                onClick={() => onTypeChange('income')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${transactionType === 'income' ? 'bg-white/20 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <TrendingUp size={16} strokeWidth={1.8} /> Receita
              </button>
              <button
                onClick={() => onTypeChange('expense')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${transactionType === 'expense' ? 'bg-white/20 text-red-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <TrendingUp size={16} strokeWidth={1.8} className='rotate-180' /> Despesa
              </button>
            </div>
          </div>

          <div className='p-6 space-y-6'>
            <div>
              <label className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block text-center'>
                Valor do Lançamento
              </label>
              <div
                className={`relative flex justify-center items-center py-6 rounded-2xl border-2 transition-all ${transactionType === 'income' ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-red-900/10 border-red-900/30'}`}
              >
                <span
                  className={`text-2xl font-bold mr-1 ${transactionType === 'income' ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  R$
                </span>
                <input
                  autoFocus
                  type='number'
                  value={txValue}
                  onChange={(e) => onValueChange(e.target.value)}
                  className={`w-40 bg-transparent text-4xl font-black focus:outline-none text-center ${transactionType === 'income' ? 'text-emerald-400' : 'text-red-400'} placeholder:text-slate-400`}
                  placeholder='0,00'
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='text-sm font-bold text-slate-300 mb-1.5 block'>
                  Descrição
                </label>
                <input
                  type='text'
                  value={txDescription}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  className='w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-base text-white focus:outline-none focus:border-primary transition-colors placeholder-slate-500'
                  placeholder={
                    transactionType === 'expense' ? 'Ex: Conserto do portão' : 'Ex: Aluguel Apt 104'
                  }
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-bold text-slate-300 mb-1.5 block'>
                    Categoria
                  </label>
                  <div className='relative'>
                    <Tag
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                      size={18}
                      strokeWidth={1.8}
                    />
                    <select
                      value={txCategory}
                      onChange={(e) => onCategoryChange(e.target.value)}
                      className='w-full pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-primary appearance-none'
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
                      strokeWidth={1.8}
                    />
                  </div>
                </div>
                <div>
                  <label className='text-sm font-bold text-slate-300 mb-1.5 block'>
                    Data
                  </label>
                  <div className='relative'>
                    <Calendar
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                      size={18}
                      strokeWidth={1.8}
                    />
                    <input
                      type='date'
                      value={txDate}
                      onChange={(e) => onDateChange(e.target.value)}
                      className='w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-white [color-scheme:dark]'
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white/5 p-4 rounded-xl border border-white/10 space-y-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Building2 size={16} strokeWidth={1.8} className='text-primary' />
                <span className='text-xs font-bold uppercase tracking-wider text-slate-400'>
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
                    strokeWidth={1.8}
                  />
                  <select
                    value={txProperty}
                    onChange={(e) => onPropertyChange(e.target.value)}
                    className='w-full pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-primary appearance-none'
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
                    strokeWidth={1.8}
                  />
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div
                onClick={() => onRecurringChange(!isRecurring)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isRecurring ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/10'}`}
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`p-2 rounded-lg ${isRecurring ? 'bg-primary text-white' : 'bg-white/10 text-slate-400'}`}
                  >
                    <Repeat size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold ${isRecurring ? 'text-white' : 'text-slate-400'}`}
                    >
                      Repetir lançamento
                    </p>
                    <p className='text-xs text-slate-500'>Criar automaticamente todo mês.</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${isRecurring ? 'bg-primary border-primary' : 'border-slate-600'}`}
                >
                  {isRecurring && <Check size={12} strokeWidth={1.8} className='text-white' />}
                </div>
              </div>

              <div className='flex p-1 bg-white/10 rounded-xl border border-white/10'>
                <button
                  onClick={() => onStatusChange('paid')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${txStatus === 'paid' ? 'bg-white/20 text-emerald-400 shadow-sm' : 'text-slate-400'}`}
                >
                  <CheckCircle size={16} strokeWidth={1.8} /> {transactionType === 'income' ? 'Recebido' : 'Pago'}
                </button>
                <button
                  onClick={() => onStatusChange('pending')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${txStatus === 'pending' ? 'bg-white/20 text-orange-400 shadow-sm' : 'text-slate-400'}`}
                >
                  <Clock size={16} strokeWidth={1.8} /> Pendente
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
                  className={`w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${hasAttachment ? 'border-emerald-800 bg-emerald-900/10 text-emerald-400' : 'border-white/10 text-slate-400 hover:border-primary/50 hover:bg-white/5 hover:text-primary'}`}
                >
                  {hasAttachment ? (
                    <>
                      <FileText size={18} strokeWidth={1.8} /> Arquivo Anexado
                    </>
                  ) : (
                    <>
                      <UploadCloud size={18} strokeWidth={1.8} /> Anexar Comprovante
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <form
            onSubmit={onSave}
            className='flex-none p-6 pt-4 border-t border-white/10 z-20'
          >
            <button
              type='submit'
              disabled={isPending}
              className={`w-full h-14 flex items-center justify-center rounded-[14px] text-white font-bold text-lg active:scale-[0.98] transition-all duration-200 ${isPending ? 'opacity-50 cursor-not-allowed' : ''} ${transactionType === 'income' ? 'bg-gradient-to-br from-[#2f6bff] to-[#3fa9ff] hover:brightness-110' : 'bg-gradient-to-br from-[#ef4444] to-[#f97316] hover:brightness-110'}`}
            >
              {isPending
                ? 'Salvando...'
                : editingId
                  ? 'Atualizar Lançamento'
                  : 'Confirmar Lançamento'}
            </button>
          </form>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
