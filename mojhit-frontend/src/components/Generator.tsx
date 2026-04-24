import { useState } from 'react';

export function Generator() {
  const [activeTab, setActiveTab] = useState<'quick' | 'step'>('quick');
  const [selectedVoice, setSelectedVoice] = useState<'male' | 'female'>('male');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');

  const occasions = [
    { id: 'birthday', label: 'Urodziny', icon: 'cake' },
    { id: 'wedding', label: 'Ślub', icon: 'favorite' },
    { id: 'gift', label: 'Prezent', icon: 'redeem' },
    { id: 'diss', label: 'Diss', icon: 'local_fire_department' },
    { id: 'party', label: 'Impreza', icon: 'celebration' },
    { id: 'other', label: 'Inne', icon: 'edit_note' },
  ];

  return (
    <section className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-surface-container-high rounded-full p-1 border border-outline-variant/20 max-w-sm mx-auto">
        <button 
          onClick={() => setActiveTab('quick')}
          className={`flex-1 py-2.5 rounded-full text-sm font-bold headline-font transition-all ${
            activeTab === 'quick' 
              ? 'bg-primary text-on-primary shadow-sm' 
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          Szybki Start
        </button>
        <button 
          onClick={() => setActiveTab('step')}
          className={`flex-1 py-2.5 rounded-full text-sm font-bold headline-font transition-all ${
            activeTab === 'step' 
              ? 'bg-primary text-on-primary shadow-sm' 
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          Krok po kroku
        </button>
      </div>

      <div className="relative group mt-6">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-tertiary rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
        <div className="relative bg-surface-container-lowest rounded-2xl overflow-hidden ring-1 ring-outline-variant/10">
          
          {/* Content changes based on tab */}
          {activeTab === 'quick' ? (
            // QUICK START TAB
            <>
              <textarea 
                className="w-full h-40 bg-transparent border-none focus:ring-0 p-6 text-lg placeholder:text-on-surface-variant/40 resize-none font-body outline-none" 
                placeholder="Opisz swój hit albo wklej tutaj tekst piosenki..."
              ></textarea>
              <div className="flex justify-between items-center px-6 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 font-label">AI Engine v2.4</span>
                <div className="flex gap-2">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">mic</button>
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">attach_file</button>
                </div>
              </div>
            </>
          ) : (
            // STEP-BY-STEP TAB
            <div className="p-6 space-y-8">
              
              {/* Step 1: Occasion */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label">1. Z jakiej okazji?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {occasions.map(occ => (
                    <button 
                      key={occ.id}
                      onClick={() => setSelectedOccasion(occ.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                        selectedOccasion === occ.id
                          ? 'border-primary bg-primary/10 text-primary glow-meter-head'
                          : 'border-outline-variant/20 bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined mb-2 text-2xl" style={selectedOccasion === occ.id ? {fontVariationSettings: "'FILL' 1"} : {}}>
                        {occ.icon}
                      </span>
                      <span className="text-xs font-semibold headline-font">{occ.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Voice */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label">2. Wybierz głos</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedVoice('male')}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      selectedVoice === 'male'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant/20 bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined">man</span>
                    <span className="text-sm font-bold headline-font">Męski</span>
                  </button>
                  <button 
                    onClick={() => setSelectedVoice('female')}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      selectedVoice === 'female'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant/20 bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined">woman</span>
                    <span className="text-sm font-bold headline-font">Żeński</span>
                  </button>
                </div>
              </div>

              {/* Step 3: Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label">3. O czym ma być piosenka?</h3>
                  <span className="text-[10px] text-on-surface-variant/50">Opcjonalnie</span>
                </div>
                <textarea 
                  className="w-full h-24 bg-surface-container border border-outline-variant/20 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary p-4 text-sm placeholder:text-on-surface-variant/40 resize-none font-body outline-none transition-all" 
                  placeholder="Np. Basia kończy 30 lat, lubi psy i pije dużo kawy..."
                ></textarea>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main CTA */}
      <button className="w-full bg-gradient-to-r from-primary to-primary-container py-5 rounded-full text-on-primary font-extrabold text-lg headline-font tracking-tight shadow-[0_10px_30px_rgba(255,144,100,0.4)] active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3">
        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
        Generuj Hit
      </button>
    </section>
  );
}

