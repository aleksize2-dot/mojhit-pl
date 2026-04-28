const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config({ path: '.env' });

async function test() {
  const KIE_API_KEY = process.env.KIE_API_KEY;
  const KIE_API_BASE_URL = process.env.KIE_API_BASE_URL || 'https://api.kie.ai';

  console.log('Sending task...');
  const res = await fetch(`${KIE_API_BASE_URL}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIE_API_KEY}`
    },
    body: JSON.stringify({
      model: 'elevenlabs/text-to-speech-multilingual-v2',
      input: {
        text: 'Hello, this is a test from Kie.ai ElevenLabs TTS!',
        voice: 'Rachel',
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
        speed: 1
      }
    })
  });

  const data = await res.json();
  console.log('Create task response:', data);

  if (data.code === 200 && data.data && data.data.taskId) {
    const taskId = data.data.taskId;
    console.log('Polling taskId:', taskId);

    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000));
      let pollRes = await fetch(`${KIE_API_BASE_URL}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
        headers: { 'Authorization': `Bearer ${KIE_API_KEY}` }
      });
      
      const pollData = await pollRes.json();
      console.log(`Poll ${i} response state:`, pollData.data?.state);
      if (pollData.data && pollData.data.state === 'success') {
        console.log('Got audio URL!', pollData.data.resultJson);
        break;
      }
      if (pollData.data && pollData.data.state === 'fail') {
        console.log('Task failed:', pollData.data);
        break;
      }
    }
  }
}
test();
