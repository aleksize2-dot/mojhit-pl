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

## Environment Configuration
- **`.env` files:** No changes required for ngrok static domain.
- **Webhook URLs:** Update external services (Clerk, KIE) to point to ngrok domain if changed.

## Monitoring
- Check ngrok dashboard for tunnel status.
- Verify backend health via `GET /health` endpoint.
- Ensure frontend can connect to backend (CORS configured).

## Known Issues
- Local server processes may hang after system sleep; script auto‑restart planned.
- Ngrok free tier domains rotate; consider upgrading for permanent domain.
- `config.patch` for `skills.entries` in OpenClaw 2026.4.22 triggers `size-drop` bug (28K→9.6K). Workaround: env variables instead of config patch for sensitive data.

## 🐛 Incident Log

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