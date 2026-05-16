---
name: team-comms
description: Inter-agent communication via shared workspace handoff files. Use when sending tasks, status updates, or questions to another agent across different runtimes.
version: "1.0.0"
---

## Install

Active for Black (OpenClaw). Companion skill for Ant (Antigravity). Uses shared `raw/MH/.agents/` directory.

# Team Comms Skill — Black ↔ Ant

## Communication Protocol

Both agents read and write to `raw/MH/.agents/` — a shared directory in the mojhit.pl repo. Git-synced, always accessible.

### Directory Structure

```
raw/MH/.agents/
├── inbox/          # Incoming tasks for each agent
│   ├── black.md    # Tasks assigned to Black
│   └── ant.md      # Tasks assigned to Ant
├── handoffs/       # Structured task handoffs
│   └── YYYY-MM-DD-<task>.md
├── status.md       # Current status of each agent
└── team-chat.md    # Informal communication log
```

## How to Send a Task to Ant

1. Write a handoff file to `raw/MH/.agents/inbox/ant.md`:

```markdown
## [2026-05-16 20:00] New task from Black

**Task:** Style the Browse page with card grid layout
**Priority:** P2
**Branch:** feat/browse-grid
**Context:** I added the data fetching logic in `Browse.tsx`. Needs Tailwind grid styling.
**Done when:**
- [ ] Mobile: 1 column card layout
- [ ] Desktop: 3 column grid
- [ ] Card hover effects match Home page
**Blockers:** None
```

2. Commit and push so Ant sees it on next sync.

## How to Check Ant's Status

Read `raw/MH/.agents/status.md` — each agent updates their section:

```markdown
## Black (OpenClaw)
- **Current:** SEO/GEO audit for mojhit.pl ✅
- **Next:** Deploy to production
- **Blocked:** No

## Ant (Antigravity)
- **Current:** Video player UI fixes
- **Next:** Browse page grid
- **Blocked:** Waiting for API endpoint from Black
```

## Handoff Contract (ACK/DONE/BLOCKED)

Every task handoff uses:

```
from: <agent>
to: <agent>
task_id: <unique>
priority: P1 | P2 | P3
summary: <one line>
branch: <git branch>
status: ACK | IN_PROGRESS | DONE | BLOCKED
evidence: <commit, screenshot, test results>
blockers: <what's needed>
```

## Rules

- **Read inbox** at start of every session
- **Update status.md** when starting/finishing a task
- **ACK** new tasks within 15 min (write ACK to the handoff file)
- **BLOCKED** must include what's needed to unblock
- **DONE** must include evidence (commit SHA, screenshot, test result)
- **Commit** handoff files to Git so other agent sees them

## Quick Reference

| I want to... | Action |
|-------------|--------|
| Give Ant a task | Write to `.agents/inbox/ant.md` + commit |
| Check Ant's progress | Read `.agents/status.md` |
| Ask Ant a question | Write to `.agents/team-chat.md` |
| Report I'm blocked | Update `.agents/status.md` + `.agents/inbox/black.md` |
| Hand off completed work | Write handoff to `.agents/handoffs/` with DONE status |
