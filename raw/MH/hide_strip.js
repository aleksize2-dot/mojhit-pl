const fs = require('fs');
let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

content = content.replace(
  /<div className="text-center space-y-1 mb-1 md:space-y-2 md:mb-2 md:mt-4 px-4 md:px-0">/g,
  '<div className="hidden md:block text-center space-y-1 mb-1 md:space-y-2 md:mb-2 md:mt-4 px-4 md:px-0">'
);

content = content.replace(
  /<div className="w-full relative mask-image-fade -mt-10 md:-mt-14 z-0 overflow-hidden">/g,
  '<div className="hidden md:block w-full relative mask-image-fade -mt-10 md:-mt-14 z-0 overflow-hidden">'
);

fs.writeFileSync('client/src/components/Generator.tsx', content);
console.log('Hidden horizontal strip on mobile.');
