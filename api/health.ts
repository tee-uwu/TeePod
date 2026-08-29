import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
  res.status(200).json({
    ok: true,
    hasApiKey: Boolean(apiKey && apiKey !== "your_api_key_here"),
  });
}
