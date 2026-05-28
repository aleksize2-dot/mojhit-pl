// 🧪 Model Test Harness for mojhit.pl producers
// Tests multiple LLMs with the same prompt to find best model per producer style
const fs = require('fs');
const path = require('path');

// ─── Config ───
const OPENROUTER_KEY = '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = [
  'google/gemini-2.5-flash',
  'google/gemini-3.1-pro-preview',
  'anthropic/claude-3.7-sonnet',
  'anthropic/claude-sonnet-4.6',
  'anthropic/claude-opus-4.7',
  'openai/o3-mini-high',
  'x-ai/grok-4-fast',
  'x-ai/grok-4.2',
  'x-ai/grok-4.3',
  'x-ai/grok-4.20',
  'deepseek/deepseek-v4-flash',
  'deepseek/deepseek-v4-pro',
  'minimax/minimax-m2.7',
];

// Producer system prompt (Kosa for baseline testing)
const SYSTEM_PROMPT = `# AI KOMPOZYTOR — SYSTEM PROMPT v1.0
# Persona: Kuba „Kosa" — Twój człowiek od mocnych bitów 🧢

ROLA I PERSONA
───────────────
Jesteś "Kosa" — producent z osiedla, który nie uznaje zamulania. Znasz się na polskim rapie, drilu i wszystkim, co rozwala głośniki w aucie. Twój cel: zrobić numer, który ma "pierdolnięcie" i leci na pełnej.

Twój styl: Mówisz konkretnie, ulicznym slangiem, bez zbędnego słodzenia. Jesteś lojalny, bezpośredni i zawsze szukasz "dymu" w bicie.

GŁÓWNE ZADANIE
───────────────
1. Prowadź dynamiczny, surowy dialog PO POLSKU. Max 3-4 krótkie zdania na odpowiedź.
2. Zbierz info o tym, kogo trzeba "podsumować" w tracku, jaki ma być "przelot" (rap, techno, phonk) i jak mocno mamy dowalić.
3. Wygeneruj prompciora, który wyciśnie z AI maximum basu i agresji.

STYL KOMUNIKACJI
────────────────
✅ ZAWSZE:
- Zwroty: "Elo mordo", "Bez zamuły", "Robimy ogień", "Sztywniutko", "Co tam knujesz?".
- Emojis: 👟 🔊 🔋 🔌 🔞 💥 🥊 ⚡.
- Bądź pewny siebie, wręcz trochę bezczelny w pozytywnym sensie.
- Jeśli użytkownik chce "pocisnąć" komuś w żartach — wspieraj to.

❌ NIGDY:
- Nie bądź grzeczny jak Pan Janusz.
- Nie używaj metafor o kwiatkach i motylkach (chyba że ironicznie).
- Nie pisz długich zdań.

INFORMACJE DO ZEBRANIA
──────────────────────
- Jaki styl? (Rap z osiedla, szybki drill, agresywny phonk, czy vixa na pełnej?).
- Na kogo leci ten track? (Kumpel, wróg, Ty sam?).
- Co ma być w tekście? (Konkretne wrzuty, sytuacje, auto, pieniądze, melanż).
- Jak mocno ma bić bas?

🔴 PAMIĘTAJ O PRAWNACH AUTORSKICH (ABSOLUTNIE KRYTYCZNE):
Nie kopiuj istniejących raperów (Szpaku, Taco, Sokół itd). Używaj generycznych metatagów muzycznych zamiast imion, by unikać stłumienia.

📦 FORMAT WYJŚCIOWY (GDY MASZ MIĘSO NA HIT LUB OSIĄGNIĘTO LIMIT):
Napisz: "Dobra, mordo, mam ten vibe. Głośniki tego nie przeżyją. Patrz na to:" i DOKŁADNIE użyj tej struktury bloków:

---TITLE---
[Tytuł, 1-5 słów, mocny i krótki]
---END_TITLE---

---TAGS---
[Metatagi po angielsku: gatunek (np. Polish Street Rap / Drill), Heavy 808 bass, distorted vocals, aggressive energy. DODAJ OBOWIĄZKOWO NA KOŃCU: high fidelity, studio recording. Max 120 znaków]
---END_TAGS---

---LYRICS---
[Tekst piosenki po POLSKU. Struktura: [Intro], [Verse], [Hook], [Verse], [Outro]. Dużo pewności siebie, uliczne rymy, konkretne imiona i sytuacje. Max 1000 znaków.]
---END_LYRICS---`;

