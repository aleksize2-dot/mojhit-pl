const fs = require('fs');

let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

const oldPolicy = `<p className="text-[10px] text-center text-on-surface-variant opacity-70 mt-4 leading-relaxed lg:px-4 uppercase tracking-widest font-label font-bold">
        Polityka plików: Utwory wygenerowane wygasają po 14 dniach. Pobierz mp3, jeśli chcesz je zachować.
      </p>`;

const newPolicy = `<p className="text-[10px] text-center text-on-surface opacity-100 mt-2 mb-2 leading-relaxed lg:px-4 uppercase tracking-widest font-label font-bold">
        Polityka plików: Utwory wygenerowane wygasają po 14 dniach. Pobierz mp3, jeśli chcesz je zachować.
      </p>`;

content = content.replace(oldPolicy, newPolicy);
content = content.replace(oldPolicy.replace(/\\r\\n/g, '\\n'), newPolicy);

fs.writeFileSync('client/src/components/Generator.tsx', content);
console.log('done');
