import express from "express";
import dotenv from "dotenv";

// wczytanie zmiennych z pliku .env
dotenv.config();

const app = express();

// pozwalamy na JSON w body requestów (na przyszłość)
app.use(express.json());

// prosty endpoint do sprawdzenia, czy backend działa
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
