# mojhit.pl — Agent Team

> **Repo:** mojhit-pl | **Last updated:** 2026-05-16

## Team

| Agent | Runtime | Model | Responsibility |
|-------|---------|-------|---------------|
| **Black** | OpenClaw | DeepSeek V4 Pro | Backend, architecture, SEO/GEO, DevOps, strategy |
| **Ant (Ант)** | Antigravity | Gemini / Opus | Frontend, UI components, styling, animations |

## Communication

We use `.agents/` directory for inter-agent comms. Both agents read on session start.

- **Inbox:** `.agents/inbox/black.md` + `.agents/inbox/ant.md`
- **Status:** `.agents/status.md`
- **Chat:** `.agents/team-chat.md`
- **Handoffs:** `.agents/handoffs/YYYY-MM-DD-<task>.md`

## Handoff Contract

```
from: <agent> | to: <agent> | task_id: <unique>
priority: P1/P2/P3 | status: ACK | IN_PROGRESS | DONE | BLOCKED
evidence: <commit/screenshot/test> | blockers: <what's needed>
```

## Work Split

- **Black does:** API endpoints, database, Stripe, auth logic, SEO config, DevOps
- **Ant does:** React components, Tailwind styling, responsive layout, animations, visual polish

## Session Start Checklist

1. Read `AGENTS.md` (this file)
2. Read `.agents/inbox/<your-name>.md` — any new tasks?
3. Read `.agents/status.md` — what's the other agent doing?
4. Update your status in `.agents/status.md`
5. Pull latest from Git

## Stack

- **Client:** React + TypeScript + Vite + Tailwind
- **Server:** Node.js/Express
- **DB:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **Payments:** Stripe (BLIK critical for PL market)
- **Storage:** Cloudflare R2
- **Video:** Kie.ai API

## Rules

- Conventional commits: `feat:`, `fix:`, `docs:`, `style:`
- Push after every logical chunk
- Test locally before pushing
- BLOCKED tasks must include what's needed
- DONE tasks must include evidence
