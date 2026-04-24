# Google Analytics 4 (GA4) - MojHit.pl

## Идентификатор
- **Measurement ID:** `G-VNWJYEB4W7`
- **Ссылка на политику Google:** [https://policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites)

## Интеграция
- **Файл:** `client/src/lib/cookieConsent.ts`
- **Функция:** `loadGoogleAnalytics()`
- **Условие загрузки:** Только после получения явного согласия пользователя на аналитические куки (`hasAnalyticsConsent()`)
- **Идемпотентность:** Гарантирована через глобальную переменную `window.dataLayer` и проверку `window.gtagLoaded`

## RODO соответствие
- **Основание:** ст. 6 лит. a RODO (согласие)
- **Сбор данных:** Анонимизированная аналитика (IP-адрес обезличен)
- **Цели:** Анализ поведения пользователей, оптимизация интерфейса, отслеживание конверсий
- **Период хранения:** Настройки по умолчанию Google (26 месяцев)

## Код загрузки
```typescript
export function loadGoogleAnalytics() {
  if (window.gtagLoaded) return;
  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-VNWJYEB4W7';
  script.async = true;
  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-VNWJYEB4W7', { anonymize_ip: true });
    window.gtagLoaded = true;
  };
  document.head.appendChild(script);
}
```

## Связь с другими компонентами
- **CookieBanner:** Пользователь может включить/выключить аналитические куки через "Ustawienia zaawansowane"
- **Политика приватности:** Раздел 7 "Marketing i Narzędzia Analityczne" содержит информацию о GA4
- **Основное приложение:** `main.tsx` вызывает `applyConsent()` при старте для проверки предварительного согласия

---
*Обновлено: 2026-04-16*