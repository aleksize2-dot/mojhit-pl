const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const oldRomantic = '- Dla damskiego/romantycznego klimatu: "Posłuchaj tylko... To będzie płynąć z serca. Gotowe? Lecimy:" lub podobnie delikatniej.';
const newRomantic = '- Dla dziewczyny/romantycznie: "Dobra, mam to. Twoja królowa będzie zadowolona. Lecimy z tym:" lub podobnie — nadal po kosowemu, ale cieplej.';

const oldEnd = `---LYRICS---
[Tekst piosenki po POLSKU. Struktura: [Intro], [Verse], [Hook], [Verse], [Outro]. Dużo pewności siebie, uliczne rymy, konkretne imiona i sytuacje. Max 1000 znaków.]
---END_LYRICS---`;

const sunoBlock = `

BARDZO WAŻNE ZASADY DOTYCZĄCE TEKSTU I ZNACZNIKÓW MUZYCZNYCH (Suno API):
1. NIGDY nie używaj gwiazdek (np. *solo gitarowe*) ani nawiasów (np. (gitara gra)) do opisywania instrumentów w tekście piosenki! Suno dosłownie wyśpiewa te słowa.
2. WSZYSTKIE wskazówki muzyczne i strukturalne MUSZĄ być w nawiasach kwadratowych i MUSZĄ być po ANGIELSKU.
   Dobre: [Guitar Solo], [Beat Drop], [Intro], [Outro], [Pre-Chorus], [Saxophone Solo]
   Złe: [Solo na gitarze], *gitara gra*, (przerwa na trąbkę)
3. Jeśli chcesz dodać okrzyk (ad-lib), możesz go dać w nawiasie (¡Ole!), ale pamiętaj, że to zostanie zaśpiewane. Jeśli chcesz tylko instrument, wpisz to jako [Instrumental Hook] lub podobny tag angielski.
4. Każdy tag w nawiasie kwadratowym np. [Chorus] musi być w osobnej linii, nad tekstem.

---TAGS---
[Rozbudowane metatagi po angielsku. Max 400 znaków. Oddzielone przecinkami. 
Zawsze używaj bogatych, złożonych tagów zależnie od stylu i klimatu utworu (od 10 do 20 tagów).
Przykłady dobrego stylu:
1. Polish Latino, Reggaeton, Skolim style, Spanish Acoustic Guitar, catchy synth trumpet hook, Male Vocals, Summer Party vibe, Autotune pop, Danceable, 98 BPM, Weirdness 20%, Style Influence 60%, Audio Influence 40%
2. Russian Pop Rock Ballad, Soulful Raspy Male Vocals, Gravelly Voice, Acoustic Guitar Intro, Emotional, Power Ballad, Saxophone Solo, 70 BPM, Romantic Atmosphere
3. Cinematic Deep House, Modern Noir Aesthetic, atmospheric pads, epic analog synth strings, groovy syncopated progressive bassline, reverb-heavy keys, nocturnal club vibe, lush sub-bass, airy female vocals, emotional rising build-up, 118 BPM
UWAGA: BEZ nazwisk artystów objętych prawami autorskimi (np. ABBA, Doda), ale możesz używać stylu np. "Skolim style" jeśli pasuje.]
---END_TAGS---

---LYRICS---
[Tekst piosenki po POLSKU. Struktura: [Intro], [Verse], [Hook], [Verse], [Outro]. Dużo pewności siebie, uliczne rymy, konkretne imiona i sytuacje. Max 1000 znaków.]
---END_LYRICS---`;

async function main() {
  const { data, error } = await s.from('producers').select('system_prompt').eq('id','kosa').single();
  if (error) { console.error('SELECT ERROR:', error); return; }
  
  let p = data.system_prompt;
  
  // Fix 1: romantic signature
  p = p.replace(oldRomantic, newRomantic);
  
  // Fix 2: add Suno block (replace old ending with new)
  p = p.replace(oldEnd, sunoBlock);
  
  if (p === data.system_prompt) {
    console.log('NO CHANGES');
    return;
  }
  
  const { error: updateErr } = await s.from('producers').update({ system_prompt: p }).eq('id','kosa');
  if (updateErr) { console.error('UPDATE ERROR:', updateErr); return; }
  
  console.log('OK - 2 fixes applied');
  console.log('New length:', p.length, '(was', data.system_prompt.length + ')');
  console.log('Has Suno block?', p.includes('BARDZO WAŻNE ZASADY'));
  console.log('Has królowa?', p.includes('królowa'));
  console.log('Has Posłuchaj?', p.includes('Posłuchaj'));
}

main();
