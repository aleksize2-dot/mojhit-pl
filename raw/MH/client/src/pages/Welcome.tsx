import { useState, useEffect } from 'react';
import { SignUpButton, SignInButton } from '@clerk/clerk-react';

export function Welcome() {
  const [producers, setProducers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/producers?status=active')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Get a few top producers
          setProducers(data.slice(0, 3));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative text-center pt-20 pb-10 px-4">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[40%] h-[50%] bg-tertiary/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant/30 text-xs font-bold uppercase tracking-widest text-primary mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Nowa era muzyki AI
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold headline-font text-on-surface tracking-tight leading-tight mb-6">
            Twój własny <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Radiowy Hit</span> w 3 minuty
          </h1>
          
          <p className="text-lg md:text-xl text-on-surface-variant font-body max-w-2xl mx-auto mb-10 leading-relaxed">
            Poznaj wirtualnych wykonawców, którzy napiszą, zaśpiewają i wyprodukują utwór na dowolny temat. Ty dajesz pomysł — my robimy z tego banger.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <SignUpButton mode="modal">
              <button className="px-8 py-4 rounded-2xl bg-primary text-on-primary font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-1 hover:shadow-primary/20">
                Stwórz darmowe konto
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="px-8 py-4 rounded-2xl bg-surface-container-high text-on-surface font-bold uppercase tracking-widest text-sm border border-outline-variant/20 hover:bg-surface-bright transition-all shadow-sm hover:-translate-y-1">
                Zaloguj się
              </button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold headline-font">Jak to działa?</h2>
          <p className="text-on-surface-variant mt-2">Trzy proste kroki do własnego utworu</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: 'groups', title: 'Wybierz Wykonawcę', desc: 'Każdy ma swój unikalny styl, głos i vibe. Od rapu po disco polo.' },
            { icon: 'chat', title: 'Opisz swój pomysł', desc: 'Powiedz AI, o czym ma być piosenka. Resztę zrobi za Ciebie.' },
            { icon: 'headphones', title: 'Odbierz gotowy hit', desc: 'W kilka minut otrzymujesz w pełni wyprodukowany kawałek.' }
          ].map((feat, i) => (
            <div key={i} className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 text-center hover:border-primary/30 transition-all hover:-translate-y-2 group">
              <div className="w-16 h-16 mx-auto bg-surface-container-high rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                <span className="material-symbols-outlined text-3xl text-primary">{feat.icon}</span>
              </div>
              <h3 className="text-xl font-bold headline-font mb-3">{feat.title}</h3>
              <p className="text-on-surface-variant font-body">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="bg-surface-container rounded-[2.5rem] p-8 md:p-16 border border-outline-variant/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-bold headline-font mb-4">Poznaj naszą ekipę</h2>
              <p className="text-on-surface-variant text-lg mb-8 max-w-md">
                Współpracujemy z najlepszymi wirtualnymi artystami. Każdy z nich ma własny charakter i specjalizuje się w innym gatunku muzycznym.
              </p>
              <SignUpButton mode="modal">
                <button className="px-6 py-3 rounded-xl bg-tertiary text-on-primary font-bold uppercase tracking-widest text-xs hover:bg-tertiary/90 transition-all shadow-md">
                  Zakontraktuj ich wszystkich
                </button>
              </SignUpButton>
            </div>

            <div className="flex-1 w-full grid grid-cols-2 gap-4">
              {producers.length > 0 ? producers.map((p, i) => (
                <div key={p.id} className={`bg-surface-container-lowest p-4 rounded-3xl border border-outline-variant/10 text-center ${i === 2 ? 'col-span-2 md:col-span-1' : ''}`}>
                  <img src={p.img} alt={p.name} className="w-20 h-20 mx-auto rounded-full object-cover mb-3 border-2 border-surface-variant" />
                  <h4 className="font-bold headline-font">{p.name}</h4>
                  <p className="text-xs text-primary font-bold uppercase mt-1">{p.genre || p.badge}</p>
                </div>
              )) : (
                <div className="col-span-2 text-center py-10 text-on-surface-variant/50">Ładowanie wykonawców...</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center max-w-3xl mx-auto px-4 pt-10">
        <h2 className="text-4xl font-bold headline-font mb-6">Gotowy na swój pierwszy kawałek?</h2>
        <SignUpButton mode="modal">
          <button className="px-10 py-5 rounded-2xl bg-on-surface text-surface font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform shadow-2xl">
            Wejdź do studia
          </button>
        </SignUpButton>
      </section>

    </div>
  );
}
