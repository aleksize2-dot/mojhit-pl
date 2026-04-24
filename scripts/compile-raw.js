#!/usr/bin/env node

/**
 * compile-raw.js
 * 
 * Karpathy‑style memory compiler.
 * 
 * Reads files from `raw/`, uses LLM (Gemini/DeepSeek) to generate summaries,
 * categorizes them, and writes structured notes to `memory/` (daily files)
 * and updates `MEMORY.md` with curated knowledge.
 * 
 * Run manually or via cron.
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const RAW_DIR = path.join(__dirname, '..', 'raw');
const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const MEMORY_FILE = path.join(__dirname, '..', 'MEMORY.md');

async function listRawFiles() {
    try {
        const files = await fs.readdir(RAW_DIR, { withFileTypes: true });
        return files
            .filter(dirent => !dirent.isDirectory())
            .map(dirent => ({
                name: dirent.name,
                path: path.join(RAW_DIR, dirent.name),
                ext: path.extname(dirent.name).toLowerCase()
            }));
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`Raw directory ${RAW_DIR} does not exist yet.`);
            return [];
        }
        throw err;
    }
}

async function readFileContent(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    // TODO: handle different file types (PDF, images, etc.)
    // For now, assume text files
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content.slice(0, 10000); // limit context
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err.message);
        return null;
    }
}

async function callLLM(prompt, content) {
    const configPath = path.join(process.env.USERPROFILE || process.env.HOME, '.openclaw', 'openclaw.json');
    const configText = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configText);

    const defaultModel = config.agents?.defaults?.model || "google/gemini-3.1-pro-preview";
    console.log(`Using model: ${defaultModel}`);
    const fullText = prompt + "\n\n" + content;

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

async function compileFile(file) {
    console.log(`Compiling ${file.name}...`);
    const content = await readFileContent(file.path);
    if (!content) return null;

    const prompt = `Summarize the following content (from file ${file.name}) and extract key concepts. Format as a Markdown note with tags and cross‑links to existing topics in MEMORY.md.`;
    const summary = await callLLM(prompt, content);

    // Write to today's memory file
    const today = new Date().toISOString().split('T')[0];
    const dailyFile = path.join(MEMORY_DIR, `${today}.md`);
    await fs.appendFile(dailyFile, `\n## Raw import: ${file.name}\n${summary}\n`, 'utf-8');

    // TODO: update MEMORY.md with curated insights
    return summary;
}

async function main() {
    console.log('Starting raw compilation...');
    const files = await listRawFiles();
    if (files.length === 0) {
        console.log('No raw files to compile.');
        return;
    }

    for (const file of files) {
        await compileFile(file);
    }

    console.log('Compilation complete.');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { listRawFiles, compileFile };