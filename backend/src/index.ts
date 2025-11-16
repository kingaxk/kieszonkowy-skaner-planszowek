import dotenv from "dotenv";
import { createApp } from "./app";

// wczytanie zmiennych z pliku .env
dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
