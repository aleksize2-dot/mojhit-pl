# Memory Architecture (LLM Wiki / Karpathy-style)

- **Philosophy:** Adopted Andrey Karpathy's "second brain" approach: plain text files as the sole long-term memory, with the LLM acting as an autonomous librarian (reading, summarizing, categorizing, cross-linking).
- **Current State (2026-04-10):**
  - Transitioned to **LLM Wiki pattern**. `MEMORY.md` serves as Schema/Index. Knowledge is stored in `memory/wiki/`.
  - **OpenViking:** Fully removed – binary process stopped, plugin folder deleted. API was unstable (`fetch failed`).
  - **LightRAG:** Removed (container deleted).
  - **Active Engine:** File-based LLM Wiki with semantic search via Gemini embeddings (`memory_search`).
- **Three-Stage Pipeline:**
  1. **Raw Dump:** `raw/` folder created with README.md (Immutable sources).
  2. **Compilation/Ingest:** LLM reads new sources, updates wiki pages, cross-references, logs to daily.
  3. **Interface:** OpenClaw as the interactive librarian.
- **Health-Check / Linting:** Weekly cron task (`0 3 * * 0`) runs `scripts/health-check.js`, scanning memory for gaps/orphan pages/broken links and logging suggestions to daily notes. (Configured in `openclaw.json` under `cron.tasks`).

### Model Resilience & Switching
- **Knowledge files (`memory/wiki/`) are model‑agnostic** — plain text readable by any LLM.
- **Semantic search (`memory_search`)** currently uses Gemini embeddings; can be switched if needed.
- **Nightly compiler (`daily‑memory‑compiler`)** uses the default agent model (configurable).
- **Automatic flush (session capture):** Planned script `flush‑memory.js` to capture conversation summaries periodically, completing the Karpathy‑style pipeline.
- **MEMORY.md** remains universal index regardless of model.