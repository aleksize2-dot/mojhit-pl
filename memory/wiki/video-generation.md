# Video Generation (All Tiers)

## Decision (2026‑04‑21)
- Persona feature postponed due to 15‑day storage limit at provider.
- Focus shifted to video generation for PRO tier as exclusive feature.
- Timeline: Audio generator completed → video generation implemented next day.

## API Specification (Kie.ai MP4)
- **Endpoint:** `POST /api/v1/mp4/generate`
- **Input:** `taskId` (audio generation task) + `audioId` (database audio ID)
- **Branding:** Optional `author` and `domainName` watermark
- **Output:** Video optimized for social media (TikTok, Reels, Shorts)
- **Storage:** Videos retained for 14 days (acceptable for PRO feature)
- **Callback system:** Similar to audio generation (webhook)

## Database Schema
- **Table:** `video_tasks`
- **Columns:**
  - `id` (UUID, primary key)
  - `task_id` (text, unique) – Kie.ai task identifier
  - `audio_id` (UUID, references `tracks.id`)
  - `status` (text) – pending, processing, completed, failed
  - `video_url` (text, nullable)
  - `expires_at` (timestamptz) – 14 days after generation
  - `created_at`, `updated_at`
- **Indexes:** on `task_id`, `audio_id`, `status`
- **RLS policies:** Enable for authenticated users (PRO only)

## Backend Module (`video.js`)
- **Functions:**
  - `generate(taskId, audioId)` – calls Kie.ai API, stores task in DB
  - `getTaskStatus(taskId)` – polls Kie.ai status
- **Integration:** Uses same authentication as audio (Bearer token)

## Endpoints
- `POST /api/video/generate` – PRO users only (checks `subscription_tier`)
- `GET /api/video/status/:id` – polling + webhook support
- `POST /api/webhooks/kie/video` – callback handler (updates `video_url`, `status`)

## Frontend Integration
- "Create video" button next to audio tracks (PRO users only)
- Displays video status (pending, processing, completed)
- Download link for generated video (expires after 14 days)

## Admin Panel
- **Subscription tier display & editing** – added "Tarif" column in Users table
- **Track playback** – added "Odtwarzaj" column in Tracks moderation table
- Future: Video task moderation

## Business Impact
- **All tiers** – video generation available for every user (Free, VIP, Legend)
- **Watermark distinction** – Free tier has watermark; VIP/Legend get watermark-free
- **Marketing angle** – "Turn your AI music into viral videos"
- **User retention** – Users creating videos less likely to churn
- **Growth loop** – Video with mojhit.pl watermark → viral sharing → new users

## 2026-04-28 Change: Video доступно для всех тарифов
- Убрана проверка `subscription_tier` в `POST /api/video/generate`
- Добавлена кнопка "Generuj wideo" на странице `TrackDetail.tsx`
- Polling статуса каждые 5 секунд через `GET /api/video/status/:dbId`
- Pricing (Cennik.tsx) обновлён: Free показывает "Generuj wideo do utworów"

### Watermark Logic (2026-04-28)
- **Free tier** → `author: 'mojhit.pl'`, `domainName: 'mojhit.pl'` (водяной знак)
- **VIP / Legend** → параметры не передаются (чистое видео, без ватермарки)
- Логика на бэкенде: `user.subscription_tier` проверяется перед вызовом Kie API
- Ценник отражает: Free — "Generuj wideo", VIP/Legend — "MP4 bez znaku wodnego"

## Fixed Bugs (2026-04-28, 8 issues resolved)

1. **`audioId` mismatch** — Kie.ai API expects Suno audio ID (UUID), not Kie `task_id`. Implemented 3-level fallback:
   - (a) `suno_id:xxx` from KIE `task_variants` tags
   - (b) Base64-decode Suno audio ID from `musicfile.kie.ai/` URL
   - (c) `kie_record_info` KIE internal API call
   - (d) Kie `task_id` as last fallback

2. **Webhook code check** — Kie callback sends `code: 0` for success (not `200`). Now accepts both.

3. **Video status parser** — Kie returns `successFlag: "SUCCESS"` (not `status`), and video URL is in `response.videoUrl` (nested object). Fixed parser.

