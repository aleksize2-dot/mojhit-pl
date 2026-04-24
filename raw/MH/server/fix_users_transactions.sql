-- =============================================
-- Fix users & transactions tables
-- Created: 2026-04-20
-- =============================================

-- =============================================
-- 1. USERS TABLE
-- =============================================

-- 1.1 Add missing columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
  -- 'active', 'banned', 'shadow' — для CRM управления
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ip_address INET;
  -- Anti-fraud: IP при регистрации
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;
  -- Anti-fraud: fingerprint устройства
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
  -- Последний вход через Clerk

-- 1.2 Set defaults for existing rows
UPDATE public.users SET created_at = NOW() WHERE created_at IS NULL;
UPDATE public.users SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE public.users SET status = 'active' WHERE status IS NULL;

-- 1.3 Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 1.4 Indexes
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE email IS NOT NULL AND email != '';

-- 1.5 Constraints
ALTER TABLE public.users ADD CONSTRAINT uq_users_clerk_id UNIQUE (clerk_id);

-- =============================================
-- 2. TRANSACTIONS TABLE
-- =============================================

-- 2.1 Add missing columns
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS metadata JSONB;
  -- Доп. данные: промокод, источник, и т.д.

-- 2.2 Trigger for updated_at
DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2.3 Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions(user_id, type);

-- 2.4 Foreign Key (IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_user_id_fkey'
  ) THEN
    ALTER TABLE public.transactions
      ADD CONSTRAINT transactions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- =============================================
-- 3. RLS Policies (Row Level Security)
-- =============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users: can read own data
DROP POLICY IF EXISTS users_read_own ON public.users;
CREATE POLICY users_read_own ON public.users
  FOR SELECT USING (auth.uid()::text = clerk_id);

-- Users: can update own data (email, etc.)
DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Service role: full access (automatic via service_role key)

-- Transactions: can read own
DROP POLICY IF EXISTS transactions_read_own ON public.transactions;
CREATE POLICY transactions_read_own ON public.transactions
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text)
  );

-- Transactions: can insert own
DROP POLICY IF EXISTS transactions_insert_own ON public.transactions;
CREATE POLICY transactions_insert_own ON public.transactions
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text)
  );

-- =============================================
-- 4. Seed: default coins/notes for users with NULL
-- =============================================
UPDATE public.users SET coins = 0 WHERE coins IS NULL;
UPDATE public.users SET notes = 0 WHERE notes IS NULL;

-- Cast notes from TEXT to INTEGER if needed
ALTER TABLE public.users ALTER COLUMN notes TYPE INTEGER USING notes::INTEGER;

-- =============================================
SELECT 'Users & Transactions tables fixed!' AS status;
