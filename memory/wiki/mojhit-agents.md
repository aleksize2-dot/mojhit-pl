# AI Performers (Agents)

AI performers are personas that users can interact with to generate music tracks. Each performer has a distinct personality, style, and preferred LLM model.

## Core Performers

### CJ Remi — Polska Fala / Modern Disco Pop-Folk (v3.0)
- **ID:** `cj_remi`
- **Style:** Modern Polish disco, Pop-Folk, Slap House — evolved from pure synth-pop
- **Niche:** Okazje życiowe (🎂💒🚗🌴😊❤️🔥) — celebrations, life moments, not just urban nightlife
- **Model AI:** `anthropic/claude-sonnet-4.6` (changed from `gemini-2.0-flash` on 2026-05-14)
- **Wersja Suno:** V4_5
- **TTS Voice:** River (default, męski)
- **Persona:** 38-year-old DJ/producer, "król nocnego miasta", talks like a professional radio DJ
- **Colors:** Purple + neon (bg-purple-600, text-purple-300, gradient purple→violet→fuchsia)
- **Avatar style:** DJ headphones + neon lights
- **Cena:** 0 (FREE)
- **Tier:** FREE
- **Full profile:** `docs/CJ_REMI_PRODUCER.md` (v3.0)
- **v3.0 Changes (2026-05-14):**
  - **BPM:** 115-120 → 122-128, now covers Slap House, Modern Disco, Pop-Folk
  - **Instruments:** brass section, biesiada elements
  - **Structure:** Post-Chorus added to LYRIC format
  - **Init message:** emoji-based okazje examples (🎂💒🚗🌴😊❤️🔥) instead of default night theme
  - **Removed:** "Jefie" catchphrase, default nighttime theme
  - **Rules:** no pressure after generation, no names → generate immediately, okazja ≠ only birthday
  - Prompt stored in Supabase and synced to `docs/CJ_REMI_PRODUCER.md`
- **Key traits:** Uses okrzyki like "Głośniej!", "Lecimy z tematem!", "Ręce w górę, nie śpimy!"
- **Never greets by time of day** — neutral greetings only

### MELO MC — Ballady / Czułe Historie
- **ID:** `melo_mc`
- **Style:** Ballads, emotional stories, love songs
- **Niche:** Miłość/tęsknota — heartfelt, romantic tracks
- **Model AI:** `anthropic/claude-sonnet-4.6` (changed from `claude-3.7-sonnet` on 2026-05-14)
- **TTS Voice:** Liam (Energetyczny męski)
- **Persona:** Przyjaciółka (friend confidante) — warm, emotional, supportive
- **Colors:** Pink gradient (różowy)
- **Avatar style:** Peruka + okulary (wig + glasses)
- **Full profile:** `docs/MELO_MC_PRODUCER.md`

### Kosa — Rap / Drill / Pewność Siebie
- **ID:** `kosa`
- **Style:** Rap, drill, hard-hitting beats
- **Niche:** Dissy/pewność siebie — confidence, street credibility
- **Model AI:** `deepseek/deepseek-v4-flash` (changed from `claude-3.7-sonnet` on 2026-05-14)
- **Wersja Suno:** V5 (upgraded from V4 on 2026-05-14)
- **TTS Voice:** Roger (Głęboki męski)
- **Persona:** Ziomek z blokowiska (street-wise guy) — Polish slang, direct
- **Colors:** Limonka (lime green)
- **Avatar style:** Czapka + tatuaże (cap + tattoos)
- **Emoji:** 👟🔊
- **Full profile:** `docs/KOSA_PRODUCER.md` (created 2026-05-14)

