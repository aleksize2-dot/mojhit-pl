const fs = require('fs');

let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

const TRIVIA_QUESTIONS = [
  "Z jakiego kraju pochodzi muzyka Reggae? A) USA, B) Jamajka, C) Kuba. Napisz literkę!",
  "Kto jest nazywany Królem Popu? A) Prince, B) Elvis Presley, C) Michael Jackson. Napisz literkę!",
  "Z jakiego miasta w Polsce wywodzi się hip-hopowy zespół Paktofonika? A) Warszawa, B) Katowice, C) Kraków. Napisz literkę!",
  "Jaki instrument ma czarne i białe klawisze? A) Gitara, B) Akordeon, C) Fortepian. Napisz literkę!",
  "Jak nazywa się wokalista zespołu Queen? A) Freddie Mercury, B) Mick Jagger, C) David Bowie. Napisz literkę!"
];

const newHandleGenerate = `
  const handleGenerate = async () => {
    if (!finalAiPrompt) {
      alert('Musisz najpierw wygenerować prompt!');
      return;
    }

    if (!isSignedIn && !guestEmail.trim()) {
      alert('Jako gość musisz podać adres e-mail, abyśmy wiedzieli komu przypisać utwór!');
      return;
    }

    if (!isSignedIn && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      alert('Podaj poprawny adres e-mail.');
      return;
    }

    if (currencyType === 'fiat') {
      alert('Moduł płatności elektronicznych (BLIK / Przelewy24) w przygotowaniu! Tymczasem użyj monet lub not.');
      return;
    }

    let finalTitle = title.trim();
    if (!finalTitle) {
      finalTitle = finalAiPrompt.lyrics.trim().split(' ').slice(0, 4).join(' ') + '...';
      setTitle(finalTitle);
    }

    const currentPrompt = { ...finalAiPrompt };
    const guestEmailToUse = !isSignedIn ? guestEmail.trim() : undefined;
    const producerIdToUse = activeProducer.id;

    // Start background generation without blocking UI
    setFinalAiPrompt(null);
    setTitle('');
    
    const TRIVIA_QUESTIONS = [
      "Z jakiego kraju pochodzi muzyka Reggae? A) USA, B) Jamajka, C) Kuba. Napisz literkę!",
      "Kto jest nazywany Królem Popu? A) Prince, B) Elvis Presley, C) Michael Jackson. Napisz literkę!",
      "Z jakiego miasta w Polsce wywodzi się hip-hopowy zespół Paktofonika? A) Warszawa, B) Katowice, C) Kraków. Napisz literkę!",
      "Jaki instrument ma czarne i białe klawisze? A) Gitara, B) Akordeon, C) Fortepian. Napisz literkę!",
      "Jak nazywa się wokalista zespołu Queen? A) Freddie Mercury, B) Mick Jagger, C) David Bowie. Napisz literkę!"
    ];
    const randomQuestion = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: \`Poszło do studia! 🎛️ Twój utwór "\${finalTitle}" właśnie się generuje (potrwa to około 5-10 minut).\\n\\nW międzyczasie zagrajmy w szybki quiz! Zgadnij poprawnie, a nagrodzę Cię darmową notą:\\n\\n**\${randomQuestion}**\` 
    }]);

    // Background process
    (async () => {
      try {
        const sunoRes = await fetch('/api/suno/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            prompt: currentPrompt.lyrics,
            title: finalTitle,
            tags: currentPrompt.tags,
            instrumental: false,
            model: 'V5_5',
            customMode: true,
            personaId: producerIdToUse,
            email: guestEmailToUse
          })
        });

        const sunoData = await sunoRes.json();
        if (!sunoRes.ok) {
          if (sunoRes.status === 403 && sunoData.error === 'LIMIT_REACHED') {
            setShowGuestLimitModal(true);
            return;
          }
          throw new Error(sunoData.error || 'Błąd API Kie.ai');
        }
        if (!sunoData.taskId) throw new Error('Nie otrzymano ID zadania');

        const queryId = sunoData.dbId || sunoData.taskId;

        let audio_url = '';
        let attempts = 0;
        let lastStatusData: any = null;
        const maxAttempts = 80;
        const getDelay = (attempt: number) => {
          if (attempt < 10) return 3000;
          if (attempt < 25) return 5000;
          if (attempt < 45) return 8000;
          if (attempt < 65) return 12000;
          return 15000;
        };
        
        while (attempts < maxAttempts) {
          const delay = getDelay(attempts);
          await new Promise(resolve => setTimeout(resolve, delay));
          const statusRes = await fetch(\`/api/suno/status/\${queryId}\`, {
            credentials: 'include'
          });
          const statusData = await statusRes.json();
          lastStatusData = statusData;
          
          if (!statusRes.ok) throw new Error(statusData.error || 'Błąd statusu zadania');
          
          if (statusData.status === 'completed' || statusData.status === 'complete' || statusData.audio_url || (statusData.variants && statusData.variants.length > 0)) {
            audio_url = statusData.audio_url || (statusData.variants ? statusData.variants[0].audio_url : '');
            if (audio_url || statusData.variants) break;
          } else if (statusData.status === 'error' || statusData.status === 'failed') {
            throw new Error('Błąd serwera generującego (kie.ai)');
          }
          attempts++;
        }

        if (!audio_url && (!lastStatusData || !lastStatusData.variants)) {
          throw new Error('Przekroczono limit czasu oczekiwania na utwór (~12 min)');
        }

        const payload = {
          title: finalTitle,
          description: currentPrompt.lyrics,
          currency_type: currencyType,
          audio_url: audio_url,
          variants: lastStatusData?.variants || [], 
          kie_task_id: sunoData.dbId || null
        };

        const res = await fetch('/api/tracks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Wystąpił nieznany błąd serwera');
        }

        window.dispatchEvent(new Event('updateBalance'));
        
        const audioUrlToPlay = audio_url || (lastStatusData?.variants && lastStatusData.variants.length > 0 ? lastStatusData.variants[0].audio_url : '');
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: \`💥 BOOM! Utwór "\${finalTitle}" jest gotowy! Posłuchaj tego:\n\n[AUDIO_PLAYER:\${audioUrlToPlay}]\n\nMożesz też znaleźć pełne wersje (V1 i V2) w zakładce "Moje Utwory". O czym robimy następny hit?\` 
        }]);

      } catch (err: any) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: \`❌ Ups, coś poszło nie tak w studiu podczas generowania "\${finalTitle}": \${err.message}\` 
        }]);
      }
    })();
  };
`;

const startIndex = content.indexOf('const handleGenerate = async () => {');
const endIndex = content.indexOf('const checkSunoLimits = async () => {');

// We also need to extract `checkSunoLimits` safely.
// Let's find exactly the block to replace.
const blockToReplace = content.substring(startIndex, endIndex);

content = content.replace(blockToReplace, newHandleGenerate + '\n\n  ');

fs.writeFileSync('client/src/components/Generator.tsx', content);

console.log('done');
