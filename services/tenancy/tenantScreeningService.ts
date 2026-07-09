import { supabase } from '../../lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => supabase as any;

export interface TenantScreening {
  id?: string;
  tenant_id: string;
  property_id?: string;
  credit_checked: boolean;
  credit_score: number | null;
  credit_status: 'clean' | 'restricted' | null;
  references_verified: boolean;
  references_notes: string;
  employment_type: 'CLT' | 'Autônomo' | 'PJ';
  residence_recent: boolean;
  residence_match: boolean;
  manual_overrides: Record<string, boolean>;
}

const DEFAULT_SCREENING: Omit<TenantScreening, 'tenant_id' | 'property_id'> = {
  credit_checked: false,
  credit_score: null,
  credit_status: null,
  references_verified: false,
  references_notes: '',
  employment_type: 'CLT',
  residence_recent: false,
  residence_match: false,
  manual_overrides: {},
};

export const tenantScreeningService = {
  async getScreening(tenantId: string, propertyId?: string): Promise<TenantScreening> {
    try {
      let query = db().from('tenant_screenings').select('*').eq('tenant_id', tenantId);

      if (propertyId) query = query.eq('property_id', propertyId);
      else query = query.is('property_id', null);

      const { data, error } = await query.maybeSingle();

      if (error) throw error;

      if (data) {
        return data as TenantScreening;
      }

      return {
        tenant_id: tenantId,
        property_id: propertyId,
        ...DEFAULT_SCREENING,
      };
    } catch (err) {
      console.error('[tenantScreeningService] Error fetching screening:', err);
      return {
        tenant_id: tenantId,
        property_id: propertyId,
        ...DEFAULT_SCREENING,
      };
    }
  },

  async upsertScreening(
    screening: Partial<TenantScreening> & { tenant_id: string }
  ): Promise<void> {
    try {
      const existing = await db()
        .from('tenant_screenings')
        .select('id')
        .eq('tenant_id', screening.tenant_id)
        .maybeSingle();

      if (existing.data) {
        const { error } = await db()
          .from('tenant_screenings')
          .update(screening)
          .eq('id', existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await db().from('tenant_screenings').insert(screening);
        if (error) throw error;
      }
    } catch (err) {
      console.error('[tenantScreeningService] Error saving screening:', err);
      throw err;
    }
  },
};
