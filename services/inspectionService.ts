import { supabase } from '../lib/supabase';

export interface Inspection {
  id: string;
  property_id: string;
  type: 'IN' | 'OUT';
  status: string;
  date: string;
  rooms?: Room[];
}

export interface Room {
  id: string;
  name: string;
  items: InspectionItem[];
}

export interface InspectionItem {
  id: string;
  name: string;
  status: 'good' | 'damaged' | 'na';
  notes: string;
  entryPhoto?: string;
  exitPhoto?: string;
  tenantFeedback?: {
    status: 'pending' | 'agreed' | 'contested';
    comment?: string;
    timestamp?: string;
  };
  ownerResolution?: {
    status: 'pending' | 'accepted' | 'rejected';
  };
}

export const inspectionService = {
  async getByProperty(propertyId: string): Promise<Inspection[]> {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('property_id', propertyId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching inspections:', error);
      return [];
    }

    return (data || []).map((i: any) => ({
      id: i.id,
      property_id: i.property_id || '',
      type: i.type as 'IN' | 'OUT',
      status: i.status || 'pending',
      date: i.date || new Date().toISOString(),
    }));
  },

  async getDetails(inspectionId: string): Promise<Room[]> {
    const { data, error } = await supabase
      .from('inspection_items')
      .select('*')
      .eq('inspection_id', inspectionId)
      .order('room_name', { ascending: true });

    if (error) {
      console.error('Error fetching inspection items:', error);
      return [];
    }

    // Group items by room
    const roomsMap: Record<string, Room> = {};
    data.forEach(item => {
      if (!roomsMap[item.room_name]) {
        roomsMap[item.room_name] = {
          id: item.room_name.toLowerCase().replace(/\s+/g, '-'),
          name: item.room_name,
          items: []
        };
      }
      roomsMap[item.room_name].items.push({
        id: item.id,
        name: item.item_name,
        status: item.status as any,
        notes: item.notes || '',
        entryPhoto: item.entry_photo_url || undefined,
        exitPhoto: item.exit_photo_url || undefined,
        tenantFeedback: {
          status: item.tenant_feedback_status as any,
          comment: item.tenant_feedback_comment || undefined,
          timestamp: item.tenant_feedback_at ? new Date(item.tenant_feedback_at).toLocaleString('pt-BR') : undefined
        },
        ownerResolution: {
          status: item.owner_resolution_status as any
        }
      });
    });

    return Object.values(roomsMap);
  },

  async updateItemFeedback(itemId: string, feedback: { status: string; comment?: string }) {
    const { error } = await supabase
      .from('inspection_items')
      .update({
        tenant_feedback_status: feedback.status,
        tenant_feedback_comment: feedback.comment,
        tenant_feedback_at: new Date().toISOString()
      })
      .eq('id', itemId);

    return !error;
  },

  async updateItemResolution(itemId: string, status: string) {
    const { error } = await supabase
      .from('inspection_items')
      .update({
        owner_resolution_status: status
      })
      .eq('id', itemId);

    return !error;
  }
};
