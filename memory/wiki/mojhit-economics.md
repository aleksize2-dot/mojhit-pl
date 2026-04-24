# Business Model & Economics

- **Double Economy:** 
  - Coins 🪙 (Paid, 1 Coin = 1 Generation/2 Tracks).
  - Notes 🎵 (Free/Farmed, 10 Notes = 1 Coin). Earned via Daily Login, minigames during loading, and likes from authorized users.
- **PRO Tier Exclusive Features:**
  - **Video Generation:** PRO users can convert generated audio tracks into social-media‑optimized videos (TikTok, Reels, Shorts) via Kie.ai MP4 API.
  - Videos include optional "Created on mojhit.pl" watermark for brand exposure.
  - Storage: 14‑day retention; users can download.
  - Differentiates PRO tier, increases user retention, and creates viral growth loop.
- **Viral Loop (Social Proof):** Sharing tracks via OpenGraph. Guests must register to like a track (which rewards the author with Notes).
- **Guest Checkout & Lead Magnet (No Registration Required):** 
  - **New Flow:** Users can generate and pay for tracks *without* mandatory registration.
  - They provide an email during checkout (Stripe).
  - **Delivery:** Upon successful Stripe payment, webhook magic triggers the backend to send the full generated MP3 tracks directly to the user's email via Resend.
  - **Shadow Accounts:** Tracks are tied to a `guest_session_id`. The webhook optionally creates a user in Clerk/Supabase and includes a Temp Password in the email (Lead Magnet + Newsletter opt-in) so they can claim their tracks and leftover coins later if they want to.
  - Playback for unpaid/guest sessions is locked at 40s (fade out).
  - Decoy Pricing: 15 PLN (just download 2 tracks), 49 PLN (2 tracks + 10 Coins/account creation), 99 PLN (VIP + 30 Coins).