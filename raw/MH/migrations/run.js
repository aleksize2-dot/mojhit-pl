require('dotenv').config({ path: require('path').resolve(__dirname, 'server', '.env') });
const { createClient } = require('./server/node_modules/@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://urzodvosleauddnfxqio.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set in server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const sql = `
    ALTER TABLE producers 
    ADD COLUMN IF NOT EXISTS weirdness_constraint FLOAT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS style_weight FLOAT DEFAULT NULL
  `;
  
  console.log('Running migration...');
  
  // Try using raw SQL via REST API
  const { data, error } = await supabase.from('producers').select('id').limit(1);
  console.log('Connection test:', error ? 'FAILED: ' + error.message : 'OK');
  
  // Run via management API
  const response = await fetch('https://api.supabase.com/v1/projects/urzodvosleauddnfxqio/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  const result = await response.json();
  console.log('Status:', response.status);
  console.log('Result:', JSON.stringify(result, null, 2));
}

main().catch(e => console.error(e));
