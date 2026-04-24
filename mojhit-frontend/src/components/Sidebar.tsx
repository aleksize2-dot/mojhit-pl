import { useState } from 'react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
        {/* Header / Profile */}
        <div className="p-6 border-b border-outline-variant/20 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30">
              <img 
                alt="User Profile" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAl-gErCA5XHJ90zT50ztqeVkGY9PpE9mguT8qL0JYEgtHLsK10-n4-P8TAqw9xwk5qxahXhyr4fOdmSUYKhCtLBIaCuGiU_77XtdskXn9Tiwkq6d0jmpQ7yEhjksvcU2kp78GbhlDpD8Hza6m3K9Jng-7nQ5__ueyCZDG0PXk32qdYoYWNglfKuL5TEWuKn1A_auvVacUlzt1ROdMZjKb1-yR4-EM4DjAiCYRupmsKFinrWYEPUPqQs2rgPcWpiEATgEF1PsML7RY" 
              />
            </div>
            <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
          <div>
            <h2 className="text-lg font-bold headline-font">Jan Kowalski</h2>
            <p className="text-on-surface-variant text-sm font-body">jan.kowalski@example.com</p>
          </div>
          
          {/* Dual Balance */}
          <div className="bg-surface-container-high rounded-xl p-4 flex justify-around items-center mt-2">
            <div className="flex flex-col items-center">
              <span className="text-xl">🪙</span>
              <span className="font-bold headline-font text-lg">12</span>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-label">Monety</span>
            </div>
            <div className="w-px h-10 bg-outline-variant/30"></div>
            <div className="flex flex-col items-center">
              <span className="text-xl">🎵</span>
              <span className="font-bold headline-font text-lg">150</span>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-label">Noty</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface group">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">explore</span>
            <span className="font-semibold headline-font text-sm">Przeglądaj</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-primary/10 text-primary transition-colors group">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
            <span className="font-semibold headline-font text-sm">Stwórz Hit</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface group">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">library_music</span>
            <span className="font-semibold headline-font text-sm">Moje utwory</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface group">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">emoji_events</span>
            <span className="font-semibold headline-font text-sm">Konkursy</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface group">
            <span className="material-symbols-outlined text-tertiary group-hover:text-primary transition-colors">star</span>
            <span className="font-semibold headline-font text-sm">Kup Monety VIP</span>
          </a>

          <div className="h-px bg-outline-variant/20 my-4 mx-4"></div>

          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant group">
            <span className="material-symbols-outlined">help</span>
            <span className="font-medium font-body text-sm text-on-surface">Instrukcja (FAQ)</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant group">
            <span className="material-symbols-outlined">support_agent</span>
            <span className="font-medium font-body text-sm text-on-surface">Wsparcie</span>
          </a>
        </div>

        {/* Footer / Settings */}
        <div className="p-4 border-t border-outline-variant/20 space-y-2">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="font-medium font-body text-sm text-on-surface-variant">Ciemny motyw</span>
            <button className="w-10 h-6 bg-primary rounded-full relative transition-colors flex items-center p-1">
              <div className="w-4 h-4 bg-on-primary rounded-full absolute right-1 shadow-sm"></div>
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="font-medium font-body text-sm text-on-surface-variant">Język</span>
            <span className="font-bold headline-font text-xs uppercase text-on-surface">PL</span>
          </div>
          <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-error/10 text-error transition-colors font-bold headline-font text-sm">
            <span className="material-symbols-outlined">logout</span>
            Wyloguj się
          </button>
        </div>
      </div>
    </>
  );
}
