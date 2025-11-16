import { Router } from "express";
import {
  GameDetails,
  getGameDetailsFromBgg,
  isBggConfigured
} from "../clients/bggClient";
import { staticGames, StaticGame } from "../data/staticGames";

export const gamesRouter = Router();

/**
 * Mapowanie wpisu ze statycznej bazy na format GameDetails,
 * którego używa reszta backendu i frontend.
 */
function mapStaticToGameDetails(game: StaticGame): GameDetails {
  return {
    id: game.id,
    namePl: game.name,
    nameOriginal: game.originalName,
    rating: game.rating,
    bayesRating: game.rating, // na razie przyjmujemy rating ~ bayesRating
    complexity: game.complexity,
    players: {
      min: game.minPlayers,
      max: game.maxPlayers,
      best: game.bestPlayers
    },
    playtime: {
      min: game.minPlaytime,
      max: game.maxPlaytime
    },
    summaryPl: game.description
  };
}

// DEMO – endpoint używany przez frontend do testów
gamesRouter.get("/demo", (_req, res) => {
  const demo: GameDetails = {
    id: 12345,
    namePl: "Wsiąść do Pociągu",
    nameOriginal: "Ticket to Ride",
    rating: 7.43,
    bayesRating: 7.35,
    complexity: 2.35,
    players: {
      min: 2,
      max: 5,
      best: 3
    },
    playtime: {
      min: 30,
      max: 60
    },
    summaryPl:
      "Rodzinna gra planszowa o budowaniu linii kolejowych. Proste zasady, szybka rozgrywka, świetna na początek przygody z planszówkami."
  };

  res.json(demo);
});

// Wyszukiwanie po nazwie: /api/games/search?name=...
gamesRouter.get("/search", (req, res) => {
  const nameParam = (req.query.name as string | undefined)?.trim();

  if (!nameParam) {
    return res
      .status(400)
      .json({ error: "Parametr 'name' jest wymagany (np. ?name=azul)" });
  }

  const q = nameParam.toLowerCase();

  const matches = staticGames
    .filter((g) => {
      const pl = g.name.toLowerCase();
      const orig = g.originalName.toLowerCase();
      return pl.includes(q) || orig.includes(q);
    })
    .slice(0, 20)
    .map((g) => ({
      id: g.id,
      namePl: g.name,
      nameOriginal: g.originalName,
      yearPublished: g.yearPublished,
      rating: g.rating,
      complexity: g.complexity,
      players: {
        min: g.minPlayers,
        max: g.maxPlayers,
        best: g.bestPlayers
      },
      playtime: {
        min: g.minPlaytime,
        max: g.maxPlaytime
      }
    }));

  return res.json({
    query: nameParam,
    total: matches.length,
    results: matches
  });
});



// Główny endpoint: /api/games/:id
// 1) najpierw szukamy w statycznej bazie
// 2) jeśli nie ma, próbujemy pobrać z BGG (jeśli skonfigurowane)
gamesRouter.get("/:id", async (req, res) => {
  const idParam = req.params.id;
  const bggId = Number(idParam);

  if (!bggId || Number.isNaN(bggId)) {
    return res.status(400).json({ error: "Nieprawidłowe id gry" });
  }

  // 1️⃣ Najpierw: szukamy gry w statycznej bazie
  const staticMatch = staticGames.find((g) => g.id === bggId);

  if (staticMatch) {
    const mapped = mapStaticToGameDetails(staticMatch);
    return res.json(mapped);
  }

  // 2️⃣ Jeśli nie ma w statycznej bazie – próbujemy BGG
  if (!isBggConfigured()) {
    // brak tokena BGG – mówimy wprost, że nie mamy ani lokalnie, ani w API
    return res.status(503).json({
      error:
        "Gra nie została znaleziona w lokalnej bazie, a BGG API nie jest skonfigurowane (brak tokena)."
    });
  }

  try {
    const game = await getGameDetailsFromBgg(bggId);
    res.json(game);
  } catch (err: any) {
    console.error(
      "Błąd podczas pobierania gry z BGG:",
      err?.response?.status,
      err?.message
    );
    res.status(502).json({
      error: "Nie udało się pobrać danych gry z BoardGameGeek."
    });
  }
});
