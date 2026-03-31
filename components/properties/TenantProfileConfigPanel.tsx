import React, { useState } from 'react';
import { 
  User, 
  Car, 
  Activity, 
  FileText, 
  Key, 
  CheckCircle, 
  Plus, 
  Save, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  ChevronDown
} from 'lucide-react';
import { RequirementStatus, TenantProfileConfig } from '../../types';
import { tenantConfigService, TEMPLATES } from '../../services/tenantConfigService';

interface TenantProfileConfigPanelProps {
  propertyId: string;
}

export const TenantProfileConfigPanel: React.FC<TenantProfileConfigPanelProps> = ({ propertyId }) => {
  const [config, setConfig] = useState<TenantProfileConfig>(
    tenantConfigService.getConfigForProperty(propertyId)
  );

  const handleStatusChange = (section: keyof TenantProfileConfig['sections'], field: string, status: RequirementStatus) => {
    setConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      if (section === 'personal') {
        (newConfig.sections.personal as any)[field] = status;
      } else if (section === 'residential') {
        (newConfig.sections.residential as any)[field] = status;
      } else if (section === 'emergency') {
        newConfig.sections.emergency.status = status;
      } else if (section === 'requiredDocs') {
        (newConfig.sections.requiredDocs as any)[field] = status;
      }
      return newConfig;
    });
  };

  const handleToggleSharedDoc = (field: keyof TenantProfileConfig['sections']['sharedDocs']) => {
    setConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      (newConfig.sections.sharedDocs as any)[field] = !(newConfig.sections.sharedDocs as any)[field];
      return newConfig;
    });
  };

  const handleSave = () => {
    tenantConfigService.saveConfig(config);
    alert('Configurações aplicadas para os inquilinos deste imóvel');
  };

  const applyTemplate = (templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey];
    setConfig({
      propertyId,
      sections: JSON.parse(JSON.stringify(template.config.sections))
    });
  };

  const StatusSelector = ({ section, field, currentStatus }: { section: any, field: string, currentStatus: RequirementStatus }) => (
    <div className='flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl gap-1'>
      {(['required', 'optional', 'hidden'] as RequirementStatus[]).map((s) => (
        <button
          key={s}
          onClick={() => handleStatusChange(section, field, s)}
          className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            currentStatus === s
              ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          {s === 'required' ? 'Obrigatório' : s === 'optional' ? 'Opcional' : 'Oculto'}
        </button>
      ))}
    </div>
  );

  return (
    <div className='space-y-8 animate-fadeIn pb-10'>
      {/* Template Selector */}
      <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
        <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1'>
          Template de Configuração
        </label>
        <div className='relative'>
          <select 
            onChange={(e) => applyTemplate(e.target.value as any)}
            className='w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-white/5 border border-transparent rounded-xl text-sm font-bold text-slate-900 dark:text-white appearance-none outline-none focus:ring-2 focus:ring-primary cursor-pointer'
          >
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <option key={key} value={key}>{t.label}</option>
            ))}
          </select>
          <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' size={16} />
        </div>
      </div>

      {/* Personal Info */}
      <section className='space-y-4'>
        <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
          <User size={14} className='text-blue-500' /> Informações Pessoais
        </h3>
        <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden'>
          <div className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between opacity-50'>
            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>Nome Completo</span>
            <span className='text-[10px] font-black text-primary uppercase tracking-widest'>Obrigatório (Fixo)</span>
          </div>
          <div className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between opacity-50'>
            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>CPF</span>
            <span className='text-[10px] font-black text-primary uppercase tracking-widest'>Obrigatório (Fixo)</span>
          </div>
          <div className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>Profissão</span>
            <StatusSelector section="personal" field="occupation" currentStatus={config.sections.personal.occupation} />
          </div>
        </div>
      </section>

      {/* Residential Info */}
      <section className='space-y-4'>
        <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
          <Car size={14} className='text-emerald-500' /> Dados Residenciais
        </h3>
        <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden'>
          <div className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>Veículo (Placa)</span>
            <StatusSelector section="residential" field="vehicle" currentStatus={config.sections.residential.vehicle} />
          </div>
          <div className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>Pets</span>
            <StatusSelector section="residential" field="pets" currentStatus={config.sections.residential.pets} />
          </div>
          <div className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>Moradores</span>
            <StatusSelector section="residential" field="residents" currentStatus={config.sections.residential.residents} />
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className='space-y-4'>
        <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
          <Activity size={14} className='text-red-500' /> Contato de Emergência
        </h3>
        <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden p-4 flex items-center justify-between'>
          <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>Seção de Emergência</span>
          <StatusSelector section="emergency" field="status" currentStatus={config.sections.emergency.status} />
        </div>
      </section>

      {/* Required Documents */}
      <section className='space-y-4'>
        <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
          <FileText size={14} className='text-indigo-500' /> Documentos Exigidos do Inquilino
        </h3>
        <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden'>
          <div className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>RG ou CNH</span>
            <StatusSelector section="requiredDocs" field="id_card" currentStatus={config.sections.requiredDocs.id_card} />
          </div>
          <div className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>Comprovante de Renda</span>
            <StatusSelector section="requiredDocs" field="income" currentStatus={config.sections.requiredDocs.income} />
          </div>
          <div className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>Comp. de Residência</span>
            <StatusSelector section="requiredDocs" field="residence" currentStatus={config.sections.requiredDocs.residence} />
          </div>
          <div className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>Apólice / Garantia</span>
            <StatusSelector section="requiredDocs" field="guarantee" currentStatus={config.sections.requiredDocs.guarantee} />
          </div>
        </div>
      </section>

      {/* Shared Documents */}
      <section className='space-y-4'>
        <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
          <Key size={14} className='text-primary' /> Documentos Compartilhados (Proprietário)
        </h3>
        <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden'>
          {[
            { id: 'contract', label: 'Contrato de Locação' },
            { id: 'inspection', label: 'Laudo de Vistoria' },
            { id: 'rules', label: 'Regimento Interno' },
          ].map((doc) => (
            <div key={doc.id} className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between'>
              <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>{doc.label}</span>
              <button 
                onClick={() => handleToggleSharedDoc(doc.id as any)}
                className={`p-1 rounded-full transition-colors ${config.sections.sharedDocs[doc.id as keyof typeof config.sections.sharedDocs] ? 'text-primary' : 'text-slate-300'}`}
              >
                {config.sections.sharedDocs[doc.id as keyof typeof config.sections.sharedDocs] ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className='w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2'
      >
        <Save size={20} /> Salvar Configurações
      </button>
    </div>
  );
};
