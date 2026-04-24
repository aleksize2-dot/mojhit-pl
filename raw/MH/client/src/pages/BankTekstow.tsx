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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <Helmet>
        <title>Bank Tekstów - Gotowe teksty na Twoje piosenki | mojhit.pl</title>
        <meta name="description" content="Brakuje Ci weny? Wybierz gotowy tekst z naszej bazy (Urodziny, Impreza, Rap, Miłość) i stwórz hit w 20 sekund dzięki AI!" />
      </Helmet>

      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-tertiary/10 text-tertiary mb-2">
          <span className="material-symbols-outlined text-4xl">lyrics</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black headline-font tracking-tight">Bank <span className="text-tertiary">Tekstów</span></h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
          Nie wiesz o czym ma być piosenka? Wybierz gotowy tekst i stwórz z niego hit w jedno kliknięcie!
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-tertiary">cycle</span>
        </div>
      ) : error ? (
        <div className="text-center text-error p-8 bg-error/10 rounded-2xl border border-error/20">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lyrics.map((lyric) => (
            <Link 
              key={lyric.id} 
              to={`/teksty/${lyric.slug}`}
              className="group bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 hover:border-tertiary/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold uppercase tracking-wider text-on-surface-variant group-hover:text-tertiary transition-colors">
                  {lyric.category}
                </span>
                {lyric.is_premium && (
                  <span className="material-symbols-outlined text-warning" title="Premium">star</span>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-tertiary transition-colors">{lyric.title}</h3>
              
              <div className="mt-auto pt-4 flex items-center justify-between text-sm text-on-surface-variant">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>{lyric.uses_count} użyć</span>
                </div>
                <div className="font-bold text-tertiary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                  Zobacz <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
