import type { SearchResult } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

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
  const res = await fetch(`${API_BASE}/youtube/search?q=${encodeURIComponent(query)}`);
  const data = await handle<{ items: SearchResult[] }>(res);
  return data.items;
}

export async function checkApiHealth(): Promise<{ ok: boolean; hasApiKey: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await handle(res);
  } catch {
    return { ok: false, hasApiKey: false };
  }
}
