const fs = require('fs');
const file = 'server/index.js';
let content = fs.readFileSync(file, 'utf8');

const ttsEndpoint = `
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
      // Use ElevenLabs
      // If voice is a name, we'd ideally need the ID, but assuming 'voice' here is the Voice ID if configured correctly,
      // or we can fallback to a default voice ID. Let's assume voice is the ID or we just pass it.
      // Actually 'River' is a voice name, but ElevenLabs API needs the ID. If we don't have the ID mapping, we might fail.
      // But let's pass it anyway. If it fails, the catch block will handle it.
      // Wait, 'River' could be the pre-made voice ID: we don't know it. But let's try.
      const fetch = require('node-fetch');
      const response = await fetch(\`https://api.elevenlabs.io/v1/text-to-speech/\${voice}\`, {
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
      // Use OpenAI
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

const targetAnchor = `app.post('/api/chat-composer', async (req, res) => {`;
if (content.includes(targetAnchor) && !content.includes('/api/tts/generate')) {
  content = content.replace(targetAnchor, ttsEndpoint + targetAnchor);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Inserted TTS endpoint successfully');
} else if (content.includes('/api/tts/generate')) {
  console.log('Endpoint already exists');
} else {
  console.log('Target anchor not found');
}
