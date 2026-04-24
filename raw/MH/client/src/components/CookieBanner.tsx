import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applyConsent } from '../lib/cookieConsent';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Settings toggle states
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('necessary');

  useEffect(() => {
    // Check if user already consented
    const consent = localStorage.getItem('mh_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      const saved = localStorage.getItem('mh_cookie_settings');
      if (saved) {
        try {
            const parsed = JSON.parse(saved);
            setAnalyticsEnabled(parsed.analytics || false);
            setMarketingEnabled(parsed.marketing || false);
        } catch(e) {}
      }
    }

    const handleOpenCookies = () => {
      setIsSettingsOpen(true);
    };

    window.addEventListener('openCookieSettings', handleOpenCookies);
    return () => window.removeEventListener('openCookieSettings', handleOpenCookies);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('mh_cookie_consent', 'all');
    localStorage.setItem('mh_cookie_settings', JSON.stringify({ analytics: true, marketing: true }));
    setAnalyticsEnabled(true);
    setMarketingEnabled(true);
    setIsVisible(false);
    setIsSettingsOpen(false);
    applyConsent(); // 🔥 Load analytics scripts NOW
  };

  const handleRejectAll = () => {
    localStorage.setItem('mh_cookie_consent', 'necessary');
    localStorage.setItem('mh_cookie_settings', JSON.stringify({ analytics: false, marketing: false }));
    setAnalyticsEnabled(false);
    setMarketingEnabled(false);
    setIsVisible(false);
    setIsSettingsOpen(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('mh_cookie_consent', 'custom');
    localStorage.setItem('mh_cookie_settings', JSON.stringify({ analytics: analyticsEnabled, marketing: marketingEnabled }));
    setIsVisible(false);
    setIsSettingsOpen(false);
    applyConsent(); // 🔥 Apply new settings
  };

  if (!isVisible && !isSettingsOpen) return null;

  return (
    <>
      {/* Banner */}
      {!isSettingsOpen && isVisible && (
        <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:w-[420px] bg-white rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.15)] z-[9999] overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-8 fade-in duration-300">
           <div className="p-6">
              <h3 className="font-bold text-lg text-[#1A1A1A] mb-3 font-body">Ta strona używa plików cookie</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6 font-body">
                Używamy plików cookie w celach niezbędnych, analitycznych i marketingowych. Możesz zmienić swoje ustawienia.
              </p>
              
              <div className="flex flex-col gap-2.5">
                 <button onClick={handleAcceptAll} className="w-full bg-[#323940] hover:bg-[#202529] text-white py-3 px-4 rounded-lg font-bold text-sm font-body transition-colors text-center">
                   Akceptuj wszystkie
                 </button>
                 <button onClick={handleRejectAll} className="w-full bg-[#323940] hover:bg-[#202529] text-white py-3 px-4 rounded-lg font-bold text-sm font-body transition-colors text-center">
                   Tylko niezbędne
                 </button>
                 <button onClick={() => setIsSettingsOpen(true)} className="w-full bg-[#eef1f4] hover:bg-[#e0e4e8] text-[#1a1a1a] py-3 px-4 rounded-lg font-bold text-sm font-body transition-colors text-center">
                   Zarządzaj ustawieniami
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal Overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-[600px] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-[#1A1A1A] font-body">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                 <h2 className="text-xl font-bold">Zarządzanie zgodami</h2>
                 <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-md bg-[#eef1f4] hover:bg-[#e0e4e8] text-[#343A40] transition-colors">
                   <span className="material-symbols-outlined text-[20px]">close</span>
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1">
                 <h3 className="font-bold text-base mb-2">O plikach cookie</h3>
                 <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Używamy plików cookie do zapewnienia podstawowych funkcji strony, analizy ruchu oraz personalizacji treści i reklam. Szczegóły znajdziesz w naszej <Link to="/polityka-prywatnosci" onClick={() => setIsSettingsOpen(false)} className="font-bold underline cursor-pointer hover:text-[#1A1A1A]">polityce prywatności</Link>.
                 </p>

                    {/* Necessary */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                       <div className="flex items-center justify-between p-4 bg-[#F8F9FA]">
                          <div className="flex items-center gap-3">
                             <button onClick={() => setExpandedSection(e => e === 'necessary' ? null : 'necessary')} className="min-w-[24px] min-h-[24px] w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors rounded-full text-gray-600">
                               <span className="material-symbols-outlined text-[16px]">{expandedSection === 'necessary' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
                             </button>
                             <span className="font-bold text-sm">Niezbędne, funkcjonalne i bezpieczeństwa</span>
                          </div>
                          <div className="w-11 h-6 bg-gray-300 rounded-full flex items-center justify-end px-0.5 cursor-not-allowed opacity-70">
                            <div className="w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">
                               <span className="material-symbols-outlined text-[12px] text-gray-400 font-bold" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
                            </div>
                          </div>
                       </div>
                       {expandedSection === 'necessary' && (
                         <div className="p-4 bg-white border-t border-gray-200 text-sm text-gray-600 leading-relaxed">
                           Te pliki są wymagane do prawidłowego działania strony oraz zapewnienia podstawowych funkcji (np. wybór języka, ochrona formularzy, zapis preferencji). Nie można ich wyłączyć.
                         </div>
                       )}
                    </div>

                    {/* Analytics */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                       <div className="flex items-center justify-between p-4 bg-[#F8F9FA]">
                          <div className="flex items-center gap-3">
                             <button onClick={() => setExpandedSection(e => e === 'analytics' ? null : 'analytics')} className="min-w-[24px] min-h-[24px] w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors rounded-full text-gray-600">
                               <span className="material-symbols-outlined text-[16px]">{expandedSection === 'analytics' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
                             </button>
                             <span className="font-bold text-sm">Analityczne</span>
                          </div>
                          <button onClick={() => setAnalyticsEnabled(!analyticsEnabled)} className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${analyticsEnabled ? 'bg-[#323940] justify-end' : 'bg-gray-400 justify-start'}`}>
                            <div className="w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">
                               {analyticsEnabled ? <span className="material-symbols-outlined text-[12px] text-[#323940] font-bold" style={{fontVariationSettings: "'FILL' 1"}}>check</span> : <span className="material-symbols-outlined text-[12px] text-gray-500 font-bold">close</span>}
                            </div>
                          </button>
                       </div>
                       {expandedSection === 'analytics' && (
                         <div className="p-4 bg-white border-t border-gray-200 text-sm text-gray-600 leading-relaxed">
                           Pomagają nam zrozumieć, jak użytkownicy korzystają ze strony. Usługa: Google Analytics 4, Microsoft Clarity. Przykładowe pliki cookie: _ga, _gid, _ga_*. Dane są anonimowe, służą do generowania zbiorczych statystyk.
                         </div>
                       )}
                    </div>

                    {/* Marketing */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                       <div className="flex items-center justify-between p-4 bg-[#F8F9FA]">
                          <div className="flex items-center gap-3">
                             <button onClick={() => setExpandedSection(e => e === 'marketing' ? null : 'marketing')} className="min-w-[24px] min-h-[24px] w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors rounded-full text-gray-600">
                               <span className="material-symbols-outlined text-[16px]">{expandedSection === 'marketing' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
                             </button>
                             <span className="font-bold text-sm">Marketingowe</span>
                          </div>
                          <button onClick={() => setMarketingEnabled(!marketingEnabled)} className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${marketingEnabled ? 'bg-[#323940] justify-end' : 'bg-gray-400 justify-start'}`}>
                            <div className="w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">
                               {marketingEnabled ? <span className="material-symbols-outlined text-[12px] text-[#323940] font-bold" style={{fontVariationSettings: "'FILL' 1"}}>check</span> : <span className="material-symbols-outlined text-[12px] text-gray-500 font-bold">close</span>}
                            </div>
                          </button>
                       </div>
                       {expandedSection === 'marketing' && (
                         <div className="p-4 bg-white border-t border-gray-200 text-sm text-gray-600 leading-relaxed">
                           Te pliki są wykorzystywane do personalizacji reklam i mierzenia skuteczności kampanii. Usługi: Meta/Facebook, LinkedIn, Google Ads. Przykładowe pliki cookie: _fbp, _gcl_aw, _li_fat_id, MUID.
                         </div>
                       )}
                    </div>

                 {/* Note Box */}
                 <div className="p-4 border border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Możesz w każdej chwili zmienić swoje preferencje dotyczące plików cookie klikając w link <strong className="font-semibold text-[#1A1A1A]">Zarządzanie zgodami</strong>, dostępny na dole strony.
                    </p>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-100 gap-4">
                 <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                   <button onClick={handleAcceptAll} className="w-full sm:w-auto bg-[#323940] hover:bg-[#202529] text-white py-2.5 px-5 rounded-lg font-bold text-sm transition-colors text-center order-1 sm:order-none">
                     Akceptuj wszystkie
                   </button>
                   <button onClick={handleRejectAll} className="w-full sm:w-auto bg-[#323940] hover:bg-[#202529] text-white py-2.5 px-5 rounded-lg font-bold text-sm transition-colors text-center order-2 sm:order-none">
                     Tylko niezbędne
                   </button>
                 </div>
                 <button onClick={handleSaveSettings} className="w-full sm:w-auto bg-[#eef1f4] hover:bg-[#e0e4e8] text-[#1a1a1a] py-2.5 px-5 rounded-lg font-bold text-sm transition-colors text-center order-3 sm:order-none">
                   Zapisz ustawienia
                 </button>
              </div>

           </div>
        </div>
      )}
    </>
  );
}
