const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Deleting Balagan u Aliony from tracks table...');
  const { data, error } = await supabase
    .from('tracks')
    .delete()
    .eq('id', '191521a8-7a57-4bb9-9eee-0b6f091cb903');
    
  if (error) {
    console.error('Error deleting:', error.message);
  } else {
    console.log('Successfully deleted track Balagan u Aliony!');
  }
}

run();
