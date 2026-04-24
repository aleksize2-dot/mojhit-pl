const fs = require('fs');
let f = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

// The problematic string is: `/avatars/${activeAgent}.webp`
// We need to replace it with: (activeAgent === 'cj_remi' ? '/avatars/remi.webp' : '/avatars/melo.webp')

f = f.split('`/avatars/${activeAgent}.webp`').join("(activeAgent === 'cj_remi' ? '/avatars/remi.webp' : '/avatars/melo.webp')");

fs.writeFileSync('client/src/components/Generator.tsx', f);
console.log('Fixed avatars string');
