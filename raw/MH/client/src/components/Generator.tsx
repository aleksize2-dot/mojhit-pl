import { ChatMessage } from './ChatMessage';
import { useGeneratorLogic } from './useGeneratorLogic';
import { useAuth, useUser, SignInButton, SignUpButton } from '@clerk/clerk-react';

export function Generator(_props: { giftMode?: boolean; giftTemplate?: any } = {}) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const {
    // States
    producers,
    activeAgent,
    userPlan,
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
    isActionMenuOpen,
    showSuccessModal,
    // Computed
    activeProducer,
    // Refs
    chatContainerRef,
    fileInputRef,
    chatEndRef,
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
  } = useGeneratorLogic({ giftMode: _props.giftMode, giftTemplate: _props.giftTemplate, isSignedIn });

  if (!producers.length || !activeProducer) return <div className="p-8 flex justify-center"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div>;

  return (
    <section className="flex-1 flex flex-col min-h-0 -mt-4 md:mt-0">

      <div className="hidden md:block text-center space-y-1 mb-1 md:space-y-2 md:mb-2 md:mt-4 px-4 md:px-0">
        <h2 className={`text-xl md:text-3xl font-black headline-font tracking-tight bg-gradient-to-r bg-clip-text text-transparent inline-block ${activeProducer.gradient}`}>Wybierz wykonawcę</h2>
        <p className="text-on-surface-variant max-w-lg mx-auto text-[10px] md:text-sm font-label hidden md:block">Kto dziś lepiej poczuje Twój klimat?</p>
      </div>

            <div ref={chatContainerRef} className="flex-1 min-h-0 md:min-h-[750px] lg:min-h-[850px] relative max-w-6xl mx-auto flex gap-0 px-0 md:px-2 lg:px-6 w-full mt-0 z-10 w-[100vw] left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] md:w-full md:left-auto md:right-auto md:ml-auto md:mr-auto md:mx-auto">


        <div className="relative group flex-1 min-w-0 flex flex-col">
        <div className={`hidden md:block absolute -inset-0.5 rounded-3xl blur opacity-15 group-focus-within:opacity-30 transition duration-500 bg-gradient-to-r ${activeProducer.gradient}`}></div>
        <div className="flex-1 flex flex-col min-h-0 relative bg-surface-container-lowest md:rounded-3xl overflow-hidden md:ring-1 ring-outline-variant/20 shadow-none md:shadow-2xl border-t md:border border-outline-variant/10 md:border-none rounded-none">
          <div className="flex-1 flex flex-col min-h-0">

            {isProducerPanelOpen && (
              <div className="md:hidden absolute top-[73px] left-0 right-0 z-30 bg-surface-container-low/95 backdrop-blur-xl border-b border-outline-variant/20 shadow-2xl">
                <div className="flex items-start gap-2 overflow-x-auto px-5 py-5 scrollbar-none" style={{scrollbarWidth:'none'}}>
                  {producers.filter((p: any) => p.is_on_main_page).map((p: any) => {
                    const isActive = activeAgent === p.id;
                    const isLocked = p.isLocked;
                    return (
                      <button key={p.id}
                        onClick={() => { if (!isLocked) { handleProducerSelect(p); setIsProducerPanelOpen(false); } else { window.location.href=`/biuro-producentow?producer=${p.id}`; } }}
                        className={`flex flex-col items-center gap-1.5 shrink-0 px-3 py-2 rounded-2xl transition-all
                          ${isActive ? '' : 'hover:bg-surface-container-high opacity-60 hover:opacity-100'}`}>
                        <div className="relative shrink-0">
                          
                          
                          
                          <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 ${isActive ? `bg-surface-container-lowest border-transparent shadow-[0_0_15px_currentColor] ${p.colorText}` : 'border-outline-variant/30 grayscale-[50%]'}`}>
                            <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isLocked && <span className="material-symbols-outlined text-[12px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>}
                          <span className={`text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ${isActive ? p.colorText : 'text-on-surface-variant'}`}>{p.name}</span>
                        </div>
                        {p.tier === 'vip' && <div className="text-[6px] font-black bg-primary/10 text-primary px-1 py-0.5 rounded border border-primary/20 uppercase leading-none mt-0.5">VIP</div>}
                        {p.tier === 'legend' && <div className="text-[6px] font-black bg-primary/10 text-primary px-1 py-0.5 rounded border border-primary/20 uppercase leading-none mt-0.5">LEGEND</div>}
                        {isActive && <span className="material-symbols-outlined text-[12px] text-green-400">check_circle</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

             <div className="relative" data-producer-dropdown>
               <div
                 onClick={() => setIsProducerPanelOpen(p => !p)}
                 className="w-full h-[76px] px-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low shrink-0 hover:bg-surface-container transition-colors duration-200 group overflow-hidden cursor-pointer relative"
               >
                 <div className="flex items-center gap-3 relative z-20 bg-surface-container-low shrink-0 pr-4 h-full">
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full overflow-hidden relative flex items-center justify-center bg-surface-container-low border-2 border-transparent shadow-[0_0_15px_currentColor] ${activeProducer.colorText}`}>
                        <img src={activeProducer.img} alt={activeProducer.name} className="absolute inset-0 w-full h-full object-cover max-w-none" onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }} />
                        <div style={{ display: 'none' }} className={`relative z-10 material-symbols-outlined text-xl flex items-center justify-center ${activeProducer.colorText}`}>{activeProducer.icon}</div>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-low z-20"></div>
                    </div>
                   <div className="text-left">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">Wykonawca</p>
                     <div className="flex items-center gap-1.5">
                       {activeProducer.isLocked && <span className="material-symbols-outlined text-[18px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>}
                       <p className="font-extrabold headline-font text-on-surface text-base leading-tight">{activeProducer.name}</p>
                     </div>
                     <div className="flex items-center gap-2 mt-1 flex-wrap">
                       {activeProducer.badge && (
                         <span className={`text-[9px] uppercase tracking-wider font-label px-1.5 py-0.5 rounded border ${activeProducer.colorText} ${activeProducer.colorBg10} ${activeProducer.colorBorder20}`}>{activeProducer.badge}</span>
                       )}
                       {(activeProducer.tier === 'vip' || activeProducer.tier === 'legend') && (
                         <div className="bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm border border-white/10 uppercase whitespace-nowrap inline-block">
                           {activeProducer.tier === 'vip' ? 'VIP' : 'LEGEND'}
                         </div>
                       )}
                     </div>
                   </div>
                 </div>

                 <div className="flex-1 overflow-hidden relative mask-image-fade h-full flex items-center opacity-60 group-hover:opacity-100 transition-opacity">
                   <div className="flex items-center gap-4 animate-marquee-reverse w-max">
                     {[0, 1].flatMap((copyIndex) =>
                       producers.filter((p: any) => p.is_on_main_page && p.id !== activeProducer.id).map((p: any) => (
                         <div
                           key={`strip-${p.id}-${copyIndex}`}
                           onClick={(e) => { e.stopPropagation(); if (!p.isLocked) { handleProducerSelect(p); setIsProducerPanelOpen(false); } else { window.location.href=`/biuro-producentow?producer=${p.id}`; } }}
                           className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-100 cursor-pointer h-full"
                         >
                           <div className={`w-[76px] h-[76px] rounded-2xl overflow-hidden border border-outline-variant/30 flex-shrink-0`}>
                             <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                           </div>
                           <span className={`text-[10px] font-bold uppercase tracking-widest font-label whitespace-nowrap ${p.colorText}`}>{p.name}</span>
                         </div>
                       ))
                     )}
                   </div>
                 </div>

                 <div className="flex items-center gap-2 relative z-20 bg-surface-container-low shrink-0 pl-4 h-full">
                   {finalAiPrompt && (
                     <span onClick={e => { e.stopPropagation(); setFinalAiPrompt(null); setMessages([{role: 'assistant', content: activeProducer.initMsg}]); }} className="text-[10px] text-error font-bold font-label px-2 py-1 rounded-lg hover:bg-error/10 border border-error/20 transition-colors uppercase tracking-wider">Reset</span>
                   )}
                    <span className={`md:hidden flex items-center justify-center shrink-0 p-1 ${activeProducer.colorText} ${isProducerPanelOpen ? "dot-beat-paused" : ""}`}>
                      <svg width="56" height="32" viewBox="0 0 56 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        {[4,12,20,28,36,44,52].map((cx,i) => <circle key={i} cx={cx} cy="4" r="3" className="dot-beat-col-0" />)}
                        {[12,20,28,36,44].map((cx,i) => <circle key={i} cx={cx} cy="12" r="3" className="dot-beat-col-1" />)}
                        {[20,28,36].map((cx,i) => <circle key={i} cx={cx} cy="20" r="3" className="dot-beat-col-2" />)}
                        <circle cx="28" cy="28" r="3" className="dot-beat-col-3" />
                      </svg>
                    </span>
                    <span className={`hidden md:flex items-center justify-center shrink-0 p-1 ${activeProducer.colorText} ${isProducerPanelOpen ? "dot-beat-paused" : ""}`}>
                      <svg width="32" height="56" viewBox="0 0 32 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        {[4,12,20,28,36,44,52].map((cy,i) => <circle key={i} cx="4" cy={cy} r="3" className="dot-beat-col-0" />)}
                        {[12,20,28,36,44].map((cy,i) => <circle key={i} cx="12" cy={cy} r="3" className="dot-beat-col-1" />)}
                        {[20,28,36].map((cy,i) => <circle key={i} cx="20" cy={cy} r="3" className="dot-beat-col-2" />)}
                        <circle cx="28" cy="28" r="3" className="dot-beat-col-3" />
                      </svg>
                    </span>
                 </div>
               </div>

               {isProducerPanelOpen && (
                 <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-surface-container-low border-b border-outline-variant/20 shadow-2xl overflow-y-auto max-h-[340px]">
                   {producers.filter((p: any) => p.is_on_main_page).map((p: any) => {
                     const isActive = activeAgent === p.id;
                     const isLocked = p.isLocked;
                     return (
                       <button
                         key={p.id}
                         onClick={() => {
                           if (isLocked) { window.location.href=`/biuro-producentow?producer=${p.id}`; return; }
                           handleProducerSelect(p);
                           setIsProducerPanelOpen(false);
                         }}
                         className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150
                           ${isActive ? `${p.colorBg10}` : 'hover:bg-surface-container-high'}
                           ${isLocked ? 'opacity-60' : ''}`}
                       >
                         <div className="relative shrink-0">
                            
                            
                            <div className={`relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 ${isActive ? p.colorBorder80 : 'border-outline-variant/30'}`}>
                              <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover" onError={e => { e.currentTarget.style.display='none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }} />
                              <div style={{display:'none'}} className={`w-full h-full flex items-center justify-center material-symbols-outlined text-xl ${p.colorText}`}>{p.icon}</div>
                            </div>
                          </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {isLocked && <span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>}
                              <span className={`font-bold text-sm ${isActive ? p.colorText : 'text-on-surface'}`}>{p.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              {p.badge && <span className={`text-[8px] uppercase tracking-wider font-label px-1.5 py-0.5 rounded border ${p.colorText} ${p.colorBg10} ${p.colorBorder20}`}>{p.badge}</span>}
                              {p.tier === 'vip' && <div className="inline-block bg-primary/10 text-primary text-[7px] font-black px-1 py-0.5 rounded border border-primary/20 uppercase">VIP</div>}
                              {p.tier === 'legend' && <div className="inline-block bg-primary/10 text-primary text-[7px] font-black px-1 py-0.5 rounded border border-primary/20 uppercase">LEGEND</div>}
                            </div>
                           <p className="text-xs text-on-surface-variant truncate">{p.headerStatus}</p>
                         </div>
                       </button>
                     );
                   })}
                 </div>
               )}
             </div>
            
            <div className="flex-1 px-2 py-3 md:p-6 overflow-y-auto flex flex-col gap-5 bg-gradient-to-b from-surface-container-lowest to-surface-container-low/30 relative">
               
               {messages.map((m, idx) => (
                 <div key={idx} className="flex flex-col gap-2 w-full max-w-full">
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full overflow-hidden shadow-sm border relative flex items-center justify-center bg-surface-container-low ${activeProducer.colorBorder}`}>
                          <img src={activeProducer.img} alt={activeProducer.name} className="absolute inset-0 w-full h-full object-cover max-w-none" onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }} />
                          <div style={{ display: 'none' }} className={`relative z-10 material-symbols-outlined text-sm items-center justify-center ${activeProducer.colorText}`}>
                             {activeProducer.icon}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold leading-none ${activeProducer.colorText}`}>{activeProducer.name}</span>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {activeProducer.badge && (
                              <span className={`text-[8px] uppercase tracking-wider font-label px-1.5 py-0.5 rounded border ${activeProducer.colorText} ${activeProducer.colorBg10} ${activeProducer.colorBorder20}`}>{activeProducer.badge}</span>
                            )}
                            {(activeProducer.tier === 'vip' || activeProducer.tier === 'legend') && (
                              <div className="w-fit bg-primary/10 text-primary text-[7px] font-black px-1 py-0.5 rounded border border-primary/20 uppercase leading-none">
                                {activeProducer.tier === 'vip' ? 'VIP' : 'LEGEND'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {m.role === 'user' && (
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm font-bold text-on-surface-variant">{user?.firstName || 'Ty'}</span>
                        <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border border-outline-variant/20 bg-surface-container-high flex items-center justify-center">
                          {user?.imageUrl ? (
                            <img src={user.imageUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl text-sm md:text-base font-body shadow-sm leading-relaxed w-fit max-w-[90%] md:max-w-[85%] ${m.role === 'user' ? `${activeProducer.colorBg} text-white rounded-tr-xl self-end` : 'bg-surface-container-high text-on-surface rounded-tl-xl border border-outline-variant/10 self-start'}`}>
                       <ChatMessage content={m.content} isUser={m.role === 'user'} />
                    </div>
                 </div>
               ))}

               {isChatLoading && !isAssistantTyping && (
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
               )}
               
               {isAssistantTyping && (
                 <div className="flex flex-col gap-2 w-full max-w-full animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full overflow-hidden border relative flex items-center justify-center bg-surface-container-low ${activeProducer.colorBorder}`}>
                        <img src={activeProducer.img} alt={activeProducer.name} className="absolute inset-0 w-full h-full object-cover max-w-none opacity-80" onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }} />
                        <div style={{ display: 'none' }} className={`relative z-10 material-symbols-outlined text-sm items-center justify-center ${activeProducer.colorText}`}>
                           {activeProducer.icon}
                        </div>
                        <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse z-20 ${activeProducer.colorBg}`}></div>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold leading-none ${activeProducer.colorText}`}>{activeProducer.name}</span>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {activeProducer.badge && (
                              <span className={`text-[8px] uppercase tracking-wider font-label px-1.5 py-0.5 rounded border ${activeProducer.colorText} ${activeProducer.colorBg10} ${activeProducer.colorBorder20}`}>{activeProducer.badge}</span>
                            )}
                            {(activeProducer.tier === 'vip' || activeProducer.tier === 'legend') && (
                              <div className="w-fit bg-primary/10 text-primary text-[7px] font-black px-1 py-0.5 rounded border border-primary/20 uppercase leading-none">
                                {activeProducer.tier === 'vip' ? 'VIP' : 'LEGEND'}
                              </div>
                            )}
                          </div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl rounded-tl-xl border flex items-center gap-2 shadow-sm ${activeProducer.colorBg5} ${activeProducer.colorBorder20}`}>
                      <span className="flex gap-1">
                        <span className={`w-2 h-2 rounded-full animate-bounce ${activeProducer.colorBg}`}></span>
                        <span className={`w-2 h-2 rounded-full animate-bounce ${activeProducer.colorBg}`} style={{animationDelay: '150ms'}}></span>
                        <span className={`w-2 h-2 rounded-full animate-bounce ${activeProducer.colorBg}`} style={{animationDelay: '300ms'}}></span>
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wider ${activeProducer.colorText}`}>{currentThought}</span>
                    </div>
                 </div>
               )}
               
               {finalAiPrompt && (
                 <div className="flex flex-col gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-3xl self-center">
                    
                    <div className="bg-surface-container shadow-xl border border-primary/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                         <span className="material-symbols-outlined text-9xl">queue_music</span>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                             <span className="material-symbols-outlined">library_music</span>
                          </div>
                          <div>
                            <h4 className="font-bold headline-font text-on-surface uppercase tracking-wider text-sm">Struktura Utworu Gotowa</h4>
                  <p className="text-xs text-on-surface-variant">Przejrzyj prompt i dokonaj płatności</p>
                          </div>
                      </div>

                      <div className="mb-4 pb-4 border-b border-outline-variant/10">
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant font-label block mb-1.5 tracking-widest">Wirtualny Wykonawca - Tagi Suno</span>
                        <div className="flex flex-wrap gap-2">
                           {finalAiPrompt.tags.split(',').map((tag, i) => (
                             <span key={i} className="px-2.5 py-1 bg-surface-container-high border border-outline-variant/10 rounded-md text-xs font-bold text-primary">{tag.trim()}</span>
                           ))}
                        </div>
                      </div>
                      
                      <div className="mb-5 relative">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant font-label tracking-widest">Dopracowany Tekst</span>
                          <div className="flex gap-2">
                            {!isEditingPrompt ? (
                              <>
                                <button 
                                  onClick={handleRegeneratePrompt}
                                  disabled={isRegenerating}
                                  className="text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1"
                                >
                                  {isRegenerating ? (
                                    <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                                  ) : (
                                    <span className="material-symbols-outlined text-xs">refresh</span>
                                  )}
                                  {isRegenerating ? 'Generowanie...' : 'Nowa wersja'}
                                </button>
                                <button 
                                  onClick={handleEditPrompt}
                                  className="text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-highest transition-colors flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-xs">edit</span>
                                  Edytuj
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={handleSaveEdit}
                                  className="text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-xs">save</span>
                                  Zapisz
                                </button>
                                <button 
                                  onClick={handleCancelEdit}
                                  className="text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg bg-error/10 text-error border border-error/20 hover:bg-error/20 transition-colors flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-xs">close</span>
                                  Anuluj
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 max-h-[180px] overflow-y-auto custom-scrollbar">
                          {isEditingPrompt ? (
                            <textarea 
                              value={editedLyrics}
                              onChange={(e) => setEditedLyrics(e.target.value)}
                              className="w-full bg-transparent border-none text-sm font-body text-on-surface/90 italic leading-relaxed whitespace-pre-wrap outline-none resize-none min-h-[120px]"
                              rows={6}
                              autoFocus
                            />
                          ) : (
                            <p className="text-sm font-body text-on-surface/90 italic leading-relaxed whitespace-pre-wrap">{finalAiPrompt.lyrics}</p>
                          )}
                        </div>
                      </div>

                      <input 
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary p-4 pl-5 rounded-2xl text-base font-bold headline-font outline-none placeholder:text-on-surface-variant/40 mb-5 shadow-inner"
                        placeholder="Opcjonalny tytuł (np. Ostatni Lot)..."
                      />
                      
                      <div className="flex flex-col gap-3 relative">
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant font-label text-center tracking-widest">Wybierz Metodę Płatności</span>
                         <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                              onClick={() => setCurrencyType('coins')}
                              className={`flex-1 py-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold headline-font text-sm transition-all focus:outline-none ${currencyType === 'coins' ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'}`}
                            >
                              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span> 1 Hit</span>
                            </button>
                            <button 
                              onClick={() => setCurrencyType('notes')}
                              className={`flex-1 py-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold headline-font text-sm transition-all focus:outline-none ${currencyType === 'notes' ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'}`}
                            >
                              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>music_note</span> 10 not</span>
                            </button>
                            <button 
                              onClick={() => setCurrencyType('fiat')}
                              className={`flex-1 py-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold headline-font text-sm transition-all focus:outline-none ${currencyType === 'fiat' ? 'border-tertiary bg-tertiary/10 text-tertiary shadow-sm' : 'border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'}`}
                            >
                              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[20px]">payments</span> BLIK / Karta</span>
                            </button>
                         </div>
                         
                         {!isSignedIn && (
                           <div className="mt-2 mb-2">
                             <input 
                               type="email"
                               value={guestEmail}
                               onChange={e => setGuestEmail(e.target.value)}
                               className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary p-3 rounded-xl text-sm font-body outline-none placeholder:text-on-surface-variant/50"
                      placeholder="Podaj swój e-mail..."
                               required
                             />
                      <p className="text-[10px] text-on-surface-variant mt-1 ml-1">E-mail jest wymagany, abyśmy wiedzieli do kogo należy utwór, jeśli się zarejestrujesz.</p>
                           </div>
                         )}
                         
                         <button 
                           onClick={handleGenerate}
                           disabled={isLoading}
                           className={`w-full mt-2 py-5 rounded-xl font-black uppercase tracking-widest text-sm md:text-base transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden shadow-lg`}
                           style={!isLoading ? {
                             background: activeProducer.buttonGradient || 'linear-gradient(45deg, #ff9064, #734bbd, #ff9064)',
                             backgroundSize: '200% 200%',
                             animation: 'gradientFlow 3s ease infinite',
                             color: 'white'
                           } : { backgroundColor: 'var(--surface-variant)', color: 'var(--on-surface-variant)', boxShadow: 'none' }}
                         >
                           {isLoading ? (
                             <>
                               <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                               <span>Syntezowanie audio...</span>
                             </>
                           ) : (
                             <>
                               <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>magic_button</span>
                        <span>Wygeneruj za {currencyType === "fiat" ? "PLN (Wkrótce)" : currencyType === "coins" ? "1 Hit" : "10 not"}</span>
                             </>
                           )}
                         </button>
                      </div>
                    </div>
                 </div>
               )}
               <div ref={chatEndRef} className="h-4"></div>
            </div>

            {!finalAiPrompt ? (
              <div className="p-0 py-2 md:p-4 border-t border-outline-variant/10 bg-surface-container-low shrink-0 relative z-10">
                  <div className="flex gap-2 items-end px-2 md:px-0">
                   <div className="flex-1 min-w-0 bg-surface-container-lowest border-x-0 border-y md:border border-outline-variant/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary md:rounded-2xl p-2 transition-all shadow-sm flex items-end">
                     <textarea 
                       value={chatInput}
                       onChange={(e) => setChatInput(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleSendMessage();
                         }
                       }}
                       disabled={isChatLoading}
                       className="w-full bg-transparent border-none text-base text-on-surface focus:outline-none focus:ring-0 font-body resize-none min-h-[44px] max-h-[120px] px-3 py-2 custom-scrollbar"
                       placeholder={activeProducer.placeholder}
                       rows={1}
                       style={{
                          height: chatInput ? `${Math.min(chatInput.split('\n').length * 24 + 20, 120)}px` : '44px'
                       }}
                     ></textarea>
                    </div>

                   <button 
                     onClick={handleSendMessage}
                     disabled={isChatLoading || (!chatInput.trim())} 
                     className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center transition-all flex-shrink-0 shadow-md ${isChatLoading || (!chatInput.trim()) ? 'bg-surface-variant text-on-surface-variant shadow-none' : `${activeProducer.colorBg} text-white hover:opacity-90 hover:shadow-lg active:scale-95`}`}
                   >
                     <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1", marginLeft: '4px'}}>send</span>
                   </button>
                </div>
              </div>
            ) : (
               <div className="p-4 border-t border-outline-variant/10 bg-surface-container-low text-center shrink-0">
                  <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest opacity-80">Gotowe do produkcji</p>
               </div>
            )}
          </div>
        </div>
        </div>
        {/* Desktop side panel - RIGHT */}
        <div data-producer-dropdown className={`hidden ml-3 flex-col shrink-0 w-64 transition-all duration-300 ${isProducerPanelOpen ? 'md:flex' : ''}`}>
          <div className="bg-surface-container-low rounded-3xl ring-1 ring-outline-variant/20 shadow-xl p-4 flex flex-col gap-2 h-full overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 px-1">Wybierz wykonawcę</p>
            {producers.filter((p: any) => p.is_on_main_page).map((p: any) => {
              const isActive = activeAgent === p.id;
              const isLocked = p.isLocked;
              return (
                <button key={p.id}
                  onClick={() => { if (!isLocked) { handleProducerSelect(p); } else { window.location.href=`/biuro-producentow?producer=${p.id}`; } }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 text-left
                    ${isActive ? '' : 'hover:bg-surface-container-high'}`}>
                  <div className={`relative w-9 h-9 rounded-full overflow-hidden border-2 shrink-0
                    ${isActive ? `bg-surface-container-lowest border-transparent shadow-[0_0_10px_currentColor] ${p.colorText}` : 'border-outline-variant/30 grayscale-[60%]'}`}>
                    <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                    
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {isLocked && <span className="material-symbols-outlined text-[14px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>}
                      <p className={`text-xs font-bold uppercase tracking-wide truncate ${isActive ? p.colorText : 'text-on-surface'}`}>{p.name}</p>
                    </div>
                    {p.tier === 'vip' && <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-tertiary/15 text-tertiary">VIP</span>}
                    {p.tier === 'legend' && <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary">LEGEND</span>}
                    <p className="text-[9px] text-on-surface-variant truncate">{p.headerStatus}</p>
                  </div>
                  {isActive && <span className="material-symbols-outlined text-[16px] ml-auto text-green-400">check_circle</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <p className="hidden md:block text-[10px] text-center text-on-surface-variant opacity-70 mt-4 leading-relaxed lg:px-4 uppercase tracking-widest font-label font-bold">
        Polityka plików: Utwory wygenerowane wygasają po 14 dniach. Pobierz mp3, jeśli chcesz je zachować.
      </p>
      
      {showGuestLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-outline-variant/20 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <h3 className="text-2xl font-black headline-font text-center text-on-surface mb-2">Limit Wykorzystany</h3>
            <p className="text-sm text-on-surface-variant text-center mb-6">
              Jako gość możesz wygenerować tylko jeden darmowy utwór. Załóż konto, aby otrzymać <b>20 darmowych not</b> na start i tworzyć dalej!
            </p>
            <div className="flex flex-col gap-3">
              <SignUpButton mode="modal">
                <button className="w-full py-3.5 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors">
                  Załóż darmowe konto
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="w-full py-3 rounded-xl font-bold bg-transparent border border-outline-variant/30 text-on-surface hover:bg-surface-variant/30 transition-colors">
                  Mam już konto (Zaloguj)
                </button>
              </SignInButton>
              <button 
                onClick={() => setShowGuestLimitModal(false)}
                className="w-full py-2 mt-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-on-surface transition-colors"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-outline-variant/20 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${activeProducer.colorBg}`}></div>
            <div className={`w-16 h-16 rounded-full ${activeProducer.colorBg10} flex items-center justify-center ${activeProducer.colorText} mx-auto mb-4`}>
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <h3 className="text-2xl font-black headline-font text-center text-on-surface mb-2">Gotowe!</h3>
            <p className="text-sm text-on-surface-variant text-center mb-6">
              Utwory zostały pomyślnie wygenerowane! Znajdziesz je w panelu Moje Utwory. Dwa warianty (V1 i V2) są gotowe do odsłuchu.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  window.location.href = '/moje-utwory';
                }}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-colors ${activeProducer.colorBg} hover:opacity-90`}
              >
                Przejdź do Moich Utworów
              </button>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 rounded-xl font-bold bg-transparent border border-outline-variant/30 text-on-surface hover:bg-surface-variant/30 transition-colors"
              >
                Kontynuuj tworzenie
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
