# Admin Panel (admin.mojhit.pl)

- Separate SPA for CRM, Dashboard (DAU, Revenue), Moderation, Promo codes, Feature Flags, API Key rotation.
- **Music Templates Engine:** Admin creates "Occasion" + "Vibe" buttons (e.g. Wedding -> Polish Disco Polo) which hide complex Suno tags (`suno_tags`) and Gemini instruction prompts (`gemini_context`) from the user.
- **Subscription Tier Management:** Users table includes "Tarif" column showing tier (free/pro/enterprise) with icon and color coding; editable via prompt.
- **Track Playback:** Tracks moderation table includes "Odtwarzaj" column with play button to open audio URL in new window for admin review.
- **Video Tasks:** Future enhancement: moderation of video generation tasks.

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