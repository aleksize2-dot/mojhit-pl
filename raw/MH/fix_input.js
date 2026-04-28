const fs = require('fs');
let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');
let lines = content.split('\n');

for (let i = 981; i <= 987; i++) {
    lines[i] = "";
}

lines[981] = '                               placeholder="Podaj swój e-mail..."';
lines[982] = '                               required';
lines[983] = '                             />';
lines[984] = '                             <p className="text-[10px] text-on-surface-variant mt-1 ml-1">E-mail jest wymagany, abyśmy wiedzieli do kogo należy utwór, jeśli się zarejestrujesz.</p>';
lines[985] = '                           </div>';

fs.writeFileSync('client/src/components/Generator.tsx', lines.filter(l => l !== "").join('\n'), 'utf8');
console.log("Fixed input");
