import React from 'react';
import { User, CreditCard, Mail, Phone, Plus, X } from 'lucide-react';
import { Tenant } from '../../../types';
import { ContractFormData } from './useContractWizard';

interface TenantSelectionStepProps {
  loading: boolean;
  tenants: Tenant[];
  tenantSearch: string;
  onSearchChange: (value: string) => void;
  showNewTenantForm: boolean;
  onToggleNewForm: (show: boolean) => void;
  selectedTenantId: string | null;
  onSelectTenant: (id: string, name: string, cpf: string, email: string) => void;
  formData: ContractFormData;
  onFormDataChange: (data: Partial<ContractFormData>) => void;
}

export const TenantSelectionStep: React.FC<TenantSelectionStepProps> = ({
  loading,
  tenants,
  tenantSearch,
  onSearchChange,
  showNewTenantForm,
  onToggleNewForm,
  selectedTenantId,
  onSelectTenant,
  formData,
  onFormDataChange,
}) => {
  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      (t.cpf && t.cpf.includes(tenantSearch))
  );

  return (
    <div className='space-y-8 animate-fadeIn max-w-2xl mx-auto w-full'>
      <div className='text-center'>
        <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
          Quem é o Inquilino?
        </h3>
        <p className='text-slate-500'>Busque em sua base de dados ou cadastre um novo.</p>
      </div>

      {!showNewTenantForm ? (
        <div className='space-y-4'>
          <div className='relative group'>
            <User
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors'
              size={20}
            />
            <input
              type='text'
              value={tenantSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder='Buscar por nome ou CPF...'
              className='w-full pl-12 pr-16 py-5 bg-white dark:bg-surface-dark border-2 border-transparent focus:border-primary rounded-3xl shadow-sm outline-none font-bold text-lg text-slate-900 dark:text-white transition-all placeholder-slate-300'
              autoFocus
            />
            <button
              onClick={() => onToggleNewForm(true)}
              className='absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl flex items-center justify-center transition-all'
              title='Novo Inquilino'
            >
              <Plus size={24} />
            </button>
            {tenantSearch && (
              <button
                onClick={() => onSearchChange('')}
                className='absolute right-14 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500'
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className='space-y-3'>
            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-2'>
              {tenantSearch ? 'Resultados da busca' : 'Inquilinos Recentes'}
            </p>
            <div className='grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar'>
              {loading ? (
                <div className='py-10 text-center'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2'></div>
                </div>
              ) : (
                filteredTenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() =>
                      onSelectTenant(tenant.id, tenant.name, tenant.cpf || '', tenant.email)
                    }
                    className={`group p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                      selectedTenantId === tenant.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-white dark:border-white/5 bg-white dark:bg-surface-dark hover:border-slate-100 dark:hover:border-white/10'
                    }`}
                  >
                    <img
                      src={tenant.image || `https://i.pravatar.cc/150?u=${tenant.email}`}
                      className='w-12 h-12 rounded-full border border-slate-100 dark:border-white/5'
                      alt=''
                    />
                    <div className='flex-1'>
                      <h4 className='font-bold text-slate-900 dark:text-white leading-tight'>
                        {tenant.name}
                      </h4>
                      <p className='text-xs text-slate-400 font-medium'>
                        {tenant.cpf} • {tenant.email}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedTenantId === tenant.id ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-white/5'}`}
                    >
                      {selectedTenantId === tenant.id && (
                        <div className='w-1.5 h-1.5 bg-white rounded-full' />
                      )}
                    </div>
                  </button>
                ))
              )}
              {!loading && filteredTenants.length === 0 && (
                <div className='p-8 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10'>
                  <User size={40} className='mx-auto text-slate-300 mb-3' />
                  <p className='text-slate-500 font-bold'>Nenhum inquilino encontrado</p>
                  <button
                    onClick={() => onToggleNewForm(true)}
                    className='mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all'
                  >
                    Cadastrar Novo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='space-y-6 animate-slideUp'>
          <div className='bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 space-y-6'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-[10px] font-black text-primary uppercase tracking-widest'>
                Novo Inquilino
              </span>
              <button
                onClick={() => onToggleNewForm(false)}
                className='text-xs font-bold text-slate-400 hover:text-slate-600'
              >
                Voltar para busca
              </button>
            </div>
            <div>
              <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1'>
                Nome Completo
              </label>
              <div className='relative'>
                <User
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                  size={20}
                />
                <input
                  value={formData.tenantName}
                  onChange={(e) => onFormDataChange({ tenantName: e.target.value })}
                  className='w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black/40 outline-none transition-all font-medium text-slate-900 dark:text-white'
                  placeholder='Ex: João da Silva'
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1'>
                CPF
              </label>
              <div className='relative'>
                <CreditCard
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                  size={20}
                />
                <input
                  value={formData.tenantCpf}
                  onChange={(e) => onFormDataChange({ tenantCpf: e.target.value })}
                  className='w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black/40 outline-none transition-all font-medium text-slate-900 dark:text-white'
                  placeholder='000.000.000-00'
                />
              </div>
            </div>
            <div>
              <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1'>
                E-mail
              </label>
              <div className='relative'>
                <Mail
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                  size={20}
                />
                <input
                  type='email'
                  value={formData.tenantEmail}
                  onChange={(e) => onFormDataChange({ tenantEmail: e.target.value })}
                  className='w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black/40 outline-none transition-all font-medium text-slate-900 dark:text-white'
                  placeholder='inquilino@email.com'
                />
              </div>
            </div>
            <div>
              <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1'>
                Telefone
              </label>
              <div className='relative'>
                <Phone
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                  size={20}
                />
                <input
                  value={formData.tenantPhone}
                  onChange={(e) => onFormDataChange({ tenantPhone: e.target.value })}
                  className='w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black/40 outline-none transition-all font-medium text-slate-900 dark:text-white'
                  placeholder='(11) 99999-9999'
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
