const fs = require('fs');
const file = 'client/src/components/Generator.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const data = await res.json\(\);\s+if \(\!res.ok\) \{\s+throw new Error\(data\.error \|\| '.*?'\);\s+\}\s+alert\('.*?'\);\s+window\.dispatchEvent\(new Event\('updateBalance'\)\);\s+setTitle\(''\);\s+setFinalAiPrompt\(null\);\s+setMessages\(\[\{ role: 'assistant', content: `.*?\$\{activeProducer\.initMsg\}` \}\]\);\s+\} catch \(err: any\) \{\s+alert\(`.*?\$\{err\.message\}`\);/s;

const replacement = `const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Wystąpił nieznany błąd serwera');
      }

      alert('Utwory zostały wygenerowane! Znajdziesz je w panelu Moje Utwory. Dwa warianty (V1 i V2) są gotowe do odsłuchu.');
      window.dispatchEvent(new Event('updateBalance'));
      setTitle('');
      setFinalAiPrompt(null);
      setMessages(prev => [...prev, { role: 'assistant', content: \`Gotowe! Twoje utwory (V1 i V2) są już w panelu **Moje Utwory**.\` }]);
    } catch (err: any) {
      alert(\`Błąd: \${err.message}\`);`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed handleGenerate successfully');
