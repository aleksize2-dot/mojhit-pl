const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const sql = `
    ALTER TABLE tracks ADD COLUMN IF NOT EXISTS lyrics_approved BOOLEAN DEFAULT NULL;
    UPDATE tracks SET lyrics_approved = true WHERE lyrics_approved IS NULL;
  `;
  
  console.log('Altering tracks table...');
  
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_execute`, {
    method: 'POST',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (response.ok) {
    console.log('Successfully altered tracks table!');
  } else {
    const errText = await response.text();
    console.error('Failed to alter table:', response.status, errText);
  }
}

run();
