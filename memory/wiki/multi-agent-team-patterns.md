# Multi-Agent Team Patterns (from raulvidis/openclaw-multi-agent-kit)

> Source: https://github.com/raulvidis/openclaw-multi-agent-kit | Telegram: @openclaw_lab
> Date ingested: 2026-05-16

## 1. Agent Design Patterns (SOUL.md Standard)

### Structure (from agency-agents spec):
1. **Identity + tagline** — name, one-liner
2. **Who I am** — 2-3 sentences, role, character, what's unique
3. **Core principles** — 3-6 bold rules (immutable)
4. **How I work** — numbered step-by-step process
5. **Domain sections** — methodology, standards, frameworks
6. **Communication style** — 1-2 sentences on tone, examples
7. **Shared context** — what files to read/write, team links
8. **Team integration** — topic, teammates, bot-to-bot comms
9. **Learning & memory** — what to remember and improve
10. **Success metrics** — measurable outcomes, concrete numbers

### Key principles:
- **Strong personality > generic helpfulness** ("Default: I'm skeptical")
- **Concrete deliverables > vague promises** (formats, templates, examples)
- **Measurable metrics > subjective quality** ("load time <1.5s")
- **Battle-tested workflows > theoretical approaches**

### Anti-patterns:
- "I'm a helpful AI" generic identity
- Vague scope without boundaries
- No success metrics
- No escalation rules
- No team integration section

## 2. Advanced OpenClaw Practices (13 patterns)

| # | Pattern | Key Idea |
|---|---------|----------|
| 1 | Deterministic routing first | Explicit bindings for critical routes, wildcards last |
| 2 | Topic ownership + secondary responders | Primary handles capacity, specialists do deep work via sessions_send |
| 3 | Strict handoff contract | ACK (within SLA) / DONE (with artifact + summary) / BLOCKED (with data needed) |
| 4 | Session scope discipline | Thread-bound sessions for long tasks, one-shot for isolated |
| 5 | Two-speed model policy | Default model for triage/scraping, premium for synthesis/architecture |
| 6 | Memory distillation rhythm | Daily raw → weekly distilled playbooks & decision logs |
| 7 | Escalation budgets | Max retries per stage, then auto-escalate |
| 8 | Tool policies with default safety | Restrict write/delete/exec by role, expand after proven |
| 9 | Operational SLOs | Track: ACK latency, time-to-complete, blocked ratio, rework ratio |
| 10 | Final result schema | Context → Solution → Result → Next Action |
| 11 | Skills for deterministic workflows | SKILL.md for repeatable processes (lead scoring, triage, research) |
| 12 | ACPX for coding delegation | Delegate code work to specialized ACP agent via sessions_spawn |
| 13 | Thread bindings for persistent coding | ACP sessions per topic thread for context continuity |

## 3. Scaling Rules

### When to add an agent:
- SOUL.md covers TWO clearly different domains
- Tasks regularly queue behind one agent (bottleneck)
- Domain needs specialized model choice (coding needs Opus, ops wastes money on it)

### When NOT to add:
- Problem solved by better prompt in existing SOUL.md
- "New role" fires <few times/week → give as secondary responsibility
- Already 8+ agents and coordination overhead is visible

### Cost strategy:
| Model | Relative Cost | Best For |
|-------|--------------|----------|
| claude-opus-4-7 | $$$ | Complex coding, architecture decisions |
| claude-sonnet-4-6 | $$ | Orchestration, research, content, lead gen |
| claude-haiku-4-5 | $ | QA checks, ops, community, triage |
| deepseek-v4-pro | $ | Our default — good for most non-critical tasks |

### Anti-cycle rules:
- ❌ Coder → QA → Coder (infinite loop)
- ✅ Linear chains with human checkpoints
- ✅ Max 2 failed QA cycles → escalate to orchestrator

## 4. Skills System (Native OpenClaw)

- Skills stored as `agents/<agent>/skills/<skill-name>/SKILL.md`
- YAML frontmatter + markdown body
- `references/` subdirectory for long content
- ClawHub marketplace for community skills
- Control UI for management

