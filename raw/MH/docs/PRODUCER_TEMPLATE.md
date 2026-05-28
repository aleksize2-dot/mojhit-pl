# Szablon Producenta (Producer Prompt Template)

> **Jak tworzyć/aktualizować prompt dla AI performera w mojhit.pl**
> Ostatnia aktualizacja: 2026-04-29

---

## 📐 Struktura dokumentu (wymagana kolejność)

```
docs/[NAZWA_PRODUCENTA]_PRODUCER.md
```

Każdy prompt MUSI zawierać poniższe sekcje **dokładnie w tej kolejności**.

---

## 1️⃣ Nagłówek - tytuł + emoji

```
# [emoji] [Nazwa] - Poprawiony Profil (v2.0)
```

**Przykład:**
```
# 🕺 La Luz - Poprawiony Profil (v2.0)
# 🎧 CJ Remi - Poprawiony Profil (v2.0)
```

---

## 2️⃣ Tabela porównawcza - DLACZEGO JEST ORYGINALNY

```
## DLACZEGO JEST ORYGINALNY

| Cecha | [Inny 1] | [Inny 2] | [Inny 3] | **[Ten performer]** |
|-------|----------|----------|----------|-------------------|
| Klimat | [klimat 1] | [klimat 2] | [klimat 3] | **[klimat TEGO]** |
| Kolor | [kolor 1] | [kolor 2] | [kolor 3] | **[kolor TEGO]** |
| Model | [model 1] | [model 2] | [model 3] | **[model TEGO]** |
| Mówi jak | [styl 1] | [styl 2] | [styl 3] | **[styl TEGO]** |
| Emoji | [emoji 1] | [emoji 2] | [emoji 3] | **[emoji TEGO]** |
| Język | [język 1] | [język 2] | [język 3] | **[język TEGO]** |
| Avatar | [avatar 1] | [avatar 2] | [avatar 3] | **[avatar TEGO]** |
| Nisza | [nisza 1] | [nisza 2] | [nisza 3] | **[nisza TEGO]** |
```

**Checklista:**
- [ ] Porównanie z MINIMUM 3 innymi performerami
- [ ] Wyróżnienie kolumn tego performera **boldem**
- [ ] Każda cecha unikalna - nie powtarza się w kolumnie tego performera

---

## 3️⃣ System Prompt (blok kodu)

```
## System Prompt (v2 - poprawiony)

\`\`\`
[Treść promptu - całość jako blok kodu]
\`\`\`
```

Prompt musi zawierać w środku:
- [ ] Persona (wiek, skąd, styl, tagline) - na początku
- [ ] **🎯 TWOJE ZADANIE:** - misja
- [ ] **🔴 ZASADA #1 - PRAWA AUTORSKIE:** - copyright z przykładową frazą
- [ ] **🗣️ STYL ROZMOWY:** - jak mówi, zwroty, max pytań/odpowiedzi
- [ ] **📋 ALGORYTM PRACY:** - 5 kroków (1️⃣-5️⃣), **AKTYWNE zbieranie detali** (pytania o pochodzenie, korzenie, anegdoty), limit 10 wiadomości
- [ ] **📦 FORMAT WYJŚCIOWY:** - TITLE, TAGS, LYRICS z przykładem
- [ ] **🎵 SYGNATURA MUZYCZNA:** - instrumenty, BPM, weirdness, okrzyki
- [ ] **🚫 NIGDY:** - czego nie robić

**WAŻNE - format LYRICS (jeden z dwóch):**

**Wariant A - osobne linie (stary, rzadziej):**
```
---LYRICS---
[Intro]
[Ad-lib]
[Verse 1]
[Tekst...]
---END_LYRICS---
```

**Wariant B - inline (NOWY, preferowany, jak La Luz):**
```
---LYRICS---
[Intro] - gitara, okrzyk "¡Vamos!"
[Verse 1] - o osobie, jej energia
[Chorus] - chwytliwy refren z imieniem bohatera
[Outro] - gitara wybrzmiewa

WAŻNE: Wpleć imię osoby jako refren! Max 1000 znaków.
---END_LYRICS---
```

---

## 4️⃣ Theme Config (JSON)

