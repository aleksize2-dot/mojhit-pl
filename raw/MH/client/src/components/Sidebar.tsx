import { useUser, useClerk } from '@clerk/clerk-react';
import { NavLink, Link } from 'react-router-dom';
import { useTheme } from '../lib/ThemeContext';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  balance?: { coins: number; notes: number; plan?: string };
};

export function Sidebar({ isOpen, onClose, balance }: SidebarProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-surface-container-low border-l border-outline-variant/20 shadow-2xl z-[110] transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-outline-variant/20 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30">
              {user ? (
                <img alt="User Profile" src={user.imageUrl} />
              ) : (
                <div className="w-full h-full bg-surface-container-high" />
              )}
            </div>
            <div className="flex items-center gap-1 -mt-2 -mr-2">
              <Link to="/ustawienia" onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors p-2 flex items-center justify-center" title="Ustawienia">
                <span className="material-symbols-outlined text-xl">settings</span>
              </Link>
              {user && (
                <button onClick={() => signOut()} className="text-error hover:text-error/80 transition-colors p-2 flex items-center justify-center" title="Wyloguj się">
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
              )}
              <button onClick={onClose} className="hidden md:block text-on-surface-variant hover:text-white transition-colors p-2 flex items-center justify-center" title="Zamknij">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-bold headline-font">{user ? user.fullName || user.firstName || 'Użytkownik' : 'Not logged in'}</h2>
              {user && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-variant text-on-surface-variant border border-outline-variant/30">
                  {balance?.plan || 'Free'}
                </span>
              )}
              <button 
                onClick={toggleTheme}
                className={`w-9 h-5 rounded-full relative transition-colors flex items-center p-0.5 ml-1 shadow-sm ${theme === 'dark' ? 'bg-primary' : 'bg-outline-variant'}`} 
                title="Przełącz motyw"
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute shadow-sm transition-all duration-300 flex items-center justify-center ${theme === 'dark' ? 'right-0.5' : 'left-0.5'}`}>
                  <span className="material-symbols-outlined text-[10px] text-surface" style={{fontVariationSettings: "'FILL' 1"}}>{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
                </div>
              </button>
            </div>
            <p className="text-on-surface-variant text-sm font-body leading-tight">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          
          {/* Dual Balance */}
          <div className="bg-surface-container-high rounded-xl p-4 flex justify-around items-center mt-2">
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-3xl text-primary mb-1" style={{fontVariationSettings: "'FILL' 1"}}>stars</span>
              <span className="font-bold headline-font text-lg">{balance?.coins ?? 0}</span>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-label">Hity</span>
            </div>
            <div className="w-px h-10 bg-outline-variant/30"></div>
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-3xl text-tertiary mb-1" style={{fontVariationSettings: "'FILL' 1"}}>music_note</span>
              <span className="font-bold headline-font text-lg">{balance?.notes ?? 0}</span>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-label">Noty</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1 pb-32">
          <NavLink to="/browse" onClick={onClose} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-colors group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-high text-on-surface'}`}>
            <span className={`material-symbols-outlined transition-colors ${false ? '' : 'text-on-surface-variant group-hover:text-primary'}`}>explore</span>
            <span className="font-semibold headline-font text-sm">Przeglądaj</span>
          </NavLink>
          <NavLink to="/" onClick={onClose} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-colors group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-high text-on-surface'}`}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
            <span className="font-semibold headline-font text-sm">Stwórz Hit</span>
          </NavLink>
          <NavLink to="/my-tracks" onClick={onClose} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-colors group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-high text-on-surface'}`}>
            <span className={`material-symbols-outlined transition-colors ${false ? '' : 'text-on-surface-variant group-hover:text-primary'}`}>library_music</span>
            <span className="font-semibold headline-font text-sm">Moje utwory</span>
          </NavLink>
          <NavLink to="/my-producers" onClick={onClose} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-colors group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-high text-on-surface'}`}>
            <span className={`material-symbols-outlined transition-colors ${false ? '' : 'text-on-surface-variant group-hover:text-primary'}`}>groups</span>
            <span className="font-semibold headline-font text-sm">Twoi wykonawcy</span>
          </NavLink>
          <NavLink to="/biuro-producentow" onClick={onClose} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-colors group ${isActive ? 'bg-tertiary/10 text-tertiary' : 'hover:bg-surface-container-high text-on-surface'}`}>
            <span className={`material-symbols-outlined transition-colors text-tertiary`}>store</span>
            <span className="font-semibold headline-font text-sm">Giełda wykonawców</span>
          </NavLink>
          <NavLink to="/contests" onClick={onClose} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-colors group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-high text-on-surface'}`}>
            <span className={`material-symbols-outlined transition-colors ${false ? '' : 'text-on-surface-variant group-hover:text-primary'}`}>emoji_events</span>
            <span className="font-semibold headline-font text-sm">Konkursy</span>
          </NavLink>
          <Link to="/cennik" onClick={onClose} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface group">
            <span className="material-symbols-outlined text-primary group-hover:text-primary transition-colors" style={{fontVariationSettings: "'FILL' 1"}}>stars</span>
            <span className="font-semibold headline-font text-sm">Kup Hity</span>
          </Link>
          <Link to="/polecaj" onClick={onClose} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface group">
            <span className="material-symbols-outlined text-green-500 group-hover:text-primary transition-colors">group_add</span>
            <span className="font-semibold headline-font text-sm">Polecaj & Zarabiaj</span>
          </Link>

          <div className="h-px bg-outline-variant/20 my-4 mx-4"></div>

          <Link to="/instrukcja-faq" onClick={onClose} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant group">
            <span className="material-symbols-outlined">help</span>
            <span className="font-medium font-body text-sm text-on-surface">Instrukcja (FAQ)</span>
          </Link>
          <Link to="/wsparcie" onClick={onClose} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant group">
            <span className="material-symbols-outlined">support_agent</span>
            <span className="font-medium font-body text-sm text-on-surface">Wsparcie</span>
          </Link>
      </div>
    </div>
    </>
  );
}
