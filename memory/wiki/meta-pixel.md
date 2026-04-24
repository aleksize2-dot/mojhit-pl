# Meta Pixel (Facebook) - Marketing Integration

## Status
**Planned** – Mentioned in Privacy Policy (Section 7 "Marketing i Narzędzia Analityczne"), not yet integrated into the cookie consent system.

## Details
- **Data Controller:** Meta Platforms Ireland Ltd.
- **User Control:** Users can manage ad preferences via [Facebook Ad Preferences](https://www.facebook.com/ads/preferences/).
- **Legal Basis:** Consent (RODO art. 6 ust. 1 lit. a).

## Integration Plan
- **Cookie Category:** Marketing.
- **Consent Check:** `hasMarketingConsent()` in `cookieConsent.ts`.
- **Loading Function:** To be implemented (similar to `loadGoogleAnalytics()`).
- **Pixel ID:** To be obtained when setting up Facebook Ads.

## Related Documentation
- [[cookie-rodo|Cookie & RODO Compliance]]
- [[regulamin|Regulamin (Terms of Service)]]

---
*Обновлено: 2026-04-16*