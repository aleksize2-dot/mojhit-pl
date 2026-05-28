-- Add Weirdness and Style Influence columns to producers table
-- Suno API parameters: weirdnessConstraint (0.0-1.0) and styleWeight (0.0-1.0)
-- Used to control generation creativity and style adherence per performer

ALTER TABLE producers
ADD COLUMN IF NOT EXISTS weirdness_constraint FLOAT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS style_weight FLOAT DEFAULT NULL;

COMMENT ON COLUMN producers.weirdness_constraint IS 'Suno weirdnessConstraint — controls creativity/unusualness (0.0-1.0)';
COMMENT ON COLUMN producers.style_weight IS 'Suno styleWeight — controls how strongly style prompt influences output (0.0-1.0)';
