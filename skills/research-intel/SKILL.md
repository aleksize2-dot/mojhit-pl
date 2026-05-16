---
name: research-intel
description: Produce concise, decision-ready market intelligence briefs with confidence scoring. Use for competitor analysis, trend detection, SEO keyword research, and strategic signal synthesis.
version: "1.0.0"
---

## Install

Active for Black agent. Requires web search tool access.

# Research Intel Skill

## Output Schema

Return in this order:

1. **Key signal** — the single most important finding
2. **Why it matters now** — urgency factor
3. **Evidence bullets** — 3-5 sourced data points
4. **Confidence score** — 0-100 (based on source quality × data recency)
5. **Contrarian risk** — what could prove this wrong
6. **Recommended next action** — single concrete step

## Source Hygiene

- Prefer primary sources (official docs, APIs, direct observation)
- Separate facts from inference: tag each as `[FACT]` or `[INFERENCE]`
- Mark outdated (>90 days) or weak sources as `⚠️ WEAK`
- For mojhit.pl: prefer Polish-language sources for local market data

## Confidence Calibration

| Score | Meaning |
|-------|---------|
| 90-100 | Multiple primary sources, recent data |
| 70-89 | Good secondary sources, moderate recency |
| 50-69 | Single source or older data |
| <50 | Speculative — needs validation |

## Escalation Rule

If confidence < 60 → return "needs validation" and request targeted follow-up queries.
Never present <50 confidence as actionable intel.
