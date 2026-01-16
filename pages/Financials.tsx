import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronDown, Calendar, ArrowUp, Wrench, Building2, TrendingUp, AlertTriangle, DoorOpen, X } from 'lucide-react';

const Financials: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const location = useLocation();

  useEffect(() => {
    if (location.state && (location.state as any).openAdd) {
        setShowAddForm(true);
        if ((location.state as any).type) {
            setTransactionType((location.state as any).type);
        }
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="h-full flex flex-col w-full max-w-md mx-auto md:max-w-4xl relative">
       <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm pt-4 border-b border-gray-200 dark:border-white/5 transition-colors">
         <div className="flex items-center justify-between px-4 pb-2">
            <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1">Lançamentos</h1>
            <button 
                onClick={() => setShowAddForm(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
            >
               <Plus size={24} />
            </button>
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
          <section className="mt-2 mb-6">
             <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
                <div className="shrink-0 w-[240px] p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden transition-colors">
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 relative z-10">Total Recebido</p>
                   <p className="text-slate-900 dark:text-white text-2xl font-bold relative z-10">R$ 4.500,00</p>
                   <div className="mt-4 flex items-center gap-1 text-primary text-xs font-bold relative z-10">
                      <TrendingUp size={16} />
                      <span>+12% vs mês anterior</span>
                   </div>
                </div>
                <div className="shrink-0 w-[240px] p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden transition-colors">
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 relative z-10">Total Pendente</p>
                   <p className="text-slate-900 dark:text-white text-2xl font-bold relative z-10">R$ 1.200,00</p>
                   <div className="mt-4 flex items-center gap-1 text-orange-500 text-xs font-bold relative z-10">
                      <span className="bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-md">3 Faturas</span>
                   </div>
                </div>
             </div>
          </section>

          <section className="flex flex-col gap-2">
             <div className="py-2 flex justify-between items-center">
                <h4 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Março 2024</h4>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md">3 lançamentos</span>
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

             <div className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-transparent dark:border-white/5 hover:border-primary/20 dark:hover:border-primary/20 shadow-sm cursor-pointer transition-colors">
                <div className="flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 shrink-0 size-12 text-slate-600 dark:text-slate-400">
                   <Wrench size={24} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                      <p className="text-slate-900 dark:text-white text-base font-bold truncate">Manutenção Torneira</p>
                      <p className="text-slate-900 dark:text-white text-base font-bold whitespace-nowrap">- R$ 80,00</p>
                   </div>
                   <div className="flex justify-between items-center mt-1">
                      <p className="text-slate-400 text-sm font-medium truncate">12 Mar • Apt 101</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400">Pago</span>
                   </div>
                </div>
             </div>
          </section>
       </div>

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