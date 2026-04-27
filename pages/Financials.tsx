import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  Calendar,
  ArrowUp,
  Wrench,
  Building2,
  TrendingUp,
  AlertTriangle,
  DoorOpen,
  X,
  Calculator,
  PieChart,
  Users,
  DollarSign,
  Check,
  CheckCircle,
  Search,
  Download,
  UploadCloud,
  Repeat,
  Tag,
  FileText,
  Home,
  MoreHorizontal,
  Clock,
  Eye,
  FileUp,
  Info,
} from 'lucide-react';
import { ModalWrapper } from '../components/ui/ModalWrapper';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import {
  calculateLateFee,
  calculateApportionment,
  UnitParams,
} from '../utils/financialCalculations';
import { financeService, BankTransaction } from '../services/financeService';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { contractService } from '../services/contractService';
import { propertyService } from '../services/propertyService';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';





const Financials: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPropertyId, setSelectedPropertyId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  // Queries
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['financial_transactions'],
    queryFn: () => financeService.getAll(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyService.getAll(),
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractService.getAll(),
  });

  // Mutations
  const createTransactionMutation = useMutation({
    mutationFn: (data: any) => financeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      setShowAddForm(false);
      resetForm();
    },
    onError: (error: any) => {
      alert(`Erro ao salvar: ${error.message}`);
    },
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [showLateCalculator, setShowLateCalculator] = useState(false);
  const [showApportionment, setShowApportionment] = useState(false);
  const [showImportModal, setShowApportImportModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Transaction Form State
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [txValue, setTxValue] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txProperty, setTxProperty] = useState('');
  const [txStatus, setTxStatus] = useState<'paid' | 'pending'>('paid');
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasAttachment, setHasAttachment] = useState(false);

  const location = useLocation();

  // Late Calculator State
  const [lateOriginalValue, setLateOriginalValue] = useState('');
  const [lateDueDate, setLateDueDate] = useState('');
  const [lateResult, setLateResult] = useState<any>(null);

  // Apportionment State
  const [apportionTotal, setApportionTotal] = useState('');
  const [apportionMethod, setApportionMethod] = useState<'fixed' | 'people'>('fixed');
  const [apportionResult, setApportionResult] = useState<any>(null);

  // Mock Units for Apportionment
  const [mockUnits, setMockUnits] = useState<UnitParams[]>([
    { id: '1', name: 'Kitnet 01', isOccupied: true, residentsCount: 2 },
    { id: '2', name: 'Kitnet 02', isOccupied: true, residentsCount: 1 },
    { id: '3', name: 'Kitnet 03', isOccupied: false, residentsCount: 0 },
    { id: '4', name: 'Kitnet 04', isOccupied: true, residentsCount: 2 },
    { id: '5', name: 'Kitnet 05', isOccupied: true, residentsCount: 1 },
  ]);

  const [selectedUnitsIds, setSelectedUnitsIds] = useState<string[]>(['1', '2', '3', '4', '5']);

  // Bank Conciliation State
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [importResult, setImportResult] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bankFileInputRef] = [useRef<HTMLInputElement>(null)];
  

  const trendData = React.useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
      const monthIndex = d.getMonth();
      const monthYear = `${months[monthIndex]} ${d.getFullYear().toString().slice(2)}`;
      
      const monthTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === monthIndex && txDate.getFullYear() === d.getFullYear();
      });
      
      const receita = monthTransactions
        .filter(t => t.type === 'income' && t.status === 'paid')
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      const despesa = monthTransactions
        .filter(t => t.type === 'expense' && t.status === 'paid')
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      last6Months.push({
        name: months[monthIndex],
        receita,
        despesa
      });
    }
    return last6Months;
  }, [transactions, selectedDate]);

  const forecastData = React.useMemo(() => {
    const activeValue = contracts
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.numeric_value || 0), 0);
    
    const months = ['Mai', 'Jun', 'Jul']; // Dynamic based on current month in real app
    const now = new Date();
    const forecast = [];
    
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

  useEffect(() => {
    if (location.state && (location.state as any).openAdd) {
      setShowAddForm(true);
      if ((location.state as any).type) {
        setTransactionType((location.state as any).type);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!showAddForm) {
      resetForm();
    }
  }, [showAddForm]);

  const handleCalculateLate = () => {
    if (!lateOriginalValue || !lateDueDate) return;
    const result = calculateLateFee(parseFloat(lateOriginalValue), lateDueDate);
    setLateResult(result);
  };

  const toggleUnitSelection = (id: string) => {
    if (selectedUnitsIds.includes(id)) {
      setSelectedUnitsIds(selectedUnitsIds.filter((uid) => uid !== id));
    } else {
      setSelectedUnitsIds([...selectedUnitsIds, id]);
    }
    setApportionResult(null);
  };

  const handleCalculateApportionment = () => {
    if (!apportionTotal) return;
    const activeUnits = mockUnits.filter((u) => selectedUnitsIds.includes(u.id));

    if (activeUnits.length === 0) {
      alert('Selecione pelo menos uma unidade.');
      return;
    }

    const result = calculateApportionment(parseFloat(apportionTotal), activeUnits, apportionMethod);
    setApportionResult(result);
  };

  const handleBankFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessingFile(true);
      try {
        const importedTxs = await financeService.processBankFile(e.target.files[0]);
        // Tenta cruzar com os lançamentos reais do banco
        const matched = financeService.matchTransactions(importedTxs, transactions);
        setImportResult(matched);
      } catch (error) {
        console.error('Erro ao processar arquivo bancário:', error);
        alert('Erro ao processar arquivo bancário.');
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setHasAttachment(true);
    }
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const numericAmount = parseFloat(txValue.replace(',', '.'));
    if (isNaN(numericAmount)) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    createTransactionMutation.mutate({
      owner_id: user.id,
      property_id: txProperty || null,
      title: txDescription,
      amount: numericAmount,
      type: transactionType,
      category: txCategory,
      date: txDate,
      status: txStatus,
      is_recurring: isRecurring,
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80);
      doc.text('Relatório Financeiro - IGLOO', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
      
      // Summary
      const summaryData = [
        ['Total Recebido', formatCurrency(totalReceived)],
        ['Total Pendente', formatCurrency(totalPending)],
        ['Saldo Atual', formatCurrency(totalReceived - totalPending)],
      ];
      
      autoTable(doc, {
        startY: 35,
        head: [['Resumo Financeiro', 'Valor']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
      });

      // Transactions Table
      const tableData = filteredTransactions.map(tx => [
        tx.date,
        tx.title,
        properties.find(p => p.id === tx.property_id)?.name || 'N/A',
        tx.type === 'income' ? 'Receita' : 'Despesa',
        tx.status === 'paid' ? 'Pago' : 'Pendente',
        formatCurrency(tx.amount)
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 15,
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

  const filteredTransactions = transactions.filter(
    (t) => {
      const txDate = new Date(t.date);
      const isSameMonth = txDate.getMonth() === selectedDate.getMonth() && 
                          txDate.getFullYear() === selectedDate.getFullYear();
      
      const matchesSearch = (t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             t.category?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesProperty = (selectedPropertyId === 'all' || t.property_id === selectedPropertyId);
      
      return isSameMonth && matchesSearch && matchesProperty;
    }
  );

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const totalPending = pendingTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const pendingCount = pendingTransactions.length;

  const totalReceived = transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedDate.getMonth() && 
             d.getFullYear() === selectedDate.getFullYear() && 
             t.type === 'income' && t.status === 'paid';
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className='h-full flex flex-col w-full max-w-md mx-auto md:max-w-4xl relative'>
      <header className='sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm pt-4 border-b border-gray-200 dark:border-white/5 transition-colors'>
        <div className='flex items-center justify-between px-4 pb-2'>
          <h1 className='text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1'>
            Lançamentos
          </h1>
          <div className='flex gap-2'>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className='flex h-11 w-11 items-center justify-center rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-lg hover:border-primary/30 transition-all disabled:opacity-50 group'
              title='Exportar Relatório'
            >
              {isExporting ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
              ) : (
                <Download size={20} className="group-hover:scale-110 transition-transform" />
              )}
            </button>
            <button
              onClick={() => setShowApportImportModal(true)}
              className='flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all group'
              title='Conciliação Bancária'
            >
              <FileUp size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => setShowApportionment(true)}
              className='flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all group'
              title='Rateio de Despesas'
            >
              <PieChart size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className='flex h-10 px-4 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all gap-2 font-bold text-sm active:scale-95'
            >
              <Plus size={18} /> Nova Receita
            </button>
          </div>
        </div>
        <div className='px-4 pb-4 pt-2 space-y-3'>
          {/* Search Bar */}
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
            <input
              type='text'
              placeholder='Buscar lançamentos (ex: aluguel, conserto...)'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-11 pr-4 py-2.5 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:border-primary transition-all dark:text-white shadow-sm'
            />
          </div>

          <div className='flex gap-3'>
            <div className='relative flex-1'>
              <select 
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className='appearance-none w-full h-11 pl-4 pr-10 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm cursor-pointer transition-colors'
              >
                <option value='all'>Todos os Imóveis</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown
                className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500'
                size={20}
              />
            </div>
            <div className='h-11 px-2 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-white flex items-center gap-1 shadow-sm whitespace-nowrap transition-colors'>
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <ArrowLeft size={14} />
              </button>
              <div className="flex items-center gap-2 px-1">
                <Calendar size={16} className='text-primary' />
                <span className="min-w-[60px] text-center capitalize">
                  {selectedDate.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')}
                </span>
              </div>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <ArrowUp size={14} className="rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='flex-1 overflow-y-auto px-4 pt-10 pb-24'>
        {/* Trend Chart Area */}
        <div className='mt-2 mb-6 bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm'>
          <InfoTooltip 
            title="Tendência Financeira" 
            description="Exibe o comparativo histórico entre o dinheiro que efetivamente entrou (Receitas) e o que saiu (Despesas) do seu caixa."
            forcePlacement="bottom"
          >
            <h3 className='text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 cursor-help'>
              <TrendingUp size={16} className='text-primary' /> Tendência Financeira
            </h3>
          </InfoTooltip>
          <div className='h-48 w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id='colorReceita' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#10b981' stopOpacity={0.2} />
                    <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='colorDespesa' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#ef4444' stopOpacity={0.2} />
                    <stop offset='95%' stopColor='#ef4444' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  stroke='#e2e8f0'
                  opacity={0.3}
                />
                <XAxis
                  dataKey='name'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  itemStyle={{ fontSize: 12 }}
                />
                <Area
                  type='monotone'
                  dataKey='receita'
                  stroke='#10b981'
                  fillOpacity={1}
                  fill='url(#colorReceita)'
                  strokeWidth={2}
                />
                <Area
                  type='monotone'
                  dataKey='despesa'
                  stroke='#ef4444'
                  fillOpacity={1}
                  fill='url(#colorDespesa)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className='flex items-center gap-4 mt-4 px-2'>
            <div className='flex items-center gap-2'>
              <div className='w-2.5 h-2.5 rounded-[2px] bg-[#10b981]'></div>
              <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>Receita</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2.5 h-2.5 rounded-[2px] bg-[#ef4444]'></div>
              <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>Despesa</span>
            </div>
          </div>
        </div>

        {/* Forecast Dashboard Section */}
        <div className='mb-6 bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm relative'>
          <div className='absolute top-0 right-0 p-4 opacity-5'>
            <TrendingUp size={80} className='text-primary' />
          </div>
          
          <div className='flex justify-between items-start mb-6 relative z-10'>
            <InfoTooltip 
              title="Fluxo de Caixa (Forecast)" 
              description="Uma projeção de quanto você deve receber nos próximos meses, calculada automaticamente com base nos seus contratos assinados e ativos."
              forcePlacement="bottom"
            >
              <div>
                <h3 className='text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-help'>
                  <Clock size={16} className='text-primary' /> Fluxo de Caixa (Forecast)
                </h3>
                <p className='text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1'>
                  Projeção dos próximos 3 meses
                </p>
              </div>
            </InfoTooltip>
            <div className='text-right'>
              <p className='text-[10px] text-slate-500 font-bold uppercase'>Total Previsto</p>
              <p className='text-lg font-black text-primary'>{formatCurrency(totalForecast)}</p>
            </div>
          </div>

          <div className='h-40 w-full mb-4'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#e2e8f0' opacity={0.2} />
                <XAxis 
                  dataKey='name' 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ fontSize: 12, fontWeight: 'bold', color: '#10b981' }}
                  formatter={(value: number) => [formatCurrency(value), 'Recebível']}
                />
                <Bar 
                  dataKey='valor' 
                  fill='#10b981' 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className='grid grid-cols-3 gap-2 relative z-10'>
            {forecastData.map((item, idx) => (
              <div key={idx} className='bg-slate-50 dark:bg-white/5 p-2 rounded-xl border border-slate-100 dark:border-white/5'>
                <p className='text-[9px] font-black text-slate-400 uppercase'>{item.name}</p>
                <p className='text-xs font-bold text-slate-900 dark:text-white mt-0.5'>{formatCurrency(item.valor)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ... (Existing Summary and List code remains unchanged) ... */}
        <section className='mb-6'>
          <div className='flex overflow-x-auto gap-4 pb-4 hide-scrollbar'>
            <div className='shrink-0 w-[240px] p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden transition-colors'>
              <p className='text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 relative z-10'>
                Total Recebido
              </p>
              <p className='text-slate-900 dark:text-white text-2xl font-bold relative z-10'>
                {formatCurrency(totalReceived)}
              </p>
              <div className='mt-4 flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-1 rounded-md'>
                <ArrowUp size={16} />
                <span className='text-xs font-bold'>
                  {totalReceived > 0 ? `${formatCurrency(totalReceived)} neste período` : 'Nenhuma receita no período'}
                </span>
              </div>
            </div>
            <div
              onClick={() => setShowLateCalculator(true)}
              className='shrink-0 w-[240px] p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden transition-colors cursor-pointer group hover:border-orange-200 dark:hover:border-orange-900/50'
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
                <span className='group-hover:hidden'>{pendingCount} {pendingCount === 1 ? 'Fatura' : 'Faturas'}</span>
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
            <span className='text-xs font-medium text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md'>
              {filteredTransactions.length} itens
            </span>
          </div>

          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className='group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-transparent dark:border-white/5 hover:border-primary/20 dark:hover:border-primary/20 shadow-sm cursor-pointer transition-colors'
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
                    {new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {properties.find(p => p.id === tx.property_id)?.name || 'Sem Imóvel'}
                  </p>
                  <div className='flex items-center gap-2'>
                    {tx.hasAttachment && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVoucher(tx.attachmentUrl || null);
                        }}
                        className='p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary transition-colors'
                        title='Ver Comprovante'
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${tx.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'}`}
                    >
                      {tx.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className='py-12 text-center text-slate-400'>
              <Search size={40} className='mx-auto mb-3 opacity-20' />
              <p>Nenhum lançamento encontrado.</p>
            </div>
          )}
        </section>
      </div>

      {/* Late Calculator Modal */}
      {showLateCalculator && (
        <ModalWrapper
          onClose={() => setShowLateCalculator(false)}
          title='Calculadora de Atraso'
          showCloseButton={true}
        >
          {/* ... (Existing Calculator Code) ... */}
          <div className='p-6 bg-background-light dark:bg-background-dark h-full overflow-y-auto'>
            <div className='space-y-4'>
              <div className='bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800'>
                <p className='text-xs text-orange-800 dark:text-orange-300 font-medium'>
                  Cálculo automático de Multa (10%) e Juros (1% a.m pro rata).
                </p>
              </div>

              <div>
                <label className='text-sm font-bold text-slate-700 dark:text-slate-300'>
                  Valor Original
                </label>
                <input
                  type='number'
                  value={lateOriginalValue}
                  onChange={(e) => setLateOriginalValue(e.target.value)}
                  className='w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none'
                  placeholder='0,00'
                />
              </div>
              <div>
                <label className='text-sm font-bold text-slate-700 dark:text-slate-300'>
                  Data de Vencimento
                </label>
                <input
                  type='date'
                  value={lateDueDate}
                  onChange={(e) => setLateDueDate(e.target.value)}
                  className='w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none dark:text-white'
                />
              </div>
              <button
                onClick={handleCalculateLate}
                className='w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95'
              >
                Calcular
              </button>

              {lateResult && (
                <div className='mt-6 space-y-3 animate-slideUp'>
                  <div className='flex justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-lg'>
                    <span className='text-slate-500 text-sm'>Dias de Atraso</span>
                    <span className='font-bold dark:text-white'>{lateResult.diasAtraso} dias</span>
                  </div>
                  <div className='flex justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-lg'>
                    <span className='text-slate-500 text-sm'>Multa (10%)</span>
                    <span className='font-bold text-red-500'>R$ {lateResult.valorMulta}</span>
                  </div>
                  <div className='flex justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-lg'>
                    <span className='text-slate-500 text-sm'>Juros (1% a.m)</span>
                    <span className='font-bold text-red-500'>R$ {lateResult.valorJuros}</span>
                  </div>
                  <div className='flex justify-between p-4 bg-slate-900 dark:bg-white rounded-xl text-white dark:text-slate-900 items-center'>
                    <span className='font-bold'>Total Atualizado</span>
                    <span className='text-xl font-extrabold'>R$ {lateResult.totalPagar}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Apportionment Modal */}
      {showApportionment && (
        <ModalWrapper
          onClose={() => setShowApportionment(false)}
          title='Rateio de Despesas'
          showCloseButton={true}
        >
          {/* ... (Existing Apportionment Code) ... */}
          <div className='p-6 bg-background-light dark:bg-background-dark h-full overflow-y-auto'>
            <div className='space-y-6'>
              <p className='text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-3 rounded-xl'>
                Divida contas únicas (Água, Luz) proporcionalmente entre as unidades selecionadas.
              </p>

              {/* Enhanced Input */}
              <div>
                <label className='text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block'>
                  Valor da Conta
                </label>
                <div className='relative group'>
                  <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl group-focus-within:text-primary transition-colors'>
                    R$
                  </span>
                  <input
                    autoFocus
                    type='number'
                    value={apportionTotal}
                    onChange={(e) => setApportionTotal(e.target.value)}
                    className='w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-gray-700 text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-slate-300'
                    placeholder='0,00'
                  />
                </div>
              </div>

              {/* Enhanced Toggle */}
              <div className='flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl'>
                <button
                  onClick={() => setApportionMethod('fixed')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                    apportionMethod === 'fixed'
                      ? 'bg-white dark:bg-surface-dark text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Building2 size={18} />
                  Por Unidade
                </button>
                <button
                  onClick={() => setApportionMethod('people')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                    apportionMethod === 'people'
                      ? 'bg-white dark:bg-surface-dark text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Users size={18} />
                  Por Pessoa
                </button>
              </div>

              {/* Unit Selection */}
              <div>
                <div className='flex justify-between items-center mb-3'>
                  <label className='text-sm font-bold text-slate-700 dark:text-slate-300'>
                    Unidades Participantes
                  </label>
                  <span className='text-xs font-medium text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md'>
                    {selectedUnitsIds.length} selecionadas
                  </span>
                </div>
                <div className='max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar'>
                  {mockUnits.map((unit) => {
                    const isSelected = selectedUnitsIds.includes(unit.id);
                    return (
                      <div
                        key={unit.id}
                        onClick={() => toggleUnitSelection(unit.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-900/30'
                            : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:border-gray-300'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white dark:bg-black/20'}`}
                          >
                            {isSelected && <Check size={14} className='text-white' />}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-bold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-400'}`}
                            >
                              {unit.name}
                            </p>
                            <p className='text-[10px] text-slate-500'>
                              {unit.residentsCount} moradores •{' '}
                              {unit.isOccupied ? 'Ocupado' : 'Vago'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className='pt-2'>
                <button
                  onClick={handleCalculateApportionment}
                  className='w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2'
                >
                  <Calculator size={20} />
                  Calcular Divisão
                </button>
              </div>

              {apportionResult && (
                <div className='animate-slideUp border-t border-gray-200 dark:border-white/10 pt-6'>
                  <h3 className='font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2'>
                    <CheckCircle size={18} className='text-emerald-500' />
                    Resultado do Rateio
                  </h3>
                  <div className='space-y-3 mb-4'>
                    {apportionResult.distribution.map((item: any) => (
                      <div
                        key={item.id}
                        className='flex justify-between items-center p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm'
                      >
                        <div>
                          <p className='font-bold text-sm text-slate-800 dark:text-slate-200'>
                            {item.name}
                          </p>
                          <p className='text-xs text-slate-400'>
                            {item.note ||
                              (apportionMethod === 'people'
                                ? `${item.residentsCount} pessoas`
                                : 'Cota Fixa')}
                          </p>
                        </div>
                        <span className='font-bold text-lg text-primary'>
                          R$ {item.share.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {apportionResult.ownerTotal > 0 && (
                    <div className='p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800'>
                      <div className='flex justify-between items-center'>
                        <div>
                          <span className='text-sm font-bold text-orange-800 dark:text-orange-300 block'>
                            Custo Proprietário
                          </span>
                          <span className='text-xs text-orange-600/80 dark:text-orange-400/70'>
                            Unidades vagas ou isentas
                          </span>
                        </div>
                        <span className='font-bold text-lg text-orange-600 dark:text-orange-400'>
                          R$ {apportionResult.ownerTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* --- IMPROVED ADD TRANSACTION MODAL --- */}
      {showAddForm && (
        <ModalWrapper
          onClose={() => setShowAddForm(false)}
          title={transactionType === 'expense' ? 'Nova Despesa' : 'Nova Receita'}
          showCloseButton={true}
          className='md:max-w-lg'
        >
          <div className='flex flex-col h-full w-full bg-background-light dark:bg-background-dark overflow-hidden'>
            {/* 1. Type Switcher */}
            <div className='px-6 pt-2 pb-4 border-b border-gray-100 dark:border-white/5'>
              <div className='flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl'>
                <button
                  onClick={() => setTransactionType('income')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    transactionType === 'income'
                      ? 'bg-white dark:bg-surface-dark text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <TrendingUp size={16} /> Receita
                </button>
                <button
                  onClick={() => setTransactionType('expense')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    transactionType === 'expense'
                      ? 'bg-white dark:bg-surface-dark text-red-500 dark:text-red-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <TrendingUp size={16} className='rotate-180' /> Despesa
                </button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-6 space-y-6'>
              {/* 2. Value Input (Hero) */}
              <div>
                <label className='text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block text-center'>
                  Valor do Lançamento
                </label>
                <div
                  className={`relative flex justify-center items-center py-6 rounded-2xl border-2 transition-all ${
                    transactionType === 'income'
                      ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30'
                      : 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'
                  }`}
                >
                  <span
                    className={`text-2xl font-bold mr-1 ${transactionType === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    R$
                  </span>
                  <input
                    autoFocus
                    type='number'
                    value={txValue}
                    onChange={(e) => setTxValue(e.target.value)}
                    className={`w-40 bg-transparent text-4xl font-black focus:outline-none text-center ${transactionType === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} placeholder-slate-300`}
                    placeholder='0,00'
                  />
                </div>
              </div>

              {/* 3. Description & Category */}
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block'>
                    Descrição
                  </label>
                  <input
                    type='text'
                    value={txDescription}
                    onChange={(e) => setTxDescription(e.target.value)}
                    className='w-full px-4 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-base dark:text-white focus:outline-none focus:border-primary transition-colors'
                    placeholder={
                      transactionType === 'expense'
                        ? 'Ex: Conserto do portão'
                        : 'Ex: Aluguel Apt 104'
                    }
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block'>
                      Categoria
                    </label>
                    <div className='relative'>
                      <Tag
                        className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                        size={18}
                      />
                      <select
                        value={txCategory}
                        onChange={(e) => setTxCategory(e.target.value)}
                        className='w-full pl-10 pr-8 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium dark:text-white focus:outline-none focus:border-primary appearance-none'
                      >
                        <option value='' disabled>
                          Selecione
                        </option>
                        {transactionType === 'income' ? (
                          <>
                            <option value='aluguel'>Aluguel</option>
                            <option value='condominio'>Condomínio</option>
                            <option value='iptu'>Reembolso IPTU</option>
                            <option value='extra'>Renda Extra</option>
                          </>
                        ) : (
                          <>
                            <option value='manutencao'>Manutenção</option>
                            <option value='impostos'>Impostos/Taxas</option>
                            <option value='servicos'>Serviços (Água/Luz)</option>
                            <option value='adm'>Taxa Administrativa</option>
                          </>
                        )}
                      </select>
                      <ChevronDown
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                        size={16}
                      />
                    </div>
                  </div>
                  <div>
                    <label className='text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block'>
                      Data
                    </label>
                    <div className='relative'>
                      <Calendar
                        className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                        size={18}
                      />
                      <input
                        type='date'
                        value={txDate}
                        onChange={(e) => setTxDate(e.target.value)}
                        className='w-full pl-10 pr-3 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:border-primary dark:text-white'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Context (Property / Tenant) */}
              <div className='bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5 space-y-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Building2 size={16} className='text-primary' />
                  <span className='text-xs font-bold uppercase tracking-wider text-slate-500'>
                    Associação
                  </span>
                </div>

                <div className='relative'>
                  <label className='text-xs font-bold text-slate-500 mb-1 block'>
                    Propriedade (Opcional)
                  </label>
                  <div className='relative'>
                    <Home
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                      size={18}
                    />
                    <select
                      value={txProperty}
                      onChange={(e) => setTxProperty(e.target.value)}
                      className='w-full pl-10 pr-8 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium dark:text-white focus:outline-none focus:border-primary appearance-none'
                    >
                      <option value=''>Geral (Sem vínculo)</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                      size={16}
                    />
                  </div>
                </div>
              </div>

              {/* 5. Advanced Options (Status, Recurring, Attachments) */}
              <div className='space-y-4'>
                {/* Recurrence Toggle */}
                <div
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    isRecurring
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`p-2 rounded-lg ${isRecurring ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}
                    >
                      <Repeat size={20} />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-bold ${isRecurring ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        Repetir lançamento
                      </p>
                      <p className='text-xs text-slate-500'>Criar automaticamente todo mês.</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${isRecurring ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'}`}
                  >
                    {isRecurring && <Check size={12} className='text-white' />}
                  </div>
                </div>

                {/* Status Toggle */}
                <div className='flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl'>
                  <button
                    onClick={() => setTxStatus('paid')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      txStatus === 'paid'
                        ? 'bg-white dark:bg-surface-dark text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    <CheckCircle size={16} />
                    {transactionType === 'income' ? 'Recebido' : 'Pago'}
                  </button>
                  <button
                    onClick={() => setTxStatus('pending')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      txStatus === 'pending'
                        ? 'bg-white dark:bg-surface-dark text-orange-500 dark:text-orange-400 shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    <Clock size={16} /> Pendente
                  </button>
                </div>

                {/* Attachments */}
                <div>
                  <input
                    type='file'
                    ref={fileInputRef}
                    className='hidden'
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                      hasAttachment
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-800 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-primary/50 hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    {hasAttachment ? (
                      <>
                        <FileText size={18} /> Arquivo Anexado
                      </>
                    ) : (
                      <>
                        <UploadCloud size={18} /> Anexar Comprovante
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveTransaction} className='flex-none p-6 pt-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-white/5 z-20'>
              <button
                type="submit"
                disabled={createTransactionMutation.isPending}
                className={`w-full h-14 flex items-center justify-center rounded-xl text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all duration-200 ${
                  createTransactionMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  transactionType === 'income'
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
                    : 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
                }`}
              >
                {createTransactionMutation.isPending ? 'Salvando...' : 'Confirmar Lançamento'}
              </button>
            </form>
          </div>
        </ModalWrapper>
      )}
      {/* Voucher Viewer Modal */}
      {selectedVoucher && (
        <ModalWrapper
          onClose={() => setSelectedVoucher(null)}
          title='Visualizar Comprovante'
          showCloseButton={true}
          className='md:max-w-2xl'
        >
          <div className='p-6 bg-background-light dark:bg-background-dark'>
            <div className='relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10'>
              <img src={selectedVoucher} alt='Comprovante' className='w-full h-auto max-h-[70vh] object-contain bg-slate-50 dark:bg-slate-900' />
            </div>
            <div className='mt-6 flex gap-3'>
              <button
                onClick={() => window.open(selectedVoucher, '_blank')}
                className='flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg transition-all hover:opacity-90 active:scale-95'
              >
                <Download size={18} /> Baixar Original
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Bank Conciliation (Import) Modal */}
      {showImportModal && (
        <ModalWrapper
          onClose={() => {
            setShowApportImportModal(false);
            setImportResult([]);
          }}
          title='Conciliação Bancária'
          showCloseButton={true}
          className='md:max-w-xl'
        >
          <div className='p-6 bg-background-light dark:bg-background-dark space-y-6 h-[80vh] flex flex-col'>
            {!importResult.length ? (
              <div className='flex-1 flex flex-col justify-center space-y-6'>
                <div
                  onClick={() => bankFileInputRef.current?.click()}
                  className={`p-10 border-2 border-dashed rounded-2xl text-center bg-slate-50 dark:bg-white/5 group hover:border-primary transition-all cursor-pointer ${isProcessingFile ? 'opacity-50 pointer-events-none' : 'border-slate-200 dark:border-white/10'}`}
                >
                  <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform'>
                    {isProcessingFile ? (
                      <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin' />
                    ) : (
                      <FileUp className='text-primary' size={40} />
                    )}
                  </div>
                  <h4 className='text-xl font-bold text-slate-900 dark:text-white'>
                    {isProcessingFile ? 'Processando...' : 'Importar Extrato'}
                  </h4>
                  <p className='text-sm text-slate-500 mt-2 max-w-xs mx-auto'>
                    Arraste seu arquivo OFX ou CSV aqui ou clique para selecionar.
                  </p>
                  <input
                    type='file'
                    ref={bankFileInputRef}
                    className='hidden'
                    accept='.ofx,.csv'
                    onChange={handleBankFileUpload}
                  />
                </div>

                <div className='space-y-4'>
                  <h5 className='text-xs font-bold text-slate-400 uppercase tracking-widest text-center'>
                    Formatos Suportados
                  </h5>
                  <div className='grid grid-cols-2 gap-3'>
                    {['OFX (Padrão)', 'CSV (Excel)', 'Itaú / Nubank', 'Inter / Santander'].map(
                      (bank) => (
                        <div
                          key={bank}
                          className='px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm'
                        >
                          <div className='w-2 h-2 rounded-full bg-emerald-500' />
                          {bank}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex-1 flex flex-col overflow-hidden'>
                <div className='flex items-center justify-between mb-4'>
                  <h4 className='font-bold text-slate-900 dark:text-white'>
                    Transações Identificadas
                  </h4>
                  <span className='text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full'>
                    {importResult.length} itens
                  </span>
                </div>

                <div className='flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar'>
                  {importResult.map((btx) => (
                    <div
                      key={btx.id}
                      className='p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-white dark:bg-surface-dark shadow-sm'
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <div>
                          <p className='text-xs font-bold text-slate-400 uppercase'>{btx.date}</p>
                          <p className='text-sm font-bold text-slate-800 dark:text-white'>
                            {btx.description}
                          </p>
                        </div>
                        <p
                          className={`font-bold ${btx.amount > 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}
                        >
                          {btx.amount > 0 ? '+' : ''} R$ {btx.amount.toFixed(2)}
                        </p>
                      </div>

                      <div className='flex items-center justify-between pt-3 border-t border-slate-50 dark:border-white/5'>
                        <div className='flex items-center gap-2'>
                          {btx.matchStatus === 'perfect' ? (
                            <span className='flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded'>
                              <Check size={12} /> Conciliado
                            </span>
                          ) : (
                            <span className='flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded'>
                              <AlertTriangle size={12} /> Novo Lançamento
                            </span>
                          )}
                          <span className='text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded uppercase'>
                            {btx.suggestedCategory}
                          </span>
                        </div>
                        <button className='text-xs font-bold text-primary hover:underline'>
                          {btx.matchStatus === 'perfect' ? 'Ver Match' : 'Confirmar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='pt-6 mt-auto border-t border-slate-100 dark:border-white/5 flex gap-3'>
                  <button
                    onClick={() => setImportResult([])}
                    className='flex-1 h-12 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold'
                  >
                    Voltar
                  </button>
                  <button className='flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95'>
                    Efetivar Conciliação
                  </button>
                </div>
              </div>
            )}
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default Financials;
