-- SQL для добавления необходимых полей и функции для кнопок mojhit.pl

-- 1. Добавляем поле expired в таблицу tracks (логическое удаление)
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS expired BOOLEAN DEFAULT FALSE;

-- 2. Добавляем поле likes в таблицу tracks (счётчик лайков)
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- 3. Создаём индекс для быстрого поиска expired треков
CREATE INDEX IF NOT EXISTS idx_tracks_expired ON public.tracks(expired) WHERE expired = true;

-- 4. Создаём индекс для поля likes (опционально)
CREATE INDEX IF NOT EXISTS idx_tracks_likes ON public.tracks(likes);

-- 5. Создаём функцию для увеличения счётчика лайков (для RPC вызова)
CREATE OR REPLACE FUNCTION public.increment_likes(track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tracks 
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Проверяем, что поле audio_url заполнено для существующих записей
-- (Опционально: обновляем audio_url из kie_tasks для AI-треков, если нужно)
-- SELECT * FROM public.tracks WHERE audio_url IS NULL;

-- 7. Добавляем поле shares для счётчика шаринга (опционально)
-- ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0;

-- Выполнить все запросы в Supabase SQL Editor.
-- После выполнения перезапускать сервер не нужно — изменения в БД сразу生效.