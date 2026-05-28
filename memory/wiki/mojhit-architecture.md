# Architecture (Vibe Coding Stack)

- **Frontend:** React + TailwindCSS (Vercel/Pages). Mobile-first, sticky bottom nav, fat footer for SEO, Consent Mode v2 (Cookie Banner).
- **Backend:** Node.js/Express, deployed on VPS.
- **Database:** Supabase (PostgreSQL) — `urzodvosleauddnfxqio.supabase.co`.
- **Auth:** Clerk (Social Login, Email).
- **Storage:** Cloudflare R2 (for MP3/Audio).
- **Payments:** Stripe (BLIK support is critical for PL).

### Project Location
- **Current workspace:** `C:\Users\Admin\.openclaw\workspace\raw\MH` (monorepo)
- **Client:** React + TypeScript + Vite + Tailwind (Clerk auth) — `raw\MH\client\`
- **Server:** Node.js/Express + Supabase + Clerk + Svix — `raw\MH\server\index.js` (port 3000)
- **Suno‑API:** Python library/API bridge for Suno AI generation (active provider: sunoapi.org)
- **Video Generation:** Kie.ai MP4 API wrapper (`video.js`) — now available for ALL tiers
- **Monorepo scripts:** `npm run dev` runs client+server concurrently via `concurrently`
- **Documentation:** `raw\MH\docs\` (producer profiles, gift funnel spec, video gen spec)
- **KIE docs:** `raw\MH\KIE\` (copied reference files)

### Payments
- **Stripe:** Direct integration via existing secret key in server `.env`. No third-party wrapper skills.
  - Decision (2026-04-24): Stripe API skill from Maton was installed then **removed** — prefer direct Stripe calls.
  - BLIK support critical for Polish market.

### Local Development
- **Frontend (Vite):** Runs on port 5173
- **Backend (Node.js/Express):** Runs on port 3000
- **Ngrok tunnel:** Used for backend exposure with static domain (`fetal-hydroxide-wobbly.ngrok-free.dev`) to preserve webhook bindings (Clerk, KIE).
- **Note:** Local servers may require process cleanup; kill stuck processes and restart.

### API Endpoints

- `POST /api/tracks/:id/like` – increments like counter (requires authentication)
- `POST /api/tracks/:id/delete` – soft‑delete track (sets `expired = true`; requires owner)
- `GET /api/tracks/:id/variants` – returns track variants from `kie_track_variants` (public)
- `GET /api/tracks/recent` – returns recent tracks with cover images
- `GET /api/tracks/my` – returns user's own tracks with cover images
- `GET /api/tracks/:id` – returns single track with cover image, producer data, and user data

All cover image endpoints now include `cover_image_url` field.

### Cover Image Support

- **Database column:** `tracks.cover_image_url` (TEXT, nullable) added via SQL script `add_cover_image.sql`.
- **Source:** KIE webhook copies `image_url` from `kie_tasks` to `tracks.cover_image_url` when tracks are generated.
- **Frontend:** RecentTracks.tsx, MyTracks.tsx, and TrackDetail.tsx display cover images with hover effects and play/pause overlays.
- **Future steps:** Embed covers into MP3 files using node-id3, generate custom covers via DALL-E/OpenRouter.

### Admin Roles & Permissions API (RBAC)

**Added 2026-04-23** — Role-based access control for admin panel.

- `GET /api/admin/users/:userId/roles` — Fetch roles assigned to a specific admin user
- `POST /api/admin/users/:userId/roles` — Assign a role to a user (checks for duplicates)
- `DELETE /api/admin/users/:userId/roles/:roleId` — Revoke a role from a user

**Database tables:** `admin_roles`, `admin_permissions`, `user_admin_roles` (see `supabase-schema.md`).

**Frontend:** AdminDashboard.tsx tab "Role i Uprawnienia" — full CRUD with categorized permission toggles, user role management modal.

### Generator.tsx Refactoring (2026-04-28)
- **Before:** Single `Generator.tsx` file ~1200 lines (mixed UI + logic).
- **After:** Split into two files:
  - `useGeneratorLogic.ts` (879 lines) — ALL logic: state management, API calls, TTS, video, effects, event handlers. Maintained by Black (backend/logic).
  - `Generator.tsx` (650 lines) — Pure UI skeleton calling the hook. Maintained by Ant (UI/coder).
- **Commit:** `d1b1b5e` (part of 2026-04-28 batch).
- **Benefit:** Zero merge conflicts, clean separation of concerns.

### ElevenLabs TTS Integration
- **Module:** TTS handler in Node.js backend — calls ElevenLabs API per producer voice.
- **Voice config:** Stored in `producers.theme_config.elevenlabs_voice` (JSON field).
- **Per-producer voices:** Melo MC → Liam, Kosa → Roger, La Luz → Liam, CJ Remi → River.
- **"Bez głosu":** Empty/null voice silently skips TTS.
- **Bugs fixed:** `node-fetch` v3 ESM import issue; timeout increased 30s→60s; voice extraction from `theme_config`.
- See [[mojhit-agents|AI Performers]] for full voice mapping details.

### Email Notification Service

- **Module:** `emailService.js` — uses `nodemailer` for sending track-ready notification emails
- **Trigger:** KIE webhook callback after first successful track variant
- **Template:** mojhit.pl branded (gradient #ff9064 → #734bbd, Inter font)
- **Status:** Ready, **SMTP not configured** — set `SMTP_HOST/PORT/USER/PASS` in `.env` to activate
- See [[mojhit-email-service|Email Notification Service]] for full details

### Prompt Editing & Regeneration

- **Frontend (`Generator.tsx`):** "Nowa wersja" (regenerate) and "Edytuj" (manual edit) buttons below generated song prompts
- **Backend (`index.js`):** `POST /api/chat-composer` accepts `regenerate: true` parameter
- See [[mojhit-prompt-editing|Prompt Regeneration & Editing]] for full details

### Referral & Affiliate Program

- **Frontend:** `Polecaj.tsx` (3-step refer flow) + `AffiliateManager.tsx` (dashboard with 4 metrics)
- **Database:** `referral_rewards`, `affiliate_earnings`, `users.referral_code`, `users.referred_by`, `users.is_affiliate`
- See [[mojhit-referral|Referral & Affiliate Program]] for full details

### Producer Prompt Architecture (2026-05-17)

**Source of Truth:** Supabase `producers.system_prompt` field is the **primary** source for producer prompts.
- **Runtime flow:** `/api/chat-composer` → reads `producers.system_prompt` from Supabase → sends to LLM.
- **Fallback:** `server/producers/*.js` files are **secondary** — only used when Supabase is unreachable.
- **Sync rule:** After updating prompts in Supabase admin panel, sync the corresponding JS fallback file.
- **Never rely on JS files as primary** — they are stale-safety nets, not the canonical prompt.

### Active Suno Provider (2026-04-29)

**Provider switch:**
- **Primary (active):** `sunoapi.org` (enabled, priority 2 in API settings)
- **Fallback:** `kie.ai` (enabled, priority 1)
- **Reason:** More reliable callbacks, same API structure.
- **Config:** API key set in `.env` (`SUNO_API_KEY`); settings updated in Supabase `api_settings` table.

### Video Generation Support (All Tiers, 2026-04-28)

- **Decision (2026‑04‑21):** Persona feature postponed; focus on video generation for PRO tier.
- **2026-04-28 change:** Video generation now available for **ALL** subscription tiers (Free, VIP, Legend), not just PRO.
  - Free tier: watermark (`mojhit.pl`) on video.
  - VIP/Legend: clean video, no watermark.
- **Auto-video:** Webhook triggers video generation automatically after first variant completes.
- **Check endpoint:** `GET /api/video/check?audio_task_id=&variant_index=` — check if video already exists for a variant.
- **CORS proxy:** `GET /api/proxy/audio?url=...` — backend proxy for KIE CDN audio (no CORS headers on `musicfile.kie.ai`).
- **API:** Kie.ai MP4 generation endpoint `POST /api/v1/mp4/generate`; input `taskId` + `audioId`; optional branding watermark; output optimized for social media (TikTok, Reels, Shorts).
- **Storage:** Videos retained for 14 days; users can download.
- **Database:** Table `video_tasks` (SQL migration `add_video_tasks.sql`) with columns `id`, `task_id`, `audio_id`, `status`, `video_url`, `expires_at`, etc.; RLS policies.
- **Module:** `video.js` – wrapper with `generate()` and `getTaskStatus()`.
- **Endpoints:**
  - `POST /api/video/generate` – PRO users only (checks `subscription_tier`).
  - `GET /api/video/status/:id` – polling + webhook support.
  - `POST /api/webhooks/kie/video` – callback handler.
- **Frontend:** "Create video" button next to audio tracks.
- **Admin panel:** Added subscription tier display & editing, track playback functionality.
- **Business impact:** PRO tier differentiation, viral growth loop via watermark.

### Video Callback & Track Enhancements (2026-04-29)

- **Video callback** (`POST /api/webhooks/kie/video`) — now updates the track's `audio_url` with the video URL when video completes. Track effectively becomes video.
- **Track detail** (`GET /api/tracks/:id`) — now returns `video_url`, `video_thumbnail_url`, `video_status` by looking up `video_tasks` via `kie_task_id` and `kie_track_variants`.
- **MyTracks spinner fix** — stale video tasks (>30 min) no longer show spinning `progress_activity` icon.

### Security Hardening (2026-05-28)

**Full OWASP Top 10 audit by Hermes → 7 vulnerabilities found, all 7 closed + 1 CVE fixed.**

#### Server Hardening (server/index.js)

1. **Admin endpoint protection** — `requireAuth()` + `requireAdmin()` middleware on all 16 admin endpoints:
   - `GET/PUT /api/admin/settings/*`, `GET /api/admin/logs`, `GET /api/admin/stats`, `GET/PUT /api/admin/users/*`
   - `GET /api/admin/tracks`, `PUT /api/admin/tracks/:id/moderate`, `GET /api/admin/permissions`
   - `GET/POST/PUT/DELETE /api/admin/roles`, `GET/POST/DELETE /api/admin/user/:id/roles`, `GET /api/admin/my-permissions`
   - `GET/POST/PUT /api/admin/promo-codes`
2. **Suno generation auth** — `requireAuth()` + `generationLimiter` (5 req/min) on `/api/suno/generate` (was open to public)
3. **Rate limiting (4 levels):**
   - `apiLimiter`: 100 req/15min (public GET endpoints)
   - `generationLimiter`: 5 req/min (Suno/audio generation)
   - `authLimiter`: 20 req/15min (auth endpoints)
   - `chatLimiter`: 10 req/min (chat-composer, support)
4. **Helmet** — All security headers: HSTS, X-Frame-Options, X-Content-Type-Options, CSP, etc.
5. **Supabase client split** — `supabaseAnon` (anon_key) for public queries; `supabaseService` (service_role) for admin-only
6. **Stripe price IDs → .env** — `STRIPE_PRICE_20COINS`, `STRIPE_PRICE_50COINS`, `STRIPE_PRICE_150COINS`, `STRIPE_PRICE_VIP`, `STRIPE_PRICE_LEGEND`
7. **Debug/test endpoint protection** — `requireAuth()` + `requireAdmin()` on `/api/debug/*` and `/api/test-*`

#### Additional fixes:
- **OPENROUTER_API_KEY leak** — suppressed in logs (shows 'present' instead of key prefix)
- **CORS hardening** — removed local IP wildcards, use `FRONTEND_URL` from `.env`
- **New dependencies:** `helmet`, `express-rate-limit`

#### Client CVE Fix
- **@clerk/clerk-react v5.61.3 → @clerk/react v6.7.2** — CWE-863 authorization bypass (CVE)
- Migration across 19 client files (main.tsx, Header, Generator, Sidebar, all pages)
- npm audit: 4 → 3 vulnerabilities, CVE closed

**Re-audited by Hermes — all 7 server vulns confirmed closed. Ready for deploy.**

⚠️ **Phase 2 Audit (SEC-001, 2026-05-28 ~18:30):** Hermes conducted deeper scan — found 15 additional issues:
- **3 CRITICAL:** hardcoded service_role key in `migrations/run.js` (committed to git), npm audit with CVSS 9.1 (@clerk/shared), all Supabase queries use service_role (bypass RLS)
- **6 HIGH:** `/api/users` + `/api/transactions` without auth, `/api/support/chat` + `/api/chat-composer` without auth, error.stack leak to clients, debug logs leak secrets, CSP disabled in Helmet
- **6 MEDIUM:** `client/.env` committed to git, missing .gitignore for .env, no CSRF protection
- **Status:** 🔵 REQUEST → ACK pending. Task SEC-001 in AGENT-COMMS.md. Quick fixes estimated at 15 min.

See also: [[mojhit-devops#Security Hardening|DevOps — Security]]

### Bugfixes & Guards (Ант's fixes, merged 2026-04-29)

- **Admin bypass for track deletion** — admins can delete any track regardless of ownership.
- **Guest session merge fix** — fixed UUID vs `clerk_id` bug on user registration (guest-to-account merge).
- **Out-of-order webhook guard** — ignores late `first` callbacks after `complete` has been processed.
- **`useGeneratorLogic.ts`** — waits for `completed` status, not just `variants.length > 0` (empty array bug).
- **`/api/video/check`** — searches both `kie_tasks.id` and `kie_track_variants.id`, returns `processing` status.

### Performer Linking (AI Performers)

- **UI Terminology:** "Producenci" renamed to "Wykonawcy" (Performers/Artists) across the UI.
- **AI Performers:** Three AI performers available: CJ Remi, MELO MC, Kosa (plus La Luz, stored in `producers` table).
- **Linking Tracks to Performers:** When generating a track via chat with an AI performer, the `personaId` is sent from frontend (`Generator.tsx`) to backend, stored in `kie_tasks.persona_id`, and used to set `tracks.producer_id`.
- **API Enhancement:** `GET /api/tracks/:id` now returns full producer data (name, badge, img, gradient, theme_config) and user data (email, clerk_id).
- **Frontend Changes:**
  - `TrackDetail.tsx`: Performer name is clickable, linking to main page with `?agent` parameter to open chat with that performer. Displays user login (email prefix) alongside performer.
  - `Generator.tsx`: Handles `?agent` query parameter to auto-select performer.
  - `MyProducers.tsx`: Page where users can "fire" and "hire" AI performers; hidden state stored in `localStorage`.
- **Database Schema:** Added `producer_id` column to `tracks` table (references `producers`), and `persona_id` column to `kie_tasks` table.