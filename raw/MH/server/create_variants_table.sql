-- Создание таблицы для хранения вариантов треков от kie.ai
CREATE TABLE IF NOT EXISTS public.kie_track_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.kie_tasks(id) ON DELETE CASCADE,
    variant_index INTEGER NOT NULL, -- 0, 1 и т.д.
    audio_url TEXT,
    image_url TEXT,
    stream_audio_url TEXT,
    title TEXT,
    tags TEXT,
    duration DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, variant_index)
);

-- Индекс для быстрого поиска вариантов по task_id
CREATE INDEX IF NOT EXISTS idx_kie_track_variants_task_id ON public.kie_track_variants(task_id);

-- Комментарий к таблице
COMMENT ON TABLE public.kie_track_variants IS 'Варианты треков, сгенерированные kie.ai для одной задачи';

-- Пример запроса для получения всех вариантов трека:
-- SELECT * FROM kie_track_variants WHERE task_id = '...' ORDER BY variant_index;