import { ChevronDown, ChevronUp, ListMusic, Pause, Play, Trash2 } from "lucide-react";
import { useStore } from "../store/useStore";
import ModalSheet from "./ModalSheet";

export default function Playlist() {
  const activeModal = useStore((s) => s.activeModal);
  const closeModal = useStore((s) => s.closeModal);
  const playlist = useStore((s) => s.playlist);
  const currentSongId = useStore((s) => s.currentSongId);
  const isPlaying = useStore((s) => s.isPlaying);
  const playSong = useStore((s) => s.playSong);
  const togglePlay = useStore((s) => s.togglePlay);
  const removeSong = useStore((s) => s.removeSong);
  const reorderPlaylist = useStore((s) => s.reorderPlaylist);
  const clearPlaylist = useStore((s) => s.clearPlaylist);
  const loadSamplePlaylist = useStore((s) => s.loadSamplePlaylist);
  const openModal = useStore((s) => s.openModal);

  return (
    <ModalSheet open={activeModal === "playlist"} title="Playlist" onClose={closeModal}>
      {playlist.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-ink/50">
          <ListMusic size={22} />
          <p className="text-sm font-display">Your playlist is empty.</p>
          <div className="flex flex-col gap-2 mt-2">
            <button
              type="button"
              onClick={loadSamplePlaylist}
              className="rounded-full bg-ink px-4 py-2 text-xs font-display font-medium text-cream shadow transition active:scale-95"
            >
              ⚡ Add Sample Hits
            </button>
            <button
              type="button"
              onClick={() => openModal("search")}
              className="rounded-full border border-black/10 px-4 py-2 text-xs font-display font-medium text-ink/70 hover:bg-black/5"
            >
              + Search YouTube
            </button>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-1">
            {playlist.map((song, index) => {
              const isCurrent = song.id === currentSongId;
              return (
                <li
                  key={song.id}
                  className={`flex items-center gap-2 rounded-xl px-2 py-2 transition ${
                    isCurrent ? "bg-black/[0.05]" : "hover:bg-black/[0.03]"
                  }`}
                >
                  <button
                    type="button"
                    aria-label={isCurrent && isPlaying ? "Pause" : `Play ${song.title}`}
                    onClick={() => (isCurrent ? togglePlay() : playSong(song.id))}
                    className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg"
                  >
                    <img src={song.thumbnail} alt="" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 transition hover:opacity-100">
                      {isCurrent && isPlaying ? (
                        <Pause size={14} fill="currentColor" />
                      ) : (
                        <Play size={14} fill="currentColor" />
                      )}
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-semibold ${
                        isCurrent ? "text-ink" : "text-ink/80"
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="truncate text-xs text-ink/50">{song.artist}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => reorderPlaylist(index, index - 1)}
                      className="rounded-full p-1 text-ink/40 hover:bg-black/5 disabled:opacity-20"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={index === playlist.length - 1}
                      onClick={() => reorderPlaylist(index, index + 1)}
                      className="rounded-full p-1 text-ink/40 hover:bg-black/5 disabled:opacity-20"
                    >
                      <ChevronDown size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${song.title}`}
                      onClick={() => removeSong(song.id)}
                      className="rounded-full p-1 text-red-400 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={clearPlaylist}
            className="mt-4 w-full rounded-full border border-red-200 py-2 text-xs font-display font-medium text-red-500 transition hover:bg-red-50"
          >
            Clear playlist
          </button>
        </>
      )}
    </ModalSheet>
  );
}
