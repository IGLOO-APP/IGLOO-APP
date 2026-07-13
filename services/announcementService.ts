import { supabase } from '../lib/supabase';
import { OwnerAnnouncement, AnnouncementTargetType, AnnouncementType } from '../types';

async function resolveTenantIds(
  targetType: AnnouncementTargetType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  targetValue: any
): Promise<string[]> {
  if (targetType === 'all') {
    const { data: contracts } = await supabase
      .from('contracts')
      .select('tenant_id')
      .eq('status', 'active');
    return [
      ...new Set(
        (contracts || []).map((c: { tenant_id: string | null }) => c.tenant_id).filter(Boolean)
      ),
    ] as string[];
  }

  if (targetType === 'individual') {
    return (targetValue?.ids || []) as string[];
  }

  if (targetType === 'property') {
    const propertyIds = (targetValue?.ids || []) as string[];
    if (!propertyIds.length) return [];
    const { data: contracts } = await supabase
      .from('contracts')
      .select('tenant_id')
      .in('property_id', propertyIds)
      .eq('status', 'active');
    return [
      ...new Set(
        (contracts || []).map((c: { tenant_id: string | null }) => c.tenant_id).filter(Boolean)
      ),
    ] as string[];
  }

  if (targetType === 'condominium') {
    const condoName = targetValue?.name;
    if (!condoName) return [];
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('condominium', condoName);
    const propertyIds = (properties || []).map((p: { id: string }) => p.id);
    if (!propertyIds.length) return [];
    const { data: contracts } = await supabase
      .from('contracts')
      .select('tenant_id')
      .in('property_id', propertyIds)
      .eq('status', 'active');
    return [
      ...new Set(
        (contracts || [])
          .filter(Boolean)
          .map((c: { tenant_id: string | null }) => c.tenant_id)
          .filter(Boolean)
      ),
    ] as string[];
  }

  return [];
}

