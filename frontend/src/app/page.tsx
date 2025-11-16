"use client";

import { useState } from "react";

type Game = {
  id: number;
  namePl: string;
  nameOriginal: string;
  rating: number;
  bayesRating: number;
  complexity: number;
  players: {
    min: number;
    max: number;
    best: number | null;
  };
  playtime: {
    min: number;
    max: number;
  };
  summaryPl: string;
};

type SearchResult = {
  id: number;
  namePl: string;
  nameOriginal: string;
  yearPublished: number;
  rating: number;
  complexity: number;
  players: {
    min: number;
    max: number;
    best: number | null;
  };
  playtime: {
    min: number;
    max: number;
  };
};

export default function HomePage() {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchDemoGame = async () => {
    setLoading(true);
    setError(null);
    setGame(null);

    try {
      const res = await fetch("http://localhost:4000/api/games/demo");
      if (!res.ok) {
        throw new Error("Błąd podczas pobierania danych demo");
      }
      const data: Game = await res.json();
      setGame(data);
    } catch (err) {
      setError((err as Error).message || "Nieznany błąd");
    } finally {
      setLoading(false);
    }
  };

  const loadGameById = async (id: number) => {
    setLoading(true);
    setError(null);
    setGame(null);

    try {
      const res = await fetch(`http://localhost:4000/api/games/${id}`);
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Błąd podczas pobierania gry");
      }

      const data = body as Game;
      setGame(data);
    } catch (err) {
      setError((err as Error).message || "Nieznany błąd");
    } finally {
      setLoading(false);
    }
  };

  const searchGames = async () => {
    if (!searchTerm.trim()) {
      setSearchError("Wpisz nazwę gry.");
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const res = await fetch(
        `http://localhost:4000/api/games/search?name=${encodeURIComponent(
          searchTerm.trim()
        )}`
      );
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Błąd podczas wyszukiwania");
      }

      const data = body as { results: SearchResult[] };
      setSearchResults(data.results);
    } catch (err) {
      setSearchError((err as Error).message || "Nieznany błąd");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        maxWidth: 900,
        margin: "0 auto",
        padding: "16px",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#e5e7eb" // jasnoszare tło całej strony
      }}
    >
      <header style={{ marginBottom: "20px" }}>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 700,
            marginBottom: "4px",
            color: "#111827"
          }}
        >
          Kieszonkowy skaner planszówek
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#374151"
          }}
        >
          Wersja deweloperska · statyczna baza kilku gier · testujemy przepływ.
        </p>
      </header>

      {/* Sekcja: Demo */}
      <section
        style={{
          marginBottom: "24px",
          padding: "14px 18px",
          borderRadius: "12px",
          border: "1px solid #d1d5db",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 600,
            margin: "0 0 8px 0",
            color: "#111827"
          }}
        >
          Szybki test (demo)
        </h2>
        <p style={{ marginBottom: "12px", fontSize: "14px", color: "#374151" }}>
          Kliknij, żeby pobrać przykładową grę z backendu i sprawdzić połączenie
          frontend ↔ backend.
        </p>
        <button
          onClick={fetchDemoGame}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            backgroundColor: loading ? "#93c5fd" : "#2563eb",
            color: "#ffffff"
          }}
        >
          {loading ? "Ładowanie..." : "Pobierz demo gry"}
        </button>
      </section>

      {/* Sekcja: Wyszukiwanie po nazwie */}
      <section
        style={{
          marginBottom: "24px",
          padding: "14px 18px",
          borderRadius: "12px",
          border: "1px solid #d1d5db",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 600,
            margin: "0 0 8px 0",
            color: "#111827"
          }}
        >
          Wyszukaj grę po nazwie (statyczna baza)
        </h2>

        <p
          style={{
            fontSize: "13px",
            color: "#4b5563",
            marginBottom: "8px"
          }}
        >
          Obsługujemy teraz kilka gier (np. <b>Azul</b>, <b>Gloomhaven</b>,{" "}
          <b>Catan</b>, <b>Na Skrzydłach</b>, <b>7 Cudów Świata</b>).
        </p>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "8px"
          }}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="np. Azul, Gloomhaven, Catan..."
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid #9ca3af",
              fontSize: "14px",
              color: "#111827",
              backgroundColor: "#f9fafb"
            }}
          />
          <button
            onClick={searchGames}
            disabled={searchLoading}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              backgroundColor: searchLoading ? "#6ee7b7" : "#16a34a",
              color: "#ffffff",
              whiteSpace: "nowrap"
            }}
          >
            {searchLoading ? "Szukam..." : "Szukaj"}
          </button>
        </div>

        {searchError && (
          <p
            style={{
              color: "#b91c1c",
              fontSize: "13px",
              marginBottom: "8px"
            }}
          >
            {searchError}
          </p>
        )}

        {searchResults.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: "8px"
            }}
          >
            {searchResults.map((g) => (
              <li
                key={g.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <div style={{ fontSize: "14px" }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: "2px"
                    }}
                  >
                    {g.namePl}{" "}
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#4b5563",
                        marginLeft: "4px"
                      }}
                    >
                      ({g.nameOriginal})
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#374151" }}>
                    {g.yearPublished} · {g.players.min}–{g.players.max} graczy ·{" "}
                    {g.playtime.min}–{g.playtime.max} min · ocena{" "}
                    {g.rating.toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={() => loadGameById(g.id)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    whiteSpace: "nowrap"
                  }}
                >
                  Pokaż szczegóły
                </button>
              </li>
            ))}
          </ul>
        )}

        {searchResults.length === 0 && !searchLoading && !searchError && (
          <p style={{ fontSize: "12px", color: "#4b5563", marginTop: "4px" }}>
            Brak wyników – wpisz fragment nazwy i kliknij „Szukaj”.
          </p>
        )}
      </section>

      {/* Sekcja: szczegóły gry */}
      {error && (
        <p
          style={{
            color: "#b91c1c",
            marginBottom: "12px",
            fontSize: "14px"
          }}
        >
          Błąd: {error}
        </p>
      )}

      {game && (
        <article
          style={{
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            padding: "16px",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            marginBottom: "32px"
          }}
        >
          <header style={{ marginBottom: "10px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                margin: 0,
                color: "#111827"
              }}
            >
              {game.namePl}
              <span
                style={{
                  fontSize: "12px",
                  color: "#4b5563",
                  marginLeft: "8px"
                }}
              >
                ({game.nameOriginal})
              </span>
            </h2>
          </header>

          <dl style={{ fontSize: "14px", marginBottom: "12px", color: "#111827" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px"
              }}
            >
              <dt style={{ fontWeight: 600 }}>Ocena BGG</dt>
              <dd>
                {game.rating.toFixed(2)} (Bayes:{" "}
                {game.bayesRating.toFixed(2)})
              </dd>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px"
              }}
            >
              <dt style={{ fontWeight: 600 }}>Złożoność</dt>
              <dd>{game.complexity.toFixed(2)} / 5</dd>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px"
              }}
            >
              <dt style={{ fontWeight: 600 }}>Liczba graczy</dt>
              <dd>
                {game.players.min === game.players.max
                  ? `${game.players.min} graczy`
                  : `${game.players.min}–${game.players.max} graczy`}
                {game.players.best && (
                  <span style={{ fontSize: "12px", color: "#4b5563" }}>
                    {" "}
                    (najlepiej: {game.players.best})
                  </span>
                )}
              </dd>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px"
              }}
            >
              <dt style={{ fontWeight: 600 }}>Czas gry</dt>
              <dd>
                {game.playtime.min === game.playtime.max
                  ? `${game.playtime.min} min`
                  : `${game.playtime.min}–${game.playtime.max} min`}
              </dd>
            </div>
          </dl>

          <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.5 }}>
            {game.summaryPl}
          </p>
        </article>
      )}
    </main>
  );
}
