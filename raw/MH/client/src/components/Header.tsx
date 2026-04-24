import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [balance, setBalance] = useState({ coins: 0, notes: 0, plan: 'Free' });
  const [hitCount, setHitCount] = useState<string>('11,381+');

  useEffect(() => {
    fetch('/api/settings/site')
      .then(res => res.json())
      .then(data => {
        if (data.header_counter_manual_enabled) {
          setHitCount(`${data.header_counter_manual_value.toLocaleString('en-US')}+`);
        } else if (data.real_track_count !== undefined) {
          setHitCount(`${data.real_track_count.toLocaleString('en-US')}+`);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleToggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const handleCloseSidebar = () => setIsSidebarOpen(false);
    document.addEventListener('toggleSidebar', handleToggleSidebar);
    document.addEventListener('closeSidebar', handleCloseSidebar);
    return () => {
      document.removeEventListener('toggleSidebar', handleToggleSidebar);
      document.removeEventListener('closeSidebar', handleCloseSidebar);
    };
  }, []);

  useEffect(() => {
    const fetchBalance = () => {
      console.log('Fetching balance...');
      fetch('/api/user/balance', { credentials: 'include' })
        .then(res => {
          console.log('Balance response status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('Balance data received:', data);
          if (data && data.coins !== undefined) {
             setBalance({ coins: Number(data.coins), notes: Number(data.notes), plan: data.plan || 'Free' });
          } else {
            console.warn('Balance data missing coins or notes:', data);
          }
        })
        .catch(err => console.error('Error fetching balance:', err));
    };

    if (isSignedIn) {
      fetchBalance();
      // Listen for custom event from generator
      window.addEventListener('updateBalance', fetchBalance);
      return () => window.removeEventListener('updateBalance', fetchBalance);
    }
  }, [isSignedIn]);

  return (
    <>
      <div className="bg-surface-container/50 border-b border-outline-variant/10 hidden lg:block text-on-surface-variant text-[11px] font-medium font-label backdrop-blur-md relative z-[60]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-1.5 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[14px]">check</span>
            <span>Stworzone w Polsce. Dbamy o Twoją prywatność.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center text-[#ffc107]">
              <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>star_half</span>
            </span>
            <span className="font-bold">4.9/5</span>
            <span className="opacity-80 flex items-center gap-1.5 ml-1">
              — Docenione przez twórców na 
              <span className="flex items-center gap-1 text-on-surface font-semibold">
                <svg viewBox="0 0 448 512" fill="currentColor" className="w-[11px] h-[11px] opacity-90">
                  <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                </svg>
                TikTok
              </span>
              i
              <span className="flex items-center gap-1 text-on-surface font-semibold">
                <svg viewBox="0 0 448 512" fill="currentColor" className="w-[11px] h-[11px] opacity-90">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                </svg>
                Instagram
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[14px]">check</span>
            <span>{hitCount} wygenerowanych hitów</span>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl transition-colors duration-300 border-b border-outline-variant/20">
        <div className="flex justify-between items-center w-full px-4 md:px-8 py-3">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="material-symbols-outlined text-[#ff9064] text-[24px] sm:text-[28px]" style={{fontVariationSettings: "'FILL' 1"}}>music_note</span>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#ff9064] headline-font whitespace-nowrap">mojhit.pl</h1>
          </Link>

          {/* Right: Nav & Actions */}
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-6 font-headline text-sm font-semibold">
              <Link to="/browse" className="text-on-surface hover:text-primary transition-colors whitespace-nowrap">Ostatnio stworzone</Link>
              <Link to="/teksty" className="text-on-surface hover:text-tertiary transition-colors flex items-center gap-1 whitespace-nowrap"><span className="material-symbols-outlined text-[18px]">lyrics</span> Bank Tekstów</Link>
              <Link to="/my-tracks" className="text-on-surface hover:text-primary transition-colors whitespace-nowrap">Moje Utwory</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
            <SignedIn>
              {user?.id === 'user_3BiIa5lj5AiMLDvGL2OqjEDbqLh' && (
                <Link to="/admin" className="text-on-surface-variant/50 hover:text-primary transition-colors" title="Admin Panel">
                  <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
                </Link>
              )}

              {/* Gift icon (mockup) */}
              <button 
                onClick={() => {/* TODO: Gift/bonus modal */}} 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface-container-high hover:bg-surface-bright flex items-center justify-center transition-colors relative group shrink-0"
                title="Bonusy"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-on-surface-variant group-hover:text-primary transition-colors">redeem</span>
              </button>

              {/* Balance pill + Upgrade */}
              <div className="bg-surface-container-high rounded-full flex items-center gap-0 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-label overflow-hidden border border-outline-variant/20">
                <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-surface-bright transition-colors" onClick={() => setIsSidebarOpen(true)}>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>stars</span>
                    <span>{balance.coins}</span>
                  </div>
                  <span className="text-on-surface-variant/20">|</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>music_note</span>
                    <span>{balance.notes}</span>
                  </div>
                </div>
                <Link to="/cennik" className="bg-primary hover:bg-primary-dim text-on-primary px-2 sm:px-3 py-1.5 sm:py-2 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest transition-colors whitespace-nowrap flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px] sm:hidden" style={{fontVariationSettings: "'FILL' 1"}}>payments</span>
                  <span className="hidden sm:inline">Upgrade</span>
                </Link>
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center overflow-hidden border-2 border-outline-variant/20 hover:border-primary/50 transition-colors shrink-0 cursor-pointer" onClick={() => setIsSidebarOpen(true)}>
                 <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 sm:w-9 sm:h-9" } }} />
              </div>
            </SignedIn>
            <SignedOut>
               <SignInButton mode="modal">
                 <button className="bg-primary hover:bg-primary-dark text-on-primary px-5 py-2 rounded-full font-bold uppercase tracking-wider text-[11px] transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
                   Zaloguj się
                 </button>
               </SignInButton>
            </SignedOut>
          </div>
        </div>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} balance={balance} />
    </>
  );
}

