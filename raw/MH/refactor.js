const fs = require('fs');
let code = fs.readFileSync('c:/Users/Admin/.openclaw/workspace/raw/MH/client/src/components/Generator.tsx', 'utf8');

// 1. Replace the state and useEffect for dynamicGuest with producers
code = code.replace(/const \[dynamicGuest, setDynamicGuest\].*?\n\s+useEffect\(\(\) => \{[\s\S]*?\}\, \[\]\);\n\n\s+const guest = dynamicGuest;/, `const [producers, setProducers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/producers')
      .then(r => r.json())
      .then(data => {
         if(Array.isArray(data) && data.length > 0) {
            const mapped = data.map(found => {
              const theme = typeof found.theme_config === 'string' ? JSON.parse(found.theme_config || '{}') : (found.theme_config || {});
              return {
                 id: found.id,
                 name: found.name,
                 badge: found.badge,
                 icon: found.icon,
                 img: found.img,
                 gradient: found.gradient,
                 buttonGradient: found.button_gradient,
                 placeholder: found.placeholder,
                 tier: found.tier,
                 is_on_main_page: found.is_on_main_page,
                 colorText: theme.colorText || 'text-primary',
                 colorBorder: theme.colorBorder || 'border-primary',
                 colorBg: theme.colorBg || 'bg-primary',
                 colorBorder80: theme.colorBorder80 || 'border-primary/80',
                 colorShadow30: theme.colorShadow30 || 'shadow-primary/30',
                 colorBg10: theme.colorBg10 || 'bg-primary/10',
                 colorBg5: theme.colorBg5 || 'bg-primary/5',
                 colorBorder20: theme.colorBorder20 || 'border-primary/20',
                 initMsg: found.init_msg,
                 headerTitle: found.header_title,
                 headerStatus: found.header_status,
                 typingMsg: found.typing_msg,
                 aiModelPromptId: found.id
              };
            });
            setProducers(mapped);
            
            // Set initial active agent
            const lastActive = localStorage.getItem('active_agent');
            if (lastActive && mapped.some(p => p.id === lastActive)) {
               setActiveAgent(lastActive);
            } else {
               const firstMain = mapped.find(p => p.is_on_main_page) || mapped[0];
               setActiveAgent(firstMain.id);
            }
         }
      })
      .catch(console.error);
  }, []);

  const activeProducer = producers.find(p => p.id === activeAgent) || producers[0];`);

// 2. Remove activeAgent default state
code = code.replace(/const \[activeAgent, setActiveAgent\] = useState<[^>]+>\('cj_remi'\);/, `const [activeAgent, setActiveAgent] = useState<string>('');`);

// 3. Fix useEffect for thoughts
code = code.replace(/const guestThoughts = [\s\S]*?const agentThoughts = [^;]+;/, `const producerThoughts = (activeProducer?.typingMsg || 'Kminie nad bitem...;Szukam brzmienia...;Prawie gotowe! 🎵').split(';').filter((t: string) => t.trim().length > 0);
    const agentThoughts = producerThoughts.map((t: string) => \`\${activeProducer?.name || 'Producent'}: \${t.trim()}\`);`);
code = code.replace(/\[isAssistantTyping, activeAgent, guest\?\.name, guest\?\.typingMsg\]/, `[isAssistantTyping, activeAgent, activeProducer?.name, activeProducer?.typingMsg]`);