4. **Audio CORS** — `musicfile.kie.ai` CDN doesn't set CORS headers. Added `/api/proxy/audio` endpoint on backend to proxy audio streams.

5. **Same video for V1/V2** — Both variants shared `kie_tasks.id`. Fixed: key video by `kie_track_variants.id` per variant.

6. **Duplicate video tasks** — Added dedup check: skip generation if video already exists for this variant.

7. **Missing variant 2 tracks** — `audio_url` was null in callback; `stream_audio_url` had the actual URL. Fixed fallback to use `stream_audio_url`.

8. **Audio on track page blocked** — Tracks with `processing` status blocked video generation. Relaxed check to allow video gen for processing tracks.

## Auto-Video Generation (2026-04-28)
- **Webhook trigger:** After track completion (first variant), webhook automatically triggers video generation.
- **No user action needed** — video starts generating as soon as the audio track is ready.
- **Status polling:** Frontend polls `/api/video/check?audio_task_id=&variant_index=` to check existing videos.

## Proxy Endpoint
- **`GET /api/proxy/audio?url=...`** — CORS proxy for `musicfile.kie.ai` audio streams. Used by frontend audio player when KIE CDN blocks direct cross-origin access.

## Critical Bug Fixes (2026-05-14)

### Missing Migration — `tracks.video_url`
- **Root cause:** `tracks.video_url` column did not exist — migration never applied
- **Fix:** Migration applied, video polling added (15s), backfill for existing tracks

### Video Callback 403
- **Root cause:** Video callback URLs were sent without `?token=`
- **Fix:** All 5 callback locations updated to include webhook token

### Foreign Key Constraint
- **Root cause:** `video_tasks_audio_task_id_fkey` constraint blocked variant-specific audio IDs
- **Fix:** Constraint dropped to allow per-variant video tasks

### NOT NULL Violation in Polling
- **Root cause:** `audio_task_id` in polling query did not select `user_id`
- **Fix:** Added `user_id` to the SELECT to satisfy NOT NULL constraint

### Auto-Video Wrong audioId
- **Root cause:** `audioId` passed as MP3 URL instead of Suno audio ID
- **Fix:** Corrected to pass `suno_id` from the variant record

### V1/V2 Same Video
- **Root cause:** Hardcoded `variant_index = 0` in API query
- **Fix:** Fixed in both API (proper variant index) and frontend (`TrackDetail.tsx`)

## Persisting Issues (2026-04-28)
- **Variant 2 reliability:** Webhook callback for second variant doesn't arrive reliably (ngrok tunnel instability). Only 1 of 2 variants created. Manual fix needed.
- **Auto-video 422:** Kie API returns HTTP 422 "already exists" when re-requesting a video. Fixed to handle gracefully (treated as success).

## Auto-Video Enhancements (2026-04-29)

### Video Callback Now Updates Track
- **Video callback** (`/api/webhooks/kie/video`) — now updates the track's `audio_url` with the video URL when video completes. The track effectively becomes a video track.
- **Track detail** (`GET /api/tracks/:id`) — now returns `video_url`, `video_thumbnail_url`, `video_status` by cross-referencing `video_tasks` via `kie_task_id` and `kie_track_variants`.
- **MyTracks spinner fix** — stale video tasks (>30 min) no longer show spinning `progress_activity` icon.

### /api/video/check Enhancements
- Now searches both `kie_tasks.id` and `kie_track_variants.id`
- Returns `processing` status while video is being generated
- `useGeneratorLogic.ts` waits for `completed` status (not just `variants.length > 0`)

### Webhook Guard
- Out-of-order callbacks: ignores late `first` callbacks after `complete` has already been processed
- 422 "already exists" handled gracefully (treated as success)

### Active Video Provider (2026-04-29)
- **Primary:** `sunoapi.org` (priority 2, enabled) — more reliable callbacks
- **Fallback:** `kie.ai` (priority 1, enabled)
- Both support the same MP4 generation API structure

## Testing
- **Test endpoints:** `POST /api/test‑generate‑video` (no auth), `GET /api/test‑video‑status/:id`
- **Successful test:** Video task started with Kie.ai task ID `a28eb500621b68b526ad449a675c26cb`
- **Database record:** `9293bc17‑c3b3‑4e21‑9dcd‑f57e16ee9322`