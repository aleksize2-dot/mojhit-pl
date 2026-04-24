-- Create video_tasks table for PRO tier video generation feature
-- Video generation uses Kie.ai MP4 API (https://docs.kie.ai/api/mp4-generation)
-- Videos are retained for 14 days on Kie.ai storage

CREATE TABLE IF NOT EXISTS video_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  audio_task_id UUID NOT NULL REFERENCES kie_tasks(id) ON DELETE CASCADE,
  video_task_id TEXT UNIQUE, -- taskId from Kie.ai MP4 API
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  video_url TEXT, -- final video URL from Kie.ai (expires in 14 days)
  thumbnail_url TEXT, -- thumbnail/image URL (optional)
  expires_at TIMESTAMPTZ, -- when video_url expires (14 days after generation)
  duration_seconds INTEGER, -- video duration in seconds
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_video_tasks_user_id ON video_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_video_tasks_audio_task_id ON video_tasks(audio_task_id);
CREATE INDEX IF NOT EXISTS idx_video_tasks_status ON video_tasks(status);
CREATE INDEX IF NOT EXISTS idx_video_tasks_video_task_id ON video_tasks(video_task_id);
CREATE INDEX IF NOT EXISTS idx_video_tasks_expires_at ON video_tasks(expires_at);

-- Row Level Security (optional, can be disabled for admin access)
ALTER TABLE video_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own video tasks" ON video_tasks;
CREATE POLICY "Users can view own video tasks" ON video_tasks
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own video tasks" ON video_tasks;
CREATE POLICY "Users can insert own video tasks" ON video_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own video tasks" ON video_tasks;
CREATE POLICY "Users can update own video tasks" ON video_tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_video_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_video_tasks_updated_at ON video_tasks;
CREATE TRIGGER update_video_tasks_updated_at
  BEFORE UPDATE ON video_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_video_tasks_updated_at();

-- Ensure users table has subscription_tier column (for PRO tier check)
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));

-- Add video generation permission to admin roles (if admin_roles table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_permissions') THEN
    INSERT INTO admin_permissions (code, description, category)
    VALUES 
      ('video.generate', 'Can generate video from audio tracks', 'video'),
      ('video.view', 'Can view all video generation tasks', 'video'),
      ('video.manage', 'Can update/delete video tasks', 'video')
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;

-- Print confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Created video_tasks table for PRO tier video generation';
END $$;