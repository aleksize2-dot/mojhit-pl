const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  // Get all tables
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name, table_type')
    .eq('table_schema', 'public')
    .order('table_name');

  if (error) {
    console.log('Error querying tables:', error.message);
    // Try raw SQL via postgREST
    const { data, error: e2 } = await supabase.rpc('exec_sql', {
      query: "SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    });
    if (e2) {
      console.log('RPC also failed:', e2.message);
      // Last resort - list tables via /rest/v1/
      console.log('Trying direct table list...');
      const { data: d3, error: e3 } = await supabase.from('_tables').select('*').limit(1);
      console.log('_tables error:', e3?.message);
    } else {
      console.log('Tables via RPC:', JSON.stringify(data, null, 2));
    }
    return;
  }

  console.log('Tables found:');
  tables.forEach(t => console.log(`  - ${t.table_name} (${t.table_type})`));
}

main().catch(console.error);
