const fs = require('fs');

const CR_KEY = 'closerouter_rT5AATf_co9C7Lj3FUhk-1kDvZG1vpaockyM1fwV5nk';
const OR_KEY = process.env.OPENROUTER_API_KEY;

const tasks = [
  {
    id: 1,
    name: 'Manacher Algorithm',
    prompt: 'Write a Python function `find_longest_palindromic_substring(s: str) -> str`. It must run in O(n) using Manacher\'s algorithm. Include detailed comments at each step. Be concise but complete.'
  },
  {
    id: 2,
    name: 'Logic Trap',
    prompt: '3 people sit in a row. Alice does not sit next to Bob. Charlie sits between Alice and Bob. Is this possible? If yes, give an example. If no, prove it rigorously. Think carefully about the wording.'
  },
  {
    id: 3,
    name: 'Express Middleware',
    prompt: 'Write an Express.js middleware in Node.js that logs each request execution time as JSON to logs/access.log, with file rotation at 10MB. Use only `fs` module, no third-party libraries. Must be async/non-blocking.'
  },
  {
    id: 4,
    name: 'Box Logic',
    prompt: 'Three boxes on a table. Gold is in exactly one. Labels: Box 1 says "Gold is in Box 2"; Box 2 says "Gold is not here"; Box 3 says "Gold is not in Box 1". Only ONE label is true. Which box has the gold? Show your full reasoning.'
  },
  {
    id: 5,
    name: 'Anthropic API Knowledge',
    prompt: 'Explain how reasoning_content in Anthropic Claude API differs from extended thinking blocks, and how both relate to <thinking> tags. Which came first chronologically? Be specific about API field names and dates.'
  }
];

async function callCloseRouter(prompt, maxTok = 800) {
  const t0 = Date.now();
  const r = await fetch('https://api.closerouter.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'x-api-key': CR_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'anthropic/claude-opus-4.7',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTok
    })
  });
  const j = await r.json();
  const t1 = Date.now();
  if (j.error) return { error: j.error.message, ms: t1 - t0 };
  return {
    ms: t1 - t0,
    content: j.choices[0].message.content,
    usage: j.usage,
    model: j.model,
    provider: j.provider
  };
}

async function callOpenRouter(prompt, maxTok = 800) {
  const t0 = Date.now();
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + OR_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'anthropic/claude-opus-4.7',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTok
    })
  });
  const j = await r.json();
  const t1 = Date.now();
  if (j.error) return { error: j.error.message || JSON.stringify(j.error), ms: t1 - t0 };
  return {
    ms: t1 - t0,
    content: j.choices[0].message.content,
    usage: j.usage,
    model: j.model,
    provider: j.provider
  };
}

async function run() {
  const results = [];
  for (const task of tasks) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`TASK ${task.id}: ${task.name}`);
    console.log('='.repeat(70));

    const [cr, or] = await Promise.all([
      callCloseRouter(task.prompt),
      callOpenRouter(task.prompt)
    ]);

    console.log('\n--- CloseRouter ---');
    console.log('Time:', cr.ms, 'ms | Model:', cr.model || 'n/a');
    console.log('Tokens:', cr.usage ? `${cr.usage.prompt_tokens}→${cr.usage.completion_tokens}` : 'n/a');
    if (cr.error) console.log('ERROR:', cr.error);
    else console.log('Answer:\n' + cr.content);

    console.log('\n--- OpenRouter ---');
    console.log('Time:', or.ms, 'ms | Model:', or.model || 'n/a');
    console.log('Tokens:', or.usage ? `${or.usage.prompt_tokens}→${or.usage.completion_tokens}` : 'n/a');
    if (or.error) console.log('ERROR:', or.error);
    else console.log('Answer:\n' + or.content);

    results.push({ task, cr, or });
  }

  fs.writeFileSync('C:/Users/Admin/.openclaw/workspace/tmp/model-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n=== DONE ===');
  console.log('Saved to tmp/model-test-results.json');
}

run().catch(e => console.error('FATAL:', e));
