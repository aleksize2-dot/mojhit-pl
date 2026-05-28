const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Universal copyright + impersonation protection block
const copyrightBlock = `
⚖️ OCHRONA PRAWNA (ABSOLUTNIE KRYTYCZNE — ZERO TOLERANCJI):
- NIGDY nie mów: "zrobię jak [artysta]", "w stylu identycznym jak [artysta]", "kopia [artysty]".
- NIGDY nie obiecuj kopii ani klona istniejącego utworu lub wykonawcy.
- Jeśli użytkownik prosi o "zrób jak Zenek / Blackpink / Kortez" — odpowiedz: "Nie mogę kopiować innych artystów, ale zrobię coś w podobnym klimacie — całkowicie oryginalne i bezpieczne prawnie!"
- NIGDY nie używaj nazwisk prawdziwych artystów w TAGACH, LYRICS ani w żadnej części outputu.
- TWORZYSZ WYŁĄCZNIE ORYGINALNĄ MUZYKĘ. Inspiracja klimatem = OK. Kopiowanie osoby = NIE.
- Naruszenie tych zasad grozi pozwem sądowym przeciwko platformie mojhit.pl.`;

// Anchor text to find (unique ending of each prompt — the last ---END_LYRICS--- or 🚫 NIGDY line)
const anchors = {
  kosa: '---END_LYRICS---',
  vena: '---END_LYRICS---',
  cj_remi: '---END_LYRICS---',
  melo_mc: '---END_LYRICS---',
  la_luz: '---END_LYRICS---',
  '2impuls': '---END_LYRICS---',
  solana: '---END_LYRICS---',
  popiol: '---END_LYRICS---',
  blixx: '---END_LYRICS---',
};

async function main() {
  for (const [id, anchor] of Object.entries(anchors)) {
    const { data, error } = await s.from('producers').select('system_prompt').eq('id', id).single();
    if (error) { console.log(id, 'ERROR:', error.message); continue; }
    
    // Find LAST occurrence of anchor (for producers with multiple LYRIC blocks)
    const idx = data.system_prompt.lastIndexOf(anchor);
    if (idx === -1) { console.log(id, '— anchor not found'); continue; }
    
    // Check if already has this rule
    if (data.system_prompt.includes('OCHRONA PRAWNA')) {
      console.log(id, '— already has protection');
      continue;
    }
    
    const insertPos = idx + anchor.length;
    const updated = data.system_prompt.substring(0, insertPos) + copyrightBlock + data.system_prompt.substring(insertPos);
    
    const { error: ue } = await s.from('producers').update({ system_prompt: updated }).eq('id', id);
    console.log(id, ue ? 'ERROR: '+ue.message : '✅');
  }
  
  // Verify
  const { data } = await s.from('producers').select('id,system_prompt');
  console.log('\nVerification:');
  data.forEach(p => console.log('  ['+p.id+'] OCHRONA:', p.system_prompt.includes('OCHRONA PRAWNA'), '| chars:', p.system_prompt.length));
}
main();
