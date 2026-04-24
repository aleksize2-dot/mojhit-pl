// API Settings module - uses Supabase table api_settings
const API_SETTINGS_ID = '00000000-0000-0000-0000-000000000000';

// Factory that receives supabase client
module.exports = function createApiSettings(supabase) {
  const getApiSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('api_settings')
        .select('settings')
        .eq('id', API_SETTINGS_ID)
        .single();
      
      if (error) {
        console.error('[API Settings] Get error:', error);
        // Return default settings if table doesn't exist yet
        return getDefaultSettings();
      }
      
      // Merge defaults with stored settings
      const defaults = getDefaultSettings();
      const merged = deepMerge(defaults, data.settings);
      return merged;
    } catch (error) {
      console.error('[API Settings] Get exception:', error);
      return getDefaultSettings();
    }
  };

  const updateApiSettings = async (settings) => {
    try {
      // Validate structure
      const sanitized = sanitizeSettings(settings);
      
      const { error } = await supabase
        .from('api_settings')
        .upsert({
          id: API_SETTINGS_ID,
          settings: sanitized,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (error) {
        console.error('[API Settings] Update error:', error);
        return false;
      }
      
      console.log('[API Settings] Updated successfully');
      return true;
    } catch (error) {
      console.error('[API Settings] Update exception:', error);
      return false;
    }
  };

  // Helper: default settings
  function getDefaultSettings() {
    return {
      kie: {
        enabled: true,
        priority: 1,
        apiKey: '',
        baseUrl: 'https://api.kie.ai/v1',
        config: {}
      },
      suno: {
        enabled: false,
        priority: 2,
        apiKey: '',
        baseUrl: 'https://api.suno.ai/v1',
        config: {}
      },
      openrouter: {
        enabled: true,
        priority: 3,
        apiKey: '',
        baseUrl: 'https://openrouter.ai/api/v1',
        config: {}
      },
      supportAgent: {
        model: 'google/gemini-2.5-flash',
        agentName: 'Wsparcie AI',
        agentAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=support',
        systemPrompt: 'Jesteś wirtualnym asystentem wsparcia dla mojhit.pl. Jesteś pomocny, zwięzły i odpowiadasz w języku polskim. Jeśli nie znasz odpowiedzi, poinformuj, że należy wysłać e-mail do wsparcia.',
        suggestedQuestions: 'Jak kupić monety?,Dlaczego utwór się nie generuje?,Jak zresetować hasło?'
      },
      fallbackEnabled: true,
      autoSwitchOnFailure: true,
      lastTestedAt: null,
      createdAt: null,
      updatedAt: null
    };
  }

  // Deep merge objects
  function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  // Sanitize settings (ensure required structure)
  function sanitizeSettings(input) {
    const defaults = getDefaultSettings();
    const merged = deepMerge(defaults, input);
    // Ensure priorities are unique among enabled providers
    const enabledProviders = Object.keys(merged).filter(key => 
      ['kie', 'suno', 'openrouter'].includes(key) && merged[key]?.enabled
    );
    // Simple priority assignment: keep existing, ensure uniqueness
    let used = new Set();
    enabledProviders.forEach(key => {
      if (used.has(merged[key].priority)) {
        // Assign next available
        let p = 1;
        while (used.has(p)) p++;
        merged[key].priority = p;
      }
      used.add(merged[key].priority);
    });
    merged.updatedAt = new Date().toISOString();
    if (!merged.createdAt) merged.createdAt = new Date().toISOString();
    return merged;
  }

  // Get ordered list of music providers (kie, suno) based on priority and enabled status
  const getMusicProviders = async () => {
    const settings = await getApiSettings();
    const providers = [
      { key: 'kie', ...settings.kie },
      { key: 'suno', ...settings.suno }
    ]
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);
    return providers;
  };

  // Public functions
  return {
    getApiSettings,
    updateApiSettings,
    getMusicProviders
  };
};