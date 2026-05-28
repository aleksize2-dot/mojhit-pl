# Open Generative AI + Kie.ai — Integration

## Overview
Open-source AI studio (200+ models) for image/video/audio generation. Fork of [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) with **Kie.ai API provider** (25-49% cheaper than Muapi).

- **Repo:** `aleksize2-dot/open-generative-ai-kie`
- **Local:** `C:\Users\Admin\open-generative-ai-kie`
- **Start:** `npm run dev` → `http://localhost:3001/studio` (порт 3001 — чтобы не конфликтовать с mojhit API на :3000)
- **Rebuild studio pkg:** `npm run build:studio`
- **Stack:** Next.js 15 + React 19 + Vite 5 + Tailwind 4 + Electron

## Architecture
```
browser (localhost:3000)
  └─ StandaloneShell.js (Settings: provider selector)
       └─ Studio components (from packages/studio/dist/)
            └─ muapi.js (provider-aware submit/poll)
                 ├─ Muapi: /api → Next.js proxy → api.muapi.ai
                 └─ Kie: direct → https://api.kie.ai
```

## Key Files Modified
| File | Changes |
|---|---|
| `components/StandaloneShell.js` | Provider selector in Settings |
| `components/ApiKeyModal.js` | Kie+Muapi links |
| `packages/studio/src/muapi.js` | Provider-aware submit/poll, upload, queue |
| `src/lib/kieClient.js` | Fixed model names, auth, endpoints |

## Provider Detection
- `localStorage.api_provider` = `"kie"` | `"muapi"`
- Kie auth: `Authorization: Bearer <key>`
- Muapi auth: `x-api-key: <key>`

## Kie API Endpoints
- Submit: `POST https://api.kie.ai/api/v1/jobs/createTask`
- Poll: `GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=`
- Upload: `POST https://kieai.redpandaai.co/api/file-base64-upload`
- Files live 3 days on Kie temp storage

## Verified Kie Models
| App Model | Kie Model | Status |
|---|---|---|
| Nano Banana v1 | `google/nano-banana` | ✅ |
| Nano Banana 2 | `nano-banana-2` | ✅ |
| Nano Banana Pro | `nano-banana-pro` | ✅ |
| GPT Image 2 | `gpt-image-2-text-to-image` | ✅ |
| Ideogram v2/v3 | `ideogram/v3-text-to-image` | ✅ |
| Seedream v4 | `bytedance/seedream-v4-text-to-image` | ✅ |
| Seedream 4.5 | `seedream/4.5-text-to-image` | ✅ |
| Seedream 5.0 Lite | `seedream/5-lite-text-to-image` | ✅ |
| Seedance 2.0 | `bytedance/seedance-2` | ⚠️ unstable |
| Flux, SDXL, Imagen, Midjourney | — | ❌ not on Kie |

## API Keys
- App: `d9bfbe13eee289f0a12d05e407950d70` (IP-whitelisted)
- mojhit.pl: `e9ee7b9518edae610b1a95bb46365c35` (Suno/music, in `.env`)

## Known Issues
- Seedance 2.0 T2V → intermittent (Kie server instability)
- Seedance 2.0 I2V → **FIXED** (2026-05-26): `reference_image_urls` → `image_url` parameter name in muapi.js
- Balance check: improved placeholder with link to dashboard (2026-05-26)
- Other studios (Audio, LipSync, Cinema, Workflows, Agents) not tested
- Concurrency limited to 2 for Kie

## Nano Banana 2 I2I Fix (2026-05-28)
- **Symptom:** HTTP 422 when selecting images with Nano Banana 2 (I2I mode)
- **Root causes (2):**
  1. **localStorage persistence bug** — restored model without checking compatibility with current mode (I2I vs T2I)
  2. **Wrong field name** — code sent `image_url`/`image_urls`, but Kie API expects `image_input` for Nano Banana 2
- **Fixes:**
  - `muapi.js`: added `isNanoBanana` branch → `kieBody.input.image_input` for I2I mode
  - `ImageStudio.jsx`: model validation on localStorage restore — checks compatibility with current mode
- **Build:** `npm run build:studio` — passed; server restarted on port 3001

## Unsupported Kie Models (2026-05-26)
Added by Hermes — clear error messages when user selects models not available on Kie:
- Flux variants (Pro, Dev, Schnell)
- SDXL / Stable Diffusion
- Imagen 3
- Midjourney (all variants)
- Sora / Kling / Pika (video models — only Seedance available)

## Cross-links
- [[mojhit-architecture]] — mojhit.pl also uses Kie.ai for music
- [[mojhit-devops]] — ngrok tunnel for Kie webhooks
- [[supabase-schema]] — kie_task_id in tracks table
