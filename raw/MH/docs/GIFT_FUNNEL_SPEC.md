# 🎁 Funnel "Podaruj Muzykę" — Specyfikacja Techniczna dla Entwicklera

**Projekt:** mojhit.pl — AI Music Generator
**Wersja:** 1.0 (MVP Gift Funnel)
**Priorytet:** High
**Szacowany czas:** ~5h

---

## 1. Cel biznesowy

Zbudować w pełni automatyczną ścieżkę konwersji z reklamy społecznościowej (FB/IG) do wygenerowania spersonalizowanego utworu muzycznego i dostarczenia go e-mailem — **bez wymogu rejestracji**.

---

## 2. User Flow

```
① FB Ad → link do /upominek?ref=fb_camp_1

② Landing page "Podaruj Muzykę":
   - Pełny ekran, 6-8 kafelków z gotowymi pomysłami na prezent
   - Każdy kafelek: tytuł, krótki opis, ikona/obrazek
   - Kafelek → przekierowuje do /upominek/:slug

③ /upominek/dla-szefa-na-jubileusz:
   - Obrazek tła + styl (disco, pop, itp.)
   - Tekst piosenki (podgląd z {{placeholderami}})
   - Przycisk "Spersonalizuj i stwórz"

④ Kliknięcie → otwiera się Generator (czat) w trybie "gift"
   - Predefiniowany producent AI (np. Kazik Disco Polo)
   - Predefiniowany prompt startowy:
     "Opisz mi osobę, dla której tworzysz prezent!
     Jak ma na imię? Czym się zajmuje? Może jakaś historia?"

⑤ User wpisuje: "Marek, 55 lat, wędkarz, prezes firmy,
   zawsze pomaga młodszym, uwielbia Disc Polo"

⑥ AI bierze bazowy tekst + input użytkownika
   → zamienia {{NAME}}, {{AGE}}, {{HOBBY_1}}, {{QUALITY_1}} itp.
   → zwraca gotowy tekst do podglądu

⑦ User widzi podgląd → akceptuje lub edytuje

⑧ Jeśli akceptuje → pojawia się pole EMAIL (tylko email):
   "Podaj email, a wyślemy Ci gotowy utwór!"

⑨ Backend:
   - Zapisz w bazie: `tracks` z `guest_session_id` i `guest_email`
   - Wyślij do Suno API → generacja audio
   - Webhook: po zakończeniu → wyślij e-mail przez Brevo

⑩ Email zawiera:
   - Odtwarzacz / link do streamowania
   - Przycisk "Pobierz MP3"
   - Sekcja "Zainteresowany?": pakiet 10 utworów -50%
   - Link "Poleć znajomemu i zbieraj darmowe nuty"
```

---

## 3. Baza Danych (Supabase)

### Nowa tabela: `track_templates`

```sql
CREATE TABLE IF NOT EXISTS public.track_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    cover_image_url TEXT,
    base_lyrics TEXT NOT NULL,
    style_tags TEXT[] DEFAULT '{}',
    mood TEXT DEFAULT 'heartwarming',
    default_producer_id TEXT,
    default_model TEXT DEFAULT 'deepseek-chat',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.track_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active templates"
    ON public.track_templates FOR SELECT
    USING (is_active = true);
```

### Istniejące tabele — brak zmian

Wykorzystujemy:
- `tracks` — pole `guest_session_id`, `guest_email`, `is_paid`
- `kie_tasks` — pipeline generacji
- `producers` — AI performerzy

### Seed danych: 6 szablonów początkowych

