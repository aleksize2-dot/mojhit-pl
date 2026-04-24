-- 1. Создание таблицы lyrics
CREATE TABLE IF NOT EXISTS public.lyrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT false,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    uses_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Настройка RLS (Row Level Security)
ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;

-- 3. Политика для чтения (разрешаем читать всем, даже неавторизованным юзерам, для SEO)
CREATE POLICY "Public lyrics are viewable by everyone."
    ON public.lyrics FOR SELECT
    USING ( true );

-- 4. Политика для вставки (только админы или система) - пока оставим пустой, вставляем напрямую через сервис

-- 5. Вставка первых тестовых данных (База текстов)
INSERT INTO public.lyrics (slug, title, content, category, tags, is_premium)
VALUES 
(
    'impreza-w-szczecinie', 
    'Impreza w Szczecinie do rana', 
    '[Verse 1]
Wpadam na bulwary, wiatr od Odry wieje
Dzisiaj w Szczecinie grube są nadzieje
Koledzy dzwonią, już czekają w porcie
Dzisiaj zapominamy o codziennym sporcie

[Chorus]
Impreza w Szczecinie aż do rana
Wjeżdża na stół zimna śmietana (z wódką!)
Miasto nie śpi, my nie śpimy też
Bawimy się grubo, dobrze o tym wiesz!

[Verse 2]
Wały Chrobrego świecą jak Las Vegas
Krzyczę do kumpla: stary, nie uciekasz!
Zaraz lecimy gdzieś na deptak Bogusława
Tu się zaczyna prawdziwa zabawa!',
    'Impreza', 
    'polish disco, dance, upbeat, party, bass', 
    false
),
(
    'zyczenia-urodzinowe-dla-szefa',
    'Życzenia urodzinowe dla Szefa',
    '[Verse 1]
Wchodzę do biura, dzisiaj wielki dzień
Szef ma urodziny, znika każdy cień
Nie ma deadline''ów, nie ma ASAPów
Dzisiaj jest czas dla biurowych chłopaków

[Chorus]
Sto lat dla szefa, niech żyje nam!
Niech każdy projekt udaje się sam!
Więcej premii i mniej stresu
Życzymy pasma samego sukcesu!

[Outro]
I mała prośba od całego teamu...
Może podwyżka w ramach tego rymu? (żart!)',
    'Urodziny',
    'pop, acoustic, funny, happy, cheerful',
    false
),
(
    'zlamane-serce-warszawa',
    'Złamane serce w Warszawie',
    '[Verse 1]
Siedzę w Złotych Tarasach i patrzę w dół
Został mi po tobie tylko smutku pół
Zabrałaś klucze, zabrałaś mój czas
Nie ma już "my", nie ma już nas

[Chorus]
Warszawski deszcz zmywa twoje ślady
Zostały mi w głowie tylko twoje wady
Metro uciekło, tak jak nasza miłość
Została mi w sercu tylko pusta zawiłość

[Verse 2]
Idę Nowym Światem, szukam zapomnienia
Kupuję kawę, nie mam nic do stracenia
Zablokowany numer, usunięte zdjęcia
To koniec tego smutnego zaklęcia.',
    'Miłość',
    'sad rap, lo-fi, chill, melancholic, trap beat',
    false
),
(
    'rap-o-ciezkiej-pracy-piatek',
    'Rap o ciężkiej pracy (Piątek)',
    '[Verse 1]
Poniedziałek rano, budzik znowu wyje
Kolejny tydzień, a ja ledwo żyję
Szef patrzy na ręce, system znowu padł
Zastanawiam się, ile warty jest ten świat

[Chorus]
Ale w końcu jest piątek, piąteczek, piątunio!
Zrzucam z siebie stres, oddycham pełną piersią
Zamykam laptopa, uciekam stąd w mig
Dzisiaj wjeżdża relaks, a nie żaden trik!

[Outro]
Weekend to wolność, weekend to mój czas
W poniedziałek wrócę... ale jeszcze nie raz!',
    'Rap',
    'hardcore rap, fast flow, trap, bass, energetic',
    true
)
ON CONFLICT (slug) DO NOTHING;
