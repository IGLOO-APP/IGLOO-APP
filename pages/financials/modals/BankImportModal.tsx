import React, { useRef } from 'react';
import { FileUp, Check, AlertTriangle } from 'lucide-react';
import { ModalWrapper } from '../../../components/ui/ModalWrapper';

interface MatchedTx {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  suggestedCategory?: string;
  matchedId?: string;
  matchStatus: 'perfect' | 'none';
}

interface BankImportModalProps {
  show: boolean;
  onClose: () => void;
  isProcessingFile: boolean;
  importResult: MatchedTx[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearResult: () => void;
}

export const BankImportModal: React.FC<BankImportModalProps> = ({
  show,
  onClose,
  isProcessingFile,
  importResult,
  onFileUpload,
  onClearResult,
}) => {
  const bankFileInputRef = useRef<HTMLInputElement>(null);

  if (!show) return null;

  const handleClose = () => {
    onClose();
    onClearResult();
  };

  return (
    <ModalWrapper
      onClose={handleClose}
      title='Conciliação Bancária'
      showCloseButton={true}
      className='md:max-w-xl'
    >
      <div className='p-6 bg-background-light dark:bg-background-dark space-y-6 h-[80vh] flex flex-col'>
        {!importResult.length ? (
          <div className='flex-1 flex flex-col justify-center space-y-6'>
            <div
              onClick={() => bankFileInputRef.current?.click()}
              className={`p-10 border-2 border-dashed rounded-2xl text-center bg-slate-50 dark:bg-white/5 group hover:border-primary transition-all cursor-pointer ${isProcessingFile ? 'opacity-50 pointer-events-none' : 'border-slate-200 dark:border-white/10'}`}
            >
              <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform'>
                {isProcessingFile ? (
                  <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin' />
                ) : (
                  <FileUp className='text-primary' size={40} />
                )}
              </div>
              <h4 className='text-xl font-bold text-slate-900 dark:text-white'>
                {isProcessingFile ? 'Processando...' : 'Importar Extrato'}
              </h4>
              <p className='text-sm text-slate-500 mt-2 max-w-xs mx-auto'>
                Arraste seu arquivo OFX ou CSV aqui ou clique para selecionar.
              </p>
              <input
                type='file'
                ref={bankFileInputRef}
                className='hidden'
                accept='.ofx,.csv'
                onChange={onFileUpload}
              />
            </div>

            <div className='space-y-4'>
              <h5 className='text-xs font-bold text-slate-400 uppercase tracking-widest text-center'>
                Formatos Suportados
              </h5>
              <div className='grid grid-cols-2 gap-3'>
                {['OFX (Padrão)', 'CSV (Excel)', 'Itaú / Nubank', 'Inter / Santander'].map(
                  (bank) => (
                    <div
                      key={bank}
                      className='px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm'
                    >
                      <div className='w-2 h-2 rounded-full bg-emerald-500' />
                      {bank}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className='flex-1 flex flex-col overflow-hidden'>
            <div className='flex items-center justify-between mb-4'>
              <h4 className='font-bold text-slate-900 dark:text-white'>Transações Identificadas</h4>
              <span className='text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full'>
                {importResult.length} itens
              </span>
            </div>

            <div className='flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar'>
              {importResult.map((btx) => (
                <div
                  key={btx.id}
                  className='p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-white dark:bg-surface-dark shadow-sm'
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <p className='text-xs font-bold text-slate-400 uppercase'>{btx.date}</p>
                      <p className='text-sm font-bold text-slate-800 dark:text-white'>
                        {btx.description}
                      </p>
                    </div>
                    <p
                      className={`font-bold ${btx.amount > 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}
                    >
                      {btx.amount > 0 ? '+' : ''} R$ {btx.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className='flex items-center justify-between pt-3 border-t border-slate-50 dark:border-white/5'>
                    <div className='flex items-center gap-2'>
                      {btx.matchStatus === 'perfect' ? (
                        <span className='flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded'>
                          <Check size={12} /> Conciliado
                        </span>
                      ) : (
                        <span className='flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded'>
                          <AlertTriangle size={12} /> Novo Lançamento
                        </span>
                      )}
                      <span className='text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded uppercase'>
                        {btx.suggestedCategory}
                      </span>
                    </div>
                    <button className='text-xs font-bold text-primary hover:underline'>
                      {btx.matchStatus === 'perfect' ? 'Ver Match' : 'Confirmar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className='pt-6 mt-auto border-t border-slate-100 dark:border-white/5 flex gap-3'>
              <button
                onClick={onClearResult}
                className='flex-1 h-12 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold'
              >
                Voltar
              </button>
              <button className='flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95'>
                Efetivar Conciliação
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
