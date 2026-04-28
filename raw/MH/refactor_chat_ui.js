const fs = require('fs');
let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

const oldChatLogic = `<div key={idx} className={\`flex gap-3 max-w-[90%] md:max-w-[80%] \${m.role === 'user' ? 'self-end flex-row-reverse' : ''}\`}>
                    {m.role === 'assistant' && (
                      <div className="relative flex-shrink-0 mt-1">
                        {/* Tier Badge (Centered Above) */}
                        
                        
                        <div className={\`w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 relative flex items-center justify-center bg-surface-container-low \${activeProducer.colorBorder}\`}>
                          <img src={activeProducer.img} alt={activeProducer.name} className="absolute inset-0 w-full h-full object-cover max-w-none" onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }} />
                          <div style={{ display: 'none' }} className={\`relative z-10 material-symbols-outlined text-lg items-center justify-center \${activeProducer.colorText}\`}>
                             {activeProducer.icon}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={\`p-4 rounded-2xl text-sm md:text-base font-body shadow-sm leading-relaxed \${m.role === 'user' ? \`\${activeProducer.colorBg} text-white rounded-tr-sm\` : 'bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/10'}\`}>
                       <ChatMessage content={m.content} isUser={m.role === 'user'} />
                       {m.role !== 'user' && (userPlan.toLowerCase() === 'vip' || userPlan.toLowerCase() === 'legend') && (
                         <div className="mt-3 flex justify-end">
                           <button 
                             onClick={() => {
                               const theme = typeof activeProducer.theme_config === 'string' ? JSON.parse(activeProducer.theme_config || '{}') : (activeProducer.theme_config || {});
                               handlePlayTTS(m.content, theme.elevenlabs_voice, idx);
                             }}
                             disabled={loadingTtsIndex === idx}
                             className={\`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors \${playingMsgIndex === idx ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant hover:bg-primary/20 hover:text-primary'} \${loadingTtsIndex === idx ? 'opacity-70 cursor-not-allowed' : ''}\`}
                           >
                             {loadingTtsIndex === idx ? (
                               <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                             ) : (

                               <span className="material-symbols-outlined text-[16px]">{\${playingMsgIndex === idx ? 'pause_circle' : 'volume_up'}}</span>
                             )}
                             {loadingTtsIndex === idx ? 'Wczytywanie...' : playingMsgIndex === idx ? 'Pauza' : 'Głos (VIP)'}
                           </button>
                         </div>
                       )}
                    </div>
                 </div>`;

