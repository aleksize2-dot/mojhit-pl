# Business Model & Economics

- **Double Economy:** 
  - Coins 🪙 (Paid, 1 Coin = 1 Generation/2 Tracks).
  - Notes 🎵 (Free/Farmed, 10 Notes = 1 Coin). Earned via Daily Login, minigames during loading, and likes from authorized users.
- **Video Generation (All Tiers, 2026-04-28):**
  - **Decision change:** Video generation is now available for ALL subscription tiers (Free, VIP, Legend), not just PRO.
  - **Watermark distinction:** Free tier gets "Created on mojhit.pl" watermark; VIP/Legend get clean, watermark-free video.
  - Videos optimized for social media (TikTok, Reels, Shorts) via Kie.ai/Sunoapi.org MP4 API.
  - Storage: 14‑day retention; users can download.
  - **Business impact:** Viral growth loop — video with mojhit.pl watermark → viral sharing → new users.
- **Viral Loop (Social Proof):** Sharing tracks via OpenGraph. Guests must register to like a track (which rewards the author with Notes).
- **Guest Checkout & Lead Magnet (No Registration Required):** 
  - **New Flow:** Users can generate and pay for tracks *without* mandatory registration.
  - They provide an email during checkout (Stripe).
  - **Delivery:** Upon successful Stripe payment, webhook magic triggers the backend to send the full generated MP3 tracks directly to the user's email via Resend.
  - **Shadow Accounts:** Tracks are tied to a `guest_session_id`. The webhook optionally creates a user in Clerk/Supabase and includes a Temp Password in the email (Lead Magnet + Newsletter opt-in) so they can claim their tracks and leftover coins later if they want to.
  - Playback for unpaid/guest sessions is locked at 40s (fade out).
  - Decoy Pricing: 15 PLN (just download 2 tracks), 49 PLN (2 tracks + 10 Coins/account creation), 99 PLN (VIP + 30 Coins).