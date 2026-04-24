import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const faqData = [
  {
    question: "Jak stworzyć piosenkę za pomocą AI?",
    answer: "To proste! Na stronie głównej wpisz krótki opis tego, czego szukasz - na przykład «urodziny przyjaciół, radośni ludzie, tańczący» lub «pożegnanie, smutek, nostalgia». Wybierz одного z naszych AI Wykonawców (jak Melo MC czy Kosa) i kliknij «Generuj». W kilka sekund otrzymasz gotowy utwór!"
  },
  {
    question: "Ile kosztuje wygenerowanie piosenki?",
    answer: "Każda generacja kosztuje 1 Monetę. Gratisowo otrzymujesz 10 Monet każdego dnia za logowanie! Możesz też zdobywać Noty - za polubienia od innych użytkowników. 10 Not = 1 Moneta."
  },
  {
    question: "Czy mogę użyć wygenerowanej piosenki komercyjnie?",
    answer: "Tak! Wszystkie wygenerowane przez Ciebie utwory są Twoje. Możesz je używać na YouTube, TikToku, Instagramie, w podcastach i wszędzie gdzie chcesz - również komercyjnie. Nie wymagamy attribution (oznaczenia nas)."
  },
  {
    question: "Jak działają monety i noty?",
    answer: "Monety to płatna waluta - kupujesz je lub otrzymujешь w prezencie. Jedna Moneta = jedna generacja (2 warianty utworu). Noty są darmowe - zdobywasz je codziennym logowaniem (10/dzień), losując podczas generowania, lub za polubienia swoich utworów przez innych. 10 Not zamieniasz w 1 Monetę."
  },
  {
    question: "Czy muszę się kontowаć, żeby używać generatora?",
    answer: "Nie! Możesz generować muzykę bez logowania jako Gość. Jednak aby zachować swoje utwory i zarobiаć Noty za polubienia, musisz założyć konto (bezpłatnie przez Google lub Email)."
  },
  {
    question: "Dlaczego odtwarzanie przerywa się po 40 sekundach?",
    answer: "To zachęta do założenia konta i zakupu pełnej wersji. Goście słyszą pierwsze 40 sekund każdego utworu. Po zalogowaniu możesz słuchać bez limitów lub wykupić dostęp do pełnych mp3."
  },
  {
    question: "Czym jest Giełda Talentów?",
    answer: "Giełda Talentów to nasz sklep z ekskluzywnymi AI Wykonawcami. Każdy z nich ma unikalny styl - od Hip-Hoppo po Disco Polo. Kupujesz ich za Monety i masz dostęp do ich unikalnych brzmień."
  },
  {
    question: "Czy mogę ściągnąć piosenkę jako plik MP3?",
    answer: "Tak! Kliknij ikonę pobierania pod dowolnym utworem, aby ściągnąć plik audio. Wybierając «kup pełną wersję» otrzymasz pełne MP3 bez limitu czasowego."
  }
];

export function FaqPomoc() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Helmet>
        <title>FAQ & Pomoc - Najczęściej Zadawane Pytania | mojhit.pl</title>
        <meta name="description" content="Masz pytania? Odpowiadamy na wszystko! Jak stworzyć piosenkę AI? Ile kosztuje generacja? Jak działają monety i noty? Sprawdź FAQ." />
        <meta name="keywords" content="FAQ, pomoc, pytania, generator muzyki AI, jak stworzyć piosenkę, monety, noty, Giełda Talentów, kurs" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="FAQ & Pomoc - mojhit.pl" />
        <meta property="og:description" content="Najczęściej zadawane pytania o generatorze muzyki AI" />
        <meta property="og:url" content="/faq-pomoc" />
        <meta property="og:type" content="website" />
        
        {/* Canonical */}
        <link rel="canonical" href="/faq-pomoc" />
        
        {/* FAQ Schema for Google Rich Results */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </script>
      </Helmet>

      <div className="max-w-3xl mx-auto py-6 space-y-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold headline-font tracking-tight mb-3">❓ FAQ & Pomoc</h1>
          <p className="text-on-surface-variant font-body text-lg">Odpowiedzi na najczęściej zadawane pytania o generatorze muzyki AI</p>
        </div>

        <div className="space-y-3">
          {faqData.map((faq, index) => (
            <div 
              key={index}
              className="bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-surface-bright transition-colors"
              >
                <span className="font-bold text-on-surface pr-4">{faq.question}</span>
                <span className={`material-symbols-outlined text-primary transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 pt-0 text-on-surface-variant leading-relaxed border-t border-outline-variant/10">
                  <p className="pt-4">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center pt-8 pb-12">
          <p className="text-on-surface-variant mb-4">Nie znalazłeś odpowiedzi?</p>
          <Link to="/kontakt" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-dark transition-colors">
            <span className="material-symbols-outlined">mail</span>
            Napisz do nas
          </Link>
        </div>
      </div>
    </>
  );
}
