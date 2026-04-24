-- Добавить поле cover_image_url в таблицу tracks
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Индекс для быстрого поиска треков с обложкой
CREATE INDEX IF NOT EXISTS idx_tracks_cover_image ON public.tracks(cover_image_url) WHERE cover_image_url IS NOT NULL;

-- Обновить существующие треки: скопировать image_url из kie_tasks (если есть связь)
UPDATE public.tracks t
SET cover_image_url = kt.image_url
FROM public.kie_tasks kt
WHERE t.kie_task_id = kt.id
  AND kt.image_url IS NOT NULL
  AND t.cover_image_url IS NULL;

SELECT 'Cover image column added!' AS status;
