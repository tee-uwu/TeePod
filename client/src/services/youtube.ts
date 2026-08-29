import type { SearchResult } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const CLIENT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export class ApiError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error ?? "Something went wrong.", data.code ?? "UNKNOWN");
  }
  return data as T;
}

export async function searchYouTube(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(`${API_BASE}/youtube/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await handle<{ items: SearchResult[] }>(res);
      if (data.items) return data.items;
    }
  } catch (e) {
    console.warn("Backend proxy search failed, attempting client fallback...", e);
  }

  // Direct client fallback if VITE_YOUTUBE_API_KEY is available
  if (CLIENT_API_KEY && CLIENT_API_KEY !== "your_api_key_here") {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=15&q=${encodeURIComponent(
      query
    )}&key=${CLIENT_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.error?.message ?? "YouTube API error", "CLIENT_API_ERROR");
    }
    return (data.items ?? [])
      .map((item: any) => ({
        videoId: item.id?.videoId,
        title: item.snippet?.title ?? "Untitled",
        channelTitle: item.snippet?.channelTitle ?? "Unknown artist",
        thumbnail:
          item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? "",
        durationSeconds: 180,
      }))
      .filter((item: SearchResult) => Boolean(item.videoId));
  }

  throw new ApiError("Missing YouTube API key configuration.", "MISSING_API_KEY");
}

export async function checkApiHealth(): Promise<{ ok: boolean; hasApiKey: boolean }> {
  if (CLIENT_API_KEY && CLIENT_API_KEY !== "your_api_key_here") {
    return { ok: true, hasApiKey: true };
  }
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      return await handle(res);
    }
    const altRes = await fetch("/health");
    if (altRes.ok) {
      return await handle(altRes);
    }
    return { ok: false, hasApiKey: false };
  } catch {
    return { ok: false, hasApiKey: false };
  }
}
