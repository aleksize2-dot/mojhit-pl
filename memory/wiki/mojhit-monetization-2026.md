# Monetization 2026: Plans, Packages & Economy (mojhit.pl)

## Core Economy (Soft vs Hard Currency)
- **Złote Monety (Hard Currency):** Kupowane za pieniądze (BLIK / Stripe), nie przepadają. 1 moneta = 1 piosenka.
- **Nuty (Soft Currency):** Waluta bonusowa za aktywność (np. logowanie, polecenia, udostępnianie na TikToku). Limitowane czasowo. Używane w pierwszej kolejności.

## Subscription Tiers (Role w imperium muzycznym)
1. **Free (Hobbysta):** 5-10 Nót na start. Dostęp tylko do DJ Marka (działającego na modelu Gemini).
2. **Basic (Twórca):** Pula monet + bonusowe Nuty. Dostęp do Marka i Kuby "Kosy" (Gemini).
3. **Pro (Producent):** Największa pula monet. Dostęp do wszystkich agentów, w tym ekskluzywnej Mai (Claude 3.7 Sonnet) oraz Kosy (Grok). **Video generation** – możliwość tworzenia wideo z wygenerowanych utworów (optymalizowane pod TikTok/Reels/Shorts). Brak znaków wodnych, priorytetowa generacja.

## Seasonal / Exclusive Packages ("Guest Star" Model)
Oprócz stałych subskrypcji, użytkownicy mogą wykupić jednorazowe pakiety (np. płatność BLIK), które odblokowują **tymczasowych, specjalistycznych agentów**.
- **WESELE:** Producentka Pani Basia (styl weselny, toasty).
- **STORY/REELS:** Producent Viral Victor (dynamiczne tło 15/30/60s pod TikToka).
- **URODZINY:** Solenizant Sam.

Po wykupieniu, nowy awatar pojawia się w panelu wyboru na określony czas (np. 7 dni lub na limit użyć). Gdy czas mija, awatar "szarzeje", zachęcając do ponownego zakupu.

## LLM Tiering Architecture (Technical)
- **Free/Basic Users:** Zapytania są kierowane do tańszych, ale szybkich modeli (np. Google Gemini 3.1 Flash Lite) z ograniczonym wyborem agentów.
- **Pro Users:** Dostęp do premium modeli:
  - DJ Marek -> Gemini
  - Maja -> Claude 3.7 Sonnet
  - Kuba "Kosa" -> Grok 4 Fast

## Payment Gateways
- **Podskrypcje (MRR):** Stripe (karty) lub Apple/Google Pay.
- **Pakiety (Jednorazowe "Impulse Buys"):** BLIK (szybkie odblokowanie dostępu).

## Database Architecture Requirements
- `user_profile`: `coins_balance`, `notes_balance`, `subscription_tier`, `llm_model_access`.
- `user_producers`: Relacja użytkownik-producent z polem `expiry_date` dla agentów pakietowych.