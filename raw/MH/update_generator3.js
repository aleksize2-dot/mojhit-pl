const fs = require('fs');

let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

// Fix 1: Restore desktop height
const oldContainer = '<div ref={chatContainerRef} className="relative max-w-6xl mx-auto flex gap-0 px-0 md:px-6 w-full mt-0 z-10 flex-1 min-h-0 h-full pb-0 md:pb-0">';
const newContainer = '<div ref={chatContainerRef} className="relative max-w-6xl mx-auto flex gap-0 px-0 md:px-6 w-full mt-0 z-10 flex-1 md:flex-none md:h-[700px] min-h-0 h-full pb-0 md:pb-0">';
content = content.replace(oldContainer, newContainer);

// Fix 2: Textarea font size for mobile
const oldTextareaClass = 'className="w-full bg-transparent border-none text-base text-on-surface focus:outline-none focus:ring-0 font-body resize-none min-h-[44px] max-h-[120px] px-3 py-2 custom-scrollbar"';
const newTextareaClass = 'className="w-full bg-transparent border-none text-[11px] sm:text-sm md:text-base text-on-surface focus:outline-none focus:ring-0 font-body resize-none min-h-[44px] max-h-[120px] px-2 md:px-3 py-2.5 custom-scrollbar"';
content = content.replace(oldTextareaClass, newTextareaClass);

// Fix 3: Hide Polityka on mobile
const oldPolicy = `<p className="text-[10px] text-center text-on-surface opacity-100 mt-2 mb-2 leading-relaxed lg:px-4 uppercase tracking-widest font-label font-bold">
        Polityka plików: Utwory wygenerowane wygasają po 14 dniach. Pobierz mp3, jeśli chcesz je zachować.
      </p>`;
const newPolicy = `<p className="hidden md:block text-[10px] text-center text-on-surface opacity-100 mt-2 mb-2 leading-relaxed lg:px-4 uppercase tracking-widest font-label font-bold">
        Polityka plików: Utwory wygenerowane wygasają po 14 dniach. Pobierz mp3, jeśli chcesz je zachować.
      </p>`;
content = content.replace(oldPolicy, newPolicy);
content = content.replace(oldPolicy.replace(/\\r\\n/g, '\\n'), newPolicy);


fs.writeFileSync('client/src/components/Generator.tsx', content);
console.log('done');
