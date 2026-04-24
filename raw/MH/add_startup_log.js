const fs = require('fs');
const file = 'server/index.js';
let data = fs.readFileSync(file, 'utf8');

const startupLog = `
// Log startup
systemLogger('info', 'SYSTEM_STARTUP', 'Backend zrestartowany i połączony z bazą danych.', { timestamp: new Date().toISOString() });
`;

if (!data.includes('SYSTEM_STARTUP')) {
  data = data.replace(/(app\.listen\([\s\S]+?console\.log\([^)]+\);)/, '$1' + startupLog);
  fs.writeFileSync(file, data, 'utf8');
}
console.log('Startup log added');
