# budrzet-domowy

aplikacja do budżetu domowego
stwórz do tego tez baze danych w dockerze z tymi danymi : logowanie, hasla ,konta, transakcje, kategorie transakcji i wszytskimi rzeczami w aplikacji- zeby po zalogowaniu si ez innego urzadzenia miec dostep do swoich danych

## wazne
zrób to jako aplikacje desktopową i mobilną w jednej aplikacji zaleznie od urządzenia na którym jest uruchomiona aplikacja okraz stórz baze dachy w dockerze zeby latwo bylo ja uruchomic na kazdym komputerze

## funkcje
- logowanie i rejestracja kazdego uzytkownika 
    - przycisk zaloguj
        - podaj email i haslo
        - mozliwosc logowania z kontem google
    - przycisk zarejestruj
        - podaj email i haslo, powtórz haslo
        - mozliwosc rejestracji z kontem google

- dodawanie wyplaty i wyswietlenie łącznej puli moich srodkow na samej gorze aplikacji 
    - Pełne zarządzanie (dodawanie, edycja, usuwanie) wydatkami i przychodami.
    - przycisk dodaj wydatek (mozliwosc tworzenia kategori wydatków np. zakupy, jedzenie, transport, rozrywka, itp- zzeby to tez mozna było edytowac te kategorie)

        - podczas korzystania z telefony zapytaj o pozwolenie na korzystanie z kamery aparatu i skanuj paragon ale nie musisz go dodawac ze wszystkim co sie kupiło tylko zapisuj samą kwote dla ułatwienia zapisywania wydatków
        - dodaj tez opcje recznego wpisywania kwoty
        - dodaj tez opcje dodawania podkategorii
        - dodaj tez opcje dodawania notatek przy wydatkach
        - dodaj tez opcje dodawania daty i godziny wydatku
        - dodaj tez opcje dodawania miejsca wydatku
        - dodaj tez opcje dodawania zdjecia paragonu
        - dodaj tez opcje dodawania kto mi wisi pieniadze z mozliwoscia wypisania imienia i kwoty oraz komu ja wisze tą daną kwote z imieniem i kwota

    - przycisk dodaj przychod
        - dodaj tez opcje recznego wpisywania kwoty
        - dodaj tez opcje dodawania podkategorii
        - dodaj tez opcje dodawania notatek przy przychodach
        - dodaj tez opcje dodawania daty i godziny przychodu
        - dodaj tez opcje dodawania miejsca przychodu
        - dodaj tez opcje dodawania zdjecia paragonu
        - dodaj tez opcje dodawania imienia od kodo mam te pieniadze i jaka to kwota i za co

- kategoryzacja transakcji w ustawieniach daj mozliwosc dodawania i usuwania kategorii i podkategorii, kazda transakcja musi miec przypisana kategorie oraz zrób tak zeby w ustawieniach dalo sie tez do kazdej kategori dac limit wydatkow na dany miesiac jako konkretna kwojta badz procent z całej puli moich srodkow lub procent od moich miesiecznych przychodów (zapisanych jako wyplata)
- 

- opcja analiza finansowa czyli wykresy miesieczne i  roczne itp

- dodaj tez mozliwosc dodawania wydatków na wakacjach w innych walutach (np. euro, dolar, funt itp) i obok kwoty mniejszą czcionką napisz przeliczenie tej kwoty na zlotowki po aktualnym kursie waluty

## wizualnie
- tryb ciemny czyli czarno, biała, ciemno zielona kolorystyka
w ciemnym tle dodaj małe białe stokrotki jako delikatny wzór tła

## inne
 w kazdym etapie rób commity

## technologia
- next.js
- tailwind css
- typescript
- supabase
- shadcn ui

zrób w tak zeby było dla ciebie najlepiej i zeby latwo bylo dodawac nowe funkcje