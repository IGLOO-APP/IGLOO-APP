import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, TrendingDown, ChevronRight, BarChart3 } from 'lucide-react';
import { SectionHeader, EmptyState } from '../../../components/ui/DashboardComponents';
import { formatCurrency } from '../../../utils/formatters';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';

interface PropertyPerformanceProps {
  topProperties: any[];
}

export const PropertyPerformance: React.FC<PropertyPerformanceProps> = ({ topProperties = [] }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className='pb-0'>
        <SectionHeader
          title='Performance por Ativo'
          icon={BarChart3}
          iconColor='text-primary'
          action={
            <Button
              onClick={() => navigate('/properties')}
              variant='link'
              size='sm'
              className='text-xs font-semibold'
            >
              Ver Todos
            </Button>
          }
        />
      </CardHeader>
      <CardContent className='pt-4'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='text-xs font-semibold text-muted-foreground border-none'>
                <TableHead className='pb-1.5 pl-2 text-muted-foreground'>Propriedade</TableHead>
                <TableHead className='pb-1.5 text-right text-muted-foreground'>Receita Mensal</TableHead>
                <TableHead className='pb-1.5 text-right px-3 text-muted-foreground'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className='cursor-help border-b border-dotted border-border pb-0.5'>
                        Yield (a.m)
                      </TooltipTrigger>
                      <TooltipContent side='top'>
                        Eficiência do capital. Valor do aluguel / Valor de mercado.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className='pb-2 text-center text-muted-foreground'>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProperties && topProperties.length > 0 ? (
                topProperties.map((prop: any) => {
                  const yieldVal = parseFloat(prop.yield) || 0;
                  const revenueVal = parseFloat(prop.revenue) || 0;

                  return (
                    <TableRow
                      key={prop.id}
                      onClick={() => navigate(`/properties?id=${prop.id}`)}
                      className='group hover:bg-accent/50 transition-all duration-200 cursor-pointer border-none'
                    >
                      <TableCell className='py-2 pl-2 rounded-l-2xl'>
                        <div className='flex items-center gap-2.5'>
                          {prop.image ? (
                            <div
                              className='w-8 h-8 rounded-xl bg-cover bg-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500'
                              style={{ backgroundImage: `url(${prop.image})` }}
                            />
                          ) : (
                            <div className='w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0'>
                              <Home size={15} />
                            </div>
                          )}
                          <span className='text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors'>
                            {prop.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='py-2 text-right text-xs font-bold text-muted-foreground'>
                        {formatCurrency(revenueVal)}
                      </TableCell>
                      <TableCell className='py-2 text-right px-3'>
                        <div className='flex items-center justify-end gap-1'>
                          <span
                            className={`font-bold ${yieldVal > 0.5 ? 'text-emerald-500' : 'text-amber-500'}`}
                          >
                            {yieldVal > 0 ? `${yieldVal}%` : '0%'}
                          </span>
                          {yieldVal > 0.6 ? (
                            <TrendingUp size={12} className='text-emerald-500/50' />
                          ) : (
                            <TrendingDown size={12} className='text-amber-500/50' />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='py-3 text-center rounded-r-2xl pr-2'>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className='inline-block'>
                              <div
                                className={`w-2.5 h-2.5 rounded-full mx-auto relative ${
                                  prop.status === 'occupied'
                                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                    : prop.status === 'warning'
                                      ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse'
                                      : prop.status === 'vacant'
                                        ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'
                                        : 'bg-slate-400'
                                }`}
                              >
                                {(prop.status === 'warning' || prop.status === 'vacant') && (
                                  <div
                                    className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
                                      prop.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                  />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side='top'>
                              {prop.status === 'occupied'
                                ? 'Estável'
                                : prop.status === 'warning'
                                  ? 'Atenção'
                                  : prop.status === 'vacant'
                                    ? 'Vago'
                                    : 'Sem Status'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className='border-none'>
                  <TableCell colSpan={4}>
                    <EmptyState icon={BarChart3} message='Sem dados de performance disponíveis' />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className='flex justify-end'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate('/financials')}
            className='text-xs font-medium text-muted-foreground'
          >
            Análise Completa{' '}
            <ChevronRight
              size={12}
              className='ml-1 group-hover:translate-x-1 transition-transform'
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
