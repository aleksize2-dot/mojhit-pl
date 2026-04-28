const fs = require('fs');
const content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');
const idx = content.indexOf('activeProducer.tier ===');
console.log(content.slice(idx - 300, idx + 300));
