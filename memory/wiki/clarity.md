# Microsoft Clarity - MojHit.pl

## Идентификатор
- **Project ID:** `wcjlycio9n`
- **Ссылка на политику Microsoft:** [https://clarity.microsoft.com/privacy](https://clarity.microsoft.com/privacy)

## Интеграция
- **Файл:** `client/src/lib/cookieConsent.ts`
- **Функция:** `loadClarity()`
- **Условие загрузки:** Только после получения явного согласия пользователя на аналитические куки (`hasAnalyticsConsent()`)
- **Идемпотентность:** Гарантирована через глобальную переменную `window.clarityLoaded`

## RODO соответствие
- **Основание:** ст. 6 лит. a RODO (согласие)
- **Сбор данных:** Запись сессий (session recording), тепловые карты, клики, прокрутка
- **Цели:** Понимание взаимодействия пользователей, выявление проблем юзабилити
- **Период хранения:** Настройки по умолчанию Microsoft (13 месяцев)

## Код загрузки
```typescript
export function loadClarity() {
  if (window.clarityLoaded) return;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://www.clarity.ms/tag/' + 'wcjlycio9n';
  script.onload = () => {
    window.clarityLoaded = true;
  };
  document.head.appendChild(script);
}
```

## Особенности
- **Session Recording:** Clarity записывает действия пользователей (клики, движения мыши, прокрутку) для анализа юзабилити
- **Анонимизация:** Microsoft утверждает, что данные анонимизированы и не содержат персональных идентификаторов
- **Отключение:** Пользователь может отозвать согласие через ссылку "Zarządzanie zgodami" в футере

## Связь с другими компонентами
- **CookieBanner:** Управление согласием на аналитические куки
- **Политика приватности:** Раздел 7 "Marketing i Narzędzia Analityczne" содержит информацию о Clarity
- **Основное приложение:** `applyConsent()` загружает скрипт только при наличии согласия

---
*Обновлено: 2026-04-16*