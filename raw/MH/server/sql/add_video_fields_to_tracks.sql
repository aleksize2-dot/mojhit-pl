-- Add video generation fields to tracks table
-- This allows tracks to store associated generated videos from Kie.ai MP4 API
-- Videos are retained for 14 days on Kie.ai storage (same as audio)

-- 1. Add video_task_id to track the Kie video task ID (for deduplication/status)
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS video_task_id TEXT;

-- 2. Add video URL (expires in 14 days from Kie.ai)
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 3. Add video thumbnail (preview image)
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;

-- 4. Add video duration in seconds
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS video_duration_seconds INTEGER;

-- 5. Add video expiration timestamp
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS video_expires_at TIMESTAMPTZ;

-- 6. Add indexes for faster queries (especially for checking expired videos)
CREATE INDEX IF NOT EXISTS idx_tracks_video_task_id ON tracks(video_task_id);
CREATE INDEX IF NOT EXISTS idx_tracks_video_expires_at ON tracks(video_expires_at);

-- 7. Add comment for documentation
COMMENT ON COLUMN tracks.video_task_id IS 'Kie.ai video task ID for tracking MP4 generation';
COMMENT ON COLUMN tracks.video_url IS 'URL to generated MP4 video (expires in 14 days)';
COMMENT ON COLUMN tracks.video_thumbnail_url IS 'Thumbnail/preview image for the video';
COMMENT ON COLUMN tracks.video_duration_seconds IS 'Duration of generated video in seconds';
COMMENT ON COLUMN tracks.video_expires_at IS 'When the video URL expires (14 days from generation)';

-- 8. Optional: Function to clean up expired video data (can be scheduled via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_videos()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE tracks
  SET 
    video_url = NULL,
    video_thumbnail_url = NULL,
    video_duration_seconds = NULL,
    video_expires_at = NULL,
    video_task_id = NULL
  WHERE video_expires_at IS NOT NULL 
    AND video_expires_at < NOW();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Print confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Added video columns (video_url, video_thumbnail_url, video_duration_seconds, video_expires_at, video_task_id) to tracks table';
END $$;
