# System Resilience & Limits

## Model Providers & Fallbacks (as of 2026-05-26)
- **Primary Model:** `deepseek/deepseek-v4-pro` (via DeepSeek API).
- **Fallback Models:**
  - `anthropic/claude-opus-4.7` (via OpenRouter) — verified real Opus 4.7, reliable.
  - `gemini/gemini-3.1-pro` — rate-limited (free tier, 5 RPM). Used sparingly.
  - `minimax/minimax-m2.7` (via OpenRouter).
- ~~`qwen/qwen3.6-plus`~~ — **Removed 2026-05-13:** provider, API key, aliases, and fallbacks completely purged from config.
- **Vision Model:** `ernie-4.5-vl-424b-a47b` (via OpenRouter) for image analysis.
- **Remaining providers:** DeepSeek (primary), OpenRouter (Claude Opus 4.7 + Minimax), CloseRouter (Gemini 3.5 Flash, резерв), Gemini (fallback).

## API Keys & Configuration
- **DeepSeek API Key:** stored in `openclaw.json` (models.providers.deepseek).
- **Gemini API Key:** `AIzaSyA2eTcnEoAMIwy1h5YDISsXotFAAfqDVw4`.
- **OpenRouter API Key:** stored in `openclaw.json` (models.providers.qwen).
- **Sensitive:** API keys are in config—never leak.
- **Free Models via OpenRouter:** Nemotron 3 Super (120B) free for input/output tokens; useful for fallback (removed in 2026-04-24 cleanup).
- **Tavily Search API Key:** stored as env variable (free tier, 1000 req/month). See `memory/wiki/tavily-search.md` (skill).

## Provider Changes (2026‑04‑15)
- **Qwen Provider:** switched from DashScope to OpenRouter for better pricing.
- **Web‑Search Provider:** changed from Gemini to DeepSeek (then disabled due to missing Gemini key).
- **Vision Capability:** added ERNIE 4.5 VL model via OpenRouter; awaiting testing.
- **Nemotron 3 Super:** free model discovered and integrated via OpenRouter; tested successfully.

## Provider Changes (2026‑04‑24)
- **OpenRouter as separate provider:** Previously models were mixed under `qwen` provider. OpenRouter is now a dedicated provider with `minimax/minimax-m2.7` added.
- **Nemotron cleanup:** Nemotron models removed from qwen provider (dead weight from OpenRouter).
- **DeepSeek V4 models:** `deepseek/v4-pro` and `deepseek/v4-flash` (1M context) added to catalog. **Do not use yet** — V4 Pro returns 400 `reasoning_content` error. Reverted to `deepseek/deepseek-reasoner`.
- **Tavily Search:** New search tool installed from ClawHub (`matthew77/liang-tavily-search`). Web search provider switched from Gemini to Tavily. Tested: 9 results ~3s.
- **Supabase Skill:** Installed from ClawHub (`supabase@1.0.0`). Full DB schema audit done (21 tables + 1 view + 2 RPC).
- **GA4 Analytics Skill:** Installed from ClawHub (`ga4-analytics@1.0`). **Configuration deferred** until site deployed to production server.
- **Brevo Skill:** Installed from ClawHub (`brevo@1.0`). Awaiting API key from Alex.

## DashScope International API Fix (2026‑04‑16)
- **Issue:** DashScope API key `sk-8888cdb5587248dc8771db9594f7616b` returned 401 Unauthorized due to using Chinese domain `dashscope.aliyuncs.com` instead of international domain `dashscope-intl.aliyuncs.com`.
- **Fix:** Updated `baseUrl` in OpenClaw config to `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`.
- **Testing:** Curl request succeeded, model `qwen3.6-plus` responded with reasoning content.
- **Gateway restarted** to apply changes.
- **Status:** Qwen now works correctly via Alibaba DashScope international API.
- **Fallback:** `deepseek/deepseek-reasoner` remains as backup model.

## OpenClaw Runtime Fix (2026‑04‑17)
- **Issue:** OpenClaw logs showed two errors:
  1. `ERR_MODULE_NOT_FOUND: Cannot find module '...\subagent-registry.runtime.js'`
  2. `[DEP0190] DeprecationWarning: Passing args to a child process with shell option true...`
- **Fix:** Updated OpenClaw from version **2026.4.12** to **2026.4.15** via `npm update -g openclaw`.
- **Process:**
  - Stopped Gateway (`openclaw gateway stop`)
  - Ran npm update
  - Started Gateway (`openclaw gateway start`)
