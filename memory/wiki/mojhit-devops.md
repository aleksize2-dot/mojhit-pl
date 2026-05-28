# MojHit DevOps & Server Maintenance

## Local Development Servers
- **Monorepo workspace:** `raw/MH` contains `server/` and `client/`
- **Frontend (Vite):** Port 5173 (may shift to 5174 if occupied)
- **Backend (Node.js/Express):** Port 3000

## Ngrok Tunnel for Webhook Testing
- **Purpose:** Expose local backend to the internet for external webhooks (Clerk, KIE, Kie.ai video generation).
- **Static Domain:** `fetal-hydroxide-wobbly.ngrok-free.dev` (preserves webhook bindings).
- **Authentication:** Requires ngrok authtoken in config; token provided in environment.
- **Command:** `ngrok http 3000 --domain=fetal-hydroxide-wobbly.ngrok-free.dev`

## Server Recovery Steps (2026‑04‑18)
1. **Identify stuck processes:** Use `netstat -ano | findstr :3000` (Windows) or `lsof -i :3000` (Unix).
2. **Kill process:** `taskkill /PID <pid> /F` (Windows) or `kill -9 <pid>` (Unix).
3. **Restart backend:** `npm run server` or `node server.js`.
4. **Restart frontend:** `npm run dev` (client) or `npm run dev` in monorepo root.

## Provider Configuration (2026-05-14)
- **Primary audio provider:** `kie.ai` (priority 2, enabled)
- **Fallback audio provider:** `sunoapi.org` (priority 1, enabled)
- **Order swapped** from previous config (sunoapi.org was primary)
- **KIE apiKey** synced to `api_settings` (was previously empty)
- **suno_version** now actually used in generation (previously ignored — always used default)

## Webhook Security (2026-05-13)
- **Token-based verification** for all webhook endpoints:
  - `/api/webhooks/kie` — requires `?token=` in callback URL
  - `/api/webhooks/kie/video` — requires `?token=` in callback URL
  - `/api/webhooks/suno` — requires `?token=` in callback URL (created 2026-05-14)
- **Env variable:** `KIE_WEBHOOK_SECRET` in `.env`
- **Behavior:** Without token → 403, with valid token → 200
- **Suno callback URL:** Points to ngrok static domain with token

## Database Write Strategy (2026-05-14)
- **Pattern:** UPSERT → DELETE + INSERT with try/catch on duplicate (error 23505)
- **Applied to:** `kie_track_variants` and `tracks` tables
- **Scope:** All 5 write points into `kie_track_variants` protected from race conditions
- **Status endpoint:** Read-only — only webhooks and polling write status updates

## Auto-Polling Configuration (2026-05-14)
- **Track polling:** 10 seconds (was 30s)
- **Video polling:** 15 seconds (newly added)
- **Providers checked:** KIE + Suno simultaneously
- **Mechanism:** `audio_task_id` in polling now includes `user_id` to satisfy NOT NULL constraint

## Environment Configuration
- **Supabase URL:** `urzodvosleauddnfxqio.supabase.co` (updated 2026-05-17)
- **`.env` files:** Added `SUNO_CALLBACK_BASE_URL`, `SUNO_WEBHOOK_SECRET`, `KIE_WEBHOOK_SECRET`
- **Webhook URLs:** Update external services (Clerk, KIE, Suno) to point to ngrok domain if changed.
- **Ngrok static domain:** `fetal-hydroxide-wobbly.ngrok-free.dev` (config fixed v2→v3 on 2026-05-13)

## Monitoring
- Check ngrok dashboard for tunnel status.
- Verify backend health via `GET /health` endpoint.
- Ensure frontend can connect to backend (CORS configured).

## MOSS-TTS-Nano (Local TTS — 2026-05-17)

