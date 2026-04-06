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
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { RequirementStatus, TenantProfileConfig } from '../../types';
import { tenantConfigService, TEMPLATES } from '../../services/tenantConfigService';
import { ToastContainer, ToastMessage } from '../ui/Toast';

interface TenantProfileConfigPanelProps {
  propertyId: string;
}

export const TenantProfileConfigPanel: React.FC<TenantProfileConfigPanelProps> = ({ propertyId }) => {
  const [config, setConfig] = useState<TenantProfileConfig>(
    tenantConfigService.getConfigForProperty(propertyId)
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  
  const [newSharedDoc, setNewSharedDoc] = useState('');
  const [newRequiredDoc, setNewRequiredDoc] = useState({ label: '', description: '' });

  const addToast = (title: string, message: string, type: ToastMessage['type']) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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
    setConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      const foundCustom = newConfig.sections.sharedDocs.custom.find((c: any) => c.id === field);
      if (foundCustom) {
        foundCustom.active = !foundCustom.active;
      } else {
        (newConfig.sections.sharedDocs as any)[field] = !(newConfig.sections.sharedDocs as any)[field];
      }
      return newConfig;
    });
  };

  const addCustomSharedDoc = () => {
    if (!newSharedDoc.trim()) return;
    setConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      newConfig.sections.sharedDocs.custom.push({
        id: Math.random().toString(36).substring(2, 9),
        label: newSharedDoc,
        active: true
      });
      return newConfig;
    });
    setNewSharedDoc('');
    addToast('Documento Adicionado', 'Tipo de documento personalizado criado.', 'success');
  };

  const removeCustomSharedDoc = (id: string) => {
    setConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      newConfig.sections.sharedDocs.custom = newConfig.sections.sharedDocs.custom.filter((c: any) => c.id !== id);
      return newConfig;
    });
  };

  const addCustomRequiredDoc = () => {
    if (!newRequiredDoc.label.trim()) return;
    setConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      newConfig.sections.requiredDocs.custom.push({
        id: Math.random().toString(36).substring(2, 9),
        label: newRequiredDoc.label,
        description: newRequiredDoc.description,
        status: 'required'
      });
      return newConfig;
    });
    setNewRequiredDoc({ label: '', description: '' });
    addToast('Documento Adicionado', 'Pendente de envio pelo inquilino.', 'success');
  };

  const removeCustomRequiredDoc = (id: string) => {
    setConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      newConfig.sections.requiredDocs.custom = newConfig.sections.requiredDocs.custom.filter((c: any) => c.id !== id);
      return newConfig;
    });
  };

  const handleSave = () => {
    tenantConfigService.saveConfig(config);
    addToast('Salvo com Sucesso', 'Configurações aplicadas para os inquilinos deste imóvel.', 'success');
  };

  const applyTemplate = (templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey];
    setConfig({
      propertyId,
      sections: JSON.parse(JSON.stringify(template.config.sections))
    });
    setIsTemplateMenuOpen(false);
    addToast('Template Aplicado', `Configuração "${template.label}" aplicada.`, 'success');
  };

  const currentTemplate = Object.values(TEMPLATES).find(t => 
    JSON.stringify(t.config.sections) === JSON.stringify(config.sections)
  ) || TEMPLATES.default;

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
      {/* Template Selector (Premium Custom Dropdown) */}
      <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
        <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1'>
          Template de Configuração
        </label>
        
        <div className='relative'>
          <button
            onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
            className={`w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 dark:bg-black/20 border rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-white/5 active:scale-[0.99] group ${isTemplateMenuOpen ? 'border-primary ring-2 ring-primary/10' : 'border-slate-100 dark:border-white/5'}`}
          >
            <span className='flex items-center gap-2'>
              <RefreshCw size={14} className={`text-primary transition-all duration-500 ${isTemplateMenuOpen ? 'rotate-180' : 'opacity-0 group-hover:opacity-100'}`} />
              {currentTemplate.label}
            </span>
            <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isTemplateMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isTemplateMenuOpen && (
            <>
              <div 
                className='fixed inset-0 z-40' 
                onClick={() => setIsTemplateMenuOpen(false)} 
              />
              <div className='absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp origin-top backdrop-blur-xl'>
                <div className='p-2 space-y-1'>
                  {Object.entries(TEMPLATES).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key as any)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between hover:bg-primary/5 group ${currentTemplate.label === t.label ? 'text-primary bg-primary/5' : 'text-slate-600 dark:text-slate-300 hover:text-primary'}`}
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
          {config.sections.requiredDocs.custom.map((custom) => (
            <div key={custom.id} className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between group'>
              <div className='flex items-center gap-3'>
                <button 
                  onClick={() => removeCustomRequiredDoc(custom.id)}
                  className='text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all'
                >
                  <Trash2 size={16} />
                </button>
                <div className='flex flex-col'>
                  <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>{custom.label}</span>
                  <span className='text-[10px] text-slate-400 font-medium'>{custom.description}</span>
                </div>
              </div>
              <StatusSelector section="requiredDocs" field={custom.id} currentStatus={custom.status} />
            </div>
          ))}
          {/* Add Custom Required Doc */}
          <div className='p-4 bg-slate-50 dark:bg-white/5 space-y-3'>
            <div className='flex gap-3'>
              <input 
                type="text"
                placeholder="Título do novo documento (ex: Declaração de IR)"
                className="flex-1 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={newRequiredDoc.label}
                onChange={(e) => setNewRequiredDoc({...newRequiredDoc, label: e.target.value})}
              />
              <button 
                onClick={addCustomRequiredDoc}
                className='px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-dark transition-all'
              >
                <Plus size={16} /> Adicionar
              </button>
            </div>
            <input 
              type="text"
              placeholder="Descrição breve (opcional)"
              className="w-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              value={newRequiredDoc.description}
              onChange={(e) => setNewRequiredDoc({...newRequiredDoc, description: e.target.value})}
            />
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
          {config.sections.sharedDocs.custom.map((custom) => (
            <div key={custom.id} className='p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between group'>
              <div className='flex items-center gap-3'>
                <button 
                  onClick={() => removeCustomSharedDoc(custom.id)}
                  className='text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all'
                >
                  <Trash2 size={16} />
                </button>
                <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>{custom.label}</span>
              </div>
              <button 
                onClick={() => handleToggleSharedDoc(custom.id)}
                className={`p-1 rounded-full transition-colors ${custom.active ? 'text-primary' : 'text-slate-300'}`}
              >
                {custom.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>
          ))}
          {/* Add Custom Shared Doc */}
          <div className='p-4 bg-slate-50 dark:bg-white/5 flex gap-3'>
            <input 
              type="text"
              placeholder="Nome do documento personalizado"
              className="flex-1 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              value={newSharedDoc}
              onChange={(e) => setNewSharedDoc(e.target.value)}
            />
            <button 
              onClick={addCustomSharedDoc}
              className='px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-dark transition-all'
            >
              <Plus size={16} /> Adicionar
            </button>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className='w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2'
      >
        <Save size={20} /> Salvar Configurações
      </button>
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
