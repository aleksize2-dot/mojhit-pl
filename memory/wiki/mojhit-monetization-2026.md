# Monetization 2026: Launch Strategy & Economy (mojhit.pl)

## 📅 Phased Launch Plan

### Faza 1: Darmowy Start (Tydzień 1-4)
- **Wszyscy 9 producentów = FREE (tier: basic, 0 coins)**
- Cel: zebrać dane — kto generuje najwięcej, co ludzie wybierają
- Nowy user dostaje N-pięć Nut na start
- Gdy Nuty się kończą → modal: **"Kup hity i twórz dalej!"**

### Faza 2: Analiza (Tydzień 4-6)
- Top 3 producentów → FREE (magnesy)
- Środek → basic tier
- Reszta → poprawić lub wymienić

### Faza 3: Subskrypcje (Tydzień 6+)
- Wprowadzenie planów subskrypcyjnych
- Premium producenci za subskrypcją

---

## Model Płatności: Subskrypcja + Doładowanie BLIK

Wzorowane na **openart.ai**: prosty wybór — subskrybujesz lub doładowujesz.

### 🪙 Doładowanie BLIK (Top-Up)

Gdy użytkownik zużyje darmowe Nuty, pojawia się modal z **suwakiem**:

```
┌──────────────────────────────────────┐
│  Twoje darmowe hity się skończyły!   │
│                                      │
│  Kup teraz przez BLIK:               │
│  ────────●───────────                │
│  5            10            20       │
│                                      │
│  10 hitów = 29.99 PLN                │
│           [Zapłać BLIK]              │
└──────────────────────────────────────┘
```

| Hity | Cena BLIK | PLN/hit |
|------|-----------|---------|
| 5 | 14.99 PLN | 3.00 |
| 10 | 24.99 PLN | 2.50 |
| 20 | 39.99 PLN | 2.00 |

### 📆 Subskrypcje (lepsza wartość)

| Plan | Cena/мес | Hity/мес | PLN/hit | Dodatki |
|------|---------|----------|---------|---------|
| **Basic** | 29.99 PLN | 10 | 3.00 | 6 producentów |
| **Pro** | 69.99 PLN | 30 | 2.33 | 9 producentów, priorytet |

### 🧠 Dlaczego to działa

| | Subskrypcja | Doładowanie BLIK |
|---|---|---|
| Dla kogo | Stali użytkownicy | Okazjonalni / impuls |
| Wartość | Lepsza (więcej hitów/PLN) | Szybkie, bez zobowiązań |
| Psychologia | "Opłaca się być stałym" | "Tylko 15 zł i robię dalej" |

---

## User Flow

```
NOWY USER
  → wchodzi na stronę
  → wybiera producenta (wszyscy free)
  → generuje pierwszy hit (za darmo)
  → chce drugi → "Zostały Ci 3 darmowe Nuty"
  → generuje 2gi, 3ci...
  → Nuty = 0
  → ❗ Modal: [Kup 10 hitów za 24.99 BLIK] [Subskrybuj od 29.99/mies]
  → płaci BLIK → hity dodane → tworzy dalej
  → albo subskrybuje → stały dostęp
```

---

## Producer Tier Assignment (Faza 2-3)

| Producent | Faza 1 | Faza 2 | Faza 3 |
|-----------|--------|--------|--------|
| Kosa 🧢 | FREE | FREE | FREE (magnes) |
| MELO MC 💃 | FREE | FREE | FREE (magnes) |
| CJ Remi 🌃 | FREE | Basic | Basic |
| La Luz 🌴 | FREE | Basic | Basic |
| VENA 🩸 | FREE | Basic | Pro |
| DISCO PULS 💙 | FREE | Basic | Pro |
| SOLANA ☀️ | FREE | Pro | Pro |
| POPIÓŁ 🥃 | FREE | Pro | Pro |
| BLIXX 🖤💗 | FREE | Pro | Pro |

---

## Retention Loop

```
FREE hit → "Zajebiste!"
  → więcej hitów → Nuty = 0
  → BLIK top-up → "Jeszcze jeden..."
  → uzależnienie → "Subskrybuję, taniej wychodzi"
  → Pro sub → pełny dostęp → poleca znajomym
```

---

## Payment

- **Subskrypcje:** Stripe (karty, Apple/Google Pay)
- **Doładowania:** BLIK (natychmiastowe, polski standard)
- **Waluta:** PLN

---

## Key Metrics (Faza 1)

| Metryka | Decyzja |
|---------|---------|
| Który producent najwięcej tracków | Kto zostaje FREE |
| Ilu userów wraca po 1szym tracku | Czy produkt trzyma |
| Ile tracków przed pierwszym BLIK | Cena Nut na start |
| Konwersja BLIK → subskrypcja | Efektywność lejka |

---

*Ostatnia aktualizacja: 2026-05-15 — Faza 1 (darmowy start, 9 producentów)*
*Model: Subskrypcja + BLIK doładowanie (wzorowane na openart.ai)*
