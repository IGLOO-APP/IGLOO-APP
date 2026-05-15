import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'e:/IGLOO/IGLOO-APP/.env.local' });

console.log('URL:', process.env.VITE_SUPABASE_URL);
console.log('KEY:', process.env.VITE_SUPABASE_ANON_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkProperties() {
  const { data: properties, error: pError } = await supabase.from('properties').select('*');
  if (pError) {
    console.error('Error fetching properties:', pError);
    return;
  }

  const { data: profiles, error: prError } = await supabase.from('profiles').select('*');
  if (prError) {
    console.error('Error fetching profiles:', prError);
    return;
  }

  console.log('\n--- PROFILES ---');
  profiles.forEach(p => console.log(`${p.id} | ${p.name} | ${p.email}`));

  console.log('\n--- PROPERTIES ---');
  properties.forEach(p => console.log(`${p.id} | ${p.name} | OwnerID: ${p.owner_id}`));
}

checkProperties();
