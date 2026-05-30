import { useState, useEffect, useRef } from 'react';
import { SignUpButton, SignInButton } from '@clerk/react';

interface Track {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  cover_image_url: string;
  likes: number;
  producer_id: string;
  producers?: { name: string };
}

function TrackCard({
  track,
  isPlaying,
  isActive,
  onPlay
}: {
  track: Track;
  isPlaying: boolean;
  isActive: boolean;
  onPlay: () => void;
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onPlay();
      }}
      className={`flex items-center gap-3 bg-surface-container-low/40 backdrop-blur-md border p-3 rounded-2xl w-64 md:w-76 transition-all duration-300 cursor-pointer shadow-sm ${
        isActive
          ? 'border-primary/50 shadow-primary/10 shadow-lg bg-surface-container-low/60 scale-[1.02]'
          : 'border-outline-variant/10 hover:border-primary/30 hover:scale-[1.01]'
      }`}
    >
      {/* Cover Artwork */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-high shadow-md">
        <img
          src={track.cover_image_url || '/placeholder.png'}
          alt={track.title}
          className="w-full h-full object-cover"
        />
        {/* Play/Pause Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-0 hover:opacity-100">
          <span className="material-symbols-outlined text-white text-3xl">
            {isPlaying && isActive ? 'pause' : 'play_arrow'}
          </span>
        </div>
        
        {/* Neon Equalizer Overlay when playing */}
        {isPlaying && isActive && (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-end justify-center gap-[3px] pb-3">
            <span className="w-[3px] bg-primary rounded-full eq-bar-1" style={{ height: '6px' }}></span>
            <span className="w-[3px] bg-primary rounded-full eq-bar-2" style={{ height: '18px' }}></span>
            <span className="w-[3px] bg-primary rounded-full eq-bar-3" style={{ height: '10px' }}></span>
            <span className="w-[3px] bg-primary rounded-full eq-bar-4" style={{ height: '22px' }}></span>
          </div>
        )}
      </div>

      {/* Info details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h4 className="font-bold text-xs md:text-sm text-on-surface truncate">
            {track.title}
          </h4>
          <p className="text-[10px] md:text-xs text-on-surface-variant flex items-center gap-1 font-semibold truncate mt-0.5">
            <span className="material-symbols-outlined text-[14px] text-primary">mic</span>
            {track.producers?.name || 'Wirtualny Artysta'}
          </p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="flex items-center gap-1 text-[10px] text-on-surface-variant font-bold">
            <span className="material-symbols-outlined text-[12px] text-primary fill-current">favorite</span>
            {track.likes || 0}
          </span>
          <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-bold uppercase tracking-wider">
            HIT
          </span>
        </div>
      </div>
    </div>
  );
}

const welcomeFaqData = [
  {
    question: "Jak wygenerować piosenkę AI?",
    answer: "To dziecinnie proste! Wybierz jednego z naszych wirtualnych wykonawców (każdy ma inny głos i styl muzyczny), opisz swój pomysł w kilku zdaniach (np. «Wesoła piosenka urodzinowa dla Kasi, pop, szybkie tempo») i kliknij przycisk generowania. W 3 minuty otrzymasz w pełni wyprodukowany radiowy hit!"
  },
  {
    question: "Jak działają Monety i co daje rejestracja?",
    answer: "Każda generacja utworu (która daje Ci 2 unikalne warianty) kosztuje 1 Monetę. Rejestracja jest całkowicie bezpłatna i pozwala na wygodne zapisywanie wszystkich utworów na Twoim koncie, gromadzenie darmowych monet oraz dostęp do pełnego panelu studia."
  },
  {
    question: "Czy mogę używać wygenerowanych piosenek komercyjnie?",
    answer: "Tak! Wszystkie piosenki, które wygenerujesz przy użyciu platformy, należą w pełni do Ciebie. Możesz bez przeszkód publikować je na YouTube, TikToku, Instagramie, w radiu czy telewizji — również w celach czysto komercyjnych, bez żadnych opłat licencyjnych."
  },
  {
    question: "Jak długo trwa wygenerowanie gotowego utworu?",
    answer: "Wygenerowanie pełnej, profesjonalnej piosenki wraz z tekstem, wokalem, aranżacją i masteringiem zajmuje wirtualnemu producentowi około 3 minut."
  },
  {
    question: "Czy mogę pobrać piosenkę jako plik MP3?",
    answer: "Oczywiście! Pod każdym wygenerowanym utworem znajduje się dedykowany przycisk pobierania, który pozwala zapisać utwór bezpośrednio na dysk komputera lub do pamięci telefonu w formacie MP3 wysokiej jakości."
  },
  {
    question: "Czy mogę żądać zwrotu środków?",
    answer: "Tak, dbamy o zadowolenie naszych klientów. Możesz ubiegać się o zwrot środków za zakupione pakiety monet w ciągu 14 dni od transakcji, pod warunkiem, że zakupione monety nie zostały jeszcze wykorzystane do generowania muzyki."
  },
  {
    question: "Co zrobić, jeśli kupiłem monety, ale nie mogę ich znaleźć?",
    answer: "Najpierw sprawdź swoją skrzynkę e-mail (w tym folder spam) w poszukiwaniu potwierdzenia transakcji. Wszystkie Twoje monety oraz historia zakupów są automatycznie przypisywane do Twojego profilu i widoczne w panelu po zalogowaniu. Jeśli nadal masz problem, napisz do nas na kontakt@mojhit.pl — sprawdzimy system i pomożemy Ci odzyskać dostęp w kilka minut."
  }
];

export function Welcome() {
  const [producers, setProducers] = useState<any[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/producers?status=active')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducers(data.slice(0, 3));
        }
      })
      .catch(console.error);

    fetch('/api/tracks/top?limit=10')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTopTracks(data);
        }
      })
      .catch(console.error);

    fetch('/api/tracks/recent?limit=10')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecentTracks(data);
        }
      })
      .catch(console.error);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlay = (track: Track) => {
    if (!audioRef.current) return;

    if (activeTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    } else {
      setActiveTrack(track);
      audioRef.current.src = track.audio_url;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(console.error);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (activeTrack) {
      const topIdx = topTracks.findIndex(t => t.id === activeTrack.id);
      if (topIdx !== -1 && topIdx < topTracks.length - 1) {
        handlePlay(topTracks[topIdx + 1]);
        return;
      }
      const recentIdx = recentTracks.findIndex(t => t.id === activeTrack.id);
      if (recentIdx !== -1 && recentIdx < recentTracks.length - 1) {
        handlePlay(recentTracks[recentIdx + 1]);
        return;
      }
    }
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative text-center pt-20 pb-10 px-4">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[40%] h-[50%] bg-tertiary/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* AI Sparkle Hero Animation */}
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center select-none pointer-events-none">
            {/* Glowing Aura */}
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-md animate-pulse"></div>

            {/* Radial Sunburst Equalizer behind the star */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <div className="relative w-16 h-16 flex items-center justify-center">
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = i * 15; // 360 / 24 = 15
                  return (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        transform: `rotate(${angle}deg) translateY(-14px)`,
                        transformOrigin: 'center bottom',
                      }}
                    >
                      <div
                        className="w-[2px] h-6 bg-gradient-to-t from-primary/80 to-tertiary rounded-full animate-radial-pulse"
                        style={{
                          transformOrigin: 'center bottom',
                          animationDelay: `${(i % 6) * 0.12}s`,
                          animationDuration: `${0.8 + (i % 4) * 0.15}s`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Outer Slow Spinning 4-Point AI Star */}
            <div className="absolute inset-0 animate-spin-slow flex items-center justify-center">
              <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" fill="url(#sparkle-grad)" />
                <defs>
                  <linearGradient id="sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff9064" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ffa765" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Inner Floating Music Note */}
            <div className="relative z-10 flex items-center justify-center animate-float-gentle">
              <span className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_10px_rgba(255,144,100,0.5)] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                music_note
              </span>
            </div>
          </div>

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

      {/* Infinity Stream Section */}
      {(topTracks.length > 0 || recentTracks.length > 0) && (
        <section className="relative overflow-hidden py-12 bg-surface-container/10 border-y border-outline-variant/10 marquee-container full-bleed space-y-10">
          <div className="text-center mb-4 px-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Odkryj twórczość społeczności</span>
            <h2 className="text-3xl md:text-4xl font-extrabold headline-font mt-1">Hity naszych użytkowników</h2>
          </div>
          
          <div className="space-y-10">
            {/* Row 1 (Top 10 Hits) */}
            {topTracks.length > 0 && (
              <div className="space-y-3">
                <div className="px-6 md:px-12 flex flex-col sm:flex-row sm:items-center justify-between gap-1 select-none">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl animate-pulse">trophy</span>
                    <span className="text-sm font-black uppercase tracking-wider text-on-surface">Top 10 Hity</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant/80">Najlepiej oceniane przez społeczność</span>
                </div>
                
                <div className="flex overflow-hidden mask-image-fade select-none">
                  <div className="animate-marquee flex gap-4 pr-4">
                    {topTracks.map((t, idx) => (
                      <TrackCard
                        key={`row1-${t.id}-${idx}`}
                        track={t}
                        isPlaying={isPlaying}
                        isActive={activeTrack?.id === t.id}
                        onPlay={() => handlePlay(t)}
                      />
                    ))}
                    {/* Duplicate for seamless loop */}
                    {topTracks.map((t, idx) => (
                      <TrackCard
                        key={`row1-dup-${t.id}-${idx}`}
                        track={t}
                        isPlaying={isPlaying}
                        isActive={activeTrack?.id === t.id}
                        onPlay={() => handlePlay(t)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Row 2 (Recently Created Hits) */}
            {recentTracks.length > 0 && (
              <div className="space-y-3">
                <div className="px-6 md:px-12 flex flex-col sm:flex-row sm:items-center justify-between gap-1 select-none">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-xl animate-bounce">local_fire_department</span>
                    <span className="text-sm font-black uppercase tracking-wider text-on-surface">Ostatnio stworzone</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant/80">Hity prosto z pieca AI</span>
                </div>
                
                <div className="flex overflow-hidden mask-image-fade select-none">
                  <div className="animate-marquee-reverse flex gap-4 pr-4">
                    {recentTracks.map((t, idx) => (
                      <TrackCard
                        key={`row2-${t.id}-${idx}`}
                        track={t}
                        isPlaying={isPlaying}
                        isActive={activeTrack?.id === t.id}
                        onPlay={() => handlePlay(t)}
                      />
                    ))}
                    {/* Duplicate for seamless loop */}
                    {recentTracks.map((t, idx) => (
                      <TrackCard
                        key={`row2-dup-${t.id}-${idx}`}
                        track={t}
                        isPlaying={isPlaying}
                        isActive={activeTrack?.id === t.id}
                        onPlay={() => handlePlay(t)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold headline-font">Jak to działa?</h2>
          <p className="text-on-surface-variant mt-2">Trzy proste kroki do własnego utworu</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: 'groups', title: 'Wybierz Wykonawcę', desc: 'Każdy ma swój unikalny styl, głos i vibe. Od rapu po disco polo.' },
            { icon: 'chat', title: 'Opisz swój pomysł', desc: 'Nasz wirtualny wykonawca pomoże Ci stworzyć idealny tekst, prowadząc Cię krok po kroku od początku do końca.' },
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
                  Zobacz ich wszystkich
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

      {/* FAQ Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Najczęściej zadawane pytania</span>
          <h2 className="text-3xl md:text-5xl font-extrabold headline-font mt-2 leading-tight">
            Mamy odpowiedź na każde pytanie o MojHit.pl
          </h2>
        </div>

        <div className="space-y-4">
          {welcomeFaqData.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`bg-surface-container-low/40 backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-primary/40 bg-surface-container-low/60 shadow-lg shadow-primary/5' : 'border-outline-variant/15 hover:border-primary/20'
                }`}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left transition-colors cursor-pointer select-none"
                >
                  <span className="font-bold text-sm md:text-base text-on-surface pr-4">{faq.question}</span>
                  <span className={`material-symbols-outlined text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[300px] opacity-100 border-t border-outline-variant/10' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 text-sm md:text-base text-on-surface-variant leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Hidden Audio Element for Track Showcase */}
      <audio ref={audioRef} onEnded={handleAudioEnded} />
    </div>
  );
}
