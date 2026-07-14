import React, { useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  Calendar,
  ArrowUp,
  Search,
  Download,
  FileUp,
  PieChart,
  FileText,
} from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { useFinancials } from './financials/hooks/useFinancials';
import { CashFlowCharts } from './financials/sections/CashFlowCharts';
import { TransactionList } from './financials/sections/TransactionList';
import { AddTransactionModal } from './financials/modals/AddTransactionModal';
import { LateCalculatorModal } from './financials/modals/LateCalculatorModal';
import { ApportionmentModal } from './financials/modals/ApportionmentModal';
import { BankImportModal } from './financials/modals/BankImportModal';
import { VoucherModal } from './financials/modals/VoucherModal';
import { TaxExportModal } from './financials/modals/TaxExportModal';
import { useAuth } from '../context/AuthContext';

const Financials: React.FC = () => {
  const h = useFinancials();
  const { user } = useAuth();
  const [showTaxExport, setShowTaxExport] = React.useState(false);

  // Global cursor spotlight: delegates to all .lg-card elements on the page
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = (e.target as Element).closest('.lg-card') as HTMLElement | null;
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      target.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className='h-full flex flex-col w-full max-w-[1600px] mx-auto relative'>
      <TopBar title='Lançamentos' subtitle='Fluxo de caixa e gestão'>
        <div className='flex gap-1.5 md:gap-2'>
          <button
            onClick={h.handleExport}
            disabled={h.isExporting}
            className='flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-primary/30 transition-all disabled:opacity-50 group'
            title='Exportar Relatório'
          >
            {h.isExporting ? (
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
            ) : (
              <Download
                size={18}
                strokeWidth={1.8}
                className='md:size-5 group-hover:scale-110 transition-transform'
              />
            )}
          </button>
          <button
            onClick={() => h.setShowImportModal(true)}
            className='flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all group'
            title='Conciliação Bancária'
          >
            <FileUp size={18} strokeWidth={1.8} className='md:size-5 group-hover:scale-110 transition-transform' />
          </button>
          <button
            onClick={() => h.setShowApportionment(true)}
            className='hidden sm:flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all group'
            title='Rateio de Despesas'
          >
            <PieChart size={18} strokeWidth={1.8} className='md:size-5 group-hover:scale-110 transition-transform' />
          </button>
          <button
            onClick={() => setShowTaxExport(true)}
            className='hidden sm:flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all group'
            title='Exportar DIMOB / Carnê-Leão'
          >
            <FileText size={18} strokeWidth={1.8} className='md:size-5 group-hover:scale-110 transition-transform' />
          </button>
          <Button onClick={() => h.setShowAddForm(true)} variant='glass' size='default'>
            <Plus size={16} strokeWidth={1.8} /> <span className='hidden sm:inline'>Nova Receita</span>
          </Button>
        </div>
      </TopBar>

      <div className='px-4 py-4 space-y-3 border-b border-white/10'>
        <div className='relative'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} strokeWidth={1.8} />
          <input
            type='text'
            placeholder='Buscar lançamentos (ex: aluguel, conserto...)'
            value={h.searchTerm}
            onChange={(e) => h.setSearchTerm(e.target.value)}
            className='w-full pl-11 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary text-white placeholder-slate-500 transition-all'
          />
        </div>

        <div className='flex gap-3'>
          <div className='relative flex-1'>
            <select
              value={h.selectedPropertyId}
              onChange={(e) => h.setSelectedPropertyId(e.target.value)}
              className='appearance-none w-full h-11 pl-4 pr-10 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-primary cursor-pointer transition-colors'
            >
              <option value='all' className='bg-[#0c0e1a]'>Todos os Imóveis</option>
              {h.properties.map((p) => (
                <option key={p.id} value={p.id} className='bg-[#0c0e1a]'>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500'
              size={20}
              strokeWidth={1.8}
            />
          </div>
          <div className='h-11 px-2 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-white flex items-center gap-1 whitespace-nowrap'>
            <button
              onClick={h.handlePrevMonth}
              className='p-1.5 hover:bg-white/10 rounded-full transition-colors'
            >
              <ArrowLeft size={14} strokeWidth={1.8} />
            </button>
            <div className='flex items-center gap-2 px-1'>
              <Calendar size={16} strokeWidth={1.8} className='text-primary' />
              <span className='min-w-[60px] text-center capitalize text-slate-300'>
                {h.selectedDate
                  .toLocaleString('pt-BR', { month: 'short', year: '2-digit' })
                  .replace('.', '')}
              </span>
            </div>
            <button
              onClick={h.handleNextMonth}
              className='p-1.5 hover:bg-white/10 rounded-full transition-colors'
            >
              <ArrowUp size={14} strokeWidth={1.8} className='rotate-90' />
            </button>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-4 pt-10 pb-24'>
        {h.isLoadingTransactions ? (
          <div className='flex items-center justify-center py-20'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          </div>
        ) : (
          <>
            <CashFlowCharts
              trendData={h.trendData}
              forecastData={h.forecastData}
              totalForecast={h.totalForecast}
            />
            <TransactionList
              transactions={h.filteredTransactions}
              properties={h.properties}
              contracts={h.contracts}
              totalReceived={h.totalReceived}
              totalPending={h.totalPending}
              pendingCount={h.pendingCount}
              onShowLateCalculator={() => h.setShowLateCalculator(true)}
              onSelectVoucher={(url) => h.setSelectedVoucher(url)}
              onEdit={h.openEditForm}
              onDelete={h.handleDeleteTransaction}
            />
          </>
        )}
      </div>

      <AddTransactionModal
        show={h.showAddForm}
        onClose={() => {
          h.setShowAddForm(false);
          h.setEditingTransaction(null);
        }}
        editingId={h.editingTransaction?.id}
        transactionType={h.transactionType}
        onTypeChange={h.setTransactionType}
        txValue={h.txValue}
        onValueChange={h.setTxValue}
        txDescription={h.txDescription}
        onDescriptionChange={h.setTxDescription}
        txCategory={h.txCategory}
        onCategoryChange={h.setTxCategory}
        txDate={h.txDate}
        onDateChange={h.setTxDate}
        txProperty={h.txProperty}
        onPropertyChange={h.setTxProperty}
        txStatus={h.txStatus}
        onStatusChange={h.setTxStatus}
        isRecurring={h.isRecurring}
        onRecurringChange={h.setIsRecurring}
        hasAttachment={h.hasAttachment}
        onAttachmentChange={h.setHasAttachment}
        properties={h.properties}
        onSave={h.handleSaveTransaction}
        isPending={h.createTransactionMutation.isPending}
      />

      <LateCalculatorModal
        show={h.showLateCalculator}
        onClose={() => h.setShowLateCalculator(false)}
        lateOriginalValue={h.lateOriginalValue}
        onLateOriginalValueChange={h.setLateOriginalValue}
        lateDueDate={h.lateDueDate}
        onLateDueDateChange={h.setLateDueDate}
        lateResult={h.lateResult}
        onCalculate={h.handleCalculateLate}
      />

      <ApportionmentModal
        show={h.showApportionment}
        onClose={() => h.setShowApportionment(false)}
        apportionTotal={h.apportionTotal}
        onApportionTotalChange={h.setApportionTotal}
        apportionMethod={h.apportionMethod}
        onApportionMethodChange={h.setApportionMethod}
        apportionResult={h.apportionResult}
        mockUnits={h.units}
        selectedUnitsIds={h.selectedUnitsIds}
        onToggleUnit={h.toggleUnitSelection}
        onCalculate={h.handleCalculateApportionment}
      />

      <BankImportModal
        show={h.showImportModal}
        onClose={() => h.setShowImportModal(false)}
        isProcessingFile={h.isProcessingFile}
        importResult={h.importResult}
        onFileUpload={h.handleBankFileUpload}
        onClearResult={() => h.setImportResult([])}
      />

      <VoucherModal voucherUrl={h.selectedVoucher} onClose={() => h.setSelectedVoucher(null)} />

      {showTaxExport && (
        <TaxExportModal ownerId={user?.id || ''} onClose={() => setShowTaxExport(false)} />
      )}
    </div>
  );
};

export default Financials;
