import { supabase } from '../lib/supabase';

export const maintenanceService = {
  async getByTenant(tenantId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[maintenanceService] Error fetching maintenance requests:', error);
      return [];
    }

    return data;
  },

  async create(requestData: {
    property_id: string;
    tenant_id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    images?: string[];
  }): Promise<any> {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert({
        ...requestData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('maintenance_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  async getMessages(requestId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('maintenance_messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[maintenanceService] Error fetching maintenance messages:', error);
      return [];
    }

    return data;
  },

  async sendMessage(
    requestId: string,
    senderId: string,
    role: string,
    content: string,
    type: 'text' | 'image' | 'system' | 'file' = 'text',
    url?: string
  ): Promise<any> {
    const { data, error } = await supabase
      .from('maintenance_messages')
      .insert({
        request_id: requestId,
        sender_id: senderId,
        sender_role: role,
        content,
        type,
        url,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
