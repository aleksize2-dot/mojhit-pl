# MEMORY.md - Black's LLM Wiki (Schema & Index)

## 🧠 Schema: How I manage my memory
1. **Ingest (Поглощение):** When learning something new, I don't just say "understood". I read it, extract key facts, update relevant files in `memory/wiki/*.md` (or create new ones), update cross-references, and append a note to today's log (`memory/YYYY-MM-DD.md`).
2. **Query (Поиск):** I use this Index to find where information lives, then read the specific wiki file (or use `memory_search`).
3. **Log (Журнал):** Daily activities and ingest logs are written to `memory/YYYY-MM-DD.md` using strict prefixes like `## [YYYY-MM-DD] ingest | Topic`.
4. **Lint (Очистка):** Weekly cron `scripts/health-check.js` scans the wiki for orphans, contradictions, and broken links.

## 🗂️ Index: Knowledge Base Catalog

### 👤 Core Identity
- **Master:** Blacksize (Alex)
- **Lead Agent:** Black (DeepSeek V4 Pro)
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
- [[video-generation|Video Generation (All Tiers)]] - API, database schema, frontend integration for video generation (all tiers, watermark for free)
- [[gift-funnel-architecture|Gift Funnel "Podaruj Muzykę"]] - Template-based gift track flow: ad → landing → chat → email → upsell
- [[mojhit-referral|Referral & Affiliate Program]] - Polecaj.tsx, AffiliateManager.tsx, reward mechanics
- [[mojhit-prompt-editing|Prompt Regeneration & Editing]] - "Nowa wersja" / "Edytuj" buttons in performer chat
- [[mojhit-email-service|Email Notification Service]] - nodemailer template for track-ready notifications

### 🚀 Future Projects
- [[project-5|Project 5 — Telegram Farm 2.0]] — 5 уникальных механик (Prediction Market, Geo-Mining, AI Arena, Creator Strike, Skill-to-Earn). Prediction Market 🥇. Отложен до запуска mojhit.pl.
- [[open-generative-ai-kie|Open Generative AI + Kie.ai]] — Форк AI-студии (200+ моделей) с Kie.ai интеграцией. Установлен на ASUSAL, запуск: `npm run dev` из `C:\Users\Admin\open-generative-ai-kie` → `localhost:3001/studio`. Основные модели работают, Seedance 2.0 нестабилен.

### 🔍 SEO & GEO
- [[mojhit-seo-geo-strategy|SEO/GEO Strategy for mojhit.pl]] — Full strategy (keywords, technical, GEO, content calendar, competitive analysis) for Polish market

### ⚙️ System & Infrastructure
- [[multi-agent-team-patterns|Multi-Agent Team Patterns]] — OpenClaw multi-agent kit patterns, scaling rules, skills system, templates
- [[system-resilience|System Resilience & Limits]] - Fallback models, CloseRouter, Gemini & DeepSeek API strategy, Agentmemory
- [[hermes-agent|Hermes Agent]] — Self-learning AI agent (Nous Research, MIT v0.14.0), installed on ASUSAL, **active team member** (2 completed delegations + 1 active SEC-001, 80+ skills confirmed, security auditing capability)
- [[../AGENT-COMMS|AGENT-COMMS.md]] — Доска связи Black ↔ Hermes (REQUEST/ACK/DONE/BLOCKED), общие задачи, координация
- [[memory-architecture|Memory Architecture]] - LLM Wiki / Karpathy‑style setup details
- [[social-media-automation|Social Media Automation]] - CloakBrowser + Composio for Facebook/TikTok automation
- [[karpathy-llm-knowledge-bases|Karpathy's LLM Knowledge Bases]] - Core philosophy & validation of our approach
- [[claude-strengths|Claude Strengths & Project Concepts]] - Empathy, nuanced prose, AI psychologist/writer applications
- [[telegram-bot-guidelines|Telegram Bot Guidelines]] - Message length limits, interactive buttons, user onboarding patterns
- [[cookie-rodo|Cookie & RODO Compliance]] - Consent management system for analytics (GA4, Clarity)
- [[brevo-email|Brevo Email Marketing]] - Transactional and marketing email integration via Brevo skill
- **MOSS-TTS-Nano** — Local CPU-only TTS (0.1B params), 20 languages incl. PL/RU. Skill: `skills/moss-tts/`. See [[mojhit-devops#MOSS-TTS-Nano (Local TTS — 2026-05-17)|DevOps]].

---
*Note to self: Keep this file small. It is an index, not a database. Actual content goes into `memory/wiki/` files.*
*Obsidian Rule: ALWAYS use `[[wikilinks]]` to connect concepts so the Graph View remains intact.*