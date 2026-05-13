import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterPlan: string;
  setFilterPlan: (val: string) => void;
  filterRole: string;
  setFilterRole: (val: string) => void;
  filterPeriod: string;
  setFilterPeriod: (val: string) => void;
  onClearFilters: () => void;
  onExportCSV: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterPlan,
  setFilterPlan,
  filterRole,
  setFilterRole,
  filterPeriod,
  setFilterPeriod,
  onClearFilters,
  onExportCSV,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const FilterSelect = ({
    label,
    value,
    options,
    onChange,
  }: {
    label: string;
    value: string;
    options: string[];
    onChange: (val: string) => void;
  }) => (
    <div className='relative group'>
      <button
        onClick={() => setActiveDropdown(activeDropdown === label ? null : label)}
        className='flex items-center gap-2 px-4 py-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all min-w-[140px] justify-between'
      >
        <span className='truncate'>
          {label}: {value}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${activeDropdown === label ? 'rotate-180' : ''}`}
        />
      </button>

      {activeDropdown === label && (
        <>
          <div className='fixed inset-0 z-10' onClick={() => setActiveDropdown(null)}></div>
          <div className='absolute top-full left-0 mt-2 w-full bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 py-2 z-20 animate-scaleUp origin-top'>
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setActiveDropdown(null);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${value === opt ? 'text-primary bg-primary/5' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='relative flex-1 max-w-md group'>
          <Search
            className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors'
            size={20}
          />
          <input
            type='text'
            placeholder='Buscar por nome, email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-900 dark:text-white font-medium'
          />
        </div>

        <button
          onClick={onExportCSV}
          className='px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95'
        >
          Exportar CSV
        </button>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <FilterSelect
          label='Status'
          value={filterStatus}
          options={['Todos', 'Ativo', 'Trial', 'Inativo', 'Suspenso']}
          onChange={setFilterStatus}
        />
        <FilterSelect
          label='Plano'
          value={filterPlan}
          options={['Todos', 'Free', 'Pro', 'Elite', 'Trial', 'Premium']}
          onChange={setFilterPlan}
        />
        <FilterSelect
          label='Role'
          value={filterRole}
          options={['Todos', 'Proprietário', 'Inquilino', 'Administrador']}
          onChange={setFilterRole}
        />
        <FilterSelect
          label='Período'
          value={filterPeriod}
          options={['Todos', 'Hoje', 'Últimos 7 dias', 'Último mês', 'Último ano']}
          onChange={setFilterPeriod}
        />

        {(filterStatus !== 'Todos' ||
          filterPlan !== 'Todos' ||
          filterRole !== 'Todos' ||
          filterPeriod !== 'Todos' ||
          searchTerm) && (
            <button
              onClick={onClearFilters}
              className='text-xs font-bold text-primary hover:underline'
            >
              Limpar Filtros
            </button>
          )}
      </div>
    </div>
  );
};
