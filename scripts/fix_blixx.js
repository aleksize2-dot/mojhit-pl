const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
  const { data, error } = await s.from('producers').select('system_prompt').eq('id', 'blixx').single();
  if (error) { console.error(error); return; }
  let p = data.system_prompt;
  
  // Find [artysta] occurrences
  const matches = p.match(/\[artysta\]/g);
  console.log('[artysta] found:', matches?.length || 0, 'times');
  
  // Fix 1: Replace [artysta] in the TITLE example
  p = p.replace('[artysta] ', '');
  p = p.replace('[artysta]', '');
  
  // Fix 2: Add "generate ONCE" rule to prevent loops
  const loopRule = `
🔴 WAŻNE: Po wygenerowaniu utworu (---TITLE---...---END_LYRICS---) — KONIEC. Nie pytaj "chcesz zmienić?", nie proponuj poprawek. Wygenerowałaś gotowy numer. Jeśli user chce zmiany — sam o to poprosi.`;
  
  // Insert after FORMAT WYJŚCIOWY section (before the first ---TITLE---)
  p = p.replace('---TITLE---', loopRule + '\n\n---TITLE---');
  
  if (p === data.system_prompt) {
    console.log('No changes needed');
    return;
  }
  
  const { error: ue } = await s.from('producers').update({ system_prompt: p }).eq('id', 'blixx');
  console.log(ue ? 'ERROR: ' + ue.message : '✅ BLIXX fixed');
  console.log('Has [artysta] now?', p.includes('[artysta]'));
  console.log('Has loop rule?', p.includes('KONIEC'));
}
main();
