# AI Performers (Agents)

AI performers are personas that users can interact with to generate music tracks. Each performer has a distinct personality, style, and preferred LLM model.

## Core Performers

- **CJ Remi** – AI performer (details TBD)
- **MELO MC** – AI performer (details TBD)
- **Kosa** – AI performer (details TBD)

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

When a track is generated via chat with a performer, the `personaId` is passed to the backend and stored in `kie_tasks.persona_id`, then linked to the track via `tracks.producer_id`. This allows tracks to display the performer's name and link to their chat. The performer's `suno_version` determines which Suno AI model generates the music.

## Prompt Generation Flow

When a user chats with a performer in `Generator.tsx`:
1. Performer's `system_prompt` + user input → LLM generates song prompt
2. User can **regenerate** ("Nowa wersja") or **edit** ("Edytuj") the prompt
3. Final prompt + performer's `suno_version` → sent to Suno AI API
4. Track linked to performer via `producer_id`

See [[mojhit-prompt-editing|Prompt Regeneration & Editing]] for details.