---
name: coding-handoff
description: Standardize coding handoffs with ACK/DONE/BLOCKED status, branch metadata, and PR readiness gates. Use when a coding task moves across stages (build → review → deploy) or when delegating to a coding subagent.
version: "1.0.0"
---

## Install

Active for Black agent. Requires `sessions_send` or `sessions_spawn` for inter-agent handoffs.

# Coding Handoff Skill

## Required Handoff Envelope

All handoff messages use this schema:

```
from: <agent>
to: <agent>
task_id: <unique-id>
priority: P1 | P2 | P3
summary: <one-line>
context: branch=<branch>, commit=<sha>, env=<env>
done_when: <checklist>
deliver_to: <topic/channel>
```

## Lifecycle

1. **ACK** — posted within 5 min of receiving task. Includes: ownership, ETA, scope confirmation.
2. **Execute** — scoped checks: lint, type-check, test, security scan.
3. **DONE** — with evidence (test results, diff summary, deployment notes).
   **BLOCKED** — with explicit unblock requirements (what data/access/decision is needed).

## PR Readiness Gate

Before DONE, verify:
- [ ] Lint passes
- [ ] Type check passes
- [ ] Tests pass
- [ ] No regression risk markers
- [ ] Rollback plan noted
- [ ] Unresolved TODOs listed

**If any gate fails → BLOCKED, not DONE.**

## Escalation

After 3 blocked cycles on same task → escalate to Blacksize (Alex) with full context.
