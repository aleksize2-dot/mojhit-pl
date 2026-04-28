const fs = require('fs');
let lines = fs.readFileSync('client/src/components/useGeneratorLogic.ts', 'utf8').split('\n');

lines[216] = "      'Kminie nad bitem...;Szukam brzmienia...;Prawie gotowe! 🎵'";
lines[319] = "        'Twoja przeglądarka nie obsługuje rozpoznawania mowy. Spróbuj użyć Chrome.'";
lines[340] = "        '🔇 Głosowe odpowiedzi (czytanie na głos) są dostępne tylko w pakiecie VIP lub Legend!'";

fs.writeFileSync('client/src/components/useGeneratorLogic.ts', lines.join('\n'));
console.log('Fixed remaining mojibakes.');
