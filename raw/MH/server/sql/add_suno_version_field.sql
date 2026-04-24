-- Add suno_version field to producers table for selecting Suno model version per producer
-- This allows each AI producer to specify which Suno model to use for music generation

-- 1. Add suno_version column with default 'V4'
ALTER TABLE producers ADD COLUMN IF NOT EXISTS suno_version TEXT DEFAULT 'V4';
COMMENT ON COLUMN producers.suno_version IS 'Suno model version to use for this producer (V4, V4_5, V4_5PLUS, V4_5ALL, V5_5, V5)';

-- 2. Update existing producers to have default value
UPDATE producers SET suno_version = 'V4' WHERE suno_version IS NULL;

-- 3. Add index for faster queries (optional)
CREATE INDEX IF NOT EXISTS idx_producers_suno_version ON producers(suno_version);

-- Print confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Added suno_version field to producers table';
END $$;