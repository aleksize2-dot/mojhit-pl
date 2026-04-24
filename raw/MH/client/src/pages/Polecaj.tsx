import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export function Polecaj() {
  const { isLoaded, isSignedIn } = useUser();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  
  const savedRefCode = localStorage.getItem('ref_code');

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchStats();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/referrals/stats');
      if (!res.ok) throw new Error('Błąd ładowania statystyk');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!savedRefCode) return;
    setClaimLoading(true);
    setClaimMessage('');
    
    try {
      const res = await fetch('/api/referrals/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: savedRefCode })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Błąd weryfikacji');
      
      setClaimMessage('Sukces! Otrzymałeś +5 not.');
      localStorage.removeItem('ref_code');
      fetchStats();
    } catch (err: any) {
      setClaimMessage(err.message);
    } finally {
      setClaimLoading(false);
    }
  };

  const copyLink = () => {
    if (!stats?.referralCode) return;
    const link = `${window.location.origin}/?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(link);
    alert('Link skopiowany do schowka!');
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">cycle</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-10">
        <h1 className="text-4xl font-black headline-font text-primary">Program Poleceń</h1>
        <p className="text-on-surface-variant">Zaloguj się, aby zapraszać znajomych i zdobywać darmowe nuty i monety!</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20">
      
      <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-6">
        <Link to="/" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-bright transition-colors text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold headline-font bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">Program Partnerski</h2>
          <p className="text-on-surface-variant text-sm font-label">Zaproś znajomych i zgarniaj nagrody</p>
        </div>
      </div>

      {savedRefCode && !stats?.referred_by && (
        <div className="bg-tertiary/10 border border-tertiary/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-tertiary">Masz kod polecający!</h3>
            <p className="text-sm text-on-surface-variant">Znaleźliśmy kod <strong>{savedRefCode}</strong>. Aktywuj go, aby odebrać bonusowe 5 not.</p>
            {claimMessage && <p className="text-xs font-bold mt-2 text-primary">{claimMessage}</p>}
          </div>
          <button 
            onClick={handleClaim} 
            disabled={claimLoading}
            className="px-6 py-3 bg-tertiary text-on-primary rounded-xl font-bold hover:bg-tertiary/90 transition-all shadow-lg whitespace-nowrap disabled:opacity-50"
          >
            {claimLoading ? 'Aktywacja...' : 'Aktywuj Kod'}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20 font-bold text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <span className="material-symbols-outlined text-4xl text-primary mb-4 relative z-10" style={{fontVariationSettings: "'FILL' 1"}}>group_add</span>
          <h3 className="text-2xl font-black headline-font mb-2 relative z-10">Zaproś i Zyskaj</h3>
          <p className="text-on-surface-variant text-sm mb-6 relative z-10">
            Za każdą osobę, która zarejestruje się z Twojego linku, oboje otrzymacie po <strong>5 bonusowych not</strong>!
            {stats?.isAffiliate && ' Jako Partner VIP otrzymujesz również prowizję ze sprzedaży pakietów.'}
          </p>
          
          <div className="space-y-3 relative z-10">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Twój unikalny link</label>
            <div className="flex">
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}/?ref=${stats?.referralCode || '...'}`}
                className="flex-1 bg-surface-container-high border-y border-l border-outline-variant/30 rounded-l-xl px-4 py-3 text-sm text-on-surface focus:outline-none"
              />
              <button 
                onClick={copyLink}
                className="bg-primary text-on-primary px-4 rounded-r-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">content_copy</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/20 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>group</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Zaproszeni Znajomi</p>
              <p className="text-3xl font-black headline-font text-on-surface">{stats?.referralsCount || 0}</p>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/20 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>music_note</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Zarobione Nuty</p>
              <p className="text-3xl font-black headline-font text-on-surface">{stats?.totalEarnedNotes || 0}</p>
            </div>
          </div>
          
          {stats?.isAffiliate && (
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-3xl p-6 border border-green-500/30">
               <div className="flex items-center gap-2 mb-4">
                 <span className="material-symbols-outlined text-green-500">account_balance_wallet</span>
                 <h3 className="font-bold text-green-500 uppercase tracking-widest text-xs">Portfel Partnera (PLN)</h3>
               </div>
               
               <div className="flex justify-between items-end">
                 <div>
                   <p className="text-3xl font-black headline-font text-on-surface">{stats?.totalEarningsPLN || '0.00'} zł</p>
                   {stats?.pendingEarningsPLN > 0 && <p className="text-xs text-on-surface-variant mt-1">+ {stats.pendingEarningsPLN} zł oczekujące</p>}
                 </div>
                 <button className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20">
                    Wypłać
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
