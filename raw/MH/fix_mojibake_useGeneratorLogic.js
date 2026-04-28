const fs = require('fs');
let lines = fs.readFileSync('client/src/components/useGeneratorLogic.ts', 'utf8').split('\n');

lines[364] = "            'Plik jest za duży! Maksymalny rozmiar: 10MB'";
lines[431] = "      ? `[Załączono plik: ${attachedFile.name}]`";
lines[456] = "      if (!res.ok) throw new Error(data.error || 'Błąd API');";
lines[547] = "        'Błąd połączenia z serwerem.'";
lines[573] = "      if (!res.ok) throw new Error(data.error || 'Błąd API');";
lines[603] = "                'Wygenerowałem alternatywną wersję tekstu. Sprawdź poniżej!',";
lines[616] = "        'Błąd podczas regeneracji promptu.'";
lines[643] = "      alert('Musisz najpierw wygenerować prompt!');";
lines[649] = "        'Jako gość musisz podać adres e-mail, abyśmy wiedzieli komu przypisać utwór!'";
lines[661] = "        'Moduł płatności elektronicznych (BLIK / Przelewy24) w przygotowaniu! Tymczasem użyj monet lub not.'";
lines[703] = "          sunoData.error || 'Błąd API Kie.ai'";
lines[736] = "              'Błąd statusu zadania'";
lines[756] = "            'Błąd serwera generującego (kie.ai)'";
lines[767] = "          'Przekroczono limit czasu oczekiwania na utwór (~12 min)'";
lines[791] = "            'Wystąpił nieznany błąd serwera'";
lines[796] = "        'Utwory zostały wygenerowane! Znajdziesz je w panelu Moje Utwory. Dwa warianty (V1 i V2) są gotowe do odsłuchu.'";
lines[804] = "          content: `Gotowe! 🎶 Twoje utwory (V1 i V2) są już w panelu **Moje Utwory**. ${activeProducer.initMsg}`,";
lines[808] = "      alert(`Błąd: ${err.message}`);";

fs.writeFileSync('client/src/components/useGeneratorLogic.ts', lines.join('\n'));
console.log('Fixed mojibake in useGeneratorLogic.ts');
