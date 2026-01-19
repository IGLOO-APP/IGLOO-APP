import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronDown, Calendar, ArrowUp, Wrench, Building2, TrendingUp, AlertTriangle, DoorOpen, X, Calculator, PieChart, Users, DollarSign, Check, CheckCircle, Download } from 'lucide-react';
import { ModalWrapper } from '../components/ui/ModalWrapper';
import { calculateLateFee, calculateApportionment, UnitParams } from '../utils/financialCalculations';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockTrendData = [
  { name: 'Jan', receita: 4000, despesa: 2400 },
  { name: 'Fev', receita: 3000, despesa: 1398 },
  { name: 'Mar', receita: 2000, despesa: 9800 },
  { name: 'Abr', receita: 2780, despesa: 3908 },
  { name: 'Mai', receita: 1890, despesa: 4800 },
  { name: 'Jun', receita: 2390, despesa: 3800 },
  { name: 'Jul', receita: 3490, despesa: 4300 },
];

const Financials: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLateCalculator, setShowLateCalculator] = useState(false);
  const [showApportionment, setShowApportionment] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
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
  
  // New state to track which units are included in the split
  const [selectedUnitsIds, setSelectedUnitsIds] = useState<string[]>(['1', '2', '3', '4', '5']);

  useEffect(() => {
    if (location.state && (location.state as any).openAdd) {
        setShowAddForm(true);
        if ((location.state as any).type) {
            setTransactionType((location.state as any).type);
        }
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleCalculateLate = () => {
      if (!lateOriginalValue || !lateDueDate) return;
      const result = calculateLateFee(parseFloat(lateOriginalValue), lateDueDate);
      setLateResult(result);
  };

  const toggleUnitSelection = (id: string) => {
      if (selectedUnitsIds.includes(id)) {
          setSelectedUnitsIds(selectedUnitsIds.filter(uid => uid !== id));
      } else {
          setSelectedUnitsIds([...selectedUnitsIds, id]);
      }
      // Reset result when selection changes to force recalculation
      setApportionResult(null);
  };

  const handleCalculateApportionment = () => {
      if (!apportionTotal) return;
      // Filter only selected units for calculation
      const activeUnits = mockUnits.filter(u => selectedUnitsIds.includes(u.id));
      
      if (activeUnits.length === 0) {
          alert("Selecione pelo menos uma unidade.");
          return;
      }

      const result = calculateApportionment(parseFloat(apportionTotal), activeUnits, apportionMethod);
      setApportionResult(result);
  };

  return (
    <div className="h-full flex flex-col w-full max-w-md mx-auto md:max-w-4xl relative">
       <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm pt-4 border-b border-gray-200 dark:border-white/5 transition-colors">
         <div className="flex items-center justify-between px-4 pb-2">
            <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1">Lançamentos</h1>
            <div className="flex gap-2">
                <button 
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                    title="Exportar Relatório"
                >
                   <Download size={20} />
                </button>
                <button 
                    onClick={() => setShowApportionment(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all"
                    title="Rateio de Despesas"
                >
                   <PieChart size={20} />
                </button>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
                >
                   <Plus size={24} />
                </button>
            </div>
         </div>
         <div className="px-4 pb-4 pt-2">
            <div className="flex gap-3">
               <div className="relative flex-1">
                  <select className="appearance-none w-full h-11 pl-4 pr-10 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm cursor-pointer transition-colors">
                     <option value="all">Todos os Imóveis</option>
                     <option value="apt101">Apt 101 - Centro</option>
                     <option value="studio20">Studio 20 - Norte</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
               </div>
               <button className="h-11 px-4 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-white flex items-center gap-2 shadow-sm whitespace-nowrap transition-colors">
                  <Calendar size={18} className="text-primary" />
                  <span>Mar 24</span>
               </button>
            </div>
         </div>
       </header>

       <div className="flex-1 overflow-y-auto px-4 pb-24">
          {/* Trend Chart Area */}
          <div className="mt-2 mb-6 bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" /> Tendência Financeira
              </h3>
              <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockTrendData}>
                          <defs>
                              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                          <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                              itemStyle={{ fontSize: 12 }}
                          />
                          <Area type="monotone" dataKey="receita" stroke="#10b981" fillOpacity={1} fill="url(#colorReceita)" strokeWidth={2} />
                          <Area type="monotone" dataKey="despesa" stroke="#ef4444" fillOpacity={1} fill="url(#colorDespesa)" strokeWidth={2} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          <section className="mb-6">
             <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
                <div className="shrink-0 w-[240px] p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden transition-colors">
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 relative z-10">Total Recebido</p>
                   <p className="text-slate-900 dark:text-white text-2xl font-bold relative z-10">R$ 4.500,00</p>
                   <div className="mt-4 flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
                      <ArrowUp size={16} />
                      <span className="text-xs font-bold">+12% vs mês anterior</span>
                   </div>
                </div>
                <div 
                    onClick={() => setShowLateCalculator(true)}
                    className="shrink-0 w-[240px] p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden transition-colors cursor-pointer group hover:border-orange-200 dark:hover:border-orange-900/50"
                >
                   <div className="absolute top-0 right-0 p-3 opacity-10">
                       <Calculator size={64} className="text-orange-500 group-hover:scale-110 transition-transform" />
                   </div>
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 relative z-10">Total Pendente</p>
                   <p className="text-slate-900 dark:text-white text-2xl font-bold relative z-10">R$ 1.200,00</p>
                   <div className="mt-4 flex items-center gap-1 text-orange-500 text-xs font-bold relative z-10 bg-orange-50 dark:bg-orange-900/20 w-fit px-2 py-1 rounded-md">
                      <span className="group-hover:hidden">3 Faturas</span>
                      <span className="hidden group-hover:inline">Simular Juros</span>
                   </div>
                </div>
             </div>
          </section>

          <section className="flex flex-col gap-2">
             <div className="py-2 flex justify-between items-center">
                <h4 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Lançamentos Recentes</h4>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md">3 itens</span>
             </div>

             <div className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-transparent dark:border-white/5 hover:border-primary/20 dark:hover:border-primary/20 shadow-sm cursor-pointer transition-colors">
                <div className="flex items-center justify-center rounded-xl bg-primary/10 shrink-0 size-12 text-primary">
                   <Building2 size={24} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                      <p className="text-slate-900 dark:text-white text-base font-bold truncate">Aluguel - Kitnet Centro</p>
                      <p className="text-primary text-base font-bold whitespace-nowrap">+ R$ 1.500,00</p>
                   </div>
                   <div className="flex justify-between items-center mt-1">
                      <p className="text-slate-400 text-sm font-medium truncate">05 Mar • Apt 101</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Pago</span>
                   </div>
                </div>
             </div>

             {/* ... existing items ... */}
             <div className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-transparent dark:border-white/5 hover:border-primary/20 dark:hover:border-primary/20 shadow-sm cursor-pointer transition-colors">
                <div className="flex items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/20 shrink-0 size-12 text-orange-600 dark:text-orange-400">
                   <Building2 size={24} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                      <p className="text-slate-900 dark:text-white text-base font-bold truncate">Condomínio - Studio 20</p>
                      <p className="text-slate-900 dark:text-white text-base font-bold whitespace-nowrap">- R$ 350,00</p>
                   </div>
                   <div className="flex justify-between items-center mt-1">
                      <p className="text-slate-400 text-sm font-medium truncate">10 Mar • Studio 20</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">Pendente</span>
                   </div>
                </div>
             </div>
          </section>
       </div>

       {showLateCalculator && (
           <ModalWrapper onClose={() => setShowLateCalculator(false)} title="Calculadora de Atraso" showCloseButton={true}>
               <div className="p-6 bg-background-light dark:bg-background-dark h-full overflow-y-auto">
                   <div className="space-y-4">
                       <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
                           <p className="text-xs text-orange-800 dark:text-orange-300 font-medium">
                               Cálculo automático de Multa (10%) e Juros (1% a.m pro rata).
                           </p>
                       </div>
                       
                       <div>
                           <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Valor Original</label>
                           <input 
                                type="number" 
                                value={lateOriginalValue} 
                                onChange={(e) => setLateOriginalValue(e.target.value)}
                                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none"
                                placeholder="0,00"
                           />
                       </div>
                       <div>
                           <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Data de Vencimento</label>
                           <input 
                                type="date" 
                                value={lateDueDate} 
                                onChange={(e) => setLateDueDate(e.target.value)}
                                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none dark:text-white"
                           />
                       </div>
                       <button 
                            onClick={handleCalculateLate}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                       >
                           Calcular
                       </button>

                       {lateResult && (
                           <div className="mt-6 space-y-3 animate-slideUp">
                               <div className="flex justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-lg">
                                   <span className="text-slate-500 text-sm">Dias de Atraso</span>
                                   <span className="font-bold dark:text-white">{lateResult.diasAtraso} dias</span>
                               </div>
                               <div className="flex justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-lg">
                                   <span className="text-slate-500 text-sm">Multa (10%)</span>
                                   <span className="font-bold text-red-500">R$ {lateResult.valorMulta}</span>
                               </div>
                               <div className="flex justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-lg">
                                   <span className="text-slate-500 text-sm">Juros (1% a.m)</span>
                                   <span className="font-bold text-red-500">R$ {lateResult.valorJuros}</span>
                               </div>
                               <div className="flex justify-between p-4 bg-slate-900 dark:bg-white rounded-xl text-white dark:text-slate-900 items-center">
                                   <span className="font-bold">Total Atualizado</span>
                                   <span className="text-xl font-extrabold">R$ {lateResult.totalPagar}</span>
                               </div>
                           </div>
                       )}
                   </div>
               </div>
           </ModalWrapper>
       )}

       {showApportionment && (
           <ModalWrapper onClose={() => setShowApportionment(false)} title="Rateio de Despesas" showCloseButton={true}>
               <div className="p-6 bg-background-light dark:bg-background-dark h-full overflow-y-auto">
                   <div className="space-y-6">
                       <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
                           Divida contas únicas (Água, Luz) proporcionalmente entre as unidades selecionadas.
                       </p>
                       
                       {/* Enhanced Input */}
                       <div>
                           <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Valor da Conta</label>
                           <div className="relative group">
                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl group-focus-within:text-primary transition-colors">R$</span>
                               <input 
                                    autoFocus
                                    type="number" 
                                    value={apportionTotal} 
                                    onChange={(e) => setApportionTotal(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-gray-700 text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-slate-300"
                                    placeholder="0,00"
                               />
                           </div>
                       </div>

                       {/* Enhanced Toggle */}
                       <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
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
                           <div className="flex justify-between items-center mb-3">
                               <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Unidades Participantes</label>
                               <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md">
                                   {selectedUnitsIds.length} selecionadas
                               </span>
                           </div>
                           <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                               {mockUnits.map(unit => {
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
                                           <div className="flex items-center gap-3">
                                               <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white dark:bg-black/20'}`}>
                                                   {isSelected && <Check size={14} className="text-white" />}
                                               </div>
                                               <div>
                                                   <p className={`text-sm font-bold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-400'}`}>{unit.name}</p>
                                                   <p className="text-[10px] text-slate-500">{unit.residentsCount} moradores • {unit.isOccupied ? 'Ocupado' : 'Vago'}</p>
                                               </div>
                                           </div>
                                       </div>
                                   );
                               })}
                           </div>
                       </div>

                       <div className="pt-2">
                           <button 
                                onClick={handleCalculateApportionment}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                           >
                               <Calculator size={20} />
                               Calcular Divisão
                           </button>
                       </div>

                       {apportionResult && (
                           <div className="animate-slideUp border-t border-gray-200 dark:border-white/10 pt-6">
                               <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                   <CheckCircle size={18} className="text-emerald-500" />
                                   Resultado do Rateio
                               </h3>
                               <div className="space-y-3 mb-4">
                                   {apportionResult.distribution.map((item: any) => (
                                       <div key={item.id} className="flex justify-between items-center p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
                                           <div>
                                               <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.name}</p>
                                               <p className="text-xs text-slate-400">
                                                   {item.note || (apportionMethod === 'people' ? `${item.residentsCount} pessoas` : 'Cota Fixa')}
                                               </p>
                                           </div>
                                           <span className="font-bold text-lg text-primary">R$ {item.share.toFixed(2)}</span>
                                       </div>
                                   ))}
                               </div>
                               {apportionResult.ownerTotal > 0 && (
                                   <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                                       <div className="flex justify-between items-center">
                                           <div>
                                               <span className="text-sm font-bold text-orange-800 dark:text-orange-300 block">Custo Proprietário</span>
                                               <span className="text-xs text-orange-600/80 dark:text-orange-400/70">Unidades vagas ou isentas</span>
                                           </div>
                                           <span className="font-bold text-lg text-orange-600 dark:text-orange-400">R$ {apportionResult.ownerTotal.toFixed(2)}</span>
                                       </div>
                                   </div>
                               )}
                           </div>
                       )}
                   </div>
               </div>
           </ModalWrapper>
       )}

       {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-fadeIn">
            <div className="w-full h-[92vh] md:h-auto md:max-h-[85vh] md:max-w-lg bg-background-light dark:bg-background-dark rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp ring-1 ring-white/10">
                <div className="flex-none pt-4 pb-2 w-full flex justify-center bg-background-light dark:bg-background-dark md:hidden">
                    <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                </div>
                <div className="flex-none flex items-center justify-between px-6 pb-4 pt-4 md:pt-4 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-white/5">
                    <button onClick={() => setShowAddForm(false)} className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-white transition-colors">Cancelar</button>
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold">
                        {transactionType === 'expense' ? 'Nova Despesa' : 'Nova Receita'}
                    </h2>
                    <div className="w-[60px]"></div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background-light dark:bg-background-dark">
                    <div className="flex p-1 bg-slate-200 dark:bg-black/30 rounded-xl">
                        <button 
                            onClick={() => setTransactionType('income')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${transactionType === 'income' ? 'bg-white dark:bg-surface-dark text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Receita
                        </button>
                        <button 
                            onClick={() => setTransactionType('expense')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${transactionType === 'expense' ? 'bg-white dark:bg-surface-dark text-red-500 dark:text-red-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Despesa
                        </button>
                    </div>
                    <div>
                        <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold mb-2 block">Valor</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">R$</span>
                            <input autoFocus type="number" className="w-full pl-12 pr-4 py-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-slate-300 dark:placeholder-slate-600 transition-colors" placeholder="0,00" />
                        </div>
                    </div>
                    <div>
                        <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold mb-2 block">Descrição</label>
                        <input type="text" className="w-full px-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-base dark:text-white focus:outline-none focus:border-primary transition-colors" placeholder={transactionType === 'expense' ? 'Ex: Manutenção elétrica' : 'Ex: Aluguel Março - Apt 104'} />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold mb-2 block">Categoria</label>
                            <div className="relative">
                                <select className="w-full appearance-none px-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-base dark:text-white focus:outline-none focus:border-primary transition-colors">
                                    {transactionType === 'income' ? (
                                        <>
                                            <option>Aluguel (Base)</option>
                                            <option>Condomínio (Entrada)</option>
                                            <option>Reembolso IPTU</option>
                                            <option>Outras Receitas</option>
                                        </>
                                    ) : (
                                        <>
                                            <option>Manutenção</option>
                                            <option>Taxa de Gestão</option>
                                            <option>Condomínio (Pagamento)</option>
                                            <option>IPTU (Pagamento)</option>
                                            <option>Impostos</option>
                                        </>
                                    )}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold mb-2 block">Data</label>
                            <div className="relative">
                                <input type="date" className="w-full px-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-base focus:outline-none focus:border-primary dark:text-white transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-none p-6 pt-2 bg-background-light dark:bg-background-dark border-t border-transparent z-20">
                    <button className={`w-full h-14 flex items-center justify-center rounded-xl text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all duration-200 ${transactionType === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25' : 'bg-red-500 hover:bg-red-600 shadow-red-500/25'}`}>
                        Confirmar Lançamento
                    </button>
                </div>
            </div>
        </div>
       )}
    </div>
  );
};

export default Financials;