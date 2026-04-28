const fs = require('fs');
let lines = fs.readFileSync('client/src/components/Generator.tsx', 'utf8').split('\n');

// Clear the tags section by making lines 875-882 empty strings
for (let i = 875; i <= 882; i++) {
    lines[i] = "";
}

// Fix the subtitle
lines[871] = '                            <p className="text-xs text-on-surface-variant">Przejrzyj wygenerowany tekst i utwórz piosenkę</p>';

fs.writeFileSync('client/src/components/Generator.tsx', lines.join('\n'), 'utf8');
console.log('Fixed tags and subtitle');
