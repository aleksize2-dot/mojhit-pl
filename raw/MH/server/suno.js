/**
 * Suno API v5.5 integration for mojhit.pl
 * Uses sunoapi.org API (third-party wrapper for Suno AI)
 * Documentation: E:\sunoapi\Generate Suno AI Music - Suno API.html
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Generate music using Suno API v5.5
 * Based on documentation: E:\sunoapi\Generate Suno AI Music - Suno API.html
 * 
 * @param {string} prompt - Text description of the music to generate
 * @param {string} style - Optional style/tags (max 120 chars)
 * @param {string} title - Optional track title
 * @param {boolean} instrumental - Whether to generate instrumental only
 * @param {string} model - Model version (e.g., "5.5", "V4_5ALL")
 * @param {boolean} customMode - Whether to use custom mode (requires style/title when instrumental=true)
 * @param {string} personaId - Optional Suno Persona ID for voice cloning
 * @param {string} personaModel - Optional model for persona (e.g., "V4_5ALL")
 * @returns {Promise<string>} taskId from Suno API
 */
const generate = async (prompt, style = '', title = '', instrumental = false, model = '5.5', customMode = false, personaId = '', personaModel = '') => {
  // Get API settings from environment or fallback
  const baseUrl = process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org/api/v1';
  const apiKey = process.env.SUNO_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('Suno API key not configured. Set SUNO_API_KEY environment variable.');
  }

  // Build payload according to Suno API v5.5 documentation
  // Default payload for non-custom mode (simplest setup)
  const payload = {
    prompt: prompt.substring(0, customMode ? 5000 : 500), // Limit based on mode
    instrumental,
    model: model || '5.5',
    callBackUrl: `${process.env.SUNO_CALLBACK_BASE_URL || 'http://localhost:3000'}/api/webhooks/suno`
  };

  // Add persona fields if provided (for voice cloning)
  if (personaId && personaId.trim()) {
    payload.personaId = personaId.trim();
    if (personaModel && personaModel.trim()) {
      payload.personaModel = personaModel.trim();
    }
  }

  // Handle custom mode logic based on documentation
  if (customMode || style || title) {
    payload.customMode = true;
    
    // According to docs:
    // - When customMode=true and instrumental=true: style and title are required
    // - When customMode=true and instrumental=false: style, prompt, and title are required
    // - Style max 120 characters
    if (style) {
      payload.style = style.substring(0, 119);
    }
    if (title) {
      payload.title = title;
    }
    
    // Optional fields that might be useful
    // payload.personaId = "persona_123";  // Example from docs
    // payload.personaModel = "style_persona";
    // payload.negativeTags = "Heavy Metal, Upbeat Drums";
  } else {
    // Non-custom mode: only prompt is required, others should be empty
    payload.customMode = false;
    // Remove style/title if present
    if (payload.style) delete payload.style;
    if (payload.title) delete payload.title;
  }

  console.log('[SUNO API] Request payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Mojhit.pl/1.0'
      },
      body: JSON.stringify(payload),
      timeout: 30000 // 30 seconds timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SUNO API] Error response:', response.status, errorText);
      
      // Map common HTTP errors to user-friendly messages
      if (response.status === 401) throw new Error('Nieprawidłowy klucz API Suno');
      if (response.status === 402) throw new Error('Niewystarczająca liczba kredytów w koncie Suno');
      if (response.status === 429) throw new Error('Przekroczono limit zapytań do Suno API — spróbuj za chwilę');
      if (response.status === 422) throw new Error('Nieprawidłowe parametry generowania (Suno API)');
      if (response.status >= 500) throw new Error('Serwer Suno API chwilowo niedostępny — spróbuj później');
      
      throw new Error(`Suno API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('[SUNO API] Response:', JSON.stringify(data, null, 2));
    
    // Expected response format (assumed similar to Kie.ai):
    // { "code": 200, "msg": "success", "data": { "taskId": "..." } }
    // or Suno-specific format: { "id": "...", "status": "pending" }
    
    if (data.code !== undefined && data.code !== 200) {
      throw new Error(`Suno API returned code ${data.code}: ${data.msg || 'Unknown error'}`);
    }
    
    // Extract task ID from common response formats
    let taskId;
    if (data.data && data.data.taskId) {
      taskId = data.data.taskId;
    } else if (data.id) {
      taskId = data.id;
    } else if (data.taskId) {
      taskId = data.taskId;
    } else {
      console.warn('[SUNO API] Unexpected response structure, trying to find taskId in:', data);
      // Fallback: use first property that looks like an ID
      const candidate = Object.values(data).find(v => typeof v === 'string' && v.length > 10);
      if (candidate) {
        taskId = candidate;
      } else {
        throw new Error('Suno API response missing taskId or id field');
      }
    }
    
    console.log(`[SUNO API] Task created: ${taskId}`);
    return taskId;
  } catch (error) {
    console.error('[SUNO API] Network/parsing error:', error.message);
    // Re-throw with clearer message
    if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
      throw new Error('Timeout łączenia z Suno API — serwer nie odpowiada');
    }
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      throw new Error('Nie można połączyć się z Suno API — sprawdź dostępność serwisu');
    }
    throw error;
  }
};

/**
 * Check status of a Suno generation task
 * @param {string} taskId - Task ID returned by generate()
 * @returns {Promise<Object>} Status object with audio_url, title, duration, etc.
 */
const checkStatus = async (taskId) => {
  const baseUrl = process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org/api/v1';
  const apiKey = process.env.SUNO_API_KEY || '';
  
  try {
    const response = await fetch(`${baseUrl}/status/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Mojhit.pl/1.0'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SUNO STATUS] Error:', response.status, errorText);
      throw new Error(`Suno status check failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[SUNO STATUS] Response:', JSON.stringify(data, null, 2));
    
    // Normalize response format
    // Expected: { "status": "completed", "audio_url": "...", "title": "...", "duration": 123 }
    // or nested in data field
    const result = data.data || data;
    
    return {
      status: result.status || 'unknown',
      audio_url: result.audio_url || result.url || result.audioUrl,
      title: result.title || 'Untitled',
      duration: result.duration || 0,
      variants: result.variants || [],
      raw: result
    };
  } catch (error) {
    console.error('[SUNO STATUS] Error:', error.message);
    return {
      status: 'error',
      error: error.message
    };
  }
};

module.exports = {
  generate,
  checkStatus
};