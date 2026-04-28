const fs = require('fs');

let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

// 1. Remove the old horizontal block
const oldStripStart = content.indexOf('{/* -- Horizontal scroll strip (both mobile & desktop) -- */}');
const oldStripEnd = content.indexOf('      <div ref={chatContainerRef}');
if (oldStripStart !== -1 && oldStripEnd !== -1) {
    content = content.slice(0, oldStripStart) + content.slice(oldStripEnd);
} else {
    console.log("Could not find old strip bounds");
}

// 2. Refactor the active producer header
const headerStart = content.indexOf('<button\n                 onClick={() => setIsProducerPanelOpen(p => !p)}\n                 className="w-full p-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low shrink-0 hover:bg-surface-container transition-colors duration-200 group"');
const headerEndIdx = content.indexOf('               </button>', headerStart);
if (headerStart !== -1 && headerEndIdx !== -1) {
    const oldHeader = content.slice(headerStart, headerEndIdx + 24);
    
    const newHeader = `<div
                 onClick={() => setIsProducerPanelOpen(p => !p)}
                 className="w-full h-[76px] px-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low shrink-0 hover:bg-surface-container transition-colors duration-200 group overflow-hidden cursor-pointer relative"
               >
                 <div className="flex items-center gap-3 relative z-20 bg-surface-container-low shrink-0 pr-4 h-full">
                    <div className="relative shrink-0">
                      <div className={\`w-10 h-10 rounded-full overflow-hidden relative flex items-center justify-center bg-surface-container-low border-2 border-transparent shadow-[0_0_15px_currentColor] \${activeProducer.colorText}\`}>
                        <img src={activeProducer.img} alt={activeProducer.name} className="absolute inset-0 w-full h-full object-cover max-w-none" onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }} />
                        <div style={{ display: 'none' }} className={\`relative z-10 material-symbols-outlined text-xl flex items-center justify-center \${activeProducer.colorText}\`}>{activeProducer.icon}</div>
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
                         <span className={\`text-[9px] uppercase tracking-wider font-label px-1.5 py-0.5 rounded border \${activeProducer.colorText} \${activeProducer.colorBg10} \${activeProducer.colorBorder20}\`}>{activeProducer.badge}</span>
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
                   <div className="flex items-center gap-6 animate-marquee-reverse w-max">
                     {[0, 1].flatMap((copyIndex) =>
                       producers.filter((p: any) => p.is_on_main_page && p.id !== activeProducer.id).map((p: any) => (
                         <div
                           key={\`strip-\${p.id}-\${copyIndex}\`}
                           onClick={(e) => { e.stopPropagation(); if (!p.isLocked) { handleProducerSelect(p); setIsProducerPanelOpen(false); } else { window.location.href=\`/biuro-producentow?producer=\${p.id}\`; } }}
                           className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-100 cursor-pointer"
                         >
                           <div className={\`w-8 h-8 rounded-full overflow-hidden border-2 \${p.colorBorder80}\`}>
                             <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                           </div>
                           <span className={\`text-[10px] font-bold uppercase tracking-widest font-label whitespace-nowrap \${p.colorText}\`}>{p.name}</span>
                         </div>
                       ))
                     )}
                   </div>
                 </div>

                 <div className="flex items-center gap-2 relative z-20 bg-surface-container-low shrink-0 pl-4 h-full">
                   {finalAiPrompt && (
                     <span onClick={e => { e.stopPropagation(); setFinalAiPrompt(null); setMessages([{role: 'assistant', content: activeProducer.initMsg}]); }} className="text-[10px] text-error font-bold font-label px-2 py-1 rounded-lg hover:bg-error/10 border border-error/20 transition-colors uppercase tracking-wider">Reset</span>
                   )}
                    <span className={\`md:hidden flex items-center justify-center shrink-0 p-1 \${activeProducer.colorText} \${isProducerPanelOpen ? "dot-beat-paused" : ""}\`}>
                      <svg width="56" height="32" viewBox="0 0 56 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        {[4,12,20,28,36,44,52].map((cx,i) => <circle key={i} cx={cx} cy="4" r="3" className="dot-beat-col-0" />)}
                        {[12,20,28,36,44].map((cx,i) => <circle key={i} cx={cx} cy="12" r="3" className="dot-beat-col-1" />)}
                        {[20,28,36].map((cx,i) => <circle key={i} cx={cx} cy="20" r="3" className="dot-beat-col-2" />)}
                        <circle cx="28" cy="28" r="3" className="dot-beat-col-3" />
                      </svg>
                    </span>
                    <span className={\`hidden md:flex items-center justify-center shrink-0 p-1 \${activeProducer.colorText} \${isProducerPanelOpen ? "dot-beat-paused" : ""}\`}>
                      <svg width="32" height="56" viewBox="0 0 32 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        {[4,12,20,28,36,44,52].map((cy,i) => <circle key={i} cx="4" cy={cy} r="3" className="dot-beat-col-0" />)}
                        {[12,20,28,36,44].map((cy,i) => <circle key={i} cx="12" cy={cy} r="3" className="dot-beat-col-1" />)}
                        {[20,28,36].map((cy,i) => <circle key={i} cx="20" cy={cy} r="3" className="dot-beat-col-2" />)}
                        <circle cx="28" cy="28" r="3" className="dot-beat-col-3" />
                      </svg>
                    </span>
                 </div>
               </div>`;
    content = content.replace(oldHeader, newHeader);
} else {
    console.log("Could not find new header bounds", headerStart, headerEndIdx);
}

fs.writeFileSync('client/src/components/Generator.tsx', content, 'utf8');
console.log("Done");
