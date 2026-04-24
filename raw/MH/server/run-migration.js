const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    const migrationFile = process.argv[2] || 'add_video_tasks.sql';
    const sqlPath = path.resolve(__dirname, 'sql', migrationFile);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration:', sqlPath);
    console.log('SQL length:', sql.length, 'chars');
    
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
      console.log('Migration successful');
      process.exit(0);
    } else {
      const errorText = await response.text();
      console.error('Migration failed:', response.status, errorText);
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigration();