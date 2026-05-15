import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'e:/IGLOO/IGLOO-APP/.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkProperties() {
  const { data: properties, error: pError } = await supabase.from('properties').select('*');
  if (pError) {
    console.error('Error fetching properties:', pError);
    return;
  }

  console.log('\n--- PROPERTIES ---');
  properties.forEach(p => console.log(`${p.id} | ${p.name} | OwnerID: ${p.owner_id}`));
}

checkProperties();
