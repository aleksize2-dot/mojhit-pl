# Referral & Affiliate Program

Built 2026-04-24 as part of the marketing/user-acquisition stack.

## Components

### Frontend: Polecaj.tsx ("Refer" Page)
- **3-step flow:** Explain program → Share link → Earn rewards
- **Reward table:** Shows coins/notes earned per referral tier
- **Social sharing:** Direct share buttons for social media
- Visible to logged-in users from main navigation

### Frontend: AffiliateManager.tsx
- **Dashboard** with 4 key metrics:
  - Referral link (copy to clipboard)
  - Total referrals count
  - Coins earned
  - Notes earned
- Available to users with `is_affiliate = true`

### Database
- **`users.referral_code`** — unique referral code per user (TEXT)
- **`users.referred_by`** — UUID referencing `users(id)` — who referred this user
- **`users.is_affiliate`** — BOOLEAN flag for affiliate status
- **`referral_rewards`** — grants of notes/coins for successful referrals
- **`affiliate_earnings`** — commission tracking for paid conversions (status: pending/paid)

### RPC
- `generate_referral_code(email_str TEXT, id_str TEXT)` — generates a unique referral code

## Reward Mechanics
- Referrer earns **notes** when new user registers via their link
- Referrer can earn **coins** if the referred user makes a purchase (affiliate commission)
- Affiliates track earnings via the AffiliateManager dashboard

## OpenArt Partnership
- 2026-04-24: Alex applied to OpenArt affiliate program (pending)

## Cross-links
- [[mojhit-economics|Business Model & Economics]]
- [[mojhit-marketing|Marketing & Viral Funnel]]
- [[supabase-schema|Supabase Schema]]
