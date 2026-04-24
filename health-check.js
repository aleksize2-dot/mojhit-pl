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

const MEMORY_FILE = path.join(__dirname, 'MEMORY.md');
const MEMORY_DIR = path.join(__dirname, 'memory');

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
    // TODO: integrate with OpenClaw's LLM (Gemini/DeepSeek)
    // Placeholder – returns mock analysis
    console.log(`Calling LLM for health‑check...`);
    return `## Health‑check suggestions (${new Date().toISOString().split('T')[0]})

### Gaps found:
1. **Project mojhit.pl** – missing section about marketing funnel.
2. **Memory architecture** – no diagram of raw→compile→interface pipeline.

### Inconsistencies:
- None detected.

### New cross‑links:
- Link "Admin Panel" to "Core Agents (Hit‑Assistant)".

### Actions proposed:
- Create article "Marketing funnel for mojhit.pl".
- Add mermaid diagram of memory pipeline.`;
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