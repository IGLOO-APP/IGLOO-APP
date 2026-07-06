import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../../../services/financeService';
import { propertyService } from '../../../services/propertyService';
import { contractService } from '../../../services/contractService';
import { useAuth } from '../../../context/AuthContext';
import {
  calculateLateFee,
  calculateApportionment,
  UnitParams,
} from '../../../utils/financialCalculations';
import { formatCurrency } from '../../../utils/formatters';
import type {
  FinancialTransaction,
  LateFeeResult,
  ApportionmentResult,
  MatchedBankTransaction,
  Property,
  Contract,
} from '../../../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function useFinancials() {
  const { user, tokenReady } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();

  const [selectedPropertyId, setSelectedPropertyId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLateCalculator, setShowLateCalculator] = useState(false);
  const [showApportionment, setShowApportionment] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);

  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [txValue, setTxValue] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txProperty, setTxProperty] = useState('');
  const [txStatus, setTxStatus] = useState<'paid' | 'pending'>('paid');
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasAttachment, setHasAttachment] = useState(false);

  const [lateOriginalValue, setLateOriginalValue] = useState('');
  const [lateDueDate, setLateDueDate] = useState('');
  const [lateResult, setLateResult] = useState<LateFeeResult | null>(null);

  const [apportionTotal, setApportionTotal] = useState('');
  const [apportionMethod, setApportionMethod] = useState<'fixed' | 'people'>('fixed');
  const [apportionResult, setApportionResult] = useState<ApportionmentResult | null>(null);
  const [units, setUnits] = useState<UnitParams[]>([]);
  const [selectedUnitsIds, setSelectedUnitsIds] = useState<string[]>([]);

  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [importResult, setImportResult] = useState<MatchedBankTransaction[]>([]);

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['financial_transactions', user?.id],
    queryFn: () => financeService.getAll(),
    enabled: !!user && tokenReady,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: () => propertyService.getAll(),
    enabled: !!user && tokenReady,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts', user?.id],
    queryFn: () => contractService.getAll(),
    enabled: !!user && tokenReady,
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>) =>
      financeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      setShowAddForm(false);
      resetForm();
    },
    onError: (error: Error) => alert(`Erro ao salvar: ${error.message}`),
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FinancialTransaction> }) =>
      financeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      setShowAddForm(false);
      setEditingTransaction(null);
      resetForm();
    },
    onError: (error: Error) => alert(`Erro ao atualizar: ${error.message}`),
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => financeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
    },
    onError: (error: Error) => alert(`Erro ao excluir: ${error.message}`),
  });

  const handlePrevMonth = () =>
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));

  const resetForm = () => {
    setTxValue('');
    setTxDescription('');
    setTxCategory('');
    setTxProperty('');
    setIsRecurring(false);
    setHasAttachment(false);
    setTransactionType('income');
    setTxStatus('paid');
    setTxDate(new Date().toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (!showAddForm) resetForm();
  }, [showAddForm]);

  useEffect(() => {
    const state = location.state as Record<string, unknown> | null;
    if (state?.openAdd) {
      setShowAddForm(true);
      if (state.type === 'income' || state.type === 'expense') setTransactionType(state.type);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const trendData = useMemo(() => {
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
      const monthTransactions = transactions.filter((t) => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
      });
      last6Months.push({
        name: months[d.getMonth()],
        receita: monthTransactions
          .filter((t) => t.type === 'income' && t.status === 'paid')
          .reduce((sum, t) => sum + Number(t.amount), 0),
        despesa: monthTransactions
          .filter((t) => t.type === 'expense' && t.status === 'paid')
          .reduce((sum, t) => sum + Number(t.amount), 0),
      });
    }
    return last6Months;
  }, [transactions, selectedDate]);

  const forecastData = useMemo(() => {
    const activeValue = contracts
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + (c.numeric_value || 0), 0);
    const forecast = [];
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = monthDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      forecast.push({
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        valor: activeValue,
      });
    }
    return forecast;
  }, [contracts]);

  const totalForecast = forecastData.reduce((sum, item) => sum + item.valor, 0);

  const filteredTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date);
    return (
      txDate.getMonth() === selectedDate.getMonth() &&
      txDate.getFullYear() === selectedDate.getFullYear() &&
      (t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedPropertyId === 'all' || t.property_id === selectedPropertyId)
    );
  });

  const pendingTransactions = transactions.filter((t) => t.status === 'pending');
  const totalPending = pendingTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const pendingCount = pendingTransactions.length;

  const totalReceived = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear() &&
        t.type === 'income' &&
        t.status === 'paid'
      );
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const handleCalculateLate = () => {
    if (!lateOriginalValue || !lateDueDate) return;
    setLateResult(calculateLateFee(parseFloat(lateOriginalValue), lateDueDate));
  };

  const toggleUnitSelection = (id: string) => {
    setSelectedUnitsIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
    setApportionResult(null);
  };

  const handleCalculateApportionment = () => {
    if (!apportionTotal) return;
    const activeUnits = units.filter((u) => selectedUnitsIds.includes(u.id));
    if (activeUnits.length === 0) {
      alert('Selecione pelo menos uma unidade.');
      return;
    }
    setApportionResult(
      calculateApportionment(parseFloat(apportionTotal), activeUnits, apportionMethod)
    );
  };

  const handleBankFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessingFile(true);
      try {
        const importedTxs = await financeService.processBankFile(e.target.files[0]);
        setImportResult(financeService.matchTransactions(importedTxs, transactions));
      } catch (err) {
        console.error('Erro ao processar arquivo bancário:', err);
        alert('Erro ao processar arquivo bancário.');
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

  const openEditForm = (tx: FinancialTransaction) => {
    setEditingTransaction(tx);
    setTransactionType(tx.type);
    setTxValue(String(tx.amount));
    setTxDescription(tx.title);
    setTxCategory(tx.category || '');
    setTxDate(tx.date);
    setTxProperty(tx.property_id || '');
    setTxStatus(tx.status);
    setIsRecurring(tx.is_recurring);
    setHasAttachment(!!tx.attachment_url);
    setShowAddForm(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const numericAmount = parseFloat(String(txValue).replace(',', '.'));
    if (isNaN(numericAmount)) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    if (editingTransaction) {
      updateTransactionMutation.mutate({
        id: editingTransaction.id,
        data: {
          title: txDescription,
          amount: numericAmount,
          type: transactionType,
          category: txCategory,
          date: txDate,
          property_id: txProperty || undefined,
          status: txStatus,
          is_recurring: isRecurring,
        },
      });
    } else {
      createTransactionMutation.mutate({
        owner_id: user.id,
        property_id: txProperty || undefined,
        title: txDescription,
        amount: numericAmount,
        type: transactionType,
        category: txCategory,
        date: txDate,
        status: txStatus,
        is_recurring: isRecurring,
      });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80);
      doc.text('Relatório Financeiro - IGLOO', 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);

      autoTable(doc, {
        startY: 35,
        head: [['Resumo Financeiro', 'Valor']],
        body: [
          ['Total Recebido', formatCurrency(totalReceived)],
          ['Total Pendente', formatCurrency(totalPending)],
          ['Saldo Atual', formatCurrency(totalReceived - totalPending)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
      });

      const tableData = filteredTransactions.map((tx) => [
        tx.date,
        tx.title,
        (properties as Property[]).find((p) => p.id === tx.property_id)?.name || 'N/A',
        tx.type === 'income' ? 'Receita' : 'Despesa',
        tx.status === 'paid' ? 'Pago' : 'Pendente',
        formatCurrency(tx.amount),
      ]);

      const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
      autoTable(doc, {
        startY: lastTable ? lastTable.finalY + 15 : 50,
        head: [['Data', 'Título', 'Imóvel', 'Tipo', 'Status', 'Valor']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] },
      });

      doc.save(`Relatorio_Financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao gerar relatório.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    transactions,
    isLoadingTransactions,
    properties,
    contracts,
    selectedPropertyId,
    setSelectedPropertyId,
    selectedDate,
    handlePrevMonth,
    handleNextMonth,
    trendData,
    forecastData,
    totalForecast,
    filteredTransactions,
    totalReceived,
    totalPending,
    pendingCount,
    searchTerm,
    setSearchTerm,
    isExporting,
    handleExport,
    showAddForm,
    setShowAddForm,
    showLateCalculator,
    setShowLateCalculator,
    showApportionment,
    setShowApportionment,
    showImportModal,
    setShowImportModal,
    selectedVoucher,
    setSelectedVoucher,
    transactionType,
    setTransactionType,
    txValue,
    setTxValue,
    txDescription,
    setTxDescription,
    txCategory,
    setTxCategory,
    txDate,
    setTxDate,
    txProperty,
    setTxProperty,
    txStatus,
    setTxStatus,
    isRecurring,
    setIsRecurring,
    hasAttachment,
    setHasAttachment,
    lateOriginalValue,
    setLateOriginalValue,
    lateDueDate,
    setLateDueDate,
    lateResult,
    handleCalculateLate,
    apportionTotal,
    setApportionTotal,
    apportionMethod,
    setApportionMethod,
    apportionResult,
    handleCalculateApportionment,
    units,
    selectedUnitsIds,
    toggleUnitSelection,
    isProcessingFile,
    importResult,
    setImportResult,
    handleBankFileUpload,
    handleSaveTransaction,
    createTransactionMutation,
    updateTransactionMutation,
    deleteTransactionMutation,
    editingTransaction,
    setEditingTransaction,
    openEditForm,
    handleDeleteTransaction,
  };
}