```sql
INSERT INTO public.track_templates (slug, title, subtitle, description, style_tags, base_lyrics, default_producer_id, mood) VALUES

('dla-szefa', 'Dla Szefa na Jubileusz', 'Wyraź uznanie z przytupem!',
 'Idealny prezent dla szefa, który zasługuje na wyjątkową laurkę.',
 ARRAY['disco_polo','80s_disco','high_energy'],
 'Hej {{NAME}}, to Twój wielki dzień!
Cała firma składa Ci życzeń bukiet.
{{QUALITY_1}} i {{QUALITY_2}} to Twoja broń,
Taki szef to skarb, każdy powie to!

{{MEMORY}} pamiętamy jak dziś,
Więc dziś gramy i śpiewamy Ci cześć!
Dziękujemy za {{QUALITY_3}}, za każdy dzień,
Z Tobą praca to nie trud, a spełnienie snów!',
 'kazik', 'heartwarming'),

('dla-przyjaciela', 'Dla Kumpla z Paczki', 'Bo przyjaciele to rodzina, którą wybieramy.',
 ARRAY['disco_polo','polish_wave'],
 '{{NAME}}, ziomek z gatunku tych,
Co w potrzebie zawsze jest przy nich!
{{HOBBY_1}} i {{HOBBY_2}} to Twój znak,
Z Tobą nuda to nieznany smak!

{{GIRL_CRUSH}} mówią, że wokół Ciebie świat,
Każda chwila to przygoda, każdy dzień to beat!
Za {{QUALITY_1}} i za {{QUALITY_2}},
Twój przyjaciel dziś Ci śpiewa: na sto lat!',
 'kosa', 'humorous'),

('na-slub', 'Prezent Ślubny', 'Dla Młodej Pary — muzyczna pamiątka na całe życie.',
 ARRAY['pop','ballad','romantic'],
 'Dziś {{NAME_GROOM}} i {{NAME_BRIDE}} łączą swe dłonie,
Miłość wielka jak górskie zbocza.
{{QUALITY_GROOM}} Jego, {{QUALITY_BRIDE}} Jej — to ich bronie,
A przed nimi przyszłość już otwiera furtę!

{{MEMORY}} na zawsze w Waszych sercach gra,
Niech ta melodia przypomina Wam ten dzień.
Życzymy Wam {{WISH}}, miłości bez dna,
I niech Wam gwiazdy świecą przez życia cień!',
 'melo', 'romantic'),

('na-urodziny', 'Życzenia Urodzinowe', 'Najlepsze życzenia w rytmie ulubionego stylu!',
 ARRAY['80s_disco','italo_disco','high_energy'],
 'Wszystkiego najlepszego, {{NAME}}!
Dziś Twoje święto, cały świat należy do Ciebie!
{{AGE}} lat i dalej młoda dusza gra,
{{QUALITY_1}} i {{QUALITY_2}} — to Cię trzyma, wiesz!

{{HOBBY}} niech Ci sprzyja, spełnienia snów,
A {{WISH}} niech zawsze będzie przy Tobie znów!
Sto lat, sto lat, niech żyje, żyje nam!
I zaśpiewaj razem z nami: dziękuję, że jesteś sam!',
 'cj-remi', 'heartwarming'),

('dla-dziewczyny', 'Dla Dziewczyny / Chłopaka', 'Walentynkowy prezent, który zapamięta na długo.',
 ARRAY['pop','ballad','romantic'],
 'Hej {{NAME}}, chcę Ci dzisiaj zaśpiewać,
Bo miłością chcę się z Tobą podzielać.
{{QUALITY_1}} Twoja, {{QUALITY_2}} Twój uśmiech,
Przy Tobie świat nabiera kolorów, wiesz?

{{MEMORY}} wciąż pamiętam, jakby to był wczorajszy dzień,
I {{WISH}} chcę spełnić z Tobą właśnie tu i teraz.
Jesteś {{QUALITY_3}}, najlepsze co mnie spotkało,
Z Tobą nawet niebo wydaje się małe!',
 'melo', 'romantic'),

('imprezowa', 'Hymn Imprezowy', 'Dla duszy towarzystwa — hit na każdą imprezę!',
 ARRAY['disco_polo','80s_disco','high_energy'],
 'Hej {{NAME}}, Ty życie imprezy,
Gdy wchodzisz na parkiet, każdy robi rewerencje!
{{QUALITY_1}} i {{QUALITY_2}} — toTwój styl,
Z Tobą zabawa trwa do białych dnia chwil!

{{MEMORY}} z ostatniej nocy — tego nie da się zapomnieć!
{{WISH}} niech się spełni, a my będziemy Cię wspominać.
Bo {{NAME}} to gość, który wie, jak się bawić,
I z Tobą nawet poniedziałek chce się świętować!',
 'kosa', 'humorous');
```

---

## 4. REST API (Backend Node.js + Supabase)

### 4.1 Publiczne endpointy

```
GET  /api/templates
     → lista aktywnych templatek (slug, title, subtitle, style_tags, cover_image_url, mood)
     → response: { templates: [...] }

GET  /api/templates/:slug
     → szczegóły jednej templatki (w tym base_lyrics z placeholderami)
     → response: { template: {...} }

POST /api/gift/generate
     → generacja utworu z template + personalizacja (guest flow)
     → request: {
         templateSlug: string,
         customData: { NAME: "Marek", ... },
         guestEmail: "marek@example.com",
         style: string // optional, override template style
       }
     → response: { success: true, trackId: "...", message: "Utwór w trakcie generowania" }
     → backend: tworzy track → Suno generate → webhook → email
```

