/**
 * Kie.ai MP4 Video Generation API integration for mojhit.pl
 * Documentation: https://docs.kie.ai/api/mp4-generation
 * 
 * Video generation creates a music video from an existing audio track.
 * Videos are stored for 14 days on Kie.ai storage.
 * 
 * Requires:
 * - audioId (Kie.ai audio ID) or audioTaskId (Kie task ID)
 * - Optional branding: author, domainName watermark
 * - Callback URL for webhook notification
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Generate video from existing audio track
 * 
 * @param {string} audioTaskId - Kie.ai task ID of the audio generation (from kie_tasks.task_id)
 * @param {string} audioId - Kie.ai audio ID (from kie_tasks response, e.g., sunoData[0].id)
 * @param {Object} options - Optional parameters
 * @param {string} options.author - Author name for watermark (default: "mojhit.pl")
 * @param {string} options.domainName - Domain for watermark (default: "mojhit.pl")
 * @param {string} options.callbackUrl - Override default callback URL
 * @returns {Promise<string>} videoTaskId from Kie API
 */
const generate = async (audioTaskId, audioId, options = {}) => {
  const {
    author = 'mojhit.pl',
    domainName = 'mojhit.pl',
    callbackUrl = `${process.env.KIE_CALLBACK_BASE_URL || 'http://localhost:3000'}/api/webhooks/kie/video`
  } = options;

  if (!audioTaskId || !audioId) {
    throw new Error('audioTaskId and audioId are required for video generation');
  }

  // According to Kie.ai docs, endpoint is POST /api/v1/mp4/generate
  // Payload: { taskId: audioTaskId, audioId, author, domainName, callBackUrl }
  const payload = {
    taskId: audioTaskId,
    audioId,
    author,
    domainName,
    callBackUrl: callbackUrl
  };

  console.log('[KIE VIDEO] Request payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${process.env.KIE_API_BASE_URL}/api/v1/mp4/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KIE_API_KEY}`
      },
      body: JSON.stringify(payload),
      timeout: 30000 // 30 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[KIE VIDEO] Error response:', response.status, errorText);
      
      // Map common HTTP errors to user-friendly messages
      if (response.status === 401) throw new Error('Nieprawidłowy klucz API Kie.ai');
      if (response.status === 402) throw new Error('Niewystarczająca liczba kredytów w koncie Kie.ai');
      if (response.status === 429) throw new Error('Przekroczono limit zapytań do Kie.ai — spróbuj za chwilę');
      if (response.status === 422) throw new Error('Kie.ai video API returned code 422: Mp4 record already exists');
      if (response.status >= 500) throw new Error('Serwer Kie.ai chwilowo niedostępny — spróbuj później');
      
      throw new Error(`Kie.ai video API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('[KIE VIDEO] Response:', JSON.stringify(data, null, 2));
    
    // Expected response format: { code: 200, msg: "success", data: { taskId: "..." } }
    if (data.code !== 200) {
      throw new Error(`Kie.ai video API returned code ${data.code}: ${data.msg || 'Unknown error'}`);
    }
    
    if (!data.data || !data.data.taskId) {
      throw new Error('Kie.ai video API response missing taskId');
    }
    
    const videoTaskId = data.data.taskId;
    console.log(`[KIE VIDEO] Video task created: ${videoTaskId}`);
    return videoTaskId;
  } catch (error) {
    if (!error.message.includes('422')) console.error('[KIE VIDEO] Error:', error.message);
    // Re-throw with clearer message
    if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
      throw new Error('Timeout łączenia z Kie.ai video API — serwer nie odpowiada');
    }
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      throw new Error('Nie można połączyć się z Kie.ai video API — sprawdź dostępność serwisu');
    }
    throw error;
  }
};

/**
 * Check status of a video generation task
 * @param {string} videoTaskId - Task ID returned by generate()
 * @returns {Promise<Object>} Status object with video_url, thumbnail_url, duration, etc.
 */
const getTaskStatus = async (videoTaskId) => {
  // Assuming similar endpoint as audio status: GET /api/v1/generate/record-info?taskId=...
  const url = `${process.env.KIE_API_BASE_URL}/api/v1/mp4/record-info?taskId=${videoTaskId}`;
  console.log(`[KIE VIDEO STATUS] Checking status: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.KIE_API_KEY}`
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[KIE VIDEO STATUS] HTTP error: ${response.status}`, errorText);
      throw new Error(`Video status check failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[KIE VIDEO STATUS] Response:`, JSON.stringify(data, null, 2));
    
    // Normalize response format
    // Kie returns: { code: 200, msg: "success", data: { taskId, successFlag, response: { videoUrl }, ... } }
    const result = data.data || data;
    
    // Map Kie response to our status format
    // From docs: successFlag is PENDING | SUCCESS | CREATE_TASK_FAILED | GENERATE_MP4_FAILED
    let status = 'unknown';
    const flag = result.successFlag || '';
    if (flag === 'SUCCESS' || result.status === 'completed') {
      status = 'completed';
    } else if (flag === 'CREATE_TASK_FAILED' || flag === 'GENERATE_MP4_FAILED' || flag === 'FAILED' || result.status === 'failed' || result.errorCode || result.errorMessage) {
      status = 'failed';
    } else if (flag === 'PENDING') {
      status = 'processing';
    } else if (result.status) {
      status = result.status;
    }
    
    // Video URL may be nested in result.response.videoUrl or at top level
    const resp = result.response || {};
    const videoUrl = resp.videoUrl || resp.video_url || result.videoUrl || result.video_url || result.url;
    const thumbnailUrl = resp.thumbnailUrl || resp.thumbnail_url || result.thumbnailUrl || result.thumbnail_url || result.imageUrl || resp.imageUrl;
    const duration = result.duration || resp.duration || 0;
    
    return {
      status,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      duration,
      expires_at: result.expiresAt || result.expires_at || resp.expiresAt || resp.expires_at,
      raw: result
    };
  } catch (error) {
    console.error('[KIE VIDEO STATUS] Error:', error.message);
    return {
      status: 'error',
      error: error.message
    };
  }
};

/**
 * Fetch Suno audio ID from KIE record-info API (last resort fallback)
 * @param {string} kieTaskId - The KIE audio task ID (task_id from kie_tasks)
 * @returns {Promise<string|null>} The Suno audio ID or null
 */
const getSunoAudioId = async (kieTaskId) => {
  const url = `${process.env.KIE_API_BASE_URL}/api/v1/generate/record-info?taskId=${kieTaskId}`;
  console.log(`[KIE AUDIO INFO] Fetching Suno data for task: ${kieTaskId}`);
  
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${process.env.KIE_API_KEY}` },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.warn(`[KIE AUDIO INFO] HTTP ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const sunoData = data?.data?.response?.sunoData 
      || data?.data?.sunoData 
      || data?.response?.sunoData;
    
    if (sunoData && sunoData.length > 0 && sunoData[0].id) {
      console.log('[KIE AUDIO INFO] Found Suno audio ID:', sunoData[0].id);
      return sunoData[0].id;
    }
    
    return null;
  } catch (error) {
    console.warn('[KIE AUDIO INFO] Error:', error.message);
    return null;
  }
};

module.exports = {
  generate,
  getTaskStatus,
  getSunoAudioId
};