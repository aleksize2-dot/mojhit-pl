-- Add guest fields to tracks table
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS guest_session_id TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_unlocked BOOLEAN DEFAULT true;

-- Create guest_limits table
CREATE TABLE IF NOT EXISTS guest_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
