import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Contract, Signer, ContractHistoryEvent } from '../../types';
import { getStatusLabel } from '../../utils/contractLogic';
import { contractService } from '../../services/tenancy/contractService';
import { captureAndSaveSignature } from '../../utils/signatureLogic';
import {
  FileText,
  DollarSign,
  History,
  ShieldCheck,
  Download,
  Send,
  PenTool,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Info,
  User,
  ExternalLink,
  FilePlus,
  Eye,
  FileSearch,
  ScrollText,
  RefreshCw,
} from 'lucide-react';

interface ContractDetailsProps {
  contract: Contract;
  onClose: () => void;
  onUpdate: (updated: Contract) => void;
}

export const ContractDetails: React.FC<ContractDetailsProps> = ({
  contract,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSigning, setIsSigning] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const calculateProgress = () => {
    const start = new Date(contract.start_date).getTime();
    const end = new Date(contract.end_date).getTime();
    const now = new Date().getTime();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };
  const contractProgress = calculateProgress();

  const handleSendSignature = async () => {
    setIsSigning(true);
    try {
      const updatedSigners: Signer[] = contract.signers.map((s) => ({
        ...s,
        status: 'signed' as const,
        signed_at: new Date().toISOString(),
      }));
      const newEvent: ContractHistoryEvent = {
        id: Date.now().toString(),
        action: 'signed',
        description: 'Assinado digitalmente por todas as partes',
        performed_by: 'Sistema',
        date: new Date().toLocaleString(),
      };
      const updatedHistory = [newEvent, ...contract.history];

      await contractService.update(contract.id, {
        status: 'active',
        signers: updatedSigners,
        history: updatedHistory,
      });

      for (const signer of updatedSigners) {
        await captureAndSaveSignature(contract.id, signer.id, contract.contract_text || '');
      }

      const updated = {
        ...contract,
        status: 'active' as const,
        signers: updatedSigners,
        history: updatedHistory,
      };
      onUpdate(updated);
    } catch (err) {
      console.error('Erro ao processar assinatura:', err);
    } finally {
      setIsSigning(false);
    }
  };

  const handleCancelContract = async () => {
    try {
      const newEvent: ContractHistoryEvent = {
        id: Date.now().toString(),
        action: 'cancelled',
        description: 'Contrato rescindido manualmente',
        performed_by: 'Proprietário',
        date: new Date().toISOString(),
      };
      const updatedHistory = [newEvent, ...contract.history];

      await contractService.update(contract.id, {
        status: 'cancelled',
        history: updatedHistory,
      });

      const updated = {
        ...contract,
        status: 'cancelled' as const,
        history: updatedHistory,
      };
      onUpdate(updated);
      setShowCancelConfirm(false);
    } catch (err) {
      console.error('Erro ao rescindir contrato:', err);
    }
  };

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-4xl'
          showCloseButton
        >
          <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
            <DialogTitle className='text-xl font-bold'>
              Contrato #{contract.contract_number}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className='flex flex-col'>
            <div className='px-6 py-3 bg-muted/30 border-b border-border'>
              <TabsList>
                <TabsTrigger value='overview' className='gap-2'>
                  <FileText size={14} /> Visão Geral
                </TabsTrigger>
                <TabsTrigger value='document' className='gap-2'>
                  <ScrollText size={14} /> Documento Original
                </TabsTrigger>
                <TabsTrigger value='history' className='gap-2'>
                  <History size={14} /> Histórico
                </TabsTrigger>
                <TabsTrigger value='audit' className='gap-2'>
                  <FileSearch size={14} /> Auditoria
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Status bar */}
            <div className='px-6 py-3 bg-card border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-3'>
              <div className='flex items-center gap-3'>
                <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                  {getStatusLabel(contract.status)}
                </Badge>
                <span className='text-sm text-muted-foreground'>{contract.property}</span>
              </div>

              <div className='flex gap-2'>
                {contract.status === 'pending_signature' && (
                  <Button
                    onClick={handleSendSignature}
                    disabled={isSigning}
                    variant='default'
                    size='sm'
                  >
                    {isSigning ? (
                      'Processando...'
                    ) : (
                      <>
                        <PenTool size={14} /> Simular Assinatura
                      </>
                    )}
                  </Button>
                )}
                {contract.status === 'active' && (
                  <Button
                    onClick={() => setShowCancelConfirm(true)}
                    variant='outline'
                    size='sm'
                    className='text-destructive border-destructive/30 hover:bg-destructive/10'
                  >
                    <AlertTriangle size={14} /> Rescindir
                  </Button>
                )}
                <Button variant='ghost' size='icon' className='text-muted-foreground'>
                  <Download size={18} />
                </Button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-6 bg-muted/20'>
              <TabsContent value='overview' className='mt-0 space-y-6'>
                <div className='grid md:grid-cols-2 gap-6'>
                  <div className='space-y-6'>
                    {/* Dados do Contrato */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                          <FileText size={16} className='text-primary' /> Dados do Contrato
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div className='flex items-center justify-between border-b border-border pb-3'>
                          <span className='text-xs text-muted-foreground flex items-center gap-1.5'>
                            <User size={12} /> Inquilino
                          </span>
                          <span className='text-sm font-medium text-card-foreground'>
                            {contract.tenant_name}
                          </span>
                        </div>
                        <div className='flex items-center justify-between border-b border-border pb-3'>
                          <span className='text-xs text-muted-foreground flex items-center gap-1.5'>
                            <ShieldCheck size={12} /> Proprietário
                          </span>
                          <span className='text-sm font-medium text-card-foreground'>
                            {contract.owner_name}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='space-y-0.5'>
                            <span className='text-xs text-muted-foreground'>Início</span>
                            <p className='text-sm font-medium text-card-foreground'>
                              {new Date(contract.start_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className='text-right space-y-0.5'>
                            <span className='text-xs text-muted-foreground'>Término</span>
                            <p className='text-sm font-medium text-card-foreground'>
                              {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <span className='text-xs text-muted-foreground'>Tempo Decorrido</span>
                            <span className='text-xs font-medium text-primary'>
                              {contractProgress}%
                            </span>
                          </div>
                          <Progress value={contractProgress} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Regras Inteligentes */}
                    <Card>
                      <CardHeader>
                        <div className='flex items-center justify-between'>
                          <CardTitle className='flex items-center gap-2 text-base'>
                            <ShieldCheck size={16} className='text-emerald-500' /> Regras
                            Inteligentes
                          </CardTitle>
                          <Badge variant='secondary' className='text-[10px]'>
                            Extraído
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='grid grid-cols-2 gap-3'>
                          <div className='space-y-1.5 rounded-lg border p-3'>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-muted-foreground flex items-center gap-1'>
                                <Percent size={12} /> Multa
                              </span>
                              <Info size={10} className='text-muted-foreground cursor-help' />
                            </div>
                            <p className='text-sm font-semibold text-card-foreground'>10%</p>
                          </div>
                          <div className='space-y-1.5 rounded-lg border p-3'>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-muted-foreground flex items-center gap-1'>
                                <TrendingUp size={12} /> Juros Diários
                              </span>
                              <Info size={10} className='text-muted-foreground cursor-help' />
                            </div>
                            <p className='text-sm font-semibold text-card-foreground'>0,033%</p>
                          </div>
                          <div className='space-y-1.5 rounded-lg border p-3'>
                            <span className='text-xs text-muted-foreground flex items-center gap-1'>
                              <ArrowUpRight size={12} /> Reajuste
                            </span>
                            <p className='text-sm font-semibold text-card-foreground'>
                              IGP-M (Anual)
                            </p>
                          </div>
                          <div className='space-y-1.5 rounded-lg border p-3'>
                            <span className='text-xs text-muted-foreground flex items-center gap-1'>
                              <RefreshCw size={12} /> Próximo Reajuste
                            </span>
                            <div className='flex items-center justify-between'>
                              <p className='text-sm font-semibold text-primary'>Jan 2025</p>
                              <Badge variant='outline' className='text-[9px]'>
                                em 8 meses
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className='space-y-6'>
                    {/* Financeiro */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                          <DollarSign size={16} className='text-emerald-500' /> Financeiro
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div className='rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/10 p-4'>
                          <div className='flex items-center justify-between mb-1'>
                            <span className='text-sm text-emerald-700 dark:text-emerald-300 font-medium'>
                              Aluguel Base
                            </span>
                            <span className='text-xl font-bold text-emerald-600 dark:text-emerald-400'>
                              {contract.value}
                            </span>
                          </div>
                          <div className='flex items-center justify-between text-xs text-emerald-600/60 dark:text-emerald-400/40'>
                            <span>+ Condomínio/IPTU</span>
                            <span>R$ 550,00 (aprox.)</span>
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                          <div className='space-y-0.5'>
                            <span className='text-xs text-muted-foreground'>Vencimento</span>
                            <p className='text-sm font-semibold text-card-foreground'>
                              Dia {contract.payment_day}
                            </p>
                          </div>
                          <div className='text-right space-y-0.5'>
                            <span className='text-xs text-muted-foreground'>Garantia</span>
                            <p className='text-sm font-semibold text-indigo-500'>Fiador</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Timeline de Assinatura */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                          <PenTool size={16} className='text-primary' /> Timeline de Assinatura
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div className='relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border'>
                          {contract.signers && contract.signers.length > 0 ? (
                            contract.signers.map((signer: Signer, idx: number) => (
                              <div key={signer.id || idx} className='relative'>
                                <div
                                  className={`absolute -left-[19px] top-1 size-4 rounded-full flex items-center justify-center ring-4 ring-background ${
                                    signer.status === 'signed'
                                      ? 'bg-emerald-500'
                                      : signer.status === 'viewed'
                                        ? 'bg-blue-500'
                                        : 'bg-muted-foreground/30'
                                  }`}
                                >
                                  {signer.status === 'signed' ? (
                                    <CheckCircle size={10} className='text-white' />
                                  ) : signer.status === 'viewed' ? (
                                    <Clock size={10} className='text-white' />
                                  ) : (
                                    <div className='size-1.5 rounded-full bg-muted' />
                                  )}
                                </div>
                                <div className='flex items-start justify-between'>
                                  <div>
                                    <p className='text-xs font-medium text-card-foreground'>
                                      {signer.role === 'owner'
                                        ? 'Proprietário'
                                        : signer.role === 'tenant'
                                          ? 'Inquilino'
                                          : 'Fiador'}{' '}
                                      {signer.status === 'signed'
                                        ? 'Assinou'
                                        : signer.status === 'viewed'
                                          ? 'Visualizou'
                                          : 'Pendente'}
                                    </p>
                                    <p className='text-[10px] text-muted-foreground'>
                                      {signer.status === 'signed'
                                        ? `IP: ${signer.ip || '187.54.21.10'} • Hash: ${signer.hash || '4x9f...a2'}`
                                        : signer.status === 'viewed'
                                          ? 'Aguardando confirmação digital'
                                          : 'Link de assinatura não acessado'}
                                    </p>
                                  </div>
                                  <span className='text-[10px] text-muted-foreground'>
                                    {signer.signed_at
                                      ? new Date(signer.signed_at).toLocaleDateString('pt-BR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: '2-digit',
                                        })
                                      : signer.viewed_at
                                        ? new Date(signer.viewed_at).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: '2-digit',
                                          })
                                        : ''}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className='text-xs text-muted-foreground italic'>
                              Nenhum signatário registrado.
                            </p>
                          )}
                        </div>

                        <div className='space-y-3 pt-2'>
                          <div className='rounded-lg border bg-muted/50 p-3'>
                            <p className='text-xs text-muted-foreground'>
                              Último envio do link para os pendentes:
                            </p>
                            <p className='text-xs font-medium text-card-foreground mt-0.5'>
                              Há 2 dias (15/04/2026)
                            </p>
                          </div>
                          <Button variant='secondary' className='w-full gap-2'>
                            <Send size={14} />
                            Reenviar Links de Assinatura
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='document' className='mt-0'>
                <Card className='overflow-hidden'>
                  {contract.pdf_url ? (
                    <>
                      <div className='h-[500px] bg-muted relative'>
                        {(() => {
                          let directPdfUrl = contract.pdf_url;
                          if (directPdfUrl.includes('docs.google.com/viewer')) {
                            try {
                              const urlParams = new URLSearchParams(new URL(directPdfUrl).search);
                              const extractedUrl = urlParams.get('url');
                              if (extractedUrl) directPdfUrl = decodeURIComponent(extractedUrl);
                            } catch {
                              /* ignore */
                            }
                          }
                          return (
                            <iframe
                              src={`${directPdfUrl}#toolbar=0`}
                              className='size-full border-none'
                              title='Contrato PDF'
                            />
                          );
                        })()}
                      </div>
                      <CardContent className='p-3 flex justify-center border-t border-border'>
                        <Button variant='secondary' size='sm' asChild>
                          <a href={contract.pdf_url} target='_blank' rel='noopener noreferrer'>
                            <ExternalLink size={14} /> Abrir documento em tela cheia
                          </a>
                        </Button>
                      </CardContent>
                    </>
                  ) : (
                    <CardContent className='flex flex-col items-center justify-center py-16 text-center'>
                      <FileText size={64} className='text-muted-foreground/50 mb-4' />
                      <p className='font-medium text-card-foreground'>
                        Nenhum documento disponível
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        O PDF original não foi carregado para este contrato.
                      </p>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value='history' className='mt-0'>
                <Card>
                  <CardContent className='py-6'>
                    <div className='relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border'>
                      {contract.history.map((event: ContractHistoryEvent) => (
                        <div key={event.id} className='relative group'>
                          <div className='absolute -left-[27px] top-0 size-8 rounded-full bg-card border border-border flex items-center justify-center ring-4 ring-background group-hover:scale-110 transition-transform'>
                            {event.action === 'created' && (
                              <FilePlus size={14} className='text-blue-500' />
                            )}
                            {event.action === 'sent' && (
                              <Send size={14} className='text-amber-500' />
                            )}
                            {event.action === 'signed' && (
                              <PenTool size={14} className='text-emerald-500' />
                            )}
                            {event.action === 'viewed' && (
                              <Eye size={14} className='text-indigo-500' />
                            )}
                            {!['created', 'sent', 'signed', 'viewed'].includes(event.action) && (
                              <History size={14} className='text-muted-foreground' />
                            )}
                          </div>

                          <div className='space-y-1'>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-[9px] uppercase'>
                                {event.action}
                              </Badge>
                              <span className='text-xs text-muted-foreground'>{event.date}</span>
                            </div>
                            <p className='text-sm font-medium text-card-foreground'>
                              {event.description}
                            </p>
                            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                              <User size={10} />
                              <span>
                                Realizado por:{' '}
                                <span className='font-medium text-card-foreground'>
                                  {event.performed_by}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='audit' className='mt-0'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <PenTool size={16} className='text-primary' /> Timeline de Assinatura
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border'>
                      {contract.signers && contract.signers.length > 0 ? (
                        contract.signers.map((signer: Signer, idx: number) => (
                          <div key={signer.id || idx} className='relative'>
                            <div
                              className={`absolute -left-[19px] top-1 size-4 rounded-full flex items-center justify-center ring-4 ring-background ${
                                signer.status === 'signed'
                                  ? 'bg-emerald-500'
                                  : signer.status === 'viewed'
                                    ? 'bg-blue-500'
                                    : 'bg-muted-foreground/30'
                              }`}
                            >
                              {signer.status === 'signed' ? (
                                <CheckCircle size={10} className='text-white' />
                              ) : signer.status === 'viewed' ? (
                                <Clock size={10} className='text-white' />
                              ) : (
                                <div className='size-1.5 rounded-full bg-muted' />
                              )}
                            </div>
                            <div className='flex items-start justify-between'>
                              <div>
                                <p className='text-xs font-medium text-card-foreground'>
                                  {signer.role === 'owner'
                                    ? 'Proprietário'
                                    : signer.role === 'tenant'
                                      ? 'Inquilino'
                                      : 'Fiador'}{' '}
                                  {signer.status === 'signed'
                                    ? 'Assinou'
                                    : signer.status === 'viewed'
                                      ? 'Visualizou'
                                      : 'Pendente'}
                                </p>
                                <p className='text-[10px] text-muted-foreground'>
                                  {signer.status === 'signed'
                                    ? `IP: ${signer.ip || '187.54.21.10'} • Hash: ${signer.hash || '4x9f...a2'}`
                                    : signer.status === 'viewed'
                                      ? 'Aguardando confirmação digital'
                                      : 'Link de assinatura não acessado'}
                                </p>
                              </div>
                              <span className='text-[10px] text-muted-foreground'>
                                {signer.signed_at
                                  ? new Date(signer.signed_at).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: '2-digit',
                                    })
                                  : signer.viewed_at
                                    ? new Date(signer.viewed_at).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: '2-digit',
                                      })
                                    : ''}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className='text-xs text-muted-foreground italic'>
                          Nenhum signatário registrado.
                        </p>
                      )}
                    </div>

                    <div className='space-y-3 pt-6'>
                      <div className='rounded-lg border bg-muted/50 p-3'>
                        <p className='text-xs text-muted-foreground'>
                          Último envio do link para os pendentes:
                        </p>
                        <p className='text-xs font-medium text-card-foreground mt-0.5'>
                          Há 2 dias (15/04/2026)
                        </p>
                      </div>
                      <Button variant='secondary' className='w-full gap-2'>
                        <Send size={14} />
                        Reenviar Links de Assinatura
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-2'>
              <AlertTriangle size={32} className='text-destructive' />
            </div>
            <AlertDialogTitle className='text-center'>Rescindir Contrato?</AlertDialogTitle>
            <AlertDialogDescription className='text-center'>
              Esta ação irá encerrar a vigência do contrato imediatamente e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='sm:justify-center gap-3'>
            <AlertDialogCancel className='mt-0'>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelContract}
              className='bg-destructive hover:bg-destructive/90'
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
