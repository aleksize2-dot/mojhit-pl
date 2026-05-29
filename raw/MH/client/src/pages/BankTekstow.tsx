import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface Lyric {
  id: string;
  slug: string;
  title: string;
  category: string;
  tags: string;
  is_premium: boolean;
  uses_count: number;
}

export function BankTekstow() {
  const [lyrics, setLyrics] = useState<Lyric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Wszystkie');

  useEffect(() => {
    fetch('/api/lyrics')
      .then((res) => {
        if (!res.ok) throw new Error('Błąd ładowania tekstów');
        return res.json();
      })
      .then((data) => {
        setLyrics(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Dynamically extract unique categories present in the lyrics
  const uniqueCategories = ['Wszystkie', ...new Set(lyrics.map(l => l.category))];

  // Filter lyrics based on active category selection
  const filteredLyrics = activeCategory === 'Wszystkie' 
    ? lyrics 
    : lyrics.filter(l => l.category === activeCategory);

  // Category Icon Mapper for visual premium polish
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'urodziny': return 'cake';
      case 'ślub':
      case 'ślub / rocznica': return 'favorite';
      case 'żart':
      case 'humor / żart': return 'mood';
      case 'impreza': return 'celebration';
      case 'miłość': return 'favorite';
      case 'do auta': return 'directions_car';
      case 'niespodzianka': return 'featured_seasonal_and_gifts';
      case 'przeprosiny': return 'sentiment_dissatisfied';
      case 'pocieszenie': return 'healing';
      default: return 'lyrics';
    }
  };

  // Category Color Palette Mapper
  const getCategoryStyles = (category: string) => {
    switch (category.toLowerCase()) {
      case 'urodziny': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'ślub':
      case 'ślub / rocznica': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'żart':
      case 'humor / żart': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'impreza': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'miłość': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'do auta': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-tertiary/10 text-tertiary border-tertiary/20';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <Helmet>
        <title>Bank Tekstów - Gotowe teksty AI na Twoje piosenki | mojhit.pl</title>
        <meta name="description" content="Brakuje Ci weny? Przeglądaj gotowe teksty stworzone przez społeczność AI (Urodziny, Ślub, Żarty, Imprezy) i stwórz z nich piosenkę w jedno kliknięcie!" />
      </Helmet>

      {/* Header section with modern glassmorphism gradient look */}
      <div className="text-center space-y-4 relative py-6">
        <div className="absolute inset-0 bg-gradient-to-r from-tertiary/5 to-transparent blur-3xl rounded-full pointer-events-none"></div>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-tertiary/10 text-tertiary mb-2 relative z-10 border border-tertiary/20 shadow-lg shadow-tertiary/5">
          <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>lyrics</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black headline-font tracking-tight relative z-10">
          Bank <span className="text-tertiary">Tekstów AI</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-base md:text-lg relative z-10">
          Wybierz gotowy hit wygenerowany przez naszą społeczność, dopasowany do idealnej okazji, i stwórz z niego piosenkę w 20 sekund!
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-tertiary/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-tertiary rounded-full animate-spin"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-error p-8 bg-error/10 rounded-2xl border border-error/20 max-w-md mx-auto">
          <span className="material-symbols-outlined text-4xl mb-2">warning</span>
          <p className="font-bold headline-font">{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Dynamic tabs filter bar with premium micro-interaction indicators */}
          {uniqueCategories.length > 1 && (
            <div className="flex flex-wrap gap-2.5 justify-center py-2 border-b border-outline-variant/10">
              {uniqueCategories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 border hover:scale-105 active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-tertiary text-white border-tertiary shadow-lg shadow-tertiary/25 scale-105'
                        : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border-outline-variant/10'
                    }`}
                  >
                    {category !== 'Wszystkie' && (
                      <span className="material-symbols-outlined text-[16px] md:text-[18px]">
                        {getCategoryIcon(category)}
                      </span>
                    )}
                    <span>{category}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Lyrics grid grid items */}
          {filteredLyrics.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-low rounded-3xl border border-outline-variant/10 space-y-3">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">sentiment_neutral</span>
              <h3 className="text-xl font-bold headline-font">Brak tekstów w tej kategorii</h3>
              <p className="text-on-surface-variant text-sm">Zostań pierwszym, który wygeneruje piosenkę na tę okazję!</p>
              <Link to="/" className="inline-block mt-3 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all">
                Stwórz piosenkę
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLyrics.map((lyric) => {
                const styles = getCategoryStyles(lyric.category);
                return (
                  <Link 
                    key={lyric.id} 
                    to={`/teksty/${lyric.slug}`}
                    className="group bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 hover:border-tertiary/40 hover:shadow-xl hover:shadow-tertiary/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                  >
                    {/* Glowing active category overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${styles}`}>
                        <span className="material-symbols-outlined text-[13px]">
                          {getCategoryIcon(lyric.category)}
                        </span>
                        {lyric.category}
                      </span>
                      {lyric.is_premium && (
                        <span className="px-2 py-0.5 bg-warning/15 text-warning border border-warning/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                          Hit
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-black mb-2 group-hover:text-tertiary transition-colors headline-font leading-snug relative z-10">
                      {lyric.title}
                    </h3>
                    
                    <p className="text-xs text-on-surface-variant/75 line-clamp-3 mb-6 relative z-10 leading-relaxed font-body">
                      Kliknij, aby zobaczyć cały tekst i wykorzystać go w generatorze.
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center justify-between text-xs text-on-surface-variant relative z-10 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1 opacity-80">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">music_note</span>
                        <span>{lyric.uses_count} odsłuchań</span>
                      </div>
                      <div className="text-tertiary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 font-black">
                        Zobacz <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
