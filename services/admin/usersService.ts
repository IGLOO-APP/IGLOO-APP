import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { auditService } from './auditService';

export const usersService = {
  async getUsers(
    page = 1,
    limit = 10,
    search = '',
    status?: string,
    plan?: string,
    role?: string,
    period?: string
  ) {
    let query = supabase.from('profiles').select('*', { count: 'exact' });

    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

    if (status && status !== 'Todos') {
      if (status === 'Suspenso') query = query.eq('is_suspended', true);
      else if (status === 'Ativo') query = query.eq('is_suspended', false);
      else if (status === 'Inativo')
        query = query.eq('is_suspended', false).is('last_login_at', null);
    }

    if (plan && plan !== 'Todos') query = query.eq('plan', plan);

    if (role && role !== 'Todos') {
      const roleMap: Record<string, string> = {
        Proprietário: 'owner',
        Inquilino: 'tenant',
        Administrador: 'admin',
        Pendente: 'pending',
      };
      query = query.eq('role', roleMap[role] || role.toLowerCase());
    }

    if (period && period !== 'Todos') {
      const now = new Date();
      const startDate = new Date();
      if (period === 'Hoje') startDate.setHours(0, 0, 0, 0);
      else if (period === 'Últimos 7 dias') startDate.setDate(now.getDate() - 7);
      else if (period === 'Último mês') startDate.setMonth(now.getMonth() - 1);
      else if (period === 'Último ano') startDate.setFullYear(now.getFullYear() - 1);
      query = query.gte('created_at', startDate.toISOString());
    }

    const from = (page - 1) * limit;
    const { data, error, count } = await query
      .range(from, from + limit - 1)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const users = data as User[];
    const userIds = users.map((u) => u.id);

    const { data: propData } = await supabase
      .from('properties')
      .select('owner_id')
      .in('owner_id', userIds);
    const { data: contractData } = await supabase
      .from('contracts')
      .select('owner_id, tenant_id')
      .in('owner_id', userIds);

    const usersWithMetrics = users.map((user) => {
      const userProps = propData?.filter((p) => p.owner_id === user.id) || [];
      const userContracts = contractData?.filter((c) => c.owner_id === user.id) || [];
      const uniqueTenants = new Set(userContracts.map((c) => c.tenant_id).filter(Boolean));
      return {
        ...user,
        metrics: {
          properties: userProps.length,
          tenants: uniqueTenants.size,
          contracts: userContracts.length,
        },
      };
    });

    return { users: usersWithMetrics, total: count };
  },

  async getRecentUsers(limit = 5) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'owner')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as User[];
  },

  async updateUserPlan(userId: string, plan: string) {
    const { error } = await supabase.from('profiles').update({ plan }).eq('id', userId);
    if (error) throw error;
    await auditService.logActivity('update_plan', 'user', userId, { plan });
  },

  async updateUserRole(userId: string, role: string) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
    await auditService.logActivity('update_role', 'user', userId, { role });
  },

  async updateAdminType(userId: string, adminType: string) {
    const { error } = await supabase.from('profiles').update({ admin_type: adminType }).eq('id', userId);
    if (error) throw error;
    await auditService.logActivity('update_admin_type', 'user', userId, { admin_type: adminType });
  },

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatar_url?: string }) {
    const { error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  },

  async exportUserData(userId: string) {
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (pError) throw pError;
    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', userId);
    const { data: contracts } = await supabase.from('contracts').select('*').eq('owner_id', userId);
    const { data: payments } = await supabase
      .from('payments')
      .select('*, contracts!inner(owner_id)')
      .eq('contracts.owner_id', userId);
    await auditService.logActivity('export_data', 'user', userId);
    return {
      profile,
      metrics: {
        total_properties: properties?.length || 0,
        total_contracts: contracts?.length || 0,
      },
      properties: properties || [],
      contracts: contracts || [],
      payments: payments || [],
      exported_at: new Date().toISOString(),
    };
  },

  async suspendUser(userId: string, reason: string, notes: string, notifyUser: boolean) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_suspended: true,
        suspended_reason: reason,
        suspended_at: new Date().toISOString(),
      })
      .eq('id', userId);
    if (profileError) throw profileError;
    await auditService.logActivity('suspend_user', 'user', userId, { reason, notes, notifyUser });
    if (notifyUser)
      console.warn(`[usersService] Email notification not implemented for user ${userId}`);
  },

  async unsuspendUser(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_suspended: false, suspended_reason: null, suspended_at: null })
      .eq('id', userId);
    if (error) throw error;
    await auditService.logActivity('unsuspend_user', 'user', userId);
  },

  async getUserStats(userId: string) {
    try {
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId);
      const { data: ownerProperties } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', userId);
      const propertyIds = ownerProperties?.map((p) => p.id) || [];
      let contractsCount = 0,
        tenantsCount = 0;
      if (propertyIds.length > 0) {
        const { count: cCount } = await supabase
          .from('contracts')
          .select('*', { count: 'exact', head: true })
          .in('property_id', propertyIds);
        contractsCount = cCount || 0;
        const { count: tCount } = await supabase
          .from('contracts')
          .select('tenant_id', { count: 'exact', head: true })
          .in('property_id', propertyIds)
          .not('tenant_id', 'is', null);
        tenantsCount = tCount || 0;
      }
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      return {
        metrics: {
          properties: propertiesCount || 0,
          tenants: tenantsCount || 0,
          contracts: contractsCount || 0,
        },
        payments:
          payments?.map((p) => ({
            month: new Date(p.created_at).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            }),
            val: `R$ ${p.amount}`,
            status: p.status === 'paid' ? 'Pago' : 'Pendente',
          })) || [],
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { metrics: { properties: 0, tenants: 0, contracts: 0 }, payments: [] };
    }
  },
};
