const fs = require('fs');
let c = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

c = c.replace(/Przejrzyj prompt i dokonaj.*?<\/p>/g, 'Przejrzyj wygenerowany tekst i utwórz piosenkę</p>');
c = c.replace(/model: 'V5_5',/g, "model: activeProducer.suno_persona_model || 'V5_5',");

// Remove tags section completely
c = c.replace(/<div className="mb-4 pb-4 border-b border-outline-variant\/10">[\s\S]*?Wirtualny Wykonawca - Tagi Suno[\s\S]*?<\/div>[\s\S]*?<\/div>/, '');

fs.writeFileSync('client/src/components/Generator.tsx', c, 'utf8');
console.log('Fixed tags sub, tags block, and model');
