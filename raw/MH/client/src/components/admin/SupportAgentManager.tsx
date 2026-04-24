import { useState, useEffect } from 'react';

export function SupportAgentManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [config, setConfig] = useState({
    model: 'google/gemini-2.5-flash',
    agentName: 'Wsparcie AI',
    agentAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=support',
    systemPrompt: 'Jesteś wirtualnym asystentem wsparcia dla mojhit.pl. Jesteś pomocny, zwięzły i odpowiadasz w języku polskim. Jeśli nie znasz odpowiedzi, poinformuj, że należy wysłać e-mail do wsparcia.',
    suggestedQuestions: 'Jak kupić monety?,Dlaczego utwór się nie generuje?,Jak zresetować hasło?'
  });

  useEffect(() => {
    fetch('/api/admin/api-settings', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load settings');
        return res.json();
      })
      .then(data => {
        if (data.supportAgent) {
          setConfig(data.supportAgent);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // First get current settings to merge
      const res1 = await fetch('/api/admin/api-settings', { credentials: 'include' });
      if (!res1.ok) throw new Error('Failed to fetch current settings');
      const currentSettings = await res1.json();
      
      const newSettings = {
        ...currentSettings,
        supportAgent: config
      };
      
      const res2 = await fetch('/api/admin/api-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
        credentials: 'include'
      });
      
      if (!res2.ok) throw new Error('Failed to save settings');
      setSuccess('Ustawienia zapisane pomyślnie!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">cycle</span></div>;

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">support_agent</span>
          </div>
          <div>
            <h3 className="text-xl font-bold headline-font text-on-surface">Asystent Wsparcia (AI)</h3>
            <p className="text-sm text-on-surface-variant">Konfiguracja wirtualnego doradcy na podstronie Wsparcie</p>
          </div>
        </div>

        {error && <div className="p-4 bg-error/10 text-error rounded-xl mb-6 font-bold">{error}</div>}
        {success && <div className="p-4 bg-green-500/10 text-green-500 rounded-xl mb-6 font-bold">{success}</div>}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Imię Agenta</label>
            <input 
              type="text" 
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
              value={config.agentName}
              onChange={(e) => setConfig({...config, agentName: e.target.value})}
              placeholder="np. Wsparcie AI"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Avatar Agenta (URL)</label>
            <input 
              type="text" 
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
              value={config.agentAvatar}
              onChange={(e) => setConfig({...config, agentAvatar: e.target.value})}
              placeholder="np. https://example.com/avatar.png"
            />
            {config.agentAvatar && (
              <div className="mt-2 flex items-center gap-2">
                 <span className="text-xs text-on-surface-variant">Podgląd:</span>
                 <img src={config.agentAvatar} alt="Avatar" className="w-8 h-8 rounded-full border border-outline-variant/30" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Model AI (OpenRouter Alias)</label>
            <input 
              type="text" 
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
              value={config.model}
              onChange={(e) => setConfig({...config, model: e.target.value})}
              placeholder="np. google/gemini-2.5-flash"
            />
            <p className="text-xs text-on-surface-variant mt-1">Dostępne: anthropic/claude-3.5-sonnet, google/gemini-2.5-flash, openai/gpt-4o-mini</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">System Prompt (Instrukcja dla AI)</label>
            <textarea 
              rows={5}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
              value={config.systemPrompt}
              onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
              placeholder="Jesteś pomocnym asystentem..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Sugerowane pytania (oddzielone przecinkiem)</label>
            <input 
              type="text" 
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
              value={config.suggestedQuestions}
              onChange={(e) => setConfig({...config, suggestedQuestions: e.target.value})}
              placeholder="Pytanie 1, Pytanie 2, Pytanie 3"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <><span className="material-symbols-outlined animate-spin">cycle</span> Zapisywanie...</>
            ) : (
              <><span className="material-symbols-outlined">save</span> Zapisz Ustawienia</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
