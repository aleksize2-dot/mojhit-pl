# 🎵 Funnel "Podaruj Muzykę" — Architectural Plan

## Concept: Gift Track Funnel

```
FB/IG Ad → /prezent?campaign=szef → fullscreen track landing → AI chat → email → download + upsell
```

## ── PART 1: What We Already Have (Zero Rework) ──

### ✅ Ready to Use
| Component | Status | File |
|-----------|--------|------|
| AI chat with producers | ✅ работает | `Generator.tsx` |
| Suno generation pipeline | ✅ работает | server + webhooks |
| Guest sessions (`guest_session_id`) | ✅ в БД | users / tracks tables |
| Guest email capture | ✅ реализован | Generator.tsx (states) |
| Email sending (Brevo) | ✅ готов, ключ в env | `emailService.js` |
| Producer personas with styles | ✅ работает | `producers.ts` config, БД |
| Track model with guest fields | ✅ в БД | `tracks` table |
| Cennik / packages | ✅ есть | `Cennik.tsx` |
| Reviews system | ✅ в админке | `ReviewsManager.tsx` |

### 🟡 Needs Minor Adjustments
| Component | What to Change |
|-----------|----------------|
| Guest limit modal | Remove login requirement, keep email-only |
| Suno generate endpoint | Allow `guest_session_id` without auth |
| Email template | Add dynamic download link + package upsell HTML |

---

## ── PART 2: What to Add (Brush Strokes) ──

### 1️⃣ New DB Table: `track_templates`

```sql
CREATE TABLE IF NOT EXISTS public.track_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,         -- 'dla-szefa', 'dla-przyjaciela'
    title TEXT NOT NULL,               -- "Dla Szefa na Jubileusz"
    description TEXT,                  -- short pitch for the landing page
    base_lyrics TEXT NOT NULL,         -- template text with {{placeholders}}
    style_tags TEXT[] NOT NULL,        -- {disco_polo,80s_disco,italo_disco}
    mood TEXT,                         -- 'humorous', 'heartwarming'
    cover_image_url TEXT,              -- preview thumbnail
    default_producer_id TEXT,          -- which AI performer
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2️⃣ New API Endpoints (Backend)

```
GET  /api/templates                     → list active templates
GET  /api/templates/:slug               → get template details
POST /api/templates/generate-guest      → GUEST FLOW: email + prompt → generate + email
POST /api/admin/templates               → CRUD templates in admin
PUT  /api/admin/templates/:id
DELETE /api/admin/templates/:id
```

### 3️⃣ New Pages (Frontend)

```
/upominek                    → landing page (all templates)
/upominek/:slug              → template detail + quick chat
```

### 4️⃣ What to Modify

| File | Change |
|------|--------|
| `Generator.tsx` | Add `templateMode` prop — pre-fills initial messages + producer |
| Server `/api/suno/generate` | Allow guest flow: if no auth but has `guest_email`, still generate |
| Server `index.js:1504` | Remove `requireAuth()` guard for guest generation |
| `emailService.js` | New function: sendTrackWithDownload(trackUrl, email) + upsell |
| `AdminDashboard.tsx` | Add "Szablony Prezentów" tab |

---

## ── PART 3: User Flow (Step by Step) ──

```
① User sees FB Ad → clicks link
   → /upominek?ref=fb_campaign_1

② Sees full-screen template grid:
   ┌─────────────────────────────────┐
   │  🎁 Podaruj Muzykę!             │
   │                                 │
   │  [Dla Szefa] [Dla Przyjaciela]  │
   │  [Na Ślub]    [Na Urodziny]     │
   │  [Dla Dziewczyny] [Imprezowa]   │
   │                                 │
   └─────────────────────────────────┘

③ Clicks "Dla Szefa"
   → /upominek/dla-szefa
   → Shows: style tags, preview text, "Spersonalizuj" button

④ Clicks "Spersonalizuj"
   → Opens mini-chat with Kazik (default producer)
   → Bot says: "Opisz mi Twojego szefa! Jak ma na imię?
     Czym się zajmuje? Jaki jest? Może jakaś zabawna historia?"

⑤ User types: "Marek, 55 lat, uwielbia wędkowanie i piłkę nożną,
   zawsze pomaga młodszym, dusza firmy"

⑥ AI takes template lyrics + user input → replaces {{placeholders}}
   → Shows preview text to user: "Czy to brzmi dobrze?"

⑦ User confirms → enter email (no registration!)
   → "Podaj email, a wyślemy Ci gotowy utwór!"

⑧ Backend: generates via Suno → on webhook → sends email
   Email contains:
   - 🎵 Link to stream/download track
   - 🎁 "Spersonalizuj kolejny utwór"
   - 💎 "Kup pakiet 10 utworów w promocji -50%"
   - 🤝 "Zapraszaj znajomych i zbieraj darmowe nuty"
```

---

## ── PART 4: Template Examples ──

### "Dla Szefa na Jubileusz" (80s Disco / High Energy)
```text
Szefie {{NAME}}, to Twój dzień!
Cała firma składa życzeń bukiet.
{{QUALITY_1}} i {{QUALITY_2}} to Twoja broń,
Z takim szefem każdy pracować chce!

{{SPECIAL_MEMORY}} pamiętamy jak dziś,
Za to dzisiaj Tobie gramy i śpiewamy cześć!
```

### "Dla Przyjaciela" (Disco Polo / Polish Wave)
```text
{{NAME}}, ziomek z gatunku tych,
Co w potrzebie zawsze przy nich!
{{HOBBY_1}} i {{HOBBY_2}} to Twój znak,
Z Tobą nuda to nieznany smak!

{{GIRL_CRUSH}} mówią, że wokół Ciebie świat,
Każda chwila to przygoda, każdy dzień to beat!
```

---

## ── PART 5: Implementation Priority ──

| # | Task | Files | Time |
|---|------|-------|------|
| 1 | Create `track_templates` SQL table | SQL script | ⏱️ 10 min |
| 2 | API: list/create templates | `index.js` | ⏱️ 30 min |
| 3 | DB: 5 template inserts (seeds) | SQL | ⏱️ 15 min |
| 4 | Frontend: `/upominek` landing page | New page | ⏱️ 1h |
| 5 | Frontend: `/upominek/:slug` detail + quick-chat | New page + Generator tweaks | ⏱️ 1.5h |
| 6 | Guest flow: generate without registration | `api/suno/generate` | ⏱️ 30 min |
| 7 | Email: sendTrackWithDownload + upsell | `emailService.js` | ⏱️ 30 min |
| 8 | Admin tab: template manager | `AdminDashboard.tsx` + new component | ⏱️ 45 min |

**Total: ~5h of focused work**

---

## Key Principle
> **No rework of existing features.** The Gift Funnel is a new _entry point_ into the same machine. Templates are just pre-made chat seeds. Guest flow reuses the same generation pipeline. Email uses Brevo which already works. Everything is additive.