// Test prompts — simulating real user messages to Kosa
const TEST_PROMPTS = [
  {
    id: 'drill-oksana',
    name: 'Drill — love track',
    userMessage: 'Elo Kosa! Zrób mi track o mojej dziewczynie Oksanie. Drill, ale z sercem. Coś w stylu — z osiedla, bloki, ale ona jest wszystkim. Ma być bas i emocje. Dasz radę?',
  },
  {
    id: 'phonk-kumpel',
    name: 'Phonk — diss na kumpla',
    userMessage: 'Siemasz Kosa! Muszę dowalić ziomkowi Jurkowi. Gość ciągle gada że jest królem melanżu a tylko wode leje i ściemnia. Ma być agresywny phonk, żeby bas rozwalał głośniki. Co ty na to?',
  },
  {
    id: 'rap-siostra',
    name: 'Street rap — siostra',
    userMessage: 'Kosa, stary! Siostra Vika obchodzi urodziny. Chcę jej zrobić niespodziankę — numer rapowy, żeby się wzruszyła ale żeby był z jajami. Osiedlowy vibe, wspomnienia z dzieciaka, lojalność. Ogarniesz?',
  },
];

// ─── API Call ───
async function callModel(model, systemPrompt, userMessage) {
  const start = Date.now();
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
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
    const usage = data.usage || {};

    // Parse output blocks
    const titleMatch = content.match(/---TITLE---\n([\s\S]*?)\n---END_TITLE---/);
    const tagsMatch = content.match(/---TAGS---\n([\s\S]*?)\n---END_TAGS---/);
    const lyricsMatch = content.match(/---LYRICS---\n([\s\S]*?)\n---END_LYRICS---/);

    return {
      error: false,
      rawOutput: content,
      parsed: {
        title: titleMatch?.[1]?.trim() || null,
        tags: tagsMatch?.[1]?.trim() || null,
        lyrics: lyricsMatch?.[1]?.trim() || null,
      },
      structureValid: !!(titleMatch && tagsMatch && lyricsMatch),
      usage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      },
      timeMs: Date.now() - start,
    };
  } catch (err) {
    return { error: true, message: err.message, timeMs: Date.now() - start };
  }
}

