const fs = require('fs');
const file = 'server/index.js';
let content = fs.readFileSync(file, 'utf8');

// We will replace the entire /api/tts/generate endpoint with a new one that resolves ElevenLabs voice names to IDs.
const endpointRegex = /\/\/ ----------------------------------------\s*\/\/ TTS Generation\s*\/\/ ----------------------------------------\s*app\.post\('\/api\/tts\/generate'[\s\S]*?\n\}\);\n/;

const newEndpoint = `
// ----------------------------------------
// TTS Generation
// ----------------------------------------
app.post('/api/tts/generate', requireAuth(), async (req, res) => {
  try {
    const { text, voice = 'River' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (process.env.ELEVENLABS_API_KEY) {
      const fetch = require('node-fetch');
      
      // 1. Fetch available voices to resolve name to ID
      let voiceId = 'pNInz6obpgDQGcFmaJcg'; // Fallback to Adam if not found
      try {
        const voicesRes = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }
        });
        if (voicesRes.ok) {
          const voicesData = await voicesRes.json();
          const matchedVoice = voicesData.voices.find(v => v.name.toLowerCase() === voice.toLowerCase());
          if (matchedVoice) {
            voiceId = matchedVoice.voice_id;
          }
        }
      } catch (e) {
        console.error('Failed to resolve ElevenLabs voice ID:', e);
      }

      // 2. Generate TTS
      const response = await fetch(\`https://api.elevenlabs.io/v1/text-to-speech/\${voiceId}\`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2"
        })
      });

      if (!response.ok) {
        throw new Error('ElevenLabs API error: ' + await response.text());
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.json({ audioUrl: \`data:audio/mpeg;base64,\${buffer.toString('base64')}\` });
    } else if (process.env.OPENAI_API_KEY) {
      const { OpenAI } = require('openai');
      const openaiTTS = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const validOpenAIVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
      const mappedVoice = validOpenAIVoices.includes(voice.toLowerCase()) ? voice.toLowerCase() : 'nova';
      
      const mp3 = await openaiTTS.audio.speech.create({
        model: "tts-1",
        voice: mappedVoice,
        input: text,
      });
      const arrayBuffer = await mp3.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.json({ audioUrl: \`data:audio/mpeg;base64,\${buffer.toString('base64')}\` });
    } else {
      return res.status(500).json({ error: 'No TTS provider configured. Add ELEVENLABS_API_KEY or OPENAI_API_KEY.' });
    }
  } catch (err) {
    console.error('[TTS ERROR]', err);
    return res.status(500).json({ error: 'TTS generation failed', details: err.message });
  }
});
`;

if (content.match(endpointRegex)) {
  content = content.replace(endpointRegex, newEndpoint);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Replaced TTS endpoint successfully');
} else {
  console.log('Regex did not match the existing TTS endpoint');
}
