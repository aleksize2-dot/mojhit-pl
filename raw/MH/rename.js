const fs = require('fs');

function renameInFile(filePath) {
  let f = fs.readFileSync(filePath, 'utf8');
  
  // Replace marek
  f = f.replace(/'marek'/g, "'cj_remi'");
  f = f.replace(/Marek/g, "CJ Remi");
  f = f.replace(/marek\.webp/g, "marek.webp"); // Keep image name for now or we can change it if needed
  
  // Replace maja
  f = f.replace(/'maja'/g, "'melo_mc'");
  f = f.replace(/Maja/g, "MELO MC");
  f = f.replace(/maja\.webp/g, "maja.webp");

  fs.writeFileSync(filePath, f);
}

renameInFile('client/src/components/Generator.tsx');
renameInFile('client/src/config/producers.ts');
console.log('Done renaming in Generator.tsx and producers.ts');
