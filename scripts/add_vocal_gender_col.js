const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.urzodvosleauddnfxqio:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyem9kdm9zbGVhdWRkbmZ4cWlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1NTE3MywiZXhwIjoyMDkwNTMxMTczfQ.YhtF8y1wKMcd1-ZfZLkxmLLTF16lQZRCdXXNwf7mqI0@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await pool.query('ALTER TABLE producers ADD COLUMN IF NOT EXISTS vocal_gender TEXT;');
    console.log('✅ Column added');
    
    await pool.query("UPDATE producers SET vocal_gender='m' WHERE id IN ('kosa','cj_remi','la_luz','2impuls');");
    console.log('✅ Male defaults set (kosa, cj_remi, la_luz, 2impuls)');
    
    await pool.query("UPDATE producers SET vocal_gender='f' WHERE id='melo_mc';");
    console.log('✅ Female default set (melo_mc)');
    
    const { rows } = await pool.query('SELECT id, vocal_gender FROM producers;');
    rows.forEach(r => console.log('  ['+r.id+'] → '+r.vocal_gender));
  } catch(e) {
    console.error('ERROR:', e.message);
  }
  pool.end();
}
main();
