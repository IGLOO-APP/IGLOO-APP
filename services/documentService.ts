import { supabase } from '../lib/supabase';

export interface PropertyDocument {
  id: string;
  name: string;
  category: 'Jurídico' | 'Financeiro' | 'Técnico' | 'Outros';
  size: string;
  uploadDate: string;
  type: string;
  status: 'Validado' | 'Pendente' | 'Expirado';
  url?: string;
}

export const documentService = {
  async getByProperty(propertyId: string): Promise<PropertyDocument[]> {
    const { data, error } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return data.map(doc => ({
      id: doc.id,
      name: doc.name,
      category: doc.category as any,
      size: doc.size || '0 KB',
      uploadDate: new Date(doc.created_at || Date.now()).toLocaleDateString('pt-BR'),
      type: doc.type,
      status: doc.status as any,
      url: doc.url || undefined
    }));
  },

  async create(propertyId: string, docData: Omit<PropertyDocument, 'id' | 'uploadDate'>): Promise<PropertyDocument | null> {
    const { data, error } = await supabase
      .from('property_documents')
      .insert({
        property_id: propertyId,
        name: docData.name,
        category: docData.category,
        size: docData.size,
        type: docData.type,
        status: docData.status,
        url: docData.url
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      category: data.category as any,
      size: data.size || '0 KB',
      uploadDate: new Date(data.created_at || Date.now()).toLocaleDateString('pt-BR'),
      type: data.type,
      status: data.status as any,
      url: data.url || undefined
    };
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('property_documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      return false;
    }

    return true;
  }
};
