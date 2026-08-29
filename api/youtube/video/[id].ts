import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getVideoDetails, YouTubeApiError } from "../../../server/src/services/youtubeService.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = (req.query.id ?? "").toString().trim();
  if (!/^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
    return res.status(400).json({ error: "Invalid video id.", code: "INVALID_ID" });
  }

  try {
    const details = await getVideoDetails(id);
    res.status(200).json(details);
  } catch (err) {
    if (err instanceof YouTubeApiError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    console.error(err);
    res.status(500).json({ error: "Unexpected server error.", code: "UNKNOWN" });
  }
}
