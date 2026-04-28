import React, { useState, useEffect } from 'react';

export function PromoCodesManager() {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', maxRedemptions: '', expiresAt: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promo-codes');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPromoCodes(data.promoCodes || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: parseFloat(form.value),
          maxRedemptions: form.maxRedemptions ? parseInt(form.maxRedemptions, 10) : undefined,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowModal(false);
      setForm({ code: '', type: 'percent', value: '', maxRedemptions: '', expiresAt: '' });
      fetchPromoCodes();
    } catch (e: any) {
      alert('Błąd: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      });
      if (res.ok) {
        fetchPromoCodes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Kody Promocyjne</h2>
          <p className="text-on-surface-variant">Zarządzaj kodami zniżkowymi zsynchronizowanymi ze Stripe.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-on-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nowy Kod
        </button>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-sm border-b border-outline-variant/20">
                  <th className="p-4 font-bold">Kod</th>
                  <th className="p-4 font-bold">Zniżka</th>
                  <th className="p-4 font-bold">Użycia</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                      Brak kodów promocyjnych
                    </td>
                  </tr>
                ) : (
                  promoCodes.map((promo: any) => {
                    const coupon = promo.promotion?.coupon || promo.coupon || {};
                    const discount = coupon.percent_off 
                      ? `${coupon.percent_off}%` 
                      : coupon.amount_off ? `${(coupon.amount_off / 100).toFixed(2)} PLN` : '0 PLN';

                    const expiration = promo.expires_at 
                      ? new Date(promo.expires_at * 1000).toLocaleDateString() 
                      : 'Brak';
                    const uses = `${promo.times_redeemed} / ${promo.max_redemptions || '∞'}`;

                    return (
                      <tr key={promo.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors">
                        <td className="p-4 font-mono font-bold text-primary">
                          {promo.code}
                          {promo.expires_at && <div className="text-xs font-normal text-on-surface-variant">Do: {expiration}</div>}
                        </td>
                        <td className="p-4 font-medium">{discount}</td>
                        <td className="p-4 text-on-surface-variant">{uses}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${promo.active ? 'bg-green-500/10 text-green-500' : 'bg-outline-variant/20 text-on-surface-variant'}`}>
                            {promo.active ? 'Aktywny' : 'Nieaktywny'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => toggleActive(promo.id, promo.active)}
                            className="text-sm font-bold text-primary hover:brightness-110"
                          >
                            {promo.active ? 'Dezaktywuj' : 'Aktywuj'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant/20 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold mb-6">Nowy Kod Promocyjny</h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">Kod (np. SUMMER20)</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 uppercase font-mono"
                  placeholder="KOD"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Rodzaj</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2"
                  >
                    <option value="percent">Procent (%)</option>
                    <option value="amount">Kwota (PLN)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Wartość</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step={form.type === 'percent' ? "1" : "0.01"}
                    value={form.value}
                    onChange={e => setForm({...form, value: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2"
                    placeholder={form.type === 'percent' ? "20" : "50.00"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Limit użyć (opcjonalnie)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxRedemptions}
                    onChange={e => setForm({...form, maxRedemptions: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2"
                    placeholder="Brak limitu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Data wygaśnięcia (opcj.)</label>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={e => setForm({...form, expiresAt: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.code || !form.value}
                  className="flex-1 bg-primary text-on-primary px-4 py-2 rounded-xl font-bold hover:brightness-110 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {saving ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : null}
                  Utwórz Kod
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
