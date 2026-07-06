import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'e:/IGLOO/IGLOO-APP/.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
// Check if service role key is available, fallback to anon key
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

console.log('Using Key (first 10 chars):', supabaseKey.substring(0, 10));

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  try {
    const { data, error } = await supabase.storage.createBucket('tenant-documents', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });

    if (error) {
      console.error('Error creating bucket:', error);
    } else {
      console.log('Bucket created successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createBucket();