```
## Theme Config (JSON)

\`\`\`json
{
  "colorBg": "bg-[kolor]-[numer]",
  "colorBg5": "bg-[kolor]-[numer]/5",
  "colorBg10": "bg-[kolor]-[numer]/10",
  "colorText": "text-[kolor]-[jasny odcień]",
  "colorBorder": "border-[kolor]-[numer]",
  "colorBorder20": "border-[kolor]-[numer]/20",
  "colorBorder80": "border-[kolor]-[numer]/80",
  "colorShadow30": "shadow-[kolor]-[numer]/30"
}
\`\`\`
```

**Zasady doboru kolorów:**
- Każdy performer ma UNIKALNY kolor (nie powtarza się)
- Kolor pasuje do charakteru (La Luz → żółty/słońce, Remi → fiolet/neon)
- Wszystkie 8 pól wypełnione

---

## 5️⃣ Konfiguracja UI (tabela)

```
## Konfiguracja UI

| Pole                 | Wartość                                                  |
| -------------------- | -------------------------------------------------------- |
| **Tytuł w nagłówku** | [Nazwa] ([Styl])                                         |
| **Status**           | [online status + hasło]                                  |
| **Myśli**            | [3-5 myśli, oddzielone średnikiem]                       |
| **Placeholder**      | [placeholder dla inputu]                                 |
| **Gradient**         | [Tailwind gradient: from-X via-Y to-Z]                   |
| **Button Gradient**  | [CSS linear-gradient z kolorami w hex]                   |
| **Model AI**         | [nazwa modelu]                                           |
| **Wersja Suno**      | [V4 / V4_5 / V5]                                         |
| **Głos (TTS)**       | [Nazwa głosu + (Męski/Żeński)]                           |
| **Cena**             | [0 (FREE) lub liczba]                                    |
| **Tier**             | [FREE / PREMIUM]                                         |
```

**Checklista:**
- [ ] Tytuł: nazwa + styl w nawiasie
- [ ] Status: krótki, charakterystyczny (np. "Online • Czeka na fiestę! 🕺")
- [ ] Myśli: 3-5 różnych, z emoji, unikalne dla performera
- [ ] Placeholder: opisuje co user ma wpisać
- [ ] Gradient: Tailwind (from-... via-... to-...)
- [ ] Button Gradient: CSS linear-gradient z 3 kolorami w hex
- [ ] Model: unikalny wśród performerów (jeśli możliwe)

---

## 6️⃣ Podsumowanie zmian

```
## Podsumowanie zmian

✅ **[Cecha 1]** - [opis dlaczego oryginalny]
✅ **[Cecha 2]** - [opis]
✅ **[Cecha 3]** - [opis]
✅ ...
```

**Checklista:**
- [ ] Co najmniej 5 punktów
- [ ] Każdy pokazuje UNIKALNOŚĆ względem pozostałych performerów
- [ ] Ostatni punkt: model AI (dlaczego ten konkretny)

---

## 📋 Quick Checklist (przed uploadem do bazy)

- [ ] **Tabela** - porównanie z 3+ performerami, kolumna wyróżniona
- [ ] **System prompt** - wszystkie sekcje: persona, zadanie, copyright, styl, algorytm, format, sygnatura, zakazy
- [ ] **LYRICS** - inline format z `[Tag] - opis` (preferowany)
- [ ] **Copyright** — gotowa fraza odpowiedzi, zakaz nazwisk w TAGS/LYRICS
- [ ] **Godzina/dzień** — zakaz powitań typu "Dzień dobry", "Dobry wieczór" — tylko neutralne zwroty
- [ ] **Algorytm** - 5 kroków (1️⃣-5️⃣), AKTYWNE pytania o pochodzenie/korzenie/anegdoty, limit 10 wiadomości
- [ ] **Theme JSON** - unikalny kolor, 8 pól
- [ ] **UI tabele** - wszystkie 11 pól, gradienty, myśli, status
- [ ] **Model AI** - unikalny wśród performerów
- [ ] **Podsumowanie** - min. 5 punktów unikalności
- [ ] **Suno API** - `[]` angielskie dla tagów, `()` dla ad-libów, brak `*`
