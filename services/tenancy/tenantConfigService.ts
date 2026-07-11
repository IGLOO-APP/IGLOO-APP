import { TenantProfileConfig, RequirementStatus } from '../../types';
import { supabase } from '../../lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => supabase as any;

const isMissingTable = (err: unknown) =>
  typeof err === 'object' &&
  err !== null &&
  'code' in err &&
  (err as { code: string }).code === 'PGRST205';

export type { TenantProfileConfig };

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
        residential: {
          ...DEFAULT_CONFIG.sections.residential,
          vehicle: 'hidden' as RequirementStatus,
        },
        requiredDocs: {
          ...DEFAULT_CONFIG.sections.requiredDocs,
          guarantee: 'hidden' as RequirementStatus,
        },
      },
    },
  },
  no_garage: {
    label: 'Imóvel Sem Garagem',
    config: {
      ...DEFAULT_CONFIG,
      sections: {
        ...DEFAULT_CONFIG.sections,
        residential: {
          ...DEFAULT_CONFIG.sections.residential,
          vehicle: 'hidden' as RequirementStatus,
        },
      },
    },
  },
  no_pets: {
    label: 'Sem Animais',
    config: {
      ...DEFAULT_CONFIG,
      sections: {
        ...DEFAULT_CONFIG.sections,
        residential: {
          ...DEFAULT_CONFIG.sections.residential,
          pets: 'hidden' as RequirementStatus,
        },
      },
    },
  },
};

function dbRowToConfig(row: Record<string, unknown>): TenantProfileConfig {
  return {
    propertyId: (row.property_id as string) || 'global',
    sections: (row.sections as TenantProfileConfig['sections']) || DEFAULT_CONFIG.sections,
  };
}

export const tenantConfigService = {
  async getConfigs(): Promise<TenantProfileConfig[]> {
    try {
      const { data, error } = await db().from('tenant_profile_configs').select('*');
      if (error) throw error;
      return (data || []).map(dbRowToConfig);
    } catch (err) {
      if (!isMissingTable(err)) console.error('[tenantConfigService] Error fetching configs:', err);
      return [];
    }
  },

  async getConfigForProperty(propertyId: string): Promise<TenantProfileConfig> {
    try {
      const { data, error } = await db()
        .from('tenant_profile_configs')
        .select('*')
        .or(`property_id.eq.${propertyId},property_id.is.null,is_global.eq.true`)
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const propertyConfig = data.find(
          (r: Record<string, unknown>) => r.property_id === propertyId
        );
        if (propertyConfig)
          return dbRowToConfig(propertyConfig as unknown as Record<string, unknown>);

        const globalConfig = data.find((r: Record<string, unknown>) => r.is_global);
        if (globalConfig) return dbRowToConfig(globalConfig as unknown as Record<string, unknown>);
      }

      return { propertyId, sections: DEFAULT_CONFIG.sections };
    } catch (err) {
      if (!isMissingTable(err)) console.error('[tenantConfigService] Error fetching config:', err);
      return { propertyId, sections: DEFAULT_CONFIG.sections };
    }
  },

  async saveConfig(config: TenantProfileConfig) {
    try {
      const sections = config.sections;
      const existing = await db()
        .from('tenant_profile_configs')
        .select('id')
        .eq('property_id', config.propertyId === 'global' ? null : config.propertyId)
        .maybeSingle();

      if (existing.data) {
        const { error } = await db()
          .from('tenant_profile_configs')
          .update({ sections })
          .eq('id', existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await db()
          .from('tenant_profile_configs')
          .insert({
            property_id: config.propertyId === 'global' ? null : config.propertyId,
            is_global: config.propertyId === 'global',
            sections,
          });
        if (error) throw error;
      }
    } catch (err) {
      if (!isMissingTable(err)) {
        console.error('[tenantConfigService] Error saving config:', err);
        throw err;
      }
    }
  },
};
