import { supabase } from '../lib/supabase';
import { Tenant } from '../types';
import { mapTenant } from '../utils/mappingUtils';
import { maintenanceService } from './maintenanceService';
import { paymentService } from './paymentService';
import { documentService } from './documentService';

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        contracts:contracts!contracts_tenant_id_fkey(
          id,
          status,
          monthly_value,
          payment_day,
          start_date,
          end_date,
          property:properties(id, name)
        )
      `)
      .eq('role', 'tenant');

    if (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }

    return data.map(mapTenant);
  },

  async getById(id: string): Promise<Tenant | null> {
    const { data: t, error } = await supabase
      .from('profiles')
      .select(`
        *,
        contracts:contracts!contracts_tenant_id_fkey(
          *,
          property:properties(*)
        )
      `)
      .or(`id.eq.${id},email.eq.${id}`)
      .maybeSingle();

    if (error) {
      console.error('[tenantService] Error fetching tenant profile:', error);
      return null;
    }

    if (!t) return null;

    return mapTenant(t);
  },

  async create(tenantData: any): Promise<void> {
    const { error } = await supabase.from('profiles').insert({
      id: crypto.randomUUID(),
      email: tenantData.email,
      name: tenantData.name,
      role: 'tenant',
      phone: tenantData.phone,
      cpf: tenantData.cpf,
      property_id: tenantData.propertyId,
    } as any);

    if (error) throw error;
  },

  async invite(tenantData: any): Promise<void> {
    const { error } = await supabase.from('profiles').insert({
      id: crypto.randomUUID(),
      email: tenantData.email,
      name: tenantData.name,
      role: 'tenant',
      phone: tenantData.phone,
      cpf: tenantData.cpf,
      property_id: tenantData.propertyId,
      is_pending: true,
      created_at: new Date().toISOString(),
    } as any);

    if (error) throw error;
    console.log(`[IGLOO] Convite enviado para ${tenantData.email}`);
  },

  // Delegate to specialized services for backward compatibility if needed, 
  // or components can be updated to call the new services directly.
  getPayments: paymentService.getByContract,
  getDocuments: documentService.getByTenant,
  getMaintenanceRequests: maintenanceService.getByTenant,
  createMaintenanceRequest: maintenanceService.create,
  updateMaintenanceRequest: maintenanceService.update,
  getMaintenanceMessages: maintenanceService.getMessages,
  sendMaintenanceMessage: maintenanceService.sendMessage,
};
