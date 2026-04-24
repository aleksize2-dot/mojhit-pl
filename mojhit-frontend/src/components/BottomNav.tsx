export function BottomNav() {
  const navItems = [
    { label: "Start", icon: "home", active: true },
    { label: "Moje Hity", icon: "library_music", active: false },
    { label: "Monety", icon: "monetization_on", active: false },
    { label: "Profil", icon: "account_circle", active: false },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-2xl z-50 rounded-t-[2rem] shadow-[0px_-4px_20px_rgba(0,0,0,0.5)] border-t border-slate-800">
      <div className="flex justify-around items-center px-4 pb-6 pt-3">
        {navItems.map((item, idx) => (
          <a 
            key={idx}
            className={`flex flex-col items-center justify-center transition-all ${
              item.active 
                ? "text-[#ff9064] bg-[#ff9064]/10 rounded-full px-4 py-1 shadow-[0_0_15px_rgba(255,144,100,0.2)] scale-105" 
                : "text-slate-400 hover:text-white"
            }`} 
            href="#"
          >
            <span 
              className="material-symbols-outlined" 
              style={item.active ? {fontVariationSettings: "'FILL' 1"} : {}}
            >
              {item.icon}
            </span>
            <span className="font-medium text-[11px] headline-font mt-0.5">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

