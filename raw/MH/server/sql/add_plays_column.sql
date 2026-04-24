-- Add plays column to tracks table for play count tracking
ALTER TABLE tracks 
ADD COLUMN IF NOT EXISTS plays INTEGER NOT NULL DEFAULT 0;

-- Update existing tracks to have plays = 0 (if they were null)
UPDATE tracks SET plays = 0 WHERE plays IS NULL;

-- Create index for ordering by popularity
CREATE INDEX IF NOT EXISTS idx_tracks_plays ON tracks(plays DESC);

-- Comment
COMMENT ON COLUMN tracks.plays IS 'Number of times the track has been played (streamed)';