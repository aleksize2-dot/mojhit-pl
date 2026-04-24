import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChatMessage } from '../components/ChatMessage';

export function Wsparcie() {
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/api-settings')
      .then(res => res.json())
      .then(data => {
        if (data.supportAgent) {
          setConfig(data.supportAgent);
          setMessages([{
            role: 'assistant', 
            content: 'Cześć! Jestem asystentem wsparcia mojhit.pl. W czym mogę Ci dzisiaj pomóc?'
          }]);
        }
      })
      .catch(() => {
        setMessages([{role: 'assistant', content: 'Witaj we wsparciu! Opowiedz o swoim problemie.'}]);
      });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      
      if (!res.ok) throw new Error('Błąd serwera');
      const data = await res.json();
      
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Przepraszam, wystąpił błąd w systemie. Proszę napisać do nas na email: pomoc@mojhit.pl' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = config?.suggestedQuestions 
    ? config.suggestedQuestions.split(',').map((q: string) => q.trim()).filter((q: string) => q)
    : [];

  return (
    <div className="max-w-3xl mx-auto mt-6 animate-in fade-in duration-500 flex flex-col h-[80vh]">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold headline-font">{config?.agentName || "Centrum Wsparcia AI"}</h2>
          <p className="text-on-surface-variant text-sm font-label">Nasz wirtualny doradca pomoże rozwiązać Twoje problemy</p>
        </div>
      </div>

      <div className="flex-1 bg-surface-container-low rounded-3xl border border-outline-variant/20 flex flex-col overflow-hidden shadow-xl">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            const agentName = config?.agentName || "Asystent Wsparcia";
            const agentImg = config?.agentAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=support";
            
            return (
              <div key={i} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-outline-variant/20 ${isUser ? 'bg-primary text-on-primary' : 'bg-surface-container'}`}>
                  {isUser ? (
                    <span className="material-symbols-outlined">person</span>
                  ) : (
                    <img src={agentImg} alt="Agent" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs font-bold text-on-surface-variant mb-1 ml-1">
                    {isUser ? 'Ty' : agentName}
                  </span>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${isUser ? 'bg-primary text-on-primary rounded-tr-none' : 'bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/10'}`}>
                    <ChatMessage content={m.content} isUser={isUser} />
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
             <div className="flex justify-start">
               <div className="bg-surface-container-high rounded-2xl p-4 rounded-tl-none animate-pulse">
                 <span className="material-symbols-outlined text-primary animate-spin">cycle</span>
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {suggestedQuestions.length > 0 && messages.length <= 2 && !isLoading && (
          <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-outline-variant/10">
            {suggestedQuestions.map((q: string, i: number) => (
              <button 
                key={i}
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 text-xs font-bold bg-surface-container border border-tertiary/20 text-tertiary rounded-full hover:bg-tertiary hover:text-on-tertiary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 bg-surface-container border-t border-outline-variant/20">
          <div className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend(input)}
              placeholder="Zadaj pytanie..."
              className="w-full bg-background border border-outline-variant/30 rounded-full pl-6 pr-14 py-4 text-on-surface focus:outline-none focus:border-primary transition-colors"
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
