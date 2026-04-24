-- 1. Remove duplicate FK
ALTER TABLE public.kie_track_variants DROP CONSTRAINT IF EXISTS fk_kie_track_variants_task_id;

-- 2. Add FK for tracks.kie_task_id (PG doesn't support IF NOT EXISTS for constraints)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tracks_kie_task_id_fkey'
  ) THEN
    ALTER TABLE public.tracks
      ADD CONSTRAINT tracks_kie_task_id_fkey
      FOREIGN KEY (kie_task_id) REFERENCES public.kie_tasks(id);
  END IF;
END $$;

-- 3. Fix track links
UPDATE public.tracks SET kie_task_id = 'a90753b1-1ef4-4cfe-94ac-44c9ba5cf3de'
  WHERE id = 'cc08b055-5725-4d65-9fba-3c4d4991be73';

UPDATE public.tracks SET kie_task_id = 'bb9cf542-a16e-43c3-a870-cc67227f5bfa'
  WHERE title = 'Alex idzie spać';

UPDATE public.tracks SET kie_task_id = 'f89c0bcf-fab3-4399-9507-1c785f08e0e0'
  WHERE id = '191521a8-7a57-4bb9-9eee-0b6f091cb903';

SELECT 'Schema fixes applied!' AS status;
