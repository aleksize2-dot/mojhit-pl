# Telegram Bot Guidelines

## Message Length Limits
- **Telegram message limit:** ~4096 characters per message (including markdown formatting).
- **Problem:** Long-form content (comprehensive guides, research documents) often exceed this limit.
- **Solution:** Send condensed version highlighting key principles, then offer detailed sections via interactive buttons (inline keyboard).
- **Pattern:** "Here's the summary. Click buttons below for deep dives on [topic1], [topic2], ..."

## Interactive Elements
- **Buttons (inline keyboard):** Use for choices (e.g., domain selection, focus areas) to keep conversation structured.
- **Button labels:** Clear, concise, use emojis for visual cue.
- **Callback data:** Keep small (<64 bytes) – use short codes (e.g., "architectural_lighting").

## User Onboarding
- **/start command:** Respond with introduction and main options (buttons) to immediately engage.
- **Preferences:** Ask for preferred name early; store in contacts wiki.

## Content Delivery
- **Modular content:** Break large topics into logical chunks (principles, domains, tools, resources).
- **Progressive disclosure:** Start high-level, expand on demand.
- **Cross-references:** Link to relevant wiki pages (e.g., [[lighting-design]]) for users who want deeper self‑study.

## Error Handling
- **Message too long:** If a prepared message exceeds limit, fallback to condensed version with buttons.
- **Network issues:** Retry once, then notify user of delay.
- **User confusion:** Offer clarification buttons (e.g., "Need more details?", "Start over").

## Analytics & Memory
- **Log interactions:** Ingest each user action into daily log (`memory/YYYY-MM-DD.md`).
- **Update contacts:** Add/update contact details (username, sender_id, interests) after each session.
- **Learn from patterns:** Identify common questions to pre‑package answers.

## Cross-links
- [[contacts]] - User contact management
- [[system-resilience]] - Fallback models and API limits
- [[memory-architecture]] - How logs and wiki are updated

---
*Last updated: 2026-04-13*