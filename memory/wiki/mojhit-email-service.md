# Email Notification Service

Email service for automated notifications when tracks are generated. Separate from the Brevo marketing/transactional integration.

## Architecture

- **Module:** `emailService.js` in server root (`raw/MH/server/`)
- **Dependency:** `nodemailer` (npm installed)
- **Status (2026-04-22):** Module ready, template designed. **SMTP credentials not yet configured** — warnings logged to console until SMTP_HOST/PORT/USER/PASS are set in `.env`.

## Email Notifications

### Trigger
- Called from KIE webhook callback (`/api/webhooks/kie`) after successful first track variant generation (`index === 0`).
- Future: extend to all variants.

### Template (`sendTrackEmail`)
- **Branding:** mojhit.pl gradient (#ff9064 → #734bbd), Inter font family
- **Content:**
  - Track title and AI performer name
  - Listen link + MP3 download button
  - Storage notice: tracks stored for 14 days
  - Upsell block: PRO/VIP tier benefits
- **Variables:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` (commented out in `.env`)

## Setup Required

1. Uncomment SMTP variables in `.env`
2. Set real credentials (Gmail / SendGrid / Mailgun)
3. Restart server
4. Test sending to real email address

## Future Enhancements
- Attach MP3 file directly to email (instead of link)
- Customize template text/colors/logo
- Send email for all track variants (not just the first one)

## Cross-links
- [[brevo-email|Brevo Email Marketing]] — separate marketing/transactional email system via Brevo API
- [[mojhit-architecture|Architecture]]
