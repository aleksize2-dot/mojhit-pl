export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/20 pt-12 pb-28 md:pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">music_note</span>
              <span className="text-lg font-bold tracking-tight text-primary headline-font">mojhit.pl</span>
            </div>
            <p className="text-on-surface-variant text-sm font-body leading-relaxed">
              Twój osobisty generator muzyki AI. Stwórz hit na każdą okazję w zaledwie 3 minuty.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>share</span>
              </a>
              <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>mail</span>
              </a>
            </div>
          </div>

          {/* Generator Categories */}
          <div className="space-y-4">
            <h4 className="font-bold headline-font text-on-surface">Generator</h4>
            <ul className="space-y-2 text-sm font-body">
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Piosenka na Urodziny</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Piosenka Ślubna</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Generuj Disco Polo</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Prezent dla Żony</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Diss Track Generator</a></li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h4 className="font-bold headline-font text-on-surface">Społeczność</h4>
            <ul className="space-y-2 text-sm font-body">
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Trendy Tygodnia</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Nowości</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Jak zdobyć Monety?</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Konkursy</a></li>
            </ul>
          </div>

          {/* Legal / Service */}
          <div className="space-y-4">
            <h4 className="font-bold headline-font text-on-surface">Serwis</h4>
            <ul className="space-y-2 text-sm font-body">
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">FAQ & Pomoc</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Kontakt</a></li>
              <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Cennik VIP</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant/20 gap-4">
          <p className="text-on-surface-variant text-xs font-body text-center md:text-left">
            Copyright © {new Date().getFullYear()} mojhit.pl. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs font-body">
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Regulamin</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Polityka Prywatności</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
