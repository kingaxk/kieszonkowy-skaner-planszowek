import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";
import { gamesRouter } from "./routes/games";

export function createApp() {
  const app = express();

  // CORS – pozwalamy frontendowi (http://localhost:3000) wywoływać backend
  app.use(
    cors({
      origin: "http://localhost:3000"
    })
  );

  app.use(express.json());

  // trasy
  app.use(healthRouter);              // /health
  app.use("/api/games", gamesRouter); // /api/games/demo

  return app;
}

