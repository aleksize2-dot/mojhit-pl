const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(
  'https://urzodvosleauddnfxqio.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyem9kdm9zbGVhdWRkbmZ4cWlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1NTE3MywiZXhwIjoyMDkwNTMxMTczfQ.YhtF8y1wKMcd1-ZfZLkxmLLTF16lQZRCdXXNwf7mqI0'
);

async function main() {
  const { data: producers } = await s.from('producers').select('id,name,badge,init_msg,system_prompt,description').order('created_at');
  
  const issues = [];

  for (const p of producers) {
    const allText = (p.init_msg || '') + (p.system_prompt || '') + (p.description || '');
    const zwroty = p.system_prompt?.match(/Zwroty:[\s\S]*?(?=\n\n|\n-)/)?.[0] || '';
    
    // Check for common non-native giveaways
    const checks = {
      'Russian calques': allText.match(/сам[ао] себя|по своему|без заморочек/g),
      'Overly formal PL': allText.match(/proszę bardzo|wspaniale|cudownie|kochanie/g),
      'Wrong register': allText.match(/bro(?!\b|ther)/g),  // 'bro' used in Polish context
      'Missing Polish diacritics': allText.match(/[a-z]le [a-z]le/g), // 'ale' without ą etc - too broad
    };

    console.log(`\n=== ${p.name} (${p.id}) ===`);
    console.log(`Greetings: ${(p.init_msg||'').split('|||').length}`);
    console.log(`Zwroty: ${zwroty.substring(0, 200)}`);
    
    // Show first greeting
    const firstGreeting = (p.init_msg || '').split('|||')[0]?.trim();
    console.log(`First: "${firstGreeting?.substring(0, 100)}..."`);
  }

  console.log('\n\n--- AUDIT COMPLETE ---');
}
main();
