import { supabase } from '../lib/supabase';

export interface Inspection {
  id: string;
  property_id: string;
  type: 'entrada' | 'saída' | 'periódica';
  status: 'rascunho' | 'pendente_assinatura' | 'concluída';
  inspector_name: string;
  inspection_date: string;
  visibility: 'admin' | 'tenant';
  created_at: string;
  rooms?: Room[];
  signatures?: InspectionSignature[];
}

export interface Room {
  id: string;
  inspection_id: string;
  room_name: string;
  condition: 'bom' | 'regular' | 'danificado';
  notes: string;
  photos: string[];
  videos: string[];
}

export interface InspectionSignature {
  id: string;
  inspection_id: string;
  signer_type: 'owner' | 'tenant';
  signed_at: string;
  signature_data: string;
}

// Helper: supabase client typed as any to allow custom tables not in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((i: any) => ({
      id: i.id,
      property_id: i.property_id || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: i.type as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: i.status as any,
      inspector_name: i.inspector_name || '',
      inspection_date: i.inspection_date || i.date || new Date().toISOString(),
      visibility: i.visibility || 'admin',
      created_at: i.created_at || new Date().toISOString(),
    }));
  },

  async getDetails(inspectionId: string): Promise<Room[]> {
    const { data, error } = await db
      .from('inspection_rooms')
      .select('*')
      .eq('inspection_id', inspectionId)
      .order('room_name', { ascending: true });

    if (error) {
      console.error('Error fetching inspection rooms:', error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((r: any) => ({
      id: r.id,
      inspection_id: r.inspection_id,
      room_name: r.room_name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      condition: r.condition as any,
      notes: r.notes || '',
      photos: r.photos || [],
      videos: r.videos || [],
    }));
  },

  async getSignatures(inspectionId: string): Promise<InspectionSignature[]> {
    const { data, error } = await db
      .from('inspection_signatures')
      .select('*')
      .eq('inspection_id', inspectionId);

    if (error) {
      console.error('Error fetching inspection signatures:', error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((s: any) => ({
      id: s.id,
      inspection_id: s.inspection_id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signer_type: s.signer_type as any,
      signed_at: s.signed_at,
      signature_data: s.signature_data,
    }));
  },

  async createInspection(
    inspection: Omit<Inspection, 'id' | 'created_at' | 'status'> & { status?: string },
    rooms: Omit<Room, 'id' | 'inspection_id'>[]
  ): Promise<Inspection | null> {
    // 1. Insert inspection
    const { data: insData, error: insError } = await supabase
      .from('inspections')
      .insert({
        property_id: inspection.property_id,
        type: inspection.type,
        status: inspection.status || 'rascunho',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single();

    if (insError || !insData) {
      console.error('Error creating inspection:', insError);
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = insData as any;
    const newInspectionId: string = row.id;

    // 2. Insert rooms
    if (rooms.length > 0) {
      const roomsToInsert = rooms.map((room) => ({
        inspection_id: newInspectionId,
        room_name: room.room_name,
        condition: room.condition,
        notes: room.notes,
        photos: room.photos,
        videos: room.videos,
      }));

      const { error: roomsError } = await db.from('inspection_rooms').insert(roomsToInsert);

      if (roomsError) {
        console.error('Error creating inspection rooms:', roomsError);
      }
    }

    return {
      id: row.id,
      property_id: row.property_id || inspection.property_id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: row.type as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: row.status as any,
      inspector_name: inspection.inspector_name,
      inspection_date: inspection.inspection_date,
      visibility: inspection.visibility,
      created_at: row.created_at || new Date().toISOString(),
    };
  },

  async addSignature(
    inspectionId: string,
    signerType: 'owner' | 'tenant',
    signatureData: string,
    nextStatus?: 'pendente_assinatura' | 'concluída'
  ): Promise<boolean> {
    // 1. Insert signature
    const { error: sigError } = await db.from('inspection_signatures').insert({
      inspection_id: inspectionId,
      signer_type: signerType,
      signature_data: signatureData,
    });

    if (sigError) {
      console.error('Error adding signature:', sigError);
      return false;
    }

    // 2. Update status if provided
    if (nextStatus) {
      const { error: statusError } = await supabase
        .from('inspections')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ status: nextStatus } as any)
        .eq('id', inspectionId);

      if (statusError) {
        console.error('Error updating inspection status:', statusError);
      }
    }

    return true;
  },

  async deleteInspection(inspectionId: string): Promise<boolean> {
    const { error } = await supabase.from('inspections').delete().eq('id', inspectionId);

    return !error;
  },
};
