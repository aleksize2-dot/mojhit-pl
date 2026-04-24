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

## Integration with Tracks

When a track is generated via chat with a performer, the `personaId` is passed to the backend and stored in `kie_tasks.persona_id`, then linked to the track via `tracks.producer_id`. This allows tracks to display the performer's name and link to their chat.