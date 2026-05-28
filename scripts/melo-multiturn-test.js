// 🧪 Melo MC Multi-Turn Test
// Simulates conversation then generation
const fs = require('fs');
const path = require('path');

const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(
  'https://urzodvosleauddnfxqio.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyem9kdm9zbGVhdWRkbmZ4cWlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1NTE3MywiZXhwIjoyMDkwNTMxMTczfQ.YhtF8y1wKMcd1-ZfZLkxmLLTF16lQZRCdXXNwf7mqI0'
);

const OPENROUTER_KEY = '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Top models only (ones that actually generate)
const MODELS = [
  'x-ai/grok-4-fast',
  'x-ai/grok-4.20',
  'x-ai/grok-4.3',
  'google/gemini-3.1-flash-lite',
  'google/gemini-3.1-pro-preview',
  'anthropic/claude-sonnet-4.6',
  'minimax/minimax-m2-her',
  'deepseek/deepseek-v4-flash',
  'deepseek/deepseek-v4-pro',
];

async function callModel(model, systemPrompt, messages) {
  const start = Date.now();
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_KEY}` },
      body: JSON.stringify({ model, messages, max_tokens: 2000, temperature: 0.85 }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return { error: true, status: res.status, message: errText.substring(0, 300), timeMs: Date.now() - start };
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const titleMatch = content.match(/---TITLE---\n([\s\S]*?)\n---END_TITLE---/);
    const tagsMatch = content.match(/---TAGS---\n([\s\S]*?)\n---END_TAGS---/);
    const lyricsMatch = content.match(/---LYRICS---\n([\s\S]*?)\n---END_LYRICS---/);
    return {
      error: false,
      rawOutput: content.substring(0, 300),
      parsed: {
        title: titleMatch?.[1]?.trim() || null,
        tags: tagsMatch?.[1]?.trim() || null,
        lyrics: lyricsMatch?.[1]?.trim() || null,
      },
      structureValid: !!(titleMatch && tagsMatch && lyricsMatch),
      tokens: data.usage || {},
      timeMs: Date.now() - start,
    };
  } catch (err) {
    return { error: true, message: err.message, timeMs: Date.now() - start };
  }
}

function scoreOutput(result) {
  if (result.error) return { total: 0, details: 'ERROR' };
  const p = result.parsed;
  let score = 0;
  const details = [];
  if (result.structureValid) { score += 30; details.push('✅ struct'); } else { details.push('❌ struct'); if (p.title || p.tags || p.lyrics) { score += 10; } }
  if (p.title && p.title.length >= 2 && p.title.length <= 60) { score += 15; details.push('✅ title'); } else { score += p.title ? 5 : 0; details.push('⚠️ title'); }
  if (p.tags) { let ts = 5; if (p.tags.length > 50) ts += 5; if (p.tags.match(/BPM/i)) ts += 5; score += ts; details.push(`🔖 tags:${ts}/15`); } else { details.push('❌ tags'); }
  if (p.lyrics) {
    let ls = 0;
    if (/\[Intro\]/i.test(p.lyrics)) ls += 5;
    if (/\[Verse/i.test(p.lyrics)) ls += 8;
    if (/\[Chorus\]|\[Hook\]|\[Refren\]/i.test(p.lyrics)) ls += 8;
    if (/\[Outro\]/i.test(p.lyrics)) ls += 4;
    score += Math.min(ls, 25); details.push(`🎵 struct:${Math.min(ls,25)}/25`);
    let cs = 0;
    if (/Oksan/i.test(p.lyrics)) cs += 8;
    if (/koch|miłoś|serce/i.test(p.lyrics)) cs += 7;
    score += cs; details.push(`💕 content:${cs}/15`);
  } else { details.push('❌ lyrics'); }
  return { total: score, details: details.join(' | ') };
}

async function main() {
  const { data: prod, error } = await s.from('producers').select('system_prompt').eq('id', 'melo_mc').single();
  if (error) { console.error('Supabase error:', error); return; }

  console.log('🎭 Melo MC Multi-Turn Test — Scenario: Oksana love track\n');
  console.log(`System prompt: ${prod.system_prompt.length} chars`);
  console.log(`Models: ${MODELS.length} | Runs: ${MODELS.length}\n`);

  // Simulated multi-turn conversation (same flow as CJ Remi test)
  const convo = [
    { role: 'user', content: 'Hej Melo! 👋' },
    { role: 'assistant', content: 'Hej Słońce! ☀️ Twoja Melo MC już grzeje akordeon! Na jaką okazję robimy muzyczny prezent? Wesele, urodziny, rocznica, a może po prostu chcemy zrobić komuś niespodziankę? I kto jest bohaterem — podaj imię! 🎵' },
    { role: 'user', content: 'Dla mojej kochanej Oksany. Jesteśmy razem od lat, ona ma niesamowitą energię, zawsze mnie wspierała na dobre i złe. Chcę jej pokazać jak bardzo ją kocham.' },
    { role: 'assistant', content: 'Ooo, Kochanie! 🌸 Oksana to musi być wyjątkowa kobieta! Lata miłości — to aż prosi się o romantyczną balladę z akordeonem, która roztopi serce! Albo może coś bardziej tanecznego, żeby cała sala skakała? Co wolisz — łza wzruszenia czy parkiet w ogniu? 💃🎻' },
    { role: 'user', content: 'Zrób coś od siebie! Romantycznie ale z energią, żeby się wzruszyła i żeby nogi same rwały do tańca. Dodaj coś wyjątkowego od Melo MC!' },
  ];

  const results = [];

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    process.stdout.write(`  [${String(i+1).padStart(2)}/${MODELS.length}] ${model.padEnd(35)} ... `);

    const result = await callModel(model, prod.system_prompt, [
      { role: 'system', content: prod.system_prompt },
      ...convo,
    ]);
    const score = scoreOutput(result);

    results.push({
      model,
      score: score.total,
      scoreDetails: score.details,
      title: result.parsed?.title,
      tags: result.parsed?.tags,
      lyrics: result.parsed?.lyrics,
      structureValid: result.structureValid,
      error: result.error,
      errorMsg: result.message,
      tokens: result.tokens,
      timeMs: result.timeMs,
    });

    if (result.error) {
      console.log(`❌ ERROR (${result.status || result.message?.substring(0, 40)})`);
    } else if (result.structureValid) {
      console.log(`🔥 ${score.total}/100 | "${result.parsed.title}" | ${result.timeMs}ms`);
    } else {
      console.log(`💬 chat only | ${result.timeMs}ms`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  // Summary
  console.log(`\n${'═'.repeat(70)}`);
  console.log('📊 MELO MC MULTI-TURN RESULTS\n');
  
  const generated = results.filter(r => !r.error && r.structureValid);
  const chatters = results.filter(r => !r.error && !r.structureValid);
  
  if (generated.length > 0) {
    console.log('🔥 GENERATED TRACKS:');
    generated.sort((a, b) => b.score - a.score).forEach((r, i) => {
      console.log(`  ${i+1}. ${r.model.padEnd(35)} ${r.score}/100 → "${r.title}"`);
    });
  }
  
  if (chatters.length > 0) {
    console.log('\n💬 CHAT ONLY (no generation):');
    chatters.forEach(r => console.log(`  - ${r.model}`));
  }

  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(r => console.log(`  - ${r.model}: ${r.errorMsg?.substring(0, 60)}`));
  }

  // Save
  const outDir = path.join(__dirname, '..', 'raw', 'MH', 'test_results');
  const outFile = path.join(outDir, `melo-multiturn-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(outFile, JSON.stringify({
    meta: { date: new Date().toISOString(), producer: 'melo_mc', models: MODELS.length, type: 'multi-turn' },
    results,
  }, null, 2));
  console.log(`\n💾 Saved: ${outFile}`);
}

main().catch(console.error);
