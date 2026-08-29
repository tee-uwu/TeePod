const YT_API_BASE = "https://www.googleapis.com/youtube/v3";

export interface YouTubeSearchResultItem {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
  durationSeconds: number;
}

export interface YouTubeSearchResponse {
  items: YouTubeSearchResultItem[];
}

export interface YouTubeVideoDetails {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  durationSeconds: number;
  isEmbeddable: boolean;
}

export class YouTubeApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
  if (!key || key === "your_api_key_here") {
    throw new YouTubeApiError(
      "The server is missing a valid YOUTUBE_API_KEY. Add one to server/.env or Vercel environment variables.",
      500,
      "MISSING_API_KEY"
    );
  }
  return key;
}

function parseIsoDuration(iso: string): number {
  // Parses ISO 8601 durations like PT3M22S into seconds.
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

async function callYouTube(path: string, params: Record<string, string>) {
  const apiKey = getApiKey();
  const url = new URL(`${YT_API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const data: any = await res.json();

  if (!res.ok) {
    const reason = data?.error?.errors?.[0]?.reason ?? "unknown";
    if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") {
      throw new YouTubeApiError(
        "YouTube's daily search quota has been used up. Please try again tomorrow.",
        429,
        "QUOTA_EXCEEDED"
      );
    }
    if (res.status === 400 || res.status === 403) {
      throw new YouTubeApiError(
        "YouTube rejected the request. Double-check your API key configuration.",
        res.status,
        "INVALID_API_KEY"
      );
    }
    throw new YouTubeApiError(
      data?.error?.message ?? "Unexpected error contacting YouTube.",
      res.status || 500,
      "UNKNOWN"
    );
  }

  return data;
}

export async function searchVideos(query: string): Promise<YouTubeSearchResponse> {
  const searchData = await callYouTube("/search", {
    part: "snippet",
    type: "video",
    videoEmbeddable: "true",
    videoSyndicated: "true",
    maxResults: "15",
    q: query,
  });

  const ids: string[] = (searchData.items ?? [])
    .map((item: any) => item?.id?.videoId)
    .filter(Boolean);

  if (ids.length === 0) {
    return { items: [] };
  }

  // Fetch durations in a second call, since /search does not return contentDetails.
  const detailsData = await callYouTube("/videos", {
    part: "contentDetails,snippet,status",
    id: ids.join(","),
  });

  const durationById = new Map<string, number>();
  const embeddableById = new Map<string, boolean>();
  for (const item of detailsData.items ?? []) {
    durationById.set(item.id, parseIsoDuration(item.contentDetails?.duration ?? "PT0S"));
    embeddableById.set(item.id, item.status?.embeddable !== false);
  }

  const items: YouTubeSearchResultItem[] = (searchData.items ?? [])
    .map((item: any) => {
      const videoId = item.id?.videoId;
      if (!videoId) return null;
      if (embeddableById.get(videoId) === false) return null;
      return {
        videoId,
        title: item.snippet?.title ?? "Untitled",
        channelTitle: item.snippet?.channelTitle ?? "Unknown artist",
        thumbnail:
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url ??
          "",
        publishedAt: item.snippet?.publishedAt ?? "",
        durationSeconds: durationById.get(videoId) ?? 0,
      };
    })
    .filter(Boolean);

  return { items };
}

export async function getVideoDetails(videoId: string): Promise<YouTubeVideoDetails> {
  const data = await callYouTube("/videos", {
    part: "snippet,contentDetails,status",
    id: videoId,
  });

  const item = data.items?.[0];
  if (!item) {
    throw new YouTubeApiError("That video could not be found.", 404, "NOT_FOUND");
  }

  return {
    videoId,
    title: item.snippet?.title ?? "Untitled",
    channelTitle: item.snippet?.channelTitle ?? "Unknown artist",
    thumbnail:
      item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? "",
    durationSeconds: parseIsoDuration(item.contentDetails?.duration ?? "PT0S"),
    isEmbeddable: item.status?.embeddable !== false,
  };
}
