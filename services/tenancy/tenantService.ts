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
        ),
        spouse:tenant_spouses(*),
        references:tenant_references(*),
        legal_representatives:tenant_legal_representatives(*)
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
      birth_date: tenantData.birthDate || tenantData.birth_date,
      marital_status: tenantData.maritalStatus || tenantData.marital_status,
      nationality: tenantData.nationality,
      rg_issuer: tenantData.rgIssuer || tenantData.rg_issuer,
      rg_uf: tenantData.rgUf || tenantData.rg_uf,
      cep: tenantData.cep,
      street: tenantData.street,
      street_number: tenantData.streetNumber || tenantData.street_number,
      complement: tenantData.complement,
      neighborhood: tenantData.neighborhood,
      city: tenantData.city,
      state: tenantData.state,
      residence_time: tenantData.residenceTime || tenantData.residence_time,
      phone_commercial: tenantData.phoneCommercial || tenantData.phone_commercial,
      other_income: tenantData.otherIncome
        ? parseFloat(String(tenantData.otherIncome).replace(/[^0-9,.]/g, '').replace(',', '.'))
        : null,
      adults_count: tenantData.adultsCount || tenantData.adults_count || 1,
      children_count: tenantData.childrenCount || tenantData.children_count || 0,
      currently_pays_rent: tenantData.currentlyPaysRent ?? tenantData.currently_pays_rent ?? false,
      current_rent_where: tenantData.currentRentWhere || tenantData.current_rent_where,
      tenant_type: tenantData.tenantType || tenantData.tenant_type || 'pf',
      company_legal_name: tenantData.companyLegalName || tenantData.company_legal_name,
      company_trade_name: tenantData.companyTradeName || tenantData.company_trade_name,
      company_state_registration: tenantData.companyStateRegistration || tenantData.company_state_registration,
      property_id: tenantData.propertyId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    if (error) {
      handleServiceError(error, 'Erro ao cadastrar inquilino');
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateProfile(id: string, data: any): Promise<void> {
    const { error } = await supabase.from('profiles').update(data).eq('id', id);

    if (error) {
      handleServiceError(error, 'Erro ao atualizar perfil do inquilino');
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
      birth_date: tenantData.birthDate || tenantData.birth_date,
      marital_status: tenantData.maritalStatus || tenantData.marital_status,
      tenant_type: tenantData.tenantType || tenantData.tenant_type || 'pf',
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
