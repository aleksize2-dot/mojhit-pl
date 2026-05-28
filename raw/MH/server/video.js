/**
 * Video Generation API integration for mojhit.pl
 * Supports both KIE.ai and sunoapi.org (identical API format)
 * 
 * Both providers use: POST /api/v1/mp4/generate
 * Videos stored for 14-15 days.
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Get provider-specific config
 */
function getProviderConfig(provider) {
  const isSuno = provider === 'suno';
  return {
    isSuno,
    apiBaseUrl: isSuno
      ? (process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org/api/v1')
      : (process.env.KIE_API_BASE_URL || 'https://api.kie.ai'),
    apiKey: isSuno
      ? (process.env.SUNO_API_KEY || '')
      : (process.env.KIE_API_KEY || ''),
    callbackBase: isSuno
      ? (process.env.SUNO_CALLBACK_BASE_URL || process.env.KIE_CALLBACK_BASE_URL || 'http://localhost:3000')
      : (process.env.KIE_CALLBACK_BASE_URL || 'http://localhost:3000'),
    label: isSuno ? 'SUNO' : 'KIE',
    // sunoapi.org base URL already includes /api/v1, KIE doesn't
    endpointPrefix: isSuno ? '' : '/api/v1'
  };
}

/**
 * Generate video from existing audio track
 * 
 * @param {string} audioTaskId - Task ID of the audio generation
 * @param {string} audioId - Audio ID from the generation response
 * @param {Object} options - Optional parameters
 * @param {string} options.provider - 'kie' (default) or 'suno'
 * @param {string} options.author - Author name for watermark
 * @param {string} options.domainName - Domain for watermark
 * @param {string} options.callbackUrl - Override default callback URL
 * @returns {Promise<string>} videoTaskId
 */
const generate = async (audioTaskId, audioId, options = {}) => {
  const {
    author = 'mojhit.pl',
    domainName = 'mojhit.pl',
    provider = 'kie',
    callbackUrl: _callbackUrl = ''
  } = options;

  const cfg = getProviderConfig(provider);
  const defaultCallbackUrl = `${cfg.callbackBase}/api/webhooks/kie/video`;
  const finalCallbackUrl = _callbackUrl || defaultCallbackUrl;

  // Append webhook secret token
  const webhookSecret = process.env.KIE_WEBHOOK_SECRET || process.env.SUNO_WEBHOOK_SECRET || '';
  let callbackUrl = finalCallbackUrl;
  if (webhookSecret) {
    const sep = callbackUrl.includes('?') ? '&' : '?';
    callbackUrl = `${callbackUrl}${sep}token=${encodeURIComponent(webhookSecret)}`;
  }

  if (!audioTaskId || !audioId) {
    throw new Error('audioTaskId and audioId are required for video generation');
  }

  const payload = { taskId: audioTaskId, audioId, author, domainName, callBackUrl: callbackUrl };
  console.log(`[${cfg.label} VIDEO] Request:`, JSON.stringify(payload, null, 2));

  try {
    const endpoint = `${cfg.apiBaseUrl}${cfg.endpointPrefix}/mp4/generate`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`
      },
      body: JSON.stringify(payload),
      timeout: 30000
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${cfg.label} VIDEO] Error ${response.status}:`, errorText);
      
      if (response.status === 401) throw new Error(`Nieprawid\u0142owy klucz API ${cfg.label}`);
      if (response.status === 402) throw new Error(`Niewystarczaj\u0105ca liczba kredyt\u00f3w w koncie ${cfg.label}`);
      if (response.status === 429) throw new Error(`Przekroczono limit zapyta\u0144 do ${cfg.label} \u2014 spr\u00f3buj za chwil\u0119`);
      if (response.status === 422) throw new Error(`${cfg.label} video API: Mp4 record already exists`);
      if (response.status >= 500) throw new Error(`Serwer ${cfg.label} chwilowo niedost\u0119pny`);
      
      throw new Error(`${cfg.label} video API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log(`[${cfg.label} VIDEO] Response:`, JSON.stringify(data, null, 2));
    
    if (data.code !== 200) {
      throw new Error(`${cfg.label} video API returned code ${data.code}: ${data.msg || 'Unknown error'}`);
    }
    
    if (!data.data || !data.data.taskId) {
      throw new Error(`${cfg.label} video API response missing taskId`);
    }
    
    const videoTaskId = data.data.taskId;
    console.log(`[${cfg.label} VIDEO] Task created: ${videoTaskId}`);
    return videoTaskId;
  } catch (error) {
    if (!error.message.includes('422')) console.error(`[${cfg.label} VIDEO] Error:`, error.message);
    if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
      throw new Error(`Timeout \u0142\u0105czenia z ${cfg.label} video API`);
    }
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      throw new Error(`Nie mo\u017cna po\u0142\u0105czy\u0107 si\u0119 z ${cfg.label} video API`);
    }
    throw error;
  }
};

/**
 * Check status of a video generation task
 * @param {string} videoTaskId - Task ID from generate()
 * @param {string} provider - 'kie' (default) or 'suno'
 * @returns {Promise<Object>} Status object
 */
const getTaskStatus = async (videoTaskId, provider = 'kie') => {
  const cfg = getProviderConfig(provider);
  const url = `${cfg.apiBaseUrl}${cfg.endpointPrefix}/mp4/record-info?taskId=${videoTaskId}`;
  console.log(`[${cfg.label} VIDEO STATUS] Checking: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${cfg.apiKey}` },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.error(`[${cfg.label} VIDEO STATUS] HTTP ${response.status}`);
      throw new Error(`Video status check failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[${cfg.label} VIDEO STATUS] Response:`, JSON.stringify(data, null, 2));
    
    const result = data.data || data;
    const flag = result.successFlag || '';
    let status = 'unknown';
    if (flag === 'SUCCESS' || result.status === 'completed') status = 'completed';
    else if (flag === 'CREATE_TASK_FAILED' || flag === 'GENERATE_MP4_FAILED' || flag === 'FAILED' || result.status === 'failed') status = 'failed';
    else if (flag === 'PENDING') status = 'processing';
    else if (result.status) status = result.status;
    
    const resp = result.response || {};
    return {
      status,
      video_url: resp.videoUrl || resp.video_url || result.videoUrl || result.video_url || result.url,
      thumbnail_url: resp.thumbnailUrl || resp.thumbnail_url || result.thumbnailUrl || result.thumbnail_url || result.imageUrl || resp.imageUrl,
      duration: result.duration || resp.duration || 0,
      expires_at: result.expiresAt || result.expires_at || resp.expiresAt || resp.expires_at,
      raw: result
    };
  } catch (error) {
    console.error(`[${cfg.label} VIDEO STATUS] Error:`, error.message);
    return { status: 'error', error: error.message };
  }
};

/**
 * Fetch audio ID from provider's record-info API
 * @param {string} taskId - The audio task ID
 * @param {number} variantIndex - The index of the audio track (0 for V1, 1 for V2)
 * @returns {Promise<string|null>} The audio ID or null
 */
const getAudioInfo = async (taskId, variantIndex = 0) => {
  const cfg = getProviderConfig('kie');
  try {
    const endpoint = `${cfg.apiBaseUrl}${cfg.endpointPrefix}/task/${taskId}`;
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${cfg.apiKey}` }
    });
    const data = await response.json();
    const sunoData = data?.data?.response?.sunoData 
      || data?.data?.sunoData 
      || data?.response?.sunoData;
    
    if (sunoData && sunoData.length > variantIndex && sunoData[variantIndex].id) {
      console.log(`[${cfg.label} AUDIO INFO] Found audio ID for variant ${variantIndex}:`, sunoData[variantIndex].id);
      return sunoData[variantIndex].id;
    } else if (sunoData && sunoData.length > 0 && sunoData[0].id) {
      console.log(`[${cfg.label} AUDIO INFO] Fallback to first audio ID:`, sunoData[0].id);
      return sunoData[0].id;
    }
    
    return null;
  } catch (error) {
    console.warn(`[${cfg.label} AUDIO INFO] Error:`, error.message);
    return null;
  }
};

module.exports = { generate, getTaskStatus, getAudioInfo };