### La Luz — Polish Latino Fiesta
- **ID:** `la_luz`
- **Created:** 2026-04-27
- **Style:** Reggaeton, Spanish guitar, synth trumpet
- **Niche:** Polska Fiesta (no overlap with CJ Remi, Kosa, MELO MC)
- **Model AI:** `anthropic/claude-sonnet-4.6` (changed from DeepSeek Chat on 2026-05-14)
- **TTS Voice:** Liam (Energetyczny męski)
- **Persona:** Latin lover from Spain — mixes Polish with Spanish phrases
- **Colors:** Yellow/red gradient (słońce)
- **Avatar:** `/avatars/laluz.webp` (also in `public/avatars/`)
- **Midjourney:** Gold chain, earring, floral shirt, sunset gradient
- **Emoji:** 🌴🕺💃🌞
- **Full profile:** `docs/LA_LUZ_PRODUCER.md` + `server/producers/la_luz.js`

### BLIXX — K-Pop / Girl Crush / Electro-House Duet (v2.0)
- **ID:** `blixx`
- **Created:** 2026-05-15
- **Style:** High Energy K-Pop, Electro-House, Club Banger — Heavy 808 + Trap-Step drums
- **Niche:** Girl power / dancefloor / club banger (jedyny duet żeński)
- **Model AI:** `x-ai/grok-4.20`
- **Wersja Suno:** V5_5
- **TTS Voice:** Brak (duet)
- **Persona:** Duet Nika (ostry wokal, liderka) + Riri (rap, słodka z pazurem)
- **Colors:** Fuchsia + Cyan (bg-fuchsia-950, border-cyan-400)
- **Avatar:** `/avatars/blixx.webp` — cyber-pop duet, neon pink glow
- **Emoji:** 🖤💗🔥⚡👑
- **Tier:** basic (FREE for launch, Pro in Faza 3)
- **v2.0 Changes (2026-05-17):**
  - **TAGS:** generic → Heavy 808 Bassline, Trap-Step Drums, Aggressive Brass Stabs, Cyberpunk Synth, Vocal Chops
  - **LYRICS:** dodane [Build-Up] i [Drop / Chorus] dla Electro-House dynamiki
  - **SYGNATURA:** 135 BPM non-stop, Weirdness 30%, Style Influence 85%, Build-Up→Drop
  - **Model:** Grok 4.20 — jedyny producent na tym modelu
- **Full profile:** `docs/BLIXX_PRODUCER.md` + `server/producers/blixx.js`

### SOLANA — Cinematic Ethnic Pop / Afirmacje (v2.0)
- **ID:** `solana`
- **Created:** 2026-05-15
- **Style:** Dark Mystical Folk, Cinematic Ethnic Pop, Spiritual Affirmation
- **Niche:** Afirmacje / transformacja / uzdrowienie duszy (jedyna artystka afirmacyjna)
- **Model AI:** `x-ai/grok-4.20`
- **Wersja Suno:** V5_5
- **TTS Voice:** Brak
- **Persona:** Artystka z Podkarpacia, przewodniczka duchowa — zamienia intencję w dźwięk
- **Colors:** Purple + Amber (bg-purple-950, border-amber-400)
- **Avatar:** `/avatars/solana.webp` — kobieta o zachodzie, plum bluza, złoty naszyjnik
- **Emoji:** 🌅🌿🎻🕯️✨🌊🕺💫
- **Tier:** basic (FREE for launch, Pro in Faza 3)
- **v2.0 Changes (2026-05-17):**
  - **Misja:** z rozmytej na konkretną — dźwiękowa afirmacja, rytuał
  - **5 form afirmacji:** JESTEM, UWALNIAM, PRZYCIĄGAM, DZIĘKUJĘ, WYBIERAM — LLM wybiera pod historię
  - **TAGS:** Shamanic Female Vocals, Tribal Percussion, Celtic Flute, Deep Sub-Bass, 90 BPM
  - **SYGNATURA:** Dark Mystical Folk × Cinematic Ethnic Pop, Weirdness 12%, Style Influence 90%
  - **Problem rozwiązany:** przestała powtarzać "Jestem ciszą, Jestem światłem..."
- **Full profile:** `docs/SOLANA_PRODUCER.md` + `server/producers/solana.js`

