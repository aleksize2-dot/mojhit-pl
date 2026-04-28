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
  const [toast, setToast] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyStep, setApplyStep] = useState(1);
  const [applyData, setApplyData] = useState({ website: '', plan: '', agree: false, model: 'lifetime' });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  
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

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 4000);
  };

  const handleApply = async () => {
    if (!applyData.agree) return alert('Musisz zaakceptować regulamin.');
    setApplyLoading(true);
    try {
      const res = await fetch('/api/affiliates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applyData)
      });
      if (!res.ok) throw new Error('Błąd aplikacji');
      // Symulacja wysłania dla UX
      await new Promise(r => setTimeout(r, 1000));
      setApplySuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setApplyLoading(false);
    }
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
            { icon: 'person_add', title: '2. Znajomy się rejestruje', desc: 'Gdy ktoś kliknie Twój link i założy konto – oboje dostajecie +10 nut.' },
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
              { icon: 'music_note', label: 'Za zaproszonego znajomego', value: '+10 nut dla Was obojga', color: 'text-primary' },
              { icon: 'stars', label: 'Po 10 zaproszonych', value: 'Status Kreatora + bonus 50 nut', color: 'text-tertiary' },
              { icon: 'account_balance_wallet', label: 'Partner VIP (dla twórców)', value: 'Prowizja do 30% ze sprzedaży', color: 'text-green-500' }
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
            <p className="text-sm text-on-surface-variant">Znaleźliśmy kod <strong>{savedRefCode}</strong>. Aktywuj go, aby odebrać <strong>+10 darmowych nut</strong>.</p>
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
            Za każdą osobę, która zarejestruje się z Twojego linku, oboje otrzymacie po <strong>10 bonusowych nut!</strong>
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
          <div className="mt-8 relative z-10">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-3">Udostępnij szybko:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { 
                  name: 'Udostępnij', 
                  action: () => {
                    const url = `${window.location.origin}/?ref=${stats?.referralCode || ''}`;
                    if (navigator.share) {
                      navigator.share({
                        title: 'mojhit.pl - Twórz muzykę z AI!',
                        text: 'Dołącz przez mój link i zgarnij darmowe nuty na start:',
                        url: url
                      }).catch(console.error);
                    } else {
                      copyLink();
                      showToast('Skopiowano link do schowka!');
                    }
                  }, 
                  color: 'bg-surface-variant text-on-surface-variant hover:text-on-surface', 
                  icon: <span className="material-symbols-outlined text-lg">share</span> 
                },
                { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/?ref=${stats?.referralCode || ''}`)}&quote=${encodeURIComponent('Twórz muzykę z AI na mojhit.pl! Dołącz przez mój link i zgarnij darmowe nuty:')}`, color: 'bg-[#1877F2]', icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                { name: 'Messenger', action: () => { copyLink(); showToast('Skopiowano link! Możesz go wkleić znajomemu w Messengerze.'); window.open('https://www.messenger.com/', '_blank'); }, color: 'bg-[#00B2FF]', icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 3.1 1.54 5.86 3.96 7.67.16.12.26.31.25.5l-.26 2.47c-.05.5.47.88.94.73l2.67-.84c.18-.06.38-.06.56 0 1.25.43 2.62.66 4.05.66 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.09 13.06l-2.45-2.61c-.2-.21-.53-.21-.73 0l-3.35 3.56c-.34.36-.88.01-.68-.45l3.55-8.23c.18-.42.74-.53 1.05-.21l2.45 2.61c.2.21.53.21.73 0l3.35-3.56c.34-.36.88-.01.68.45l-3.55 8.23c-.18.42-.74.53-1.05.21z"/></svg> },
                { name: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(`Twórz muzykę z AI na mojhit.pl! Dołącz przez mój link: ${window.location.origin}/?ref=${stats?.referralCode || ''}`)}`, color: 'bg-[#25D366]', icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> },
                { name: 'Threads', url: `https://www.threads.net/intent/post?text=${encodeURIComponent(`Sprawdź mojhit.pl, załóż konto z mojego linku i odbierz darmowe nuty na start! ${window.location.origin}/?ref=${stats?.referralCode || ''}`)}`, color: 'bg-black border border-white/20', icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M16.326 12.339A4.708 4.708 0 0 0 12.012 8c-2.484 0-4.506 1.977-4.506 4.418s2.022 4.418 4.506 4.418c1.332 0 2.531-.564 3.364-1.49l.067-.074.88.948-.073.078A5.946 5.946 0 0 1 12.012 18c-3.197 0-5.798-2.544-5.798-5.582S8.815 6.836 12.012 6.836c3.198 0 5.798 2.544 5.798 5.582v1.396c0 1.25-.972 2.268-2.167 2.268-1.196 0-2.168-1.018-2.168-2.268v-1.475zm-3.027 2.658c1.197 0 2.168-1.018 2.168-2.268v-1.475a3.144 3.144 0 0 0-1.282-2.518A3.42 3.42 0 0 0 12.012 9.2c-1.884 0-3.414 1.493-3.414 3.336 0 1.843 1.53 3.336 3.414 3.336a3.42 3.42 0 0 0 2.173-.787A3.144 3.144 0 0 0 15.467 17.6c0 1.921-1.55 3.48-3.455 3.48-3.805 0-6.89-3.013-6.89-6.726 0-3.712 3.085-6.726 6.89-6.726s6.89 3.014 6.89 6.726c0 .24-.012.48-.035.72h1.161c.023-.24.035-.48.035-.72 0-4.354-3.623-7.89-8.051-7.89S3.961 10.002 3.961 14.354 7.584 22.244 12.012 22.244c2.22 0 4.23-1.01 5.558-2.613l-.88-.948a6.544 6.544 0 0 1-4.678 2.397c-3.805 0-6.89-3.013-6.89-6.726 0-3.712 3.085-6.726 6.89-6.726s6.89 3.014 6.89 6.726v1.396a1.006 1.006 0 0 0 1.006 1.104c.556 0 1.006-.494 1.006-1.104v-1.396c0-2.441-2.022-4.418-4.506-4.418-2.484 0-4.506 1.977-4.506 4.418s2.022 4.418 4.506 4.418c.844 0 1.62-.244 2.274-.66z"/></svg> },
                { name: 'TikTok', action: () => { copyLink(); showToast('Skopiowano link! Wklej go w opisie lub bio na TikToku.'); window.open('https://www.tiktok.com', '_blank'); }, color: 'bg-[#000000] border border-[#25F4EE]', icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.96-1.67 5.52-1.16 1.57-2.92 2.67-4.86 3.04-1.93.37-3.99.16-5.74-.75-1.74-.91-3.11-2.44-3.83-4.22-.72-1.78-.79-3.83-.2-5.65.59-1.82 1.79-3.38 3.36-4.41 1.58-1.02 3.51-1.4 5.37-1.1v4.13c-1.03-.13-2.1.09-2.95.66-.86.58-1.42 1.48-1.57 2.5-.15 1.03.11 2.11.72 2.92.62.81 1.61 1.28 2.65 1.27 1.03-.01 2.01-.52 2.62-1.35.6-.83.87-1.92.74-2.93V.02h-.02z"/></svg> },
                { name: 'Instagram', action: () => { copyLink(); showToast('Skopiowano link! Możesz go wysłać w DM lub dodać do bio na Instagramie.'); window.open('https://www.instagram.com', '_blank'); }, color: 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]', icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
              ].map((s, i) => (
                s.url ? (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    className={`${s.color} rounded-full px-4 py-2 flex items-center justify-center gap-2 text-white text-sm font-bold hover:scale-105 transition-all shadow-lg`}>
                    {s.icon}
                    <span className="hidden sm:inline">{s.name}</span>
                  </a>
                ) : (
                  <button key={i} onClick={s.action}
                    className={`${s.color} rounded-full px-4 py-2 flex items-center justify-center gap-2 text-white text-sm font-bold hover:scale-105 transition-all shadow-lg`}>
                    {s.icon}
                    <span className="hidden sm:inline">{s.name}</span>
                  </button>
                )
              ))}
            </div>
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
          
          {/* Affiliate wallet or Apply section */}
          {stats?.isAffiliate ? (
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
          ) : (
            <div className="bg-gradient-to-br from-surface-container-high to-surface-container-low rounded-3xl p-6 border border-tertiary/20 text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary to-primary"></div>
              <span className="material-symbols-outlined text-4xl text-tertiary mb-2">work_history</span>
              <h3 className="font-bold text-lg headline-font">Zostań Partnerem VIP</h3>
              <p className="text-xs text-on-surface-variant">
                Chcesz zarabiać prawdziwe pieniądze (prowizja do 30%) zamiast nut? Aplikuj do naszego programu dla twórców i promuj MojHit na swoich kanałach.
              </p>
              <button onClick={() => setShowApplyModal(true)} className="px-6 py-2.5 bg-tertiary text-on-primary rounded-xl font-bold hover:bg-tertiary/90 transition-all text-sm w-full">
                Aplikuj Teraz
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in px-6 py-3 bg-surface-container-highest text-on-surface border border-primary/30 rounded-2xl shadow-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-xl">info</span>
          <p className="text-sm font-bold">{toast}</p>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-high rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border border-outline-variant/20">
            <button onClick={() => {setShowApplyModal(false); setApplyStep(1); setApplySuccess(false);}} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">close</span>
            </button>
            
            {!applySuccess ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-3xl text-tertiary">rocket_launch</span>
                  <h3 className="text-2xl font-bold headline-font">Aplikacja Partnera VIP</h3>
                </div>

                {applyStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-sm text-on-surface-variant">Zanim przejdziesz dalej, zapoznaj się z naszymi zasadami promowania:</p>
                    <div className="bg-error/10 border border-error/20 p-4 rounded-xl text-sm">
                      <span className="font-bold text-error block mb-1">❌ Surowo zabronione:</span>
                      Płatne reklamy w jakiejkolwiek formie (Google Ads, Facebook Ads, TikTok Ads itp.).
                    </div>
                    <div className="bg-error/10 border border-error/20 p-4 rounded-xl text-sm">
                      <span className="font-bold text-error block mb-1">🚫 Niedozwolone:</span>
                      Podszywanie się pod markę MojHit.pl.
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-sm">
                      <span className="font-bold text-green-500 block mb-1">✅ Dozwolone:</span>
                      Organiczna, bezpłatna promocja (posty w social mediach, grupy, blogi, newslettery, YouTube, TikTok itp.).
                    </div>
                    <button onClick={() => setApplyStep(2)} className="w-full mt-4 px-4 py-3 bg-tertiary text-on-primary rounded-xl font-bold hover:bg-tertiary/90 transition-all">
                      Rozumiem i akceptuję
                    </button>
                  </div>
                )}

                {applyStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase mb-2 block">Gdzie będziesz nas promować?</label>
                      <input 
                        type="text" 
                        placeholder="Link do Twojego TikTok, YouTube, Instagram lub strony" 
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tertiary"
                        value={applyData.website}
                        onChange={e => setApplyData({...applyData, website: e.target.value})}
                      />
                    </div>
                    
                    <div className="bg-surface-container border border-outline-variant/30 rounded-xl p-4">
                      <label className="text-xs font-bold text-on-surface-variant uppercase mb-3 block">Wybierz model rozliczeń</label>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center mt-0.5">
                            <input type="radio" name="model" value="lifetime" checked={applyData.model === 'lifetime'} onChange={() => setApplyData({...applyData, model: 'lifetime'})} className="peer sr-only" />
                            <div className="w-5 h-5 rounded-full border-2 border-outline-variant peer-checked:border-tertiary peer-checked:bg-tertiary transition-all"></div>
                            <div className="absolute w-2 h-2 rounded-full bg-background opacity-0 peer-checked:opacity-100 transition-all"></div>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-on-surface group-hover:text-tertiary transition-colors">10% Dożywotnio (Lifetime)</p>
                            <p className="text-xs text-on-surface-variant mt-1">Otrzymujesz 10% od każdej wpłaty przyprowadzonego użytkownika, na zawsze.</p>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center mt-0.5">
                            <input type="radio" name="model" value="instant" checked={applyData.model === 'instant'} onChange={() => setApplyData({...applyData, model: 'instant'})} className="peer sr-only" />
                            <div className="w-5 h-5 rounded-full border-2 border-outline-variant peer-checked:border-tertiary peer-checked:bg-tertiary transition-all"></div>
                            <div className="absolute w-2 h-2 rounded-full bg-background opacity-0 peer-checked:opacity-100 transition-all"></div>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-on-surface group-hover:text-tertiary transition-colors">30% Jednorazowo (Instant)</p>
                            <p className="text-xs text-on-surface-variant mt-1">Otrzymujesz 30% tylko od pierwszej wpłaty (zakupu) przyprowadzonego użytkownika.</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase mb-2 block">Twój plan (krótko)</label>
                      <textarea 
                        placeholder="Napisz w 2-3 zdaniach jak zamierzasz przyciągać użytkowników..." 
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tertiary min-h-[100px]"
                        value={applyData.plan}
                        onChange={e => setApplyData({...applyData, plan: e.target.value})}
                      ></textarea>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer group mt-2">
                      <input 
                        type="checkbox" 
                        checked={applyData.agree}
                        onChange={e => setApplyData({...applyData, agree: e.target.checked})}
                        className="mt-1 w-5 h-5 rounded border-outline-variant/50 text-tertiary bg-surface-container-highest focus:ring-tertiary/50" 
                      />
                      <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
                        Oświadczam, że nie będę używać płatnych reklam (Google Ads, itp.) i rozumiem, że złamanie tej zasady grozi utratą wygenerowanej prowizji.
                      </span>
                    </label>
                    <button 
                      onClick={handleApply} 
                      disabled={applyLoading || !applyData.agree || !applyData.website}
                      className="w-full mt-4 px-4 py-3 bg-tertiary text-on-primary rounded-xl font-bold hover:bg-tertiary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {applyLoading ? <span className="material-symbols-outlined animate-spin">cycle</span> : 'Wyślij aplikację'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-4 animate-fade-in">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h3 className="text-2xl font-bold headline-font">Dziękujemy!</h3>
                <p className="text-on-surface-variant text-sm">Twoja aplikacja została wysłana do zespołu MojHit.pl. Przeanalizujemy ją i wkrótce się z Tobą skontaktujemy.</p>
                <button onClick={() => {setShowApplyModal(false); setApplyStep(1); setApplySuccess(false);}} className="mt-6 px-6 py-2.5 bg-surface-container-highest text-on-surface rounded-xl font-bold hover:bg-surface-variant transition-all">
                  Zamknij
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
