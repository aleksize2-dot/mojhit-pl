-- 1. Добавляем новые колонки в таблицу users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT false;

-- Функция для генерации уникального referral_code (будет полезна если захочешь обновить всех существующих юзеров)
CREATE OR REPLACE FUNCTION generate_referral_code(email_str text, id_str text)
RETURNS text AS $$
DECLARE
    prefix text;
    suffix text;
BEGIN
    prefix := UPPER(SUBSTRING(SPLIT_PART(email_str, '@', 1) FROM 1 FOR 4));
    suffix := UPPER(SUBSTRING(id_str FROM 1 FOR 4));
    RETURN prefix || '_' || suffix;
END;
$$ LANGUAGE plpgsql;

-- Опционально: Обновляем старых пользователей, чтобы у всех был referral_code
UPDATE public.users 
SET referral_code = generate_referral_code(email, id::text) 
WHERE referral_code IS NULL AND email IS NOT NULL;

-- 2. Таблица для отслеживания бесплатных бонусов (Ноты) за регистрацию реферала
CREATE TABLE IF NOT EXISTS public.referral_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reward_notes INTEGER DEFAULT 0,
    reward_coins INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(referrer_id, referee_id) -- Один юзер не может дважды принести бонус одному и тому же рефереру
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral rewards"
    ON public.referral_rewards FOR SELECT
    USING (auth.uid()::text = referrer_id::text OR auth.uid()::text = referee_id::text);

-- 3. Таблица для отслеживания реального заработка (PLN) для партнеров-инфлюенсеров
CREATE TABLE IF NOT EXISTS public.affiliate_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    purchase_amount DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view their own earnings"
    ON public.affiliate_earnings FOR SELECT
    USING (auth.uid()::text = affiliate_id::text);

-- Добавляем политику для админа на просмотр всех начислений
CREATE POLICY "Admin can view and manage all affiliate earnings"
    ON public.affiliate_earnings FOR ALL
    USING (auth.uid()::text = 'user_3BiIa5lj5AiMLDvGL2OqjEDbqLh'); -- Твой Clerk Admin ID

-- И для referral_rewards тоже добавим админскую политику
CREATE POLICY "Admin can view and manage all referral rewards"
    ON public.referral_rewards FOR ALL
    USING (auth.uid()::text = 'user_3BiIa5lj5AiMLDvGL2OqjEDbqLh');
