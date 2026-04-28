const fs = require('fs');
let code = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

// I will replace full lines so I don't miss weird characters
const linesToReplace = [
  { 
    lineNum: 176, 
    good: "    const producerThoughts = (activeProducer.typingMsg || 'Kminie nad bitem...;Szukam brzmienia...;Prawie gotowe! ✨').split(';').filter((t: string) => t.trim().length > 0);" 
  },
  { 
    lineNum: 247, 
    good: "      alert('⚠️ Głosowe odpowiedzi (czytanie na głos) są dostępne tylko w pakiecie VIP lub Legend!');" 
  },
  { 
    lineNum: 456, 
    good: "          setMessages(prev => [...prev, { role: 'assistant', content: 'Wygenerowałem alternatywną wersję tekstu. Sprawdź poniżej!' }]);" 
  },
  { 
    lineNum: 652, 
    good: "      {/* ✨ Horizontal scroll strip (both mobile & desktop) ✨ */}" 
  },
  { 
    lineNum: 899, 
    good: "                            <p className=\"text-xs text-on-surface-variant\">Przejrzyj prompt i dokonaj płatności</p>" 
  },
  { 
    lineNum: 978, 
    good: "                            placeholder=\"Opcjonalny tytuł (np. Ostatni Lot)...\"" 
  },
  { 
    lineNum: 982, 
    good: "                        <span className=\"text-[10px] uppercase font-bold text-on-surface-variant font-label text-center tracking-widest\">Wybierz Metodę Płatności</span>" 
  },
  { 
    lineNum: 1011, 
    good: "                            placeholder=\"Podaj swój e-mail...\"" 
  },
  { 
    lineNum: 1014, 
    good: "                          <p className=\"text-[10px] text-on-surface-variant mt-1 ml-1\">E-mail jest wymagany, abyśmy wiedzieli do kogo należy utwór, jeśli się zarejestrujesz.</p>" 
  },
  { 
    lineNum: 1037, 
    good: "                        <span>Wygeneruj za {currencyType === 'fiat' ? 'PLN (Wkrótce)' : currencyType === 'coins' ? '1 monetę' : '10 not'}</span>" 
  },
  { 
    lineNum: 1075, 
    good: "                         title={attachedFile ? `Załączono: ${attachedFile.name}` : 'Załącz plik / inspirację'}" 
  },
  { 
    lineNum: 1080, 
    good: "                         title={'Dyktuj głosowo'}" 
  },
  { 
    lineNum: 1085, 
    good: "                         title={userPlan === 'VIP' || userPlan === 'Legend' ? (isVoiceResponseEnabled ? 'Wyłącz czytanie na głos' : 'Włącz czytanie na głos') : 'Głosowe odpowiedzi (tylko VIP/Legend)'}" 
  },
  { 
    lineNum: 1180, 
    good: "                  <p className=\"text-sm text-on-surface-variant mb-6\">Jako gość możesz wygenerować tylko jeden darmowy utwór. Załóż konto, aby otrzymać <b>20 darmowych not</b> na start i tworzyć dalej!</p>" 
  },
  { 
    lineNum: 1185, 
    good: "                    <span>Załóż darmowe konto</span>" 
  }
];

let lines = code.split('\n');

linesToReplace.forEach(r => {
  lines[r.lineNum] = r.good;
});

fs.writeFileSync('client/src/components/Generator.tsx', lines.join('\n'));
