# Hermes TZ — OpenGenAI + Kie.ai Добивка

**От:** Black (OpenClaw)  
**Кому:** Hermes  
**Дата:** 2026-05-26  
**Приоритет:** P2 (второстепенно после mojhit.pl)

---

## 🎯 Что за проект

**OpenGenerativeAI** — опенсорсная AI-студия (200+ моделей), форк от [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI).  
Наш форк с интеграцией Kie.ai API: [aleksize2-dot/open-generative-ai-kie](https://github.com/aleksize2-dot/open-generative-ai-kie).

## 🖥️ Локальный запуск

```bash
cd C:\Users\Admin\open-generative-ai-kie
npm run dev     # → http://localhost:3001/studio
npm run build:studio   # пересборка studio-пакета после правок
```

**Стек:** Next.js 15 + React 19 + Vite 5 + Tailwind 4

## 📂 Ключевые файлы

| Файл | Что делает |
|------|-----------|
| `src/lib/kieClient.js` | Клиент Kie.ai API (jobs/createTask + recordInfo) |
| `packages/studio/src/muapi.js` | Основной API-слой студии с выбором провайдера (Muapi/Kie) |
| `components/StandaloneShell.js` | Шелл с Settings-модалкой (выбор провайдера) |
| `components/ApiKeyModal.js` | Модалка ввода API-ключей |

## 🔑 Ключи

**OpenGenAI Kie.ai ключ:** `d9bfbe13eee289f0a12d05e407950d70`  
⚠️ **IP-whitelist** — работает только из браузера (не с сервера/Node.js)

**Kie.ai API docs:** https://api.kie.ai

## ✅ Что уже сделано (2026-05-25, Black)

1. **Settings — выбор провайдера** — `<select>` Muapi / Kie в модалке Settings, сохраняется в `localStorage.api_provider`
2. **ApiKeyModal** — ссылки на обоих провайдеров
3. **Studio-пакет (muapi.js)** — полная интеграция Kie:
   - `getProvider()` / `getBaseUrl()` / `getAuthHeaders()`
   - `toKieModel()` — маппинг имён моделей
   - `kieSubmitAndPoll()` + `kiePollForResult()` — submit + поллинг
   - `kieEnqueue()` — очередь (max 2 одновременных запроса)
   - `uploadFile()` для Kie: base64 → загрузка на `kieai.redpandaai.co/api/file-base64-upload`
   - Авто-поля: `quality: basic` для seedream, `reference_image_urls` для seedance
4. **KieClient фиксы** — правильные имена моделей, только v1 endpoints, `input_prompt` → `prompt`

### Проверенные (живые) модели:
✅ Nano Banana v1/v2/Pro, GPT Image 2, Ideogram, Seedream v4/4.5/5.0 Lite

---

## ❌ Что нужно добить

### 🔴 P1 — Seedance 2.0 (видео)

**Модель:** `bytedance/seedance-2`  
**Проблемы:**
- **T2V (Text-to-Video):** HTTP 422 — неправильный формат параметров. Нужно найти правильную сигнатуру запроса через Kie API.
- **I2V (Image-to-Video):** Загрузка файла проходит (200), но генерация падает с 500. Возможно модель нестабильна на стороне Kie, но стоит проверить все параметры.

**Куда смотреть:** `muapi.js` → функция `kieSubmitAndPoll()`, маппинг в `toKieModel()`.  
Kie API: `POST /api/v1/jobs/createTask` с телом `{model, input: {...}}`

### 🟡 P2 — Остальные студии (не тестировались с Kie)

1. **Audio Studio** — генерация аудио. Проверить через Kie провайдер.
2. **LipSync Studio** — синхронизация губ. Не тестировалась.
3. **Cinema Studio** — видео-монтаж. Не тестировалась.
4. **Workflows** — пайплайны. Не тестировались.
5. **Agents** — AI-агенты. Не тестировались.

**Для каждой:** переключить провайдер на Kie в Settings, запустить генерацию, зафиксировать ошибки.

### 🟢 P3 — Balance (баланс Kie)

Показывает заглушку. У Kie нет публичного эндпоинта для проверки баланса. Можно:
- Сделать запрос на `/api/v1/jobs/recordInfo` с несуществующим taskId и парсить ошибку (некрасиво)
- Или оставить заглушку и добавить ссылку на дашборд Kie.ai

---

## 🔗 Полезные ссылки

- **GitHub репа:** https://github.com/aleksize2-dot/open-generative-ai-kie
- **Оригинал:** https://github.com/Anil-matcha/Open-Generative-AI
- **Kie.ai:** https://kie.ai
- **Kie API:** https://api.kie.ai
- **Локальная wiki:** `C:\Users\Admin\.openclaw\workspace\memory\wiki\open-generative-ai-kie.md`

## 📋 Процесс работы

1. **ACK** — подтверди получение, напиши что берёшь и ETA
2. **DONE** — по каждой задаче: что сделано, где артефакты, пруфы (скриншоты/логи)
3. **BLOCKED** — если stuck > 3 попыток → стучись ко мне или шефу

## 🚫 Стоп-факторы

- Не менять структуру проекта (монорепа с workspaces)
- Не удалять Muapi — он должен остаться как fallback
- Kie-ключ работает только из браузера (IP whitelist)
- Все правки тестить через `npm run dev` → браузер localhost:3001/studio
- После правок в studio-пакете: `npm run build:studio`

---

**Вопросы?** Шеф на связи. Я на связи. Удачи, сосед 🤝
