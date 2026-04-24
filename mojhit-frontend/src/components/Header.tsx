import { useState } from 'react';
import { Sidebar } from './Sidebar';

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl transition-colors duration-300 border-b border-slate-800">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ff9064]">music_note</span>
            <h1 className="text-xl font-bold tracking-tight text-[#ff9064] headline-font">mojhit.pl</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Desktop top nav (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-6 mr-4 font-headline text-sm font-semibold">
              <a href="#" className="text-on-surface hover:text-primary transition-colors">Przeglądaj</a>
              <a href="#" className="text-on-surface hover:text-primary transition-colors">Moje Utwory</a>
            </div>

            <div className="bg-surface-container-high px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider font-label cursor-pointer hover:bg-surface-bright transition-colors" onClick={() => setIsSidebarOpen(true)}>
              <span>🪙 12</span>
              <span className="text-on-surface-variant/30">|</span>
              <span>🎵 150</span>
            </div>
            
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <img 
                alt="User Profile" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAl-gErCA5XHJ90zT50ztqeVkGY9PpE9mguT8qL0JYEgtHLsK10-n4-P8TAqw9xwk5qxahXhyr4fOdmSUYKhCtLBIaCuGiU_77XtdskXn9Tiwkq6d0jmpQ7yEhjksvcU2kp78GbhlDpD8Hza6m3K9Jng-7nQ5__ueyCZDG0PXk32qdYoYWNglfKuL5TEWuKn1A_auvVacUlzt1ROdMZjKb1-yR4-EM4DjAiCYRupmsKFinrWYEPUPqQs2rgPcWpiEATgEF1PsML7RY" 
              />
            </button>
          </div>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}

