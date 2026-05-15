import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'e:/IGLOO/IGLOO-APP/.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function listTables() {
  const { data, error } = await supabase
    .from('pg_catalog.pg_tables')
    .select('tablename')
    .eq('schemaname', 'public');
  
  if (error) {
    console.log('Error listing tables via pg_catalog:', error.message);
    // Try another way if possible, but usually ANON key can't access pg_catalog
    return;
  }
  
  console.log('Tables:', data);
}

listTables();
