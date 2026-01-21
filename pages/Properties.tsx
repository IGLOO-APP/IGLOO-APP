import React, { useState, useEffect } from 'react';
import { Search, Plus, Map, List, Eye, Clock, ChevronDown, Filter } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Property } from '../types';
import { PropertyCard } from '../components/properties/PropertyCard';
import { PropertyDetails } from '../components/properties/PropertyDetails';
import { AddPropertyForm } from '../components/properties/AddPropertyForm';
import { PropertyMapView } from '../components/properties/PropertyMapView';

const Properties: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const location = useLocation();
  
  // Filters State
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [priceFilter, setPriceFilter] = useState('Todos');

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Check for navigation state to open Add Form
  useEffect(() => {
    if (location.state && (location.state as any).openAdd) {
        setShowAddForm(true);
        // Clean state to avoid reopening on simple refresh
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData: Property[] = [
        {
          id: 1,
          name: 'Studio Centro 01',
          address: 'Rua Augusta, 150 - Consolação',
          status: 'DISPONÍVEL',
          status_color: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 ring-emerald-600/20',
          price: 'R$ 1.800,00',
          area: '32m²',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgfR0PLTBL8ZIF2qB0vPybwAfsoDq8YSZzrKO3YvbwHO-Dpx9DUD2lZhqZkykfNGgmlkvRF9VoaOcFSV48Ht6XdzQp1ASbt0CpENqCrjtZ6x_SpyNv4OXSv-OUKF3My_NTXKXoNBwigKtzWOjuevabMquLo_GRZDELE3S0LAzp4Pt566NLfyIwPht6jvwGH-diZQCj-F-TMnZkCJ3Li_A3_jxlfoFWldjBhZH7bF-J3hqcCscwB5q2HZdGT9WVIuT8DAJFDjet9POu',
          tenant: null,
          contract: null
        },
        {
          id: 2,
          name: 'Loft Industrial Sul',
          address: 'Av. Brasil, 890 - Bloco B',
          status: 'ALUGADO',
          status_color: 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 ring-blue-600/20',
          price: 'R$ 2.400,00',
          area: '55m²',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrarWz4gL9lkfBoellhAl5mW22mgklGbB9dEr_NaGa6vlQy5SqOrn2pM6ppygSc_gLkAc1gFaNbmJjui8AxPoHqC9FzTvxLno9SbfC_2TPnUHnTW1hW3iNpzdSKjvYFZSwlZ6dX_H-1KM-w0s7uUAsl_9l9mwmLwfZ9ojV9I1jzq3g3hHhAdyrN9D8oAVpIC11r1eltNskvYupRGPJK8-DIFVuoxb9lIi6rgbsZE3K35P5p61IdjrVaKjtfGrQONxubXSW-PpczAp-',
          tenant: {
            id: 101,
            name: 'João Silva',
            email: 'joao.silva@email.com',
            phone: '+55 11 99999-9999',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf',
            status: 'active'
          },
          contract: {
            id: 501,
            start_date: '10/01/2024',
            end_date: '10/01/2026',
            value: 'R$ 2.400,00',
            status: 'active',
            property: 'Loft Industrial Sul'
          }
        },
        {
          id: 3,
          name: 'Kitnet Universitária',
          address: 'Rua dos Estudantes, 55',
          status: 'MANUTENÇÃO',
          status_color: 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 ring-orange-600/20',
          price: 'R$ 850,00',
          area: '28m²',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQhrkJXv0C_WrEvHSWZAmhTICaSnjWW23H8O9q1Yfyu_ypj58QZWxWVIY8VxliN8oc_4PaAUnFrDQ0AH_Dksg6L6kZSVdGv4Qo9GPW1d7gk4Sx3utxrI0aAZr_4UljYhGEVvpt4ERkcOtTDjpvJdqsnXJWS-S_GuEI0WiErMDQFDcHqP9bgt2dYFDB0w9085Hng4zTF9kOVAr6VHeJnsm9toSU-uxnV2B897nMPK1owguRfdifypWkDjZ6JV_sl5Udu4CKDzpbGIhV',
          tenant: null,
          contract: null
        }
      ];
      setProperties(mockData);
      setLoading(false);
    };

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(prop => {
    const matchesSearch = prop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prop.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeFilter !== 'Todos') {
        if (activeFilter === 'Disponível' && prop.status !== 'DISPONÍVEL') return false;
        if (activeFilter === 'Alugado' && prop.status !== 'ALUGADO') return false;
    }

    if (typeFilter !== 'Todos') {
        // Mock type check
        if (typeFilter === 'Studio' && !prop.name.includes('Studio')) return false;
        if (typeFilter === 'Kitnet' && !prop.name.includes('Kitnet')) return false;
    }

    return true;
  });

  return (
    <div className={`h-full flex flex-col w-full relative ${viewMode === 'list' ? 'max-w-md mx-auto md:max-w-4xl' : ''}`}>
       
       {viewMode === 'list' && (
         <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center transition-colors">
           <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Meus Ativos</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gestão de propriedades</p>
           </div>
           <div className="flex items-center gap-3">
               <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                   <button 
                    onClick={() => setViewMode('list')}
                    className="p-1.5 rounded-md transition-all bg-white dark:bg-slate-600 shadow-sm text-primary"
                   >
                       <List size={20} />
                   </button>
                   <button 
                    onClick={() => setViewMode('map')}
                    className="p-1.5 rounded-md transition-all text-slate-400"
                   >
                       <Map size={20} />
                   </button>
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-gray-300 dark:border-gray-600">
                   <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM3l8xEYNsxJIcCiKMyztOxjq0R735KO6nx0tiUO_nwa_Q9RXgh7E9ZDrJXmh3qFi1m6T1DejpJublRcE7Nwz58caOv3330jKyAjMpCp0rkro7Gb1vce2gTS-3TcRgGd4_wk-daMwo67k7hPLxrPCWPA0rdwZCIdA73paClNANN8LpF2qywdFk3DLLd28FBpEBtH_v0qMa1uIweblTtxVKrIhFCNaETzJD6K7efIeSwZEbcHtSLCyWsX9vhWqQn4yXpbUMR2J8Tx87" alt="Profile" className="w-full h-full object-cover" />
               </div>
           </div>
         </header>
       )}

       {viewMode === 'list' ? (
         <>
           <div className="px-6 py-4">
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                <div className="min-w-[110px] flex-1 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-200/60 dark:border-gray-800 transition-colors">
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total</p>
                   <p className="text-3xl font-bold text-slate-900 dark:text-white">{properties.length}</p>
                </div>
                <div className="min-w-[110px] flex-1 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-200/60 dark:border-gray-800 transition-colors">
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Alugados</p>
                   <p className="text-3xl font-bold text-slate-900 dark:text-white">{properties.filter(p => p.status === 'ALUGADO').length}</p>
                </div>
                <div className="min-w-[110px] flex-1 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-200/60 dark:border-gray-800 transition-colors">
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Livres</p>
                   <p className="text-3xl font-bold text-slate-900 dark:text-white">{properties.filter(p => p.status === 'DISPONÍVEL').length}</p>
                </div>
              </div>
           </div>

           <div className="px-6 pb-4 space-y-3">
              <div className="flex gap-2">
                  <div className="relative flex-1">
                     <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                        <Search size={20} />
                     </div>
                     <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-xl border-none bg-white dark:bg-surface-dark py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-800 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 transition-all" 
                        placeholder="Buscar por apelido ou endereço..." 
                     />
                  </div>
                  <button 
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`px-3.5 rounded-xl border flex items-center justify-center transition-colors ${
                        showAdvancedFilters 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-800 text-slate-500'
                    }`}
                  >
                      <Filter size={20} />
                  </button>
              </div>

              {/* Collapsible Advanced Filters */}
              {showAdvancedFilters && (
                  <div className="animate-slideUp bg-slate-50 dark:bg-black/20 p-3 rounded-xl flex gap-3 overflow-x-auto hide-scrollbar border border-slate-100 dark:border-white/5">
                      <div className="relative shrink-0">
                          <select 
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="appearance-none h-10 pl-3 pr-8 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary outline-none"
                          >
                              <option value="Todos">Tipo: Todos</option>
                              <option value="Studio">Studio</option>
                              <option value="Kitnet">Kitnet</option>
                              <option value="Apartamento">Apartamento</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                      <div className="relative shrink-0">
                          <select 
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            className="appearance-none h-10 pl-3 pr-8 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary outline-none"
                          >
                              <option value="Todos">Preço: Todos</option>
                              <option value="low">Até R$ 1.500</option>
                              <option value="mid">R$ 1.500 - R$ 3.000</option>
                              <option value="high">Acima de R$ 3.000</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                  </div>
              )}

              <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-1">
                 {['Todos', 'Disponível', 'Alugado'].map((filter) => (
                    <button 
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`flex h-8 shrink-0 items-center justify-center rounded-full px-4 shadow-sm transition-colors text-xs font-bold ${
                            activeFilter === filter 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                            : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400 ring-1 ring-inset ring-gray-200 dark:ring-gray-800 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                    >
                        {filter}
                    </button>
                 ))}
              </div>
           </div>

           <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
              {loading ? (
                 <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
              ) : filteredProperties.length > 0 ? (
                filteredProperties.map((prop) => (
                    <div key={prop.id} className="relative group">
                        <PropertyCard 
                            property={prop} 
                            onClick={setSelectedProperty} 
                            onEdit={(id) => console.log('Edit', id)}
                            onDelete={(id) => console.log('Delete', id)}
                        />
                        {/* Quick Metrics Overlay in List View */}
                        <div className="absolute top-3 right-3 flex gap-2">
                            {prop.status === 'DISPONÍVEL' && (
                                <div className="flex items-center gap-1 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-white/10 shadow-sm">
                                    <Clock size={10} /> 12 dias
                                </div>
                            )}
                            <div className="flex items-center gap-1 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-white/10 shadow-sm">
                                <Eye size={10} /> 24
                            </div>
                        </div>
                    </div>
                ))
              ) : (
                 <div className="flex flex-col items-center justify-center py-10 text-center">
                     <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                         <Search className="text-gray-400" size={32} />
                     </div>
                     <p className="text-slate-900 dark:text-white font-bold">Nenhum imóvel encontrado</p>
                     <p className="text-slate-500 dark:text-slate-400 text-sm">Tente mudar os filtros ou a busca.</p>
                 </div>
              )}
           </div>

           <div className="absolute bottom-6 right-6 z-20 md:fixed md:bottom-6 md:right-6">
              <button 
                onClick={() => setShowAddForm(true)}
                className="flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-lg h-14 pl-5 pr-6 shadow-lg shadow-primary/30 transition-all transform active:scale-95"
              >
                 <Plus size={24} />
                 <span>Adicionar Imóvel</span>
              </button>
           </div>
         </>
       ) : (
         <PropertyMapView 
            properties={properties} 
            onBack={() => setViewMode('list')} 
         />
       )}

       {selectedProperty && viewMode === 'list' && (
          <PropertyDetails 
            property={selectedProperty} 
            onClose={() => setSelectedProperty(null)} 
          />
       )}

       {showAddForm && (
          <AddPropertyForm 
            onClose={() => setShowAddForm(false)} 
            onSave={(data) => { console.log(data); setShowAddForm(false); }}
          />
       )}
    </div>
  );
};

export default Properties;