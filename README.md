# 🌼 Budżet Domowy (Home Budget)

Profesjonalna aplikacja do zarządzania finansami domowymi, stworzona w Next.js. Aplikacja pozwala na śledzenie wydatków, przychodów, planowanie oszczędności oraz monitorowanie limitów budżetowych.

## ✨ Główne Funkcje

- **🔐 Bezpieczeństwo:**
  - Logowanie i rejestracja (w tym integracja z Google).
  - System odzyskiwania hasła za pomocą kodu wysyłanego na email.
  - Szyfrowanie haseł (bcrypt).

- **💰 Zarządzanie Finansami:**
  - Dodawanie przychodów i wydatków z kategoryzacją.
  - Obsługa podkategorii, notatek, lokalizacji i dat.
  - Skanowanie paragonów (OCR) oraz załączanie zdjęć (symulacja).
  - **Pożyczki:** Śledzenie komu wisimy pieniądze i kto wiszą nam, z oznaczeniem statusu spłaty.

- **📊 Analiza i Raporty:**
  - Interaktywne wykresy wydatków i przychodów.
  - Filtrowanie danych według okresów (Dzień, Tydzień, Miesiąc, Rok, Całość).
  - Eksport szczegółowego raportu do formatu PDF (widok druku).

- **🎯 Cele i Subskrypcje:**
  - **Skarbonki:** Zarządzanie celami oszczędnościowymi.
  - **Subskrypcje:** Śledzenie stałych, miesięcznych opłat.
  - **Limity:** Ustawianie miesięcznych limitów wydatków na poszczególne kategorie (kwotowo lub procentowo).

- **💎 Estetyka:**
  - Nowoczesny Dark Mode z delikatnym wzorem stokrotek.
  - Responsywny design (Mobile & Desktop).
  - Szklane efekty (glassmorphism) i płynne animacje.

## 🛠️ Technologie

- **Frontend:** Next.js 15+, Tailwind CSS 4, Lucide React, Recharts.
- **Backend:** Next.js Server Actions, NextAuth.js (v5).
- **Baza danych:** PostgreSQL (NeonDB), Prisma ORM.
- **Email:** Resend (do wysyłki kodów resetujących).

## 🚀 Uruchomienie lokalne

1. Sklonuj repozytorium.
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Skonfiguruj plik `.env`:
   - `DATABASE_URL` (PostgreSQL)
   - `AUTH_SECRET` (Generowany np. przez `npx auth secret`)
   - `RESEND_API_KEY` (z panelu Resend)
4. Zainicjalizuj bazę danych:
   ```bash
   npx prisma db push
   ```
5. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```

## 🐳 Docker

Aplikacja jest przystosowana do pracy z kontenerami, co ułatwia synchronizację bazy danych i środowiska.

---
*Projekt stworzony z dbałością o detale i wygodę użytkownika.*