### 4.2 Admin endpointy (wymagają auth + admin)

```
GET    /api/admin/templates           → lista WSZYSTKICH
POST   /api/admin/templates           → tworzy nową
PUT    /api/admin/templates/:id       → edytuje
DELETE /api/admin/templates/:id       → usuwa
```

### 4.3 Generator backend — co zmodyfikować

**Plik:** `server/index.js`

```
1. Endpoint POST /api/suno/generate (linia ~1504):
   - USUNĄĆ requireAuth() — dodać obsługę guest_session_id + guest_email
   - Jeśli req.body.guestEmail istnieje → zapisz do tracks.guest_email
   - Wygeneruj guest_session_id jeśli nie istnieje

2. Dodac POST /api/gift/generate:
   - Przyjmuje templateSlug + customData
   - Pobiera template z bazy
   - Zamienia {{placeholder}} na dane z customData
   - Wywołuje suno generate
   - Zapisuje z guestEmail
   
3. Webhook KIE (/api/webhooks/kie, ~1709):
   - Po otrzymaniu completed → jeśli track ma guest_email → wyślij email
   - Email: link do tracka + upsell (patrz sekcja 7)
```

---

## 5. Frontend (React + TypeScript)

### 5.1 Nowe strony

#### `/upominek` (GiftLanding.tsx)
```
- Pełny ekran z hero "Podaruj Muzykę!"
- Siatka kart (templates z API)
- Każda karta: obrazek, tytuł, tagi stylów
- Kliknięcie → nawigacja do /upominek/:slug
- Obsługa parametru ?ref=... do trackowania kampanii
```

#### `/upominek/:slug` (GiftDetail.tsx)
```
- Hero z obrazkiem tła i tytułem
- Karta stylów (tags)
- Preview tekstu z placeholderami
- Duży przycisk "Spersonalizuj"
- Po kliknięciu → modal / przejście do Generator w trybie gift
```

### 5.2 Modyfikacje istniejących komponentów

#### Generator.tsx
```
- Dodać tryb "gift":
  - Props: { templateMode: boolean, templateSlug?: string }
  - W trybie gift:
    - Pomija wybór producenta (predefiniowany z template)
    - Predefiniowany pierwszy prompt
    - Po zaakceptowaniu utworu → pokazuje pole EMAIL zamiast rejestracji
    - Przycisk "Wyślij na email" zamiast "Zaloguj się"
```

### 5.3 Routing (App.tsx)
```tsx
<Route path="/upominek" element={<GiftLanding />} />
<Route path="/upominek/:slug" element={<GiftDetail />} />
```

---

## 6. AI Prompt — Personalizacja Tekstu

### Prompt dla modelu (DeepSeek/Gemini)

```
Jesteś autorem tekstów piosenek. Otrzymujesz:
1. BAZOWY TEKST: zawiera {{placeholder}} w miejscach do podmiany
2. DANE OD UŻYTKOWNIKA: opis osoby/okazji

Twoje zadanie:
- Zastąp każdy {{placeholder}} odpowiednią wartością z danych użytkownika
- ZACHOWAJ rytm, długość linii i strukturę zwrotek
- Jeśli dane są niekompletne, uzupełnij kreatywnie pasującą treścią
- Dostosuj rodzaj gramatyczny (on/ona, męski/żeński)
- ZWRÓĆ TYLKO zmodyfikowany tekst, bez dodatkowych wyjaśnień

BAZOWY TEKST:
{base_lyrics}

DANE OD UŻYTKOWNIKA:
{userInput}

Zmodyfikowany tekst:
```

---

## 7. Email Template (Brevo)

### Szablon transakcyjny

**Subject:** 🎵 Twój spersonalizowany utwór jest gotowy!