- **Tool:** [MOSS-TTS-Nano](https://github.com/OpenMOSS/MOSS-TTS-Nano) — 0.1B params, CPU-only TTS
- **Installation:** Python 3.12 (winget), pip package `moss-tts-nano`
- **CLI:** `moss-tts-nano generate` — outputs WAV files
- **OpenClaw Skill:** `skills/moss-tts/` with `speak.ps1` PowerShell script
- **Languages:** 20 languages including Polish and Russian
- **Use:** Local voice output for Black (storytelling, audio notes, voice replies)
- **Python:** 3.12 installed via winget alongside existing 3.10

## Security Hardening (2026-05-28)

- **New dependencies:** `helmet` (security headers), `express-rate-limit` (4 levels of rate limiting)
- **Stripe env vars added to `.env`:** `STRIPE_PRICE_20COINS`, `STRIPE_PRICE_50COINS`, `STRIPE_PRICE_150COINS`, `STRIPE_PRICE_VIP`, `STRIPE_PRICE_LEGEND`
- **Supabase client split:** `supabaseAnon` (anon_key) for public queries, `supabaseService` (service_role) for admin operations
- **CORS:** restricted to `FRONTEND_URL` from `.env` (local IPs removed)
- **Clerk CVE:** `@clerk/clerk-react` v5.61.3 → `@clerk/react` v6.7.2 (client-side, 19 files migrated)
- **Audit:** Hermes conducted OWASP Top 10 audit (7 vulns found, all closed). Re-audited — clean. See [[mojhit-architecture#Security Hardening (2026-05-28)|Architecture — Security]].

## Server Operations (2026-05-28)

- **All servers alive:** mojhit backend (:3000), frontend (:5174), OpenGenAI (:3001), Hermes Dashboard (:9119), Agentmemory (:3111)
- **Hermes Dashboard:** запущен через Windows Scheduled Task (был в состоянии Ready)
- **Agentmemory:** `npm install` + build, запущен. Version 0.9.12, status healthy
- **OpenGenAI:** port 3001, rebuilt after Nano Banana 2 fix

## Known Issues
- Local server processes may hang after system sleep; script auto‑restart planned.
- Ngrok free tier domains rotate; consider upgrading for permanent domain.
- `config.patch` for `skills.entries` in OpenClaw 2026.4.22 triggers `size-drop` bug (28K→9.6K). Workaround: env variables instead of config patch for sensitive data.
- **Variant 2 webhook unreliability** — KIE webhook callback for the second track variant doesn't arrive reliably due to ngrok tunnel instability. Only 1 of 2 variants is created in many cases. Manual intervention required.
- **Auto-video 422** — Kie API returns HTTP 422 "already exists" if video was already generated. Fixed to handle gracefully (treated as success).
- **Producer name missing** — (Fixed 2026-04-28) Tracks created via frontend `/api/tracks` didn't set `producer_id`. Now properly linked.

## 🐛 Incident Log

### 2026-04-28: Commit d1b1b5e — All fixes pushed
- All 8 video generation bugs, ElevenLabs TTS fixes, Generator.tsx refactoring, and frontend fixes pushed to `origin/main`.
- Collaborator workflow: Black (logic, backend, architecture) + Ant (UI, frontend components).

### 2026-05-13: Server Refactoring
- Removed duplicate `require('./video')` in auto-video block of `server/index.js`
- Removed duplicate `app.use(express.json())`
- Fixed `/api/debug/kie-webhook-simulate` endpoint
- Ngrok config fixed: v2→v3 syntax

### 2026-05-14: Working Session with Ant
- **Video system overhaul:** 6 critical bugs fixed (see [[video-generation|Video Generation]] for full list)
- **Backend hardening:** UPSERT→DELETE+INSERT for all track variant writes, suno_version now used, Kie apiKey synced
- **Server files modified:** `index.js` (webhook, polling, generate), `video.js` (unified for KIE+Suno), `suno.js` (callback URL with token, 404 suppression), `kie.js` (404 suppression)
- **Client files modified:** `useGeneratorLogic.ts` (broken JSON guard, Moje Utwory message), `TrackDetail.tsx` (variant_index fix, .json() guard), `ProducerManager.tsx` (model catalog updated)

### 2026-04-28: Auto-video fix
- **Issue:** Auto-video generation failed with HTTP 422 "already exists" from Kie API.
- **Fix:** Added 422 handling — treat as success (video already exists for this variant).

### 2026-04-27: KIE API — Windows curl.exe JSON issue

### 2026-04-24: Server crash — extra curly brace
- **Root cause:** A stray `}` in `raw/MH/server/index.js` at line 1265 (leftover from admin panel refactoring on 2026-04-23).
- **Impact:** Backend crashed on startup.
- **Fix:** Removed the extra `}`. Both backend (:3000) and frontend (:5174) restored.
- **Lesson:** Always `npm start` locally after merging refactoring changes before deploying.

### 2026-04-27: KIE API — Windows curl.exe JSON issue
- **Symptom:** `curl.exe` on Windows sends JSON with incorrect formatting to KIE API, causing request failures.
- **Root cause:** Windows `curl.exe` treats JSON body differently than Node.js `fetch`.
- **Fix:** Use Node `fetch` (or explicit `--data-raw` with proper escaping in curl) instead of plain `curl.exe`.
- **Lesson:** Test API calls via the actual Node.js runtime, not Windows curl.exe.

### 2026-04-29: Wrong project folder incident
- **Issue:** Work was done in `E:\mojhit\MH\` (old copy) instead of `C:\Users\Admin\.openclaw\workspace\raw\MH\` (real project).
- **Resolution:** Deleted `E:\MH\` (backup) and `E:\mojhit\MH\` (old copy).
- **Related:** `taskkill /F /IM node.exe` accidentally killed ALL node processes including OpenClaw. Server and Vite restarted.
- **Lesson:** Verify working directory before making changes; use targeted process kill instead of blanket `taskkill`.

### 2026-04-29: Ант's Python script break
- **Issue:** Stray `}` broke `try/catch` structure in Python script.
- **Fix:** Manually removed the extra brace.

### 2026-04-27: Bugfix bundle (Gift Funnel prep patch)
1. **PUT /api/admin/producers** — Added `delete updates.stats` because virtual `stats` field prevented saving producer data.
2. **POST /api/tracks** — Fixed empty `audio_url` sent from frontend when status was 'completed' but no tracks existed yet.
3. **Generator.tsx** — Fixed `variants.length` check instead of `variants` — empty array is truthy in JS, causing skipping of empty-variant state.

### 2026-04-22: config.patch size-drop
- **Symptom:** Using `config.patch` in OpenClaw config to set `skills.entries` caused config to shrink from ~28K to ~9.6K.
- **Root cause:** Bug in OpenClaw 2026.4.22 config patching system.
- **Workaround:** Set sensitive/API data via environment variables instead.

## Backup Strategy

- **Daily backups** of SQL scripts, modified code files, and documentation are stored in `backup/YYYY-MM-DD/`.
- **2026‑04‑20:** Created comprehensive backup in `backup/2026-04-20/` containing SQL scripts, modified code files, and documentation of all changes.
- Backups include schema migration scripts, cover image implementation, and OpenClaw configuration fixes.