import { useState, useEffect } from 'react';

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/site', {
        credentials: 'include' // allow session
      });
      if (!res.ok) throw new Error('Nie udało się pobrać ustawień strony');
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
      const res = await fetch('/api/admin/settings/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Błąd zapisu ustawień');
      alert('✨ Ustawienia zapisane pomyślnie!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="text-center py-8">Ładowanie ustawień...</div>;
  if (!settings) return <div className="text-center py-8 text-error">Brak ustawień.</div>;

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20">
          {error}
        </div>
      )}

      {/* Pricing Banner Settings */}
      <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20">
        <h3 className="text-lg font-bold mb-4 headline-font">Baner Promocyjny (Cennik)</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={settings.pricing_banner_enabled}
              onChange={(e) => handleChange('pricing_banner_enabled', e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            <span className="font-bold">Wyświetlaj baner promocyjny</span>
          </label>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Główny tekst banera</label>
            <input
              type="text"
              value={settings.pricing_banner_text || ''}
              onChange={(e) => handleChange('pricing_banner_text', e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2 focus:border-primary outline-none"
              placeholder="np. Wiosenna Wyprzedaż!"
            />
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Dodatkowy opis (subtext)</label>
            <input
              type="text"
              value={settings.pricing_banner_subtext || ''}
              onChange={(e) => handleChange('pricing_banner_subtext', e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2 focus:border-primary outline-none"
              placeholder="np. Oszczędzasz 20% na planie rocznym."
            />
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Data zakończenia promocji (zostaw puste aby wyłączyć licznik)</label>
            <input
              type="datetime-local"
              value={settings.pricing_timer_end ? new Date(settings.pricing_timer_end).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                const val = e.target.value;
                handleChange('pricing_timer_end', val ? new Date(val).toISOString() : null);
              }}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2 focus:border-primary outline-none"
            />
          </div>
        </div>
      </div>

      {/* Discount Settings */}
      <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20">
        <h3 className="text-lg font-bold mb-4 headline-font">Zniżka Roczna (Subskrypcje)</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={settings.pricing_discount_enabled}
              onChange={(e) => handleChange('pricing_discount_enabled', e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            <span className="font-bold">Włącz zniżkę na plany roczne</span>
          </label>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Procent zniżki (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.pricing_discount_percent || 0}
              onChange={(e) => handleChange('pricing_discount_percent', parseInt(e.target.value) || 0)}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2 focus:border-primary outline-none"
            />
          </div>
        </div>
      </div>


      {/* Plans & Packages (JSON) */}
      <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20">
        <h3 className="text-lg font-bold mb-4 headline-font">Pakiety i Subskrypcje (Zaawansowane)</h3>
        <p className="text-sm text-on-surface-variant mb-4">Edytuj dane w formacie JSON. Użyj znacznika [HIT] aby wstawić ikonę Hita.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Subskrypcje (JSON)</label>
            <textarea
              rows={8}
              value={typeof settings.pricing_subscriptions === 'string' ? settings.pricing_subscriptions : JSON.stringify(settings.pricing_subscriptions || [], null, 2)}
              onChange={(e) => {
                try {
                  const val = JSON.parse(e.target.value);
                  handleChange('pricing_subscriptions', val);
                } catch (err) {
                  handleChange('pricing_subscriptions', e.target.value); // keep string if invalid to not break typing
                }
              }}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2 focus:border-primary outline-none font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-1">Pakiety (JSON)</label>
            <textarea
              rows={8}
              value={typeof settings.pricing_packages === 'string' ? settings.pricing_packages : JSON.stringify(settings.pricing_packages || [], null, 2)}
              onChange={(e) => {
                try {
                  const val = JSON.parse(e.target.value);
                  handleChange('pricing_packages', val);
                } catch (err) {
                  handleChange('pricing_packages', e.target.value); // keep string if invalid to not break typing
                }
              }}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2 focus:border-primary outline-none font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 disabled:opacity-50"
        >
          {saving ? (
            <span className="material-symbols-outlined animate-spin">refresh</span>
          ) : (
            <span className="material-symbols-outlined">save</span>
          )}
          Zapisz Ustawienia
        </button>
      </div>
    </div>
  );
}
