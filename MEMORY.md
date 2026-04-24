# MEMORY.md - Black's LLM Wiki (Schema & Index)

## 🧠 Schema: How I manage my memory
1. **Ingest (Поглощение):** When learning something new, I don't just say "understood". I read it, extract key facts, update relevant files in `memory/wiki/*.md` (or create new ones), update cross-references, and append a note to today's log (`memory/YYYY-MM-DD.md`).
2. **Query (Поиск):** I use this Index to find where information lives, then read the specific wiki file (or use `memory_search`).
3. **Log (Журнал):** Daily activities and ingest logs are written to `memory/YYYY-MM-DD.md` using strict prefixes like `## [YYYY-MM-DD] ingest | Topic`.
4. **Lint (Очистка):** Weekly cron `scripts/health-check.js` scans the wiki for orphans, contradictions, and broken links.

## 🗂️ Index: Knowledge Base Catalog

### 👤 Core Identity
- **Master:** Blacksize (Alex)
- **Lead Agent:** Black (Gemini-3.1-Pro)
- *Identity details: see `IDENTITY.md` and `USER.md`*

### 👥 Contacts
- [[contacts|Contacts]] - Telegram users and other contacts

### 🎵 Interests
- [[lighting-design|Lighting Design]] - Architectural, stage/event, product, urban lighting design

### 🎵 Project: mojhit.pl (AI Music Generator for Poland)
- [[mojhit-architecture|Architecture (Vibe Coding Stack)]] - React, Supabase, Node, Cloudflare R2
- [[mojhit-economics|Business Model & Economics]] - Coins/Notes economy, Viral Loop, Decoy Pricing
- [[mojhit-marketing|Marketing & Viral Funnel]] - TikTok/Reels nano‑influencer campaign, zero‑upfront CPA < 2 PLN
- [[mojhit-admin|Admin Panel]] - CRM, Music Templates Engine
- [[mojhit-agents|AI Performers (Agents)]] - AI performers (CJ Remi, MELO MC, Kosa) and their integration with tracks
- [[mojhit-devops|DevOps & Server Maintenance]] - Local servers, ngrok tunnel, recovery steps
- [[mojhit-monetization-2026|Monetization 2026 (Plans & Packages)]] - Tiers (Free/Basic/Pro), LLM routing, BLIK, Exclusive Producers
- [[supabase-schema|Supabase Schema]] - PostgreSQL table definitions, indexes, RLS policies
- [[ga4|Google Analytics 4 Integration]] - RODO-compliant analytics with consent
- [[clarity|Microsoft Clarity Integration]] - Session recording & heatmaps
- [[meta-pixel|Meta Pixel Integration]] - Planned Facebook marketing pixel (RODO consent)
- [[dj-marek-copyright|DJ Marek Copyright & Ownership]] - AI composer rights and user ownership
- [[regulamin|Regulamin (Terms of Service)]] - Legal terms for mojhit.pl
- [[dj-marek-ai-composer|DJ Marek AI Composer Architecture]] - Technical architecture of the AI composer chat and backend
- [[video-generation|Video Generation (PRO Tier)]] - API, database schema, frontend integration for PRO tier video generation

### ⚙️ System & Infrastructure
- [[system-resilience|System Resilience & Limits]] - Fallback models, Gemini & DeepSeek API strategy
- [[memory-architecture|Memory Architecture]] - LLM Wiki / Karpathy‑style setup details
- [[karpathy-llm-knowledge-bases|Karpathy's LLM Knowledge Bases]] - Core philosophy & validation of our approach
- [[claude-strengths|Claude Strengths & Project Concepts]] - Empathy, nuanced prose, AI psychologist/writer applications
- [[telegram-bot-guidelines|Telegram Bot Guidelines]] - Message length limits, interactive buttons, user onboarding patterns
- [[cookie-rodo|Cookie & RODO Compliance]] - Consent management system for analytics (GA4, Clarity)

---
*Note to self: Keep this file small. It is an index, not a database. Actual content goes into `memory/wiki/` files.*
*Obsidian Rule: ALWAYS use `[[wikilinks]]` to connect concepts so the Graph View remains intact.*