// Note: I will replace using regex to avoid precise match issues
content = content.replace(/<div key=\{idx\} className=\{`flex gap-3 max-w-\[90%\] md:max-w-\[80%\][^]+?(?=\{\/\* Tier Badge \(Centered Above\) \*\/)[^]+?<\/div>[\s\n]*<\/div>[\s\n]*\)\}[\s\n]*<div className=\{`p-4 rounded-2xl[^]+?<\/div>[\s\n]*<\/div>/g, 
`<div key={idx} className={\`flex \${m.role === 'user' ? 'gap-3 max-w-[90%] md:max-w-[80%] self-end flex-row-reverse' : 'flex-col gap-2 w-full max-w-full'}\`}>
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-2">
                        <div className={\`w-8 h-8 rounded-full overflow-hidden shadow-sm border relative flex items-center justify-center bg-surface-container-low \${activeProducer.colorBorder}\`}>
                          <img src={activeProducer.img} alt={activeProducer.name} className="absolute inset-0 w-full h-full object-cover max-w-none" onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }} />
                          <div style={{ display: 'none' }} className={\`relative z-10 material-symbols-outlined text-sm items-center justify-center \${activeProducer.colorText}\`}>
                             {activeProducer.icon}
                          </div>
                        </div>
                        <span className={\`text-sm font-bold \${activeProducer.colorText}\`}>{activeProducer.name}</span>
                      </div>
                    )}
                    <div className={\`p-4 rounded-2xl text-sm md:text-base font-body shadow-sm leading-relaxed \${m.role === 'user' ? \`\${activeProducer.colorBg} text-white rounded-tr-sm\` : 'bg-surface-container-high text-on-surface rounded-tl-xl border border-outline-variant/10'}\`}>
                       <ChatMessage content={m.content} isUser={m.role === 'user'} />
                       {m.role !== 'user' && (userPlan.toLowerCase() === 'vip' || userPlan.toLowerCase() === 'legend') && (
                         <div className="mt-3 flex justify-end">
                           <button 
                             onClick={() => {
                               const theme = typeof activeProducer.theme_config === 'string' ? JSON.parse(activeProducer.theme_config || '{}') : (activeProducer.theme_config || {});
                               handlePlayTTS(m.content, theme.elevenlabs_voice, idx);
                             }}
                             disabled={loadingTtsIndex === idx}
                             className={\`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors \${playingMsgIndex === idx ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant hover:bg-primary/20 hover:text-primary'} \${loadingTtsIndex === idx ? 'opacity-70 cursor-not-allowed' : ''}\`}
                           >
                             {loadingTtsIndex === idx ? (
                               <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                             ) : (
                               <span className="material-symbols-outlined text-[16px]">{playingMsgIndex === idx ? 'pause_circle' : 'volume_up'}</span>
                             )}
                             {loadingTtsIndex === idx ? 'Wczytywanie...' : playingMsgIndex === idx ? 'Pauza' : 'Głos (VIP)'}
                           </button>
                         </div>
                       )}
                    </div>
                 </div>`
);

content = content.replace(/\{isChatLoading && !isAssistantTyping && \([\s\n]*<div className="flex gap-3 max-w-\[85%\]">[\s\n]*<div className="w-10 h-10 rounded-full bg-surface-variant[^]+?<\/div>[\s\n]*<div className="bg-surface-container-high p-4 rounded-2xl rounded-tl-none border border-outline-variant\/10 flex items-center gap-1\.5 shadow-sm">[\s\n]*<span className="w-2\.5 h-2\.5 bg-primary\/60 rounded-full animate-bounce"><\/span>[\s\n]*<span className="w-2\.5 h-2\.5 bg-primary\/60 rounded-full animate-bounce" style=\{\{animationDelay: '150ms'\}\}><\/span>[\s\n]*<span className="w-2\.5 h-2\.5 bg-primary\/60 rounded-full animate-bounce" style=\{\{animationDelay: '300ms'\}\}><\/span>[\s\n]*<\/div>[\s\n]*<\/div>[\s\n]*\)\}/g,
`{isChatLoading && !isAssistantTyping && (
                 <div className="flex flex-col gap-2 w-full max-w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center material-symbols-outlined flex-shrink-0 text-sm border border-outline-variant/10">
                        smart_toy
                      </div>
                      <span className="text-sm font-bold text-on-surface-variant">System</span>
                    </div>
                    <div className="bg-surface-container-high p-4 rounded-2xl rounded-tl-xl border border-outline-variant/10 flex items-center w-max gap-1.5 shadow-sm">
                      <span className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce"></span>
                      <span className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                 </div>
               )}`
);

content = content.replace(/\{isAssistantTyping && \([\s\n]*<div className="flex gap-3 max-w-\[85%\] animate-in fade-in duration-200">[^]+?(?=\{\/\* Tier Badge \(Centered Above\) \*\/)[^]+?<\/div>[\s\n]*<\/div>[\s\n]*<div className=\{`p-4 rounded-2xl rounded-tl-none border flex items-center gap-2 shadow-sm \$\{activeProducer\.colorBg5\} \$\{activeProducer\.colorBorder20\}`\}>[^]+?<\/div>[\s\n]*<\/div>[\s\n]*\)\}/g,
`{isAssistantTyping && (
                 <div className="flex flex-col gap-2 w-full max-w-full animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <div className={\`w-8 h-8 rounded-full overflow-hidden border relative flex items-center justify-center bg-surface-container-low \${activeProducer.colorBorder}\`}>
                        <img src={activeProducer.img} alt={activeProducer.name} className="absolute inset-0 w-full h-full object-cover max-w-none opacity-80" onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }} />
                        <div style={{ display: 'none' }} className={\`relative z-10 material-symbols-outlined text-sm items-center justify-center \${activeProducer.colorText}\`}>
                           {activeProducer.icon}
                        </div>
                        <div className={\`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse z-20 \${activeProducer.colorBg}\`}></div>
                      </div>
                      <span className={\`text-sm font-bold \${activeProducer.colorText}\`}>{activeProducer.name}</span>
                    </div>
                    <div className={\`p-4 rounded-2xl rounded-tl-xl border flex items-center gap-2 shadow-sm \${activeProducer.colorBg5} \${activeProducer.colorBorder20}\`}>
                      <span className="flex gap-1">
                        <span className={\`w-2 h-2 rounded-full animate-bounce \${activeProducer.colorBg}\`}></span>
                        <span className={\`w-2 h-2 rounded-full animate-bounce \${activeProducer.colorBg}\`} style={{animationDelay: '150ms'}}></span>
                        <span className={\`w-2 h-2 rounded-full animate-bounce \${activeProducer.colorBg}\`} style={{animationDelay: '300ms'}}></span>
                      </span>
                      <span className={\`text-xs font-bold uppercase tracking-wider \${activeProducer.colorText}\`}>{currentThought}</span>
                    </div>
                 </div>
               )}`
);

fs.writeFileSync('client/src/components/Generator.tsx', content);
console.log('Refactored chat UI.');
