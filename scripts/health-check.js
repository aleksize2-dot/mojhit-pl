#!/usr/bin/env node

/**
 * health-check.js
 * 
 * Weekly memory health‑check (Karpathy‑style).
 * 
 * Scans MEMORY.md and memory/*.md for:
 * - Gaps (missing cross‑links, incomplete topics)
 * - Inconsistencies (contradictory statements)
 * - New possible connections between topics
 * - Outdated information
 * 
 * Uses LLM (Gemini/DeepSeek) to suggest fixes and creates new wiki articles.
 * Runs via OpenClaw cron (e.g., every Sunday at 03:00).
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const MEMORY_FILE = path.join(__dirname, '..', 'MEMORY.md');
const MEMORY_DIR = path.join(__dirname, '..', 'memory');

async function readMemory() {
    try {
        const content = await fs.readFile(MEMORY_FILE, 'utf-8');
        return content;
    } catch (err) {
        console.error(`Error reading ${MEMORY_FILE}:`, err.message);
        return '';
    }
}

async function listDailyFiles() {
    try {
        const files = await fs.readdir(MEMORY_DIR);
        return files
            .filter(f => f.endsWith('.md') && f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
            .map(f => path.join(MEMORY_DIR, f));
    } catch (err) {
        console.error(`Error reading ${MEMORY_DIR}:`, err.message);
        return [];
    }
}

async function callLLM(prompt, context) {
    const configPath = path.join(process.env.USERPROFILE || process.env.HOME, '.openclaw', 'openclaw.json');
    const configText = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configText);

    const defaultModel = config.agents?.defaults?.model || "google/gemini-3.1-pro-preview";
    console.log(`Using model: ${defaultModel}`);
    const fullText = prompt + "\n\n" + context;

    if (defaultModel.includes('deepseek')) {
        const apiKey = process.env.DEEPSEEK_API_KEY || config.models?.providers?.deepseek?.apiKey || config.models?.providers?.openai?.apiKey;
        if (!apiKey) throw new Error("DeepSeek API key missing in env or config.");
        const modelName = defaultModel.split('/').pop() || 'deepseek-chat';

        const res = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({ model: modelName, messages: [{ role: "user", content: fullText }] })
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "LLM Error";
    } else {
        const apiKey = config.models?.providers?.google?.apiKey;
        const modelName = defaultModel.includes('gemini') ? defaultModel.split('/').pop() : 'gemini-3.1-pro-preview';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: fullText }] }] })
        });
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "LLM Error";
    }
}

async function performHealthCheck() {
    console.log('Starting memory health‑check...');

    const memory = await readMemory();
    const dailyFiles = await listDailyFiles();
    let dailyContent = '';
    for (const file of dailyFiles.slice(-7)) { // last 7 days
        try {
            const content = await fs.readFile(file, 'utf-8');
            dailyContent += '\n' + content;
        } catch (err) {
            console.warn(`Could not read ${file}:`, err.message);
        }
    }

    const prompt = `Analyze the following long‑term memory (MEMORY.md) and recent daily logs. Identify:
1. **Gaps** – topics mentioned but not elaborated, missing cross‑references.
2. **Inconsistencies** – contradictory statements, outdated info.
3. **New connections** – potential cross‑links between unrelated topics.
4. **Action items** – what new wiki articles should be created to fill gaps.

Format the response as a Markdown report with concrete suggestions.

MEMORY.md:
${memory.slice(0, 5000)}

Recent daily logs:
${dailyContent.slice(0, 5000)}`;

    const analysis = await callLLM(prompt, memory + dailyContent);

    // Write analysis to today's memory file
    const today = new Date().toISOString().split('T')[0];
    const dailyFile = path.join(MEMORY_DIR, `${today}.md`);
    await fs.appendFile(dailyFile, `\n## Memory Health‑Check\n${analysis}\n`, 'utf-8');

    console.log('Health‑check complete. Suggestions logged to', dailyFile);
}

async function main() {
    try {
        await performHealthCheck();
    } catch (err) {
        console.error('Health‑check failed:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { performHealthCheck };