import { Router } from "express";
import { YouTubeApiError, getVideoDetails, searchVideos } from "../services/youtubeService.js";

const router = Router();

router.get("/search", async (req, res) => {
  const q = (req.query.q ?? "").toString().trim();

  if (!q) {
    return res.status(400).json({ error: "Missing search query.", code: "MISSING_QUERY" });
  }
  if (q.length > 100) {
    return res.status(400).json({ error: "Search query is too long.", code: "QUERY_TOO_LONG" });
  }

  try {
    const result = await searchVideos(q);
    res.json(result);
  } catch (err) {
    if (err instanceof YouTubeApiError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    console.error(err);
    res.status(500).json({ error: "Unexpected server error.", code: "UNKNOWN" });
  }
});

router.get("/video/:id", async (req, res) => {
  const { id } = req.params;
  if (!/^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
    return res.status(400).json({ error: "Invalid video id.", code: "INVALID_ID" });
  }

  try {
    const details = await getVideoDetails(id);
    res.json(details);
  } catch (err) {
    if (err instanceof YouTubeApiError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    console.error(err);
    res.status(500).json({ error: "Unexpected server error.", code: "UNKNOWN" });
  }
});

export default router;
