import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'all');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'necessary');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[84px] md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-surface-container-high border border-outline-variant/30 p-5 rounded-2xl shadow-2xl z-[60] animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-2xl">cookie</span>
        <div className="space-y-3">
          <h3 className="font-bold headline-font text-sm">Cenimy Twoją prywatność</h3>
          <p className="text-on-surface-variant text-xs font-body leading-relaxed">
            Używamy plików cookie, aby poprawić jakość przeglądania, wyświetlać reklamy lub treści dostosowane do indywidualnych potrzeb użytkowników oraz analizować ruch na stronie.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button 
              onClick={handleAccept}
              className="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-bold headline-font hover:bg-primary-dim transition-colors text-center"
            >
              Akceptuj wszystko
            </button>
            <button 
              onClick={handleReject}
              className="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-full text-xs font-bold headline-font hover:bg-surface-bright transition-colors text-center"
            >
              Odrzuć
            </button>
          </div>
          <button className="text-on-surface-variant/70 text-[10px] font-label underline underline-offset-2 hover:text-primary transition-colors block text-center w-full sm:text-left mt-1">
            Dostosuj ustawienia
          </button>
        </div>
      </div>
    </div>
  );
}