- **Result:**
  - ✅ First error fixed — `subagent-registry.runtime.js` now present in `dist/`
  - ⚠️ Second error remains (DeprecationWarning from Node.js v25+). Low risk, only warning.
- **Status:** Gateway operational, OpenClaw at latest version.

## Gateway & Health
- Gateway restarts after config changes (~22.8s).
- DeepSeek API health check passed (curl test).
- Webchat and Telegram plugin `@architect_gemini_bot` loaded.
- **Web‑Search Status:** active (`tools.web.search.enabled = true`). Provider: Tavily. Uses `matthew77/liang-tavily-search` skill. Free tier: 1000 req/month.
- **Known bug:** `config.patch` for `skills.entries` causes `size-drop` error (28K→9.6K) on OpenClaw 2026.4.22. Workaround: use env variables for sensitive data instead of config patch.

## Installed Skills (2026‑04‑24)
- **Tavily Search** — `matthew77/liang-tavily-search` (ClawHub). Free tier: 1000 req/month. Replaced Gemini as web‑search provider.
- **Supabase** — `supabase@1.0.0` (ClawHub). Full DB schema audit: 21 tables + 1 view + 2 RPC functions. System env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.
- **GA4 Analytics** — `ga4-analytics@1.0` (ClawHub). **Deferred** until site deployed to production.
- **Brevo Email** — `brevo@1.0` (ClawHub). Awaiting API key from Alex.

## Known OpenClaw 2026.4.22 Bug
- `config.patch` for `skills.entries` causes `size-drop` error (28K→9.6K).
- **Workaround:** Use env variables for sensitive data instead of config patch.

## Gemini API Status (2026-05-13)
- **Old key leaked** (403) — first replacement expired immediately (400), second replacement working
- **Rate limit:** Free tier 5 RPM (429 errors frequent)
- **Embedding model switched:** `gemini-embedding-001` → `gemini-embedding-2` (8192 token context)
- **Memory search** currently impaired by rate limit — waits for reset or plan upgrade

## CloseRouter — Tested Provider (2026-05-26)
- **URL:** `https://api.closerouter.dev/v1` — OpenAI-compatible
- **Auth:** `x-api-key` header (NOT `Authorization: Bearer` — broken)
- **Test credits:** $2 received
- **Models configured:**
  - `google/gemini-3.5-flash` — reasoning model (148 reasoning tokens on simple query) ✅
  - `anthropic/claude-opus-4.7` — verified real Opus 4.7 (parallel tests vs OpenRouter) ✅
  - `anthropic/claude-sonnet` — configured, not tested
  - `anthropic/claude-haiku` — configured, not tested
- **Config aliases:** `claude-opus-cr`, `claude-sonnet-cr`, `claude-haiku-cr`, `gemini-3.5-flash`
- **Cost:** Comparable to OpenRouter (~$0.04/response with 138k SOC)

### Verdict
| Metric | CloseRouter | OpenRouter |
|---|---:|
| Model authenticity | Opus 4.7 ✅ | Opus 4.7 ✅ |
| Speed | 15-23 sec ⚠️ | 10-11 sec ✅ |
| Reliability | "No deployments" errors ❌ | 0 errors ✅ |
| Gemini 3.5 Flash | ✅ Available | ❌ Not available |
| **Role** | **Резерв / Gemini tasks** | **Основной** |

**Decision:** CloseRouter → on pause. Opus via OpenRouter, daily via DeepSeek V4 Pro. `gemini-3.5-flash` kept on CloseRouter for isolated tasks.

### Lessons
- SOC (Session Occupancy Context) is the main token consumer (138k/request), not the model
- CloseRouter uses `x-api-key` — `Authorization: Bearer` breaks
- Run provider tests in isolated sessions for clean cost measurements

## Agentmemory Integration (2026-05-13)
- **Engine:** agentmemory v0.9.12 (rohitg00/agentmemory) via Docker (iii-engine)
- **Search:** BM25 + Graph (LLM embedding disabled)
- **Plugin path:** `~/.openclaw/extensions/agentmemory/`
- **Config:** `plugins.slots.memory = "agentmemory"`, `plugins.allow = ["agentmemory"]`
- **Auto-start:** `start-agentmemory.ps1` + shortcut in Windows Startup
- **Status:** Running, but search limited by Gemini free-tier rate cap

## Semantic Search Embeddings
- Currently uses Gemini embeddings via `memory_search`; can be switched if needed.
- Agentmemory provides file-based fallback with BM25+Graph (no embeddings required).