### POPIÓŁ — Cinematic Blues Rock Ballad (v2.0)
- **ID:** `popiol`
- **Created:** 2026-05-15
- **Style:** Cinematic Blues Rock Ballad, Power Ballad 80-90s — Saxophone + Hammond Organ
- **Niche:** Ballady / strata / męska czułość (jedyny męski blues-rock)
- **Model AI:** `x-ai/grok-4.20`
- **Wersja Suno:** V5_5
- **TTS Voice:** Brak
- **Persona:** Bluesman z Katowic, wdowiec. Głos niski, chropowaty "jak Tom Waits po polsku"
- **Colors:** Stone + Amber (bg-stone-950, border-amber-600)
- **Avatar:** `/avatars/popiol.webp` — mężczyzna w skórzanej kurtce, amber spotlight
- **Emoji:** 🥃🚬🎸🎹🎷🔥💔
- **Tier:** basic (FREE for launch, Pro in Faza 3)
- **v2.0 Changes (2026-05-17):**
  - **Badge:** "Blues & Soul" → "Blues & Power Ballad"
  - **BPM:** 60-75 → 68-85
  - **TAGS:** generic → Cinematic Blues Rock, Saxophone Solo, Hammond Organ, Gravelly Lived-in Voice
  - **Weirdness/Style:** 5%/95% → 12%/80%
  - **LYRICS:** [Saxophone Solo] + [Guitar Solo] jako dwie kulminacje
- **Full profile:** `docs/POPIOL_PRODUCER.md` + `server/producers/popiol.js`

