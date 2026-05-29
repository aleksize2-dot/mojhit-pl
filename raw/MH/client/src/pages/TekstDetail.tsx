import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface LyricDetail {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  is_premium: boolean;
  uses_count: number;
}

export function TekstDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lyric, setLyric] = useState<LyricDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Added states for original and chosen producers
  const [originalProducer, setOriginalProducer] = useState<any | null>(null);
  const [producers, setProducers] = useState<any[]>([]);
  const [selectedProducer, setSelectedProducer] = useState<any | null>(null);
  const [showProducerSelect, setShowProducerSelect] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/lyrics/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Nie znaleziono tekstu');
        return res.json();
      })
      .then(async (lyricData) => {
        setLyric(lyricData);
        
        // 1. Fetch original track details using lyric slug (which matches original track.id)
        try {
          const trackRes = await fetch(`/api/tracks/${lyricData.slug}`);
          if (trackRes.ok) {
            const trackData = await trackRes.json();
            if (trackData && trackData.producers) {
              setOriginalProducer(trackData.producers);
              setSelectedProducer(trackData.producers);
            }
          }
        } catch (e) {
          console.warn('Failed to fetch original producer:', e);
        }

        // 2. Fetch all active producers
        try {
          const prodRes = await fetch('/api/producers');
          if (prodRes.ok) {
            const producersData = await prodRes.json();
            if (Array.isArray(producersData)) {
              setProducers(producersData);
            }
          }
        } catch (e) {
          console.warn('Failed to fetch producers list:', e);
        }

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  // Set default selected producer if not retrieved from the track
  useEffect(() => {
    if (!selectedProducer && producers.length > 0) {
      const djMarek = producers.find(p => p.id === 'dj-marek' || p.id === 'marek');
      setSelectedProducer(djMarek || producers[0]);
    }
  }, [producers, selectedProducer]);

  const handleUseText = () => {
    if (lyric && selectedProducer) {
      // Redirection to Home and passing text, tags, and title, plus selected agent in query param
      navigate(`/?agent=${selectedProducer.id}`, { 
        state: { 
          importedLyrics: lyric.content,
          importedTags: lyric.tags,
          importedTitle: lyric.title
        } 
      });
    }
  };

  if (loading) return <div className="flex justify-center items-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-tertiary">cycle</span></div>;
  if (error || !lyric) return <div className="text-center py-20 text-error"><p>{error || 'Błąd'}</p><Link to="/teksty" className="text-primary hover:underline mt-4 inline-block">Wróć do Banku Tekstów</Link></div>;

  // SEO: Enhanced meta data
  const siteUrl = window.location.origin;
  const seoUrl = `${siteUrl}/teksty/${lyric.slug}`;
  const seoTitle = `${lyric.title} - Tekst piosenki | mojhit.pl`;
  const seoDesc = lyric.content 
    ? lyric.content.substring(0, 160) + (lyric.content.length > 160 ? '... Wypróbuj w generatorze AI!' : '')
    : `Gotowy tekst piosenki "${lyric.title}" z kategorii ${lyric.category}. Stwórz swój własny hit z AI za darmo!`;
  const seoImage = '/og-default.png';
  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": lyric.title,
    "text": lyric.content,
    "genre": lyric.category,
    "keywords": lyric.tags,
    "inLanguage": "pl",
    "dateCreated": new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "mojhit.pl"
    },
    "usageInfo": `${siteUrl}/teksty/${lyric.slug}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.8,
      "ratingCount": lyric.uses_count || 1,
      "bestRating": 5,
      "worstRating": 1
    },
    "workExample": [{
      "@type": "CreativeWork",
      "name": lyric.title,
      "textSample": lyric.content.substring(0, 500)
    }]
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="keywords" content={`tekst piosenki, ${lyric.title}, ${lyric.category}, gotowy tekst, teksty do piosenek, AI, generator muzyki, mojhit`} />
        <meta name="author" content="mojhit.pl" />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:url" content={seoUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="mojhit.pl" />
        <meta property="article:section" content={lyric.category} />
        <meta property="article:tag" content={lyric.tags} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={seoImage} />
        
        {/* Canonical */}
        <link rel="canonical" href={seoUrl} />
        
        {/* Schema.org for Creative Work */}
        <script type="application/ld+json">
          {JSON.stringify(schemaJsonLd)}
        </script>
      </Helmet>

      <Link to="/teksty" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-tertiary transition-colors mb-8 font-bold text-sm">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Wróć do bazy
      </Link>

      <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden shadow-xl">
        <div className="p-8 md:p-12 border-b border-outline-variant/10 bg-gradient-to-br from-tertiary/10 to-transparent relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
             <span className="material-symbols-outlined text-9xl">lyrics</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
            <span className="px-4 py-1.5 bg-tertiary/20 text-tertiary rounded-full text-sm font-bold uppercase tracking-wider border border-tertiary/20">
              {lyric.category}
            </span>
            {lyric.is_premium && (
              <span className="px-4 py-1.5 bg-warning/20 text-warning rounded-full text-sm font-bold uppercase tracking-wider flex items-center gap-1 border border-warning/20">
                <span className="material-symbols-outlined text-[16px]">star</span> Premium
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black headline-font mb-4 relative z-10">{lyric.title}</h1>
          
          <div className="flex flex-wrap gap-2 relative z-10">
             {lyric.tags.split(',').map((tag, i) => (
               <span key={i} className="text-xs font-bold text-on-surface-variant/80 bg-surface-container px-2 py-1 rounded border border-outline-variant/10">#{tag.trim()}</span>
             ))}
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12">
          <div className="flex-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6 font-label">Treść utworu</h3>
            <div className="font-body text-lg text-on-surface leading-loose whitespace-pre-wrap">
              {lyric.content}
            </div>
          </div>

          <div className="w-full md:w-80 shrink-0 space-y-6">
            <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 shadow-2xl sticky top-24 space-y-6">
              <div>
                <h3 className="font-black text-xl mb-1 headline-font text-on-surface">Zrób z tego hit!</h3>
                <p className="text-xs text-on-surface-variant">Skonfiguruj wykonawcę i przenieś ten utwór do generatora AI.</p>
              </div>

              {/* Selected Producer Card */}
              {selectedProducer && (
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 relative group transition-all hover:border-tertiary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-tertiary/30 overflow-hidden shrink-0">
                      <img 
                        src={selectedProducer.img} 
                        alt={selectedProducer.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.currentTarget.src = '/avatars/default.png'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-on-surface text-base truncate block">{selectedProducer.name}</span>
                        {selectedProducer.tier === 'vip' && <span className="bg-primary/20 text-primary text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide border border-primary/20 uppercase shrink-0">VIP</span>}
                        {selectedProducer.tier === 'legend' && <span className="bg-warning/20 text-warning text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide border border-warning/20 uppercase shrink-0">LEGEND</span>}
                      </div>
                      <p className="text-[10px] font-bold text-tertiary uppercase tracking-wider truncate">{selectedProducer.badge}</p>
                    </div>
                  </div>

                  {originalProducer && originalProducer.id === selectedProducer.id && (
                    <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      <span>Oryginalny wykonawca (Zalecany)</span>
                    </div>
                  )}

                  <button 
                    onClick={() => setShowProducerSelect(!showProducerSelect)}
                    className="w-full mt-3 py-2 bg-surface-container-high hover:bg-surface-bright border border-outline-variant/10 text-on-surface font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">{showProducerSelect ? 'expand_less' : 'swap_horiz'}</span>
                    {showProducerSelect ? 'Zamknij listę' : 'Zmień wykonawcę'}
                  </button>
                </div>
              )}

              {/* Producer Dropdown/Selector Grid */}
              {showProducerSelect && producers.length > 0 && (
                <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-2 max-h-60 overflow-y-auto space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest px-2 py-1">Dostępni Wykonawcy</p>
                  {producers.map((p) => {
                    const isSelected = selectedProducer?.id === p.id;
                    const isOrig = originalProducer?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProducer(p);
                          setShowProducerSelect(false);
                        }}
                        className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all ${isSelected ? 'bg-tertiary/10 border border-tertiary/30' : 'hover:bg-surface-container-high border border-transparent'}`}
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-outline-variant/20">
                          <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-on-surface truncate block">{p.name}</span>
                            {p.tier === 'vip' && <span className="bg-primary/20 text-primary text-[7px] font-black px-1 rounded border border-primary/25 uppercase shrink-0">VIP</span>}
                            {p.tier === 'legend' && <span className="bg-warning/20 text-warning text-[7px] font-black px-1 rounded border border-warning/25 uppercase shrink-0">LEGEND</span>}
                          </div>
                          <span className="text-[9px] text-on-surface-variant truncate block">{p.badge}</span>
                        </div>
                        {isOrig && (
                          <span className="material-symbols-outlined text-[16px] text-emerald-500 shrink-0" title="Oryginalny wykonawca" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dynamic matching tip from DJ Marek */}
              {selectedProducer && (
                <div className="bg-tertiary/5 border border-tertiary/10 rounded-2xl p-4 flex gap-3 items-start">
                  <span className="material-symbols-outlined text-tertiary text-xl shrink-0 mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>info</span>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-tertiary">Podpowiedź DJ Marka:</h4>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      {originalProducer && originalProducer.id === selectedProducer.id ? (
                        `Mordo, ten tekst powstał specjalnie pod styl "${selectedProducer.badge}". Wybór idealny, zachowasz oryginalne tempo i rytm utworu! 🔥`
                      ) : (
                        `Przenosisz tekst do wykonawcy "${selectedProducer.name}". Stworzy on utwór w swoim flagowym klimacie: "${selectedProducer.badge}". Będzie ogień! ⚡`
                      )}
                    </p>
                  </div>
                </div>
              )}

              <button 
                onClick={handleUseText}
                disabled={!selectedProducer}
                className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-white transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-lg shadow-tertiary/30 cursor-pointer disabled:opacity-50"
                style={{ background: 'linear-gradient(45deg, #734bbd, #ff9064)' }}
              >
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>mic</span>
                Zrób z tego hit
              </button>
              
              <div className="pt-2 border-t border-outline-variant/10 flex justify-between text-[10px] text-on-surface-variant font-bold">
                <span>{lyric.uses_count} użyć</span>
                <span>Wersja zoptymalizowana</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
