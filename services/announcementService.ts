import { supabase } from '../lib/supabase';
import { OwnerAnnouncement, AnnouncementTargetType, AnnouncementType } from '../types';

export const announcementService = {
  async create(data: {
    owner_id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    target_type: AnnouncementTargetType;
    target_value: any;
    expires_at?: string;
    is_urgent?: boolean;
  }) {
    const { data: result, error } = await (supabase as any)
      .from('owner_announcements')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result as OwnerAnnouncement;
  },

  async getForTenant(tenantUserId: string, propertyId?: string, condoName?: string) {
    const now = new Date().toISOString();
    
    // Fetch all announcements from the database first, then filter in memory for complex JSONB logic 
    // or use advanced PostgREST filters. For simplicity and reliability with JSONB target_value, 
    // we'll filter the results.
    const { data: announcements, error: annError } = await (supabase as any)
      .from('owner_announcements')
      .select('*, announcement_acknowledgments(user_id)')
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .order('created_at', { ascending: false });

    if (annError) throw annError;

    const filtered = (announcements as any[]).filter(ann => {
      // 1. All target
      if (ann.target_type === 'all') return true;

      // 2. Individual target
      if (ann.target_type === 'individual' || ann.target_type === 'tenant') {
        const targetIds = ann.target_value?.ids || [];
        return targetIds.includes(tenantUserId);
      }

      // 3. Property target
      if (ann.target_type === 'property' && propertyId) {
        const targetIds = ann.target_value?.ids || [];
        return targetIds.includes(propertyId);
      }

      // 4. Condominium target
      if (ann.target_type === 'condominium' && condoName) {
        const targetCondo = ann.target_value?.name;
        return targetCondo === condoName;
      }

      return false;
    });

    return filtered.map(ann => ({
      ...ann,
      acknowledged: ann.announcement_acknowledgments?.some((ack: any) => ack.user_id === tenantUserId)
    })) as OwnerAnnouncement[];
  },

  async acknowledge(announcementId: string, userId: string) {
    const { error } = await (supabase as any)
      .from('announcement_acknowledgments')
      .upsert({
        announcement_id: announcementId,
        user_id: userId
      });

    if (error) throw error;
    return true;
  },

  async getTemplates() {
    return [
      {
        title: 'Manutenção Preventiva',
        content: 'Prezados inquilinos, informamos que realizaremos uma manutenção preventiva no [LOCAL] no dia [DATA] das [HORA] às [HORA]. Agradecemos a compreensão.',
        type: 'maintenance'
      },
      {
        title: 'Corte de Água Programado',
        content: 'Haverá uma interrupção no fornecimento de água para manutenção da rede no dia [DATA], com previsão de retorno às [HORA].',
        type: 'warning'
      },
      {
        title: 'Dedetização das Áreas Comuns',
        content: 'Informamos que as áreas comuns passarão por dedetização no dia [DATA]. Recomendamos evitar a circulação de pets nas áreas externas durante este período.',
        type: 'info'
      },
      {
        title: 'Reunião de Condomínio',
        content: 'Convidamos todos para a reunião extraordinária que ocorrerá no dia [DATA] às [HORA], no salão de festas. Pauta: [ASSUNTO].',
        type: 'event'
      }
    ];
  },

  async getForOwner(ownerId: string) {
    const now = new Date().toISOString();
    const { data, error } = await (supabase as any)
      .from('owner_announcements')
      .select(`
        *,
        acknowledgments:announcement_acknowledgments(count)
      `)
      .eq('owner_id', ownerId)
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((ann: any) => ({
      ...ann,
      views_count: (ann as any).acknowledgments?.[0]?.count || 0
    })) as OwnerAnnouncement[];
  },

  async getAllForOwner(ownerId: string) {
    const { data, error } = await (supabase as any)
      .from('owner_announcements')
      .select(`
        *,
        acknowledgments:announcement_acknowledgments(count)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((ann: any) => ({
      ...ann,
      views_count: (ann as any).acknowledgments?.[0]?.count || 0
    })) as OwnerAnnouncement[];
  },

  async getAcknowledgments(announcementId: string) {
    const { data, error } = await (supabase as any)
      .from('announcement_acknowledgments')
      .select(`
        created_at,
        profiles (
          name,
          email,
          avatar_url
        )
      `)
      .eq('announcement_id', announcementId);

    if (error) throw error;
    return data as any[];
  },

  async delete(id: string) {
    const { error } = await (supabase as any)
      .from('owner_announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getSystemAnnouncements() {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('system_announcements')
      .select('*')
      .eq('status', 'active')
      .or(`show_until.is.null,show_until.gte.${now}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