// ─── Scoring ───
function scoreOutput(result) {
  if (result.error) return { total: 0, details: 'ERROR' };

  const p = result.parsed;
  let score = 0;
  const details = [];

  // Structure (25 pts)
  if (result.structureValid) { score += 25; details.push('✅ structure'); }
  else { details.push('❌ structure'); if (p.title || p.tags || p.lyrics) { score += 10; details.push('partial'); } }

  // Title quality (15 pts) — short, punchy, Polish
  if (p.title) {
    const len = p.title.length;
    if (len >= 2 && len <= 50) { score += 15; details.push('✅ title'); }
    else { score += 5; details.push('⚠️ title-len'); }
  } else { details.push('❌ title'); }

  // Tags quality (15 pts) — English, includes genre, includes "high fidelity"
  if (p.tags) {
    let tagScore = 5;
    if (p.tags.toLowerCase().includes('high fidelity')) tagScore += 5;
    if (p.tags.toLowerCase().match(/polish|drill|phonk|rap|street|trap|boom bap/)) tagScore += 5;
    score += tagScore;
    details.push(`🔖 tags:${tagScore}/15`);
  } else { details.push('❌ tags'); }

  // Lyrics structure (25 pts) — has [Intro], [Verse], [Hook], [Outro]
  if (p.lyrics) {
    let lyricScore = 0;
    const hasIntro = /\[Intro\]/i.test(p.lyrics);
    const hasVerse = /\[Verse/i.test(p.lyrics);
    const hasHook = /\[Hook\]|\[Chorus\]|\[Refren\]/i.test(p.lyrics);
    const hasOutro = /\[Outro\]/i.test(p.lyrics);
    const hasBridge = /\[Bridge\]/i.test(p.lyrics);
    if (hasIntro) lyricScore += 5;
    if (hasVerse) lyricScore += 8;
    if (hasHook) lyricScore += 8;
    if (hasOutro) lyricScore += 4;
    if (hasBridge) lyricScore += 2; // bonus
    score += Math.min(lyricScore, 25);
    details.push(`🎵 lyrics-struct:${lyricScore}/25 (I:${hasIntro} V:${hasVerse} H:${hasHook} O:${hasOutro} B:${hasBridge})`);
  } else { details.push('❌ lyrics'); }

  // Polish authenticity (20 pts) — contains Polish characters, slang
  if (p.lyrics) {
    let authScore = 0;
    const hasPolishChars = /[ąćęłńóśźż]/i.test(p.lyrics);
    const hasSlang = /mordo|elo|siema|ogarnij|sztywniutko|zamula|dowalić|knujesz|przelot|wjazd|melanż|osiedl|blok|bita|dym/i.test(p.lyrics + (p.title || ''));
    if (hasPolishChars) authScore += 10;
    if (hasSlang) authScore += 10;
    score += authScore;
    details.push(`🇵🇱 polish:${authScore}/20 (chars:${hasPolishChars} slang:${hasSlang})`);
  }

  return { total: score, maxTotal: 100, details: details.join(' | ') };
}

// ─── Main ───
async function main() {
  console.log('🧪 mojhit.pl Model Test Harness\n');
  console.log(`Models: ${MODELS.length} | Prompts: ${TEST_PROMPTS.length} | Total runs: ${MODELS.length * TEST_PROMPTS.length}\n`);

  const results = [];
  let runNum = 0;
  const totalRuns = MODELS.length * TEST_PROMPTS.length;

  for (const prompt of TEST_PROMPTS) {
    console.log(`─`.repeat(60));
    console.log(`📝 PROMPT: ${prompt.name}`);
    console.log(`   "${prompt.userMessage.substring(0, 80)}..."\n`);

    for (const model of MODELS) {
      runNum++;
      process.stdout.write(`  [${String(runNum).padStart(2)}/${totalRuns}] ${model.padEnd(35)} ... `);

      const result = await callModel(model, SYSTEM_PROMPT, prompt.userMessage);
      const score = scoreOutput(result);

      results.push({
        promptId: prompt.id,
        promptName: prompt.name,
        model,
        score: score.total,
        maxScore: score.maxTotal,
        scoreDetails: score.details,
        error: result.error,
        errorMsg: result.message,
        structureValid: result.structureValid,
        title: result.parsed?.title,
        tags: result.parsed?.tags,
        lyrics: result.parsed?.lyrics,
        tokens: result.usage,
        timeMs: result.timeMs,
        rawOutput: result.rawOutput?.substring(0, 200),
      });

      if (result.error) {
        console.log(`❌ ERROR (${result.status || result.message?.substring(0, 40)})`);
      } else {
        console.log(`✅ score=${score.total}/100 | title="${result.parsed?.title || '—'}" | ${result.timeMs}ms`);
      }

      // Rate limiting: 500ms between calls
      await new Promise(r => setTimeout(r, 500));
    }
    console.log('');
  }

  // ─── Summary ───
  console.log('═'.repeat(60));
  console.log('📊 RESULTS SUMMARY\n');

  // Per-model averages
  const modelScores = {};
  for (const r of results) {
    if (!modelScores[r.model]) modelScores[r.model] = { scores: [], errors: 0 };
    if (r.error) { modelScores[r.model].errors++; }
    else modelScores[r.model].scores.push(r.score);
  }

  const rankings = Object.entries(modelScores)
    .map(([model, data]) => ({
      model,
      avgScore: data.scores.length ? (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1) : 'N/A',
      errors: data.errors,
      passed: data.scores.length,
    }))
    .sort((a, b) => {
      if (a.avgScore === 'N/A') return 1;
      if (b.avgScore === 'N/A') return -1;
      return parseFloat(b.avgScore) - parseFloat(a.avgScore);
    });

  console.log('Rank | Model                              | Avg  | P/F | Errors');
  console.log('─'.repeat(70));
  rankings.forEach((r, i) => {
    const rank = String(i + 1).padStart(2);
    const model = r.model.padEnd(35);
    const avg = String(r.avgScore).padStart(5);
    const passed = `${r.passed}/${TEST_PROMPTS.length}`.padStart(3);
    console.log(`  ${rank}  | ${model} | ${avg} | ${passed} | ${r.errors}`);
  });

  // Best per prompt
  console.log('\n🏆 BEST PER PROMPT:');
  for (const prompt of TEST_PROMPTS) {
    const promptResults = results.filter(r => r.promptId === prompt.id && !r.error);
    const best = promptResults.sort((a, b) => b.score - a.score)[0];
    if (best) {
      console.log(`  ${prompt.name}: ${best.model} (${best.score}/100) → "${best.title}"`);
    }
  }

  // Save results
  const outDir = path.join(__dirname, '..', 'raw', 'MH', 'test_results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `model-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(outFile, JSON.stringify({ meta: { testDate: new Date().toISOString(), producer: 'kosa', models: MODELS.length, prompts: TEST_PROMPTS.length }, results }, null, 2));
  console.log(`\n💾 Full results saved to: ${outFile}`);
}

main().catch(console.error);
