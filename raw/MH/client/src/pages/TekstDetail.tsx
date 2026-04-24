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

  useEffect(() => {
    fetch(`/api/lyrics/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Nie znaleziono tekstu');
        return res.json();
      })
      .then((data) => {
        setLyric(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  const handleUseText = () => {
    if (lyric) {
      // Redirection to Home and passing text and tags in state
      navigate('/', { 
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
            <div className="bg-surface-container p-6 rounded-2xl border border-tertiary/20 shadow-lg sticky top-24">
              <h3 className="font-bold text-xl mb-2 headline-font">Gotowy na Hit?</h3>
              <p className="text-sm text-on-surface-variant mb-6">Przenieś ten tekst bezpośrednio do generatora i stwórz profesjonalną piosenkę w 20 sekund.</p>
              
              <button 
                onClick={handleUseText}
                className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-white transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-lg shadow-tertiary/30"
                style={{ background: 'linear-gradient(45deg, #734bbd, #ff9064)' }}
              >
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>mic</span>
                Zrób z tego hit
              </button>
              
              <div className="mt-4 pt-4 border-t border-outline-variant/10 flex justify-between text-xs text-on-surface-variant font-bold">
                <span>{lyric.uses_count} użyć</span>
                <span>Bezpłatny start</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
