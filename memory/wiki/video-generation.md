# Video Generation (PRO Tier)

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

## Testing
- **Test endpoints:** `POST /api/test‑generate‑video` (no auth), `GET /api/test‑video‑status/:id`
- **Successful test:** Video task started with Kie.ai task ID `a28eb500621b68b526ad449a675c26cb`
- **Database record:** `9293bc17‑c3b3‑4e21‑9dcd‑f57e16ee9322`