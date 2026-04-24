export function VibeTags() {
  const vibes = [
    { label: "Disco Polo", active: true },
    { label: "Rap", active: false },
    { label: "Pop", active: false },
    { label: "Rock", active: false },
    { label: "Techno", active: false },
    { label: "Lofi Beats", active: false },
  ];

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 font-label">Popularne style</p>
      <div className="flex overflow-x-auto gap-3 hide-scrollbar pb-2">
        {vibes.map((vibe, index) => (
          <button 
            key={index}
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
  );
}