**HTML body:**
```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0f0f0f;color:#fff;font-family:Arial,sans-serif;padding:40px">
<div style="max-width:600px;margin:0 auto;background:#1a1a2e;border-radius:20px;padding:40px;border:1px solid #333">

  <!-- Hero -->
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="color:#8b5cf6;font-size:28px">🎵 Twój utwór jest gotowy!</h1>
    <p style="color:#aaa;font-size:16px">Odbierz spersonalizowany utwór wygenerowany specjalnie dla Ciebie!</p>
  </div>

  <!-- Player / Download -->
  <div style="background:#252542;border-radius:16px;padding:30px;text-align:center;margin-bottom:30px">
    <a href="{{TRACK_URL}}" style="display:inline-block;background:#8b5cf6;color:#fff;padding:16px 50px;border-radius:30px;font-size:18px;font-weight:bold;text-decoration:none">
      ▶️ Odtwórz i Pobierz
    </a>
    <p style="color:#666;font-size:12px;margin-top:10px">Link ważny 7 dni</p>
  </div>

  <!-- Upsell 1: Repeat -->
  <div style="background:linear-gradient(135deg,#8b5cf620,#6366f120);border-radius:16px;padding:20px;margin-bottom:15px">
    <h3 style="color:#fff;font-size:16px">🎁 Stwórz kolejny prezent!</h3>
    <p style="color:#aaa;font-size:14px">Zaskocz jeszcze kogoś wyjątkowym utworem.</p>
    <a href="https://mojhit.pl/upominek" style="color:#8b5cf6;font-weight:bold">→ Stwórz teraz</a>
  </div>

  <!-- Upsell 2: Packages -->
  <div style="background:linear-gradient(135deg,#10b98120,#05966920);border-radius:16px;padding:20px;margin-bottom:15px">
    <h3 style="color:#10b981;font-size:16px">💎 Pakiet PRO -50%</h3>
    <p style="color:#aaa;font-size:14px">10 utworów + teledysk AI + priorytetowa generacja.</p>
    <a href="https://mojhit.pl/cennik?ref=gift_email" style="color:#10b981;font-weight:bold">→ Kup pakiet</a>
  </div>

  <!-- Upsell 3: Referral -->
  <div style="background:#252542;border-radius:16px;padding:20px;margin-bottom:15px">
    <h3 style="color:#fff;font-size:16px">🤝 Poleć i zbieraj</h3>
    <p style="color:#aaa;font-size:14px">Zaproś znajomych i zdobywaj darmowe nuty!</p>
    <a href="https://mojhit.pl/polecaj" style="color:#f59e0b;font-weight:bold">→ Dołącz do programu</a>
  </div>

  <p style="text-align:center;color:#444;font-size:11px;margin-top:30px">
    mojhit.pl — Twój hit w jednym kliknięciu
  </p>
</div>
</body>
</html>
```

---

## 8. Admin Panel

### Nowa zakładka "Szablony Prezentów" w AdminDashboard.tsx

**Funkcjonalność:**
- Lista wszystkich templatek (aktywne + nieaktywne)
- Formularz tworzenia/edycji:
  - Slug (np. dla-szefa)
  - Tytuł, podtytuł, opis
  - Base lyrics (textarea z możliwością podglądu)
  - Style tags (tag input)
  - Mood, default producer (select z listy producerów)
- Przełącznik aktywny/nieaktywny
- Podgląd templatki (jak będzie wyglądać na landing page)

---

## 9. Dashboard / Statystyki (do dodania później)

- Liczba wyświetleń templatki
- Konwersja: odwiedziny → personalizacja → generacja
- Które templatki konwertują najlepiej
- Źródło: ?ref=fb_camp, ?ref=ig_story, itp.

---

## 10. Kolejność Implementacji

| # | Task | Zależności | Czas |
|---|------|-----------|------|
| 1 | SQL: tabela `track_templates` + seed | — | 10 min |
| 2 | API: `GET /api/templates`, `GET /api/templates/:slug` | #1 | 30 min |
| 3 | API: `POST /api/gift/generate` | #1, zmiana w `/api/suno/generate` | 30 min |
| 4 | Backend: webhook email wysyłka | #3, emailService.js | 30 min |
| 5 | Frontend: `/upominek` landing page | #2 | 1h |
| 6 | Frontend: `/upominek/:slug` detail + gift mode | #2, #3, mod. Generator.tsx | 1.5h |
| 7 | Admin: szablony CRUD | #1 | 45 min |
| 8 | Email: szablon HTML z upsellem | #4 | 15 min |
| | **Razem** | | **~5h** |

---

## 11. Uwagi Techniczne

- **Guest session ID** — generować UUID i zapisywać w localStorage dla kontynuacji
- **Bez rejestracji** — guest flow nie wymaga konta Clerk. Tylko email.
- **Rate limit** — 1 generacja na IP / 24h dla gości (guest_limits table)
- **Brevo** — używać transactional email API (nie campaign) dla natychmiastowej dostawy
- **Link do tracka** — tymczasowy, ważny 7 dni (pole `expires_at` w tokens lub signed URL)
- **Cloudflare R2** — audio już tam trafia, link można dać signed
