
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, FileText, BarChart3, Loader2 } from 'lucide-react';
import { Contract, ContractStatus } from '../types';
import { ContractCard } from '../components/contracts/ContractCard';
import { CreateContractWizard } from '../components/contracts/CreateContractWizard';
import { ContractDetails } from '../components/contracts/ContractDetails';
import { contractService } from '../services/contractService';

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filter, setFilter] = useState<'all' | ContractStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
      setLoading(true);
      try {
          const data = await contractService.getAll();
          setContracts(data);
      } catch (error) {
          console.error(error);
      } finally {
          setLoading(false);
      }
  };

  const handleCreateContract = async (data: any) => {
      try {
          // This is now just a wrapper for the service
          // In a real app we'd need to map the wizard data to the service format more carefully
          await contractService.create(data);
          loadContracts();
          setShowWizard(false);
      } catch (error) {
          console.error("Error creating contract", error);
      }
  };

  const handleUpdateContract = (updated: Contract) => {
      // In a real app, this would also call a service update method
      setContracts(contracts.map(c => c.id === updated.id ? updated : c));
      setSelectedContract(updated);
  };

  const filteredContracts = contracts.filter(c => {
      const matchesSearch = c.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.contract_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || c.status === filter;
      return matchesSearch && matchesFilter;
  });

  // Stats
  const activeCount = contracts.filter(c => c.status === 'active').length;
  const pendingCount = contracts.filter(c => c.status === 'pending_signature').length;
  const expiringCount = contracts.filter(c => c.status === 'expiring_soon').length;

  return (
    <div className="h-full flex flex-col w-full max-w-[1600px] mx-auto relative">
       
       {/* Header */}
       <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors">
         <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Gestão de Contratos</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Ciclo de vida e assinaturas digitais</p>
         </div>
         <button 
            onClick={() => setShowWizard(true)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95"
         >
            <Plus size={20} />
            <span className="hidden md:inline">Novo Contrato</span>
         </button>
       </header>

       <div className="flex-1 overflow-y-auto px-6 pb-24">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
              <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ativos</p>
                      <p className="text-2xl font-black text-emerald-500">{activeCount}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600"><FileText size={24} /></div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendentes</p>
                      <p className="text-2xl font-black text-blue-500">{pendingCount}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600"><RefreshCw size={24} /></div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vencendo</p>
                      <p className="text-2xl font-black text-amber-500">{expiringCount}</p>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600"><BarChart3 size={24} /></div>
              </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Buscar contratos..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                  />
              </div>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {[
                      { id: 'all', label: 'Todos' },
                      { id: 'active', label: 'Ativos' },
                      { id: 'pending_signature', label: 'Assinatura' },
                      { id: 'expiring_soon', label: 'Vencendo' },
                      { id: 'draft', label: 'Rascunhos' },
                  ].map(f => (
                      <button 
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                            filter === f.id 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' 
                            : 'bg-white dark:bg-surface-dark text-slate-500 border-gray-200 dark:border-white/5 hover:bg-slate-50'
                        }`}
                      >
                          {f.label}
                      </button>
                  ))}
              </div>
          </div>

          {/* Grid of Contracts */}
          {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <p>Carregando contratos...</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContracts.map(contract => (
                      <ContractCard 
                        key={contract.id} 
                        contract={contract} 
                        onClick={setSelectedContract}
                      />
                  ))}
              </div>
          )}
          
          {!loading && filteredContracts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <FileText size={48} className="opacity-50 mb-4" />
                  <p>Nenhum contrato encontrado.</p>
              </div>
          )}
       </div>

       {/* Modals */}
       {showWizard && (
           <CreateContractWizard 
             onClose={() => setShowWizard(false)} 
             onComplete={handleCreateContract} 
           />
       )}

       {selectedContract && (
           <ContractDetails 
             contract={selectedContract} 
             onClose={() => setSelectedContract(null)} 
             onUpdate={handleUpdateContract}
           />
       )}
    </div>
  );
};

export default Contracts;
