import type { VercelRequest, VercelResponse } from "@vercel/node";
import { searchVideos, YouTubeApiError } from "../../server/src/services/youtubeService.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = (req.query.q ?? "").toString().trim();
  if (!q) {
    return res.status(400).json({ error: "Missing search query.", code: "MISSING_QUERY" });
  }

  try {
    const result = await searchVideos(q);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof YouTubeApiError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    console.error(err);
    res.status(500).json({ error: "Unexpected server error.", code: "UNKNOWN" });
  }
}
