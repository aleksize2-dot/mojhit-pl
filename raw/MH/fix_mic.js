const fs = require('fs');
const file = 'client/src/components/Generator.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex1 = /title=\{'Dyktuj .*?'\}/;
content = content.replace(regex1, "title={'Dyktuj głosowo'}");

const regex2 = /title=\{userPlan === 'VIP' \|\| userPlan === 'Legend' \? \(isVoiceResponseEnabled \? 'Wy.*?' : 'W.*?'\) : 'G.*?'\}/;
content = content.replace(regex2, "title={userPlan === 'VIP' || userPlan === 'Legend' ? (isVoiceResponseEnabled ? 'Wyłącz czytanie na głos' : 'Włącz czytanie na głos') : 'Głosowe odpowiedzi (tylko VIP/Legend)'}");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed mic text successfully');
