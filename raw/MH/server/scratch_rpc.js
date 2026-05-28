const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function tryRpc(rpcName) {
  const sql = `SELECT 1;`;
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${rpcName}`, {
    method: 'POST',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: sql, sql: sql })
  });
  console.log(`RPC ${rpcName}: status ${response.status}`);
  if (response.ok) {
    console.log(`Success with RPC: ${rpcName}`);
    return true;
  }
  return false;
}

async function run() {
  const rpcs = ['execute_sql', 'exec_sql', 'run_sql', 'pg_execute', 'sql', 'query', 'db_execute'];
  for (const rpc of rpcs) {
    if (await tryRpc(rpc)) {
      break;
    }
  }
}

run();
