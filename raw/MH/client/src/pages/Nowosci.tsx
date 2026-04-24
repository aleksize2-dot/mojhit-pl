import { Helmet } from 'react-helmet-async';

export function Nowosci() {
  return (
    <>
      <Helmet>
        <title>Nowe Hity AI - Najnowsza Muzyka Generowana przez AI | mojhit.pl</title>
        <meta name="description" content="Odkryj najnowsze utwory wygenerowane przez sztuczną inteligencję. Słuchaj świeżych hitów AI 2026 roku na mojhit.pl - darmowy generator muzyki!" />
        <meta name="keywords" content="nowe hity, nowa muzyka AI, najnowsze utwory, nowości muzyczne, generator muzyki AI, nowe piosenki 2026, świeże hity AI, mojhit" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Nowe Hity AI - Najnowsza Muzyka" />
        <meta property="og:description" content="Najnowsze utwory wygenerowane przez sztuczną inteligencję. Byś pierwswy odkryj nowe hity!" />
        <meta property="og:image" content="/og-nowosci.png" />
        <meta property="og:url" content="/nowosci" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* Canonical */}
        <link rel="canonical" href="/nowosci" />
        
        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Nowe Hity AI",
            "description": "Najnowsze utwory wygenerowane przez AI",
            "url": "/nowosci",
            "datePublished": new Date().toISOString(),
            "publisher": {
              "@type": "Organization",
              "name": "mojhit.pl"
            }
          })}
        </script>
      </Helmet>

      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold headline-font tracking-tight mb-2">✨ Fresh Drops</h1>
          <p className="text-on-surface-variant font-body">The newest AI-generated tracks just landed.</p>
        </div>
        {/* TODO: Add real new tracks listing */}
      </div>
    </>
  );
}
