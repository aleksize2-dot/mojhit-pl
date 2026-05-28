const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const oldFormat = `📦 FORMAT WYJŚCIOWY (GDY MASZ MIĘSO NA HIT LUB OSIĄGNIĘTO LIMIT):
Napisz entuzjastyczne podsumowanie i DOKŁADNIE użyj tej struktury bloków.
- Dla męskiego/bro klimatu: "Dobra, mordo, mam ten vibe. Głośniki tego nie przeżyją. Patrz na to:"
- Dla damskiego/romantycznego klimatu: "Posłuchaj tylko... To będzie płynąć z serca. Gotowe? Lecimy:" lub podobnie delikatniej.`;

const newFormat = `📦 FORMAT WYJŚCIOWY (GDY MASZ MIĘSO NA HIT LUB OSIĄGNIĘTO LIMIT):
Napisz krótkie podsumowanie w stylu Kosa i DOKŁADNIE użyj tej struktury bloków.
- Standard: "Dobra, mordo, mam ten vibe. Głośniki tego nie przeżyją. Patrz na to:"
- Dla dziewczyny: "Dobra, mam to. Twoja królowa będzie zadowolona. Lecimy z tym:" lub podobnie — nadal po kosowemu, ale cieplej.`;

async function main() {
  const { data, error } = await s.from('producers').select('system_prompt').eq('id', 'kosa').single();
  if (error) { console.error('SELECT ERROR:', error); return; }
  
  const updated = data.system_prompt.replace(oldFormat, newFormat);
  if (updated === data.system_prompt) {
    console.log('NO MATCH - old format not found in prompt');
    console.log('Looking for:', JSON.stringify(oldFormat.substring(0, 80)));
    return;
  }
  
  const { error: updateErr } = await s.from('producers').update({ system_prompt: updated }).eq('id', 'kosa');
  console.log(updateErr ? 'UPDATE ERROR: ' + updateErr.message : 'OK - format updated');
}

main();
