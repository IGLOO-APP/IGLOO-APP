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
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-2xl border border-white/10 rounded-[22px]' style={{ background: 'rgba(12,14,26,0.92)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
        <div aria-hidden='true' className='absolute inset-0 overflow-hidden pointer-events-none' style={{ borderRadius: 'inherit' }}>
          <div className='absolute w-[50vw] h-[50vw] top-[-20%] left-[-20%] rounded-full opacity-50' style={{ background: 'radial-gradient(circle, var(--lg-blob-1), transparent 70%)', filter: 'blur(90px)' }} />
          <div className='absolute w-[42vw] h-[42vw] bottom-[-20%] right-[-20%] rounded-full opacity-50' style={{ background: 'radial-gradient(circle, var(--lg-blob-2), transparent 70%)', filter: 'blur(80px)' }} />
        </div>
        <div className='relative z-10'>
        <DialogHeader className='px-6 py-4 border-b border-white/10 flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Visualizar Comprovante</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='p-6'>
          <div className='relative rounded-2xl overflow-hidden border border-white/10'>
            <img
              src={voucherUrl ?? ''}
              alt='Comprovante'
              className='w-full h-auto max-h-[70vh] object-contain bg-slate-900'
            />
          </div>
          <div className='mt-6 flex gap-3'>
            <button
              onClick={() => {
                if (voucherUrl && isValidUrl(voucherUrl))
                  window.open(voucherUrl, '_blank', 'noopener,noreferrer');
              }}
              className='flex-1 h-12 flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#2f6bff] to-[#3fa9ff] text-white font-bold hover:brightness-110 active:scale-95 transition-all'
            >
              <Download size={18} strokeWidth={1.8} /> Baixar Original
            </button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
