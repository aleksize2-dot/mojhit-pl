// cookieConsent.ts — middleware для загрузки аналитики ТОЛЬКО после согласия пользователя

export interface CookieSettings {
  analytics: boolean;
  marketing: boolean;
}

// Проверяет, дал ли пользователь согласие на analytics
export function hasAnalyticsConsent(): boolean {
  const consent = localStorage.getItem('mh_cookie_consent');
  if (consent === 'all') return true;
  if (consent === 'custom') {
    try {
      const settings = JSON.parse(
        localStorage.getItem('mh_cookie_settings') || '{}'
      ) as CookieSettings;
      return settings.analytics === true;
    } catch {
      return false;
    }
  }
  return false;
}

// Проверяет, дал ли пользователь согласие на marketing
export function hasMarketingConsent(): boolean {
  const consent = localStorage.getItem('mh_cookie_consent');
  if (consent === 'all') return true;
  if (consent === 'custom') {
    try {
      const settings = JSON.parse(
        localStorage.getItem('mh_cookie_settings') || '{}'
      ) as CookieSettings;
      return settings.marketing === true;
    } catch {
      return false;
    }
  }
  return false;
}

// Загружает Google Analytics 4 (G-VNWJYEB4W7)
// IDИПОТЕНТНО — можно вызывать сколько угодно, скрипт загрузится только один раз
let gaLoaded = false;
export function loadGoogleAnalytics() {
  if (gaLoaded || typeof window === 'undefined') return;
  
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-VNWJYEB4W7';
  script.addEventListener('load', () => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      ((window as any).dataLayer as any[]).push(args);
    }
    gtag('js', new Date());
    gtag('config', 'G-VNWJYEB4W7');
  });
  
  document.head.appendChild(script);
  gaLoaded = true;
  console.log('[CookieConsent] ✅ Google Analytics 4 loaded');
}

// Загружает Microsoft Clarity (wcjlycio9n)
let clarityLoaded = false;
export function loadClarity() {
  if (clarityLoaded || typeof window === 'undefined') return;
  
  if (typeof (window as any).clarity === 'function') {
    clarityLoaded = true;
    return;
  }
  
  (window as any).clarity = (window as any).clarity || function (...args: any[]) {
    ((window as any).clarity = (window as any).clarity || function () {
      ((window as any).clarity.q = (window as any).clarity.q || []).push(args);
    });
  };
  
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.clarity.ms/tag/wcjlycio9n';
  document.head.appendChild(script);
  
  clarityLoaded = true;
  console.log('[CookieConsent] ✅ Microsoft Clarity loaded');
}

// Главная функция — вызывается при старте приложения и при каждом изменении согласия
export function applyConsent() {
  if (hasAnalyticsConsent()) {
    loadGoogleAnalytics();
    loadClarity();
  }
  
  if (hasMarketingConsent()) {
    // TODO: Загрузка Meta Pixel, LinkedIn Insight Tag и т.д.
    console.log('[CookieConsent] 📢 Marketing consent granted — ready for Meta/LinkedIn');
  }
}
