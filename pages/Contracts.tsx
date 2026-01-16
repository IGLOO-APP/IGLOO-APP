import React, { useState, useEffect } from 'react';
import { Plus, Calendar, PlayCircle, Clock, History, AlertTriangle, X, Building2, User, ChevronDown, FileText, Calculator } from 'lucide-react';

const Contracts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Contract Breakdown State
  const [rentValue, setRentValue] = useState('');
  const [condoValue, setCondoValue] = useState('');
  const [iptuValue, setIptuValue] = useState('');
  const [feeValue, setFeeValue] = useState('');
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const r = parseFloat(rentValue) || 0;
    const c = parseFloat(condoValue) || 0;
    const i = parseFloat(iptuValue) || 0;
    const f = parseFloat(feeValue) || 0;
    setTotalValue(r + c + i + f);
  }, [rentValue, condoValue, iptuValue, feeValue]);

  const contracts = [
    {
      id: 1,
      property: 'Apto 104 - Centro',
      dateRange: '10 Out 2023 - 10 Out 2024',
      value: 'R$ 1.500',
      status: 'draft',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKta407kowk32TZeJFttkleT2dp5mm3IDNfk_2_k1ajnCR5tfiJOrOZe7y4aYwhLF8JoM7cvZZw8Zs_lxQHKeEVDbXspvZnB5W9aqzAVYmnQnHwXItvizkpQN22czIMSqyBV0DwxXoEASsts3R7umaFLvpP8uub58nhY8NnLYfaQHZv7S5fYFNnNsqEcuGRMD7Ya6o3cQ1NG82AjmZCshtHUdwIz-sfVeNCjMahJ181wAxh5wRvL4IKTx3TGAgpV2Mj87dRqQnZMMh'
    },
    {
      id: 2,
      property: 'Kitnet 05 - Jardins',
      tenant: 'João Silva',
      due: 'Vence em 01 Jan 2024',
      value: 'R$ 1.200',
      status: 'active',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn__ZutVvHWoB0fOJjYiPeGIKkeh7vEyaUlJHAevh0jeB3xk3q84sV1uATcJj0AMX0eEs-270r6lamXvnUFOrMoE1vjRRf9pAbm1cVzsoKxFnuljIogkWD6LFkU-hLPT9J5s1w13biuVg6RrGiUlNrtRrAzhXdtLQCmZEeSHoBE4AWe_YaQc3ZZKmDpXVhddn98jalNcdVW6qvZSZ9UcJ3HFpjhfmvY863QIeGCskvtg6GvUv9iIabq0S4z4III9gBEQiss5AoPAJd'
    },
    {
       id: 3,
       property: 'Loft 12 - Vila Madalena',
       tenant: 'Maria Oliveira',
       due: 'Vence em 15 Mar 2024',
       value: 'R$ 1.850',
       status: 'active',
       image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkcfV1X8IfPL08m_e6asPyQHASGGf4fpV1UnT1Y_L2fWe9_NoNNM1pvrww22Xdsk2vrfepFG5TDFQP8hyFO9siiX-nbhBiUQPOp6yw19Jyfr3tro5J_t2EYaJ-xHTh8apnVQPHNhxs7MD_eePul6XJnnGm_27hdN38K0AcdbLaPB7FebQiXgvoMJhs7UtC16e0PejNhsoyQqwo5Tp-0dae-aBf4E5a_Bv3xB8EjTWWd_ga5BPTK0fg7VHDPVKrJBetGh6c1SmYOHlt'
    },
    {
        id: 4,
        property: 'Studio 22 - Moema',
        due: 'Fim: 05 Jan 2023',
        value: 'R$ 1.100',
        status: 'ended',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDAfLHch6JerBDEJliJKQxhkpc_h1j-08WkkgIhbeXp9_5IiT9QbD17RYG8NIw6jPGXTbV9e5Vub4owL9pH-tOuBZqpRm2wmKuMWZfkr4HhzuYtn8ENrLJ3sw9Ery-xa9xEPEIwzX78_myGEuhcek81czES-V6_iNBx6q2pmKoGYaq_JvwM_0x3D1Fbj-gArQCzDbvJ_0zOmNGBuEUFTBxVs7ODncEfNqHq75JcHP1NcXs9nURIMFUOyTCi6Zx4QesQYygxNPbrIua'
    }
  ];

  return (
    <div className="h-full flex flex-col w-full max-w-md mx-auto md:max-w-4xl relative">
       <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark px-4 py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/5 transition-colors">
         <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Contratos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gestão de ativos</p>
         </div>
         <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark text-primary shadow-sm border border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
         >
            <Plus size={24} />
         </button>
       </header>

       <div className="px-4 py-2">
         <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            <button onClick={() => setActiveTab('all')} className={`flex h-9 shrink-0 items-center gap-x-2 rounded-full px-4 shadow-sm transition-all ${activeTab === 'all' ? 'bg-primary text-white' : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'}`}>
                <span className="text-sm font-bold">Todos</span>
            </button>
            <button onClick={() => setActiveTab('draft')} className={`flex h-9 shrink-0 items-center gap-x-2 rounded-full px-4 shadow-sm transition-all ${activeTab === 'draft' ? 'bg-primary text-white' : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'}`}>
                <span className="text-sm font-medium">Rascunho</span>
            </button>
            <button onClick={() => setActiveTab('active')} className={`flex h-9 shrink-0 items-center gap-x-2 rounded-full px-4 shadow-sm transition-all ${activeTab === 'active' ? 'bg-primary text-white' : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'}`}>
                <span className="text-sm font-medium">Ativo</span>
            </button>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">
          {contracts.map(contract => (
             <div key={contract.id} className={`flex flex-col bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden transition-colors ${contract.status === 'ended' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                 {contract.status === 'draft' ? (
                     <>
                        <div className="relative h-32 w-full">
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                           <div className="absolute top-3 left-3 z-20 bg-white/90 dark:bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wide">Rascunho</span>
                           </div>
                           <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${contract.image})` }}></div>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                           <div className="flex justify-between items-start">
                              <div>
                                 <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{contract.property}</h3>
                                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                    <Calendar size={16} /> {contract.dateRange}
                                 </p>
                              </div>
                              <div className="text-right">
                                 <p className="text-xs text-slate-400 font-medium uppercase">Valor</p>
                                 <p className="text-lg font-bold text-primary">{contract.value}</p>
                              </div>
                           </div>
                           <div className="w-full h-px bg-slate-100 dark:bg-white/5 my-1"></div>
                           <button onClick={() => setModalOpen(true)} className="flex w-full items-center justify-center rounded-xl h-11 bg-primary/10 hover:bg-primary/20 text-primary-dark dark:text-primary gap-2 text-sm font-bold transition-colors">
                              <PlayCircle size={20} /> Ativar Contrato
                           </button>
                        </div>
                     </>
                 ) : (
                    <div className="flex p-4 gap-4">
                       <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-white/5 relative">
                          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${contract.image})` }}></div>
                       </div>
                       <div className="flex-1 flex flex-col justify-between">
                          <div>
                             <div className="flex justify-between items-start mb-1">
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${contract.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'}`}>
                                   {contract.status === 'active' ? 'Ativo' : 'Encerrado'}
                                </span>
                                <span className="text-base font-bold text-slate-900 dark:text-white">{contract.value}</span>
                             </div>
                             <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{contract.property}</h3>
                             {contract.tenant && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{contract.tenant}</p>}
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                             {contract.status === 'active' ? <Clock size={14} /> : <History size={14} />} {contract.due}
                          </p>
                       </div>
                    </div>
                 )}
             </div>
          ))}
       </div>

       {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
             <div className="relative w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden animate-scaleUp flex flex-col ring-1 ring-white/10">
                <div className="p-6 pb-2 text-center">
                   <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
                      <AlertTriangle className="text-primary" size={32} />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ativar Contrato?</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Ao confirmar, a cobrança automática será iniciada para o inquilino. Este contrato <span className="font-bold text-slate-700 dark:text-slate-300">não poderá ser excluído</span>, apenas cancelado posteriormente.
                   </p>
                </div>
                <div className="p-4 flex flex-col gap-3">
                   <button onClick={() => setModalOpen(false)} className="flex w-full items-center justify-center rounded-xl h-12 bg-primary hover:bg-primary-dark text-white text-base font-bold shadow-lg shadow-primary/25 transition-all active:scale-95">
                      Confirmar Ativação
                   </button>
                   <button onClick={() => setModalOpen(false)} className="flex w-full items-center justify-center rounded-xl h-12 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 text-base font-bold transition-colors">
                      Cancelar
                   </button>
                </div>
             </div>
          </div>
       )}

       {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-fadeIn">
             <div className="w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-lg bg-background-light dark:bg-background-dark rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp ring-1 ring-white/10">
                <div className="flex-none pt-4 pb-2 w-full flex justify-center bg-background-light dark:bg-background-dark md:hidden">
                   <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                </div>
                <div className="flex-none flex items-center justify-between px-6 pb-4 pt-2 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-white/5">
                   <button onClick={() => setShowAddForm(false)} className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-white">Cancelar</button>
                   <h2 className="text-slate-900 dark:text-white text-lg font-bold">Novo Contrato</h2>
                   <div className="w-[70px]"></div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background-light dark:bg-background-dark">
                   <div className="flex flex-col gap-2">
                      <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold">Imóvel</label>
                      <div className="relative">
                         <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                         <select className="w-full appearance-none pl-12 pr-10 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-base dark:text-white focus:outline-none focus:border-primary transition-colors">
                            <option value="" disabled selected>Selecione o imóvel</option>
                            <option>Apt 101 - Centro</option>
                            <option>Studio 20 - Norte</option>
                            <option>Kitnet 05 - Jardins</option>
                         </select>
                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                      </div>
                   </div>

                   <div className="flex flex-col gap-2">
                      <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold">Inquilino</label>
                      <div className="relative">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                         <select className="w-full appearance-none pl-12 pr-10 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-base dark:text-white focus:outline-none focus:border-primary transition-colors">
                            <option value="" disabled selected>Selecione o inquilino</option>
                            <option>João Silva</option>
                            <option>Maria Oliveira</option>
                            <option>Carlos Pereira</option>
                         </select>
                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                      </div>
                   </div>
                   
                   <div className="h-px bg-slate-200 dark:bg-white/10"></div>

                   <div className="space-y-4">
                       <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <Calculator size={18} className="text-primary" />
                           Composição do Valor
                       </h3>
                       
                       <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col gap-2">
                                <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase">Aluguel (Base)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                                    <input 
                                        type="number" 
                                        value={rentValue}
                                        onChange={(e) => setRentValue(e.target.value)}
                                        className="w-full pl-9 pr-3 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:outline-none focus:border-primary placeholder-slate-300" 
                                        placeholder="0,00" 
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase">Condomínio</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                                    <input 
                                        type="number" 
                                        value={condoValue}
                                        onChange={(e) => setCondoValue(e.target.value)}
                                        className="w-full pl-9 pr-3 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:outline-none focus:border-primary placeholder-slate-300" 
                                        placeholder="0,00" 
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase">IPTU (Mensal)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                                    <input 
                                        type="number" 
                                        value={iptuValue}
                                        onChange={(e) => setIptuValue(e.target.value)}
                                        className="w-full pl-9 pr-3 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:outline-none focus:border-primary placeholder-slate-300" 
                                        placeholder="0,00" 
                                    />
                                </div>
                            </div>
                             <div className="flex flex-col gap-2">
                                <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase">Taxa Gestão</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                                    <input 
                                        type="number" 
                                        value={feeValue}
                                        onChange={(e) => setFeeValue(e.target.value)}
                                        className="w-full pl-9 pr-3 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:outline-none focus:border-primary placeholder-slate-300" 
                                        placeholder="0,00" 
                                    />
                                </div>
                            </div>
                       </div>
                       
                       <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl flex justify-between items-center border border-slate-200 dark:border-white/10">
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Total Mensal Estimado</span>
                            <span className="text-xl font-bold text-primary">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                       </div>
                   </div>

                   <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold mb-2 block">Início</label>
                            <input type="date" className="w-full px-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-base focus:outline-none focus:border-primary text-slate-600 dark:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                            <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold mb-2 block">Duração</label>
                             <div className="relative">
                                <select className="w-full appearance-none px-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-base focus:outline-none focus:border-primary text-slate-600 dark:text-white transition-colors">
                                    <option>12 meses</option>
                                    <option>24 meses</option>
                                    <option>30 meses</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>
                   </div>
                   
                   <div className="flex items-center gap-3 p-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="bg-slate-100 dark:bg-white/5 p-2.5 rounded-lg shrink-0 text-slate-500 dark:text-slate-400">
                         <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Anexar Contrato PDF</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">Opcional</p>
                      </div>
                   </div>
                </div>
                <div className="flex-none p-6 pt-2 bg-background-light dark:bg-background-dark border-t border-transparent z-20">
                   <button className="w-full h-14 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg shadow-lg shadow-primary/25 active:scale-[0.98] transition-all duration-200">
                      Criar Rascunho
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export default Contracts;