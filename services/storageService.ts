import { supabase } from '../lib/supabase';

export const storageService = {
  async uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error(`[storageService] Error uploading file to ${bucket}:`, error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (err) {
      console.error('[storageService] Unexpected error:', err);
      return null;
    }
  },

  async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error(`[storageService] Error deleting file from ${bucket}:`, error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[storageService] Unexpected error:', err);
      return false;
    }
  }
};
