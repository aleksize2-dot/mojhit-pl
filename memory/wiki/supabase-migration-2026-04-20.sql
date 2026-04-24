-- Supabase Migration Script for mojhit.pl
-- Date: 2026-04-20
-- Purpose: Add missing columns, create new tables, ensure indexes and RLS policies.

BEGIN;

-- 1. Add missing columns to existing tables

-- transactions: add reference_id and description
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS reference_id TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN public.transactions.reference_id IS 'External reference (e.g., Stripe charge ID, track ID)';
COMMENT ON COLUMN public.transactions.description IS 'Human-readable description of the transaction';

-- 2. Create function increment_likes (if missing)
CREATE OR REPLACE FUNCTION public.increment_likes(track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tracks 
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Create table promocodes (discount/promo codes)
CREATE TABLE IF NOT EXISTS public.promocodes (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('coins', 'notes', 'percent', 'fixed')),
    value INTEGER NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promocodes_valid 
ON public.promocodes(valid_until DESC);

COMMENT ON TABLE public.promocodes IS 'Promotion codes for coins/notes discounts';

-- 4. Create table contests (competitions)
CREATE TABLE IF NOT EXISTS public.contests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    prize_coins INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contests_active 
ON public.contests(is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_contests_dates 
ON public.contests(start_at, end_at);

COMMENT ON TABLE public.contests IS 'Competitions for users (e.g., best track)';

-- 5. Create table guest_sessions (anonymous guest tracking)
CREATE TABLE IF NOT EXISTS public.guest_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_session_id TEXT NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    converted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_converted 
ON public.guest_sessions(converted_at) 
WHERE converted_at IS NULL;

COMMENT ON TABLE public.guest_sessions IS 'Anonymous guest sessions (lead‑magnet / shadow accounts)';

-- 6. Ensure indexes for performance

-- tracks: index on user_id and created_at (should already exist, but safe)
CREATE INDEX IF NOT EXISTS idx_tracks_user_id ON public.tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON public.tracks(created_at DESC);

-- users: index on clerk_id (should be unique already)
-- kie_tasks: index on status and created_at
CREATE INDEX IF NOT EXISTS idx_kie_tasks_status ON public.kie_tasks(status);
CREATE INDEX IF NOT EXISTS idx_kie_tasks_created_at ON public.kie_tasks(created_at DESC);

-- transactions: index on user_id and created_at
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 7. Enable Row‑Level Security (RLS) on new tables (if RLS is already enabled)

DO $$
BEGIN
    -- Enable RLS on promocodes
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'promocodes' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.promocodes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on contests
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'contests' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on guest_sessions
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'guest_sessions' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 8. Create basic RLS policies
--    Using DROP POLICY IF EXISTS + CREATE POLICY pattern because PostgreSQL 
--    doesn't support CREATE POLICY IF NOT EXISTS.

-- promocodes: allow anyone to read active promocodes
DROP POLICY IF EXISTS "Allow read active promocodes" ON public.promocodes;
CREATE POLICY "Allow read active promocodes" 
ON public.promocodes 
FOR SELECT 
USING (valid_until IS NULL OR valid_until > NOW());

-- contests: allow anyone to read active contests
DROP POLICY IF EXISTS "Allow read active contests" ON public.contests;
CREATE POLICY "Allow read active contests" 
ON public.contests 
FOR SELECT 
USING (is_active = true);

-- guest_sessions: allow insert for new guest sessions
DROP POLICY IF EXISTS "Allow insert guest sessions" ON public.guest_sessions;
CREATE POLICY "Allow insert guest sessions" 
ON public.guest_sessions 
FOR INSERT 
WITH CHECK (true);

-- guest_sessions: select only own session (by guest_session_id)
DROP POLICY IF EXISTS "Allow select own guest session" ON public.guest_sessions;
CREATE POLICY "Allow select own guest session" 
ON public.guest_sessions 
FOR SELECT 
USING (guest_session_id = current_setting('request.headers')::json->>'guest-session-id');

-- 9. Update schema version (optional)
-- INSERT INTO public.schema_migrations (version, applied_at) VALUES ('2026-04-20', NOW());

COMMIT;

-- Verify changes
SELECT 'Migration completed successfully.' AS status;
