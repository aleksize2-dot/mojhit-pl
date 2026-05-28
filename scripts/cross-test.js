// 🧪 Full Producer × Model Cross-Test
// Scenario: love track for Oksana, long-time love, energy
const fs = require('fs');
const path = require('path');

const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(
  'https://urzodvosleauddnfxqio.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyem9kdm9zbGVhdWRkbmZ4cWlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1NTE3MywiZXhwIjoyMDkwNTMxMTczfQ.YhtF8y1wKMcd1-ZfZLkxmLLTF16lQZRCdXXNwf7mqI0'
);

const OPENROUTER_KEY = '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = [
  'x-ai/grok-4-fast',
  'x-ai/grok-4.20',
  'x-ai/grok-4.3',
  'google/gemini-3.1-pro-preview',
  'google/gemini-3.1-flash-lite',
  'deepseek/deepseek-v4-flash',
  'deepseek/deepseek-v4-pro',
  'anthropic/claude-sonnet-4.6',
  'minimax/minimax-m2-her',
  'openrouter/owl-alpha',
  'mistral/mistral-medium-3.5',
  'inclusionai/ring-2.6-1t:free',
];

// Simulated user messages (adapts to each producer's style)
const USER_MSGS = {
  default: [
    'Cześć! Chcę zrobić niespodziankę — numer dla mojej dziewczyny Oksany. Jesteśmy razem od lat, ma niesamowitą energię, zawsze mnie wspiera. Kocham ją nad życie. Zrób coś od siebie, coś co jej się spodoba — romantycznie ale z pazurem.',
  ],
};

async function callModel(model, systemPrompt, messages) {
  const start = Date.now();
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_KEY}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 2000,
        temperature: 0.8,
      }),
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
  if (result.error) return { total: 0, maxTotal: 100, details: 'ERROR' };
  const p = result.parsed;
  let score = 0;
  const details = [];
  if (result.structureValid) { score += 30; details.push('✅ structure'); } else { details.push('❌ structure'); if (p.title || p.tags || p.lyrics) { score += 10; details.push('partial'); } }
  if (p.title && p.title.length >= 2 && p.title.length <= 60) { score += 15; details.push('✅ title'); } else { details.push('⚠️ title'); score += 5; }
  if (p.tags) {
    let ts = 5;
    if (p.tags.toLowerCase().includes('high fidelity') || p.tags.toLowerCase().includes('studio recording')) ts += 5;
    if (p.tags.length > 30) ts += 5;
    score += ts; details.push(`🔖 tags:${ts}/15`);
  } else { details.push('❌ tags'); }
  if (p.lyrics) {
    let ls = 0;
    if (/\[Intro\]/i.test(p.lyrics)) ls += 5;
    if (/\[Verse/i.test(p.lyrics)) ls += 8;
    if (/\[Hook\]|\[Chorus\]|\[Refren\]/i.test(p.lyrics)) ls += 8;
    if (/\[Outro\]/i.test(p.lyrics)) ls += 4;
    score += Math.min(ls, 25); details.push(`🎵 struct:${Math.min(ls, 25)}/25`);
    // Content quality: mentions Oksana?
    let cs = 0;
    if (/Oksan/i.test(p.lyrics)) cs += 8;
    if (/koch|miłoś|serce|serdusz/i.test(p.lyrics)) cs += 7;
    score += cs; details.push(`💕 content:${cs}/15`);
  } else { details.push('❌ lyrics'); }
  return { total: score, maxTotal: 100, details: details.join(' | ') };
}

async function main() {
  // Fetch producer configs
  const { data: producers, error } = await s.from('producers').select('id, name, system_prompt, model_name');
  if (error) { console.error('Supabase error:', error); return; }

  console.log(`🧪 CROSS-TEST: ${producers.length} producers × ${MODELS.length} models = ${producers.length * MODELS.length} runs`);
  console.log(`📝 Scenario: love track for Oksana (long-time girlfriend, energy, romantic)\n`);

  const results = [];
  let runNum = 0;
  const totalRuns = producers.length * MODELS.length;
  const userMsgs = USER_MSGS.default;

  for (const prod of producers) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`🎭 PRODUCER: ${prod.name} (${prod.id}) — current model: ${prod.model_name}`);
    console.log(`   Prompt length: ${prod.system_prompt?.length || 0} chars\n`);

    for (const model of MODELS) {
      runNum++;
      const eta = `[${String(runNum).padStart(2)}/${totalRuns}]`;
      process.stdout.write(`  ${eta} ${model.padEnd(35)} ... `);

      const chatMessages = userMsgs.map(m => ({ role: 'user', content: m }));
      const result = await callModel(model, prod.system_prompt, chatMessages);
      const score = scoreOutput(result);

      results.push({
        producerId: prod.id,
        producerName: prod.name,
        producerCurrentModel: prod.model_name,
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
      } else {
        const title = result.parsed?.title || '—';
        console.log(`✅ score=${score.total}/100 | "${title}" | ${result.timeMs}ms`);
      }

      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Summary
  console.log(`\n${'═'.repeat(70)}`);
  console.log('📊 RESULTS SUMMARY\n');

  // Best model per producer
  console.log('🏆 BEST MODEL PER PRODUCER:');
  for (const prod of producers) {
    const pr = results.filter(r => r.producerId === prod.id && !r.error);
    if (pr.length === 0) { console.log(`  ${prod.name}: ALL FAILED`); continue; }
    const best = pr.sort((a, b) => b.score - a.score)[0];
    console.log(`  ${prod.name}: ${best.model} (${best.score}/100) → "${best.title}"`);
    
    // Also show current model score for comparison
    const curr = pr.find(r => r.model === prod.model_name);
    if (curr && curr.model !== best.model) {
      console.log(`    (current ${prod.model_name}: ${curr.score}/100)`);
    }
  }

  // Overall model ranking
  console.log('\n📊 OVERALL MODEL RANKING (avg across producers):');
  const modelScores = {};
  for (const r of results) {
    if (!modelScores[r.model]) modelScores[r.model] = { scores: [], errors: 0 };
    if (r.error) modelScores[r.model].errors++;
    else modelScores[r.model].scores.push(r.score);
  }
  Object.entries(modelScores)
    .sort((a, b) => {
      const aa = a[1].scores.length ? a[1].scores.reduce((x,y)=>x+y,0)/a[1].scores.length : -1;
      const bb = b[1].scores.length ? b[1].scores.reduce((x,y)=>x+y,0)/b[1].scores.length : -1;
      return bb - aa;
    })
    .forEach(([m, d], i) => {
      const avg = d.scores.length ? (d.scores.reduce((x,y)=>x+y,0)/d.scores.length).toFixed(1) : 'N/A';
      console.log(`  ${String(i+1).padStart(2)}. ${m.padEnd(35)} avg=${avg}/100 (${d.scores.length}/${producers.length} ok, ${d.errors} err)`);
    });

  // Save
  const outDir = path.join(__dirname, '..', 'raw', 'MH', 'test_results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `cross-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(outFile, JSON.stringify({
    meta: { date: new Date().toISOString(), producers: producers.length, models: MODELS.length, scenario: 'love-track-oksana' },
    producers: producers.map(p => ({ id: p.id, name: p.name, currentModel: p.model_name })),
    results,
  }, null, 2));
  console.log(`\n💾 Saved: ${outFile}`);
}

main().catch(console.error);
