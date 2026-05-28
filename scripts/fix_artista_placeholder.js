const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
  const { data: producers } = await s.from('producers').select('id,system_prompt');
  
  for (const prod of producers) {
    let p = prod.system_prompt;
    
    // Replace template-looking placeholders with natural text
    p = p.replace(/\[artysta\]/g, 'konkretny artysta');
    p = p.replace(/\[artysty\]/g, 'konkretnego artysty');
    
    if (p !== prod.system_prompt) {
      const { error } = await s.from('producers').update({ system_prompt: p }).eq('id', prod.id);
      console.log(prod.id, error ? 'ERROR: '+error.message : '✅');
    } else {
      console.log(prod.id, '— no change needed');
    }
  }
}
main();
