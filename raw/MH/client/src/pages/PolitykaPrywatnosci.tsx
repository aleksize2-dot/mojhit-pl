import { Link } from 'react-router-dom';

export function PolitykaPrywatnosci() {
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
               <h1 className="text-3xl md:text-5xl font-extrabold headline-font text-on-surface tracking-tight">Polityka Prywatności</h1>
               <p className="text-primary font-bold text-sm tracking-widest uppercase mt-2">Zasady Ochrony Prywatności Serwisu</p>
            </div>
        </div>

        <div className="font-body text-on-surface-variant leading-relaxed space-y-8">
           
           <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
              <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">info</span> 
                 1. Informacje ogólne
              </h2>
              <ol className="list-decimal pl-6 space-y-4 marker:text-primary marker:font-bold">
                <li>Niniejsza polityka dotyczy Serwisu www, funkcjonującego pod adresem url: <b className="text-on-surface">mojhit.pl</b></li>
                <li>Operatorem serwisu oraz Administratorem danych osobowych jest: <span className="text-on-surface font-semibold">DONNER SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</span> ul. TURKUSOWA 33/25, 70-778 SZCZECIN NIP: 8513177877, REGON: 321560124 , KRS: 0000520328</li>
                <li>Adres kontaktowy poczty elektronicznej operatora: <a href="mailto:admin@mojhit.pl" className="text-primary hover:underline">admin@mojhit.pl</a></li>
                <li>Operator jest Administratorem Twoich danych osobowych w odniesieniu do danych podanych dobrowolnie w Serwisie.</li>
                <li>Serwis wykorzystuje dane osobowe w następujących celach:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-on-surface-variant/90 marker:text-on-surface-variant/50">
                    <li>Prowadzenie rozmów typu chat online w celu generowania spersonalizowanych utworów muzycznych za pomocą AI</li>
                    <li>Analiza statystyczna ruchu (Google Analytics 4)</li>
                    <li>Analiza zachowań użytkowników (Microsoft Clarity)</li>
                    <li>Obsługa konta użytkownika (Clerk)</li>
                  </ul>
                </li>
                <li>Serwis realizuje funkcje pozyskiwania informacji o użytkownikach i ich zachowaniu w następujący sposób:
                  <ol className="list-[lower-alpha] pl-6 mt-2 space-y-1 text-on-surface-variant/90 marker:text-on-surface-variant/50">
                    <li>Poprzez dobrowolnie wprowadzone w formularzach dane, które zostają wprowadzone do systemów Operatora.</li>
                    <li>Poprzez zapisywanie w urządzeniach końcowych plików cookie (tzw. „ciasteczka").</li>
                  </ol>
                </li>
              </ol>
           </section>

           <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
              <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">security</span> 
                 2. Wybrane metody ochrony danych
              </h2>
              <ol className="list-decimal pl-6 space-y-4 marker:text-primary marker:font-bold">
                <li>Miejsca logowania i wprowadzania danych osobowych są chronione w warstwie transmisji (certyfikat SSL). Dzięki temu dane osobowe i dane logowania, wprowadzone na stronie, zostają zaszyfrowane w komputerze użytkownika i mogą być odczytane jedynie na docelowym serwerze.</li>
                <li>Dane osobowe przechowywane w bazie danych są zaszyfrowane w taki sposób, że jedynie posiadający Operator klucz może je odczytać. Dzięki temu dane są chronione na wypadek wykradzenia bazy danych z serwera.</li>
                <li>Istotnym elementem ochrony danych jest regularna aktualizacja wszelkiego oprogramowania, wykorzystywanego przez Operatora do przetwarzania danych osobowych, co w szczególności oznacza regularne aktualizacje komponentów programistycznych.</li>
              </ol>
           </section>

           <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
              <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">dns</span> 
                 3. Hosting
              </h2>
              <ol className="list-decimal pl-6 space-y-4 marker:text-primary marker:font-bold">
                <li>Serwis jest hostowany (technicznie utrzymywany) na serwerze operatora: az.pl</li>
                <li>Firma hostingowa w celu zapewnienia niezawodności technicznej prowadzi logi na poziomie serwera. Zapisowi mogą podlegać:
                  <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5 mt-3">
                      <ul className="list-disc pl-5 space-y-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 text-on-surface-variant/90 marker:text-primary/50 text-sm">
                        <li>zasoby określone identyfikatorem URL (adresy żądanych zasobów – stron, plików),</li>
                        <li>czas nadejścia zapytania oraz czas wysłania odpowiedzi,</li>
                        <li>nazwa stacji klienta – identyfikacja realizowana przez protokół HTTP,</li>
                        <li>informacje o błędach jakie nastąpiły przy realizacji transakcji HTTP,</li>
                        <li>adres URL strony poprzednio odwiedzanej przez użytkownika (referer link),</li>
                        <li>informacje o przeglądarce użytkownika oraz adresie IP,</li>
                        <li>informacje diagnostyczne związane z oprogramowaniem i zamawianiem usług,</li>
                        <li>informacje związane z obsługą poczty elektronicznej.</li>
                      </ul>
                  </div>
                </li>
              </ol>
           </section>

           <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
              <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">gavel</span> 
                 4. Twoje prawa dot. danych
              </h2>
              <ol className="list-decimal pl-6 space-y-4 marker:text-primary marker:font-bold">
                <li>W niektórych sytuacjach Administrator ma prawo przekazywać Twoje dane osobowe innym odbiorcom, jeśli będzie to niezbędne do wykonania umowy. Odbiorcy:
                  <ul className="list-disc pl-6 mt-2 text-on-surface-variant/90 marker:text-on-surface-variant/50">
                    <li className="font-semibold text-on-surface">operatorzy płatności</li>
                  </ul>
                </li>
                <li>Twoje dane osobowe przetwarzane przez Administratora nie dłużej, niż jest to konieczne do wykonania związanych z nimi czynności określonych osobnymi przepisami (np. rachunkowość). Dane marketingowe przetwarzane są max. przez 3 lata.</li>
                <li>Przysługuje Ci prawo żądania od Administratora:
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-on-surface-variant/90 marker:text-on-surface-variant/50">
                    <li>dostępu do danych osobowych Ciebie dotyczących,</li>
                    <li>ich sprostowania, usunięcia lub ograniczenia przetwarzania,</li>
                    <li>przenoszenia danych.</li>
                  </ul>
                </li>
                <li>Przysługuje Ci prawo do złożenia sprzeciwu wobec przetwarzania danych w celu marketingu lub profilowania.</li>
                <li>Przysługuje Ci skarga do Prezesa Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa.</li>
                <li>Podanie danych osobowych jest dobrowolne, lecz niezbędne do obsługi Serwisu.</li>
                <li>W stosunku do Ciebie mogą być podejmowane zautomatyzowane decyzje i profilowanie w celu optymalizacji usług.</li>
                <li>Dane osobowe są przekazywane do państw trzecich poza teren Unii Europejskiej z zachowaniem najwyższych standardów.</li>
              </ol>
           </section>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm h-full">
                  <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                     <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">contact_mail</span> 
                     5. Formularze
                  </h2>
                  <ol className="list-decimal pl-6 space-y-3 marker:text-primary marker:font-bold">
                    <li>Serwis zbiera informacje podane dobrowolnie przez użytkownika (w tym dane osobowe).</li>
                    <li>Serwis może zapisać informacje o parametrach połączenia (oznaczenie czasu, adres IP).</li>
                    <li>Serwis może powiązać dane w formularzu ze skonfigurowanym kontem e-mail.</li>
                    <li>Dane podane w formularzu są przetwarzane wyłącznie w celu jego funkcjonowania.</li>
                  </ol>
               </section>

               <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm h-full">
                  <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                     <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">manage_search</span> 
                     6. Logi Administracyjne
                  </h2>
                  <ol className="list-decimal pl-6 space-y-3 marker:text-primary marker:font-bold">
                    <li>Logi serwera służą wyłącznie do administrowania Serwisem i zapewnienia jego prawidłowego funkcjonowania.</li>
                    <li>Logi nie są kojarzone z konkretnymi użytkownikami i nie są wykorzystywane w celach marketingowych.</li>
                    <li>Logi są przechowywane przez okres nie dłuższy niż 90 dni, po czym są automatycznie usuwane.</li>
                  </ol>
               </section>

               <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                       <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">campaign</span> 
                       7. Marketing i Narzędzia Analityczne
                    </h2>
                    
                    <div className="overflow-x-auto mb-6 border border-outline-variant/10 rounded-xl">
                      <table className="w-full text-left text-sm text-on-surface-variant font-body">
                        <thead className="bg-surface-container-high text-on-surface font-bold">
                          <tr>
                            <th className="p-3 border-b border-outline-variant/10">Narzędzie</th>
                            <th className="p-3 border-b border-outline-variant/10">Cookies</th>
                            <th className="p-3 border-b border-outline-variant/10">Okres przechowywania</th>
                            <th className="p-3 border-b border-outline-variant/10">Opt-out</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          <tr className="hover:bg-surface-container-high/50 transition-colors">
                            <td className="p-3 font-semibold text-on-surface">Google Analytics 4</td>
                            <td className="p-3 font-mono text-xs">_ga, _ga_*, _gid</td>
                            <td className="p-3">26 miesięcy</td>
                            <td className="p-3"><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer" className="text-primary hover:underline">GA Opt-out</a></td>
                          </tr>
                          <tr className="hover:bg-surface-container-high/50 transition-colors">
                            <td className="p-3 font-semibold text-on-surface">Microsoft Clarity</td>
                            <td className="p-3 font-mono text-xs">_clck, _clsk</td>
                            <td className="p-3">13 miesięcy</td>
                            <td className="p-3"><a href="https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-settings#manage-consent-and-opt-out" target="_blank" rel="noreferrer" className="text-primary hover:underline">Clarity Opt-Out</a></td>
                          </tr>
                          <tr className="hover:bg-surface-container-high/50 transition-colors">
                            <td className="p-3 font-semibold text-on-surface">Meta Pixel</td>
                            <td className="p-3 text-xs italic">Ciasteczka Facebook</td>
                            <td className="p-3">—</td>
                            <td className="p-3"><a href="https://www.facebook.com/ads/preferences/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Ad Preferences</a></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h3 className="font-bold text-on-surface mb-3">Zgodność z RODO i Ochrona Danych:</h3>
                    <ul className="list-disc pl-6 space-y-2 marker:text-primary mb-6">
                      <li><strong className="text-on-surface">Anonimizacja IP:</strong> Adres IP użytkownika jest w pełni anonimizowany przed zapisaniem (obcięcie ostatniego oktetu w GA4).</li>
                      <li><strong className="text-on-surface">Ochrona analizy zachowań:</strong> Microsoft Clarity nie rejestruje aktywności w polach formularzy, nie przechwytuje wpisywanych haseł ani danych płatniczych.</li>
                      <li><strong className="text-on-surface">Podstawa prawna:</strong> Dane analityczne i marketingowe przetwarzane są na mocy uprzedniej, dobrowolnej zgody użytkownika (art. 6 ust. 1 lit. a RODO).</li>
                      <li><strong className="text-on-surface">Cofnięcie zgody:</strong> Masz pełne prawo wycofać zgodę za pomocą menu "Zarządzanie zgodami" (link u dołu każdej strony) lub używając zewnętrznych wtyczek Opt-out.</li>
                      <li><strong className="text-on-surface">Transfer poza EOG:</strong> Przekazywanie danych do podmiotów zewnętrznych operujących w USA (m.in. Google, Microsoft, Meta) odbywa się na bazie tzw. Standardowych Klauzul Umownych (Standard Contractual Clauses - SCC).</li>
                    </ul>
                  </div>
               </section>
           </div>

           <section className="bg-gradient-to-br from-surface-container-low to-surface-container-lowest p-6 md:p-8 rounded-3xl border border-primary/20 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                 <span className="material-symbols-outlined text-9xl">cookie</span>
              </div>
              <h2 className="text-2xl font-bold headline-font text-on-surface mb-6 flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">cookie</span> 
                 Zarządzanie Plikami Cookies
              </h2>
              <div className="space-y-4">
                 <p className="font-semibold text-on-surface">Serwis korzysta z plików cookies (ciasteczek).</p>
                 <p>Nasze techniki oznaczają zapisywanie krótkich informacji tekstowych przez przeglądarkę, w celach utrzymania spójności sesji i poprawnego działania logowania. Stosujemy cookies sesyjne (zanikające po wyjściu) oraz stałe.</p>
                 
                 <p className="pt-2 font-bold text-on-surface text-sm uppercase tracking-widest">Zarządzanie Ciasteczkami w Przeglądarkach:</p>
                 <div className="flex flex-wrap gap-3 mt-2">
                    <a href="https://support.microsoft.com/pl-pl/help/10607/microsoft-edge-view-delete-browser-history" target="_blank" rel="noreferrer" className="px-4 py-2 bg-surface-container-high rounded-xl text-sm font-bold text-primary hover:bg-primary/20 transition-colors">Edge</a>
                    <a href="http://support.google.com/chrome/bin/answer.py?hl=pl&answer=95647" target="_blank" rel="noreferrer" className="px-4 py-2 bg-surface-container-high rounded-xl text-sm font-bold text-primary hover:bg-primary/20 transition-colors">Chrome</a>
                    <a href="http://support.apple.com/kb/PH5042" target="_blank" rel="noreferrer" className="px-4 py-2 bg-surface-container-high rounded-xl text-sm font-bold text-primary hover:bg-primary/20 transition-colors">Safari</a>
                    <a href="http://support.mozilla.org/pl/kb/W%C5%82%C4%85czanie%20i%20wy%C5%82%C4%85czanie%20obs%C5%82ugi%20ciasteczek" target="_blank" rel="noreferrer" className="px-4 py-2 bg-surface-container-high rounded-xl text-sm font-bold text-primary hover:bg-primary/20 transition-colors">Firefox</a>
                 </div>
                 
                 <p className="text-xs text-on-surface-variant/70 italic mt-4">Pamiętaj, że zablokowanie plików cookies może uniemożliwić korzystanie ze stron wymagających autoryzacji!</p>
              </div>
           </section>

           <div className="p-5 bg-tertiary/10 border border-tertiary/20 rounded-2xl flex items-start gap-4">
              <span className="material-symbols-outlined text-tertiary text-3xl">info</span>
              <div>
                 <p className="text-xs text-tertiary font-medium leading-relaxed text-justify">
                    Ostatnia aktualizacja: <b>16 kwietnia 2026 r.</b> — zaktualizowano o sekcje Google Analytics 4 i Microsoft Clarity zgodnie z wymogami RODO.
                 </p>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
