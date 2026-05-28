const fs = require('fs');
let content = fs.readFileSync('C:/Users/Admin/.openclaw/workspace/raw/MH/server/index.js', 'utf8');
// Replace the broken template literal console.log
content = content.replace(
  "console.log(\\(KIE WEBHOOK] Ignoring out-of-order callback (\\) for already completed task: \\);",
  "console.log(\"[KIE WEBHOOK] Ignoring out-of-order callback (\" + callbackType + \") for already completed task: \" + taskId);"
);
fs.writeFileSync('C:/Users/Admin/.openclaw/workspace/raw/MH/server/index.js', content, 'utf8');
console.log('Syntax check:');
require('child_process').execSync('node --check "raw/MH/server/index.js"', { stdio: 'inherit' });
