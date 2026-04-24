# Supabase Schema (PostgreSQL) for mojhit.pl

*Last updated: 2026-04-24 (full audit via Supabase OpenAPI)*

## Core Tables

### `users`
Stores Clerk-authenticated users, balances, and referral data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | Internal primary key |
| `clerk_id` | TEXT | Clerk user ID |
| `email` | TEXT | User email |
| `coins` | INTEGER | 🪙 Coins (paid currency) |
| `notes` | INTEGER | 🎵 Notes (free/farmable currency) |
| `status` | TEXT | `'active'`, `'suspended'`, `'deleted'` |
| `subscription_tier` | TEXT | Subscription level (e.g. `'free'`, `'basic'`, `'pro'`) |
| `referral_code` | TEXT | Unique referral code for affiliate program |
| `referred_by` | UUID | References `users(id)` — who referred this user |
| `is_affiliate` | BOOLEAN | Whether user is an affiliate |
| `ip_address` | INET | IP for anti‑fraud |
| `device_fingerprint` | TEXT | Hashed device fingerprint |
| `last_login` | TIMESTAMPTZ | Last login |
| `created_at` | TIMESTAMPTZ | Account creation |
| `updated_at` | TIMESTAMPTZ | Last update |

**Indexes:** `clerk_id` UNIQUE, `email` UNIQUE

---

### `tracks`
User-generated audio tracks with preview/purchase tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | Primary key |
| `user_id` | UUID | References `users(id)` |
| `title` | TEXT | Track title |
| `description` | TEXT | Lyrics / user description |
| `audio_url` | TEXT | Final audio URL (Cloudflare R2) |
| `cover_image_url` | TEXT | Cover image (optional) |
| `kie_task_id` | UUID | References generated task |
| `producer_id` | TEXT | AI performer who made this |
| `variant_index` | INTEGER | 0-based variant index |
| `plays` | INTEGER | Stream count |
| `likes` | INTEGER | Like counter |
| `expired` | BOOLEAN | Soft-delete flag |
| `guest_session_id` | TEXT | Session ID for guest users |
| `guest_email` | TEXT | Email provided for checkout |
| `is_paid` | BOOLEAN | Purchased or free preview |
| `is_unlocked` | BOOLEAN | Whether user unlocked it |
| `created_at` | TIMESTAMPTZ | Generation time |

---

### `kie_tasks`
KIE.ai task tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | Internal PK |
| `task_id` | TEXT | External KIE task ID |
| `user_id` | UUID | References `users(id)` |
| `prompt` | TEXT | Generation prompt |
| `model` | TEXT | AI model used |
| `status` | TEXT | `'pending'`, `'completed'`, `'error'` |
| `audio_url` | TEXT | Final audio URL |
| `image_url` | TEXT | Cover image |
| `stream_audio_url` | TEXT | Streaming URL |
| `title` | TEXT | Auto‑generated title |
| `tags` | TEXT | Comma‑separated tags |
| `duration` | NUMERIC | Duration in seconds |
| `error_msg` | TEXT | Error details |
| `persona_id` | TEXT | AI persona used |
| `guest_session_id` | TEXT | Guest session ID |
| `guest_email` | TEXT | Guest email |
| `is_paid` | BOOLEAN | Whether this was a paid generation |
| `created_at` | TIMESTAMPTZ | Created |
| `updated_at` | TIMESTAMPTZ | Updated |

---

### `kie_track_variants`
Multiple audio variants per KIE task (different takes).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | Primary key |
| `task_id` | UUID | References `kie_tasks(id)` ON DELETE CASCADE |
| `variant_index` | INTEGER | 0, 1, 2… |
| `audio_url` | TEXT | Variant audio |
| `image_url` | TEXT | Cover image |
| `stream_audio_url` | TEXT | Streaming URL |
| `title` | TEXT | Variant title |
| `tags` | TEXT | Genre/tags |
| `duration` | NUMERIC | Seconds |
| `prompt` | TEXT | Generation prompt for this variant |
| `created_at` | TIMESTAMPTZ | Created |

**Index:** UNIQUE (`task_id`, `variant_index`)

---

