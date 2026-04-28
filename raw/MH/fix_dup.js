const fs = require('fs');
let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

content = content.replace("      const res = await fetch('/api/tracks', {\r\n      const res = await fetch('/api/tracks', {", "      const res = await fetch('/api/tracks', {");
content = content.replace("      const res = await fetch('/api/tracks', {\n      const res = await fetch('/api/tracks', {", "      const res = await fetch('/api/tracks', {");

fs.writeFileSync('client/src/components/Generator.tsx', content, 'utf8');
console.log('Fixed dup');
