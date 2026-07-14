import React, { useMemo, useState } from 'react';
import { Zap, ArrowUpRight } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { executeWorkflowAction } from '../../../services/workflow/workflowActions';

interface DashboardAIInsightsProps {
  metrics: {
    occupancyRate: number;
    pendingMaintenanceCount: number;
    expiringContractsCount: number;
  };
  onActionComplete?: () => void;
}

export const DashboardAIInsights: React.FC<DashboardAIInsightsProps> = ({
  metrics,
  onActionComplete,
}) => {
  const [confirmAction, setConfirmAction] = useState<{ endpoint: string; label: string } | null>(
    null
  );

  const safeMetrics = useMemo(
    () => ({
      occupancyRate: metrics?.occupancyRate ?? 0,
      pendingMaintenanceCount: metrics?.pendingMaintenanceCount ?? 0,
      expiringContractsCount: metrics?.expiringContractsCount ?? 0,
    }),
    [metrics]
  );

  const { occupancyRate, pendingMaintenanceCount, expiringContractsCount } = safeMetrics;

  const handleAction = async (endpoint: string) => {
    try {
      await executeWorkflowAction(endpoint);
      onActionComplete?.();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  return (
    <div className='lg-card lg-card-lift flex flex-col'>
      <div className='flex flex-row items-center justify-between p-6 pb-0 w-full gap-1.5'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
            <Zap size={16} strokeWidth={1.8} />
          </div>
          <div>
            <h3 className='font-bold text-base text-foreground tracking-tight'>Igloo Insights</h3>
            <p className='text-xs font-medium text-muted-foreground'>Financial Advisor</p>
          </div>
        </div>
        <Badge variant='outline'>
          <span className='w-1 h-1 rounded-full bg-emerald-500' />
          Live Analysis
        </Badge>
      </div>

      <div className='p-6 pt-4 space-y-3 flex flex-col flex-grow'>
        {/* Occupancy Insight */}
        <div className='flex flex-col gap-2 p-4 rounded-[24px] bg-muted/50 border border-border/50'>
          <div className='flex items-start gap-3'>
            <div
              className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${occupancyRate < 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
            />
            <div className='space-y-0.5'>
              <p className='text-[10px] font-semibold text-muted-foreground'>
                Ocupação da Carteira
              </p>
              <p className='text-xs font-bold text-muted-foreground leading-relaxed'>
                {occupancyRate < 80
                  ? 'Sua vacância está acima do ideal. Considere revisar os preços.'
                  : 'Ocupação excelente! Sua carteira está performando acima da média.'}
              </p>
            </div>
          </div>
          {occupancyRate < 80 && (
            <Button
              onClick={() =>
                setConfirmAction({
                  endpoint: '/api/imoveis/sugestao-preco',
                  label: 'revisar os preços dos imóveis',
                })
              }
              variant='link'
              size='sm'
              className='text-xs font-semibold self-end'
            >
              Revisar preço
            </Button>
          )}
        </div>

        {/* Maintenance Insight */}
        {pendingMaintenanceCount > 0 && (
          <div className='flex flex-col gap-2 p-4 rounded-[24px] bg-muted/50 border border-border/50'>
            <div className='flex items-start gap-3'>
              <div className='mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0' />
              <div className='space-y-0.5'>
                <p className='text-[10px] font-semibold text-muted-foreground'>
                  Manutenção Preventiva
                </p>
                <p className='text-xs font-bold text-muted-foreground leading-relaxed'>
                  Existem {pendingMaintenanceCount} reparos pendentes.
                </p>
              </div>
            </div>
            <Button
              onClick={() =>
                setConfirmAction({
                  endpoint: '/api/manutencao/resolver',
                  label: 'resolver os reparos pendentes',
                })
              }
              variant='link'
              size='sm'
              className='text-xs font-semibold self-end'
            >
              Resolver reparo
            </Button>
          </div>
        )}

        {/* Contracts Insight */}
        <div className='flex items-start gap-3 p-4 rounded-[24px] bg-muted/50 border border-border/50'>
          <div
            className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${expiringContractsCount > 0 ? 'bg-blue-500' : 'bg-emerald-500'}`}
          />
          <div className='space-y-0.5'>
            <p className='text-[10px] font-semibold text-muted-foreground'>Vigência de Contratos</p>
            <p className='text-xs font-bold text-muted-foreground leading-relaxed'>
              {expiringContractsCount > 0
                ? `${expiringContractsCount} contrato(s) vencendo em breve.`
                : 'Nenhum contrato vencendo nos próximos 30 dias.'}
            </p>
          </div>
        </div>

        <div className='mt-auto pt-4'>
          <Button
            variant='secondary'
            size='sm'
            className='w-full text-xs font-semibold flex items-center justify-center gap-2'
          >
            Ver Recomendações
            <ArrowUpRight size={14} strokeWidth={1.8} />
          </Button>
        </div>
      </div>

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente {confirmAction?.label}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction) handleAction(confirmAction.endpoint);
                setConfirmAction(null);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
