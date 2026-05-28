# Admin Panel (admin.mojhit.pl)

- Separate SPA for CRM, Dashboard (DAU, Revenue), Moderation, Promo codes, Feature Flags, API Key rotation.
- **Music Templates Engine:** Admin creates "Occasion" + "Vibe" buttons (e.g. Wedding -> Polish Disco Polo) which hide complex Suno tags (`suno_tags`) and Gemini instruction prompts (`gemini_context`) from the user.
- **Subscription Tier Management:** Users table includes "Tarif" column showing tier (free/pro/enterprise) with icon and color coding; editable via prompt.
- **Track Playback:** Tracks moderation table includes "Odtwarzaj" column with play button to open audio URL in new window for admin review.
- **Video Tasks:** Future enhancement: moderation of video generation tasks.

### Admin Panel UI Updates (2026-04-28)

#### Controls Added
- **"Aktualizuj" button** — Refresh button in Zarządzanie Wykonawcami (producer management) to reload without full page refresh.
- **Avatar upload** — File picker button in performer edit form to upload custom avatar images.

#### Removed
- **"Szybkie Szablony" theme picker** — Removed because it overrode performer color configuration (e.g., Melo MC's red gradient was invisible on default white).

#### Color Fixes
- **Tailwind safelist** — Added `safelist.ts` imported in `App.tsx` to prevent Tailwind from purging dynamic color classes (`red-800`, `lime`, `yellow`).
- **Melo MC colors** — Fixed white-on-invisible issue; changed to red gradient (`red-800`, `red-600`).
- **La Luz button_gradient** — Fixed typo: `linear` → `linear` (missing 'l' in CSS gradient function).

### Admin Panel Updates (2026-05-17)

#### Vocal Gender Options
- Added **Duet (Ż+Ż)** and **Duet (M+M)** to the `vocal_gender` dropdown
- **BLIXX** `vocal_gender` changed: `duet` → `duet_f` (female duet)

#### Generator UI
- **Hidden:** "Wirtualny Wykonawca - Tagi Suno" (Suno tags section) — no longer exposed to users
- **Text area height:** `max-h-180px` → `max-h-400px` for better prompt readability
- **Error messages:** user-friendly error modal instead of raw API error dump

#### Track Detail Page
- **`cleanLyrics()` function** — strips `[Intro]`, `(Vocal:...)`, instrument descriptions from lyrics display

#### Refund Handling
- **KIE failure → auto-refund:** When KIE generation fails, user gets:
  - Coins refunded via Stripe/balance
  - Refund transaction recorded in DB
  - Task marked as `failed`
  - User-friendly failure modal shown

### Roles & Permissions (Role i Uprawnienia)

**Added 2026-04-23** — Full role-based access control (RBAC) for the admin panel.

**Backend (`index.js`):**
- `GET /api/admin/users/:userId/roles` — Loads roles from `user_admin_roles` table
- `POST /api/admin/users/:userId/roles` — Assigns role to user (with duplicate check)
- `DELETE /api/admin/users/:userId/roles/:roleId` — Removes role from user

**Frontend (`AdminDashboard.tsx`):**
- Tab "Role i Uprawnienia" with full CRUD:
  - Create new role with permission checkboxes grouped by category
  - Edit existing role (name + permissions)
  - Delete non-system roles (with confirmation modal)
  - "Zaznacz wszystkie" / "Odznacz wszystkie" bulk toggle buttons
- User table now has "Role" column with inline management button
- Modal dialog for managing user roles (add/remove roles on per-user basis)