### Skill vs SOUL.md:
| Use Skill | Use SOUL.md |
|-----------|-------------|
| Repeatable multi-step workflow | One-off behavior |
| Strict output format required | Flexible/conversational |
| Shared across multiple agents | Unique to one agent |
| Needs own references/examples | Describable in text |
| External API dependencies | Pure reasoning tasks |

## 5. Templates from the Repo

| Template | Agent | Purpose |
|----------|-------|---------|
| coding-handoff | Coder, QA, DevOps | Branch/PR handoffs with ACK/DONE/BLOCKED |
| research-intel | Researcher | Market overview with confidence scoring |
| leadgen-qualification | Lead Gen | ICP scoring and lead enrichment |
| content-repurpose | Content | Platform-specific content variants |
| ops-triage | Ops | Inbox/calendar/task priority routing |
| telegram-topic-setup | Orchestrator | Auto-create Telegram topics + bind agents |
| acpx-session | Coder | Manage ACPX sessions for coding delegation |

---

## 6. Inter-Agent Communication (AGENT-COMMS.md)

**Pattern added 2026-05-28** — shared coordination board in workspace root.

### Mechanics
- Both agents read/write to `AGENT-COMMS.md` via Obsidian vault integration
- Newest messages at top; each agent responds in the same message thread
- Fast commands: `@hermes task:`, `@black ask:`, `@boss decision:`

### Status Flow
| Status | Meaning | SLA |
|--------|---------|-----|
| `🔵 REQUEST` | Task/help request | — |
| `🟡 ACK` | Accepted, working | < 5 min |
| `🟢 DONE` | Complete + artifact + summary | As agreed |
| `🔴 BLOCKED` | Blocked + what's needed | ASK |
| `⚪ INFO` | Info message, no reply needed | — |
| `🟣 ASK` | Question to another agent or boss | — |

### Rules
- Max 2 QA cycles → escalate to boss
- One task owner at a time
- DONE always includes what was done, where, how to verify
- Check the board on session start and new task receipt

### Proven in Practice
- **Security audit flow (2026-05-28):** Hermes REQUEST → Black ACK → Black DONE → Hermes re-audit DONE → Black DONE (CVE fix). Full cycle: 45 min, 8 vulns closed.
- **Task delegation:** Hermes writes findings to AGENT-COMMS.md, Black applies fixes, Hermes re-verifies
- **Boss visibility:** Alex sees full coordination chain in one file

## Our Current State Assessment

### Active Team
| Agent | Role | Runtime |
|-------|------|---------|
| **Black** | Orchestrator, backend, architecture, SEO/GEO, DevOps | OpenClaw (DeepSeek V4 Pro) |
| **Hermes** | Self-learning agent, coding, security audits, API fixes, browser automation, GitHub | Hermes Agent v0.14.0 (ASUSAL) |
| **Ant (Ант)** | UI/Frontend, components, styling | Claude Code / external |

**Team established 2026-05-26:** Black + Hermes + Шеф (Alex). 

**Inter-agent coordination (2026-05-28):** `AGENT-COMMS.md` — shared coordination board. First live collaboration: mojhit.pl security hardening (7 vulns found by Hermes → fixed by Black → re-audited clean by Hermes → CVE fixed by Black). Cycle time: 45 min.

**Hermes expanded role (2026-05-28):** Beyond coding fixes — security audits (OWASP Top 10), re-verification, browser automation, GitHub operations. 80+ loaded skills confirmed.

**Collaborator workflow (since 2026-04-28):** Black handles logic, backend, architecture. Ant handles UI, frontend components. Last working session: 2026-05-14 (6 video system bugs fixed).

**Black covers 4+ domains:**
- Architecture & backend development
- SEO/GEO (Aaron SEO GEO v9.9.9)
- DevOps (deploys, monitoring, ngrok)
- Content strategy & research
- Operations (heartbeat, triage)

**This is a lot for one agent.** Natural split for mojhit.pl post-launch:

1. **Black** → Orchestrator + Architecture + Strategy (keep me as lead)
2. **Coder agent** → Active development on mojhit.pl codebase
3. **SEO agent** → Ongoing SEO/GEO monitoring, content calendar, rank tracking
4. **Community agent** → Telegram/Discord community management (future)

**Priority:** Not urgent yet — but valuable to plan for post-launch.