### `producers`
AI performers (personas) — richly configurable.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Unique slug/ID |
| `name` | TEXT | Display name |
| `badge` | TEXT | Badge (e.g. "New", "Pro") |
| `icon` | TEXT | Small icon URL |
| `img` | TEXT | Full avatar image URL |
| `init_msg` | TEXT | Initial chat message |
| `header_title` | TEXT | Header title |
| `header_status` | TEXT | Header status text |
| `typing_msg` | TEXT | On‑typing indicator |
| `placeholder` | TEXT | Chat input placeholder |
| `gradient` | TEXT | CSS gradient for theme |
| `button_gradient` | TEXT | Button gradient |
| `theme_config` | JSONB | Full theme config (colors, fonts) |
| `system_prompt` | TEXT | LLM system prompt |
| `model_name` | TEXT | Preferred LLM model |
| `price_coins` | INTEGER | 🪙 Rental price |
| `is_active` | BOOLEAN | Available for use |
| `is_on_main_page` | BOOLEAN | Featured on homepage |
| `tier` | TEXT | Tier level (e.g. `'FREE'`, `'PREMIUM'`) |
| `type` | TEXT | `'SONG'`, `'LYRICS'`, etc. |
| `suno_version` | TEXT | Suno model version |
| `suno_persona_id` | TEXT | Suno persona (voice clone) |
| `suno_persona_model` | TEXT | Suno persona model |
| `source_audio_url` | TEXT | Base audio for voice cloning |
| `source_task_id` | TEXT | Source task ID |
| `vocal_start` | INTEGER | Start timestamp (seconds) |
| `vocal_end` | INTEGER | End timestamp (seconds) |
| `created_at` | TIMESTAMPTZ | Created |
| `updated_at` | TIMESTAMPTZ | Updated |

---

### `transactions`
Audit log of all currency changes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `user_id` | UUID | References `users(id)` |
| `type` | TEXT | `'coins'`, `'notes'`, `'purchase'`, `'refund'`, `'like_reward'`, etc. |
| `amount` | INTEGER | Delta (+/-) |
| `reference_id` | TEXT | External ID (Stripe, track) |
| `description` | TEXT | Human‑readable reason |
| `metadata` | JSONB | Additional data (fraud signals, etc.) |
| `created_at` | TIMESTAMPTZ | Created |
| `updated_at` | TIMESTAMPTZ | Updated |

---

### `admin_roles`
RBAC roles for admin panel.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `name` | TEXT | Role name |
| `description` | TEXT | Description |
| `is_system` | BOOLEAN | System roles cannot be deleted |
| `created_at` | TIMESTAMPTZ | Created |
| `updated_at` | TIMESTAMPTZ | Updated |

---

### `admin_permissions`
Available permission codes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `code` | TEXT | Key (e.g. `'users.view'`) — UNIQUE |
| `description` | TEXT | Display text |
| `category` | TEXT | Grouping for UI |
| `created_at` | TIMESTAMPTZ | Created |

---

### `role_permissions`
Junction: roles ↔ permissions.

| Column | Type | Description |
|--------|------|-------------|
| `role_id` | UUID | References `admin_roles(id)` ON DELETE CASCADE |
| `permission_id` | UUID | References `admin_permissions(id)` ON DELETE CASCADE |
| `created_at` | TIMESTAMPTZ | Created |

**Index:** UNIQUE (`role_id`, `permission_id`)

---

### `user_admin_roles`
Junction: admin users ↔ roles.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `user_id` | UUID | References `users(id)` ON DELETE CASCADE |
| `role_id` | UUID | References `admin_roles(id)` ON DELETE CASCADE |
| `assigned_by` | UUID | Admin who assigned the role |
| `assigned_at` | TIMESTAMPTZ | When assigned |
| `notes` | TEXT | Assignment notes |
| `created_at` | TIMESTAMPTZ | Created |

**Index:** UNIQUE (`user_id`, `role_id`)

---

### `user_producers`
Junction: users ↔ unlocked producers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `user_id` | UUID | References `users(id)` ON DELETE CASCADE |
| `producer_id` | TEXT | References `producers(id)` |
| `unlocked_at` | TIMESTAMPTZ | When unlocked |
| `expires_at` | TIMESTAMPTZ | Rental expiry (NULL = permanent) |

**Index:** UNIQUE (`user_id`, `producer_id`)

---

## Marketing / Referral Tables

### `promocodes`
Discount/promotion codes.

| Column | Type | Description |
|--------|------|-------------|
| `code` | TEXT (pk) | Unique promo code |
| `type` | TEXT | `'coins'`, `'notes'`, `'percent'`, `'fixed'` |
| `value` | INTEGER | Amount or percent |
| `max_uses` | INTEGER | Max redemptions |
| `used_count` | INTEGER | Current redemptions |
| `valid_from` | TIMESTAMPTZ | Start |
| `valid_until` | TIMESTAMPTZ | End |
| `created_at` | TIMESTAMPTZ | Created |

