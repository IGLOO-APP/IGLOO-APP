import { TenantProfileConfig, RequirementStatus } from '../types';

const CONFIG_STORAGE_KEY = 'igloo_tenant_profile_configs';

export const DEFAULT_CONFIG: Omit<TenantProfileConfig, 'propertyId'> = {
  sections: {
    personal: {
      occupation: 'required',
    },
    residential: {
      vehicle: 'required',
      pets: 'required',
      residents: 'required',
    },
    emergency: {
      status: 'required',
    },
    sharedDocs: {
      contract: true,
      inspection: true,
      rules: true,
      custom: [],
    },
    requiredDocs: {
      id_card: 'required',
      income: 'required',
      residence: 'required',
      guarantee: 'required',
      custom: [],
    },
  },
};

export const TEMPLATES = {
  default: { label: 'Configuração Padrão', config: DEFAULT_CONFIG },
  simple: {
    label: 'Aluguel Simples',
    config: {
      ...DEFAULT_CONFIG,
      sections: {
        ...DEFAULT_CONFIG.sections,
        personal: { occupation: 'hidden' as RequirementStatus },
        residential: { ...DEFAULT_CONFIG.sections.residential, vehicle: 'hidden' as RequirementStatus },
        requiredDocs: { ...DEFAULT_CONFIG.sections.requiredDocs, guarantee: 'hidden' as RequirementStatus },
      }
    }
  },
  no_garage: {
    label: 'Imóvel Sem Garagem',
    config: {
      ...DEFAULT_CONFIG,
      sections: {
        ...DEFAULT_CONFIG.sections,
        residential: { ...DEFAULT_CONFIG.sections.residential, vehicle: 'hidden' as RequirementStatus }
      }
    }
  },
  no_pets: {
    label: 'Sem Animais',
    config: {
      ...DEFAULT_CONFIG,
      sections: {
        ...DEFAULT_CONFIG.sections,
        residential: { ...DEFAULT_CONFIG.sections.residential, pets: 'hidden' as RequirementStatus }
      }
    }
  }
};

export const tenantConfigService = {
  getConfigs(): TenantProfileConfig[] {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error parsing tenant configs:', e);
      return [];
    }
  },

  getConfigForProperty(propertyId: string): TenantProfileConfig {
    const configs = this.getConfigs();
    const propertyConfig = configs.find(c => c.propertyId === propertyId);
    if (propertyConfig) return propertyConfig;

    const globalConfig = configs.find(c => c.propertyId === 'global');
    return {
      propertyId,
      sections: globalConfig ? globalConfig.sections : DEFAULT_CONFIG.sections
    };
  },

  saveConfig(config: TenantProfileConfig) {
    const configs = this.getConfigs();
    const index = configs.findIndex(c => c.propertyId === config.propertyId);
    
    if (index !== -1) {
      configs[index] = config;
    } else {
      configs.push(config);
    }
    
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
  }
};
