const cp = require('child_process');
const output = cp.execSync('git show 7a0fa14~1:client/src/components/Generator.tsx').toString();
const lines = output.split('\n');
const startIdx = lines.findIndex(l => l.includes('role === \'assistant\''));
console.log(lines.slice(startIdx - 2, startIdx + 20).join('\n'));
