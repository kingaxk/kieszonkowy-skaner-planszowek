# Kieszonkowy skaner planszówek

Webowa aplikacja (PWA, **mobile first**), która po **zeskanowaniu kodu z pudełka gry planszowej** lub **wpisaniu nazwy** pobiera dane z **BoardGameGeek** i wyświetla po polsku:

- nazwę gry po polsku  
  *(w nawiasie, mniejszą czcionką – nazwa oryginalna)*,
- ocenę BGG (średnią i bayesową),
- **complexity score** (średnia „waga” gry),
- sugerowaną liczbę graczy (**best player number**),
- minimalną i maksymalną liczbę graczy,
- minimalny i maksymalny czas gry,
- krótkie **streszczenie opisu po polsku**.

Aplikacja jest projektowana tak, żeby dało się jej wygodnie używać **jedną ręką na telefonie**, przy półce w sklepie, w wypożyczalni albo na festiwalu gier.

---

## Spis treści

1. [Grupa docelowa i scenariusze](#grupa-docelowa-i-scenariusze)  
2. [Kluczowe funkcje](#kluczowe-funkcje)  
3. [Stos technologiczny](#stos-technologiczny)  
4. [Architektura](#architektura)  
5. [Integracja z BoardGameGeek](#integracja-z-boardgamegeek) 
6. [Roadmapa](#roadmapa)   

---

## Grupa docelowa i scenariusze

### Grupa docelowa

- **Casual gracze** – kupują gry kilka razy w roku, chcą szybkiej informacji „dla ilu osób i na ile czasu”.
- **Geek planszówkowy** – zna BGG, często jest:
  - w sklepie z planszówkami,
  - na **festiwalu gier**, gdzie przeszukuje długie półki, żeby:
    - znaleźć grę pasującą do konkretnej liczby osób,
    - dobrać tytuł o określonej złożoności (weight) i czasie gry.
- **Sprzedawca** – potrzebuje prostego narzędzia, żeby pokazać klientowi podstawowe dane o grze.

### Kluczowe scenariusze

- Stoję przy półce z planszówkami, mam 3 osoby do gry i 60–90 minut – **skanuję kolejne pudełka** i w kilka sekund widzę:
  - ocenę,
  - wagę,
  - sugerowaną liczbę graczy,
  - czas gry.
- Jestem na festiwalu gier – przeszukuję półki, żeby zdecydować, „w co zagramy w tej konfiguracji osób”, potrzebuję tego **szybko i na telefonie**.
- Nie mogę zeskanować kodu – wpisuję nazwę gry i wybieram ją z listy wyników wyszukiwania.

---

## Kluczowe funkcje

### MVP

- Skanowanie kodu kreskowego / QR na pudełku gry (przez kamerę telefonu).
- Wyszukiwanie gry po nazwie (lista wyników z BGG).
- Wyświetlanie karty gry z:
  - nazwą PL i oryginalną,
  - oceną BGG (średnią + bayesową),
  - complexity score (średnia „waga”),
  - zakresem liczby graczy,
  - sugerowaną liczbą graczy (best player number),
  - zakresem czasu gry,
  - krótkim stresem opisu po polsku + **oryginalnym opisem z BGG**.
- Obsługa typowych błędów:
  - nieznany kod,
  - brak połączenia z BGG,
  - brak zgody na kamerkę.

### Kolejne kroki (high-level)

- Ustawienia preferowanych zakresów (np. „pokaż od razu, czy gra jest dobra na 2 osoby i czy trwa max 60 minut”).
- **„Foto półki”** – zrobienie zdjęcia półki z grami, rozpoznanie gier i odfiltrowanie po zadanych warunkach (liczba graczy, czas, waga).
- Ewentualna aplikacja **natywna** (Android/iOS), jeśli PWA okaże się niewystarczająca (np. potrzeba mocnego trybu offline).

---

## Stos technologiczny

### Frontend

- **React + TypeScript**
- Framework: np. **Next.js** (łatwa konfiguracja PWA, SSR/SSG).
- UI: Tailwind CSS / inny utility-first.
- Skanowanie kodów: biblioteka typu `@zxing/browser` lub `QuaggaJS`.
- PWA:
  - `manifest.json`,
  - service worker,
  - tryb full-screen po dodaniu do ekranu głównego.

### Backend

- **Node.js + Express** (lub NestJS – do decyzji implementacyjnej).
- Warstwy:
  - kontrolery HTTP (`/api/search`, `/api/games/:id`, `/api/lookup-by-barcode`),
  - klienci integracyjni:
    - `bggClient` – BoardGameGeek XML API2 (autoryzacja Bearer),
    - `barcodeClient` – serwis mapujący kody kreskowe na ID gry (UPC/EAN → BGG ID lub tytuł),
    - `translationClient` – usługa tłumaczeniowa do streszczeń po polsku,
  - warstwa dostępu do danych (cache w bazie).

### Baza danych

- Produkcyjnie: PostgreSQL.  
- Lokalnie: opcjonalnie SQLite dla prostoty, przy zachowaniu tych samych modeli.

---

## Architektura

Proponowana struktura projektu:

```txt
.
├── README.md
├── .gitignore
├── backend/        # Node/Express, integracje, logika, cache
├── frontend/       # React/Next.js (PWA, UI, skanowanie)
└── docs/
    ├── architecture.md   # bardziej szczegółowy opis architektury
    └── api.md            # specyfikacja API (OpenAPI / opis endpointów)
```

**Główny przepływ (happy path):**

1. Użytkownik uruchamia aplikację na telefonie (PWA).
2. Wybiera „Zeskanuj kod” → front włącza kamerę i wykrywa kod.
3. Front wywołuje `GET /api/lookup-by-barcode?barcode=...`.
4. Backend:
   - sprawdza cache (`barcodes`, `games`),
   - jeśli brak:
     - pyta zewnętrzny serwis UPC/EAN → BGG ID, potem BoardGameGeek (XML API2),
     - zapisuje dane w cache,
   - generuje streszczenie PL,
   - zwraca JSON z kartą gry.
5. Front wyświetla kartę gry na jednym ekranie (mobile first).

---

## Integracja z BoardGameGeek

Projekt wykorzystuje **BoardGameGeek XML API2**:

- `GET https://boardgamegeek.com/xmlapi2/search` – wyszukiwanie gier po nazwie (`query`, `type=boardgame`),
- `GET https://boardgamegeek.com/xmlapi2/thing` – pobieranie szczegółów gry  
  (z parametrami `type=boardgame`, `stats=1`, `versions=1`).

> Wszystkie wywołania do BGG są wykonywane **z backendu**, z użyciem tokena aplikacji BGG:
>
> ```http
> Authorization: Bearer <BGG_TOKEN>
> ```

### Zgodność z zasadami BGG

- Dane z BGG **nie są modyfikowane** – oryginalny opis wyświetlamy w niezmienionej formie (jako „Opis z BGG”).
- Na karcie gry pokazujemy osobno:
  - „Oryginalny opis z BGG”,
  - „Skrócone streszczenie po polsku” – własny tekst opracowany na podstawie opisu, a nie zmieniony tekst BGG.
- W UI wyraźnie zaznaczamy:
  - **„Dane z BoardGameGeek”** + logo/napis **„Powered by BGG”** z linkiem do strony gry na BGG.
- Token BGG jest trzymany wyłącznie po stronie serwera (zmienna środowiskowa, brak ekspozycji w frontendzie).
---

## Roadmapa

### MVP

- Skanowanie kodu + fallback do wyszukiwania po nazwie.
- Karta gry (mobile-first) z wszystkimi kluczowymi danymi.
- Konfiguracja PWA (manifest, service worker).
- Cache danych gier w bazie (tabele `games`, `barcodes`).

### Kolejne kroki

- Ustawienia preferowanych zakresów (liczba graczy, czas, weight).
- „Foto półki” – rozpoznawanie gier na zdjęciu półki i filtrowanie po warunkach.
- Analiza potrzeby aplikacji natywnej (tryb offline, wygoda skanowania, integracja z aparatami).
- Udoskonalenie UX (np. wskazówki, co dana waga/ocena oznacza dla casuala).

