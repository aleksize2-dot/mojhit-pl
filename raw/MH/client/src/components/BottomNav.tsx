import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

export function BottomNav() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Start", icon: "home", path: "/" },
    { label: "Moje", icon: "library_music", path: "/my-tracks", isCustom: true },
    { label: "Wykonawcy", icon: "groups", path: "/biuro-producentow" },
    { label: "Panel", icon: "menu", path: "#", isSidebarTrigger: true },
  ];

  useEffect(() => {
    if (isSheetOpen) {
      setLoading(true);
      fetch('/api/tracks/my', { credentials: 'include' })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setTracks(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isSheetOpen]);

  // Close sheet on route change
  useEffect(() => {
    setIsSheetOpen(false);
  }, [location.pathname]);

  const handleMojeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSheetOpen(prev => !prev);
  };

  return (
    <>
      {/* Bottom Sheet for My Tracks */}
      <div 
        className={`md:hidden fixed bottom-[72px] left-0 w-full bg-surface-container-low border-t border-outline-variant/20 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 z-40 flex flex-col ${isSheetOpen ? 'translate-y-0' : 'translate-y-[150%]'}`}
        style={{ maxHeight: '35vh' }}
      >
        <div className="flex justify-center pt-3 pb-2 w-full" onClick={() => setIsSheetOpen(false)}>
          <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full"></div>
        </div>
        
        <div className="px-5 pb-2 flex justify-between items-center">
          <h3 className="font-bold headline-font text-lg">Ostatnie utwory</h3>
          <button onClick={() => { setIsSheetOpen(false); navigate('/my-tracks'); }} className="text-primary text-xs font-bold uppercase tracking-wider">
            Zobacz wszystkie
          </button>
        </div>

        <div className="overflow-x-auto flex gap-4 px-5 pb-5 snap-x snap-mandatory hide-scrollbar flex-1 items-start pt-1">
          {loading ? (
            <div className="flex w-full justify-center py-4">
              <span className="material-symbols-outlined animate-spin text-primary">cycle</span>
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center w-full py-4 text-sm text-on-surface-variant">Brak wygenerowanych utworów</div>
          ) : (
            tracks.map((track) => (
              <div 
                key={track.id} 
                onClick={() => { setIsSheetOpen(false); navigate(`/track/${track.id}`); }}
                className="shrink-0 w-[85vw] sm:w-[70vw] snap-center bg-surface-container-high p-3 rounded-2xl flex items-center gap-4 cursor-pointer active:scale-95 transition-transform border border-outline-variant/10 shadow-sm"
              >
                <div className="w-14 h-14 bg-surface-container-highest rounded-xl overflow-hidden shrink-0 flex justify-center items-center relative">
                  {track.cover_image_url ? (
                    <img src={track.cover_image_url} alt="cover" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-primary/50 text-2xl">music_note</span>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">play_circle</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold headline-font text-sm truncate">{track.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-on-surface-variant text-[10px] uppercase font-bold truncate">
                      {new Date(track.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest/90 backdrop-blur-2xl z-[120] rounded-t-[2rem] shadow-[0px_-4px_20px_rgba(0,0,0,0.3)] border-t border-outline-variant/20">
        <div className="flex justify-around items-center px-4 pb-6 pt-3">
          {navItems.map((item, idx) => {
            if (item.isSidebarTrigger) {
              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSheetOpen(false);
                    document.dispatchEvent(new CustomEvent('toggleSidebar'));
                  }}
                  className="flex flex-col items-center justify-center transition-all text-slate-400 hover:text-white"
                >
                  <span className="material-symbols-outlined transition-all">{item.icon}</span>
                  <span className="font-medium text-[11px] headline-font mt-0.5">{item.label}</span>
                </button>
              );
            }
            return (
              <NavLink 
                key={idx}
                to={item.path}
                onClick={(e) => {
                  document.dispatchEvent(new CustomEvent('closeSidebar'));
                  if (item.isCustom) {
                    handleMojeClick(e);
                  } else {
                    setIsSheetOpen(false);
                  }
                }}
                className={({ isActive }) => `flex flex-col items-center justify-center transition-all ${
                  isActive && !item.isCustom
                    ? "text-[#ff9064] bg-[#ff9064]/10 rounded-full px-4 py-1 shadow-[0_0_15px_rgba(255,144,100,0.2)] scale-105" 
                    : (item.isCustom && isSheetOpen) 
                      ? "text-[#ff9064] scale-110" 
                      : "text-slate-400 hover:text-white"
                }`} 
              >
                {({ isActive }) => (
                   <>
                     <span 
                       className="material-symbols-outlined transition-all" 
                       style={(isActive && !item.isCustom) || (item.isCustom && isSheetOpen) ? {fontVariationSettings: "'FILL' 1"} : {}}
                     >
                       {item.icon}
                     </span>
                     <span className="font-medium text-[11px] headline-font mt-0.5">{item.label}</span>
                   </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
