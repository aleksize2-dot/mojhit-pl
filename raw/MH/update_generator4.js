const fs = require('fs');

let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

content = content.replace(
  '<section className="flex-1 flex flex-col min-h-0 relative w-full h-full max-h-full space-y-0 md:space-y-6">',
  '<section className="flex-1 flex flex-col min-h-0 relative w-full space-y-0 md:space-y-6">'
);

content = content.replace(
  '<div ref={chatContainerRef} className="relative max-w-6xl mx-auto flex gap-0 px-0 md:px-6 w-full mt-0 z-10 flex-1 md:flex-none md:h-[700px] min-h-0 h-full pb-0 md:pb-0">',
  '<div ref={chatContainerRef} className="relative max-w-6xl mx-auto flex gap-0 px-0 md:px-6 w-full mt-0 z-10 flex-1 md:flex-none md:h-[700px] min-h-0 pb-0">'
);

content = content.replace(
  '<div className="relative group flex-1 min-w-0 flex flex-col h-full">',
  '<div className="relative group flex-1 min-w-0 flex flex-col">'
);

content = content.replace(
  '<div className="relative bg-surface md:bg-surface-container-lowest md:rounded-3xl overflow-hidden md:ring-1 ring-outline-variant/20 md:shadow-2xl flex-1 flex flex-col h-full max-h-full">',
  '<div className="relative bg-surface md:bg-surface-container-lowest md:rounded-3xl overflow-hidden md:ring-1 ring-outline-variant/20 md:shadow-2xl flex-1 flex flex-col">'
);

content = content.replace(
  '<div className="flex flex-col flex-1 h-full min-h-0 max-h-full">',
  '<div className="flex flex-col flex-1 min-h-0">'
);

fs.writeFileSync('client/src/components/Generator.tsx', content);
console.log('done');
