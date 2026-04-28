# Video Generation — mojhit.pl

## Overview

Video generation turns AI-generated audio tracks into MP4 music visualizations via **Kie.ai API**. Videos are social-media-ready (TikTok, Reels, Shorts) with animated cover art + playback bar. Not a music video per se — more like karaoke player with album art → but much more engaging than a plain timeline slider.

Stack: `Node.js/Express` backend → `Kie.ai Suno API` (music gen) → `Kie.ai MP4 API` (video from audio).

---

## Key Change (2026-04-28): Video for ALL tiers + Auto-generation

Previously video was PRO-only. Now:

| Tier | Video Generation | Watermark |
|------|-----------------|-----------|
| Free | ✅ Yes | `mojhit.pl` watermark |
| VIP/Legend | ✅ Yes | Clean, no watermark |
| Auto-gen (all) | ✅ On track completion | Per tier |

---

## Architecture

### Flow

```
1. User generates track via chat (La Luz, MELO MC, Kosa)
       ↓
2. KIE webhook callback: track created + variants stored
       ↓
3. AUTO: video generation triggered (fire & forget in webhook handler)
       ↓
4. Kie.ai processes video (30-60 sec)
       ↓
5. Frontend polls /api/video/status/:id every 5 sec
       ↓
6. Video ready → shows inline player on TrackDetail page
```

### Files changed (2026-04-28)

#### Backend

| File | Changes |
|------|---------|
| `server/index.js` | — Removed PRO tier check from video endpoints<br>— Webhook: auto-triggers video on track completion<br>— Webhook: stores `suno_audio_id` in variant tags<br>— Video generate: variants lookup by `variantIndex` (not hardcoded 0)<br>— Video generate: 3-level fallback for Suno audio ID<br>— Video generate: dedup check (reuse existing completed video)<br>— Video webhook: fixed `code !== 200` → accepts `code: 0`<br>— New `/api/video/check` endpoint (variant-aware)<br>— New `/api/proxy/audio` endpoint (CORS proxy for Kie CDN)<br>— Track creation: `audio_url` falls back to `stream_audio_url` |
| `server/video.js` | — `getTaskStatus()`: proper parsing of Kie response (`successFlag`, nested `response.videoUrl`)<br>— New `getSunoAudioId()`: fetches Suno track ID via KIE record-info API |

#### Frontend

| File | Changes |
|------|---------|
| `client/src/pages/TrackDetail.tsx` | — "Generuj wideo" button with polling<br>— Video player on completion<br>— Variant-aware video check (V1↔V2)<br>— CORS proxy for CDN audio URLs<br>— Auto-check for existing videos on variant switch |
| `client/src/pages/Cennik.tsx` | — Free tier shows "Generuj wideo do utworów" |

---

## Audio ID Resolution (the tricky part)

Kie video API requires two IDs:
- `taskId`: Kie.ai task ID (from `kie_tasks.task_id`) — always available
- `audioId`: Suno audio track ID (UUID like `e231****-...`) — NOT stored originally

### 3-level fallback for `audioId`

```
Level 1: kie_track_variants.tags → suno_id:xxx format
         ↓ (new tracks, webhook stores this)
Level 2: stream_audio_url → base64 decode from musicfile.kie.ai URL
         ↓ (older tracks with stream URLs)
Level 3: KIE record-info API → GET /api/v1/generate/record-info
         ↓ (last resort, always works)
Fallback: use task_id as-is
```

### Variant Isolation

Each track variant (V1, V2) gets its own video task. Key:
- `video_tasks.audio_task_id` = `kie_track_variants.id` (unique per variant)
- Previously was `kie_tasks.id` (shared across all variants)
- Frontend sends `variantIndex` with video generate requests

---

## Endpoints

### `POST /api/video/generate`
- Auth required
- Body: `{ audioTaskId, variantIndex? }`
- Checks for existing completed video → reuses it
- Creates `video_tasks` record keyed by variant ID
- Calls Kie video API with correct `audioId`
- Returns `{ success, dbId, videoTaskId, existing?, video_url? }`

### `GET /api/video/status/:id`
- Auth required (ownership check)
- If pending + >30s old → polls Kie for status
- Returns `{ status, video_url, thumbnail_url, ... }`

### `GET /api/video/check?audio_task_id=&variant_index=`
- Auth required
- Returns `{ status, video_url }` or `{ status: 'none' }`

### `GET /api/proxy/audio?url=`
- CORS bridge for Kie CDN audio URLs
- Whitelisted hosts: `musicfile.kie.ai`, `tempfile.aiquickdraw.com`, `cdn1.suno.ai`, `cdn2.suno.ai`
- Adds `Access-Control-Allow-Origin: *`

---

## Webhooks

### Audio callback (`/api/webhooks/kie`)
- Stores `track.id` as `suno_id:xxx` prefix in variant `tags`
- On `callbackType === 'complete'`: auto-triggers video generation

### Video callback (`/api/webhooks/kie/video`)
- Fixed: accepts `code: 0` (Kie's success code in callbacks, not 200)
- Updates `video_tasks` with `video_url`

---

## Auto-Video Generation

Triggered in webhook handler after track creation:
- **Fire & forget** — doesn't block webhook response
- Only for `callbackType === 'complete'`
- Only for first variant (variant_index 0)
- Uses same `getSunoAudioId()` fallback chain
- Skips if video already exists for this variant
- Respects watermark settings per user tier

---

## Bugs Fixed

| Bug | Symptom | Fix |
|-----|---------|-----|
| Wrong `audioId` | "Original audio parsing error" | 3-level fallback for Suno audio ID |
| Webhook code check | Callback ignored (status stayed `pending`) | Accept `code: 0` |
| Status parser | Polling never completed | Parse `successFlag`, nested `response.videoUrl` |
| Audio CORS | Browser blocks playback from Kie CDN | `/api/proxy/audio` proxy |
| Same video V1/V2 | Both variants showed identical video | Key by `kie_track_variants.id` |
| Duplicate video tasks | Multiple pending tasks per track | Dedup check + cleanup |
| Missing variant 2 | Only V1 created from callback | `audio_url` falls back to `stream_audio_url` |

---

## Performance / Cost

- Video generation costs **2 credits** per call on Kie
- Auto-video only for first variant (not all)
- Existing completed videos are reused (no double charge)
- Videos expire after 14 days (Kie storage policy)
