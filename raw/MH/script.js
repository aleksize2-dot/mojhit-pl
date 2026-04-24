const fs = require('fs');
const file = 'client/src/components/Generator.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/if \(userPlan !== 'Pro' && userPlan !== 'Premium' && userPlan !== 'VIP'\)/g, `if (userPlan !== 'VIP' && userPlan !== 'Legend')`);
data = data.replace(/userPlan === 'Pro' \|\| userPlan === 'Premium' \|\| userPlan === 'VIP'/g, `userPlan === 'VIP' || userPlan === 'Legend'`);
data = data.replace(/tylko w pakiecie PRO!/g, `tylko w pakiecie VIP lub Legend!`);
data = data.replace(/tylko PRO/g, `tylko VIP/Legend`);

fs.writeFileSync(file, data, 'utf8');
console.log('Replaced successfully');
