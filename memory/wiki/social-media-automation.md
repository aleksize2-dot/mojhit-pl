# Social Media Automation Tools

Tools for browser automation and social media API access, complementing the mojhit.pl marketing infrastructure.

## CloakBrowser (2026-05-13)

Stealth browser for social media automation that bypasses anti-bot detection.

### Installation
- **Package:** `cloakbrowser` (npm global) + `playwright-core`
- **Binary:** 535 MB Chromium 146 in `~/.cloakbrowser/`
- **Capabilities:** Passes Cloudflare, FingerprintJS, reCAPTCHA
- **Use case:** Personal Facebook profile and group access (what Facebook API doesn't allow)

### Verified
- Successfully logged into Alex's personal FB profile and group
- Can interact with pages that API-based tools cannot reach

## Composio (2026-05-13)

API integration platform for connecting AI agents to external services.

### Installation
- **Method:** WSL (bash installer)
- **Account:** `aleksize2@gmail.com` / `aleksize2_workspace`
- **Login:** `composio login`

### Connected Services
| Platform | Status | Details |
|----------|--------|---------|
| Facebook | ✅ Connected | 4 pages: Zaczytajnia, MustHaben, Gripico, Donner |
| TikTok | ⚠️ Incomplete | App created, needs Terms/Privacy URLs |

### OpenClaw Integration
- `composio --install-skill openclaw` — failed (archive not in release)
- Manual integration via API possible if needed

## Relationship to mojhit.pl Marketing

- CloakBrowser enables manual social media management on platforms where API access is restricted
- Composio provides programmatic Facebook page management for 4 brand pages
- Both complement the [[mojhit-marketing|TikTok/Reels nano-influencer campaign]] strategy
- TikTok integration pending — requires mojhit.pl in production with Terms/Privacy pages

## Cross-links
- [[mojhit-marketing|Marketing & Viral Funnel]]
- [[mojhit-referral|Referral & Affiliate Program]]
