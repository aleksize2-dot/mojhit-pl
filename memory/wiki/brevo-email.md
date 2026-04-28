# Brevo (Email Marketing) Integration

*Last updated: 2026-04-24*

## Status
- ✅ **Skill installed:** `brevo@1.0` from ClawHub (skills/brevo)
- ⏳ **Awaiting:** API key from Alex (registration on brevo.com needed)
- ⏳ **Configuration:** pending API key setup

## Purpose
Transactional and marketing emails for mojhit.pl users:
- **Promotional:** Template-based offers, campaigns
- **Transactional:** "Your track is ready" notifications
- **Re-engagement:** "We miss you" / abandoned user reminders
- **News:** Product updates and new feature announcements

## Setup Requirements
1. Register at [brevo.com](https://www.brevo.com)
2. Generate API key
3. Configure in OpenClaw env variables or via `brevo.md` edit

## Routing Priority
1. **Brevo** → transactional + marketing email campaigns (after deploy)
2. **Stripe** → payment confirmations (direct, no wrapper)
3. **GA4** → analytics (deferred until production deployment)

## Related
- [[ga4|GA4 Analytics]] — deferred until site deployment
- [[cookie-rodo|RODO Compliance]] — consent requirements for email marketing
