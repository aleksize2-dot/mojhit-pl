import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/20 pt-12 pb-28 md:pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">music_note</span>
              <span className="text-lg font-bold tracking-tight text-primary headline-font">mojhit.pl</span>
            </div>
            <p className="text-on-surface-variant text-sm font-body leading-relaxed md:pr-4">
              Twój osobisty generator muzyki AI. Stwórz hit na każdą okazję w zaledwie 3 minuty.
            </p>
            <div className="flex gap-4 pt-2">
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'mojhit.pl - Generator Muzyki AI',
                      text: 'Sprawdź ten niesamowity generator muzyki AI! Stwórz swój hit w 3 minuty.',
                      url: window.location.origin
                    }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(window.location.origin);
                    alert('Skopiowano link do schowka!');
                  }
                }}
                title="Udostępnij stronę"
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>share</span>
              </button>
              <Link to="/kontakt" title="Napisz do nas" className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>mail</span>
              </Link>
            </div>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h4 className="font-bold headline-font text-on-surface">Społeczność</h4>
            <ul className="space-y-2 text-sm font-body">
              <li><Link to="/trendy-tygodnia" className="text-on-surface-variant hover:text-primary transition-colors">Trendy Tygodnia</Link></li>
              <li><Link to="/browse" className="text-on-surface-variant hover:text-primary transition-colors">Ostatnio stworzone</Link></li>
              <li><Link to="/jak-zdobyc-monety" className="text-on-surface-variant hover:text-primary transition-colors">Jak zdobyć Monety?</Link></li>
              <li><Link to="/contests" className="text-on-surface-variant hover:text-primary transition-colors">Konkursy</Link></li>
            </ul>
          </div>

          {/* Legal / Service */}
          <div className="space-y-4">
            <h4 className="font-bold headline-font text-on-surface">Serwis</h4>
            <ul className="space-y-2 text-sm font-body">
              <li><Link to="/faq-pomoc" className="text-on-surface-variant hover:text-primary transition-colors">FAQ & Pomoc</Link></li>
              <li><Link to="/kontakt" className="text-on-surface-variant hover:text-primary transition-colors">Kontakt</Link></li>
              <li><Link to="/cennik" className="text-on-surface-variant hover:text-primary transition-colors">Cennik</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant/20 gap-4">
          <p className="text-on-surface-variant text-xs font-body text-center md:text-left">
            Copyright © {new Date().getFullYear()} mojhit.pl. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs font-body">
            <Link to="/regulamin" className="text-on-surface-variant hover:text-primary transition-colors">Regulamin</Link>
            <Link to="/polityka-prywatnosci" className="text-on-surface-variant hover:text-primary transition-colors">Polityka Prywatności</Link>
            <button onClick={() => window.dispatchEvent(new Event('openCookieSettings'))} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-left">Zarządzanie zgodami</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
