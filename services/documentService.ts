import { supabase } from '../lib/supabase';

export interface PropertyDocument {
  id: string;
  name: string;
  category: 'Jurídico' | 'Financeiro' | 'Técnico' | 'Outros';
  type: string;
  size: string;
  status: 'Validado' | 'Pendente';
  uploadDate: string;
  url?: string;
}

export const documentService = {
  async getByTenant(tenantId: string): Promise<any[]> {
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('property_id, pdf_url')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .maybeSingle();

    if (contractError) {
      console.error('[documentService] Error fetching contract for docs:', contractError);
    }

    const docs: any[] = [];
    if (contract?.pdf_url) {
      docs.push({ 
        id: 'contract-pdf',
        name: 'Contrato de Locação', 
        type: 'PDF', 
        url: contract.pdf_url, 
        date: 'Vigente',
        category: 'Jurídico',
        status: 'Validado'
      });
    }

    const propertyId = contract?.property_id;
    if (propertyId) {
      const propertyDocs = await this.getByProperty(propertyId);
      docs.push(...propertyDocs);
    }

    return docs;
  },

  async getByProperty(propertyId: string): Promise<PropertyDocument[]> {
    const { data, error } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[documentService] Error fetching property docs:', error);
      return [];
    }

    return data.map(doc => ({
      id: doc.id,
      name: doc.name,
      category: doc.category as any,
      type: doc.type,
      size: doc.size || '0 KB',
      status: (doc.status as any) || 'Pendente',
      uploadDate: doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : 'N/A',
      url: doc.url
    }));
  },

  async create(propertyId: string, docData: Partial<PropertyDocument>): Promise<PropertyDocument | null> {
    const { data, error } = await supabase
      .from('property_documents')
      .insert({
        property_id: propertyId,
        name: docData.name,
        category: docData.category,
        type: docData.type,
        size: docData.size,
        status: docData.status || 'Pendente',
      })
      .select()
      .single();

    if (error) {
      console.error('[documentService] Error creating doc:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      category: data.category as any,
      type: data.type,
      size: data.size || '0 KB',
      status: data.status as any,
      uploadDate: data.created_at ? new Date(data.created_at).toLocaleDateString('pt-BR') : 'N/A',
      url: data.url || undefined
    };
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('property_documents').delete().eq('id', id);
    if (error) {
      console.error('[documentService] Error deleting doc:', error);
      return false;
    }
    return true;
  }
};
