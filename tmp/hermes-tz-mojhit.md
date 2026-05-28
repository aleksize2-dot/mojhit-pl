# Mojhit.pl — Полное Досье для Hermes

**От:** Black (OpenClaw)
**Кому:** Hermes
**Дата:** 2026-05-26

---

## 🎯 Что такое mojhit.pl

**AI-генератор музыки для польского рынка.** Пользователь выбирает AI-исполнителя (персону), общается с ним в чате, описывает идею трека — и получает сгенерированную песню (Suno AI). Плюс видео-генерация (Kie.ai), плюс монетизация.

**Стек:** React + TypeScript + Vite + Tailwind (клиент) | Node.js/Express (сервер) | Supabase (PostgreSQL) | Clerk (аутентификация) | Stripe (платежи)

**Цель:** Запустить продукт, привлечь польских пользователей через TikTok/Reels, монетизировать через coins + подписки.

---

## 🖥️ Где что лежит

```
C:\Users\Admin\.openclaw\workspace\raw\MH\    ← монорепа
├── client\          ← React/Vite/Tailwind (порт 5173)
├── server\          ← Express API (порт 3000)
│   ├── index.js     ← основной сервер (~4000+ строк)
│   ├── video.js     ← Kie.ai видео-генерация
│   ├── suno.js      ← Suno API мост
│   ├── kie.js       ← Kie API аудио-генерация
│   ├── emailService.js ← отправка писем (nodemailer)
│   └── producers\   ← fallback-промпты исполнителей (JS)
├── docs\            ← профили AI-исполнителей (MD)
├── KIE\             ← референсная документация Kie API
└── sql\             ← миграции БД
```

**Запуск:** `npm run dev` (concurrently: client :5173 + server :3000)

---

## 🗄️ Инфраструктура

| Компонент | Детали |
|-----------|--------|
| **БД** | Supabase `urzodvosleauddnfxqio.supabase.co` |
| **Аутентификация** | Clerk (webhook: Svix) |
| **Платежи** | Stripe (BLIK critical для PL) |
| **Хранилище** | Cloudflare R2 (MP3/аудио) |
| **AI аудио** | Suno API (sunoapi.org — основной; kie.ai — резерв) |
| **AI текст** | OpenRouter → Claude Sonnet 4.6 / DeepSeek V4 Flash / Grok 4.20 |
| **AI видео** | Kie.ai MP4 API (все тарифы, watermark для Free) |
| **Туннель** | Ngrok `fetal-hydroxide-wobbly.ngrok-free.dev` → :3000 |

---

## 🤖 9 AI-исполнителей (Performers)

Каждый — это persona с характером, стилем музыки, LLM-моделью и Suno-версией.

| # | Исполнитель | Стиль | Модель LLM | Suno | Статус |
|---|------------|-------|------------|------|--------|
| 1 | **CJ Remi** 🟣 | Polska Fala / Disco Pop-Folk | Claude Sonnet 4.6 | V4_5 | ✅ Universal algo |
| 2 | **MELO MC** 🩷 | Ballady / Czułe Historie | Claude Sonnet 4.6 | — | ✅ Universal algo |
| 3 | **Kosa** 🟢 | Rap / Drill / Pewność Siebie | DeepSeek V4 Flash | V5 | ✅ Universal algo |
| 4 | **La Luz** 🌴 | Reggaeton / Polish Latino | Claude Sonnet 4.6 | — | ✅ Universal algo |
| 5 | **BLIXX** 💗 | K-Pop / Electro-House | Grok 4.20 | V5_5 | ✅ v2.1 done |
| 6 | **SOLANA** 🟣🟠 | Cinematic Ethnic Pop / Afirmacje | Grok 4.20 | V5_5 | ✅ v2.5 done |
| 7 | **POPIÓŁ** 🟫🟠 | Blues Rock / Power Ballad | Grok 4.20 | V5_5 | ✅ v2.1 done |
| 8 | **VENA** ⚫ | Dark Trap / Feminine Drill | Grok 4.20 | V5_5 | ✅ v2.1 done |
| 9 | **DISCO PULS** 🔵 | Italo Disco / Eurodance | Grok 4.20 | V5_5 | ⚠️ v2.0 pending |

**Ключевая фича:** Пользователь общается с исполнителем в чате. Исполнитель (через LLM) задаёт вопросы, уточняет детали, генерирует текст песни → отправляет в Suno → возвращает аудио.

**Единый алгоритм (все 9):** START+IMIĘ → OKAZJA → DETALE → POTWIERDŹ (4 шага, зеркало, подсказки, эмоциональная реакция)

---

## ✨ Что уже построено

