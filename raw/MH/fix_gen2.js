const fs = require('fs');
let lines = fs.readFileSync('client/src/components/Generator.tsx', 'utf8').split('\n');

lines[590] = "      const res = await fetch('/api/tracks', {";
lines[591] = "        method: 'POST',";
lines[592] = "        headers: { 'Content-Type': 'application/json' },";
lines[593] = "        credentials: 'include',";
lines[594] = "        body: JSON.stringify(payload)";
lines[595] = "      });";
lines[596] = "";
lines[597] = "      const data = await res.json();";
lines[598] = "      if (!res.ok) {";
lines[599] = "        throw new Error(data.error || 'Wystąpił nieznany błąd serwera');";
lines[600] = "      }";
lines[601] = "";
lines[602] = "      alert('Utwory zostały wygenerowane! Znajdziesz je w panelu Moje Utwory. Dwa warianty (V1 i V2) są gotowe do odsłuchu.');";

fs.writeFileSync('client/src/components/Generator.tsx', lines.join('\n'), 'utf8');
console.log('Fixed syntax error');
