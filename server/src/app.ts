import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import express from "express";
import youtubeRouter from "./routes/youtube.js";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();

const corsOriginSetting = process.env.CORS_ORIGIN ?? "*";
const corsOrigin =
  corsOriginSetting === "*"
    ? "*"
    : corsOriginSetting.split(",").map((s) => s.trim());

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Support both /api/health and /health (in case Vercel rewrites strip /api)
app.get(["/api/health", "/health"], (_req, res) => {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
  res.json({
    ok: true,
    hasApiKey: Boolean(apiKey && apiKey !== "your_api_key_here"),
  });
});

// Support both /api/youtube and /youtube
app.use(["/api/youtube", "/youtube"], youtubeRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

export default app;
