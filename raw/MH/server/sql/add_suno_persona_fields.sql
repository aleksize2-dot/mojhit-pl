-- Add Suno Persona fields to producers table for AI producer personas feature
-- Supports storing persona IDs from Suno API and linking to source audio

-- 1. Add suno_persona_id – Suno's persona identifier returned by generate-persona endpoint
ALTER TABLE producers ADD COLUMN IF NOT EXISTS suno_persona_id TEXT NULL;
COMMENT ON COLUMN producers.suno_persona_id IS 'Suno API persona ID for voice cloning/replication';

-- 2. Add suno_persona_model – Which Suno model this persona is compatible with (e.g., V4_5ALL)
ALTER TABLE producers ADD COLUMN IF NOT EXISTS suno_persona_model TEXT NULL;
COMMENT ON COLUMN producers.suno_persona_model IS 'Suno model version this persona works with';

-- 3. Add source_audio_url – Original audio used to create the persona
ALTER TABLE producers ADD COLUMN IF NOT EXISTS source_audio_url TEXT NULL;
COMMENT ON COLUMN producers.source_audio_url IS 'URL of source audio used to create this persona';

-- 4. Add source_task_id – Task ID of the original generation (can be Suno or Kie)
ALTER TABLE producers ADD COLUMN IF NOT EXISTS source_task_id TEXT NULL;
COMMENT ON COLUMN producers.source_task_id IS 'Task ID of original generation (Suno/KIE)';

-- 5. Add vocal_start – Start time of vocal segment used for persona (seconds)
ALTER TABLE producers ADD COLUMN IF NOT EXISTS vocal_start INTEGER DEFAULT 0;
COMMENT ON COLUMN producers.vocal_start IS 'Start time of vocal segment used for persona (0-30 seconds)';

-- 6. Add vocal_end – End time of vocal segment used for persona (seconds)
ALTER TABLE producers ADD COLUMN IF NOT EXISTS vocal_end INTEGER DEFAULT 30;
COMMENT ON COLUMN producers.vocal_end IS 'End time of vocal segment used for persona (0-30 seconds)';

-- 7. Add type – Distinguish between different producer types
ALTER TABLE producers ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'custom' CHECK (type IN ('suno', 'kie', 'custom'));
COMMENT ON COLUMN producers.type IS 'Producer type: suno (Suno persona), kie (Kie-style), custom (user-defined)';

-- 8. Add is_active if missing (should already exist per schema)
ALTER TABLE producers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
COMMENT ON COLUMN producers.is_active IS 'Whether producer is available for use';

-- 9. Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_producers_type ON producers(type);
CREATE INDEX IF NOT EXISTS idx_producers_suno_persona ON producers(suno_persona_id) WHERE suno_persona_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_producers_user_active ON producers(is_active) WHERE is_active = true;

-- 10. Add constraint to ensure vocal range is valid (0-30 seconds typical for Suno)
ALTER TABLE producers DROP CONSTRAINT IF EXISTS check_vocal_range;
ALTER TABLE producers ADD CONSTRAINT check_vocal_range CHECK (
  vocal_start >= 0 AND 
  vocal_end >= 0 AND 
  vocal_start <= vocal_end AND
  vocal_end <= 120 -- Max 2 minutes, conservative limit
);

-- 11. Add subscription tier to users table (free, pro, enterprise)
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));
COMMENT ON COLUMN users.subscription_tier IS 'User subscription tier for feature access';

-- 12. Add index for subscription tier queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

-- 13. Add example producer of type 'suno' for testing/demo (optional)
-- INSERT INTO producers (id, name, avatar_url, system_prompt, style_tags, rental_price_coins, type, suno_persona_model)
-- VALUES (
--   'demo_suno_persona',
--   'Suno Voice Clone Demo',
--   'https://example.com/avatar.jpg',
--   'An AI producer created from a Suno-generated track with unique vocal characteristics',
--   ARRAY['pop', 'electronic'],
--   10,
--   'suno',
--   'V4_5ALL'
-- ) ON CONFLICT (id) DO NOTHING;

-- Print confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Added Suno Persona fields to producers table and subscription tier to users';
END $$;