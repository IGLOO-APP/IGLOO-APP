import { supabase } from './e:/IGLOO/IGLOO-APP/src/lib/supabase';

async function checkSchema() {
    console.log('Checking maintenance_requests...');
    const { data: m, error: me } = await supabase.from('maintenance_requests').select('*, properties(name)').limit(1);
    if (me) console.error('Maintenance error:', me.message);
    else console.log('Maintenance success');

    console.log('Checking payments...');
    const { data: p, error: pe } = await supabase.from('payments').select('*, contracts(properties(name))').limit(1);
    if (pe) console.error('Payments error:', pe.message);
    else console.log('Payments success');

    console.log('Checking financial_transactions...');
    const { data: f, error: fe } = await supabase.from('financial_transactions').select('*').order('date', { ascending: true }).limit(1);
    if (fe) console.error('Financial error:', fe.message);
    else console.log('Financial success');
}

checkSchema();
