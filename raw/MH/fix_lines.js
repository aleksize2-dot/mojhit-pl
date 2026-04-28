const fs = require('fs');
let lines = fs.readFileSync('client/src/components/Generator.tsx', 'utf8').split('\n');

lines[454] = "          setMessages(prev => [...prev, { role: 'assistant', content: 'Wygenerowałem alternatywną wersję tekstu. Sprawdź poniżej!' }]);";
lines[462] = "      alert('Błąd podczas regeneracji promptu.');";
lines[488] = "      alert('Musisz najpierw wygenerować prompt!');";
lines[493] = "      alert('Jako gość możesz wygenerować tylko 1 piosenkę. Załóż darmowe konto, aby odebrać 20 darmowych not!');";
lines[503] = "      alert('Moduł płatności elektronicznych (BLIK / Przelewy24) w przygotowaniu! Tymczasem użyj monet lub not.');";
lines[538] = "        throw new Error(sunoData.error || 'Błąd API Kie.ai');";
lines[540] = "      if (!sunoData.taskId) throw new Error('Nie otrzymano ID zadania');";
lines[565] = "        if (!statusRes.ok) throw new Error(statusData.error || 'Błąd statusu zadania');";
lines[571] = "          throw new Error('Błąd serwera generującego (kie.ai)');";
lines[577] = "        throw new Error('Przekroczono limit czasu oczekiwania na utwór (~12 min)');";
lines[591] = "        throw new Error(data.error || 'Wystąpił nieznany błąd serwera');";
lines[594] = "      alert('Utwory zostały wygenerowane! Znajdziesz je w panelu Moje Utwory. Dwa warianty (V1 i V2) są gotowe do odsłuchu.');";
lines[605] = "      setMessages([{ role: 'assistant', content: `Gotowe! Twoje utwory (V1 i V2) są już w panelu **Moje Utwory**. ${activeProducer.initMsg}` }]);";
lines[607] = "      alert(`Błąd: ${err.message}`);";
lines[953] = "                         <span className=\"text-[10px] uppercase font-bold text-on-surface-variant font-label text-center tracking-widest\">Wybierz Metodę Płatności</span>";
lines[984] = "                               placeholder=\"Podaj swój e-mail...\"";
lines[987] = "                             <p className=\"text-[10px] text-on-surface-variant mt-1 ml-1\">E-mail jest wymagany, abyśmy wiedzieli do kogo należy utwór, jeśli się zarejestrujesz.</p>";
lines[1008] = "                               <span>Wygeneruj za {currencyType === 'fiat' ? 'PLN (Wkrótce)' : currencyType === 'coins' ? '1 monetę' : '10 not'}</span>";
lines[1046] = "                        title={attachedFile ? `Załączono: ${attachedFile.name}` : 'Załącz plik / inspirację'}";
lines[1140] = "        Polityka plików: Utwory wygenerowane wygasają po 14 dniach. Pobierz mp3, jeśli chcesz je zachować.";
lines[1151] = "              Jako gość możesz wygenerować tylko jeden darmowy utwór. Załóż konto, aby otrzymać <b>20 darmowych not</b> na start i tworzyć dalej!";
lines[1156] = "                  Załóż darmowe konto";
lines[1161] = "                  Mam już konto (Zaloguj)";

fs.writeFileSync('client/src/components/Generator.tsx', lines.join('\n'), 'utf8');
console.log('File patched via lines.');
