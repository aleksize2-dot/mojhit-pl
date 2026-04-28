const fs = require('fs');
let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

const oldStr = 'className="flex-1 min-h-0 relative max-w-6xl mx-auto flex gap-0 px-0 md:px-2 lg:px-6 w-full mt-0 z-10 full-bleed md:static md:w-full md:left-auto md:right-auto md:ml-auto md:mr-auto"';
const newStr = 'className="flex-1 min-h-0 relative max-w-6xl mx-auto flex gap-0 px-0 md:px-2 lg:px-6 w-full mt-0 z-10 w-[100vw] left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] md:w-full md:left-auto md:right-auto md:ml-auto md:mr-auto md:mx-auto"';

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync('client/src/components/Generator.tsx', content);
  console.log('Replaced successfully');
} else {
  console.log('String not found!');
}
