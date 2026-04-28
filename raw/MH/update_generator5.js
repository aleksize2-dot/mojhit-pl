const fs = require('fs');
let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

content = content.replace(
  '<div className="p-4 border-t border-outline-variant/10 bg-surface-container-low shrink-0 relative z-10">',
  '<div className="p-4 border-t border-b md:border-b-0 border-outline-variant/10 bg-surface-container-low shrink-0 relative z-10 shadow-[0_8px_16px_rgba(0,0,0,0.3)]">'
);

content = content.replace(
  '<div className="p-4 border-t border-outline-variant/10 bg-surface-container-low text-center shrink-0">',
  '<div className="p-4 border-t border-b md:border-b-0 border-outline-variant/10 bg-surface-container-low text-center shrink-0 shadow-[0_8px_16px_rgba(0,0,0,0.3)]">'
);

fs.writeFileSync('client/src/components/Generator.tsx', content);
console.log('done');
