require('dotenv').config();
const { OpenAI } = require('openai');

async function test() {
  try {
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    
    console.log('Sending request to openrouter...');
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: 'hello' }],
    });
    
    console.log(response.choices[0].message);
  } catch (err) {
    console.error('ERROR:', err.message);
    if (err.response) console.error(err.response.data);
  }
}

test();
