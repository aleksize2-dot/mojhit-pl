const fs = require('fs');
const content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');
const lines = content.split('\n');

const find = (str) => {
    const idx = lines.findIndex(l => l.includes(str));
    console.log(`\n--- FOUND "${str}" at line ${idx + 1} ---`);
    console.log(lines.slice(idx - 1, idx + 6).join('\n'));
};

find("{p.tier === 'vip' && <div className=\"text-[7px]");
find("span className={`font-bold text-sm ${isActive ? p.colorText : 'text-on-surface'}`}>{p.name}</span>");
find("p className=\"font-extrabold headline-font");
find("span className={`text-sm font-bold leading-none ${activeProducer.colorText}`}>{activeProducer.name}</span>");
