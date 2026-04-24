-- Add variant_index and producer_id to tracks table
-- Also add persona_id to kie_tasks for AI producer linking

-- 1. Add variant_index to tracks (0 for first variant, 1 for second, etc.)
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS variant_index INTEGER DEFAULT 0;
COMMENT ON COLUMN tracks.variant_index IS 'Index of track variant (0-based) from KIE generation';

-- 2. Add producer_id to tracks (references producers.id)
-- First drop the column if it exists with wrong type
ALTER TABLE tracks DROP COLUMN IF EXISTS producer_id;
-- Add as TEXT to match producers.id type
ALTER TABLE tracks ADD COLUMN producer_id TEXT REFERENCES producers(id) ON DELETE SET NULL;
COMMENT ON COLUMN tracks.producer_id IS 'AI producer that helped create this track';

-- 3. Add persona_id to kie_tasks (Suno/KIE persona identifier)
ALTER TABLE kie_tasks ADD COLUMN IF NOT EXISTS persona_id TEXT;
COMMENT ON COLUMN kie_tasks.persona_id IS 'Persona ID (Suno persona or producer ID) used for generation';

-- 4. Add unique constraint to prevent duplicate tracks for same kie_task_id + variant_index
ALTER TABLE tracks DROP CONSTRAINT IF EXISTS unique_kie_task_variant;
ALTER TABLE tracks ADD CONSTRAINT unique_kie_task_variant UNIQUE (kie_task_id, variant_index);

-- 5. Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tracks_variant ON tracks(variant_index);
CREATE INDEX IF NOT EXISTS idx_tracks_producer ON tracks(producer_id);
CREATE INDEX IF NOT EXISTS idx_tracks_kie_task_variant ON tracks(kie_task_id, variant_index);
CREATE INDEX IF NOT EXISTS idx_kie_tasks_persona ON kie_tasks(persona_id);

-- 6. Update existing tracks: set variant_index = 0 where null
UPDATE tracks SET variant_index = 0 WHERE variant_index IS NULL;

-- Print confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Added variant_index and producer_id to tracks, persona_id to kie_tasks';
END $$;