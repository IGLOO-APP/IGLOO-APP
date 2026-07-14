import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertCircle, ShieldCheck, ArrowUp } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';

interface PortfolioHealthProps {
  health: {
    yield: string;
    vacancy: string;
    delinquency: string;
    delinquencyAbsolute: number;
  };
}

const ShadTooltipTrigger = ({ title, description }: { title: string; description: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className='w-3 h-3 rounded-full bg-muted-foreground/10 text-muted-foreground flex items-center justify-center text-[7px] font-bold leading-none cursor-help'>
        ?
      </TooltipTrigger>
      <TooltipContent side='top' className='max-w-52'>
        <p className='text-[9px] font-semibold mb-1'>{title}</p>
        <p className='text-[10px] leading-snug font-medium'>{description}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const PortfolioHealth: React.FC<PortfolioHealthProps> = ({ health }) => {
  const navigate = useNavigate();
  const parseVal = (val: string | number) => {
    if (!val) return 0;
    const cleaned = typeof val === 'string' ? val.replace(/[^\d.-]/g, '') : val;
    return parseFloat(cleaned as string) || 0;
  };

  const isHealthyVacancy = parseVal(health?.vacancy) === 0;
  const isHealthyDelinquency = parseVal(health?.delinquency) === 0;

  return (
    <div className='w-full grid grid-cols-1 md:grid-cols-3 gap-3'>
      {/* Yield Médio */}
      <div className='lg-card lg-card-lift p-4 flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-primary/10 text-primary shrink-0 relative z-10'>
          <TrendingUp size={15} />
        </div>
        <div className='relative z-10 flex-1'>
          <div className='flex items-center gap-1.5 mb-0.5'>
            <p className='text-xs font-medium text-muted-foreground'>Yield Médio</p>
            <ShadTooltipTrigger
              title='Análise de Yield'
              description='Retorno anual médio da carteira. Calculado como (Receita Anual / Valor Patrimonial) × 100.'
            />
          </div>
          <div className='flex items-center gap-1.5'>
            <p className='text-base font-bold text-foreground'>{health?.yield || '0'}%</p>
            <Badge variant='outline' className='items-center gap-0.5'>
              <ArrowUp size={9} />
              0.2%
            </Badge>
          </div>
        </div>
      </div>

      {/* Vacância Financeira */}
      <div className='lg-card lg-card-lift p-4 flex items-center gap-3'>
        <div
          className={`p-2 rounded-xl shrink-0 relative z-10 ${isHealthyVacancy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}
        >
          <AlertCircle size={16} />
        </div>
        <div className='relative z-10 flex-1'>
          <div className='flex items-center gap-1.5 mb-0.5'>
            <p className='text-xs font-medium text-muted-foreground'>Vacância Financeira</p>
            <ShadTooltipTrigger
              title='Cálculo de Vacância Financeira'
              description='Percentual da receita potencial perdida por imóveis vagos. Diferente da ocupação física (número de imóveis), esta métrica reflete o impacto financeiro real na sua receita.'
            />
          </div>
          {isHealthyVacancy ? (
            <Badge variant='outline' className='text-emerald-500 uppercase'>
              Carteira 100% ocupada
            </Badge>
          ) : (
            <div className='flex items-center gap-3'>
              <p className='text-base font-bold text-foreground'>{health?.vacancy || '0'}%</p>
              <Button
                onClick={() => navigate('/properties')}
                variant='link'
                size='sm'
                className='text-xs font-semibold'
              >
                Agir Agora
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Inadimplência */}
      <div className='lg-card lg-card-lift p-4 flex items-center gap-3'>
        <div
          className={`p-2 rounded-xl shrink-0 relative z-10 ${isHealthyDelinquency ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
        >
          <ShieldCheck size={16} />
        </div>
        <div className='relative z-10 flex-1'>
          <div className='flex items-center gap-1.5 mb-0.5'>
            <p className='text-xs font-medium text-muted-foreground'>Inadimplência</p>
            <ShadTooltipTrigger
              title='Inadimplência Real'
              description='Percentual do valor total em aberto sobre a receita esperada do mês.'
            />
          </div>
          {isHealthyDelinquency ? (
            <Badge variant='outline' className='text-emerald-500 uppercase'>
              Sem inadimplência
            </Badge>
          ) : (
            <div className='flex items-center gap-1.5'>
              <p className='text-base font-bold text-red-500'>{health?.delinquency || '0'}%</p>
              <span className='text-[9px] font-bold text-red-500/70'>
                ({formatCurrency(health?.delinquencyAbsolute || 0)})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
