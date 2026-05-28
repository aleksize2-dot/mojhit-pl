const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env'});
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkProducers() {
  const { data: producers } = await supabase.from('producers').select('id, name, theme_config, gradient, button_gradient');
  console.log(JSON.stringify(producers, null, 2));
}
checkProducers();
