import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const instructionSteps = [
  {
    step: 1,
    title: "Wymyśl koncept",
    description: "Pomyśl o okazji lub nastroju. Może to urodziny przyjaciół, pożegnanie kogoś z pracy, randka, impreza? Wyobraź sobie jakie emocje ma wywoływać ta muzyka."
  },
  {
    step: 2,
    title: "Opisz swoją wizję",
    description: "W polu tekstowym wpisz krótki opis - 2-3 zdania. Np: «Radośnie, energetycznie, ludzie tańczą na imprezie, pozytywne viby, latyno». Im więcej szczegółów, tym lepszy efekt!"
  },
  {
    step: 3,
    title: "Wybierz AI Wykonawcę",
    description: "Spośród naszych Giełdzie Talentów wybierz pasujący styl. Melo MC to polski rap, Kosa to trap, a Gielda ma specjalistów od wszystkiego."
  },
  {
    step: 4,
    title: "Generuj i słuchaj",
    description: "Kliknij «Generuj» i poczekaj kilka sekund. Otrzymasz 2 warianty tego samego utworu - wybierz ten który bardziej pasuje do Twojej wizji."
  },
  {
    step: 5,
    title: "Pobierz i udostępniaj",
    description: "Kliknij ikonkę pobierania aby ściągnąć MP3. Udostępnij w social media - link prowadzi prosto do odtwarzacza na mojhit.pl!"
  }
];

export function InstrukcjaFaq() {
  return (
    <>
      <Helmet>
        <title>Jak Wygenerować Piosenkę - Instrukcja Krok Po Kroku | mojhit.pl</title>
        <meta name="description" content="Naucz się tworzyć muzykę AI w 5 prostych krokach! Jak wymyślić koncept, opisać wizję, wybrać wykonawcę i wygenerować własny hit. Kompletny poradnik." />
        <meta name="keywords" content="instrukcja, jak wygenerować piosenkę, poradnik, generator muzyki AI, jak używać, tutorial, krok po kroku" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Jak Wygenerować Piosenkę - Instrukcja" />
        <meta property="og:description" content="Twórz własną muzykę AI w 5 minut!" />
        <meta property="og:url" content="/instrukcja-faq" />
        <meta property="og:type" content="website" />
        
        {/* Canonical */}
        <link rel="canonical" href="/instrukcja-faq" />
        
        {/* How-to Schema for Google Rich Results */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "Jak wygenerować piosenkę AI",
            "description": "Naucz się tworzyć muzykę za pomocą sztucznej inteligencji w 5 prostych krokach",
            "url": "/instrukcja-faq",
            "step": instructionSteps.map(s => ({
              "@type": "HowToStep",
              "position": s.step,
              "name": s.title,
              "text": s.description
            })),
            "tool": {
              "@type": "Product",
              "name": "mojhit.pl - Generator Muzyki AI"
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-3xl mx-auto py-6 space-y-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold headline-font tracking-tight mb-3">📖 Instrukcja</h1>
          <p className="text-on-surface-variant font-body text-lg">Jak stworzyć własną muzykę AI w 5 minut</p>
        </div>

        <div className="space-y-4">
          {instructionSteps.map((item) => (
            <div 
              key={item.step}
              className="bg-surface-container rounded-2xl border border-outline-variant/20 p-6 flex gap-5"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                {item.step}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-on-surface-variant">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 mt-8">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lightbulb</span>
            Pro Tips
          </h3>
          <ul className="text-on-surface-variant space-y-2 list-disc list-inside">
            <li>Bądź konkretny w opisie - «smutnybreakup z latami 90» działa lepiej niż «smutna piosenka»</li>
            <li> Dodaj informacje o głosie - «żeński wokal», «rap męski», «chórek»</li>
            <li> Wspomnij konkretny gatunek - «disco polo», «rap trap», «pop romantyczny»</li>
          </ul>
        </div>

        <div className="text-center pt-8 pb-12">
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-tertiary text-on-primary font-black uppercase tracking-widest rounded-xl hover:shadow-xl hover:scale-105 transition-all">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
            Zacznij tworzyć
          </Link>
        </div>
      </div>
    </>
  );
}
