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

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(
      process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== "your_api_key_here"
    ),
  });
});

app.use("/api/youtube", youtubeRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

export default app;
