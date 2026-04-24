// Лёгкий markdown-подобный рендерер для чата DJ Marek
// Без внешних зависимостей — только React + Tailwind

interface ChatMessageProps {
  content: string;
  isUser?: boolean;
}

// Структурные теги песен — выделяем цветом
const SONG_TAGS = [
  'Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Outro',
  'Interlude', 'Break', 'Hook', 'Refrain', 'Prechorus',
  'Verse 1', 'Verse 2', 'Verse 3', 'Verse 4',
  'Chorus 1', 'Chorus 2', 'Chorus 3',
  'Pre-Chorus 1', 'Pre-Chorus 2',
  'Bridge 1', 'Bridge 2',
  'Outro 1', 'Outro 2',
  'Intro 1', 'Intro 2',
];

function highlightSongTags(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  const tagPattern = /\[(.*?)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = tagPattern.exec(remaining)) !== null) {
    const tagContent = match[1];
    const isSongTag = SONG_TAGS.some(st => tagContent.toLowerCase() === st.toLowerCase());

    // Текст до тега
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }

    if (isSongTag) {
      parts.push(
        <span key={`tag-${keyIndex++}`} className="font-bold text-primary">
          [{tagContent}]
        </span>
      );
    } else {
      // Обычные скобки — оставляем как есть
      parts.push(`[${tagContent}]`);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function formatBold(text: string): React.ReactNode {
  // **bold** и *italic*
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  // Bold: **text**
  const boldPattern = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldPattern.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }
    const inner = highlightSongTags(match[1]);
    parts.push(<strong key={`b-${keyIndex++}`}>{inner}</strong>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < remaining.length) {
    const rest = remaining.slice(lastIndex);
    parts.push(...highlightSongTags(rest));
  }

  return parts.length > 0 ? parts : highlightSongTags(text);
}

export function ChatMessage({ content, isUser = false }: ChatMessageProps) {
  if (isUser) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  // Разбиваем на строки и обрабатываем каждую
  const lines = content.split('\n');

  return (
    <span className="whitespace-pre-wrap">
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {formatBold(line)}
        </span>
      ))}
    </span>
  );
}
