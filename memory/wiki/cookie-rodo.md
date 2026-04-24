# Cookie & RODO Compliance - MojHit.pl

## Контекст
Система согласия на использование файлов cookie и аналитики (Google Analytics 4, Microsoft Clarity) реализована в соответствии с требованиями RODO (ст. 6 лит. a) и директивой ePrivacy.

## Компоненты системы

### 1. CookieBanner (`client/src/components/CookieBanner.tsx`)
- Отображает баннер с тремя кнопками:
  - **Akceptuj wszystkie** – согласие на все категории куки
  - **Odrzuć wszystkie** – отказ от необязательных куки
  - **Ustawienia zaawansowane** – расширенные настройки (необходимые, аналитические, маркетинговые)
- Сохраняет выбор пользователя в `localStorage`:
  - `mh_cookie_consent` – общее согласие (`accepted`/`rejected`)
  - `mh_cookie_settings` – детальные настройки по категориям
- Предоставляет ссылку "Zarządzanie zgodami" для изменения выбора

### 2. Cookie Consent Middleware (`client/src/lib/cookieConsent.ts`)
- **Функции проверки согласия:**
  - `hasNecessaryConsent()` – всегда `true` (необходимые куки)
  - `hasAnalyticsConsent()` – проверяет согласие на аналитику
  - `hasMarketingConsent()` – проверяет согласие на маркетинг
- **Функции загрузки скриптов:**
  - `loadGoogleAnalytics()` – идемпотентная загрузка GA4
  - `loadClarity()` – идемпотентная загрузка Microsoft Clarity
  - `applyConsent()` – применяет согласие, загружая соответствующие скрипты

### 3. Интеграция точек входа
- **`main.tsx`** – вызывает `applyConsent()` при запуске приложения
- **CookieBanner** – вызывает `applyConsent()` при нажатии кнопок согласия

## Категории куки

### Необходимые (Necessary)
- **Цель:** Обеспечение базовой функциональности сайта
- **Примеры:** Сессионные куки, аутентификация
- **Согласие:** Не требуется (ст. 6 лит. f RODO – законный интерес)

### Аналитические (Analytics)
- **Цель:** Анализ поведения пользователей, оптимизация интерфейса
- **Инструменты:** Google Analytics 4 (`G-VNWJYEB4W7`), Microsoft Clarity (`wcjlycio9n`)
- **Согласие:** Требуется явное согласие (ст. 6 лит. a RODO)

### Маркетинговые (Marketing)
- **Цель:** Персонализация рекламы, ретаргетинг
- **Инструменты:** [[meta-pixel|Meta Pixel (Facebook)]] – планируется интеграция; данные отправляются в Meta Platforms Ireland Ltd; пользователь может управлять предпочтениями через [Ad Preferences](https://www.facebook.com/ads/preferences/).
- **Согласие:** Требуется явное согласие (ст. 6 лит. a RODO)

## Идемпотентность
Все скрипты загружаются только один раз благодаря проверкам:
- `window.gtagLoaded` для GA4
- `window.clarityLoaded` для Clarity
Многократный вызов `applyConsent()` не приводит к дублированию скриптов.

## Соответствие RODO
- **Правовая основа:** Согласие (ст. 6 лит. a) для аналитики и маркетинга
- **Информирование:** Политика приватности содержит детали о каждом инструменте
- **Контроль:** Пользователь может изменить или отозвать согласие в любое время
- **Прозрачность:** Идентификаторы инструментов указаны в политике приватности

## Polityka Prywatności (Privacy Policy)
- **Файл:** `client/src/pages/PolitykaPrywatnosci.tsx`
- **Обновление:** 2026-04-16 – исправлена нумерация разделов (5→6→7), добавлены детали:
  - **Раздел 7:** Полные детали использования GA4 (cookies, хранение 26 месяцев, opt-out), Clarity (cookies, хранение 13 месяцев, ограничения), Meta Pixel (планируется).
  - **Раздел 6:** Детали логов сервера (хранение 90 дней, не для маркетинга).
- **Статус:** Полностью RODO-совместимый документ, исправлен синтаксис (удалён лишний `>` после `</ul>`).

## Ссылки на политики поставщиков
- **Google Analytics:** [https://policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites)
- **Microsoft Clarity:** [https://clarity.microsoft.com/privacy](https://clarity.microsoft.com/privacy)

---
*Обновлено: 2026-04-16*