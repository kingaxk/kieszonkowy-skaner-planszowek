// Statyczna baza gier dla Kieszonkowego Skanera Planszówek.
// Dane są przybliżone i oparte na BoardGameGeek (stan ok. 2025),
// ale nie muszą idealnie zgadzać się z aktualnym BGG.

export interface StaticGame {
  id: number;              // ID gry na BGG
  name: string;            // Nazwa PL (do wyświetlenia jako główna)
  originalName: string;    // Nazwa oryginalna (w nawiasie mniejszą czcionką)
  yearPublished: number;
  rating: number;          // Średnia ocena użytkowników BGG
  complexity: number;      // Waga / trudność z BGG (1–5)
  minPlayers: number;
  maxPlayers: number;
  bestPlayers: number | null; // Najlepsza liczba graczy wg społeczności (jeśli znana)
  minPlaytime: number;     // Min czas gry w minutach
  maxPlaytime: number;     // Max czas gry w minutach
  description: string;     // Krótkie streszczenie po polsku
}

export const staticGames: StaticGame[] = [
  {
    id: 174430,
    name: "Gloomhaven",
    originalName: "Gloomhaven",
    yearPublished: 2017,
    rating: 8.55,
    complexity: 3.91,
    minPlayers: 1,
    maxPlayers: 4,
    bestPlayers: 3,
    minPlaytime: 60,
    maxPlaytime: 120,
    description:
      "Ciężka, kooperacyjna kampania fantasy z legacy i taktyczną walką na heksach. " +
      "Gracze budują talię kart postaci, wykonują scenariusze w otwartym świecie, " +
      "odblokowują nowe lokacje i bohaterów, a decyzje fabularne zmieniają mapę i dalszy przebieg kampanii."
  },
  {
    id: 266192,
    name: "Na Skrzydłach",
    originalName: "Wingspan",
    yearPublished: 2019,
    rating: 8.01,
    complexity: 2.48,
    minPlayers: 1,
    maxPlayers: 5,
    bestPlayers: 3,
    minPlaytime: 40,
    maxPlaytime: 70,
    description:
      "Łagodna, silniczkowa gra o ptakach – rozbudowujesz własny rezerwat, zagrywając karty ptaków " +
      "do trzech siedlisk. Każda akcja uruchamia łańcuch efektów kart, generując jedzenie, jajka i punkty. " +
      "Bardzo klimatyczna, z pięknymi ilustracjami i poczuciem spokojnego „engine buildingu”."
  },
  {
    id: 13,
    name: "Catan",
    originalName: "Catan",
    yearPublished: 1995,
    rating: 7.09,
    complexity: 2.29,
    minPlayers: 3,
    maxPlayers: 4,
    bestPlayers: 4,
    minPlaytime: 60,
    maxPlaytime: 120,
    description:
      "Klasyk gier euro – budujesz osady i miasta na wyspie, zbierasz surowce z rzutów kością " +
      "i wymieniasz je z innymi graczami. Kluczowe jest dobre ustawienie na planszy, negocjacje handlowe " +
      "oraz wyścig o drogę najdłuższą i największą armię."
  },
  {
    id: 9209,
    name: "Wsiąść do Pociągu",
    originalName: "Ticket to Ride",
    yearPublished: 2004,
    rating: 7.39,
    complexity: 1.82,
    minPlayers: 2,
    maxPlayers: 5,
    bestPlayers: 4,
    minPlaytime: 30,
    maxPlaytime: 60,
    description:
      "Lekka, rodzinna gra o budowaniu połączeń kolejowych. W swojej turze dobierasz karty wagonów " +
      "lub zagrywasz je, by zająć odcinki tras między miastami. Punkty zdobywasz za zrealizowane bilety, " +
      "długie ciągi tras i blokowanie przeciwników."
  },
  {
    id: 230802,
    name: "Azul",
    originalName: "Azul",
    yearPublished: 2017,
    rating: 7.72,
    complexity: 1.77,
    minPlayers: 2,
    maxPlayers: 4,
    bestPlayers: 2,
    minPlaytime: 30,
    maxPlaytime: 45,
    description:
      "Abstrakcyjna gra o układaniu kafelków na ścianie pałacu w Évorze. Gracze wybierają płytki z „fabryk”, " +
      "a potem układają je w rzędach, by zdobywać punkty za wzory, kolumny i rzędy. " +
      "Proste zasady, szybka rozgrywka, ale dużo przestrzeni na sprytne podkradanie kafelków innym."
  },
  {
    id: 68448,
    name: "7 Cudów Świata",
    originalName: "7 Wonders",
    yearPublished: 2010,
    rating: 7.67,
    complexity: 2.32,
    minPlayers: 2,
    maxPlayers: 7,
    bestPlayers: 3,
    minPlaytime: 30,
    maxPlaytime: 40,
    description:
      "Gra z równoczesnym dobieraniem kart – rozwijasz swoje antyczne miasto, budujesz budynki, armię " +
      "i sam tytułowy cud świata. Rozgrywka trwa trzy epoki, a karty dają surowce, punkty nauki, wojska " +
      "lub premie na koniec gry. Skalowanie do dużej liczby graczy bez wydłużania czasu partii."
  }
];
