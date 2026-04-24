import { Link } from 'react-router-dom';

export function Regulamin() {
  return (
    <div className="p-8 md:p-12 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 max-w-5xl mx-auto my-10 shadow-xl relative overflow-hidden">
      
      {/* Glow decorative element */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-10">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-surface-container-high rounded-full hover:bg-surface-bright transition-all text-on-surface hover:-translate-x-1">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div>
               <h1 className="text-3xl md:text-5xl font-extrabold headline-font text-on-surface tracking-tight">Regulamin Serwisu</h1>
               <p className="text-primary font-bold text-sm tracking-widest uppercase mt-2">Zasady Korzystania z mojhit.pl</p>
            </div>
        </div>

        <div className="font-body text-on-surface-variant leading-relaxed space-y-8">
           
           {/* Section 1 */}
           <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
              <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">gavel</span> 
                 § 1. Postanowienia ogólne
              </h2>
              <ol className="list-decimal pl-6 space-y-4 marker:text-primary marker:font-bold">
                <li>Serwis <b className="text-on-surface">mojhit.pl</b> (zwany dalej „Serwisem”) jest platformą umożliwiającą generowanie utworów muzycznych za pomocą sztucznej inteligencji (AI) poprzez interfejs rozmowy z wirtualnym kompozytorem <b className="text-on-surface">DJ Marek</b>.</li>
                <li>Operatorem Serwisu jest <b className="text-on-surface">DONNER SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</b> z siedzibą w Szczecinie (Polska).</li>
                <li>Kontakt z obsługą: e‑mail <a href="mailto:admin@mojhit.pl" className="text-primary hover:underline">admin@mojhit.pl</a>.</li>
                <li>Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu.</li>
              </ol>
           </section>

           {/* Section 2 */}
           <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
              <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">account_circle</span> 
                 § 2. Rejestracja i konto użytkownika
              </h2>
              <ol className="list-decimal pl-6 space-y-4 marker:text-primary marker:font-bold">
                <li>Do korzystania z pełnej funkcjonalności Serwisu wymagana jest rejestracja poprzez zintegrowany system Clerk (Google, Facebook, e‑mail).</li>
                <li>Użytkownik zobowiązuje się do podania prawdziwych danych oraz do zabezpieczenia swojego konta przed nieautoryzowanym dostępem.</li>
                <li>Serwis zastrzega sobie prawo do zablokowania lub usunięcia konta użytkownika w przypadku łamania postanowień Regulaminu.</li>
              </ol>
           </section>

           {/* Section 3 & 4 Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Section 3 */}
               <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm h-full">
                  <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                     <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">tune</span> 
                     § 3. Korzystanie z usługi
                  </h2>
                  <ol className="list-decimal pl-6 space-y-4 marker:text-primary marker:font-bold">
                    <li><strong className="text-on-surface">AI Kompozytor (DJ Marek)</strong> – prowadzi rozmowę z użytkownikiem w celu zebrania informacji i wygenerowania personalizowanego utworu muzycznego.</li>
                    <li>Wygenerowane utwory zapisywane są w bibliotece użytkownika (<strong className="text-on-surface">Moje utwory</strong>) i są dostępne przez <strong className="text-primary">14 dni</strong> od momentu generacji.</li>
                    <li><strong className="text-on-surface">Stochastyczna natura AI:</strong> Generowanie muzyki przy użyciu sztucznej inteligencji jest procesem probabilistycznym. Użytkownik akceptuje, że algorytmy mogą tworzyć utwory zawierające artefakty dźwiękowe, niewyraźny wokal lub nielogiczne przejścia muzyczne. Serwis nie gwarantuje, że wygenerowany utwór będzie w 100% odpowiadał oczekiwaniom pod względem artystycznym czy technicznym.</li>
                  </ol>
               </section>

               {/* Section 4 */}
               <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm h-full">
                  <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                     <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">copyright</span> 
                     § 4. Prawa autorskie i licencje
                  </h2>
                  <ol className="list-decimal pl-6 space-y-4 marker:text-primary marker:font-bold">
                    <li><strong className="text-on-surface">Twórczość AI:</strong> Utwory są generowane przez systemy zewnętrzne (m.in. Kie.ai / Suno AI). Serwis działa jako nakładka/pośrednik w komunikacji.</li>
                    <li><strong className="text-on-surface">Licencja MP3:</strong> użytkownik otrzymuje licencję osobistą, niewyłączną i <strong className="text-on-surface">niekomercyjną</strong> na wykorzystanie utworu w celach prywatnych (np. jako prezent, użytek domowy).</li>
                    <li><strong className="text-on-surface">Odpowiedzialność za tekst:</strong> Użytkownik jest twórcą promptu/lyricsu przekazanego DJ Markowi. Ochrona wizerunku, roszczeń do imion etc., w opisywanym tekście leży po stronie Użytkownika.</li>
                    <li><strong className="text-error">Ochrona praw artystów:</strong> Serwis nie zezwala na kopiowanie stylu ani znaków towarowych znanych artystów. AI odmówi plagiatu, proponując utwór jedynie "w podobnym klimacie".</li>
                  </ol>
               </section>
           </div>

           {/* Section 5 */}
           <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
              <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">payments</span> 
                 § 5. System walutowy i Płatności
              </h2>
              <ol className="list-decimal pl-6 space-y-4 marker:text-primary marker:font-bold">
                <li>W Serwisie obowiązują dwie wirtualne "waluty" za które Użytkownik generuje pojedyncze utwory:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-on-surface-variant/90 marker:text-on-surface-variant/50">
                    <li><strong className="text-on-surface">Monety</strong> (waluta premium, 1 moneta = 1 generacja). Ważne przez 12 miesięcy od daty zakupu.</li>
                    <li><strong className="text-on-surface">Noty</strong> (waluta bonusowa, 10 not = 1 generacja). Ważność ustala Serwis.</li>
                  </ul>
                </li>
                <li>Monety i noty są niezwrotne i nie podlegają wymianie na gotówkę. Należą ściśle do konta.</li>
                <li><strong className="text-error">Brak prawa odstąpienia od umowy:</strong> Rozpoczęcie procesu generowania utworu (kliknięcie przycisku generuj i pobranie waluty) oznacza pełne wykonanie usługi cyfrowej. Zgodnie z art. 38 pkt 13 ustawy o prawach konsumenta, Użytkownik wyraża zgodę na natychmiastowe rozpoczęcie świadczenia i traci prawo do odstąpienia od umowy. Subiektywne niezadowolenie z wygenerowanego utworu nie stanowi podstawy do reklamacji i zwrotu środków.</li>
                <li>W przyszłości planowane jest wprowadzenie płatności elektronicznych (BLIK, Karta, Przelewy24) zintegrowanych z walutami Serwisu.</li>
              </ol>
           </section>

           {/* Policy Highlights */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Section 6 (Highlighted) */}
               <section className="bg-gradient-to-br from-surface-container-low to-surface-container-lowest p-6 md:p-8 rounded-3xl border border-error/30 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none text-error">
                     <span className="material-symbols-outlined text-9xl">auto_delete</span>
                  </div>
                  <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                     <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-xl">delete_sweep</span> 
                     § 6. Polityka usunięć (14 Dni)
                  </h2>
                  <ol className="list-decimal pl-6 space-y-4 marker:text-error marker:font-bold relative z-10">
                    <li>Wygenerowane utwory są <strong className="text-on-surface">automatycznie i nieodwracalnie usuwane</strong> z pamięci Serwisu po 14 dniach od momentu utworzenia.</li>
                    <li>Użytkownik zobowiązany jest do pobrania pliku MP3 w ciągu tego okresu, by zachować utwór u siebie na stole.</li>
                    <li>Brak pobrania piosenki przed terminem skutkuje jej całkowitą stratą, co Użytkownik przyjmuje do wiadomości akceptując niniejszy dokument.</li>
                  </ol>
               </section>

               {/* Section 7 */}
               <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm h-full">
                  <h2 className="text-xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                     <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">block</span> 
                     § 7. Ograniczenia i zakazy
                  </h2>
                  <p className="mb-3 font-semibold text-sm">W ramach korzystania z profilu, ZABRANIA SIĘ:</p>
                  <ol className="list-decimal pl-6 space-y-3 marker:text-primary marker:font-bold">
                    <li>Generowania utworów o treści obraźliwej, dyskryminującej, nawołującej do nienawiści, gloryfikujących przemoc, o charakterze politycznym lub propagandowym, oraz bezprawnie wykorzystujących wizerunek/imiona osób publicznych i polityków.</li>
                    <li>Stosowania luk systemowych ("prompts injections") i prób ominięcia filtrów wbudowanych w DJ Marka, prób wymuszenia deep-fakes.</li>
                    <li>Wykorzystywania Serwisu w celach monetyzacji np. sprzedaży bez uprzedniego kontaktu formą pisemną.</li>
                    <li>Jakiejkolwiek ingerencji technologicznej mającej na celu szkodliwe przeciążenie Serwisu (ataki, eksploitacje bugów, wysyłanie dziwnych payloadów w chatboxie).</li>
                  </ol>
               </section>
           </div>

           {/* Section 8 & 9 */}
           <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
              <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">policy</span> 
                 § 8. i § 9. Odpowiedzialność oraz Zmiany Umowy
              </h2>
              <div className="space-y-6">
                 <div>
                    <h3 className="font-bold text-on-surface mb-2">1. Co gwarantujemy a czego nie:</h3>
                    <p>Serwis nie ponosi odpowiedzialności prawnej za ewentualne naruszenie poszanowania cudzej twórczości przez wprowadzane pomysły przez użytkownika, ani zgubienie utworów na skutek pożegnania z naszym API po upływie 14 dni. My dbamy, by serwery stały dla Ciebie użyteczne całą dobę 24/7 (choć nie dajemy 100% gwarancji uptime ze względu na zależny od nas status usług firm hostingowych).</p>
                 </div>
                 
                 <div>
                    <h3 className="font-bold text-on-surface mb-2">2. Rozwiązanie / Modyfikacja warunków:</h3>
                    <p>Mamy prawo blokować bądź rozwiązywać umowę ze skutkiem natychmiastowym w przypadku namierzenia działań silnie podejrzanych naruszających RODO lub Regulamin. Zastrzegamy również prawo zmiany zapisów w tym Regulaminie, o czym stosowanie zaalarmujemy w sekcji profilu lub ogłoszeń.</p>
                 </div>
              </div>
           </section>

           {/* Section 10 */}
           <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                 <h2 className="text-xl font-bold headline-font text-on-surface mb-3 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">check_circle</span> 
                    § 10. Postanowienia końcowe
                 </h2>
                 <ul className="list-disc pl-6 space-y-2 text-on-surface-variant marker:text-primary">
                    <li>Regulamin wchodzi w życie z dniem <strong className="text-on-surface">16 kwietnia 2026 r.</strong></li>
                    <li>Sądem rozstrzygającym jakiekolwiek roszczenia jest lokalny Sąd przypisany do miasta szczecińskiego Operatora.</li>
                    <li>Odświeżenia dostępne zawsze pod: <strong>mojhit.pl/regulamin</strong>.</li>
                 </ul>
              </div>
           </section>

        </div>
      </div>
    </div>
  );
}
