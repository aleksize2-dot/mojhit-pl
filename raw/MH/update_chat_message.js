const fs = require('fs');

let content = fs.readFileSync('client/src/components/ChatMessage.tsx', 'utf8');

// Replace formatBold to handle AUDIO_PLAYER
content = content.replace(
  'function formatBold(text: string): React.ReactNode {',
  `function formatBold(text: string): React.ReactNode {
  // Parse Audio Player
  if (text.includes('[AUDIO_PLAYER:')) {
    const audioPattern = /\\[AUDIO_PLAYER:(.*?)\\]/g;
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIndex = 0;
    let lastIndex = 0;
    let match;

    while ((match = audioPattern.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.slice(lastIndex, match.index));
      }
      const url = match[1];
      parts.push(
        <div key={\`audio-\${keyIndex++}\`} className="my-3">
          <audio controls src={url} className="w-full h-10 outline-none rounded-full bg-primary/10" controlsList="nodownload" />
        </div>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < remaining.length) {
      parts.push(remaining.slice(lastIndex));
    }
    
    // Pass the parsed parts through the rest of the formatting
    return parts.map((part, i) => {
      if (typeof part === 'string') {
        return <span key={\`text-\${i}\`}>{formatBoldImpl(part)}</span>;
      }
      return part;
    });
  }
  return formatBoldImpl(text);
}

function formatBoldImpl(text: string): React.ReactNode {`
);

fs.writeFileSync('client/src/components/ChatMessage.tsx', content);

console.log('done');
