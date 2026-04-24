const fs = require('fs');
const file = 'client/src/components/Generator.tsx';
let data = fs.readFileSync(file, 'utf8');

// Replace items-center with items-start in the marquee wrapper
data = data.replace(/<div className="flex items-center gap-6 animate-marquee-slow pt-16 pb-6 w-max hover:\[animation-play-state:paused\]">/, '<div className="flex items-start gap-6 animate-marquee-slow pt-16 pb-6 w-max hover:[animation-play-state:paused]">');

// Remove scale-110 from active avatar in marquee
data = data.replace(/\${isActive \? \`bg-surface-container-lowest border-transparent animate-sound-wave \${p.colorText} scale-110\` : 'border-outline-variant\/30 grayscale-\[60%\]'}/, "${isActive ? `bg-surface-container-lowest border-transparent animate-sound-wave ${p.colorText}` : 'border-outline-variant/30 grayscale-[60%]'}");

// Replace items-center with items-start in the mobile dropdown wrapper
data = data.replace(/<div className="flex items-center gap-2 overflow-x-auto px-5 py-5 scrollbar-none" style={{scrollbarWidth:'none'}}>/, '<div className="flex items-start gap-2 overflow-x-auto px-5 py-5 scrollbar-none" style={{scrollbarWidth:\'none\'}}>');

fs.writeFileSync(file, data, 'utf8');
console.log('Replaced successfully');
