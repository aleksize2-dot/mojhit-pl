const fs = require('fs');

let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

const target = `      const lyricsRegex = /---LYRICS---\\s*([\\s\\S]*?)\\s*---END_LYRICS---/;
      const tagsRegex = /---TAGS---\\s*([\\s\\S]*?)\\s*---END_TAGS---/;
      const titleRegex = /---TITLE---\\s*([\\s\\S]*?)\\s*---END_TITLE---/;
      
      const lyricsMatch = reply.match(lyricsRegex);
      const tagsMatch = reply.match(tagsRegex);
      const titleMatch = reply.match(titleRegex);
      
      if (lyricsMatch && tagsMatch) {
        setFinalAiPrompt({ lyrics: lyricsMatch[1].trim(), tags: tagsMatch[1].trim() });`;

const replacement = `      const lyricsRegex = /---LYRICS---\\s*([\\s\\S]*?)(?:\\s*---END_LYRICS---|$)/;
      const tagsRegex = /---TAGS---\\s*([\\s\\S]*?)(?:\\s*---END_TAGS---|$)/;
      const titleRegex = /---TITLE---\\s*([\\s\\S]*?)(?:\\s*---END_TITLE---|$)/;
      
      const lyricsMatch = reply.match(lyricsRegex);
      const tagsMatch = reply.match(tagsRegex);
      const titleMatch = reply.match(titleRegex);
      
      if (lyricsMatch) {
        let extractedTags = tagsMatch ? tagsMatch[1].trim() : '';
        if (!extractedTags) {
          for (let i = apiMessages.length - 1; i >= 0; i--) {
            if (apiMessages[i].role === 'assistant') {
              const oldTagsMatch = apiMessages[i].content.match(/---TAGS---\\s*([\\s\\S]*?)(?:\\s*---END_TAGS---|$)/);
              if (oldTagsMatch) {
                 extractedTags = oldTagsMatch[1].trim();
                 break;
              }
            }
          }
        }
        if (!extractedTags) extractedTags = 'Pop, hit, catchy';

        setFinalAiPrompt({ lyrics: lyricsMatch[1].trim(), tags: extractedTags });`;

const contentWin = content.replace(/\r\n/g, '\n');
const targetWin = target.replace(/\r\n/g, '\n');

if (contentWin.includes(targetWin)) {
    console.log('Target found!');
    fs.writeFileSync('client/src/components/Generator.tsx', contentWin.replace(targetWin, replacement));
} else {
    console.log('Target not found.');
}
