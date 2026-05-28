---
name: moss-tts
description: Ultra-lightweight local TTS using MOSS-TTS-Nano (0.1B params). Runs on CPU, supports 20 languages including Polish and Russian. Use when Black needs to generate spoken audio — for storytelling, voice replies, audio notes, or any time voice output is requested. Triggers on requests like "say it", "speak", "voice", "powiedz to", "скажи это", or when audio/voice delivery is explicitly wanted.
---

# MOSS-TTS-Nano TTS

Local, CPU-only text-to-speech via [MOSS-TTS-Nano](https://github.com/OpenMOSS/MOSS-TTS-Nano).

## Quick Use

```powershell
$audioPath = & "$env:SKILL_DIR\scripts\speak.ps1" -Text "Your text here" [-Voice default|male|female]
```

The script returns the path to the generated WAV file. Deliver it as MEDIA:

```
MEDIA:$audioPath
```

## Voices

| Voice | Reference | Character |
|-------|-----------|-----------|
| `default` | `en_2.wav` | Warm, neutral male |
| `male` | `en_3.wav` | Deeper male |
| `female` | `en_7.wav` | Clear female |

**Voice cloning:** Replace the reference WAV in the script with your own 5-15 second clean speech sample.

## Workflow

1. Generate text to speak (keep under 500 chars for best latency)
2. Run `speak.ps1 -Text "..." [-Voice female]`
3. Get WAV path from stdout
4. Reply with `MEDIA:<path>` to deliver the audio

## Constraints

- **Text length:** Keep under 500 characters per generation for responsiveness. Split longer text into chunks.
- **Supported languages:** pl, ru, en, de, es, fr, ja, ko, zh + more (auto-detected)
- **Latency:** ~15-30 seconds on CPU for typical sentences
- **Required:** Python 3.12 at `C:\Users\Admin\AppData\Local\Programs\Python\Python312\`
- **Post-generation:** Delete temp audio files after delivery to save space
