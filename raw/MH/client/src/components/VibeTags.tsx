import { useState, useEffect, useRef } from 'react';

export function VibeTags() {
  const vibes = [
    { label: "Polska Impreza", active: true },
    { label: "Disco Polo", active: false },
    { label: "Uliczny Vibe", active: false },
    { label: "Rap", active: false },
    { label: "Radiowy Hit", active: false },
    { label: "Pop", active: false },
    { label: "Alternatywa", active: false },
    { label: "Rock", active: false },
    { label: "Sentymentalnie", active: false },
    { label: "Klubowy", active: false },
    { label: "Techno", active: false },
    { label: "Lofi Beats", active: false },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const speed = 0.03; // slightly slower than tracks for tags

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && scrollRef.current && vibes.length > 0) {
        const { scrollWidth } = scrollRef.current;
        scrollRef.current.scrollLeft += speed * delta;
        
        // Reset seamless loop when scrolling past half (since we duplicate tracks)
        if (scrollRef.current.scrollLeft >= scrollWidth / 2) {
           scrollRef.current.scrollLeft -= scrollWidth / 2;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, vibes.length]);

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 font-label">Popularne style</p>
      <div 
        className="full-bleed relative flex mask-image-fade"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 hide-scrollbar pb-2"
        >
          {[...vibes, ...vibes].map((vibe, index) => (
            <button 
              key={`${vibe.label}-${index}`}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold headline-font transition-all ${
                vibe.active 
                  ? "bg-primary text-on-primary shadow-[0_0_15px_rgba(255,144,100,0.3)]" 
                  : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright"
              }`}
            >
              {vibe.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
