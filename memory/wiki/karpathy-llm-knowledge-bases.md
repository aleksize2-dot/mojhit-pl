---
title: "Karpathy's LLM Knowledge Bases Philosophy"
aliases: [karpathy-memory, llm-wiki]
tags: [memory-architecture, karpathy, llm, wiki]
sources:
  - "raw/Thread by @karpathy.md"
created: 2026-04-10
updated: 2026-04-10
---

# Karpathy's LLM Knowledge Bases Philosophy

*Summary of Andrej Karpathy's Twitter thread (2026-04-02) on using LLMs to build personal knowledge bases.*

## Core Workflow (Three‑Stage Pipeline)

1. **Raw Data Collection** (`raw/` directory)
   - Source documents: articles, papers, repos, datasets, images.
   - Tools: Obsidian Web Clipper (converts web articles to `.md`), hotkey to download images locally.

2. **LLM‑Driven Compilation** (`wiki/` directory)
   - LLM incrementally "compiles" a wiki — a collection of `.md` files with summaries, backlinks, categorization into concepts, and inter‑article linking.
   - **Key insight:** The LLM writes and maintains all wiki content; human rarely edits manually.

3. **IDE / Frontend** (Obsidian)
   - View raw data, compiled wiki, derived visualizations.
   - Plugins for alternative views (e.g., Marp for slides).

## Why Traditional RAG Isn't Needed (At Personal Scale)

- At ~100 articles / ~400K words, LLM auto‑maintains index files and brief summaries.
- LLM reads relevant data directly from the structured index — no vector similarity search required.
- RAG becomes necessary only at much larger scales (~2,000+ articles).

## Query & Output Patterns

- Complex questions → LLM researches answers within the wiki.
- Output formats: markdown files, slide shows (Marp), matplotlib images, etc.
- **Compounding knowledge:** Query outputs are filed back into the wiki, enhancing it for future queries.

## Linting & Health Checks

- LLM‑run checks to find inconsistent data, impute missing data (via web search), suggest new article candidates.
- Goal: incremental cleanup and improved data integrity.

## Tooling & Automation

- Develop custom CLI tools (e.g., naive search engine) that can be handed to the LLM as a tool.
- Natural progression: synthetic data generation + fine‑tuning to embed knowledge into model weights.

## Connection to Our Implementation

- **Raw stage:** `raw/` folder with README (identical).
- **Compilation stage:** `memory/wiki/` + nightly cron compiler (`daily‑memory‑compiler`).
- **IDE:** Obsidian vault pointed at workspace (already set up).
- **Index‑based retrieval:** `MEMORY.md` as master catalog, `memory_search` for semantic fallback.
- **Linting:** Weekly `scripts/health‑check.js` (pending full implementation).

## Key Quotes

> "A large fraction of my recent token throughput is going less into manipulating code, and more into manipulating knowledge (stored as markdown and images)."

> "I thought I had to reach for fancy RAG, but the LLM has been pretty good about auto‑maintaining index files..."

> "You rarely ever write or edit the wiki manually, it's the domain of the LLM."

---
*Source: [[raw/Thread by @karpathy.md]]*