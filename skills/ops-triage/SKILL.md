---
name: ops-triage
description: Triage operational inputs (inbox, calendar, tasks, heartbeats) into prioritized action queues with explicit ownership and deadlines.
version: "1.0.0"
---

## Install

Active for Black agent. Requires heartbeat/cron context and task awareness.

# Ops Triage Skill

## Priority Model

| Level | Criteria | Response |
|-------|----------|----------|
| P1 | Urgent + high impact (server down, payment failure, security alert) | ACK immediately, escalate to Blacksize |
| P2 | Important but not urgent (SEO audit, deploy checklist, code review) | Batch in next planning cycle |
| P3 | Low impact / backlog (docs cleanup, nice-to-have features) | Group for async cleanup |

## Output Requirements

For each item:

```
- priority: P1/P2/P3
- owner: <agent or human>
- deadline: <timebox or "none">
- action type: reply | schedule | delegate | archive
- rationale: <one line why>
```

## SLA Rules

- **P1** — acknowledged within 5 min, Blacksize notified
- **P2** — batched in next heartbeat cycle
- **P3** — grouped, surfaced in daily summary only

## Triage Triggers

- New unread messages in priority channels
- Server health alerts
- Calendar events within 2h
- Deploy failures
- Security warnings

## Escalation

Silent item > 24h without action → auto-escalate to Blacksize with "stale triage" flag.