// 4. Update dynamic rendering of Agents Line-up
const agentsLineupRegex = /\{\/\* Agents Line-up \*\/\}[\s\S]*?<div className="relative group mt-6 max-w-4xl mx-auto">/;
const newAgentsLineup = `{/* Agents Line-up */}
      <div className="flex justify-center items-stretch gap-4 md:gap-8 mb-8 w-full max-w-4xl mx-auto px-4">
        
        {/* FREE & BASIC */}
        <div 
          className={\`relative border-2 border-outline-variant/30 rounded-3xl transition-all duration-300 bg-surface/50 \${mobileActiveTier === 'basic' ? 'p-5 pt-6 flex flex-nowrap justify-center gap-2 sm:gap-4 md:gap-8 flex-1 md:flex-none' : 'w-[72px] md:w-auto md:p-5 md:pt-6 flex justify-center flex-col items-center p-2 shrink-0 opacity-60 hover:opacity-100 cursor-pointer md:cursor-default'}\`}
          onClick={() => { if (mobileActiveTier !== 'basic') setMobileActiveTier('basic'); }}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap hidden md:block">Free & Basic</div>
          {mobileActiveTier === 'basic' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap md:hidden">Free & Basic</div>}

          {/* Children visible if basic is active OR on desktop */}
          <div className={\`flex flex-nowrap justify-center gap-2 sm:gap-4 md:gap-8 w-full \${mobileActiveTier === 'basic' ? 'flex' : 'hidden md:flex'}\`}>
            {producers.filter(p => p.is_on_main_page && p.tier === 'Free & Basic').map(p => (
              <button key={p.id} onClick={() => { setActiveAgent(p.id); localStorage.setItem('active_agent', p.id); setMessages([{role: 'assistant', content: p.initMsg}]); setFinalAiPrompt(null); setChatInput(''); }} className={\`flex flex-col items-center gap-3 transition-transform \${activeAgent === p.id ? 'scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}\`}>
                 <div className={\`w-16 h-16 md:w-20 md:h-20 rounded-full relative flex items-center justify-center shadow-lg border-4 transition-all duration-300 overflow-hidden \${activeAgent === p.id ? \`\${p.colorBorder80} \${p.colorShadow30} scale-110\` : 'border-transparent shadow-none grayscale-[70%]'}\`}>
                    <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover max-w-none" onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }} />
                    <div style={{ display: 'none' }} className="z-10 w-full h-full bg-surface-container-high text-on-surface flex items-center justify-center material-symbols-outlined text-3xl">{p.icon}</div>
                 </div>
                 <span className={\`text-xs font-bold font-label uppercase tracking-widest \${activeAgent === p.id ? p.colorText : 'text-on-surface-variant'}\`}>{p.name}</span>
                 <span className={\`text-[9px] md:text-[10px] uppercase font-bold px-2 py-1 rounded-md \${activeAgent === p.id ? \`\${p.colorBg10} \${p.colorText}\` : 'hidden'}\`}>{p.badge}</span>
              </button>
            ))}

            {producers.filter(p => p.is_on_main_page && p.tier === 'Free & Basic').length === 0 && (
              <button className="flex flex-col items-center gap-3 transition-transform opacity-40 cursor-not-allowed grayscale">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-full relative flex items-center justify-center shadow-lg border-2 border-outline-variant/30 transition-all duration-300 overflow-hidden bg-surface-container-high">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">add</span>
                 </div>
                 <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Wkrótce</span>
              </button>
            )}
          </div>

          {/* Collapsed view for Mobile only */}
          {mobileActiveTier !== 'basic' && (
            <div className="flex md:hidden flex-col items-center justify-center h-full gap-2 mt-1">
              <div className="w-10 h-10 rounded-full border-2 border-outline-variant/50 flex items-center justify-center bg-surface-container-high">
                <span className="material-symbols-outlined text-outline-variant text-[20px]">person</span>
              </div>
              <span className="text-[9px] font-bold uppercase text-on-surface-variant">Basic</span>
            </div>
          )}
        </div>

        {/* PRO */}
        <div 
          className={\`relative border-2 border-tertiary/40 rounded-3xl bg-tertiary/5 transition-all duration-300 \${mobileActiveTier === 'pro' ? 'p-5 pt-6 flex flex-nowrap items-center justify-center gap-2 sm:gap-4 md:gap-8 flex-1' : 'w-[72px] md:w-auto md:p-5 md:pt-6 md:flex-1 flex justify-center flex-col items-center p-2 shrink-0 opacity-60 hover:opacity-100 cursor-pointer md:cursor-default'}\`}
          onClick={() => { if (mobileActiveTier !== 'pro') setMobileActiveTier('pro'); }}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-3 text-[10px] font-bold uppercase tracking-widest text-tertiary whitespace-nowrap hidden md:flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">star</span> Pro
          </div>
          {mobileActiveTier === 'pro' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-3 text-[10px] font-bold uppercase tracking-widest text-tertiary whitespace-nowrap md:hidden flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">star</span> Pro
            </div>
          )}
          
          {/* Children visible if pro is active OR on desktop */}
          <div className={\`flex flex-nowrap justify-center gap-2 sm:gap-4 md:gap-8 w-full \${mobileActiveTier === 'pro' ? 'flex' : 'hidden md:flex'}\`}>
            {producers.filter(p => p.is_on_main_page && p.tier === 'Pro').map(p => (
              <button key={p.id} onClick={() => { setActiveAgent(p.id); localStorage.setItem('active_agent', p.id); setMessages([{role: 'assistant', content: p.initMsg}]); setFinalAiPrompt(null); setChatInput(''); }} className={\`flex flex-col items-center gap-3 transition-transform \${activeAgent === p.id ? 'scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}\`}>
                 <div className={\`w-16 h-16 md:w-20 md:h-20 rounded-full relative flex items-center justify-center shadow-lg border-4 transition-all duration-300 overflow-hidden \${activeAgent === p.id ? \`\${p.colorBorder80} \${p.colorShadow30} scale-110\` : 'border-transparent shadow-none grayscale-[70%]'}\`}>
                    <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover max-w-none" onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }} />
                    <div style={{ display: 'none' }} className="z-10 w-full h-full bg-surface-container-high text-on-surface flex items-center justify-center material-symbols-outlined text-3xl">{p.icon}</div>
                 </div>
                 <span className={\`text-xs font-bold font-label uppercase tracking-widest \${activeAgent === p.id ? p.colorText : 'text-on-surface-variant'}\`}>{p.name}</span>
                 <span className={\`text-[9px] md:text-[10px] uppercase font-bold px-2 py-1 rounded-md \${activeAgent === p.id ? \`\${p.colorBg10} \${p.colorText}\` : 'hidden'}\`}>{p.badge}</span>
              </button>
            ))}

            {/* Guest Producers Link */}
            <Link to="/biuro-producentow" className="flex flex-col items-center gap-3 transition-transform opacity-80 hover:opacity-100 hover:scale-105 group">
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-full relative flex items-center justify-center shadow-lg border-2 border-tertiary transition-all duration-300 bg-surface-container-high overflow-hidden group-hover:shadow-tertiary/40 group-hover:border-tertiary/80">
                  <img src="/avatars/gielda.webp" alt="Giełda Talentów" className="absolute inset-0 w-full h-full object-cover max-w-none transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-tertiary/20 group-hover:bg-transparent transition-colors duration-300"></div>
               </div>
               <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant group-hover:text-[#ff9064] text-center leading-tight">Giełda<br/>Talentów</span>
               <span className="text-[9px] md:text-[10px] uppercase font-bold px-2 py-1 rounded-md bg-[#ff9064]/10 text-[#ff9064] opacity-0 group-hover:opacity-100 transition-opacity">Pakiety</span>
            </Link>
          </div>

          {/* Collapsed view for Mobile only */}
          {mobileActiveTier !== 'pro' && (
            <div className="flex md:hidden flex-col items-center justify-center h-full gap-2 mt-1">
              <div className="w-10 h-10 rounded-full border-2 border-tertiary/40 bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-[20px]">star</span>
              </div>
              <span className="text-[9px] font-bold uppercase text-tertiary">Pro</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative group mt-6 max-w-4xl mx-auto">`;

