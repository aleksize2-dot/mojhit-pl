/**
 * Suno Persona API integration for mojhit.pl
 * Creates personalized music personas from existing Suno tracks
 * Documentation: E:\sunoapi\persona\Generate Persona - Suno API.html
 * 
 * Features:
 * - Create persona from existing Suno/KIE track
 * - Store personaId in producers table
 * - Use persona in future generations (personaId + personaModel)
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Create a new persona from an existing audio track
 * 
 * @param {string} taskId - Suno task ID (from generate() response)
 * @param {string} audioId - Audio ID (UUID format, can be same as taskId or different)
 * @param {string} name - Persona name (e.g., "Electronic Pop Singer")
 * @param {string} description - Persona description
 * @param {string} style - Music style (e.g., "Electronic Pop")
 * @param {number} vocalStart - Start time of vocal segment (seconds, 0-30)
 * @param {number} vocalEnd - End time of vocal segment (seconds, 0-30)
 * @returns {Promise<Object>} { personaId: string, name: string, description: string }
 */
const createPersona = async (
  taskId,
  audioId,
  name,
  description,
  style = '',
  vocalStart = 0,
  vocalEnd = 30
) => {
  const baseUrl = process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org/api/v1';
  const apiKey = process.env.SUNO_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('Suno API key not configured. Set SUNO_API_KEY environment variable.');
  }

  // Validate parameters
  if (!taskId || !audioId || !name || !description) {
    throw new Error('Missing required parameters: taskId, audioId, name, description');
  }

  if (vocalStart < 0 || vocalEnd > 120 || vocalStart >= vocalEnd) {
    throw new Error('Invalid vocal range: must be 0 <= start < end <= 120 seconds');
  }

  // Build payload according to Suno Persona API documentation
  const payload = {
    taskId,
    audioId,
    name: name.substring(0, 100),
    description: description.substring(0, 500),
    vocalStart,
    vocalEnd
  };

  if (style && style.trim()) {
    payload.style = style.substring(0, 100);
  }

  console.log('[SUNO PERSONA] Creating persona with payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${baseUrl}/generate/generate-persona`, {
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
      console.error('[SUNO PERSONA] Error response:', response.status, errorText);
      
      // Map common HTTP errors to user-friendly messages
      if (response.status === 400) throw new Error('Nieprawidłowe parametry osoby (taskId/audioId mogą być nieprawidłowe)');
      if (response.status === 401) throw new Error('Nieprawidłowy klucz API Suno');
      if (response.status === 402) throw new Error('Niewystarczająca liczba kredytów w koncie Suno');
      if (response.status === 404) throw new Error('Nie znaleziono zadania (taskId) lub audio (audioId)');
      if (response.status === 409) throw new Error('Osoba dla tego audio już istnieje (każde audio może utworzyć tylko jedną osobę)');
      if (response.status === 422) throw new Error('Nieprawidłowy zakres wokalny lub parametry osoby');
      if (response.status >= 500) throw new Error('Serwer Suno API chwilowo niedostępny — spróbuj później');
      
      throw new Error(`Suno Persona API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('[SUNO PERSONA] Response:', JSON.stringify(data, null, 2));
    
    // Expected response format:
    // { "code": 200, "msg": "success", "data": { "personaId": "...", "name": "...", "description": "..." } }
    if (data.code !== undefined && data.code !== 200) {
      throw new Error(`Suno Persona API returned code ${data.code}: ${data.msg || 'Unknown error'}`);
    }
    
    // Extract persona info from response
    const result = data.data || data;
    if (!result.personaId) {
      throw new Error('Suno Persona API response missing personaId');
    }
    
    console.log(`[SUNO PERSONA] Persona created: ${result.personaId} (${result.name})`);
    return {
      personaId: result.personaId,
      name: result.name || name,
      description: result.description || description,
      style: result.style || style,
      vocalStart: vocalStart,
      vocalEnd: vocalEnd
    };
  } catch (error) {
    console.error('[SUNO PERSONA] Network/parsing error:', error.message);
    if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
      throw new Error('Timeout łączenia z Suno Persona API — serwer nie odpowiada');
    }
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      throw new Error('Nie można połączyć się z Suno Persona API — sprawdź dostępność serwisu');
    }
    throw error;
  }
};

/**
 * Delete a persona (if Suno API supports it)
 * Note: Check if Suno API has delete endpoint; if not, this is a placeholder
 * 
 * @param {string} personaId - Persona ID to delete
 * @returns {Promise<boolean>} True if successful
 */
const deletePersona = async (personaId) => {
  // Suno API may not have a delete endpoint yet
  // This is a placeholder for future implementation
  console.warn('[SUNO PERSONA] Delete endpoint not implemented in Suno API (check documentation)');
  return false;
};

/**
 * List personas (if Suno API supports it)
 * Note: Check if Suno API has list endpoint; if not, this is a placeholder
 * 
 * @returns {Promise<Array>} Array of persona objects
 */
const listPersonas = async () => {
  // Suno API may not have a list endpoint yet
  // This is a placeholder for future implementation
  console.warn('[SUNO PERSONA] List endpoint not implemented in Suno API (check documentation)');
  return [];
};

/**
 * Get persona details (if Suno API supports it)
 * 
 * @param {string} personaId - Persona ID
 * @returns {Promise<Object|null>} Persona details or null if not found
 */
const getPersona = async (personaId) => {
  // Suno API may not have a get endpoint yet
  // This is a placeholder for future implementation
  console.warn('[SUNO PERSONA] Get endpoint not implemented in Suno API (check documentation)');
  return null;
};

module.exports = {
  createPersona,
  deletePersona,
  listPersonas,
  getPersona
};