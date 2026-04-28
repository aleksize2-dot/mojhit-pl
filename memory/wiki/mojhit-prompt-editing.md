# Prompt Regeneration & Editing in Performer Chat

Feature allowing users to edit or regenerate AI-generated song prompts before sending to Suno for music generation.

## Status
- **Implemented:** 2026-04-22
- **Stability:** Ready for testing

## Features

### Regenerate ("Nowa wersja")
- Generates an alternative version of the song prompt with the same meaning but different wording.
- **Backend:** `/api/chat-composer` accepts `regenerate: true` parameter
- **LLM instruction:** "Wygeneruj alternatywną wersję tekstu (inne słowa, ten sam sens). Nie powtarzaj poprzedniej wersji."
- Useful when the first prompt isn't quite right but the user wants a similar theme.

### Edit ("Edytuj")
- Switches the prompt text to a `textarea` for manual editing by the user.
- User can freely modify lyrics, structure, or style.
- Save ("Zapisz") submits the edited prompt; Cancel ("Anuluj") reverts.

### Frontend (`Generator.tsx`)
- Three new state variables: `isEditingPrompt`, `editedLyrics`, `isRegenerating`
- After prompt generation in chat:
  - Buttons appear below the generated text: "Nowa wersja" and "Edytuj"
  - In edit mode: textarea with save/cancel buttons
  - In regenerate mode: loading indicator during generation

### Backend (`index.js`)
- `POST /api/chat-composer` — updated to handle `regenerate` parameter
- Console log `[CHAT COMPOSER] Regenerate mode enabled for agent: {agent}`

## User Flow
1. User chats with AI performer → performer generates a song prompt
2. If unhappy: click "Nowa wersja" → alternative version generated
3. If want specific changes: click "Edytuj" → edit text directly → "Zapisz"
4. Final prompt sent to Suno for music generation

## Cross-links
- [[mojhit-agents|AI Performers (Agents)]]
- [[mojhit-architecture|Architecture]]
- [[dj-marek-ai-composer|DJ Marek AI Composer]]
