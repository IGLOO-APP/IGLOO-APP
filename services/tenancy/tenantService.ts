import { supabase } from '../../lib/supabase';
import { Tenant } from '../../types';
import { mapTenant } from '../../utils/mappingUtils';
import { maintenanceService } from '../maintenance/maintenanceService';
import { paymentService } from '../finance/paymentService';
import { documentService } from '../documentService';
import { handleServiceError } from '../../lib/utils';

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        `
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
      `
      )
      .eq('role', 'tenant');

    if (error) {
      handleServiceError(error, 'Erro ao buscar inquilinos');
    }

    return data.map(mapTenant);
  },

  async getById(id: string): Promise<Tenant | null> {
    const { data: t, error } = await supabase
      .from('profiles')
      .select(
        `
        *,
        contracts:contracts!contracts_tenant_id_fkey(
          *,
          property:properties(*)
        )
      `
      )
      .or(`id.eq.${id},email.eq.${id}`)
      .maybeSingle();

    if (error) {
      handleServiceError(error, 'Erro ao buscar detalhes do inquilino');
    }

    if (!t) return null;

    return mapTenant(t);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(tenantData: any): Promise<void> {
    const { error } = await supabase.from('profiles').insert({
      id: crypto.randomUUID(),
      email: tenantData.email,
      name: tenantData.name,
      role: 'tenant',
      phone: tenantData.phone,
      cpf: tenantData.cpf,
      rg: tenantData.rg,
      company_name: tenantData.companyName || tenantData.company_name,
      company_cnpj: tenantData.companyCnpj || tenantData.company_cnpj,
      company_address: tenantData.companyAddress || tenantData.company_address,
      occupation: tenantData.occupation || tenantData.profession,
      monthly_income: tenantData.monthlyIncome
        ? parseFloat(
            String(tenantData.monthlyIncome)
              .replace(/[^0-9,.]/g, '')
              .replace(',', '.')
          )
        : null,
      admission_date: tenantData.admissionDate || tenantData.admission_date,
      property_id: tenantData.propertyId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    if (error) {
      handleServiceError(error, 'Erro ao cadastrar inquilino');
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async invite(tenantData: any): Promise<void> {
    const { error } = await supabase.from('profiles').insert({
      id: crypto.randomUUID(),
      email: tenantData.email,
      name: tenantData.name,
      role: 'tenant',
      phone: tenantData.phone,
      cpf: tenantData.cpf,
      rg: tenantData.rg,
      company_name: tenantData.companyName || tenantData.company_name,
      company_cnpj: tenantData.companyCnpj || tenantData.company_cnpj,
      company_address: tenantData.companyAddress || tenantData.company_address,
      occupation: tenantData.occupation || tenantData.profession,
      monthly_income: tenantData.monthlyIncome
        ? parseFloat(
            String(tenantData.monthlyIncome)
              .replace(/[^0-9,.]/g, '')
              .replace(',', '.')
          )
        : null,
      admission_date: tenantData.admissionDate || tenantData.admission_date,
      property_id: tenantData.propertyId,
      is_pending: true,
      created_at: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    if (error) {
      handleServiceError(error, 'Erro ao enviar convite');
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('profiles').delete().eq('id', id);

    if (error) {
      handleServiceError(error, 'Erro ao excluir inquilino');
    }
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
  getMaintenanceCategories: maintenanceService.getCategories,
  addMaintenanceCategory: maintenanceService.addCategory,
  deleteMaintenanceCategory: maintenanceService.deleteCategory,
};
