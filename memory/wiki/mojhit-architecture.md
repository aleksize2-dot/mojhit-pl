# Architecture (Vibe Coding Stack)

- **Frontend:** React + TailwindCSS (Vercel/Pages). Mobile-first, sticky bottom nav, fat footer for SEO, Consent Mode v2 (Cookie Banner).
- **Backend:** Node.js/Express, deployed on VPS.
- **Database:** Supabase (PostgreSQL).
- **Auth:** Clerk (Social Login, Email).
- **Storage:** Cloudflare R2 (for MP3/Audio).
- **Payments:** Stripe (BLIK support is critical for PL).

### Project Location
- **Current workspace:** `C:\Users\Admin\.openclaw\workspace\raw\MH` (monorepo)
- **Client:** React + TypeScript + Vite + Tailwind (Clerk auth)
- **Server:** Node.js/Express + Supabase + Clerk + Svix
- **Suno‑API:** Python library/API bridge for Suno AI generation
- **Video Generation:** Kie.ai MP4 API wrapper (`video.js`) for PRO tier video generation
- **Monorepo scripts:** `npm run dev` runs client+server concurrently via `concurrently`

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

### Video Generation Support (PRO Tier)

- **Decision (2026‑04‑21):** Persona feature postponed; focus on video generation for PRO tier.
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

### Performer Linking (AI Performers)

- **UI Terminology:** "Producenci" renamed to "Wykonawcy" (Performers/Artists) across the UI.
- **AI Performers:** Three AI performers available: CJ Remi, MELO MC, Kosa (stored in `producers` table).
- **Linking Tracks to Performers:** When generating a track via chat with an AI performer, the `personaId` is sent from frontend (`Generator.tsx`) to backend, stored in `kie_tasks.persona_id`, and used to set `tracks.producer_id`.
- **API Enhancement:** `GET /api/tracks/:id` now returns full producer data (name, badge, img, gradient, theme_config) and user data (email, clerk_id).
- **Frontend Changes:**
  - `TrackDetail.tsx`: Performer name is clickable, linking to main page with `?agent` parameter to open chat with that performer. Displays user login (email prefix) alongside performer.
  - `Generator.tsx`: Handles `?agent` query parameter to auto-select performer.
  - `MyProducers.tsx`: Page where users can "fire" and "hire" AI performers; hidden state stored in `localStorage`.
- **Database Schema:** Added `producer_id` column to `tracks` table (references `producers`), and `persona_id` column to `kie_tasks` table.