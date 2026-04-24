import { useState, useEffect } from 'react';

export function AffiliateManager() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'payouts'>('payouts');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await fetch('/api/admin/affiliates/users', { credentials: 'include' });
        if (!res.ok) throw new Error('Błąd pobierania partnerów');
        const data = await res.json();
        setAffiliates(data);
      } else {
        const res = await fetch('/api/admin/affiliates/earnings', { credentials: 'include' });
        if (!res.ok) throw new Error('Błąd pobierania wypłat');
        const data = await res.json();
        setEarnings(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAffiliate = async (userId: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_affiliate: !currentState })
      });
      if (!res.ok) throw new Error('Błąd aktualizacji');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const markAsPaid = async (earningId: string) => {
    if (!confirm('Czy na pewno chcesz oznaczyć tę prowizję jako wypłaconą?')) return;
    
    try {
      const res = await fetch(`/api/admin/affiliates/payout/${earningId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Błąd wypłaty');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold headline-font text-on-surface">Zarządzanie Afiliacją</h2>
        <div className="flex bg-surface-container-high rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'payouts' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Wypłaty i Prowizje
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'users' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Statusy Partnerów
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><span className="material-symbols-outlined animate-spin text-3xl text-primary">cycle</span></div>
      ) : error ? (
        <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20 font-bold">{error}</div>
      ) : activeTab === 'payouts' ? (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant/20">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Data</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Partner ID</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kupujący ID</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kwota Zakupu</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Prowizja (PLN)</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {earnings.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant">Brak danych o prowizjach</td></tr>
                ) : earnings.map(e => (
                  <tr key={e.id} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="p-4 text-sm text-on-surface">{new Date(e.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-xs font-mono text-on-surface-variant">{e.affiliate_id?.substring(0,8)}...</td>
                    <td className="p-4 text-xs font-mono text-on-surface-variant">{e.buyer_id?.substring(0,8)}...</td>
                    <td className="p-4 text-sm text-on-surface">{e.purchase_amount} PLN</td>
                    <td className="p-4 text-sm font-bold text-green-500">{e.commission_amount} PLN</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        e.status === 'paid' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        e.status === 'available' ? 'bg-primary/10 text-primary border border-primary/20' :
                        'bg-surface-variant/30 text-on-surface-variant border border-outline-variant/20'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {e.status !== 'paid' && (
                        <button 
                          onClick={() => markAsPaid(e.id)}
                          className="px-3 py-1.5 bg-green-500 text-black rounded-lg text-xs font-bold hover:bg-green-400 transition-colors"
                        >
                          Wypłać
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant/20">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kod Polecający</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status Partnera</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Zmień</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {affiliates.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">Brak użytkowników</td></tr>
                ) : affiliates.map(u => (
                  <tr key={u.id} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="p-4 text-sm text-on-surface font-medium">{u.email}</td>
                    <td className="p-4 text-sm text-on-surface font-mono">{u.referral_code || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        u.is_affiliate ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' : 'bg-surface-variant/30 text-on-surface-variant border border-outline-variant/20'
                      }`}>
                        {u.is_affiliate ? 'Partner VIP' : 'Zwykły'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => toggleAffiliate(u.id, u.is_affiliate)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          u.is_affiliate ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-tertiary/10 text-tertiary hover:bg-tertiary/20'
                        }`}
                      >
                        {u.is_affiliate ? 'Odbierz Status' : 'Nadaj Status'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
