const fs = require('fs');
const content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');
const lines = content.split('\n');

const find = (str) => {
    const idx = lines.findIndex(l => l.includes(str));
    console.log(`\n--- FOUND ${str} at line ${idx} ---`);
    console.log(lines.slice(idx - 3, idx + 8).join('\n'));
};

find("activeProducer.tier === 'vip' || activeProducer.tier === 'legend'");
find("{p.tier === 'vip' && <div");
