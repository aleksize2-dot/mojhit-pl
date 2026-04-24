type Track = {
  id: string;
  title: string;
  style: string;
  duration: string;
  image: string;
  isPlaying: boolean;
  progress?: number;
};

const MOCK_TRACKS: Track[] = [
  {
    id: "1",
    title: "Nocne Pierogi",
    style: "Disco Polo",
    duration: "2:45",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtdqrxdGKVogO7BzFAn_wCjqTeXe9zACMjwBpg2bAzz8cIZo02HMHif7q_a9ONQXpPlP_QDK_UOvvdVJHl2X98tCOV8Pynbsmv-90AptbEh4_jwKj4nWGc0Zfk3TqihC0V9dYtbdPW5jqHF1gDLgBfe4A14Q-D-QQylWqNW4djfMyoK36xpKzlffbO_wIuoY9UgGqzQLNc_WW1xmexrEOOLLRQOIiD60dCCDE67SMR0LPYoreYsC1_F2qFmBGXQ9BUiCEgb_Xna7M",
    isPlaying: false
  },
  {
    id: "2",
    title: "Warszawski Rap",
    style: "Rap",
    duration: "3:40",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWku-Tfuj73K34UIDzwdsVF4wHICtVTLtleeG5eFsE2nIQscIF7xw_C37LwRIESp01Cq4pYGS9iY--u2pEQ24o-9nKRaneMLFRrVL-6cMe7ZkKpIQwqRQ-XvQOFtwX6K_tz2b1FjzueH-Lj2_Dgv9_-ru9-GYFzaohUkNVdgghSh29VtOPWZhlVCW6ZUAZacVYi4414ngEw7XbLJlEBc3OrD2Z_U_c5LcZBL16gRJjwrv9TgRt23EPUhdJsenBuHreuyB3VPNX4qQ",
    isPlaying: true,
    progress: 65
  },
  {
    id: "3",
    title: "Neonowe Bałtyckie Słońce",
    style: "Pop",
    duration: "3:12",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBk7ti6WoljlsyQL9hk_QnvopB6oKPcsHws9zjVmq9WeyOiNb8LeMBeyWzPL0qGcZ8R23LTbYV2TqLkH_4t1X-EIQHWpD6oUBKEowMXjAbuQUZwqSASbmORlgtncMwIhWyEjixkExWGi6PGfgAThw-trPBmBhbeTwboUD_NXQ4V46HqPP-IFx8daJi3FkVeUkD-QRaxNX73Kw2B3GS0_LX67msXkPsXNlaYLwRLFQsJumSYEQf9DAw2Vx8FgUaDPayRWB84ADO61ZM",
    isPlaying: false
  }
];

export function RecentTracks() {
  return (
    <section className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-extrabold headline-font tracking-tight">Ostatnio stworzone</h2>
          <p className="text-on-surface-variant text-sm font-body">Hity prosto z pieca AI</p>
        </div>
        <button className="text-primary text-xs font-bold uppercase tracking-widest font-label hover:underline underline-offset-4">
          Zobacz wszystkie
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_TRACKS.map((track) => (
          <div key={track.id} className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4 group hover:bg-surface-container-high transition-colors cursor-pointer">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
              <img 
                alt="Album Art" 
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                src={track.image} 
              />
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${track.isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <span className={`material-symbols-outlined text-3xl ${track.isPlaying ? 'text-primary' : 'text-white'}`}>
                  {track.isPlaying ? 'pause_circle' : 'play_circle'}
                </span>
              </div>
            </div>

            <div className="flex-grow min-w-0">
              <h3 className={`font-bold truncate headline-font leading-tight ${track.isPlaying ? 'text-primary' : ''}`}>
                {track.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded font-bold uppercase font-label">
                  {track.style}
                </span>
                
                {track.isPlaying && track.progress ? (
                  <div className="w-24 h-1 bg-surface-variant rounded-full overflow-hidden">
                    <div className="bg-primary h-full glow-meter-head" style={{ width: `${track.progress}%` }}></div>
                  </div>
                ) : (
                  <span className="text-on-surface-variant text-[11px] font-medium font-body">{track.duration}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>
                favorite
              </button>
              <button className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors">
                share
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
