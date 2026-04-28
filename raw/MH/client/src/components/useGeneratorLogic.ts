import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface UseGeneratorLogicProps {
  giftMode?: boolean;
  giftTemplate?: any;
  isSignedIn?: boolean;
}

export function useGeneratorLogic(props: UseGeneratorLogicProps = {}) {
  const { isSignedIn } = props;
  const location = useLocation();

  // ── Producer / user state ──
  const [producers, setProducers] = useState<any[]>([]);
  const [activeAgent, setActiveAgent] = useState<string>('');
  const [userPlan, setUserPlan] = useState<string>('Free');
  const [ownedProducerIds, setOwnedProducerIds] = useState<string[]>([]);

  // ── Track / generation state ──
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currencyType, setCurrencyType] = useState<'coins' | 'notes' | 'fiat'>('coins');
  const [isProducerPanelOpen, setIsProducerPanelOpen] = useState(false);

  // ── Chat state ──
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [playingMsgIndex, setPlayingMsgIndex] = useState<number | null>(null);
  const [loadingTtsIndex, setLoadingTtsIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [currentThought, setCurrentThought] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ── Prompt / editing state ──
  const [finalAiPrompt, setFinalAiPrompt] = useState<{ lyrics: string; tags: string } | null>(null);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Voice / speech state ──
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isVoiceResponseEnabled, setIsVoiceResponseEnabled] = useState(false);

  // ── Guest / limit modal ──
  const [guestEmail, setGuestEmail] = useState('');
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ── Computed ──
  const activeProducer = producers.find(p => p.id === activeAgent) || producers[0];

  // ═══════════════════════════════════════════
  //  Effects
  // ═══════════════════════════════════════════

  // 1. Load producers + user data
  useEffect(() => {
    const fetchProducersAndUser = async () => {
      try {
        const [prodRes, balanceRes, ownedRes] = await Promise.all([
          fetch('/api/producers'),
          fetch('/api/user/balance', { credentials: 'include' }),
          fetch('/api/user-producers', { credentials: 'include' }),
        ]);

        const data = await prodRes.json();
        const balanceData = await balanceRes.json();
        const ownedData = await ownedRes.json();

        let plan = 'Free';
        if (balanceData && balanceData.plan) {
          plan = balanceData.plan;
          setUserPlan(plan);
        }

        let ownedIds: string[] = [];
        if (Array.isArray(ownedData)) {
          ownedIds = ownedData.map((item: any) => item.producer_id);
          setOwnedProducerIds(ownedIds);
        }

        if (Array.isArray(data)) {
          const saved = localStorage.getItem('firedProducers');
          let firedList: string[] = [];
          if (saved) {
            try {
              firedList = JSON.parse(saved);
            } catch (e) {}
          }

          // De-duplicate data by ID
          const uniqueRawData = Array.from(
            new Map(data.map((item: any) => [item.id, item])).values()
          );

          // Filter ONLY by fired status
          let activeData = uniqueRawData.filter(
            (d: any) => !firedList.includes(d.id)
          );

          if (activeData.length === 0 && uniqueRawData.length > 0) {
            activeData = [uniqueRawData[0]];
          }

          const mapped = activeData.map((found: any) => {
            const theme =
              typeof found.theme_config === 'string'
                ? JSON.parse(found.theme_config || '{}')
                : found.theme_config || {};

            // Calculate access and locked status
            const isOwned = ownedIds.includes(found.id);
            const tier = found.tier || 'basic';
            const isFreeTier =
              tier === 'basic' || tier === 'free' || found.price_coins === 0;
            const hasVipPlan = plan === 'VIP' || plan === 'Legend';
            const hasLegendPlan = plan === 'Legend';

            const canAccess =
              isOwned ||
              isFreeTier ||
              (tier === 'vip' && hasVipPlan) ||
              (tier === 'legend' && hasLegendPlan);

            return {
              id: found.id,
              name: found.name,
              badge: found.badge,
              icon: found.icon,
              img: found.img || '',
              gradient: found.gradient,
              buttonGradient: found.button_gradient,
              placeholder: found.placeholder,
              tier: found.tier,
              isLocked: !canAccess,
              is_on_main_page: found.is_on_main_page,
              colorText: theme.colorText || 'text-primary',
              colorBorder: theme.colorBorder || 'border-primary',
              colorBg: theme.colorBg || 'bg-primary',
              colorBorder80: theme.colorBorder80 || 'border-primary/80',
              colorShadow30: theme.colorShadow30 || 'shadow-primary/30',
              colorBg10: theme.colorBg10 || 'bg-primary/10',
              colorBg5: theme.colorBg5 || 'bg-primary/5',
              colorBorder20: theme.colorBorder20 || 'border-primary/20',
              initMsg: found.init_msg || 'Cześć! O czym robimy hit?',
              headerTitle: found.header_title || found.name,
              headerStatus: found.header_status || 'Gotowy do pracy',
              typingMsg:
                found.typing_msg || 'Kminie nad bitem...;Szukam brzmienia...',
              aiModelPromptId: found.id,
              elevenlabsVoice: theme.elevenlabs_voice || null,
            };
          });

          // Sort producers: Unlocked first, then Locked
          mapped.sort((a: any, b: any) => {
            if (a.isLocked === b.isLocked) return 0;
            return a.isLocked ? 1 : -1;
          });
          setProducers(mapped);

          // Check URL query parameter first
          const queryAgent = new URLSearchParams(location.search).get('agent');
          let selectedAgent = '';

          if (queryAgent && mapped.some((p: any) => p.id === queryAgent)) {
            selectedAgent = queryAgent;
            localStorage.setItem('active_agent', queryAgent);
            console.log('[Generator] Set active agent from URL:', queryAgent);
          } else {
            const lastActive = localStorage.getItem('active_agent');
            if (lastActive && mapped.some((p: any) => p.id === lastActive)) {
              selectedAgent = lastActive;
            } else {
              const firstMain =
                mapped.find((p: any) => p.is_on_main_page) || mapped[0];
              selectedAgent = firstMain?.id || '';
            }
          }

          if (selectedAgent) {
            setActiveAgent(selectedAgent);
          }
        }
      } catch (err) {
        console.error('[Generator] Error fetching producers/user:', err);
      }
    };

    fetchProducersAndUser();
  }, [location.search]);

  // 2. Set initial message when active producer changes
  useEffect(() => {
    if (activeProducer && messages.length === 0) {
      setMessages([{ role: 'assistant', content: activeProducer.initMsg }]);
    }
  }, [activeProducer]);

  // 3. Typing thought animation
  useEffect(() => {
    if (!isAssistantTyping || !activeProducer) {
      setCurrentThought('');
      return;
    }
    const producerThoughts = (
      activeProducer.typingMsg ||
      'Kminie nad bitem...;Szukam brzmienia...;Prawie gotowe! 🎵'
    )
      .split(';')
      .filter((t: string) => t.trim().length > 0);
    const agentThoughts = producerThoughts.map(
      (t: string) => `${activeProducer.name || 'Wykonawca'}: ${t.trim()}`
    );
    setCurrentThought(agentThoughts[0]);
    let i = 1;
    const interval = setInterval(() => {
      setCurrentThought(agentThoughts[i % agentThoughts.length]);
      i++;
    }, 2500);
    return () => clearInterval(interval);
  }, [isAssistantTyping, activeProducer]);

  // 4. Speech recognition init
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'pl-PL';
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setChatInput(prev => prev + (prev ? ' ' : '') + transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // 5. Import text from location.state
  useEffect(() => {
    if (location.state?.importedLyrics) {
      setFinalAiPrompt({
        lyrics: location.state.importedLyrics,
        tags: location.state.importedTags || '',
      });
      if (location.state.importedTitle) {
        setTitle(location.state.importedTitle);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 6. Chat auto-scroll
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isChatLoading, isAssistantTyping, finalAiPrompt]);

  // 7. Close producer panel on outside click
  useEffect(() => {
    if (!isProducerPanelOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-producer-dropdown]')) {
        setIsProducerPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isProducerPanelOpen]);

  // ═══════════════════════════════════════════
  //  Handlers
  // ═══════════════════════════════════════════

  const handleProducerSelect = useCallback((p: any) => {
    setActiveAgent(p.id);
    localStorage.setItem('active_agent', p.id);
    setMessages([{ role: 'assistant', content: p.initMsg }]);
    setFinalAiPrompt(null);
    setChatInput('');
    // Scroll down to chat area only on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        chatContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert(
        'Twoja przeglądarka nie obsługuje rozpoznawania mowy. Spróbuj użyć Chrome.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleVoiceResponse = () => {
    if (userPlan !== 'VIP' && userPlan !== 'Legend') {
      alert(
        '🔇 Głosowe odpowiedzi (czytanie na głos) są dostępne tylko w pakiecie VIP lub Legend!'
      );
      return;
    }
    if (isVoiceResponseEnabled) {
      if ((window as any).globalAudio) {
        try {
          (window as any).globalAudio.pause();
        } catch (e) {}
      }
    }
    setIsVoiceResponseEnabled(prev => !prev);
  };

  const handleFileAttach = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          alert(
            'Plik jest za duży! Maksymalny rozmiar: 10MB'
          );
          return;
        }
        setAttachedFile(file);
      }
      if (e.target) e.target.value = '';
    },
    []
  );

  const removeAttachedFile = useCallback(() => {
    setAttachedFile(null);
  }, []);

  const handlePlayTTS = async (text: string, voice: string, index: number) => {
    // No voice configured — silently ignore
    if (!voice) return;
    if (playingMsgIndex === index) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingMsgIndex(null);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setLoadingTtsIndex(index);
    setPlayingMsgIndex(null);

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: voice || 'Rachel' }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        audio.play();
        setPlayingMsgIndex(index);
        audio.onended = () => {
          setPlayingMsgIndex(null);
        };
      } else {
        alert('Głos niedostępny.');
      }
    } catch (err) {
      console.error(err);
      alert('Błąd generowania głosu.');
    } finally {
      setLoadingTtsIndex(null);
    }
  };

  const handleSendMessage = async () => {
    if (
      (!chatInput.trim() && !attachedFile) ||
      isChatLoading ||
      !activeProducer
    )
      return;

    const userMsg = chatInput.trim();
    const fileMsg = attachedFile
      ? `[Załączono plik: ${attachedFile.name}]`
      : '';
    const fullUserMsg = [userMsg, fileMsg].filter(Boolean).join(' ');

    setChatInput('');
    setAttachedFile(null);
    setMessages(prev => [...prev, { role: 'user', content: fullUserMsg }]);
    setIsChatLoading(true);
    setIsAssistantTyping(true);

    try {
      const apiMessages = [
        ...messages,
        { role: 'user', content: fullUserMsg },
      ];
      const apiAgentName = activeProducer.aiModelPromptId || activeAgent;

      const res = await fetch('/api/chat-composer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messages: apiMessages, agent: apiAgentName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd API');

      const reply = data.content;
      const lyricsRegex =
        /---LYRICS---\s*([\s\S]*?)\s*---END_LYRICS---/;
      const tagsRegex = /---TAGS---\s*([\s\S]*?)\s*---END_TAGS---/;
      const titleRegex = /---TITLE---\s*([\s\S]*?)\s*---END_TITLE---/;

      const lyricsMatch = reply.match(lyricsRegex);
      const tagsMatch = reply.match(tagsRegex);
      const titleMatch = reply.match(titleRegex);

      if (lyricsMatch && tagsMatch) {
        setFinalAiPrompt({
          lyrics: lyricsMatch[1].trim(),
          tags: tagsMatch[1].trim(),
        });
        if (titleMatch)
          setTitle(titleMatch[1].trim().replace(/['"]/g, ''));
        const cleanReply = reply
          .replace(lyricsRegex, '')
          .replace(tagsRegex, '')
          .replace(titleRegex, '')
          .trim();
        if (cleanReply) {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: cleanReply },
          ]);
          if (isVoiceResponseEnabled) {
            try {
              const voice =
                activeProducer.elevenlabsVoice || 'River';

              const ttsRes = await fetch('/api/tts/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ text: cleanReply, voice }),
              });
              const ttsData = await ttsRes.json();
              if (ttsRes.ok && ttsData.audioUrl) {
                if ((window as any).globalAudio) {
                  try {
                    (window as any).globalAudio.pause();
                  } catch (e) {}
                }
                const audio = new Audio(ttsData.audioUrl);
                (window as any).globalAudio = audio;
                audio.play();
              }
            } catch (e) {
              console.error('TTS failed:', e);
            }
          }
        }
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: reply },
        ]);
        if (isVoiceResponseEnabled) {
          try {
            const voice =
              activeProducer.elevenlabsVoice || 'River';

            const ttsRes = await fetch('/api/tts/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ text: reply, voice }),
            });
            const ttsData = await ttsRes.json();
            if (ttsRes.ok && ttsData.audioUrl) {
              if ((window as any).globalAudio) {
                try {
                  (window as any).globalAudio.pause();
                } catch (e) {}
              }
              const audio = new Audio(ttsData.audioUrl);
              (window as any).globalAudio = audio;
              audio.play();
            }
          } catch (e) {
            console.error('TTS failed:', e);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(
        'Błąd połączenia z serwerem.'
      );
    } finally {
      setIsChatLoading(false);
      setIsAssistantTyping(false);
    }
  };

  const handleRegeneratePrompt = async () => {
    if (!activeProducer || isRegenerating) return;
    setIsRegenerating(true);
    setIsAssistantTyping(true);
    try {
      const apiAgentName = activeProducer.aiModelPromptId || activeAgent;
      const res = await fetch('/api/chat-composer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: messages,
          agent: apiAgentName,
          regenerate: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd API');

      const reply = data.content;
      const lyricsRegex =
        /---LYRICS---\s*([\s\S]*?)\s*---END_LYRICS---/;
      const tagsRegex = /---TAGS---\s*([\s\S]*?)\s*---END_TAGS---/;
      const titleRegex = /---TITLE---\s*([\s\S]*?)\s*---END_TITLE---/;

      const lyricsMatch = reply.match(lyricsRegex);
      const tagsMatch = reply.match(tagsRegex);
      const titleMatch = reply.match(titleRegex);

      if (lyricsMatch && tagsMatch) {
        setFinalAiPrompt({
          lyrics: lyricsMatch[1].trim(),
          tags: tagsMatch[1].trim(),
        });
        if (titleMatch)
          setTitle(titleMatch[1].trim().replace(/['"]/g, ''));
        const cleanReply = reply
          .replace(lyricsRegex, '')
          .replace(tagsRegex, '')
          .replace(titleRegex, '')
          .trim();
        if (cleanReply) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content:
                'Wygenerowałem alternatywną wersję tekstu. Sprawdź poniżej!',
            },
          ]);
        }
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: reply },
        ]);
      }
    } catch (err: any) {
      console.error(err);
      alert(
        'Błąd podczas regeneracji promptu.'
      );
    } finally {
      setIsRegenerating(false);
      setIsAssistantTyping(false);
    }
  };

  const handleEditPrompt = () => {
    if (!finalAiPrompt) return;
    setIsEditingPrompt(true);
    setEditedLyrics(finalAiPrompt.lyrics);
  };

  const handleSaveEdit = () => {
    if (!finalAiPrompt) return;
    setFinalAiPrompt({ ...finalAiPrompt, lyrics: editedLyrics });
    setIsEditingPrompt(false);
  };

  const handleCancelEdit = () => {
    setIsEditingPrompt(false);
    setEditedLyrics('');
  };

  const handleGenerate = async () => {
    if (!finalAiPrompt) {
      alert('Musisz najpierw wygenerować prompt!');
      return;
    }

    if (!isSignedIn && !guestEmail.trim()) {
      alert(
        'Jako gość musisz podać adres e-mail, abyśmy wiedzieli komu przypisać utwór!'
      );
      return;
    }

    if (!isSignedIn && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      alert('Podaj poprawny adres e-mail.');
      return;
    }

    if (currencyType === 'fiat') {
      alert(
        'Moduł płatności elektronicznych (BLIK / Przelewy24) w przygotowaniu! Tymczasem użyj monet lub not.'
      );
      return;
    }

    let finalTitle = title.trim();
    if (!finalTitle) {
      finalTitle =
        finalAiPrompt.lyrics.trim().split(' ').slice(0, 4).join(' ') +
        '...';
      setTitle(finalTitle);
    }

    setIsLoading(true);

    // Prompt user for next hit and hide the payment/prompt panel so they can continue chatting
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: `Zaczynamy magię w studiu! 🎛️ Twój utwór właśnie się generuje i zajmie to około 1-3 minuty.\n\nW międzyczasie, może zrobimy kolejny hit? Jaka okazja jest następna: Urodziny? Rocznica? A może piosenka do auta? 😎`
      }
    ]);
    
    // We capture these values right before clearing them from state
    const promptLyricsToGenerate = finalAiPrompt.lyrics;
    const promptTagsToGenerate = finalAiPrompt.tags;
    
    setFinalAiPrompt(null);
    setTitle('');

    try {
      const sunoRes = await fetch('/api/suno/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prompt: promptLyricsToGenerate,
          title: finalTitle,
          tags: promptTagsToGenerate,
          instrumental: false,
          model: 'V5_5',
          customMode: true,
          personaId: activeProducer.id,
          email: !isSignedIn ? guestEmail.trim() : undefined,
        }),
      });

      const sunoData = await sunoRes.json();
      if (!sunoRes.ok) {
        if (
          sunoRes.status === 403 &&
          sunoData.error === 'LIMIT_REACHED'
        ) {
          setShowGuestLimitModal(true);
          setIsLoading(false);
          return;
        }
        throw new Error(
          sunoData.error || 'Błąd API Kie.ai'
        );
      }
      if (!sunoData.taskId)
        throw new Error('Nie otrzymano ID zadania');

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
        const statusRes = await fetch(
          `/api/suno/status/${queryId}`,
          { credentials: 'include' }
        );
        const statusData = await statusRes.json();
        lastStatusData = statusData;

        if (!statusRes.ok)
          throw new Error(
            statusData.error ||
              'Błąd statusu zadania'
          );

        if (
          statusData.status === 'completed' ||
          statusData.status === 'complete' ||
          statusData.audio_url ||
          (statusData.variants && statusData.variants.length > 0)
        ) {
          audio_url =
            statusData.audio_url ||
            (statusData.variants
              ? statusData.variants[0].audio_url
              : '');
          if (audio_url || statusData.variants) break;
        } else if (
          statusData.status === 'error' ||
          statusData.status === 'failed'
        ) {
          throw new Error(
            'Błąd serwera generującego (kie.ai)'
          );
        }
        attempts++;
      }

      if (
        !audio_url &&
        (!lastStatusData || !lastStatusData.variants)
      ) {
        throw new Error(
          'Przekroczono limit czasu oczekiwania na utwór (~12 min)'
        );
      }

      const payload = {
        title: finalTitle,
        description: promptLyricsToGenerate,
        currency_type: currencyType,
        audio_url: audio_url,
        variants: lastStatusData?.variants || [],
        kie_task_id: sunoData.dbId || null,
      };

      const res = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error ||
            'Wystąpił nieznany błąd serwera'
        );
      }

      setShowSuccessModal(true);
      window.dispatchEvent(new Event('updateBalance'));
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Gotowe! 🎶 Twoje utwory (V1 i V2) są już w panelu **Moje Utwory**.`,
        },
      ]);
    } catch (err: any) {
      alert(`Błąd: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════
  //  Return value
  // ═══════════════════════════════════════════

  return {
    // States
    producers,
    activeAgent,
    userPlan,
    ownedProducerIds,
    title,
    isLoading,
    currencyType,
    messages,
    playingMsgIndex,
    loadingTtsIndex,
    chatInput,
    isChatLoading,
    isAssistantTyping,
    currentThought,
    finalAiPrompt,
    isEditingPrompt,
    editedLyrics,
    isRegenerating,
    attachedFile,
    isListening,
    isVoiceResponseEnabled,
    isProducerPanelOpen,
    guestEmail,
    showGuestLimitModal,
    showSuccessModal,
    isActionMenuOpen,
    // Computed
    activeProducer,
    // Refs
    audioRef,
    chatContainerRef,
    fileInputRef,
    chatEndRef,
    recognitionRef,
    // State setters
    setChatInput,
    setTitle,
    setCurrencyType,
    setIsProducerPanelOpen,
    setGuestEmail,
    setShowGuestLimitModal,
    setShowSuccessModal,
    setIsActionMenuOpen,
    setEditedLyrics,
    setFinalAiPrompt,
    setMessages,
    // Handlers
    handleProducerSelect,
    handleMicClick,
    toggleVoiceResponse,
    handleFileAttach,
    handleFileChange,
    removeAttachedFile,
    handlePlayTTS,
    handleSendMessage,
    handleRegeneratePrompt,
    handleEditPrompt,
    handleSaveEdit,
    handleCancelEdit,
    handleGenerate,
  };
}
