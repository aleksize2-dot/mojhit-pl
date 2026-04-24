import React, { useState, useEffect } from 'react';

export default function ApiSettingsManager() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings/api', {
        credentials: 'include'
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
      const res = await fetch('/api/admin/settings/api', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Błąd zapisu ustawień');
      alert('✅ Ustawienia zapisane pomyślnie!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleProviderChange = (providerKey: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [providerKey]: {
        ...prev[providerKey],
        [field]: value
      }
    }));
  };

  const handleGlobalChange = (field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [field]: value
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

  const providers = [
    { key: 'kie', name: 'Kie.ai', icon: 'music_note', color: 'primary' },
    { key: 'suno', name: 'Suno.ai', icon: 'music_note', color: 'secondary' },
    { key: 'openrouter', name: 'OpenRouter', icon: 'chat', color: 'tertiary' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-headline">Stan API i Ustawienia</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {providers.map(({ key, name, icon, color }) => {
          const provider = settings?.[key];
          if (!provider) return null;
          return (
            <div key={key} className="bg-surface p-6 rounded-xl border border-outline-variant/10 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full bg-${color}/20 flex items-center justify-center text-${color}`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <h3 className="text-xl font-bold">{name}</h3>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-on-surface-variant">Aktywowany</label>
                <div className="relative">
                  <input 
                    type="checkbox"
                    checked={provider.enabled}
                    onChange={(e) => handleProviderChange(key, 'enabled', e.target.checked)}
                    className="sr-only"
                    id={`${key}-enabled`}
                  />
                  <label 
                    htmlFor={`${key}-enabled`}
                    className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${provider.enabled ? 'bg-primary' : 'bg-outline-variant'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${provider.enabled ? 'translate-x-6' : ''}`}></span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant block">Priorytet fallback</label>
                <input 
                  type="number"
                  min="1"
                  max="10"
                  value={provider.priority}
                  onChange={(e) => handleProviderChange(key, 'priority', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 bg-surface-container rounded-xl border border-outline-variant/20 focus:border-primary focus:outline-none"
                />
                <p className="text-xs text-on-surface-variant">Niższy numer = wyższy priorytet (1 = pierwszy wybór)</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant block">API Key</label>
                <input 
                  type="password"
                  placeholder="••••••••••••"
                  value={provider.apiKey}
                  onChange={(e) => handleProviderChange(key, 'apiKey', e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container rounded-xl border border-outline-variant/20 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant block">Base URL</label>
                <input 
                  type="text"
                  placeholder="https://api.example.com/v1"
                  value={provider.baseUrl}
                  onChange={(e) => handleProviderChange(key, 'baseUrl', e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container rounded-xl border border-outline-variant/20 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
                Status: <span className={`font-bold ${provider.enabled ? 'text-success' : 'text-error'}`}>
                  {provider.enabled ? 'AKTYWNY' : 'WYŁĄCZONY'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface p-6 rounded-xl border border-outline-variant/10 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">swap_horiz</span>
          </div>
          <h3 className="text-xl font-bold">Ustawienia Fallback</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-bold text-on-surface-variant block">Automatyczny fallback</label>
              <p className="text-xs text-on-surface-variant">System sam przełączy dostawcę przy błędzie API</p>
            </div>
            <div className="relative">
              <input 
                type="checkbox"
                checked={settings?.fallbackEnabled ?? true}
                onChange={(e) => handleGlobalChange('fallbackEnabled', e.target.checked)}
                className="sr-only"
                id="fallbackEnabled"
              />
              <label 
                htmlFor="fallbackEnabled"
                className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${settings?.fallbackEnabled ? 'bg-primary' : 'bg-outline-variant'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.fallbackEnabled ? 'translate-x-6' : ''}`}></span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-bold text-on-surface-variant block">Auto‑switch przy awarii</label>
              <p className="text-xs text-on-surface-variant">Natychmiastowe przełączenie bez czekania</p>
            </div>
            <div className="relative">
              <input 
                type="checkbox"
                checked={settings?.autoSwitchOnFailure ?? true}
                onChange={(e) => handleGlobalChange('autoSwitchOnFailure', e.target.checked)}
                className="sr-only"
                id="autoSwitchOnFailure"
              />
              <label 
                htmlFor="autoSwitchOnFailure"
                className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${settings?.autoSwitchOnFailure ? 'bg-primary' : 'bg-outline-variant'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.autoSwitchOnFailure ? 'translate-x-6' : ''}`}></span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-sm text-on-surface-variant">
              <strong>Jak działa Fallback?</strong><br/>
              System wybiera dostawcę o najwyższym priorytecie (najmniejsza liczba), który jest włączony (enabled).<br/>
              Jeśli wywołanie API zakończy się błędem (limit, timeout, błąd serwera), system automatycznie przełącza się na następnego w kolejności dostawcę (wyższy numer priorytetu).<br/>
              Użytkownik widzi tylko wynikową generację – opóźnienie może być nieco większe.
            </p>
          </div>
        </div>
      </div>

      <div className="text-xs text-on-surface-variant text-center pt-4 border-t border-outline-variant/10">
        Ostatnia aktualizacja: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString('pl-PL') : 'nigdy'}
      </div>
    </div>
  );
}