### DISCO PULS — Italo Disco / Eurodance (pending v2.0)
- **ID:** `disco_puls` (renamed from 2ImPULS on 2026-05-17)
- **Style:** Italo Disco / Eurodance (v2.0 style vector pending — waiting for boss)
- **Model AI:** `x-ai/grok-4.20`
- **Wersja Suno:** V5_5
- **Colors:** Blue (#2563eb, #1e3a5f)
- **Emoji:** 💙🕺✨🔊💿
- **Tier:** basic (FREE for launch, Pro in Faza 3)
- **Status:** ⚠️ v2.0 style pending — renamed, DB updated, JS fallback created
- **Fallback:** `server/producers/disco_puls.js`

### VENA — Dark Trap / Feminine Drill (v2.1)
- **ID:** `vena`
- **Style:** Dark Trap, Feminine Drill — aggressive female energy
- **Niche:** Girl power / street / pewność siebie (żeńska kontra do Kosy)
- **Model AI:** `x-ai/grok-4.20` (upgraded from `grok-4-fast` on 2026-05-17)
- **Tier:** basic (FREE for launch, Pro in Faza 3)
- **v2.1 Changes (2026-05-17):**
  - **Style locked:** Dark Trap/Feminine Drill with aggressive female persona
  - **Model:** `grok-4-fast` → `grok-4.20`
  - **PŁEĆ USERA fix:** gender detection improved in prompt
  - **Universal algorithm + rules** applied
- **Status:** ✅ Core prompt rewritten. Tags/style refinement pending.

## Specialized Performers

- **DJ Marek** – AI producer persona (38 years old, from Szczecin, Polish slang) that helps users generate song prompts for Suno AI. See [DJ Marek AI Composer](dj-marek-ai-composer.md).

## Performer Unlocking

Performers can be unlocked via subscription tiers or one-time purchases. Users can "hire" and "fire" performers via the `MyProducers.tsx` page; hidden state is stored in `localStorage`.

## Performer Configuration (Admin Panel)

### Suno Version Selection
- **Added 2026-04-22:** Each performer now has a `suno_version` field in the database and admin UI.
- **UI Location:** Admin panel → Giełda Talentów → Edit performer → "Wersja Suno" dropdown
- **Options:** V4, V4_5, V4_5 & V4_5PLUS, V4_5ALL, V5_5, V5
- **Default:** V4
- **Migration:** SQL file `add_suno_version_field.sql` (needs to be run via Supabase Dashboard)
- **Generator.tsx:** Uses `activeProducer.suno_version` as the `model` parameter for Suno API calls (defaults to 'V5_5')
- Additional fields: `suno_persona_id`, `suno_persona_model` for voice cloning integration

### Other Configurable Fields (via Admin Panel)
- Name, badge, avatar image, gradient/theme colors
- System prompt and preferred LLM model
- Rental price in coins
- Active status, main page visibility, tier level

## Integration with Tracks

All performers are stored in the `producers` table in Supabase. La Luz was added as a new row alongside CJ Remi, Kosa, and MELO MC.

When a track is generated via chat with a performer, the `personaId` is passed to the backend and stored in `kie_tasks.persona_id`, then linked to the track via `tracks.producer_id`. This allows tracks to display the performer's name and link to their chat. The performer's `suno_version` determines which Suno AI model generates the music.

## Producer Template Standard (2026-04-29)

A standardized template `PRODUCER_TEMPLATE.md` was created for all performer profiles, ensuring consistency:

**Template sections:**
1. **Why Unique** — comparison table across all existing performers (climate, color, model, speech style, emoji, avatar, niche)
2. **System Prompt** — formatted as code block with:
   - Persona description (age, style, role)
   - Golden rules (copyright, never use artist names in tags)
   - Conversation style (max 2-3 sentences, max 1-2 questions, no time-of-day greetings)
   - Algorithm (START → VISION → DETAILS → READINESS → CREATIVITY)
   - Output format (---TITLE---, ---TAGS---, ---LYRICS--- with structure)
   - Musical signature (genre, tempo, instruments, ad-libs)
3. **Theme Config** — JSON for UI colors
4. **UI Configuration** — table (header title, status, thoughts, placeholder, gradient, button gradient, AI model, Suno version, TTS voice, price, tier)

**Key rule enforced across all profiles:** "NIGDY nie witaj się porą dnia" (Never greet by time of day).

The template is stored at `docs/PRODUCER_TEMPLATE.md`.

## Suno Persona API (Voice Cloning) — 2026-04-20

### Concept
PRO-tier users can create a **Suno Persona** (voice clone) from any track they generated. Once created, the persona can be selected during future generations to use the cloned voice, giving each PRO user a unique, consistent AI voice.

### Business Logic (PRO Tier Only)
- Persona creation restricted to users with `subscription_tier = 'pro'`
- Persona linked to user via `user_producers` junction table with `expires_at = NULL` (permanent)
- Producers of type `'suno'` store Suno Persona ID for future use in generations

### Technical Flow
```
User (PRO) → Generate track → Get taskId/audioId → Create Persona → Store personaId in producers
    ↓
Future generation → Include personaId → Suno API uses cloned voice
```

### Database Changes (Migration: `sql/add_suno_persona_fields.sql`)
Columns added to `producers` table:
- `suno_persona_id` (TEXT) — Suno's persona identifier
- `suno_persona_model` (TEXT) — model variant (e.g. V4_5ALL, 5.5)
- `source_audio_url` (TEXT) — base audio used for cloning
- `source_task_id` (TEXT) — originating task
- `vocal_start` (INTEGER) — vocal snippet start (seconds)
- `vocal_end` (INTEGER) — vocal snippet end (seconds)
- `type` (TEXT) — e.g. `'suno'`

Also added `subscription_tier` column to `users` table (free/pro/enterprise).

### API Endpoints (Backend `index.js`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/personas/create` | POST | Create persona from user's track (PRO only) |
| `/api/personas` | GET | List user's personas (AI producers) |
| `/api/personas/:personaId` | DELETE | Delete persona (unlink from user) |

### Extended Generation
- `POST /api/suno/generate` now accepts `personaId` and `personaModel` in request body
- Fallback logic passes persona parameters to both Kie and Suno providers

### Critical Notes
- Suno Persona API endpoint: `POST /api/v1/generate/generate-persona`
- Each audio can only create one persona (API restriction)
- Vocal range: 0–30 seconds typical, up to 120 seconds max
- Personas work with Suno models (V4_5ALL, 5.5, etc.)

### Status (as of 2026-04-21)
- **Postponed** — Focus shifted to video generation for PRO tier instead
- SQL migration script exists but needs to be run via Supabase Dashboard
- Frontend integration (UI for "Create AI Producer" button, persona selection, "My AI Producers" page) not yet implemented
- Subscription tier updates (Clerk webhook → set `subscription_tier`) not yet implemented
- See `memory/2026-04-20.md` for full details

## ElevenLabs TTS Integration (2026-04-28)

### Background
Each performer can have a TTS voice that narrates chat messages. The voice ID is stored in `producers.theme_config.elevenlabs_voice`.

### Bugs Fixed
- **`fetch is not a function`** — `require('node-fetch')` fails on v3+ (ESM-only). Changed to `await import('node-fetch')`.
- **TTS timeout** — Increased from 30s to 60s (30 polls × 2s interval).
- **Voice from admin not applying** — `elevenlabs_voice` was stored in `theme_config` JSON but never extracted in the TTS hook. Added `elevenlabsVoice` to producer mapping.

### Per-Producer Voice Configuration
| Performer | Voice | Description |
|-----------|-------|-------------|
| Melo MC | `Liam` | Energetyczny męski |
| Kosa | `Roger` | Głęboki męski |
| La Luz | `Liam` | Energetyczny męski |
| CJ Remi | `River` | Default voice |

### "Bez głosu" Option
- When `elevenlabs_voice` is empty/null, TTS handler silently skips voice generation (no audio for that performer's messages).
- Configurable via admin panel per performer.

### Roadmap (mojhit-voice-plan.md)
5 phases documented in `E:\KIE\mojhit-voice-plan.md`:
1. Custom voices per performer ✅
2. Turbo TTS (lower latency)
3. Dialogue between performers
4. Speech-to-text (user voice input)
5. Sound effects

## Model & Producer Sync (2026-05-14)

### Major Model Update
All performers were re-evaluated and their models updated in both Supabase and local producer files:

| Performer | Old Model | New Model (2026-05-14) |
|-----------|-----------|----------------------|
| CJ Remi | `gemini-2.0-flash` | `anthropic/claude-sonnet-4.6` |
| MELO MC | `anthropic/claude-3.7-sonnet` | `anthropic/claude-sonnet-4.6` |
| Kosa | `anthropic/claude-3.7-sonnet` | `deepseek/deepseek-v4-flash` |
| La Luz | `deepseek/deepseek-chat` | `anthropic/claude-sonnet-4.6` |

### Admin Panel Model Catalog
Updated 2026-05-14: Added Grok 4.3, 4.20, 4 Fast, DeepSeek V4 Flash. Removed Xiaomi.

### Producer Sync
All `server/producers/*.js` files (cj_remi.js, kosa.js, melo_mc.js, la_luz.js) are now synchronized with Supabase. OpenRouter apiKey synced to api_settings.

## Kosa Model Changes (2026-04-28)
- **Original:** `x-ai/grok-2-vision-1212` via OpenRouter — returned 404 error.
- **Changed to:** `x-ai/grok-4-fast` — also had issues.
- **Previous:** `anthropic/claude-3.7-sonnet` — working model for Kosa until 2026-05-14.
- **Current (2026-05-14):** `deepseek/deepseek-v4-flash` with Suno V5.

## Melo MC Producer Prompt (2026-04-28)
- Created `docs/MELO_MC_PRODUCER.md` with full system prompt template.
- Reset DB prompt to basic version for manual admin editing via admin panel.

## 🧭 Universal Algorithm (All 9 Producers — 2026-05-17)

Every producer now follows the same 4-step conversation flow + 3 interactive elements:

| Step | Name | Description |
|------|------|-------------|
| 1 | **START + IMIĘ** | Greet + ask for recipient's name |
| 2 | **OKAZJA** | Ask about occasion with 3-4 specific examples |
| 3 | **DETALE** | Ask about the person (traits, vibe, story) |
| 4 | **POTWIERDŹ** | Confirm all details before generating |

### Interactive Elements
- **ZWIERCIADŁO (Mirror):** Reflect user's words back to show understanding
- **PODPOWIEDZI (Hints):** Offer 3-4 concrete suggestions for each question
- **REAKCJA EMOCJONALNA:** React with appropriate emotion to user's story

## 📜 Universal Rules (All 9 Producers — 2026-05-17)

| Rule | Description |
|------|-------------|
| 🎂 **DATY I LICZBY** | Ask about age/date for jubilees and milestone birthdays |
| 👤 **RELACJA ≠ IMIĘ** | "Dla mamy" → ask for the name. Baked into step 1 of algorithm |
| 🚫 **BEZ AUTOPROMOCJI** | Performer name only in Intro/Outro. Removed from LYRICS examples |
| ⚠️ **ODMIANA IMION** | Polish declension: "dla Krzysztofa", not "dla Krzysztof" |
| 🚫 **GROK BUG** | "dodać" → "[artysta]ć" — replaced with "dopisać" in all prompts |
| 🚫 **TITLE SAFETY** | Title only with a name, no English placeholders |

## Prompt Generation Flow

When a user chats with a performer in `Generator.tsx`:
1. Performer's `system_prompt` + user input → LLM generates song prompt
2. User can **regenerate** ("Nowa wersja") or **edit** ("Edytuj") the prompt
3. Final prompt + performer's `suno_version` → sent to Suno AI API
4. Track linked to performer via `producer_id`

See [[mojhit-prompt-editing|Prompt Regeneration & Editing]] for details.

## 🔴 Prompt Quality Crisis (2026-05-15)

### Summary
Live testing revealed that **all 9 producer prompts** produce unsatisfactory results:
- Problems span: format, persona consistency, text quality — everything
- User deeply disappointed — this is **Priority #1**

### Root Cause
- 9 prompts were created in bulk without live testing between iterations
- No iterative quality control loop was applied

### Recovery Plan
1. **Pick ONE producer** (recommended: **Kosa** — Rap/Drill) and perfect it
2. Use the perfected prompt as a **template/skeleton** for all other producers
3. **Test LIVE after every change** — not batch, not blind
4. Shorter prompts, better structure, more testing cycles
5. **Do NOT create new producers** until existing ones are fixed

### Golden Rule Going Forward
> One producer → test → iterate → locked → next producer.
> Quality over quantity. Never ship 9 prompts untested.

### Progress (2026-05-17)
- ✅ **BLIXX v2.1** — K-Pop/Electro-House, Heavy 808, 135 BPM, Weirdness 30% (Grok 4.20, Suno V5_5)
- ✅ **SOLANA v2.5** — 5 affirmation forms, Dark Mystical Folk × Cinematic Ethnic Pop
- ✅ **POPIÓŁ v2.1** — Blues/Power Ballad, Saxophone/Guitar solos, Hammond Organ, Weirdness 12%
- ✅ **VENA v2.1** — Dark Trap/Feminine Drill, grok-4.20, PŁEĆ USERA fix
- ✅ **DISCO PULS v3.1** — Renamed from 2ImPULS, style evolved 4×, final: Puls Miasta Polo Vibes
- ✅ **CJ Remi, Kosa, MELO MC, La Luz** — Universal algorithm + rules applied

### Status
- ✅ **All 9 producers have universal algorithm + rules** (2026-05-17)
- ⚠️ **CJ Remi, Kosa, MELO MC, La Luz** — style deep-dive still pending
- ⚠️ **VENA, Kosa** — tag refinement pending
- ⚠️ **DISCO PULS** — producer doc not yet created