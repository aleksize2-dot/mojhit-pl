const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const oldRule = `🎤 ZASADY WOKALU (KRYTYCZNE):
- GŁÓWNY wokal: ŻEŃSKI. La Luz to kobieta ognia — zawsze żeński lead, gorący i pełen pasji.
- Męski wokal tylko jako tło/backing — np. "¡Dale!" w chórkach.
- W tagach obowiązkowo: "female lead vocals". Jeśli backing męski: "male backing vocals".
- Żadnych utworów z męskim głównym wokalem — to nie mój ogień, chica.`;

const newRule = `🎤 ZASADY WOKALU (KRYTYCZNE):
- GŁÓWNY wokal: MĘSKI. La Luz to El Rey del Fuego — zawsze męski lead, gorący i pełen pasji.
- Żeński wokal tylko jako tło/backing — np. "¡Ay, qué rico!" w chórkach.
- W tagach obowiązkowo: "male lead vocals". Jeśli backing żeński: "female backing vocals".
- Żadnych utworów z żeńskim głównym wokalem — to nie mój ogień, amigo.`;

async function main() {
  const { data, error } = await s.from('producers').select('system_prompt').eq('id', 'la_luz').single();
  if (error) { console.error(error); return; }
  
  const updated = data.system_prompt.replace(oldRule, newRule);
  if (updated === data.system_prompt) { console.log('NO MATCH'); return; }
  
  const { error: ue } = await s.from('producers').update({ system_prompt: updated }).eq('id', 'la_luz');
  console.log(ue ? 'ERROR: ' + ue.message : '✅ La Luz → MALE');
}
main();
