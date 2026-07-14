import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Car,
  Activity,
  FileText,
  Key,
  Plus,
  Save,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { RequirementStatus, TenantProfileConfig } from '../../types';
import { tenantConfigService, TEMPLATES } from '../../services/tenancy/tenantConfigService';
import { toast } from 'sonner';

interface TenantProfileConfigPanelProps {
  propertyId: string;
}

const StatusSelector = ({
  section,
  field,
  currentStatus,
  onStatusChange,
}: {
  section: any;
  field: string;
  currentStatus: RequirementStatus;
  onStatusChange: (section: any, field: string, status: RequirementStatus) => void;
}) => (
  <div className='flex bg-white/10 p-1 rounded-xl gap-1 border border-white/10'>
    {(['required', 'optional', 'hidden'] as RequirementStatus[]).map((s) => (
      <button
        key={s}
        onClick={() => onStatusChange(section, field, s)}
        className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
          currentStatus === s
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        {s === 'required' ? 'Obrigatório' : s === 'optional' ? 'Opcional' : 'Oculto'}
      </button>
    ))}
  </div>
);

export const TenantProfileConfigPanel: React.FC<TenantProfileConfigPanelProps> = ({
  propertyId,
}) => {
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [config, setConfig] = useState<TenantProfileConfig | null>(null);
  const queryClient = useQueryClient();

  const { data: loadedConfig } = useQuery({
    queryKey: ['tenant-config', propertyId],
    queryFn: () => tenantConfigService.getConfigForProperty(propertyId),
  });

  useEffect(() => {
    if (loadedConfig && !config) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfig(loadedConfig);
    }
  }, [loadedConfig, config]);

  const [newSharedDoc, setNewSharedDoc] = useState('');
  const [newRequiredDoc, setNewRequiredDoc] = useState({ label: '', description: '' });

  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' | 'system' = 'info'
  ) => {
    switch (type) {
      case 'success':
        toast.success(title, { description: message });
        break;
      case 'error':
        toast.error(title, { description: message });
        break;
      case 'warning':
        toast.warning(title, { description: message });
        break;
      case 'system':
      case 'info':
      default:
        toast.info(title, { description: message });
        break;
    }
  };

  const handleStatusChange = (
    section: keyof TenantProfileConfig['sections'],
    field: string,
    status: RequirementStatus
  ) => {
    setConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      if (section === 'personal') {
        (newConfig.sections.personal as any)[field] = status;
      } else if (section === 'residential') {
        (newConfig.sections.residential as any)[field] = status;
      } else if (section === 'emergency') {
        newConfig.sections.emergency.status = status;
      } else if (section === 'requiredDocs') {
        const foundCustom = newConfig.sections.requiredDocs.custom.find((c: any) => c.id === field);
        if (foundCustom) {
          foundCustom.status = status;
        } else {
          (newConfig.sections.requiredDocs as any)[field] = status;
        }
      }
      return newConfig;
    });
  };

  const handleToggleSharedDoc = (field: string) => {
    setConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      const foundCustom = newConfig.sections.sharedDocs.custom.find((c: any) => c.id === field);
      if (foundCustom) {
        foundCustom.active = !foundCustom.active;
      } else {
        (newConfig.sections.sharedDocs as any)[field] = !(newConfig.sections.sharedDocs as any)[
          field
        ];
      }
      return newConfig;
    });
  };

  const addCustomSharedDoc = () => {
    if (!newSharedDoc.trim()) return;
    setConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      newConfig.sections.sharedDocs.custom.push({
        id: Math.random().toString(36).substring(2, 9),
        label: newSharedDoc,
        active: true,
      });
      return newConfig;
    });
    setNewSharedDoc('');
    addToast('Documento Adicionado', 'Tipo de documento personalizado criado.', 'success');
  };

  const removeCustomSharedDoc = (id: string) => {
    setConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      newConfig.sections.sharedDocs.custom = newConfig.sections.sharedDocs.custom.filter(
        (c: any) => c.id !== id
      );
      return newConfig;
    });
  };

  const addCustomRequiredDoc = () => {
    if (!newRequiredDoc.label.trim()) return;
    setConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      newConfig.sections.requiredDocs.custom.push({
        id: Math.random().toString(36).substring(2, 9),
        label: newRequiredDoc.label,
        description: newRequiredDoc.description,
        status: 'required',
      });
      return newConfig;
    });
    setNewRequiredDoc({ label: '', description: '' });
    addToast('Documento Adicionado', 'Pendente de envio pelo inquilino.', 'success');
  };

  const removeCustomRequiredDoc = (id: string) => {
    setConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      newConfig.sections.requiredDocs.custom = newConfig.sections.requiredDocs.custom.filter(
        (c: any) => c.id !== id
      );
      return newConfig;
    });
  };

  const handleSave = async () => {
    if (!config) return;
    await tenantConfigService.saveConfig(config);
    queryClient.invalidateQueries({ queryKey: ['tenant-config', propertyId] });
    addToast(
      'Salvo com Sucesso',
      'Configurações aplicadas para os inquilinos deste imóvel.',
      'success'
    );
  };

  const applyTemplate = (templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey];
    setConfig({
      propertyId,
      sections: JSON.parse(JSON.stringify(template.config.sections)),
    });
    setIsTemplateMenuOpen(false);
    addToast('Template Aplicado', `Configuração "${template.label}" aplicada.`, 'success');
  };

  if (!config) {
    return (
      <div className='flex items-center justify-center py-20 text-slate-400 text-sm font-bold'>
        Carregando configurações...
      </div>
    );
  }

  const currentTemplate =
    Object.values(TEMPLATES).find(
      (t) => JSON.stringify(t.config.sections) === JSON.stringify(config.sections)
    ) || TEMPLATES.default;

  return (
    <div className='space-y-8 animate-fadeIn pb-10'>
      {/* Template Selector (Premium Custom Dropdown) */}
      <div className='bg-white/5 rounded-2xl border border-white/10 p-6'>
        <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1'>
          Template de Configuração
        </label>

        <div className='relative'>
          <button
            onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
            className={`w-full flex items-center justify-between px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all hover:bg-white/10 active:scale-[0.99] group ${isTemplateMenuOpen ? 'border-primary ring-2 ring-primary/20' : 'border-white/10'}`}
          >
            <span className='flex items-center gap-2'>
              <RefreshCw
                size={14}
                strokeWidth={1.8}
                className={`text-primary transition-all duration-500 ${isTemplateMenuOpen ? 'rotate-180' : 'opacity-0 group-hover:opacity-100'}`}
              />
              {currentTemplate.label}
            </span>
            <ChevronDown
              size={18}
              strokeWidth={1.8}
              className={`text-slate-400 transition-transform duration-300 ${isTemplateMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isTemplateMenuOpen && (
            <>
              <div className='fixed inset-0 z-40' onClick={() => setIsTemplateMenuOpen(false)} />
              <div className='absolute top-full left-0 right-0 mt-2 z-50 lg-card overflow-hidden animate-scaleUp origin-top'>
                <div className='p-2 space-y-1'>
                  {Object.entries(TEMPLATES).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key as any)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between hover:bg-white/5 group ${currentTemplate.label === t.label ? 'text-primary bg-white/10' : 'text-slate-400 hover:text-primary'}`}
                    >
                      {t.label}
                      {currentTemplate.label === t.label && (
                        <div className='w-1.5 h-1.5 bg-primary rounded-full animate-pulse' />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Personal Info */}
      <section className='space-y-4'>
        <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
          <User size={14} strokeWidth={1.8} className='text-blue-500' /> Informações Pessoais
        </h3>
        <div className='bg-white/5 rounded-2xl border border-white/10 overflow-hidden'>
          <div className='p-4 border-b border-white/10 flex items-center justify-between opacity-50'>
            <span className='text-sm font-bold text-slate-300'>
              Nome Completo
            </span>
            <span className='text-[10px] font-black text-primary uppercase tracking-widest'>
              Obrigatório (Fixo)
            </span>
          </div>
          <div className='p-4 border-b border-white/10 flex items-center justify-between opacity-50'>
            <span className='text-sm font-bold text-slate-300'>CPF</span>
            <span className='text-[10px] font-black text-primary uppercase tracking-widest'>
              Obrigatório (Fixo)
            </span>
          </div>
          <div className='p-4 border-b border-white/10 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-300'>Profissão</span>
            <StatusSelector
              section='personal'
              field='occupation'
              currentStatus={config.sections.personal.occupation}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </section>

      {/* Residential Info */}
      <section className='space-y-4'>
        <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
          <Car size={14} strokeWidth={1.8} className='text-emerald-500' /> Dados Residenciais
        </h3>
        <div className='bg-white/5 rounded-2xl border border-white/10 overflow-hidden'>
          <div className='p-4 border-b border-white/10 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-300'>
              Veículo (Placa)
            </span>
            <StatusSelector
              section='residential'
              field='vehicle'
              currentStatus={config.sections.residential.vehicle}
              onStatusChange={handleStatusChange}
            />
          </div>
          <div className='p-4 border-b border-white/10 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-300'>Pets</span>
            <StatusSelector
              section='residential'
              field='pets'
              currentStatus={config.sections.residential.pets}
              onStatusChange={handleStatusChange}
            />
          </div>
          <div className='p-4 border-b border-white/10 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-300'>Moradores</span>
            <StatusSelector
              section='residential'
              field='residents'
              currentStatus={config.sections.residential.residents}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className='space-y-4'>
        <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
          <Activity size={14} strokeWidth={1.8} className='text-red-500' /> Contato de Emergência
        </h3>
        <div className='bg-white/5 rounded-2xl border border-white/10 p-4 flex items-center justify-between'>
          <span className='text-sm font-bold text-slate-300'>
            Seção de Emergência
          </span>
          <StatusSelector
            section='emergency'
            field='status'
            currentStatus={config.sections.emergency.status}
            onStatusChange={handleStatusChange}
          />
        </div>
      </section>

      {/* Required Documents */}
      <section className='space-y-4'>
        <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
          <FileText size={14} strokeWidth={1.8} className='text-indigo-500' /> Documentos Exigidos do Inquilino
        </h3>
        <div className='bg-white/5 rounded-2xl border border-white/10 overflow-hidden'>
          <div className='p-4 border-b border-white/10 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-300'>RG ou CNH</span>
            <StatusSelector
              section='requiredDocs'
              field='id_card'
              currentStatus={config.sections.requiredDocs.id_card}
              onStatusChange={handleStatusChange}
            />
          </div>
          <div className='p-4 border-b border-white/10 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-300'>
              Comprovante de Renda
            </span>
            <StatusSelector
              section='requiredDocs'
              field='income'
              currentStatus={config.sections.requiredDocs.income}
              onStatusChange={handleStatusChange}
            />
          </div>
          <div className='p-4 border-b border-white/10 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-300'>
              Comp. de Residência
            </span>
            <StatusSelector
              section='requiredDocs'
              field='residence'
              currentStatus={config.sections.requiredDocs.residence}
              onStatusChange={handleStatusChange}
            />
          </div>
          <div className='p-4 border-b border-white/10 flex items-center justify-between'>
            <span className='text-sm font-bold text-slate-300'>
              Apólice / Garantia
            </span>
            <StatusSelector
              section='requiredDocs'
              field='guarantee'
              currentStatus={config.sections.requiredDocs.guarantee}
              onStatusChange={handleStatusChange}
            />
          </div>
          {config.sections.requiredDocs.custom.map((custom) => (
            <div
              key={custom.id}
              className='p-4 border-b border-white/10 flex items-center justify-between group'
            >
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => removeCustomRequiredDoc(custom.id)}
                  className='text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all'
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                </button>
                <div className='flex flex-col'>
                  <span className='text-sm font-bold text-slate-300'>
                    {custom.label}
                  </span>
                  <span className='text-[10px] text-slate-400 font-medium'>
                    {custom.description}
                  </span>
                </div>
              </div>
              <StatusSelector
                section='requiredDocs'
                field={custom.id}
                currentStatus={custom.status}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
          {/* Add Custom Required Doc */}
          <div className='p-4 bg-white/5 space-y-3 border-t border-white/10'>
            <div className='flex gap-3'>
              <input
                type='text'
                placeholder='Título do novo documento (ex: Declaração de IR)'
                className='flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary text-white placeholder-slate-500'
                value={newRequiredDoc.label}
                onChange={(e) => setNewRequiredDoc({ ...newRequiredDoc, label: e.target.value })}
              />
              <button
                onClick={addCustomRequiredDoc}
                className='px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-br from-[#2f6bff] to-[#3fa9ff] hover:brightness-110 active:scale-95 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2'
              >
                <Plus size={16} strokeWidth={1.8} /> Adicionar
              </button>
            </div>
            <input
              type='text'
              placeholder='Descrição breve (opcional)'
              className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary text-white placeholder-slate-500'
              value={newRequiredDoc.description}
              onChange={(e) =>
                setNewRequiredDoc({ ...newRequiredDoc, description: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      {/* Shared Documents */}
      <section className='space-y-4'>
        <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
          <Key size={14} strokeWidth={1.8} className='text-primary' /> Documentos Compartilhados (Proprietário)
        </h3>
        <div className='bg-white/5 rounded-2xl border border-white/10 overflow-hidden'>
          {[
            { id: 'contract', label: 'Contrato de Locação' },
            { id: 'inspection', label: 'Laudo de Vistoria' },
            { id: 'rules', label: 'Regimento Interno' },
          ].map((doc) => (
            <div
              key={doc.id}
              className='p-4 border-b border-white/10 flex items-center justify-between'
            >
              <span className='text-sm font-bold text-slate-300'>
                {doc.label}
              </span>
              <button
                onClick={() => handleToggleSharedDoc(doc.id as any)}
                className={`p-1 rounded-full transition-colors ${config.sections.sharedDocs[doc.id as keyof typeof config.sections.sharedDocs] ? 'text-primary' : 'text-slate-300'}`}
              >
                {config.sections.sharedDocs[doc.id as keyof typeof config.sections.sharedDocs] ? (
                  <ToggleRight size={32} strokeWidth={1.8} />
                ) : (
                  <ToggleLeft size={32} strokeWidth={1.8} />
                )}
              </button>
            </div>
          ))}
          {config.sections.sharedDocs.custom.map((custom) => (
            <div
              key={custom.id}
              className='p-4 border-b border-white/10 flex items-center justify-between group'
            >
              <div className='flex items-center gap-3'>
                <button
                onClick={() => removeCustomSharedDoc(custom.id)}
                className='text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all'
              >
                <Trash2 size={16} strokeWidth={1.8} />
                </button>
                <span className='text-sm font-bold text-slate-300'>
                  {custom.label}
                </span>
              </div>
              <button
                onClick={() => handleToggleSharedDoc(custom.id)}
                className={`p-1 rounded-full transition-colors ${custom.active ? 'text-primary' : 'text-slate-300'}`}
              >
                {custom.active ? <ToggleRight size={32} strokeWidth={1.8} /> : <ToggleLeft size={32} strokeWidth={1.8} />}
              </button>
            </div>
          ))}
          {/* Add Custom Shared Doc */}
          <div className='p-4 bg-white/5 flex gap-3 border-t border-white/10'>
            <input
              type='text'
              placeholder='Nome do documento personalizado'
              className='flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary text-white placeholder-slate-500'
              value={newSharedDoc}
              onChange={(e) => setNewSharedDoc(e.target.value)}
            />
            <button
              onClick={addCustomSharedDoc}
              className='px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-br from-[#2f6bff] to-[#3fa9ff] hover:brightness-110 active:scale-95 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2'
            >
              <Plus size={16} strokeWidth={1.8} /> Adicionar
            </button>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className='w-full h-14 rounded-full text-white font-semibold bg-gradient-to-br from-[#2f6bff] to-[#3fa9ff] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest'
      >
        <Save size={20} strokeWidth={1.8} /> Salvar Configurações
      </button>
      {/* Toaster is rendered globally in App.tsx */}
    </div>
  );
};
