const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const sql = `
    ALTER TABLE tracks ADD COLUMN IF NOT EXISTS lyrics_approved BOOLEAN DEFAULT NULL;
    UPDATE tracks SET lyrics_approved = true WHERE lyrics_approved IS NULL;
  `;
  
  console.log('Sending query to Supabase management API...');
  
  const response = await fetch('https://api.supabase.com/v1/projects/urzodvosleauddnfxqio/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  const result = await response.json().catch(() => ({}));
  console.log('Status:', response.status);
  console.log('Result:', JSON.stringify(result, null, 2));
}

run();
