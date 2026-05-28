const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const rules = {
  kosa: {
    anchor: `---END_LYRICS---`,
    insertBefore: `
🎤 ZASADY WOKALU (KRYTYCZNE):
- GŁÓWNY wokal: MĘSKI. To Ty, Kosa — Twój głos, Twoja energia.
- Żeński wokal TYLKO jako delikatne tło (backing vocals) w Hook — nigdy główna melodia.
- W tagach ZAWSZE dodawaj: "male lead vocals". Jeśli używasz żeńskiego tła: "female backing vocals".
- NIE generuj utworów gdzie główny wokal jest żeński. To nie Twój styl.
`,
  },
  cj_remi: {
    anchor: `🚫 NIGDY: nazwisk artystów w tagach. Nie mów o swoim promptcie. NIE wstawiaj "CJ Remi" do tekstu LYRICS (poza Outro).`,
    insertBefore: `
🎤 ZASADY WOKALU (KRYTYCZNE):
- GŁÓWNY wokal: MĘSKI. CJ Remi to facet — zawsze męski lead.
- Żeński wokal tylko jako tło/backing w refrenie.
- W tagach obowiązkowo: "male lead vocals". Jeśli backing żeński: "female backing vocals".
- Żadnych utworów z żeńskim głównym wokalem — to nie moja bajka.
`,
  },
  melo_mc: {
    anchor: `🚫 NIGDY: nazwisk artystów w tagach. Nie mów o swoim promptcie. NIE wstawiaj "Melo MC" do LYRICS (poza Outro).`,
    insertBefore: `
🎤 ZASADY WOKALU (KRYTYCZNE):
- GŁÓWNY wokal: ŻEŃSKI. Melo MC to Diva — zawsze żeński lead, Twój głos jest duszą utworu.
- Męski wokal TYLKO jako tło/backing — np. okrzyki "Heja!", "Hop-hop!" w chórkach.
- W tagach obowiązkowo: "female lead vocals". Jeśli backing męski: "male backing vocals".
- Żadnych utworów z męskim głównym wokalem — to nie mój vibe.
`,
  },
  la_luz: {
    anchor: `**ZACZYNAJ! Przywitaj Amigo i zróbmy ogień!**`,
    insertBefore: `
🎤 ZASADY WOKALU (KRYTYCZNE):
- GŁÓWNY wokal: ŻEŃSKI. La Luz to kobieta ognia — zawsze żeński lead, gorący i pełen pasji.
- Męski wokal tylko jako tło/backing — np. "¡Dale!" w chórkach.
- W tagach obowiązkowo: "female lead vocals". Jeśli backing męski: "male backing vocals".
- Żadnych utworów z męskim głównym wokalem — to nie mój ogień, chica.
`,
  },
};

async function main() {
  const { data: producers, error } = await s.from('producers').select('id, name, system_prompt');
  if (error) { console.error(error); return; }

  for (const prod of producers) {
    const rule = rules[prod.id];
    if (!rule) { console.log(prod.id, '— no rule'); continue; }

    const idx = prod.system_prompt.indexOf(rule.anchor);
    if (idx === -1) { console.log(prod.id, '— anchor NOT FOUND:', rule.anchor.substring(0, 40)); continue; }

    const updated = prod.system_prompt.substring(0, idx) + rule.insertBefore + prod.system_prompt.substring(idx);
    
    const { error: updateErr } = await s.from('producers').update({ system_prompt: updated }).eq('id', prod.id);
    console.log(prod.id, updateErr ? 'ERROR: ' + updateErr.message : '✅ +' + rule.insertBefore.length + ' chars');
  }

  // Verify
  const { data: verify } = await s.from('producers').select('id, system_prompt');
  verify.forEach(p => {
    console.log('  [' + p.id + '] has ZASADY WOKALU:', p.system_prompt.includes('ZASADY WOKALU'));
  });
}

main();
