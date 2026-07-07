import React from 'react';
import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { isValidUrl } from '../../../utils/validation';

interface VoucherModalProps {
  voucherUrl: string | null;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ voucherUrl, onClose }) => {
  return (
    <Dialog open={!!voucherUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-2xl'>
        <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Visualizar Comprovante</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='p-6 bg-background-light dark:bg-background-dark'>
          <div className='relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10'>
            <img
              src={voucherUrl ?? ''}
              alt='Comprovante'
              className='w-full h-auto max-h-[70vh] object-contain bg-slate-50 dark:bg-slate-900'
            />
          </div>
          <div className='mt-6 flex gap-3'>
            <button
              onClick={() => {
                if (voucherUrl && isValidUrl(voucherUrl))
                  window.open(voucherUrl, '_blank', 'noopener,noreferrer');
              }}
              className='flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg transition-all hover:opacity-90 active:scale-95'
            >
              <Download size={18} /> Baixar Original
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