code = code.replace(agentsLineupRegex, newAgentsLineup);

// Replace all activeAgent === 'melo_mc' logic
code = code.replace(/activeAgent === 'melo_mc' \? 'from-pink-500 to-rose-400' : \(activeAgent === 'guest' \? guest\.gradient : 'from-primary to-tertiary'\)/g, 'activeProducer?.gradient');
code = code.replace(/activeAgent === 'melo_mc' \? 'border-pink-500 shadow-pink-500\/20' : \(activeAgent === 'guest' \? \`\$\{guest\.colorBorder\} \$\{guest\.colorShadow30\}\` : 'border-primary shadow-primary\/20'\)/g, '\`\${activeProducer?.colorBorder} \${activeProducer?.colorShadow30}\`');
code = code.replace(/activeAgent === 'guest' \? guest\.img : \(activeAgent === 'cj_remi' \? '\/avatars\/remi\.webp' : '\/avatars\/melo\.webp'\)/g, 'activeProducer?.img');
code = code.replace(/activeAgent === 'melo_mc' \? 'text-pink-500' : \(activeAgent === 'guest' \? guest\.colorText : 'text-primary'\)/g, 'activeProducer?.colorText');
code = code.replace(/activeAgent === 'melo_mc' \? 'favorite' : \(activeAgent === 'guest' \? guest\.icon : 'headphones'\)/g, 'activeProducer?.icon');
code = code.replace(/activeAgent === 'melo_mc' \? 'MELO MC \(Twoja Muza\)' : \(activeAgent === 'guest' \? guest\.headerTitle : 'CJ Remi \(AI Producer\)'\)/g, 'activeProducer?.headerTitle');
code = code.replace(/activeAgent === 'melo_mc' \? 'Online • Gotowa by słuchać' : \(activeAgent === 'guest' \? guest\.headerStatus : 'Online • Gotowy do miksu'\)/g, 'activeProducer?.headerStatus');
code = code.replace(/activeAgent === 'guest' \? guest\.initMsg : CORE_PRODUCERS_INIT_MESSAGES\[activeAgent as keyof typeof CORE_PRODUCERS_INIT_MESSAGES\]\.content/g, 'activeProducer?.initMsg');
code = code.replace(/activeAgent === 'melo_mc' \? 'border-pink-400' : \(activeAgent === 'guest' \? guest\.colorBorder : 'border-primary'\)/g, 'activeProducer?.colorBorder');
code = code.replace(/activeAgent === 'melo_mc' \? 'bg-pink-600 text-white rounded-tr-sm' : \(activeAgent === 'guest' \? \`\$\{guest\.colorBg\} text-white rounded-tr-sm\` : 'bg-primary text-on-primary rounded-tr-sm'\)/g, '\`\${activeProducer?.colorBg} text-white rounded-tr-sm\`');
code = code.replace(/activeAgent === 'melo_mc' \? 'bg-pink-500' : \(activeAgent === 'guest' \? guest\.colorBg : 'bg-primary'\)/g, 'activeProducer?.colorBg');
code = code.replace(/activeAgent === 'melo_mc' \? 'bg-pink-500\/5 border-pink-500\/20' : \(activeAgent === 'guest' \? \`\$\{guest\.colorBg5\} \$\{guest\.colorBorder20\}\` : 'bg-primary\/5 border-primary\/20'\)/g, '\`\${activeProducer?.colorBg5} \${activeProducer?.colorBorder20}\`');
code = code.replace(/currentThought \|\| \(activeAgent === 'melo_mc' \? 'MELO MC nasłuchuje\.\.\.' : \(activeAgent === 'guest' \? guest\.typingMsg : 'CJ Remi pisze\.\.\.'\)\)/g, 'currentThought || activeProducer?.typingMsg');
code = code.replace(/activeAgent === 'melo_mc' \? 'linear-gradient\(45deg, #f43f5e, #be185d, #f43f5e\)' : \(activeAgent === 'guest' \? guest\.buttonGradient : 'linear-gradient\(45deg, #ff9064, #734bbd, #ff9064\)'\)/g, 'activeProducer?.buttonGradient');
code = code.replace(/activeAgent === 'melo_mc' \? "Opisz swoje uczucia, komu dedykujesz utwór\.\.\." : \(activeAgent === 'guest' \? guest\.placeholder : "Podaj temat, rzuć pomysłem, odpisz Markowi\.\.\."\)/g, 'activeProducer?.placeholder');
code = code.replace(/activeAgent === 'melo_mc' \? 'bg-pink-500 text-white hover:bg-pink-600 hover:shadow-lg active:scale-95' : \(activeAgent === 'guest' \? \`\$\{guest\.colorBg\} text-white hover:opacity-90 hover:shadow-lg active:scale-95\` : 'bg-primary text-on-primary hover:bg-primary-dark hover:shadow-lg active:scale-95'\)/g, '\`\${activeProducer?.colorBg} text-white hover:opacity-90 hover:shadow-lg active:scale-95\`');

// Replace API chat agent ID
code = code.replace(/const apiAgentName = activeAgent === 'guest' \? guest\.aiModelPromptId : activeAgent;/, 'const apiAgentName = activeProducer?.aiModelPromptId || activeAgent;');

code = code.replace(/return \(\n    <section className="space-y-6">/, `if (!producers.length) return <div className="p-8 flex justify-center"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div>;

  return (
    <section className="space-y-6">`);


fs.writeFileSync('c:/Users/Admin/.openclaw/workspace/raw/MH/client/src/components/Generator.tsx', code);
