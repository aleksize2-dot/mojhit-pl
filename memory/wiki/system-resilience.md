# System Resilience & Limits

## Model Providers & Fallbacks
- **Primary Model:** `deepseek/deepseek-reasoner` (via DeepSeek API) with thinking mode.
- **Fallback Models:**
  - `gemini/gemini-3.1-pro` (original heavy token consumption, hit 2M daily limits).
  - `gemini/gemini-2.5-flash` (faster, cheaper).
  - `qwen/qwen3.6-plus` (via OpenRouter).
  - `nvidia/nemotron-3-super-120b-a12b:free` (free via OpenRouter).
- **Vision Model:** `ernie-4.5-vl-424b-a47b` (via OpenRouter) for image analysis.
- **2026‑04‑20 Configuration Fix:** Updated `openclaw.json` to add Gemini and Qwen as fallback models for main agent; previously only deepseek/deepseek-reasoner was in fallbacks.

## API Keys & Configuration
- **DeepSeek API Key:** stored in `openclaw.json` (models.providers.deepseek).
- **Gemini API Key:** `AIzaSyA2eTcnEoAMIwy1h5YDISsXotFAAfqDVw4`.
- **OpenRouter API Key:** stored in `openclaw.json` (models.providers.qwen).
- **Sensitive:** API keys are in config—never leak.
- **Free Models via OpenRouter:** Nemotron 3 Super (120B) free for input/output tokens; useful for fallback.

## Provider Changes (2026‑04‑15)
- **Qwen Provider:** switched from DashScope to OpenRouter for better pricing.
- **Web‑Search Provider:** changed from Gemini to DeepSeek (then disabled due to missing Gemini key).
- **Vision Capability:** added ERNIE 4.5 VL model via OpenRouter; awaiting testing.
- **Nemotron 3 Super:** free model discovered and integrated via OpenRouter; tested successfully.

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
- **Web‑Search Status:** currently disabled (`tools.web.search.enabled = false`) to avoid Gemini 503 errors.

## Semantic Search Embeddings
- Currently uses Gemini embeddings via `memory_search`; can be switched if needed.