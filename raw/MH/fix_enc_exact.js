const fs = require('fs');
const file = 'client/src/components/Generator.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  ['Cze! O czym robimy hit?', 'Cześć! O czym robimy hit?'],
  ['Twoja przegldarka nie obsuguje nagrywania audio.', 'Twoja przeglądarka nie obsługuje nagrywania audio.'],
  ['Plik jest za duy! Maksymalny rozmiar: 10MB', 'Plik jest za duży! Maksymalny rozmiar: 10MB'],
  ['Bd podczas regeneracji promptu.', 'Błąd podczas regeneracji promptu.'],
  ['Musisz najpierw wygenerowa prompt!', 'Musisz najpierw wygenerować prompt!'],
  ['Bd API Kie.ai', 'Błąd API Kie.ai'],
  ['Bd statusu zadania', 'Błąd statusu zadania'],
  ['Bd serwera generujcego (kie.ai)', 'Błąd serwera generującego (kie.ai)'],
  ['Przekroczono limit czasu oczekiwania na utwr (~12 min)', 'Przekroczono limit czasu oczekiwania na utwór (~12 min)'],
  ['Wystpi nieznany bd serwera', 'Wystąpił nieznany błąd serwera'],
  ['Utwory zostay wygenerowane! Znajdziesz je w panelu Moje Utwory. Dwa warianty (V1 i V2) s gotowe.', 'Utwory zostały wygenerowane! Znajdziesz je w panelu Moje Utwory. Dwa warianty (V1 i V2) są gotowe.'],
  ['Gotowe! Twoje utwory (V1 i V2) s ju w panelu Moje Utwory.', 'Gotowe! Twoje utwory (V1 i V2) są już w panelu Moje Utwory.'],
  ['Bd: ', 'Błąd: '],
  ['Kto dzi lepiej poczuje Twj klimat?', 'Kto dziś lepiej poczuje Twój klimat?'],
  ['Przejrzyj wygenerowany tekst i wybierz piosenkarza, ktry go nagra.', 'Przejrzyj wygenerowany tekst i wybierz piosenkarza, który go nagra.'],
  ['Opcjonalny tytu...', 'Opcjonalny tytuł...'],
  ['Wygeneruj za {currencyType === \'fiat\' ? \'PLN (Wkrtce)\'', 'Wygeneruj za {currencyType === \'fiat\' ? \'PLN (Wkrótce)\''],
  ['Podaj swj e-mail...', 'Podaj swój e-mail...'],
  ['E-mail jest wymagany, abymy wiedzieli do kogo naley utwr, jeli si zarejestrujesz.', 'E-mail jest wymagany, abyśmy wiedzieli do kogo należy utwór, jeśli się zarejestrujesz.'],
  ['Wybierz MetodÄ‚â€ž PÄ‚â€šĂ‚ÂłatnoÄ‚â€šĂ‚Âści', 'Wybierz Metodę Płatności'],
  ['tylko jeden darmowy utwÄ‚Ĺ‚r', 'tylko jeden darmowy utwór'],
  ['aby otrzymaÄ‚â€ž ', 'aby otrzymać '],
  ['tworzyÄ‚â€ž dalej', 'tworzyć dalej'],
  ['ZaÄ‚â€šĂ‚Âłączono', 'Załączono'],
  ['ZaÄ‚â€šĂ‚Âłącz plik / inspiracjÄ‚â€ž', 'Załącz plik / inspirację'],
  ['WyÄ‚â€šĂ‚Âłącz czytanie na gÄ‚â€šĂ‚Âłos', 'Wyłącz czytanie na głos'],
  ['WÄ‚â€šĂ‚Âłącz czytanie na gÄ‚â€šĂ‚Âłos', 'Włącz czytanie na głos'],
  ['GÄ‚â€šĂ‚Âłosowe odpowiedzi', 'Głosowe odpowiedzi'],
  ['Wygenerowaem alternatywn wersj', 'Wygenerowałem alternatywną wersję']
];

for (const [search, replace] of replacements) {
  content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
}

// Fix weird characters matching what was in the search output:
content = content.replace(/"\?''\?'\|"\?<\?'\?''" "\?'\?"\?\|'\?.*?/g, 'Twoja wiadomość');
content = content.replace(/\[Za"\?''\?'\|"\?<\?'\?''" <\?'\?'.*?/g, '[Załączono plik]');
content = content.replace(/B"\?''\?'\|"\?<\?'\?''" <\?'\?''\?\?綪"\?<.*?/g, 'Błąd podczas generowania');
content = content.replace(/Jako go"\?''\?'\|"\?<\?'\?''" '\?''\?\?綪".*?/g, 'Jako gość masz ograniczoną ilość użyć');
content = content.replace(/Modu patnoci elektronicznych \(BLIK \/ Przelewy24\) w przygotowaniu! Tymczasem u"\?'.*?/g, 'Moduł płatności elektronicznych (BLIK / Przelewy24) w przygotowaniu! Tymczasem użyj innej metody.');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed exactly!');
