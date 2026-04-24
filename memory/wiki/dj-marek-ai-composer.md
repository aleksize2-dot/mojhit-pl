# DJ Marek AI Composer - Architecture

## Overview
**DJ Marek** is an AI producer persona (38 years old, from Szczecin, Polish slang) that helps users generate song prompts for Suno AI within the MojHit.pl platform. The composer chat interface allows users to describe a song idea, and DJ Marek transforms it into a structured prompt with title, tags, and lyrics.

## Client Component (`client/src/components/Generator.tsx`)
- **Chat Interface:** Real-time conversation with DJ Marek (AI Producer persona).
- **Flow:** Chat → AI generates `---TITLE---`, `---TAGS---`, `---LYRICS---` → preview → payment → Suno generation.
- **Currency:** 1 coin / 10 notes / BLIK-Card (in development).
- **Polling:** Exponential backoff (3s → 5s → 8s → 12s → 15s cap), up to ~120 requests instead of 300.
- **Suno Model:** V5_5, custom mode.
- **Track Variants:** Saved in `kie_track_variants`, downloadable via `?variant=N`.
- **UI Features:** 
  - **Markdown Rendering:** Supports `[Verse]`, `[Chorus]`, `[Bridge]` highlighted bold with primary color; `**bold**` works.
  - **Typing Indicator:** "DJ Marek pisze..." with animated dots and pulsing indicator.
  - **File Attachment Handler:** Attach file button works (limit 10MB, shows badge, filename, delete button).
  - **Improved Timeout Message:** Shows estimated time "(~12 min)" in error message.
  - **Send Message Validation:** Allows sending with file attachment without text.

## Server (`server/index.js`)
### Endpoints
- **`/api/chat-composer`:** OpenRouter → `anthropic/claude-3.5-sonnet`, max 1500 tokens.
- **`/api/suno/generate`:** Forward generation request to Kie.ai API.
- **`/api/suno/status/:id`:** Poll Suno task status.
- **`/api/webhooks/kie`:** Webhook for Kie.ai callbacks.
- **`/api/admin/mark-expired`:** Mark expired tracks (protected by `requireAdmin` middleware that checks `ADMIN_USER_IDS` from environment variable).
- **`/api/admin/cleanup-expired`:** Cleanup expired tracks (protected by `requireAdmin` middleware).

### AI Composer Logic
- **System Prompt:** DJ Marek persona, algorithm 2–3 exchanges → generation, limit 10 messages.
- **Copyright Protection:** Two‑layer:
  1. **System prompt** instructs not to mention real artists.
  2. **Server‑side regex** replaces artist names with `[artysta]`.
- **Balance:** Deduction of coins/notes before generation; transactions logged.

### Authentication & Data
- **Clerk Auth:** Middleware + webhooks (`user.created/updated/deleted` → Supabase).
- **Admin Middleware:** `requireAdmin` function checks `ADMIN_USER_IDS` environment variable (comma-separated Clerk user IDs). If variable not set, allows all authenticated users (backward compatibility).
- **Supabase Tables:**
  - `users` (sync from Clerk)
  - `tracks`
  - `kie_tasks`
  - `kie_track_variants`
  - `transactions`

## Infrastructure
- **Frontend Dev Server:** Vite (`http://localhost:5173`).
- **Backend Server:** Express (`http://localhost:3000`).
- **Concurrency:** Both processes run in parallel via `concurrently`.

## Implemented Improvements (2026‑04‑16)

### Client‑Side Improvements
1. **Markdown Rendering** – `[Verse]`, `[Chorus]`, `[Bridge]` highlighted bold with primary color; `**bold**` works.
2. **Typing Indicator** – "DJ Marek pisze..." with animated dots and pulsing indicator.
3. **File Attachment Handler** – Attach file button works (limit 10MB, shows badge, filename, delete button).
4. **Exponential Backoff Polling** – Polling intervals: 3s → 5s → 8s → 12s → 15s cap, reducing requests from ~300 to ~120.
5. **Improved Timeout Message** – Shows estimated time "(~12 min)" in error message.
6. **Send Message Validation** – Allows sending with file attachment without text.

### Server‑Side Improvements
7. **Admin Middleware (`requireAdmin`)** – Checks `ADMIN_USER_IDS` environment variable (Clerk user IDs). Backward compatibility: if variable not set, allows all authenticated users.

## Potential Improvements
1. **Real‑time Updates:** WebSocket/SSE instead of polling for generation status.
2. **Admin Role Check:** Add role verification for admin endpoints (already partially implemented via `requireAdmin` middleware; could add granular roles).
3. **Polling Timeout:** Current 5‑minute timeout could be shortened.
4. **Middleware Order:** `express.raw()` for Clerk webhook, then `express.json()` – potential conflict.

## Related Documentation
- [[dj-marek-copyright|DJ Marek Copyright & Ownership]]
- [[mojhit-architecture|Architecture (Vibe Coding Stack)]]
- [[mojhit-economics|Business Model & Economics]]
- [[regulamin|Regulamin (Terms of Service)]]

---
*Обновлено: 2026-04-16, дополнено 2026-04-19*