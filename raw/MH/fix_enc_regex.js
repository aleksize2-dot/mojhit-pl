const fs = require('fs');
const file = 'client/src/components/Generator.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/Za.*?czono:/g, 'Załączono:');
content = content.replace(/Za.*?cz plik \/ inspiracj.*?/g, 'Załącz plik / inspirację');
content = content.replace(/Wy.*?cz czytanie na g.*?os/g, 'Wyłącz czytanie na głos');
content = content.replace(/W.*?cz czytanie na g.*?os/g, 'Włącz czytanie na głos');
content = content.replace(/G.*?osowe odpowiedzi \(tylko VIP\/Legend\)/g, 'Głosowe odpowiedzi (tylko VIP/Legend)');
content = content.replace(/1 monet.*/g, '1 monetę</span>');
content = content.replace(/Wybierz Metod.*? P.*?atno.*?ci/g, 'Wybierz Metodę Płatności');
content = content.replace(/tylko jeden darmowy utw.*?r/g, 'tylko jeden darmowy utwór');
content = content.replace(/aby otrzyma.*? /g, 'aby otrzymać ');
content = content.replace(/tworzy.*? dalej/g, 'tworzyć dalej');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed encodings in Generator.tsx via Regex');
