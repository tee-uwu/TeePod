import { Loader2, Music2, Plus, Search as SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ApiError, searchYouTube } from "../services/youtube";
import { useStore } from "../store/useStore";
import type { SearchResult } from "../types";
import ModalSheet from "./ModalSheet";

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SearchModal() {
  const activeModal = useStore((s) => s.activeModal);
  const closeModal = useStore((s) => s.closeModal);
  const addSong = useStore((s) => s.addSong);
  const playlist = useStore((s) => s.playlist);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "empty">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeModal !== "search") return;
    if (query.trim().length === 0) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const items = await searchYouTube(query.trim());
        setResults(items);
        setStatus(items.length === 0 ? "empty" : "idle");
      } catch (err) {
        setStatus("error");
        setErrorMsg(
          err instanceof ApiError ? err.message : "Couldn't search YouTube right now."
        );
      }
    }, 450);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, activeModal]);

  const handleAdd = (result: SearchResult, playNow: boolean) => {
    addSong(
      {
        id: `song-${result.videoId}-${Date.now()}`,
        youtubeVideoId: result.videoId,
        title: result.title,
        artist: result.channelTitle,
        thumbnail: result.thumbnail,
        duration: result.durationSeconds,
      },
      playNow
    );
    if (playNow) closeModal();
  };

  const alreadyAdded = (videoId: string) =>
    playlist.some((s) => s.youtubeVideoId === videoId);

  return (
    <ModalSheet
      open={activeModal === "search"}
      title="Search music"
      onClose={() => {
        closeModal();
        setQuery("");
      }}
    >
      <div className="relative mb-3">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
        />
        <input
          autoFocus
          type="search"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song or artist..."
          aria-label="Search YouTube for music"
          className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-9 pr-4 text-sm outline-none ring-0 placeholder:text-ink/40 focus:border-ink/30"
        />
      </div>

      {status === "loading" && (
        <div className="flex flex-col items-center gap-2 py-10 text-ink/50">
          <Loader2 size={20} className="animate-spin" />
          <p className="text-xs font-mono">Searching YouTube...</p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>
      )}

      {status === "empty" && (
        <div className="flex flex-col items-center gap-1 py-10 text-center text-ink/50">
          <Music2 size={20} />
          <p className="text-sm font-display">No songs found.</p>
          <p className="text-xs">Try a different search term.</p>
        </div>
      )}

      {status === "idle" && results.length === 0 && query.trim().length === 0 && (
        <div className="flex flex-col items-center gap-1 py-10 text-center text-ink/40">
          <Music2 size={20} />
          <p className="text-sm">Search any song, artist, or album on YouTube.</p>
        </div>
      )}

      <ul className="flex flex-col gap-1">
        {results.map((result) => (
          <li
            key={result.videoId}
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-black/[0.03]"
          >
            <img
              src={result.thumbnail}
              alt=""
              className="h-11 w-11 shrink-0 rounded-lg object-cover"
              draggable={false}
            />
            <button
              type="button"
              onClick={() => handleAdd(result, true)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-sm font-semibold text-ink">{result.title}</p>
              <p className="truncate text-xs text-ink/50">
                {result.channelTitle}
                {result.durationSeconds ? ` · ${formatDuration(result.durationSeconds)}` : ""}
              </p>
            </button>
            <button
              type="button"
              aria-label={`Add ${result.title} to playlist`}
              onClick={() => handleAdd(result, false)}
              disabled={alreadyAdded(result.videoId)}
              className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-[11px] font-display font-medium text-cream transition active:scale-95 disabled:opacity-40"
            >
              <span className="flex items-center gap-1">
                <Plus size={12} /> {alreadyAdded(result.videoId) ? "Added" : "Add"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </ModalSheet>
  );
}