### 🟢 Production-ready
- **Генератор песен** (`Generator.tsx` + `useGeneratorLogic.ts`) — полный цикл: чат → промпт → Suno → аудио
- **Видео-генерация** — Kie.ai MP4, все тарифы, watermark для Free
- **Админ-панель** — управление исполнителями, треками, пользователями, ролями (RBAC)
- **Галерея треков** — Recent/My/Liked с обложками и плеером
- **Email-нотификации** — трек готов → письмо (SMTP опционально)
- **Guest checkout** — генерация без регистрации, оплата → трек на email
- **Реферальная программа** — `Polecaj.tsx` + `AffiliateManager.tsx`
- **Gift Funnel** — "Podaruj Muzykę" (подари трек)
- **Cookie/RODO consent** — GA4 + Clarity + Meta Pixel с баннером
- **TTS (ElevenLabs)** — озвучка сообщений исполнителей (4 голоса)
- **Prompt Regeneration** — "Nowa wersja" / "Edytuj" кнопки
- **Performer Linking** — треки привязаны к AI-исполнителям

### 🟡 Готово, но не в продакшене
- **Stripe интеграция** — код написан, нужен живой ключ
- **Cloudflare R2** — сконфигурирован, но не подключён (треки без защиты)
- **Suno Persona API** — voice cloning для PRO, отложен

### 🔴 Что осталось
- **Запуск на продакшен** — деплой на VPS, домен mojhit.pl
- **Stripe живые ключи** + BLIK
- **R2 подключить** для продакшен-хранения треков
- **Email SMTP** сконфигурировать
- **Тестирование промптов** — CJ Remi, Kosa, MELO MC, La Luz требуют deep-dive стиля
- **SEO/GEO** — мета-теги, schema markup, контент-стратегия для PL

---

## 💰 Бизнес-модель

| Тариф | Цена (PLN) | Что внутри |
|-------|:---:|------|
| **Free** | 0 | 2 трека/день, video с watermark |
| **Basic** | ~49 | 10 coins/мес, 2 трека/coin |
| **Pro** | ~99 | 30 coins/мес, безлимит, без watermark, persona cloning |

**Coins 🪙** — внутренняя валюта (1 coin = 1 генерация = 2 трека)
**Notes 🎵** — бесплатные, зарабатываются лайками и daily login (10 notes = 1 coin)

---

## 📂 Важные файлы для понимания

| Файл | Что там |
|------|--------|
| `server/index.js` | **Главный файл** — все API endpoints, webhooks, автополлинг |
| `server/video.js` | Kie.ai видео-генерация |
| `server/suno.js` | Suno API вызовы |
| `server/kie.js` | Kie API аудио-генерация |
| `client/src/components/Generator.tsx` | UI генератора (чат) |
| `client/src/hooks/useGeneratorLogic.ts` | Логика генератора |
| `server/producers/*.js` | Fallback-промпты исполнителей |
| `docs/*.md` | Профили исполнителей |
| `server/.env` | Ключи (Supabase, Clerk, Kie, Stripe, OpenRouter) |
| `memory/wiki/mojhit-*.md` | OpenClaw вики (архитектура, девопс, маркетинг...) |

---

## 🔑 Ключи (общие)

- **Supabase:** в `.env` (URL + anon/service ключи)
- **Clerk:** в `.env` (publishable + secret)
- **OpenRouter:** в `.env` + `openclaw.json`
- **Kie.ai:** `e9ee7b9518edae610b1a95bb46365c35` (в `.env`, IP-whitelist — работает с сервера и браузера)
- **Stripe:** в `.env` (test keys)

---

## 🧠 AI-модели и роутинг

**Текстовые (через OpenRouter):**
- Основной: `anthropic/claude-sonnet-4.6` (CJ Remi, MELO MC, La Luz)
- Бюджетный: `deepseek/deepseek-v4-flash` (Kosa)
- Креативный: `x-ai/grok-4.20` (BLIXX, SOLANA, POPIÓŁ, VENA, DISCO PULS)

**Аудио:**
- Основной: `sunoapi.org` (priority 1)
- Резерв: `kie.ai` (priority 2)

**Видео:**
- `kie.ai` MP4 API

---

## 🚀 Текущий статус (2026-05-26)

✅ Сервер запущен: `:3000`
✅ Клиент запущен: `:5173`
✅ OpenGenAI запущен: `:3001`

**Фокус сейчас:** Добить оставшиеся хвосты, запустить продакшен.

---

## 📞 Команда

| Кто | Роль | Инструмент |
|-----|------|-----------|
| **Black** (я) | Архитектура, бэкенд, SEO/GEO, оркестрация | OpenClaw |
| **Hermes** (ты) | Автоматизация, API-тесты, серверные задачи | Hermes Agent |
| **Шеф (Alex/Blacksize)** | Продукт, стратегия, решения | Человек |

**Связь:** через шефа или напрямую. Я в OpenClaw, ты в Hermes. Один хост (ASUSAL).

---

**Вопросы?** Шеф ответит на глобальные, я — на технические. Добро пожаловать в команду 🤝
