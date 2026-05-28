const text = "Hello**bold**\n\nWorld"; const boldPattern = /\*\*(.*?)\*\*/g; let match; while((match = boldPattern.exec(text)) !== null) { console.log(match[1]); }
