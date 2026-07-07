import React, { useState } from 'react';
import { User } from '../../../types';
import { AlertTriangle, Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SuspendUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSuspend: (userId: string, reason: string, notes: string, notifyUser: boolean) => Promise<void>;
}

const SuspendUserModal: React.FC<SuspendUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuspend,
}) => {
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);
  const [loading, setLoading] = useState(false);

  const reasons = [
    'Pagamento não processado',
    'Violação dos termos',
    'Solicitação do usuário',
    'Atividade suspeita',
    'Outro',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const finalReason = reason === 'Outro' ? customReason : reason;
    try {
      await onSuspend(user.id.toString(), finalReason, notes, notifyUser);
      onClose();
    } catch (error) {
      console.error('Error suspending user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-w-lg p-0 gap-0'>
        <DialogHeader className='p-6 border-b border-border flex flex-row items-center justify-between gap-3'>
          <div className='flex items-center gap-3 text-red-500'>
            <div className='bg-red-50 dark:bg-red-500/10 p-2 rounded-xl'>
              <AlertTriangle size={24} />
            </div>
            <DialogTitle className='text-xl font-bold'>Suspender Conta</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          <div className='bg-red-50 dark:bg-red-500/5 p-4 rounded-2xl border border-red-100 dark:border-red-500/10'>
            <p className='text-sm text-red-800 dark:text-red-200'>
              Você está prestes a suspender a conta de <strong>{user.name}</strong>. O usuário
              perderá acesso imediato à plataforma.
            </p>
          </div>

          <div className='space-y-3'>
            <Label className='text-sm font-bold'>Motivo da Suspensão</Label>
            <div className='space-y-2'>
              {reasons.map((r) => (
                <Label
                  key={r}
                  className='flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent cursor-pointer transition-colors font-normal'
                >
                  <input
                    type='radio'
                    name='reason'
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className='w-4 h-4 text-red-500 focus:ring-red-500 border-gray-300'
                  />
                  <span className='text-sm font-medium text-foreground'>{r}</span>
                </Label>
              ))}
            </div>
            {reason === 'Outro' && (
              <Input
                type='text'
                placeholder='Especifique o motivo...'
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                required
              />
            )}
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-bold'>
              Notas Internas <span className='text-muted-foreground font-normal'>(Opcional)</span>
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Adicione detalhes para outros admins...'
              className='min-h-[80px]'
            />
          </div>

          <div className='flex items-center gap-3 pt-2'>
            <Checkbox
              id='notifyUser'
              checked={notifyUser}
              onCheckedChange={(v) => setNotifyUser(v as boolean)}
            />
            <Label htmlFor='notifyUser' className='text-sm font-medium cursor-pointer select-none'>
              Enviar email de notificação para o usuário
            </Label>
          </div>

          <div className='flex items-center gap-3 pt-4 border-t border-border'>
            <Button type='button' variant='outline' onClick={onClose} className='flex-1'>
              Cancelar
            </Button>
            <Button
              type='submit'
              variant='destructive'
              disabled={loading || !reason || (reason === 'Outro' && !customReason)}
              className='flex-1'
            >
              {loading ? <Loader2 size={18} className='animate-spin' /> : 'Suspender Conta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SuspendUserModal;
