const generate = async (prompt, style = '', title = '', instrumental = false, model = 'V4', customMode = false, personaId = '', personaModel = '') => {
  const payload = {
    prompt,
    customMode,
    instrumental,
    model,
    callBackUrl: `${process.env.KIE_CALLBACK_BASE_URL || 'http://localhost:3000'}/api/webhooks/kie`
  };
  
  if (customMode || style || title) {
    payload.customMode = true; // force custom mode if style or title provided
    if (style) {
      payload.style = style.substring(0, 499); // max 500 chars
      // Infer vocalGender from style
      const s = style.toLowerCase();
      if (s.includes('female') || s.includes('żeńsk') || s.includes('dziewcz')) {
        payload.vocalGender = 'f';
      } else if (s.includes('male') || s.includes('męsk') || s.includes('chłop')) {
        payload.vocalGender = 'm';
      }
    }
    if (title) payload.title = title;
  }

  // Если переходим на customMode: true — добавить проверки по лимитам из спецификации
  const response = await fetch(`${process.env.KIE_API_BASE_URL}/api/v1/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.KIE_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Kie.ai API error:', response.status, errorText);
    
    // Обработка специфичных кодов ошибок
    if (response.status === 402) throw new Error('Niewystarczająca liczba kredytów w koncie kie.ai');
    if (response.status === 429) throw new Error('Przekroczono limit zapytań — spróbuj za chwilę');
    if (response.status === 422) throw new Error('Nieprawidłowe parametry generowania');
    
    throw new Error(`Kie.ai API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('Kie.ai response:', JSON.stringify(data, null, 2));
  
  // Успешный ответ: { code: 200, msg: "success", data: { taskId: "..." } }
  if (data.code !== 200) {
    throw new Error(`Kie.ai API returned code ${data.code}: ${data.msg}`);
  }
  if (!data.data || !data.data.taskId) {
    throw new Error('Kie.ai API response missing taskId');
  }
  return data.data.taskId;
};

const getTaskStatus = async (taskId) => {
  // Correct endpoint from kie.ai docs: GET /api/v1/generate/record-info?taskId=...
  const url = `${process.env.KIE_API_BASE_URL}/api/v1/generate/record-info?taskId=${taskId}`;
  console.log(`[KIE STATUS] Checking status: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${process.env.KIE_API_KEY}`
    }
  });
  
  if (!response.ok) {
    console.error(`[KIE STATUS] HTTP error: ${response.status}`);
    throw new Error(`Status check failed: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`[KIE STATUS] Response:`, JSON.stringify(data, null, 2));
  return data;
};

module.exports = { generate, getTaskStatus };