---

### `affiliate_earnings`
Commission tracking for affiliates.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `affiliate_id` | UUID | References `users(id)` |
| `buyer_id` | UUID | Purchasing user |
| `purchase_amount` | NUMERIC | Purchase total |
| `commission_amount` | NUMERIC | Commission earned |
| `status` | TEXT | `'pending'`, `'paid'` |
| `created_at` | TIMESTAMPTZ | Created |

---

### `referral_rewards`
Rewards granted for successful referrals.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `referrer_id` | UUID | Who referred |
| `referee_id` | UUID | New user |
| `reward_notes` | INTEGER | 🎵 Notes reward |
| `reward_coins` | INTEGER | 🪙 Coins reward |
| `created_at` | TIMESTAMPTZ | Created |

---

## Guest & Limits

### `guest_sessions`
Anonymous guest tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `guest_session_id` | TEXT | Client cookie | Unique |
| `ip_address` | INET | IP |
| `user_agent` | TEXT | Browser UA |
| `created_at` | TIMESTAMPTZ | First visit |
| `last_active` | TIMESTAMPTZ | Last activity |
| `converted_at` | TIMESTAMPTZ | When registered |

---

### `guest_limits`
Rate limiting for guest users.

| Column | Type | Description |
|--------|------|-------------|
| `ip_address` | TEXT | IP (pk) |
| `generations_count` | INTEGER | Generations today |
| `last_generation_at` | TIMESTAMPTZ | Last generation |

---

## Content / Lyrics

### `lyrics`
Shared text bank (song lyrics).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `slug` | TEXT | URL‑friendly slug |
| `title` | TEXT | Song title |
| `content` | TEXT | Full lyrics text |
| `category` | TEXT | Category |
| `tags` | TEXT | Comma‑separated tags |
| `is_premium` | BOOLEAN | Premium only |
| `author_id` | UUID | Creator |
| `uses_count` | INTEGER | Times used |
| `created_at` | TIMESTAMPTZ | Created |

---

## Admin / Meta

### `api_settings`
Internal app configuration stored as JSON.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `settings` | JSONB | Arbitrary settings blob |
| `created_at` | TIMESTAMPTZ | Created |
| `updated_at` | TIMESTAMPTZ | Updated |

---

### `system_logs`
System‑wide activity log.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `level` | TEXT | `'info'`, `'warn'`, `'error'` |
| `action` | TEXT | Action identifier |
| `message` | TEXT | Log message |
| `metadata` | JSONB | Additional context |
| `created_at` | TIMESTAMPTZ | Created |

---

### `contests`
Competitions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `title` | TEXT | Contest title |
| `description` | TEXT | Rules / description |
| `start_at` | TIMESTAMPTZ | Start |
| `end_at` | TIMESTAMPTZ | End |
| `prize_coins` | INTEGER | Prize |
| `is_active` | BOOLEAN | Active |
| `created_at` | TIMESTAMPTZ | Created |

---

### `video_tasks`
AI video generation task tracking (PRO tier).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (pk) | PK |
| `user_id` | UUID | Owner |
| `audio_task_id` | UUID | Source audio task |
| `video_task_id` | TEXT | External video task ID |
| `status` | TEXT | `'pending'`, `'processing'`, `'completed'`, `'error'` |
| `video_url` | TEXT | Final video URL |
| `thumbnail_url` | TEXT | Thumbnail |
| `expires_at` | TIMESTAMPTZ | Expiry |
| `duration_seconds` | INTEGER | Duration |
| `error_message` | TEXT | Error details |
| `created_at` | TIMESTAMPTZ | Created |
| `updated_at` | TIMESTAMPTZ | Updated |

---

## Views

### `user_admin_permissions` (View)
Resolved permissions per admin user (joins `user_admin_roles` → `role_permissions` → `admin_permissions`).

---

## RPC Functions

### `increment_likes(track_id UUID)`
Increments `tracks.likes` counter.

### `generate_referral_code(email_str TEXT, id_str TEXT)`
Generates a unique referral code for a user.

---

## Schema Notes
- All tables have `created_at` (TIMESTAMPTZ)
- Service role key bypasses RLS
- Junction tables use `ON DELETE CASCADE`
- `_prisma_migrations` table excluded from auditing
