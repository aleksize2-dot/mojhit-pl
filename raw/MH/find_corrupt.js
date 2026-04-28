const fs = require('fs');
const lines = fs.readFileSync('client/src/components/Generator.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('Ă') || l.includes('Ä') || l.includes('Ĺ') || l.includes('Ă˘') || l.includes('Ă„') || l.includes('Ä‚') || l.includes('Ä')) {
    console.log(i + ': ' + l.trim());
  }
});