export const announcementService = {
  async create(data: {
    owner_id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    target_type: AnnouncementTargetType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target_value: any;
    expires_at?: string;
    is_urgent?: boolean;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (supabase as any)
      .from('owner_announcements')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    const announcement = result as OwnerAnnouncement;

    // Broadcast announcement to targeted tenants' conversations
    void this.broadcastToConversations(announcement);

    return announcement;
  },

  async broadcastToConversations(announcement: OwnerAnnouncement) {
    try {
      const tenantIds = await resolveTenantIds(announcement.target_type, announcement.target_value);
      if (!tenantIds.length) return;

      const text = `📢 ${announcement.title}\n\n${announcement.content}`;

      for (const tenantId of tenantIds) {
        if (!tenantId) continue;

        // Find or create a general conversation with this tenant
        const { data: existing } = await supabase
          .from('conversations')
          .select('id')
          .eq('owner_id', announcement.owner_id)
          .eq('tenant_id', tenantId)
          .eq('category', 'general')
          .maybeSingle();

        let convId = existing?.id;

        if (!convId) {
          const { data: created } = await supabase
            .from('conversations')
            .insert({
              owner_id: announcement.owner_id,
              tenant_id: tenantId,
              category: 'general',
              last_message: text,
              last_message_at: new Date().toISOString(),
            })
            .select('id')
            .single();
          convId = created?.id;
        } else {
          void supabase
            .from('conversations')
            .update({
              last_message: text,
              last_message_at: new Date().toISOString(),
            })
            .eq('id', convId);
        }

        if (convId) {
          await supabase.from('conversation_messages').insert({
            conversation_id: convId,
            sender_id: null,
            sender_role: 'system',
            content: text,
            type: 'announcement',
          });
        }
      }
    } catch (err) {
      console.error('Failed to broadcast announcement to conversations:', err);
    }
  },

  async getForTenant(tenantUserId: string, propertyId?: string, condoName?: string) {
    const now = new Date().toISOString();

    // Fetch all announcements from the database first, then filter in memory for complex JSONB logic
    // or use advanced PostgREST filters. For simplicity and reliability with JSONB target_value,
    // we'll filter the results.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: announcements, error: annError } = await (supabase as any)
      .from('owner_announcements')
      .select('*, announcement_acknowledgments(user_id)')
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .order('created_at', { ascending: false });

    if (annError) throw annError;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = ((announcements || []) as any[]).filter((ann) => {
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

    return filtered.map((ann) => ({
      ...ann,
      acknowledged: ann.announcement_acknowledgments?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ack: any) => ack.user_id === tenantUserId
      ),
    })) as OwnerAnnouncement[];
  },

  async acknowledge(announcementId: string, userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('announcement_acknowledgments').upsert({
      announcement_id: announcementId,
      user_id: userId,
    });

    if (error) throw error;
    return true;
  },

  async getTemplates() {
    return [
      // ── Manutenção ──
      {
        title: 'Manutenção Preventiva',
        content:
          'Prezados inquilinos, informamos que realizaremos uma manutenção preventiva no [LOCAL] no dia [DATA] das [HORA] às [HORA]. Agradecemos a compreensão.',
        type: 'maintenance',
      },
      {
        title: 'Manutenção do Elevador',
        content:
          'O elevador estará temporariamente desligado no dia [DATA] das [HORA] às [HORA] para manutenção programada. Utilize as escadas durante este período.',
        type: 'maintenance',
      },
      {
        title: 'Troca de Lâmpadas',
        content:
          'Realizaremos a troca das lâmpadas das áreas comuns no dia [DATA] às [HORA]. Pode haver pequenas interrupções na iluminação dos corredores.',
        type: 'maintenance',
      },
      {
        title: 'Pintura da Fachada',
        content:
          'A pintura externa do prédio terá início no dia [DATA]. As unidades próximas ao andaime receberão aviso individual com os detalhes.',
        type: 'maintenance',
      },
      {
        title: "Limpeza da Caixa D'Água",
        content:
          "Informamos que a limpeza da caixa d'água será realizada no dia [DATA] das [HORA] às [HORA]. O fornecimento será temporariamente suspenso.",
        type: 'maintenance',
      },
      {
        title: 'Reparo no Interfone',
        content:
          'Técnicos estarão no prédio no dia [DATA] para reparo no sistema de interfone. Caso não esteja em casa, autorizamos a entrada mediante identificação.',
        type: 'maintenance',
      },
      {
        title: 'Fechamento de Área de Lazer',
        content:
          'A área de lazer estará fechada no dia [DATA] para manutenção geral. Pedimos desculpas pelo transtorno.',
        type: 'maintenance',
      },

      // ── Alerta ──
      {
        title: 'Corte de Água Programado',
        content:
          'Haverá uma interrupção no fornecimento de água para manutenção da rede no dia [DATA], com previsão de retorno às [HORA].',
        type: 'warning',
      },
      {
        title: 'Aviso de Obras',
        content:
          'Informamos que iniciaremos obras de melhoria no [LOCAL] a partir do dia [DATA], com previsão de término às [HORA]. Haverá ruídos temporários.',
        type: 'warning',
      },
      {
        title: 'Cuidado com Golpes',
        content:
          'Alertamos que não enviamos boletos por WhatsApp ou email. Desconsidere cobranças suspeitas e denuncie à administração.',
        type: 'warning',
      },
      {
        title: 'Alerta de Tempestade',
        content:
          'A previsão do tempo indica ventos fortes para o dia [DATA]. Recomendamos recolher objetos de varandas e janelas.',
        type: 'warning',
      },
      {
        title: 'Uso Indevido de Vagas',
        content:
          'Lembramos que as vagas de garagem são de uso exclusivo das unidades. Veículos estacionados em vagas alheias serão removidos.',
        type: 'warning',
      },
      {
        title: 'Horário de Silêncio',
        content:
          'O horário de silêncio é das 22h às 7h. Denúncias de perturbação serão encaminhadas à autoridade competente.',
        type: 'warning',
      },
      {
        title: 'Furto na Região',
        content:
          'Registramos ocorrências de furto na vizinhança. Reforçamos a importância de manter portas e portões trancados.',
        type: 'warning',
      },

      // ── Informativo ──
      {
        title: 'Dedetização das Áreas Comuns',
        content:
          'Informamos que as áreas comuns passarão por dedetização no dia [DATA]. Recomendamos não circular com pets nas áreas externas durante este período.',
        type: 'info',
      },
      {
        title: 'Vistoria Periódica',
        content:
          'Comunicamos que a vistoria periódica do imóvel será realizada no dia [DATA] às [HORA]. Pedimos que agende um horário conosco.',
        type: 'info',
      },
      {
        title: 'Alteração no Regimento Interno',
        content:
          'Comunicamos a todos que o [ASSUNTO] foi atualizado. Confira as novas regras no quadro de avisos.',
        type: 'info',
      },
      {
        title: 'Novo Horário da Portaria',
        content:
          'Informamos que o horário da portaria será estendido a partir do dia [DATA], funcionando das [HORA] às [HORA].',
        type: 'info',
      },
      {
        title: 'Campanha de Vacinação',
        content:
          'No dia [DATA] das [HORA] às [HORA] ocorrerá campanha de vacinação para pets no [LOCAL]. Traga a carteirinha do seu pet.',
        type: 'info',
      },
      {
        title: 'Coleta de Lixo - Alteração',
        content:
          'O calendário de coleta de lixo será alterado a partir de [DATA]. Confira os novos dias e horários no mural.',
        type: 'info',
      },
      {
        title: 'Dicas de Economia',
        content:
          'Compartilhamos dicas para reduzir o consumo de água e energia neste mês. Pequenas mudanças fazem diferença na conta do condomínio. [ASSUNTO]',
        type: 'info',
      },
      {
        title: 'Novo Sistema de Segurança',
        content:
          'Instalamos câmeras com reconhecimento de placas na entrada do condomínio. O sistema entra em operação no dia [DATA].',
        type: 'info',
      },

      // ── Evento ──
      {
        title: 'Reunião de Condomínio',
        content:
          'Convidamos todos para a reunião extraordinária que ocorrerá no dia [DATA] às [HORA], no salão de festas. Pauta: [ASSUNTO].',
        type: 'event',
      },
      {
        title: 'Festa de Confraternização',
        content:
          'Teremos nossa festa de confraternização no dia [DATA] às [HORA] no [LOCAL]. Confirme presença até o dia [DATA].',
        type: 'event',
      },
      {
        title: 'Mutirão de Limpeza',
        content:
          'Participe do mutirão de limpeza do condomínio no dia [DATA] às [HORA]. Vamos cuidar juntos do nosso espaço!',
        type: 'event',
      },
      {
        title: 'Feira de Adoção de Pets',
        content:
          'No dia [DATA] das [HORA] às [HORA] teremos feira de adoção no [LOCAL]. Venha conhecer os animaizinhos.',
        type: 'event',
      },
      {
        title: 'Workshop de Jardinagem',
        content:
          'Aprenda técnicas básicas de jardinagem no workshop do dia [DATA] às [HORA], no jardim do condomínio. Vagas limitadas.',
        type: 'event',
      },
      {
        title: 'Café da Manhã Comunitário',
        content:
          'No domingo, dia [DATA] às [HORA], teremos café da manhã comunitário no salão de festas. Traga seu prato favorito!',
        type: 'event',
      },
    ];
  },

  async getForOwner(ownerId: string) {
    const now = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('owner_announcements')
      .select(
        `
        *,
        acknowledgments:announcement_acknowledgments(count)
      `
      )
      .eq('owner_id', ownerId)
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((ann: any) => ({
      ...ann,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      views_count: (ann as any).acknowledgments?.[0]?.count || 0,
    })) as OwnerAnnouncement[];
  },

  async getAllForOwner(ownerId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('owner_announcements')
      .select(
        `
        *,
        acknowledgments:announcement_acknowledgments(count)
      `
      )
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((ann: any) => ({
      ...ann,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      views_count: (ann as any).acknowledgments?.[0]?.count || 0,
    })) as OwnerAnnouncement[];
  },

  async getAcknowledgments(announcementId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('announcement_acknowledgments')
      .select(
        `
        created_at,
        profiles (
          name,
          email,
          avatar_url
        )
      `
      )
      .eq('announcement_id', announcementId);

    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data as any[];
  },

  async delete(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('owner_announcements').delete().eq('id', id);

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
  },
};
