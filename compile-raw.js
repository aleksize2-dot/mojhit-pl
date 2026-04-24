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

const RAW_DIR = path.join(__dirname, 'raw');
const MEMORY_DIR = path.join(__dirname, 'memory');
const MEMORY_FILE = path.join(__dirname, 'MEMORY.md');

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
    // TODO: integrate with OpenClaw's LLM (Gemini/DeepSeek)
    // For now, placeholder that writes a mock summary
    console.log(`Calling LLM for: ${prompt.substring(0, 50)}...`);
    return `Summary of ${content.length} chars: ${content.substring(0, 200)}...`;
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