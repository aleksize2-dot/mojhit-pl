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

## Backup Strategy

- **Daily backups** of SQL scripts, modified code files, and documentation are stored in `backup/YYYY-MM-DD/`.
- **2026‑04‑20:** Created comprehensive backup in `backup/2026-04-20/` containing SQL scripts, modified code files, and documentation of all changes.
- Backups include schema migration scripts, cover image implementation, and OpenClaw configuration fixes.