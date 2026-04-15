import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Map, List, Grid, Filter, Loader2, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Property } from '../types';
import { PropertyCard } from '../components/properties/PropertyCard';
import { PropertyDetails } from '../components/properties/PropertyDetails';
import { AddPropertyForm } from '../components/properties/AddPropertyForm';
import { PropertyMapView } from '../components/properties/PropertyMapView';
import { propertyService } from '../services/propertyService';

const Properties: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters State
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced Filters State
  const [filterBedrooms, setFilterBedrooms] = useState<number | null>(null);
  const [filterBathrooms, setFilterBathrooms] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minArea, setMinArea] = useState<string>('');

  const { data: properties = [], isLoading: loading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const data = await propertyService.getAll();
      if (data.length === 0) {
        // Fallback for demo
        return [
          {
            id: 1,
            name: 'Studio Centro 01 (Demo)',
            address: 'Rua Augusta, 150 - Consolação',
            status: 'DISPONÍVEL',
            status_color:
              'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 ring-emerald-600/20',
            price: 'R$ 1.800,00',
            area: '32m²',
            image:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAgfR0PLTBL8ZIF2qB0vPybwAfsoDq8YSZzrKO3YvbwHO-Dpx9DUD2lZhqZkykfNGgmlkvRF9VoaOcFSV48Ht6XdzQp1ASbt0CpENqCrjtZ6x_SpyNv4OXSv-OUKF3My_NTXKXoNBwigKtzWOjuevabMquLo_GRZDELE3S0LAzp4Pt566NLfyIwPht6jvwGH-diZQCj-F-TMnZkCJ3Li_A3_jxlfoFWldjBhZH7bF-J3hqcCscwB5q2HZdGT9WVIuT8DAJFDjet9POu',
            tenant: null,
            contract: null,
          },
        ] as Property[];
      }
      return data;
    },
  });

  // Check for navigation state to open Add Form
  useEffect(() => {
    if (location.state && (location.state as any).openAdd) {
      setShowAddForm(true);
      // Clean state to avoid reopening on simple refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSaveProperty = async (data: any) => {
    // In a real app, we would call propertyService.create(data)
    console.log('Saving property', data);
    setShowAddForm(false);
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  };

  const handleCreateContract = (property: Property) => {
    navigate('/contracts', { state: { preSelectedProperty: property.name } });
  };

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.address.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter !== 'Todos') {
      if (activeFilter === 'Disponível' && prop.status !== 'DISPONÍVEL') return false;
      if (activeFilter === 'Alugado' && prop.status !== 'ALUGADO') return false;
    }

    const matchesBedrooms = filterBedrooms === null || (prop.bedrooms && prop.bedrooms >= filterBedrooms);
    const matchesBathrooms = filterBathrooms === null || (prop.bathrooms && prop.bathrooms >= filterBathrooms);

    const priceNum = parseFloat(prop.price?.replace(/[^0-9,]/g, '').replace(',', '.') || '0');
    const matchesMinPrice = !minPrice || priceNum >= parseFloat(minPrice);
    const matchesMaxPrice = !maxPrice || priceNum <= parseFloat(maxPrice);

    const areaNum = parseFloat(prop.area?.replace(/\D/g, '') || '0');
    const matchesMinArea = !minArea || areaNum >= parseFloat(minArea);

    return matchesBedrooms && matchesBathrooms && matchesMinPrice && matchesMaxPrice && matchesMinArea;
  });

  const clearFilters = () => {
    setFilterBedrooms(null);
    setFilterBathrooms(null);
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setActiveFilter('Todos');
  };

  return (
    <div
      className={`h-full flex flex-col w-full relative ${viewMode !== 'map' ? 'max-w-md mx-auto md:max-w-4xl' : ''}`}
    >
      {viewMode !== 'map' && (
        <header className='sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center transition-colors'>
          <div>
            <h1 className='text-xl font-bold tracking-tight text-slate-900 dark:text-white'>
              Meus Ativos
            </h1>
            <p className='text-sm text-slate-500 dark:text-slate-400'>Gestão de propriedades</p>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700'>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-400'}`}
                title='Lista'
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-400'}`}
                title='Grade'
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-400'}`}
                title='Mapa'
              >
                <Map size={20} />
              </button>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className='flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95'
            >
              <Plus size={18} />
              <span className='hidden sm:inline'>Novo Imóvel</span>
              <span className='sm:hidden'>Novo</span>
            </button>
          </div>
        </header>
      )}

      {viewMode !== 'map' ? (
        <>
          <div className='px-6 py-4'>
            <div className='flex gap-3 overflow-x-auto hide-scrollbar pb-2'>
              <div className='min-w-[110px] flex-1 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-200/60 dark:border-gray-800 transition-colors'>
                <p className='text-slate-500 dark:text-slate-400 text-sm font-medium mb-1'>Total</p>
                <p className='text-3xl font-bold text-slate-900 dark:text-white'>
                  {properties.length}
                </p>
              </div>
              <div className='min-w-[110px] flex-1 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-200/60 dark:border-gray-800 transition-colors'>
                <p className='text-slate-500 dark:text-slate-400 text-sm font-medium mb-1'>
                  Alugados
                </p>
                <p className='text-3xl font-bold text-slate-900 dark:text-white'>
                  {properties.filter((p) => p.status === 'ALUGADO').length}
                </p>
              </div>
              <div className='min-w-[110px] flex-1 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-200/60 dark:border-gray-800 transition-colors'>
                <p className='text-slate-500 dark:text-slate-400 text-sm font-medium mb-1'>
                  Livres
                </p>
                <p className='text-3xl font-bold text-slate-900 dark:text-white'>
                  {properties.filter((p) => p.status === 'DISPONÍVEL').length}
                </p>
              </div>
            </div>
          </div>

          <div className='px-6 pb-4 space-y-3'>
            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400'>
                  <Search size={20} />
                </div>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='block w-full rounded-xl border-none bg-white dark:bg-surface-dark py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-800 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 transition-all'
                  placeholder='Buscar por apelido ou endereço...'
                />
              </div>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-3.5 rounded-xl border flex items-center justify-center transition-colors ${showAdvancedFilters
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-800 text-slate-500'
                  }`}
              >
                <Filter size={20} />
              </button>
            </div>

            {/* Collapsible Advanced Filters */}
            {showAdvancedFilters && (
              <div className='animate-slideUp p-6 bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-white/5 shadow-md space-y-6'>
                <div className='flex justify-between items-center'>
                  <h4 className='text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider'>Filtros Avançados</h4>
                  <button onClick={clearFilters} className='text-xs font-bold text-primary hover:underline'>Limpar Tudo</button>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
                  <div className='space-y-3'>
                    <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Dormitórios & Banheiros</label>
                    <div className='flex flex-col gap-2'>
                      <div className='flex gap-1 bg-slate-100 dark:bg-black/20 p-1 rounded-lg'>
                        {[1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            onClick={() => setFilterBedrooms(n)}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${filterBedrooms === n ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}
                          >
                            {n}{n === 4 ? '+' : ''}
                          </button>
                        ))}
                      </div>
                      <div className='flex gap-1 bg-slate-100 dark:bg-black/20 p-1 rounded-lg'>
                        {[1, 2, 3].map((n) => (
                          <button
                            key={n}
                            onClick={() => setFilterBathrooms(n)}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${filterBathrooms === n ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}
                          >
                            {n}{n === 3 ? '+' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Faixa de Aluguel (R$)</label>
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        placeholder='Min'
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className='w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 text-sm outline-none focus:border-primary'
                      />
                      <span className='text-slate-300'>-</span>
                      <input
                        type='number'
                        placeholder='Max'
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className='w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 text-sm outline-none focus:border-primary'
                      />
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Área Mínima (m²)</label>
                    <input
                      type='number'
                      placeholder='Ex: 50'
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      className='w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 text-sm outline-none focus:border-primary'
                    />
                  </div>
                </div>
              </div>
            )}

            <div className='flex gap-2 overflow-x-auto hide-scrollbar pt-1'>
              {['Todos', 'Disponível', 'Alugado'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex h-8 shrink-0 items-center justify-center rounded-full px-4 shadow-sm transition-colors text-xs font-bold ${activeFilter === filter
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400 ring-1 ring-inset ring-gray-200 dark:ring-gray-800 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className='flex-1 overflow-y-auto px-6 pb-24'>
            {loading ? (
              <div className='flex flex-col items-center justify-center py-20 text-slate-400'>
                <Loader2 className='animate-spin mb-2' size={32} />
                <p>Carregando imóveis...</p>
              </div>
            ) : filteredProperties.length > 0 ? (
              <div
                className={viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 gap-4 pt-4'
                  : 'space-y-4 pt-4'
                }
              >
                {filteredProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onClick={setSelectedProperty}
                    onEdit={(id) => console.log('Edit', id)}
                    onDelete={(id) => console.log('Delete', id)}
                    onCreateContract={handleCreateContract}
                    viewMode={viewMode === 'grid' ? 'grid' : 'list'}
                  />
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-10 text-center pt-4'>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3'>
                  <Search className='text-gray-400' size={32} />
                </div>
                <p className='text-slate-900 dark:text-white font-bold'>Nenhum imóvel encontrado</p>
                <p className='text-slate-500 dark:text-slate-400 text-sm'>
                  Tente mudar os filtros ou a busca.
                </p>
              </div>
            )}
          </div>

        </>
      ) : (
        <PropertyMapView properties={properties} onBack={() => setViewMode('list')} />
      )}

      {selectedProperty && viewMode === 'list' && (
        <PropertyDetails property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}

      {showAddForm && (
        <AddPropertyForm onClose={() => setShowAddForm(false)} onSave={handleSaveProperty} />
      )}
    </div>
  );
};

export default Properties;
