const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Generate Text-to-Speech using Kie.ai (ElevenLabs)
 * @param {string} text - The text to speak
 * @param {string} voice - Voice name (e.g. Rachel, Adam)
 * @returns {Promise<string>} audio URL
 */
const generateTTS = async (text, voice = 'Rachel') => {
  const baseUrl = process.env.KIE_API_BASE_URL || 'https://api.kie.ai';
  const apiKey = process.env.KIE_API_KEY;

  if (!apiKey) {
    throw new Error('Kie.ai API key not configured.');
  }

  // 1. Create task
  const payload = {
    model: 'elevenlabs/text-to-dialogue-v3',
    input: {
      dialogue: [
        {
          text,
          voice
        }
      ],
      language_code: 'pl'
    }
  };

  const createRes = await fetch(`${baseUrl}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const createData = await createRes.json();
  if (!createRes.ok || createData.code !== 200 || !createData.taskId) {
    throw new Error(`Failed to create TTS task: ${JSON.stringify(createData)}`);
  }

  const taskId = createData.taskId;
  console.log(`[TTS] Task created: ${taskId}`);

  // 2. Poll for result
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds
  
  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 1000));
    attempts++;

    const statusRes = await fetch(`${baseUrl}/api/v1/jobs/get-task-detail?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const statusData = await statusRes.json();
    if (!statusRes.ok) {
      console.warn(`[TTS] Status fetch failed: ${statusRes.status}`);
      continue;
    }

    if (statusData.code === 200 && statusData.data && statusData.data.status === 'SUCCESS') {
      const audioUrl = statusData.data.output?.audio_url;
      if (audioUrl) {
        return audioUrl;
      } else {
        throw new Error('TTS task succeeded but no audio_url was found.');
      }
    } else if (statusData.data?.status === 'FAILED') {
      throw new Error(`TTS task failed: ${statusData.data.reason || 'Unknown reason'}`);
    }
  }

  throw new Error('TTS task timed out after 30 seconds');
};

module.exports = { generateTTS };
