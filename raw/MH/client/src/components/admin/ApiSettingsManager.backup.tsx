import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

export default function ApiSettingsManager() {
  const { getToken } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch('http://localhost:3000/api/admin/settings/api', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Nie udało się pobrać ustawień API');
      const data = await res.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const token = await getToken();
      const res = await fetch('http://localhost:3000/api/admin/settings/api', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Błąd zapisu ustawień');
      alert('Ustawienia zapisane pomyślnie!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleProviderChange = (category: string, role: 'active' | 'fallback', value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [role]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">cycle</span>
      </div>
    );
  }

  if (error && !settings) {
    return <div className="p-4 bg-error/10 text-error rounded-xl">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-headline">Ustawienia API i Fallback</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {saving ? (
            <span className="material-symbols-outlined animate-spin">cycle</span>
          ) : (
            <span className="material-symbols-outlined">save</span>
          )}
          Zapisz zmiany
        </button>
      </div>

      {error && <div className="p-4 bg-error/10 text-error rounded-xl mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generacja Muzyki */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/10 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">music_note</span>
            </div>
            <h3 className="text-xl font-bold">Generacja Muzyki</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface-variant block">Główny dostawca (Active)</label>
            <select 
              value={settings?.music?.active}
              onChange={(e) => handleProviderChange('music', 'active', e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/20 focus:border-primary focus:outline-none"
            >
              {Object.entries(settings?.music?.providers || {}).map(([key, provider]: [string, any]) => (
                <option key={key} value={key}>{provider.name}</option>
              ))}
            </select>
            <p className="text-xs text-on-surface-variant">Ten dostawca będzie używany domyślnie.</p>
          </div>

          <div className="space-y-2 pt-4 border-t border-outline-variant/10">
            <label className="text-sm font-bold text-on-surface-variant block">Zapasowy dostawca (Fallback)</label>
            <select 
              value={settings?.music?.fallback}
              onChange={(e) => handleProviderChange('music', 'fallback', e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/20 focus:border-tertiary focus:outline-none"
            >
              {Object.entries(settings?.music?.providers || {}).map(([key, provider]: [string, any]) => (
                <option key={key} value={key}>{provider.name}</option>
              ))}
            </select>
            <p className="text-xs text-on-surface-variant">System automatycznie przełączy się na tego dostawcę, jeśli główny zawiedzie (np. API Kie.ai nie odpowiada).</p>
          </div>
        </div>

        {/* Generacja Tekstu / AI Chat */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/10 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">chat</span>
            </div>
            <h3 className="text-xl font-bold">AI Chat (Producenci)</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface-variant block">Główny dostawca (Active)</label>
            <select 
              value={settings?.llm?.active}
              onChange={(e) => handleProviderChange('llm', 'active', e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/20 focus:border-primary focus:outline-none"
            >
              {Object.entries(settings?.llm?.providers || {}).map(([key, provider]: [string, any]) => (
                <option key={key} value={key}>{provider.name}</option>
              ))}
            </select>
            <p className="text-xs text-on-surface-variant">Wymaga OPENROUTER_API_KEY w zmiennych środowiskowych.</p>
          </div>

          <div className="space-y-2 pt-4 border-t border-outline-variant/10">
            <label className="text-sm font-bold text-on-surface-variant block">Zapasowy dostawca (Fallback)</label>
            <select 
              value={settings?.llm?.fallback}
              onChange={(e) => handleProviderChange('llm', 'fallback', e.target.value)}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/20 focus:border-tertiary focus:outline-none"
            >
              {Object.entries(settings?.llm?.providers || {}).map(([key, provider]: [string, any]) => (
                <option key={key} value={key}>{provider.name}</option>
              ))}
            </select>
            <p className="text-xs text-on-surface-variant">Wymaga OPENAI_API_KEY w zmiennych środowiskowych.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-primary">info</span>
          <p className="text-sm text-on-surface-variant">
            <strong>Jak działa Fallback?</strong><br/>
            Kiedy użytkownik próbuje wygenerować utwór, nasz serwer najpierw uderza do głównego dostawcy (Active). 
            Jeżeli ten dostawca zwróci błąd (np. padły serwery, API limit) lub nie odpowie w odpowiednim czasie, 
            nasz system automatycznie łapie ten błąd i ponawia próbę używając zapasowego dostawcy (Fallback). 
            Użytkownik na frontendzie tego nie zauważy, po prostu generacja może zająć parę sekund dłużej.
          </p>
        </div>
      </div>
    </div>
  );
}
