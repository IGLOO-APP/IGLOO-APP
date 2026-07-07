import React from 'react';
import {
  Search,
  Building2,
  Eye,
  Download,
  ArrowUp,
  Calculator,
  Pencil,
  Trash2,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReceiptPDFTemplate } from '../../../components/pdf/ReceiptPDFTemplate';

import type { FinancialTransaction, Property, Contract } from '../../../types';

interface TransactionListProps {
  transactions: FinancialTransaction[];
  properties: Property[];
  contracts: Contract[];
  totalReceived: number;
  totalPending: number;
  pendingCount: number;
  onShowLateCalculator: () => void;
  onSelectVoucher: (url: string | null) => void;
  onEdit?: (tx: FinancialTransaction) => void;
  onDelete?: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  properties,
  contracts,
  totalReceived,
  totalPending,
  pendingCount,
  onShowLateCalculator,
  onSelectVoucher,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      <section className='mb-6'>
        <div className='flex overflow-x-auto gap-4 pb-4 hide-scrollbar'>
          <div className='shrink-0 w-[240px] p-5 rounded-2xl bg-card text-card-foreground border border-border shadow-sm relative overflow-hidden transition-colors'>
            <p className='text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 relative z-10'>
              Total Recebido
            </p>
            <p className='text-slate-900 dark:text-white text-2xl font-bold relative z-10'>
              {formatCurrency(totalReceived)}
            </p>
            <div className='mt-4 flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-1 rounded-md'>
              <ArrowUp size={16} />
              <span className='text-xs font-bold'>
                {totalReceived > 0
                  ? `${formatCurrency(totalReceived)} neste período`
                  : 'Nenhuma receita no período'}
              </span>
            </div>
          </div>
          <div
            onClick={onShowLateCalculator}
            className='shrink-0 w-[240px] p-5 rounded-2xl bg-card text-card-foreground border border-border shadow-sm relative overflow-hidden transition-colors cursor-pointer group hover:border-orange-200 dark:hover:border-orange-900/50'
          >
            <div className='absolute top-0 right-0 p-3 opacity-10'>
              <Calculator
                size={64}
                className='text-orange-500 group-hover:scale-110 transition-transform'
              />
            </div>
            <p className='text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 relative z-10'>
              Total Pendente
            </p>
            <p className='text-slate-900 dark:text-white text-2xl font-bold relative z-10'>
              {formatCurrency(totalPending)}
            </p>
            <div className='mt-4 flex items-center gap-1 text-orange-500 text-xs font-bold relative z-10 bg-orange-50 dark:bg-orange-900/20 w-fit px-2 py-1 rounded-md'>
              <span className='group-hover:hidden'>
                {pendingCount} {pendingCount === 1 ? 'Fatura' : 'Faturas'}
              </span>
              <span className='hidden group-hover:inline'>Simular Juros</span>
            </div>
          </div>
        </div>
      </section>

      <section className='flex flex-col gap-2'>
        <div className='py-2 flex justify-between items-center'>
          <h4 className='text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider'>
            Lançamentos Recentes
          </h4>
          <span className='text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md'>
            {transactions.length} itens
          </span>
        </div>

        {transactions.map((tx) => (
          <div
            key={tx.id}
            className='group flex items-center gap-4 p-4 rounded-xl bg-card text-card-foreground border border-border hover:border-primary/30 shadow-sm cursor-pointer transition-colors'
          >
            <div
              className={`flex items-center justify-center rounded-xl shrink-0 size-12 ${tx.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'}`}
            >
              <Building2 size={24} />
            </div>
            <div className='flex flex-col flex-1 min-w-0'>
              <div className='flex justify-between items-start'>
                <p className='text-slate-900 dark:text-white text-base font-bold truncate'>
                  {tx.title}
                </p>
                <p
                  className={`text-base font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}
                >
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </p>
              </div>
              <div className='flex justify-between items-center mt-1'>
                <p className='text-slate-400 text-sm font-medium truncate'>
                  {new Date(tx.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  })}{' '}
                  • {properties.find((p) => p.id === tx.property_id)?.name || 'Sem Imóvel'}
                </p>
                <div className='flex items-center gap-2'>
                  {tx.hasAttachment && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVoucher(tx.attachment_url || null);
                      }}
                      className='p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-primary transition-colors'
                      title='Ver Comprovante'
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  {tx.status === 'paid' && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <PDFDownloadLink
                        document={
                          <ReceiptPDFTemplate
                            transaction={{
                              id: tx.id,
                              title: tx.title,
                              amount: Number(tx.amount),
                              date: tx.date,
                              category: tx.category,
                              propertyName:
                                properties.find((p) => p.id === tx.property_id)?.name ||
                                'Sem Imóvel',
                            }}
                            tenantName={
                              contracts.find(
                                (c) =>
                                  c.property ===
                                  properties.find((p) => p.id === tx.property_id)?.name
                              )?.tenant_name || 'Inquilino'
                            }
                          />
                        }
                        fileName={`Recibo_${tx.title.replace(/\s+/g, '_')}_${tx.date}.pdf`}
                        className='p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-primary transition-colors flex items-center justify-center'
                        title='Baixar Recibo PDF'
                      >
                        {({ loading }) =>
                          loading ? (
                            <div className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                          ) : (
                            <Download size={14} />
                          )
                        }
                      </PDFDownloadLink>
                    </div>
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${tx.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'}`}
                  >
                    {tx.status === 'paid' ? 'Pago' : 'Pendente'}
                  </span>
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(tx);
                      }}
                      className='p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-primary transition-colors'
                      title='Editar'
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(tx.id);
                      }}
                      className='p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-red-500 transition-colors'
                      title='Excluir'
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <div className='py-12 text-center text-slate-400'>
            <Search size={40} className='mx-auto mb-3 opacity-20' />
            <p>Nenhum lançamento encontrado.</p>
          </div>
        )}
      </section>
    </>
  );
};
