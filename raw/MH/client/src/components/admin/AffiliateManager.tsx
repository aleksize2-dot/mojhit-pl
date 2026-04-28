import { useState, useEffect } from 'react';

export function AffiliateManager() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'payouts' | 'applications'>('applications');
  const [usersSort, setUsersSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({ column: 'email', direction: 'asc' });
  const [payoutsSort, setPayoutsSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({ column: 'created_at', direction: 'desc' });
  const [appsSort, setAppsSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({ column: 'created_at', direction: 'desc' });

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
      } else if (activeTab === 'payouts') {
        const res = await fetch('/api/admin/affiliates/earnings', { credentials: 'include' });
        if (!res.ok) throw new Error('Błąd pobierania wypłat');
        const data = await res.json();
        setEarnings(data);
      } else if (activeTab === 'applications') {
        const res = await fetch('/api/admin/vip_applications', { credentials: 'include' });
        if (!res.ok) throw new Error('Błąd pobierania wniosków VIP');
        const data = await res.json();
        setApplications(data);
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

  const handleApplicationAction = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(`Czy na pewno chcesz ${action === 'approve' ? 'zatwierdzić' : 'odrzucić'} ten wniosek?`)) return;
    try {
      const res = await fetch(`/api/admin/vip_applications/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Błąd zmiany statusu wniosku');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleUsersSort = (column: string) => {
    const newDirection = usersSort.column === column && usersSort.direction === 'desc' ? 'asc' : 'desc';
    setUsersSort({ column, direction: newDirection });
  };

  const togglePayoutsSort = (column: string) => {
    const newDirection = payoutsSort.column === column && payoutsSort.direction === 'desc' ? 'asc' : 'desc';
    setPayoutsSort({ column, direction: newDirection });
  };

  const toggleAppsSort = (column: string) => {
    const newDirection = appsSort.column === column && appsSort.direction === 'desc' ? 'asc' : 'desc';
    setAppsSort({ column, direction: newDirection });
  };

  const sortedUsers = [...affiliates].sort((a, b) => {
    let aVal = a[usersSort.column] || '';
    let bVal = b[usersSort.column] || '';
    if (aVal < bVal) return usersSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return usersSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const sortedPayouts = [...earnings].sort((a, b) => {
    let aVal = a[payoutsSort.column];
    let bVal = b[payoutsSort.column];
    
    // Handle null values
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';

    if (aVal < bVal) return payoutsSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return payoutsSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const sortedApps = [...applications].sort((a, b) => {
    let aVal = a[appsSort.column];
    let bVal = b[appsSort.column];
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';
    if (aVal < bVal) return appsSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return appsSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const SortHeader = ({ label, column, sortState, onSort }: { label: string, column: string, sortState: {column: string, direction: string}, onSort: (col: string) => void }) => (
    <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant cursor-pointer hover:bg-surface-container transition-colors select-none group" onClick={() => onSort(column)}>
      <div className="flex items-center gap-1">
        {label}
        <span className={`material-symbols-outlined text-[14px] transition-opacity ${sortState.column === column ? 'opacity-100 text-primary' : 'opacity-20 group-hover:opacity-50'}`}>
          {sortState.column === column && sortState.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
        </span>
      </div>
    </th>
  );

  const totalPendingPLN = sortedPayouts.filter(e => e.status === 'pending' || e.status === 'available').reduce((s, e) => s + Number(e.commission_amount), 0);
  const totalPaidPLN = sortedPayouts.filter(e => e.status === 'paid').reduce((s, e) => s + Number(e.commission_amount), 0);
  const affiliateCount = affiliates.filter(a => a.is_affiliate).length;

  return (
    <div className="space-y-6">
      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Partnerzy VIP</p>
          <p className="text-2xl font-black headline-font text-tertiary">{affiliateCount}</p>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Do Wypłaty</p>
          <p className="text-2xl font-black headline-font text-green-500">{totalPendingPLN.toFixed(2)} PLN</p>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Wypłacono</p>
          <p className="text-2xl font-black headline-font text-primary">{totalPaidPLN.toFixed(2)} PLN</p>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Transakcje</p>
          <p className="text-2xl font-black headline-font text-on-surface">{earnings.length}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold headline-font text-on-surface">Zarządzanie Afiliacją</h2>
        <div className="flex bg-surface-container-high rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'applications' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Wnioski VIP
          </button>
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
      ) : activeTab === 'applications' ? (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant/20">
                  <SortHeader label="Data" column="created_at" sortState={appsSort} onSort={toggleAppsSort} />
                  <SortHeader label="Email (User)" column="user_id" sortState={appsSort} onSort={toggleAppsSort} />
                  <SortHeader label="Kanał/Strona" column="website" sortState={appsSort} onSort={toggleAppsSort} />
                  <SortHeader label="Plan" column="plan" sortState={appsSort} onSort={toggleAppsSort} />
                  <SortHeader label="Model" column="model" sortState={appsSort} onSort={toggleAppsSort} />
                  <SortHeader label="Status" column="status" sortState={appsSort} onSort={toggleAppsSort} />
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {sortedApps.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant">Brak wniosków VIP</td></tr>
                ) : sortedApps.map(app => (
                  <tr key={app.id} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="p-4 text-sm text-on-surface">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-sm text-on-surface">{app.users?.email || 'Brak danych'}</td>
                    <td className="p-4 text-sm text-tertiary">
                      {app.website ? <a href={app.website.startsWith('http') ? app.website : `https://${app.website}`} target="_blank" rel="noreferrer" className="hover:underline">{app.website}</a> : '-'}
                    </td>
                    <td className="p-4 text-xs text-on-surface-variant max-w-[200px] truncate" title={app.plan}>{app.plan || '-'}</td>
                    <td className="p-4 text-sm font-bold text-on-surface">{app.model === 'instant' ? '30% Jednorazowo' : '10% Dożywotnio'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        app.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        app.status === 'rejected' ? 'bg-error/10 text-error border border-error/20' :
                        'bg-tertiary/10 text-tertiary border border-tertiary/20'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {app.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleApplicationAction(app.id, 'approve')} className="px-3 py-1.5 bg-green-500 text-black rounded-lg text-xs font-bold hover:bg-green-400 transition-colors">Zatwierdź</button>
                          <button onClick={() => handleApplicationAction(app.id, 'reject')} className="px-3 py-1.5 bg-error text-white rounded-lg text-xs font-bold hover:bg-error/80 transition-colors">Odrzuć</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'payouts' ? (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant/20">
                  <SortHeader label="Data" column="created_at" sortState={payoutsSort} onSort={togglePayoutsSort} />
                  <SortHeader label="Partner ID" column="affiliate_id" sortState={payoutsSort} onSort={togglePayoutsSort} />
                  <SortHeader label="Kupujący ID" column="buyer_id" sortState={payoutsSort} onSort={togglePayoutsSort} />
                  <SortHeader label="Kwota Zakupu" column="purchase_amount" sortState={payoutsSort} onSort={togglePayoutsSort} />
                  <SortHeader label="Prowizja (PLN)" column="commission_amount" sortState={payoutsSort} onSort={togglePayoutsSort} />
                  <SortHeader label="Status" column="status" sortState={payoutsSort} onSort={togglePayoutsSort} />
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {sortedPayouts.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant">Brak danych o prowizjach</td></tr>
                ) : sortedPayouts.map(e => (
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
                  <SortHeader label="Email" column="email" sortState={usersSort} onSort={toggleUsersSort} />
                  <SortHeader label="Kod Polecający" column="referral_code" sortState={usersSort} onSort={toggleUsersSort} />
                  <SortHeader label="Status Partnera" column="is_affiliate" sortState={usersSort} onSort={toggleUsersSort} />
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Zmień</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {sortedUsers.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">Brak użytkowników</td></tr>
                ) : sortedUsers.map(u => (
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
