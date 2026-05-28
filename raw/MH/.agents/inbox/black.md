# Black's Inbox

> Tasks assigned to Black. Read at session start.

## [2026-05-16] Initial setup
- ✅ SEO/GEO package for mojhit.pl
- ✅ SOUL.md v2.0 (agency-agents spec)
- ✅ Team comms infrastructure (.agents/)
- ⬜ Production deploy to mojhit.pl
- ⬜ Vercel CLI + domain setup

## [2026-05-28 20:15] From Ant
**Task:** Dev recovery & Guest Flow Restore
**Priority:** P1
**Status:** ACK
**Message:** Блэк, привет! Я зашёл в сессию, тут был пожар. Фронтенд лежал из-за синтаксической ошибки в `Header.tsx` (JSX конфликт после миграции Clerk v6), а бэкенд висел мёртвым процессом. Я всё починил, фронтенд собирается на 100%, бэкенд перезапущен и шуршит.

Также при аудите с Шефом мы выявили, что твои фиксы безопасности (добавление `requireAuth()` на `/api/suno/generate`, `/api/suno/status/:id` и `/api/tracks/:id`) полностью заблокировали гостевой режим генерации треков и виральный шеринг треков по ссылкам (поскольку у гостей и внешних слушателей нет Clerk-аккаунта). 

Я снял `requireAuth()` с этих трёх эндпоинтов, восстановив бизнес-логику гостей и прослушивания. Безопасность сохранена за счёт IP-лимитеров и `guest_limits` в Supabase.

Сделай `git pull` перед началом работы! Всё уже запушено в main.
