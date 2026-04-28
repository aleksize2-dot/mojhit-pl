const fs = require('fs');
let c = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');
let lines = c.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('Twoja przegl')) line = line.replace(/Twoja przegl.*?obs.*?(?:'|")/g, "Twoja przeglądarka nie obsługuje nagrywania audio.'");
    if (line.includes('Plik jest za du')) line = line.replace(/Plik jest za du.*?10MB'\)/g, "Plik jest za duży! Maksymalny rozmiar: 10MB')");
    if (line.includes('Załączono:') || (line.includes('Za') && line.includes('czono:'))) line = line.replace(/Za.*?czono:/g, "Załączono:");
    if (line.includes('podczas regeneracji promptu')) line = line.replace(/B.*?podczas regeneracji promptu/g, "Błąd podczas regeneracji promptu");
    if (line.includes('Wygenerowa') && line.includes('alternatywn')) line = line.replace(/Wygenerowa.*?alternatywn.*?tekstu.*?poni/g, "Wygenerowałem alternatywną wersję tekstu. Sprawdź poniżej");
    if (line.includes('Musisz najpierw wygenerowa')) line = line.replace(/Musisz najpierw wygenerowa.*?prompt/g, "Musisz najpierw wygenerować prompt");
    if (line.includes('Jako go') && line.includes('tylko')) line = line.replace(/Jako go.*?wygenerowa.*?tylko/g, "Jako gość możesz wygenerować tylko");
    if (line.includes('Modu') && line.includes('elektronicznych')) line = line.replace(/Modu.*?elektronicznych/g, "Moduł płatności elektronicznych");
    if (line.includes('API Kie.ai')) line = line.replace(/B.*?API Kie.ai/g, "Błąd API Kie.ai");
    if (line.includes('statusu zadania')) line = line.replace(/B.*?statusu zadania/g, "Błąd statusu zadania");
    if (line.includes('serwera generuj')) line = line.replace(/B.*?serwera generuj.*?(kie\.ai)/g, "Błąd serwera generującego (kie.ai");
    if (line.includes('Przekroczono limit czasu oczekiwania na utw')) line = line.replace(/Przekroczono limit czasu oczekiwania na utw.*?\(/g, "Przekroczono limit czasu oczekiwania na utwór (");
    if (line.includes('nieznany b')) line = line.replace(/Wyst.*?nieznany b.*?serwera/g, "Wystąpił nieznany błąd serwera");
    if (line.includes('wygenerowane! Znajdziesz je w panelu Moje Utwory')) line = line.replace(/Utwory zosta.*?wygenerowane! Znajdziesz je w panelu Moje Utwory\. Dwa warianty \(V1 i V2\) s.*?gotowe do ods.*?uchu\./g, "Utwory zostały wygenerowane! Znajdziesz je w panelu Moje Utwory. Dwa warianty (V1 i V2) są gotowe do odsłuchu.");
    if (line.includes('Gotowe! ') && line.includes('Twoje utwory')) line = line.replace(/Gotowe!.*?Twoje utwory \(V1 i V2\) s.*?ju.*?w panelu/g, "Gotowe! Twoje utwory (V1 i V2) są już w panelu");
    if (line.includes('err.message')) line = line.replace(/B.*?: \$\{err\.message\}/g, "Błąd: ${err.message}");
    if (line.includes('Opcjonalny tytu')) line = line.replace(/Opcjonalny tytu.*?"/g, 'Opcjonalny tytuł..."');
    if (line.includes('Wybierz Metod')) line = line.replace(/Wybierz Metod.*?P.*?atno.*?ci/g, "Wybierz Metodę Płatności");
    if (line.includes('Podaj sw')) line = line.replace(/Podaj sw.*?e-mail/g, "Podaj swój e-mail");
    if (line.includes('wiedzieli do kogo nale')) line = line.replace(/E-mail jest wymagany, aby.*?my wiedzieli do kogo nale.*?y utw.*?r, je.*?li si.*? zarejestrujesz/g, "E-mail jest wymagany, abyśmy wiedzieli do kogo należy utwór, jeśli się zarejestrujesz");
    if (line.includes('PLN (Wkr')) line = line.replace(/PLN \(Wkr.*?\)/g, "PLN (Wkrótce)");
    if (line.includes('osowo')) line = line.replace(/Dyktuj g.*?osowo/g, "Dyktuj głosowo");
    if (line.includes('darmowe konto')) line = line.replace(/Za.*?darmowe konto/g, "Załóż darmowe konto");
    if (line.includes('konto, aby otrzyma')) line = line.replace(/Za.*?konto, aby otrzyma.*?/g, "Załóż konto, aby otrzymać");

    lines[i] = line;
}

fs.writeFileSync('client/src/components/Generator.tsx', lines.join('\n'), 'utf8');
console.log('Fixed all strings');
