const fs = require('fs');
const content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

// The file is too complex to cleanly refactor with regexes.
// I will just create a message explaining that I will do it step by step.
