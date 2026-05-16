import { Helmet } from 'react-helmet-async';

interface SEOMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  schema?: Record<string, any>;
  keywords?: string;
}

export function SEO({ title, description, canonical, ogImage, ogType = 'website', noIndex = false, schema, keywords }: SEOMeta) {
  const fullTitle = title.includes('mojhit.pl') ? title : `${title} | mojhit.pl`;
  const siteUrl = 'https://mojhit.pl';

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      {canonical && <link rel="canonical" href={canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical ? (canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`) : siteUrl} />
      {ogImage && <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />}
      <meta property="og:site_name" content="mojhit.pl" />
      <meta property="og:locale" content="pl_PL" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />}

      {/* Schema JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

// --- Pre-built schemas for mojhit.pl pages ---

export const schemas = {
  /** Homepage / WebApplication */
  home: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "mojhit.pl",
    "alternateName": "Generator Muzyki AI",
    "url": "https://mojhit.pl",
    "description": "Polski generator muzyki AI. Twórz personalizowane piosenki na każdą okazję w 3 minuty.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web",
    "inLanguage": "pl-PL",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "PLN" }
  },

  /** Pricing page */
  cennik: {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "mojhit.pl — Plany subskrypcji",
    "description": "Twórz muzykę AI z polskimi producentami. Plany od darmowego (Free) po VIP i Legend. Monety, nuty, personalizowane piosenki.",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "PLN",
      "lowPrice": "0",
      "highPrice": "99",
      "offerCount": "4"
    }
  },

  /** FAQ page */
  faq: (questions: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  }),

  /** How-to: Jak zdobyć monety */
  howToGetCoins: {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Jak zdobyć monety na mojhit.pl",
    "description": "Dowiedz się jak zdobywać darmowe monety do tworzenia muzyki AI na mojhit.pl",
    "step": [
      { "@type": "HowToStep", "name": "Zarejestruj się", "text": "Załóż darmowe konto na mojhit.pl" },
      { "@type": "HowToStep", "name": "Generuj codziennie", "text": "Odbieraj darmowe monety codziennie" },
      { "@type": "HowToStep", "name": "Polecaj znajomym", "text": "Zaproś znajomych i zdobywaj dodatkowe monety za każde polecenie" },
      { "@type": "HowToStep", "name": "Bierz udział w konkursach", "text": "Wygrywaj monety i nagrody w konkursach" }
    ]
  },

  /** Producers page */
  producers: {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Producenci AI mojhit.pl",
    "description": "Poznaj polskich producentów AI — Kosa, CJ Remi, MELO MC, VENA, La Luz i inni. Każdy z unikalnym stylem muzycznym.",
    "numberOfItems": 9,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Kosa" },
      { "@type": "ListItem", "position": 2, "name": "CJ Remi" },
      { "@type": "ListItem", "position": 3, "name": "MELO MC" }
    ]
  }
};
