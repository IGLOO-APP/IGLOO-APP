import React, { useState } from 'react';
import { FileText, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Contract } from '../../types';

interface RenewContractModalProps {
  contract: Contract;
  onClose: () => void;
  onConfirm: (data: { newEndDate: string; newValue: string; observations: string }) => void;
}

export const RenewContractModal: React.FC<RenewContractModalProps> = ({
  contract,
  onClose,
  onConfirm,
}) => {
  const [newEndDate, setNewEndDate] = useState('');
  const [newValue, setNewValue] = useState(contract.value);
  const [observations, setObservations] = useState('');

  const handleConfirm = () => {
    if (!newEndDate) return;
    onConfirm({ newEndDate, newValue, observations });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-xl'>
        <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Renovação de Contrato</DialogTitle>
        </DialogHeader>

        <div className='p-6 space-y-8'>
          {/* Contrato Atual */}
          <section className='space-y-4'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2'>
              <FileText size={14} /> Contrato Atual
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Nº do Contrato</Label>
                <Input value={contract.contract_number} disabled className='bg-muted/50' />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Inquilino</Label>
                <Input value={contract.tenant_name} disabled className='bg-muted/50' />
              </div>
              <div className='col-span-2 space-y-1.5'>
                <Label className='text-xs'>Imóvel</Label>
                <Input value={contract.property} disabled className='bg-muted/50' />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Data de Início</Label>
                <Input
                  value={new Date(contract.start_date).toLocaleDateString('pt-BR')}
                  disabled
                  className='bg-muted/50'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>Término Original</Label>
                <Input
                  value={new Date(contract.end_date).toLocaleDateString('pt-BR')}
                  disabled
                  className='bg-muted/50'
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Renovação */}
          <section className='space-y-6'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2'>
              <RefreshCw size={14} /> Renovação
            </h3>

            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs'>
                    Nova Data de Término <span className='text-destructive'>*</span>
                  </Label>
                  <div className='relative'>
                    <Calendar
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none'
                      size={16}
                    />
                    <Input
                      type='date'
                      required
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs'>Novo Valor Mensal</Label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs'>
                      R$
                    </span>
                    <Input
                      type='text'
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className='pl-9'
                    />
                  </div>
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs'>Observações (Opcional)</Label>
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className='min-h-[96px] leading-relaxed'
                  placeholder='Ex: Ajuste anual conforme IPCA...'
                />
              </div>

              <div className='flex items-start gap-2 rounded-lg border bg-muted/50 p-3'>
                <AlertCircle size={14} className='text-muted-foreground mt-0.5 shrink-0' />
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  A renovação criará um novo contrato vinculado ao atual. O contrato original será
                  mantido no histórico como &ldquo;Encerrado&rdquo;.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className='p-6 pt-4 border-t border-border'>
          <Button onClick={handleConfirm} disabled={!newEndDate} className='w-full h-12 text-base'>
            Confirmar Renovação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
