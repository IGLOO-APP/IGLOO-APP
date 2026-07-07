import React from 'react';
import { Lock, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SignatureModalProps {
  show: boolean;
  signName: string;
  setSignName: (val: string) => void;
  signCpf: string;
  setSignCpf: (val: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSign: () => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  show,
  signName,
  setSignName,
  signCpf,
  setSignCpf,
  isSubmitting,
  onClose,
  onSign,
}) => {
  return (
    <Dialog open={show} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-w-md p-6 gap-6'>
        <DialogHeader>
          <DialogTitle className='uppercase tracking-wider'>Assinar Laudo de Vistoria</DialogTitle>
          <DialogDescription className='text-[10px] font-medium'>
            Insira os seus dados autenticados para concluir a assinatura.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label className='text-[9px] font-bold uppercase tracking-wider'>Nome Completo</Label>
            <Input
              type='text'
              value={signName}
              onChange={(e) => setSignName(e.target.value)}
              placeholder='Nome completo do assinante...'
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-[9px] font-bold uppercase tracking-wider'>
              CPF do Assinante
            </Label>
            <Input
              type='text'
              value={signCpf}
              onChange={(e) => setSignCpf(e.target.value)}
              placeholder='000.000.000-00'
            />
          </div>

          <div className='p-3 bg-muted/50 border border-border rounded-xl text-[9px] text-muted-foreground font-medium leading-relaxed flex gap-2'>
            <Lock size={12} className='text-[#13c8ec] shrink-0 mt-0.5' />
            <span>
              Ao clicar em assinar, você concorda com a validade deste laudo sob os termos
              contratuais estabelecidos. Sua assinatura eletrônica registrará as informações de IP e
              carimbo de data/hora (timestamp).
            </span>
          </div>
        </div>

        <div className='flex gap-3'>
          <Button variant='outline' onClick={onClose} className='flex-1'>
            Cancelar
          </Button>
          <Button
            onClick={onSign}
            disabled={isSubmitting || !signName.trim() || !signCpf.trim()}
            className='flex-1 bg-[#13c8ec] text-[#0a0f1a] hover:bg-[#13c8ec]/90 font-black uppercase tracking-widest'
          >
            {isSubmitting ? <Loader2 size={14} className='animate-spin' /> : 'Assinar Agora'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
