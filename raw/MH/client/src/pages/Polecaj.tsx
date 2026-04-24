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
  const [copied, setCopied] = useState(false);
  
  const savedRefCode = localStorage.getItem('ref_code');

  useEffect(() => {
    if (isLoaded && isSignedIn) fetchStats();
    else if (isLoaded && !isSignedIn) setLoading(false);
  }, [isLoaded, isSignedIn]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/referrals/stats');
      if (!res.ok) throw new Error('Błąd ładowania statystyk');
      setStats(await res.json());
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
      setClaimMessage('✅ Sukces! Otrzymałeś +5 not.');
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
    navigator.clipboard.writeText(`${window.location.origin}/?ref=${stats.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoaded || loading) {
    return <div className="flex justify-center items-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-primary">cycle</span></div>;
  }

  // Non-logged-in view – show program details + CTA
  if (!isSignedIn) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20">
        <div className="text-center space-y-6 py-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-tertiary/60 mb-4 shadow-2xl">
            <span className="material-symbols-outlined text-5xl text-on-primary" style={{fontVariationSettings:"'FILL' 1"}}>groups</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black headline-font">
            <span className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">Program Partnerski</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md mx-auto">Zaproś znajomych, twórzcie muzykę razem i zarabiajcie darmowe nuty – a nawet prawdziwe pieniądze!</p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: 'link', title: '1. Udostępnij link', desc: 'Skopiuj swój unikalny link polecający i wyślij go znajomym.' },
            { icon: 'person_add', title: '2. Znajomy się rejestruje', desc: 'Gdy ktoś kliknie Twój link i założy konto – oboje dostajecie +5 nut.' },
            { icon: 'redeem', title: '3. Zbieraj nagrody', desc: 'Więcej znajomych = więcej nut. Zostań Partnerem VIP i zarabiaj prowizję od sprzedaży.' }
          ].map((s, i) => (
            <div key={i} className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20 text-center hover:border-primary/30 transition-all">
              <span className="material-symbols-outlined text-3xl text-primary mb-3" style={{fontVariationSettings:"'FILL' 1"}}>{s.icon}</span>
              <h3 className="font-bold text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-on-surface-variant">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Rewards table */}
        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/20">
          <h2 className="text-xl font-bold headline-font mb-6">Co zyskujesz?</h2>
          <div className="space-y-4">
            {[
              { icon: 'music_note', label: 'Za zaproszonego znajomego', value: '+5 nut dla Was obojga', color: 'text-primary' },
              { icon: 'stars', label: 'Po 10 zaproszonych', value: 'Status Kreatora + bonus 50 nut', color: 'text-tertiary' },
              { icon: 'account_balance_wallet', label: 'Partner VIP (dla twórców)', value: 'Prowizja do 20% ze sprzedaży', color: 'text-green-500' }
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-high">
                <span className={`material-symbols-outlined text-2xl ${r.color}`} style={{fontVariationSettings:"'FILL' 1"}}>{r.icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-on-surface-variant">{r.label}</p>
                  <p className="font-bold text-sm">{r.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
            <span className="material-symbols-outlined">login</span>
            Dołącz i zapraszaj
          </Link>
        </div>
      </div>
    );
  }

  // Logged-in view
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

      {/* Claim banner */}
      {savedRefCode && !stats?.referred_by && (
        <div className="bg-tertiary/10 border border-tertiary/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-tertiary">🎉 Masz kod polecający!</h3>
            <p className="text-sm text-on-surface-variant">Znaleźliśmy kod <strong>{savedRefCode}</strong>. Aktywuj go, aby odebrać <strong>+5 darmowych nut</strong>.</p>
            {claimMessage && <p className={`text-xs font-bold mt-2 ${claimMessage.includes('Sukces') ? 'text-green-500' : 'text-error'}`}>{claimMessage}</p>}
          </div>
          <button onClick={handleClaim} disabled={claimLoading}
            className="px-6 py-3 bg-tertiary text-on-primary rounded-xl font-bold hover:bg-tertiary/90 transition-all shadow-lg whitespace-nowrap disabled:opacity-50">
            {claimLoading ? 'Aktywacja...' : '🎯 Aktywuj Kod'}
          </button>
        </div>
      )}

      {error && <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20 font-bold text-sm">{error}</div>}

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Link card */}
        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full -mr-14 -mt-14 transition-transform group-hover:scale-110"></div>
          <span className="material-symbols-outlined text-4xl text-primary mb-4 relative z-10" style={{fontVariationSettings:"'FILL' 1"}}>group_add</span>
          <h3 className="text-2xl font-black headline-font mb-2 relative z-10">Zaproś i Zyskaj</h3>
          <p className="text-on-surface-variant text-sm mb-6 relative z-10">
            Za każdą osobę, która zarejestruje się z Twojego linku, oboje otrzymacie po <strong>5 bonusowych nut</strong>!
            {stats?.isAffiliate && ' Jako Partner VIP otrzymujesz również prowizję ze sprzedaży.'}
          </p>
          <div className="space-y-3 relative z-10">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Twój unikalny link</label>
            <div className="flex">
              <input type="text" readOnly
                value={`${window.location.origin}/?ref=${stats?.referralCode || '...'}`}
                className="flex-1 bg-surface-container-high border-y border-l border-outline-variant/30 rounded-l-xl px-4 py-3 text-sm text-on-surface focus:outline-none font-mono"
              />
              <button onClick={copyLink}
                className={`px-4 rounded-r-xl font-bold transition-all flex items-center justify-center gap-1 ${copied ? 'bg-green-500 text-black' : 'bg-primary text-on-primary hover:bg-primary/90'}`}>
                <span className="material-symbols-outlined text-lg">{copied ? 'check' : 'content_copy'}</span>
                <span className="text-xs hidden sm:inline">{copied ? 'Skopiowano!' : 'Kopiuj'}</span>
              </button>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3 mt-6 relative z-10">
            {[
              { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/?ref=${stats?.referralCode || ''}`)}`, icon: 'alternate_email', color: 'bg-blue-600' },
              { name: 'Messenger', url: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(`${window.location.origin}/?ref=${stats?.referralCode || ''}`)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.origin)}`, icon: 'chat', color: 'bg-blue-500' },
              { name: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(`Twórz muzykę z AI na mojhit.pl! Dołącz przez mój link: ${window.location.origin}/?ref=${stats?.referralCode || ''}`)}`, icon: 'chat', color: 'bg-green-600' },
            ].map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                className={`${s.color} rounded-xl p-3 flex items-center gap-2 text-white text-xs font-bold hover:opacity-90 transition-all`}>
                <span className="material-symbols-outlined text-lg">{s.icon}</span>
                <span className="hidden sm:inline">{s.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/20 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-tertiary" style={{fontVariationSettings:"'FILL' 1"}}>group</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Zaproszeni Znajomi</p>
              <p className="text-3xl font-black headline-font text-on-surface">{stats?.referralsCount || 0}</p>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/20 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-primary" style={{fontVariationSettings:"'FILL' 1"}}>music_note</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Zarobione Nuty</p>
              <p className="text-3xl font-black headline-font text-on-surface">{stats?.totalEarnedNotes || 0}</p>
            </div>
          </div>
          
          {/* Affiliate wallet */}
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
                <button className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-400 transition-all shadow-lg shadow-green-500/20">Wypłać</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
