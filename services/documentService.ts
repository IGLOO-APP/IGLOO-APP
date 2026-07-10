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
  preview_url?: string;
}

export const documentService = {
  /**
   * Generates or retrieves a cached preview URL for a document using ApyHub.
   */
  async getDocumentPreview(
    documentUrl: string,
    documentId: string,
    page: number = 1
  ): Promise<string | null> {
    try {
      // 1. Check if we already have a preview_url cached for this document (implementation depends on your DB schema)
      // For now, we'll implement the ApyHub call logic.

      const APYHUB_TOKEN = import.meta.env.VITE_APYHUB_TOKEN; // Assuming it's in env
      if (!APYHUB_TOKEN) {
        console.warn('[documentService] APYHUB_TOKEN not found');
        return null;
      }

      // 2. Call ApyHub Preview API
      // Note: In a real production scenario, this should be proxied through your own backend
      // to keep the token secure. Here we implement the logic described in the prompt.

      const response = await fetch(
        `https://api.apyhub.com/generate/preview/file?output=${documentId}-preview&width=600&auto_orientation=true&page=${page}`,
        {
          method: 'POST',
          headers: {
            'apy-token': APYHUB_TOKEN,
            'Content-Type': 'application/json', // Assuming ApyHub can take a URL or we need to send the file
          },
          body: JSON.stringify({ url: documentUrl }),
        }
      );

      if (!response.ok) {
        throw new Error(`ApyHub error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || null; // Return the generated preview URL
    } catch (error) {
      console.error('[documentService] Error generating preview:', error);
      return null;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getByTenant(tenantId: string): Promise<any[]> {
    // Robust query: search by UUID or Email

    // Use the correct PostgREST syntax for OR with string values
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, onboarding_documents_urls, created_at')
      .or(`id.eq.${tenantId},email.eq.${tenantId}`)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safeProfile = profileError ? null : (data as any);
    if (profileError || !safeProfile) {
      console.error('[documentService] Error fetching profile for docs:', profileError);
    }

    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('property_id, pdf_url')
      .or(`tenant_id.eq.${tenantId}${safeProfile?.id ? `,tenant_id.eq.${safeProfile.id}` : ''}`)
      .maybeSingle();

    if (contractError) {
      console.error('[documentService] Error fetching contract for docs:', contractError);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docs: any[] = [];
    if (contract?.pdf_url) {
      docs.push({
        id: 'contract-pdf',
        name: 'Contrato de Locação',
        type: 'PDF',
        url: contract.pdf_url,
        date: 'Vigente',
        category: 'Jurídico',
        status: 'Validado',
      });
    }

    if (safeProfile && safeProfile.onboarding_documents_urls) {
      const urls = safeProfile.onboarding_documents_urls as Record<string, string>;
      const uploadDate = safeProfile.created_at
        ? new Date(safeProfile.created_at).toLocaleDateString('pt-BR')
        : 'N/A';

      // Funções auxiliares para extrair ID e limpar URL do Supabase Storage
      const extractIdFromUrl = (url: string) => {
        if (!url) return 'doc';
        // Tenta pegar o nome do arquivo da URL (ex: 1163880_6ec48.jpg)
        const parts = url.split('/');
        const filename = parts[parts.length - 1].split('?')[0];
        return filename.split('.')[0] || 'doc';
      };

      const getCleanUrl = (url: string) => {
        if (!url) return '';
        // Se for uma URL do Google Viewer, extrai a URL real do documento
        if (url.includes('docs.google.com/viewer')) {
          const urlParams = new URLSearchParams(new URL(url).search);
          const extractedUrl = urlParams.get('url');
          if (extractedUrl) return decodeURIComponent(extractedUrl);
        }
        return url;
      };

      if (urls.rg_url) {
        const cleanUrl = getCleanUrl(urls.rg_url);
        const ext = urls.rg_name ? urls.rg_name.split('.').pop()?.toUpperCase() : 'JPG';
        docs.push({
          id: extractIdFromUrl(cleanUrl),
          name: `Identidade (RG/CNH): ${urls.rg_name || 'rg.jpg'}`,
          type: ext || 'JPG',
          url: cleanUrl,
          date: uploadDate,
          category: 'Jurídico',
          status: 'Validado',
        });
      }
      if (urls.income_url) {
        const cleanUrl = getCleanUrl(urls.income_url);
        const ext = urls.income_name ? urls.income_name.split('.').pop()?.toUpperCase() : 'PNG';
        docs.push({
          id: extractIdFromUrl(cleanUrl),
          name: `Comprovante de Renda: ${urls.income_name || 'renda.png'}`,
          type: ext || 'PNG',
          url: cleanUrl,
          date: uploadDate,
          category: 'Financeiro',
          status: 'Validado',
        });
      }
      if (urls.residence_url) {
        const cleanUrl = getCleanUrl(urls.residence_url);
        const ext = urls.residence_name
          ? urls.residence_name.split('.').pop()?.toUpperCase()
          : 'PDF';
        docs.push({
          id: extractIdFromUrl(cleanUrl),
          name: `Comprovante de Residência: ${urls.residence_name || 'residencia.pdf'}`,
          type: ext || 'PDF',
          url: cleanUrl,
          date: uploadDate,
          category: 'Financeiro',
          status: 'Validado',
        });
      }
      if (urls.guarantee_url) {
        const cleanUrl = getCleanUrl(urls.guarantee_url);
        const ext = urls.guarantee_name
          ? urls.guarantee_name.split('.').pop()?.toUpperCase()
          : 'PDF';
        docs.push({
          id: extractIdFromUrl(cleanUrl),
          name: `Garantia Locatícia: ${urls.guarantee_name || 'garantia.pdf'}`,
          type: ext || 'PDF',
          url: cleanUrl,
          date: uploadDate,
          category: 'Financeiro',
          status: 'Validado',
        });
      }
    }

    const propertyId = contract?.property_id || safeProfile?.property_id;
    if (propertyId) {
      const propertyDocs = await this.getByProperty(propertyId);
      // Avoid duplicates if onboarding docs were already added to property_documents
      const filteredPropertyDocs = propertyDocs.filter((pd) => !docs.some((d) => d.url === pd.url));
      docs.push(...filteredPropertyDocs);
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

    return data.map((doc) => ({
      id: doc.id,
      name: doc.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      category: doc.category as any,
      type: doc.type,
      size: doc.size || '0 KB',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: (doc.status as any) || 'Pendente',
      uploadDate: doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : 'N/A',
      url: doc.url || undefined,
    }));
  },

  async create(
    propertyId: string,
    docData: Partial<PropertyDocument>
  ): Promise<PropertyDocument | null> {
    const { data, error } = await supabase
      .from('property_documents')
      .insert({
        property_id: propertyId,
        name: docData.name,
        category: docData.category,
        type: docData.type,
        size: docData.size,
        status: docData.status || 'Pendente',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single();

    if (error) {
      console.error('[documentService] Error creating doc:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      category: data.category as any,
      type: data.type,
      size: data.size || '0 KB',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: data.status as any,
      uploadDate: data.created_at ? new Date(data.created_at).toLocaleDateString('pt-BR') : 'N/A',
      url: data.url || undefined,
    };
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('property_documents').delete().eq('id', id);
    if (error) {
      console.error('[documentService] Error deleting doc:', error);
      return false;
    }
    return true;
  },
};
