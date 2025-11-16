import axios from "axios";
import { parseStringPromise } from "xml2js";

const BGG_BASE_URL = "https://boardgamegeek.com/xmlapi2";
const BGG_TOKEN = process.env.BGG_TOKEN;

// Klient HTTP do BGG
const bggApi = axios.create({
  baseURL: BGG_BASE_URL,
  timeout: 15000
});

// Typ, który zwracamy na zewnątrz – zgodny z JSONem z /api/games/demo
export type GameDetails = {
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

// 🔹 TO JEST KLUCZOWE – eksport funkcji, którą importujemy w routes/games.ts
export function isBggConfigured(): boolean {
  return !!BGG_TOKEN;
}

/**
 * Pobiera surowe dane gry z BGG (XML API2 /thing).
 * WYMAGA skonfigurowanego BGG_TOKEN.
 */
export async function fetchBggThing(bggId: number): Promise<any> {
  if (!BGG_TOKEN) {
    throw new Error("BGG_API_TOKEN_MISSING");
  }

  const response = await bggApi.get("/thing", {
    headers: {
      Authorization: `Bearer ${BGG_TOKEN}`
    },
    params: {
      id: bggId,
      type: "boardgame",
      stats: 1,
      versions: 1
    }
  });

  const xml = response.data;
  const parsed = await parseStringPromise(xml);
  return parsed;
}

/**
 * Mapowanie XML -> nasz GameDetails.
 */
export function mapBggThingToGame(thing: any): GameDetails {
  const item = thing;

  const names = item.name || [];
  const primaryNameObj =
    names.find((n: any) => n.$?.type === "primary") ?? names[0];
  const nameOriginal = primaryNameObj?.$.value ?? "Nieznana nazwa";

  let namePl = nameOriginal;

  const versions = item.versions?.[0]?.item ?? [];
  for (const v of versions) {
    const links = v.link || [];
    const hasPolish = links.some(
      (l: any) => l.$?.type === "language" && l.$?.value === "Polish"
    );
    if (hasPolish && v.$?.value) {
      namePl = v.$.value;
      break;
    }
    if (hasPolish && v.name?.[0]?.$.value) {
      namePl = v.name[0].$.value;
      break;
    }
  }

  const minPlayers = Number(item.minplayers?.[0]?.$.value ?? 0);
  const maxPlayers = Number(item.maxplayers?.[0]?.$.value ?? 0);
  const minPlaytime = Number(item.minplaytime?.[0]?.$.value ?? 0);
  const maxPlaytime = Number(item.maxplaytime?.[0]?.$.value ?? 0);

  const ratings = item.statistics?.[0]?.ratings?.[0] ?? {};
  const rating = Number(ratings.average?.[0]?.$.value ?? 0);
  const bayesRating = Number(ratings.bayesaverage?.[0]?.$.value ?? 0);
  const complexity = Number(ratings.averageweight?.[0]?.$.value ?? 0);

  const poll = (item.poll || []).find(
    (p: any) => p.$?.name === "suggested_numplayers"
  );
  let bestPlayers: number | null = null;

  if (poll && Array.isArray(poll.results)) {
    let bestScore = -1;

    for (const r of poll.results) {
      const numplayers = r.$?.numplayers;
      if (!numplayers || !/^\d+$/.test(numplayers)) continue;

      const resultsArr = r.result || [];
      const bestVotes = Number(
        resultsArr.find((x: any) => x.$?.value === "Best")?.$.numvotes ?? 0
      );
      const recVotes = Number(
        resultsArr.find((x: any) => x.$?.value === "Recommended")?.$.numvotes ??
          0
      );

      const score = bestVotes * 3 + recVotes * 2;
      if (score > bestScore) {
        bestScore = score;
        bestPlayers = Number(numplayers);
      }
    }
  }

  const rawDescription: string = item.description?.[0] ?? "";
  const cleanDescription = rawDescription
    .replace(/&#10;|\n/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();

  const summaryPl = cleanDescription; // na razie opis EN

  return {
    id: Number(item.$?.id ?? 0),
    namePl,
    nameOriginal,
    rating,
    bayesRating,
    complexity,
    players: {
      min: minPlayers,
      max: maxPlayers,
      best: bestPlayers
    },
    playtime: {
      min: minPlaytime,
      max: maxPlaytime
    },
    summaryPl
  };
}

export async function getGameDetailsFromBgg(
  bggId: number
): Promise<GameDetails> {
  const parsed = await fetchBggThing(bggId);
  const item = parsed?.items?.item?.[0];
  if (!item) {
    throw new Error("Nie znaleziono gry w odpowiedzi BGG");
  }
  return mapBggThingToGame(item);
}
