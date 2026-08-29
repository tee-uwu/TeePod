import { AnimatePresence, motion } from "framer-motion";
import {
  Layers,
  List,
  Music2,
  Pause,
  Play,
  Radio,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
} from "lucide-react";
import { useStore } from "../store/useStore";
import CoverFlow from "./CoverFlow";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function IPodScreen() {
  const playlist = useStore((s) => s.playlist);
  const currentSongId = useStore((s) => s.currentSongId);
  const isPlaying = useStore((s) => s.isPlaying);
  const currentTime = useStore((s) => s.currentTime);
  const duration = useStore((s) => s.duration);
  const playerStatus = useStore((s) => s.playerStatus);
  const shuffle = useStore((s) => s.shuffle);
  const repeatMode = useStore((s) => s.repeatMode);
  const highlightedIndex = useStore((s) => s.highlightedIndex);
  const setHighlightedIndex = useStore((s) => s.setHighlightedIndex);
  const screenViewMode = useStore((s) => s.screenViewMode);
  const cycleScreenViewMode = useStore((s) => s.cycleScreenViewMode);
  const loadSamplePlaylist = useStore((s) => s.loadSamplePlaylist);
  const screenWallpaper = useStore((s) => s.screenWallpaper);
  const openModal = useStore((s) => s.openModal);

  const currentSong = playlist.find((s) => s.id === currentSongId);
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  // Determine active view mode
  const activeMode =
    playlist.length === 0
      ? "empty"
      : screenViewMode;

  return (
    <div
      className="relative w-full aspect-[4/3] rounded-[1.1rem] bg-[#12161a] shadow-screen overflow-hidden select-none bg-cover bg-center"
      style={screenWallpaper ? { backgroundImage: `url(${screenWallpaper})` } : undefined}
      role="region"
      aria-label="iPod screen display"
    >
      {screenWallpaper && (
        <div className="pointer-events-none absolute inset-0 bg-black/45 backdrop-blur-[0.5px]" />
      )}

      {/* subtle glass reflection */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -inset-x-10 -top-10 h-24 rotate-6 bg-white/10 blur-2xl" />

      <div className="relative h-full w-full flex flex-col text-[#eef3f6]">
        {/* status bar */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#9fd4c7] border-b border-white/5">
          <span className="flex items-center gap-1">
            <Radio size={11} /> TeePod
          </span>
          <div className="flex items-center gap-2">
            {playlist.length > 0 && (
              <button
                type="button"
                onClick={cycleScreenViewMode}
                className="flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white hover:bg-white/20 transition"
              >
                {screenViewMode === "coverflow" && <Layers size={10} />}
                {screenViewMode === "nowplaying" && <Music2 size={10} />}
                {screenViewMode === "list" && <List size={10} />}
                <span className="capitalize">{screenViewMode}</span>
              </button>
            )}
            <span className="flex items-center gap-1.5">
              {shuffle && <Shuffle size={11} aria-label="Shuffle on" />}
              {repeatMode === "one" && <Repeat1 size={11} aria-label="Repeat one" />}
              {repeatMode === "all" && <Repeat size={11} aria-label="Repeat all" />}
            </span>
          </div>
        </div>

        {/* Screen Content */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            {activeMode === "empty" ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center"
              >
                <Music2 size={24} className="text-[#9fd4c7]" />
                <p className="text-[12px] font-display text-[#dce9e5]">Your playlist is empty.</p>
                <div className="flex flex-col gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={loadSamplePlaylist}
                    className="rounded-full bg-[#9fd4c7] px-3 py-1 text-[10px] font-display font-medium text-[#12161a] transition active:scale-95 shadow"
                  >
                    ⚡ Add Sample Playlist
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal("search")}
                    className="text-[10px] font-mono text-[#9fd4c7] hover:underline"
                  >
                    or Search YouTube
                  </button>
                </div>
              </motion.div>
            ) : activeMode === "coverflow" ? (
              <motion.div
                key="coverflow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-h-0"
              >
                <CoverFlow
                  playlist={playlist}
                  selectedIndex={Math.min(highlightedIndex, playlist.length - 1)}
                  onSelect={(idx) => setHighlightedIndex(idx)}
                  currentSongId={currentSongId}
                  isPlaying={isPlaying}
                />
              </motion.div>
            ) : activeMode === "nowplaying" && currentSong ? (
              <motion.div
                key="nowplaying"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex-1 flex flex-col items-center justify-center gap-2 px-4 pb-2 min-h-0"
              >
                <div className="relative w-[38%] aspect-square rounded-md overflow-hidden shadow-lg shadow-black/50 ring-1 ring-white/10 shrink-0">
                  {currentSong.thumbnail ? (
                    <img
                      src={currentSong.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#1f2933]">
                      <Music2 size={20} className="text-[#9fd4c7]" />
                    </div>
                  )}
                  {playerStatus === "loading" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="text-center min-w-0 w-full">
                  <p className="truncate text-[13px] font-display font-semibold leading-tight text-[#eef3f6]">
                    {currentSong.title}
                  </p>
                  <p className="truncate text-[11px] text-[#9fd4c7]">{currentSong.artist}</p>
                </div>

                <div className="w-full px-1">
                  <div className="h-1 w-full rounded-full bg-white/15 overflow-hidden">
                    <motion.div
                      className="h-full bg-[#9fd4c7]"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "linear", duration: 0.4 }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-[#9fd4c7]/80">
                    <span>{formatTime(currentTime)}</span>
                    <span className="flex items-center gap-1">
                      {isPlaying ? <Play size={9} fill="currentColor" /> : <Pause size={9} />}
                      {formatTime(duration || currentSong.duration)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* List Mode */
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col overflow-hidden px-2 py-1"
              >
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono text-[#9fd4c7] border-b border-white/10">
                  <span>PLAYLIST ({playlist.length})</span>
                  <Volume2 size={11} />
                </div>
                <ul className="flex-1 overflow-y-auto py-1">
                  {playlist.map((song, i) => {
                    const isHighlighted = i === highlightedIndex;
                    const isCurrent = song.id === currentSongId;
                    return (
                      <li
                        key={song.id}
                        onClick={() => setHighlightedIndex(i)}
                        className={`flex items-center justify-between truncate rounded px-2 py-1 text-[11px] font-mono cursor-pointer transition ${
                          isHighlighted
                            ? "bg-[#9fd4c7] text-[#12161a] font-bold"
                            : isCurrent
                            ? "text-[#9fd4c7]"
                            : "text-[#dce9e5]"
                        }`}
                      >
                        <span className="truncate min-w-0 flex-1">{song.title}</span>
                        {isCurrent && isPlaying && (
                          <span className="ml-1 shrink-0 text-[9px]">▶</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
