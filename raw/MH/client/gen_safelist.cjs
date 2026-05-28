const fs = require('fs');
const colors = ['slate','gray','zinc','neutral','stone','red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose'];
const shades = ['50','100','200','300','400','500','600','700','800','900','950'];
const prefixes = ['bg','text','border', 'shadow', 'from', 'via', 'to'];

let safelist = [];

// Manually add the custom arbitrary values the user already created
safelist.push(
  // VENA
  'bg-[#1A0000]', 'bg-[#1A0000]/5', 'bg-[#1A0000]/10', 'from-[#1A0000]', 'via-[#4A0010]', 'to-[#E11D48]',
  // SOLANA
  'from-[#2D0A2E]', 'via-[#4A154B]', 'to-[#D4A017]'
);

for (const c of colors) {
  for (const s of shades) {
    for (const p of prefixes) {
      if (p === 'shadow') {
        safelist.push(`shadow-${c}-${s}/30`);
      } else if (p === 'from' || p === 'via' || p === 'to') {
        safelist.push(`${p}-${c}-${s}`);
      } else {
        safelist.push(`${p}-${c}-${s}`);
        safelist.push(`${p}-${c}-${s}/5`);
        safelist.push(`${p}-${c}-${s}/10`);
        safelist.push(`${p}-${c}-${s}/20`);
        safelist.push(`${p}-${c}-${s}/80`);
      }
    }
  }
}

const customColors = ['primary', 'tertiary'];
for (const c of customColors) {
    for (const p of prefixes) {
      if (p === 'shadow') {
        safelist.push(`shadow-${c}/30`);
      } else if (p === 'from' || p === 'via' || p === 'to') {
        safelist.push(`${p}-${c}`);
      } else {
        safelist.push(`${p}-${c}`);
        safelist.push(`${p}-${c}/5`);
        safelist.push(`${p}-${c}/10`);
        safelist.push(`${p}-${c}/20`);
        safelist.push(`${p}-${c}/80`);
      }
    }
}

fs.writeFileSync('src/config/tailwind-safelist-colors.ts', 'export const tailwindColorsSafelist = ' + JSON.stringify(safelist, null, 2) + ';');
console.log('Done generating safelist');
