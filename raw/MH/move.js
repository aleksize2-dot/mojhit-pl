const fs = require('fs');
const file = 'client/src/components/Generator.tsx';
let data = fs.readFileSync(file, 'utf8');

// Reduce pb-6 to pb-0
data = data.replace(/<div className="flex items-start gap-6 animate-marquee-slow pt-16 pb-6 w-max hover:\[animation-play-state:paused\]">/, '<div className="flex items-start gap-6 animate-marquee-slow pt-16 pb-0 w-max hover:[animation-play-state:paused]">');

// Remove mt-4 from chat container
data = data.replace(/<div ref={chatContainerRef} className="relative max-w-6xl mx-auto flex gap-0 px-2 lg:px-6 w-full mt-4 z-10">/, '<div ref={chatContainerRef} className="relative max-w-6xl mx-auto flex gap-0 px-2 lg:px-6 w-full mt-0 z-10">');

fs.writeFileSync(file, data, 'utf8');
console.log('Moved closer successfully');
