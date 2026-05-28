# MojHit Voice Features — План интеграции ElevenLabs через KIE

## 📋 Доступные модели (все через KIE API)

| Модель | Описание | Скорость | Применение |
|--------|----------|----------|------------|
| `elevenlabs/text-to-speech-multilingual-v2` | TTS 29 языков, 20+ голосов | ~2-5 сек | Основной голос AI исполнителей |
| `elevenlabs/text-to-speech-turbo-2-5` | Flash TTS (ультрабыстрый) | ~0.5-2 сек | Ответы в реальном времени |
| `elevenlabs/text-to-dialogue-v3` | Диалоговый TTS (2+ персонажа) | ~3-8 сек | Подкасты, интервью, дуэты |
| `elevenlabs/speech-to-text` | Распознавание речи | ~1-3 сек | Голосовой ввод в чат |
| `elevenlabs/audio-isolation` | Удаление шума, изоляция голоса | ~5-15 сек | Очистка записей |
| `elevenlabs/sound-effect-v2` | Генерация звуковых эффектов | ~2-5 сек | Интро/аутро для треков |

---

## 🔧 Текущий статус

### ✅ Уже работает
1. **TTS по кнопке** (`handlePlayTTS`) — озвучивание любого сообщения в чате
2. **Авто-TTS для VIP/Legend** (`isVoiceResponseEnabled`) — AI отвечает голосом
3. **Голосовой ввод** (`handleMicClick`) — speech recognition в браузере
4. **Поле `elevenlabsVoice`** у каждого продюсера в БД

### 🎯 Что нужно сделать

---

## Фаза 1: Кастомные голоса для исполнителей

**Задача:** У каждого AI исполнителя (La Luz, MELO MC, Kosa, CJ Remi) — уникальный голос ElevenLabs.

**Что сделать:**

1. **Выбрать голоса** из списка ElevenLabs под каждого исполнителя:

| Исполнитель | Стиль | Рекомендуемый голос |
|-------------|-------|---------------------|
| **La Luz** | Reggaeton, Latino | `EkK5I93UQWFDigLMpZcX` — James (Husky, Bold) |
| **MELO MC** | Rap, Trap | `TX3LPaxmHKxFdv7VOQHJ` — Liam (Energetic) |
| **Kosa** | Pop, Ballad | `Z3R5wn05IrDiVCyEkUrK` — Arabella (Mystical) |
| **CJ Remi** | Dance, EDM | `kPzsL2i3teMYv0FxEYQ6` — Brittney (Youthful) |

2. **Обновить БД** — добавить поле `elevenlabs_voice_id` в таблицу `producers`
3. **В хуке** — читать голос из `activeProducer.elevenlabsVoice`, передавать в TTS API
4. **Ант** — добавить UI для предпрослушивания голоса в админке

**Где меняем:**
- `server/index.js` — `/api/tts/generate` (уже принимает voice)
- `useGeneratorLogic.ts` — `handlePlayTTS` (читает `activeProducer.elevenlabsVoice`)
- `producers` таблица в Supabase — добавить `elevenlabs_voice`

---

## Фаза 2: Turbo TTS для реального времени

**Задача:** Ускорить голосовые ответы — вместо `multilingual-v2` (2-5 сек) использовать `turbo-2.5` (0.5-2 сек).

**Что сделать:**
1. В `server/tts.js` — добавить параметр модели: `model: 'elevenlabs/text-to-speech-turbo-2-5'`
2. Для премиум-юзеров (VIP/Legend) — всегда turbo
3. Для Free — обычный multilingual (экономия credits)

**Где меняем:**
- `server/tts.js` — параметр `model` динамически
- `useGeneratorLogic.ts` — передавать `{ turbo: true }` для VIP/Legend

---

## Фаза 3: Диалоговый TTS (Duet)

**Задача:** Два AI исполнителя могут разговаривать/петь дуэтом.

**Пример:** La Luz (James) + Kosa (Arabella) — Latino-поп дуэт.

**API:**
```json
{
  "model": "elevenlabs/text-to-dialogue-v3",
  "input": {
    "dialogue": [
      { "text": "¡Ole, mami!", "voice": "EkK5I93UQWFDigLMpZcX" },
      { "text": "Hej, zaczynamy!", "voice": "Z3R5wn05IrDiVCyEkUrK" }
    ]
  }
}
```

**Где меняем:**
- `server/tts.js` — новый endpoint `/api/tts/dialogue`
- `useGeneratorLogic.ts` — новый handler `handleDialogueTTS`
- **Ант** — UI кнопка "Duet" в чате

---

## Фаза 4: Speech-to-Text (STT)

**Задача:** Ввод голосом через сервер (не браузерный speech recognition).

**Зачем:** Браузерный speech recognition нестабилен, не работает на iOS Safari, нет польского.

**Как сделать:**
1. На фронте — запись аудио с микрофона → upload → отправка на сервер
2. Сервер → KIE speech-to-text API → распознанный текст
3. Результат → в чат как сообщение пользователя

**Где меняем:**
- `server/tts.js` — новый endpoint `/api/stt/recognize`
- `useGeneratorLogic.ts` — новый handler `handleVoiceInput`
- **Ант** — UI для записи и отправки аудио

---

## Фаза 5: Sound Effects & Audio Isolation

**Задача:** 
- Sound effects — добавить звуковые эффекты к трекам (интро, выстрелы, природа)
- Audio isolation — очистить голос из записи

**Где меняем:**
- `server/index.js` — новые endpoints
- `useGeneratorLogic.ts` — по необходимости

---

## 📊 Приоритет

| Фаза | Что | Сложность | Credits | Пользователи |
|------|-----|-----------|---------|--------------|
| **1** | Кастомные голоса | 🟢 Низкая | Бесплатно (те же голоса) | Все |
| **2** | Turbo TTS | 🟢 Низкая | Бесплатно | VIP/Legend |
| **3** | Dialogue TTS | 🟡 Средняя | Дороже (длиннее аудио) | VIP/Legend |
| **4** | STT | 🟡 Средняя | Умеренно | Все |
| **5** | SFX/Audio | 🔴 Высокая | Дорого | PRO |

---

## 🚀 Рекомендация: начать с Фазы 1

1. Выбрать голоса → обновить БД → готово за час
2. Пользователи сразу услышат разницу между исполнителями
3. Минимум кода, максимум эффекта
