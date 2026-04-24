# raw/ – Karpathy‑style memory dump

This folder is the **first stage** of the three‑stage memory pipeline (Raw → Compilation → Interface).

## Purpose

Dump **any** raw material here:
- Articles (PDF, HTML, markdown)
- Web clips (saved via browser extensions)
- Screenshots, diagrams
- Meeting notes, brainstorming text
- API documentation, specs
- Data dumps, logs

## Rules

1. **No structure needed** – just drop files.
2. **Naming convention:** `YYYY‑MM‑DD‑description.ext` (optional but helpful).
3. **Compilation script** (`compile‑raw.js`) will periodically scan this folder, read contents, call LLM to summarize/categorize, and write structured notes to `memory/YYYY‑MM‑DD.md`.
4. **After processing**, files can be archived (move to `raw/archive/`) or deleted.

## Pipeline

```
raw/ → [LLM compiler] → memory/ daily logs → [curation] → MEMORY.md
```

## Health‑check

The weekly health‑check (`health‑check.js`) will also look at raw/ to identify untapped knowledge domains.

---

**Inspired by Andrey Karpathy's "second brain" architecture.**