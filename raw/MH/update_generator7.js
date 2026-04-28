const fs = require('fs');

// 1. Update App.tsx
let appContent = fs.readFileSync('client/src/App.tsx', 'utf8');
appContent = appContent.replace(
  'pb-[100px] md:pb-0',
  'pb-[76px] md:pb-0'
);
fs.writeFileSync('client/src/App.tsx', appContent);

// 2. Update Generator.tsx
let genContent = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');
genContent = genContent.replace(
  '<p className="text-[10px] text-center text-primary opacity-90 my-3 md:my-0 md:mt-4 md:text-on-surface-variant md:opacity-70 leading-relaxed lg:px-4 uppercase tracking-widest font-label font-bold">',
  '<p className="text-[10px] text-center text-primary opacity-90 my-4 md:my-0 md:mt-4 md:text-on-surface-variant md:opacity-70 leading-relaxed lg:px-4 uppercase tracking-widest font-label font-bold">'
);
fs.writeFileSync('client/src/components/Generator.tsx', genContent);

console.log('done');
