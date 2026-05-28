// Try connecting to Supabase PostgreSQL directly
const { Pool } = require('pg');

const PASSWORD = process.argv[2];
if (!PASSWORD) {
  console.log('Usage: node mig-run.js <DB_PASSWORD>');
  console.log('Get the password from Supabase Dashboard > Project Settings > Database');
  process.exit(1);
}

const pool = new Pool({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.urzodvosleauddnfxqio',
  password: PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const client = await pool.connect();
    console.log('Connected!');
    
    const sql = `
      ALTER TABLE producers 
      ADD COLUMN IF NOT EXISTS weirdness_constraint FLOAT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS style_weight FLOAT DEFAULT NULL
    `;
    
    const result = await client.query(sql);
    console.log('Migration successful:', result);
    
    // Verify
    const verify = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='producers' 
      AND column_name IN ('weirdness_constraint', 'style_weight')
    `);
    console.log('Columns:', verify.rows);
    
    client.release();
    await pool.end();
  } catch (e) {
    console.error('Error:', e.message);
    await pool.end();
    process.exit(1);
  }
}

main();
