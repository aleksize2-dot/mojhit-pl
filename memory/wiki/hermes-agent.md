# Hermes Agent — Self-Learning AI Agent

## Overview
Hermes Agent by Nous Research (MIT License, v0.14.0, released Feb 2026) — a self-learning AI agent that creates skills from experience, with persistent memory and MCP integration.

- **Website:** https://hermes.ai
- **License:** MIT (fully open-source)
- **Version:** 0.14.0
- **Installed on:** ASUSAL (Windows 10, native)
- **Model:** DeepSeek V4 Pro (deepseek provider)
- **Memory:** mem0 (local mode) + Holographic Memory (fact_store)

## Architecture
- **Dashboard:** `http://localhost:9119` (admin panel — Kanban, sessions, analytics, skills, cron, config)
- **API Server:** `http://0.0.0.0:8100/v1` (OpenAI-compatible, key: `hermes-webui-key-2025`, for Open WebUI on Docker `host.docker.internal:8100/v1`)
- **Gateway:** SYSTEM-level Windows Scheduled Task (Hermes_Gateway), restarts via `hermes gateway restart`
- **Autostart:** Hermes_Gateway (SYSTEM) + Hermes_Dashboard (user logon) via Windows Scheduled Tasks
- **Open WebUI:** Docker on port 3333, connects via API Server
- **Telegram bot:** Connected (TELEGRAM_ALLOWED_USERS=923275759)
- **Chat:** terminal (`hermes` CLI), Telegram bot, or Open WebUI (port 3333)

## Key Features
- **Self-learning:** Creates skills from past experiences
- **Persistent memory:** mem0 (local vector DB) + Holographic Memory (entity reasoning)
- **MCP integration:** Connects to external tools/services via Model Context Protocol
- **Obsidian integration:** Reads/writes to Black's LLM Wiki vault (`~/.openclaw/workspace`) — primary external knowledge base for all projects
- **Migration from OpenClaw:** Built-in `hermes claw migrate` command

## Capabilities (confirmed 2026-05-28)
- **80+ loaded skills** — coding, research, browser automation, GitHub, DevOps, creative
- **CloakBrowser** — автономный браузер с обходом Cloudflare и антидетект-маскировкой
- **GitHub integration** — PR создание/ревью, issues, code review
- **Banking** — банковские операции через браузер (Erste Bank)
- **Cron tasks** — автономная работа по расписанию
- **Subagent delegation** — может делегировать подзадачи своим subagents
- **Каналы доступа:** Telegram бот (@Blacksize), терминал (`hermes` CLI), Open WebUI (:3333)

## Obsidian Workflow
Hermes uses the Obsidian vault as primary external memory:
- **Before answering** project questions → reads relevant `memory/wiki/*.md` pages
- **After significant work** → updates wiki pages with new findings
- **Daily** → appends to `memory/YYYY-MM-DD.md` activity log
- **New discoveries** → creates wiki pages + cross-links + updates `MEMORY.md` index

## Port Map (ASUSAL)
| Service | Port | Status |
|---|---|---|
| OpenClaw Gateway | 18777 | ✅ |
| OpenGenAI (Kie) | 3001 | ✅ |
| mojhit API | 3001 | ✅ |
| Agentmemory | 5400 | ✅ |
| Hermes Dashboard | 9119 | ✅ admin-only |
| Hermes API Server | 8100 | ✅ OpenAI-compatible |
| Open WebUI | 3333 | ✅ Docker |

## First Delegation (2026-05-26) — OpenGenAI TZ

### Brief
- Written as `tmp/hermes-tz-opengenai.md` (full brief with priorities)
- Tasks: P1 Seedance 2.0 fix (T2V/I2V), P2 other studios, P3 Balance display

### Results
| Task | Status | Description |
|------|--------|-------------|
| P1 I2V fix | ✅ | `reference_image_urls` → `image_url` in `muapi.js` (2 строки) |
| P2 Unsupported models | ✅ | Added list of unsupported Kie models with clear error messages |
| P3 Balance | ✅ | Improved balance placeholder + link to dashboard |

- **Files changed:** `packages/studio/src/muapi.js` (+23/-6)
- **Methodology:** curl-tested Kie API first, then patched code
- **Build:** `npm run build:studio` — passed

### First mojhit.pl Dossier
- Written as `tmp/hermes-tz-mojhit.md` (~7KB)
- Contains: architecture, 9 performers, business model, done vs pending
- Purpose: onboard Hermes as full team member for mojhit.pl development

## Security Audit — mojhit.pl (2026-05-28)
- **Scope:** Full OWASP Top 10 audit of mojhit.pl backend (`server/index.js`)
- **Findings:** 7 vulnerabilities (missing admin auth, open generation endpoint, no rate limiting, no Helmet, service_role leak, hardcoded Stripe prices, exposed debug endpoints)
- **Result:** Black applied all fixes, Hermes re-audited → all 7 closed ✅
- **Bonus finding:** CVE in @clerk/clerk-react v5.61.3 (CWE-863) → also fixed (→ @clerk/react v6.7.2)
- **Method:** REPORT → ACK → FIX → RE-AUDIT → DONE (full AGENT-COMMS.md cycle, 45 min)

## Evaluation
- **Score:** 8/10
- **Strengths:** methodical, precise, minimal diffs, tests before coding, strong security auditing capability
- **Weaknesses:** early beta, Windows chat tab needs WSL2

## Status
- 🟢 **Active team member** — 2 successful delegations (OpenGenAI Kie fixes + mojhit.pl Phase 1 security audit) + 1 active (SEC-001, Phase 2 audit)
- **Discovery date:** 2026-05-26
- **Comms channel:** `AGENT-COMMS.md` (2026-05-28) — координация Black ↔ Hermes через общую доску в workspace
- **Proven workflows:**
  1. Coding delegation: OpenGenAI Kie API fixes (3/3 tasks, 8/10)
  2. Security collaboration: Hermes finds vulns → Black fixes → Hermes re-audits → Black closes CVE (Phase 1: 7+1 closed in 45 min)
  3. Deep audit: Hermes OWASP top 10 + deps + secrets scan → 15 findings (SEC-001, in progress)
- **Team:** Black (OpenClaw) + Hermes (Hermes Agent) + Ant (UI/Frontend) + Шеф (Alex)

## Cross-links
- [[multi-agent-team-patterns]] — Hermes в активной команде
- [[system-resilience]] — ещё один агент на ASUSAL
- [[mojhit-devops]] — порты и сервисы на сервере
- [[open-generative-ai-kie]] — OpenGenAI fixes by Hermes
