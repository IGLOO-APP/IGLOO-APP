import { supabase } from '../lib/supabase';
import { FAQ } from '../types';

export const faqService = {
  async getFAQs(): Promise<FAQ[]> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(this.mapFAQ);
    } catch (e) {
      console.error('Error fetching FAQs:', e);
      return [];
    }
  },

  mapFAQ(f: any): FAQ {
    return {
      id: f.id,
      question: f.question,
      answer: f.answer,
      order: f.order || 0,
      is_active: f.is_active ?? true,
      created_at: f.created_at
    };
  },

  async getActiveFAQs(): Promise<FAQ[]> {
    const { data } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });
    return (data || []).map(this.mapFAQ);
  },

  async addFAQ(faq: Omit<FAQ, 'id' | 'created_at'>): Promise<FAQ> {
    const { data, error } = await supabase
      .from('faqs')
      .insert(faq)
      .select()
      .single();
    
    if (error) throw error;
    return faqService.mapFAQ(data);
  },

  async updateFAQ(id: string, updates: Partial<FAQ>): Promise<FAQ> {
    const { data, error } = await supabase
      .from('faqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return faqService.mapFAQ(data);
  },

  async deleteFAQ(id: string) {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async reorderFAQs(orderedIds: string[]) {
    for (let i = 0; i < orderedIds.length; i++) {
      await supabase
        .from('faqs')
        .update({ order: i + 1 })
        .eq('id', orderedIds[i]);
    }
  }
};
