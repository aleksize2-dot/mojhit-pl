const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const maleSmartRule = `
🎤 ZASADY WOKALU (KRYTYCZNE):
- GŁÓWNY wokal: ZAWSZE MĘSKI. To Twój głos, Twoja energia.
- BACKING vocals — dobieraj do NASTROJU utworu:
  • Romantyczna ballada, wolny numer, emocje → MĘSKI backing (harmonie jak Take That, Backstreet Boys — ciepło i siła)
  • Energetyczny banger, impreza, diss → ŻEŃSKI backing (kontrast, lekkość, energia)
  • Ulice/hood vibe → MĘSKI gang vocals (chórki ziomali)
- W tagach ZAWSZE dodawaj odpowiedni tag: "male backing vocals" LUB "female backing vocals" w zależności od nastroju.
- NIGDY nie oddawaj głównego wokalu żeńskiemu — lead jest Twój.`;

const femaleSmartRule = `
🎤 ZASADY WOKALU (KRYTYCZNE):
- GŁÓWNY wokal: ZAWSZE ŻEŃSKI. To Twój głos, Twoja dusza.
- BACKING vocals — dobieraj do NASTROJU utworu:
  • Romantyczna ballada, slow, wzruszenie → ŻEŃSKI backing (harmonie jak Spice Girls — siostrzane ciepło)
  • Energetyczny banger, disco, impreza → MĘSKI backing (okrzyki, kontrast, power)
  • Folk/słowiański vibe → MĘSKO-ŻEŃSKI miks (chórki jak na weselu)
- W tagach ZAWSZE dodawaj odpowiedni tag: "female backing vocals" LUB "male backing vocals" w zależności od nastroju.
- NIGDY nie oddawaj głównego wokalu męskiemu — lead jest Twój.`;

const anchors = {
  kosa: `🎤 ZASADY WOKALU (KRYTYCZNE):`,
  cj_remi: `🎤 ZASADY WOKALU (KRYTYCZNE):`,
  la_luz: `🎤 ZASADY WOKALU (KRYTYCZNE):`,
  melo_mc: `🎤 ZASADY WOKALU (KRYTYCZNE):`,
};

const endingMarkers = {
  kosa: `---END_LYRICS---`,
  cj_remi: `🚫 NIGDY: nazwisk artystów`,
  la_luz: `**ZACZYNAJ!`,
  melo_mc: `🚫 NIGDY: nazwisk artystów`,
};

async function main() {
  const { data: producers } = await s.from('producers').select('id, system_prompt').in('id', ['kosa','cj_remi','la_luz','melo_mc']);
  
  for (const prod of producers) {
    const anchor = anchors[prod.id];
    const endMarker = endingMarkers[prod.id];
    const rule = prod.id === 'melo_mc' ? femaleSmartRule : maleSmartRule;
    
    const startIdx = prod.system_prompt.indexOf(anchor);
    const endIdx = prod.system_prompt.indexOf(endMarker, startIdx);
    
    if (startIdx === -1 || endIdx === -1) {
      console.log(prod.id, '— SKIP (anchor/end not found)');
      continue;
    }
    
    const updated = prod.system_prompt.substring(0, startIdx) + rule + '\n' + prod.system_prompt.substring(endIdx);
    const { error } = await s.from('producers').update({ system_prompt: updated }).eq('id', prod.id);
    console.log(prod.id, error ? 'ERROR: '+error.message : '✅ smart vocal rule');
  }
}
main();
