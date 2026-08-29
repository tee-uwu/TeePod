import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings, ModalKind, PlayerStatus, RepeatMode, ScreenViewMode, Song, StickerItem } from "../types";

interface AppState {
  // Playlist / playback
  playlist: Song[];
  currentSongId: string | null;
  isPlaying: boolean;
  playerStatus: PlayerStatus;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  shuffleHistory: string[];
  errorMessage: string | null;

  // Customization
  // Customization
  bodyColor: string;
  wheelColor: string;
  stickers: StickerItem[];
  wallpaper: string | null;
  screenWallpaper: string | null;

  // UI
  activeModal: ModalKind;
  focusMode: boolean;
  screenViewMode: ScreenViewMode;
  settings: AppSettings;
  selectedStickerId: string | null;
  highlightedIndex: number; // for click-wheel scroll highlighting

  // Actions
  addSong: (song: Song, playImmediately?: boolean) => void;
  removeSong: (id: string) => void;
  reorderPlaylist: (fromIndex: number, toIndex: number) => void;
  clearPlaylist: () => void;
  loadSamplePlaylist: () => void;
  playSong: (id: string) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  setIsPlaying: (playing: boolean) => void;
  setPlayerStatus: (status: PlayerStatus) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setErrorMessage: (msg: string | null) => void;
  setScreenViewMode: (mode: ScreenViewMode) => void;
  cycleScreenViewMode: () => void;

  setBodyColor: (hex: string) => void;
  setWheelColor: (hex: string) => void;
  setWallpaper: (wallpaper: string | null) => void;
  setScreenWallpaper: (wallpaper: string | null) => void;
  addSticker: (emoji: string) => void;
  removeSticker: (id: string) => void;
  updateSticker: (id: string, patch: Partial<StickerItem>) => void;
  setSelectedStickerId: (id: string | null) => void;

  openModal: (modal: ModalKind) => void;
  closeModal: () => void;
  toggleFocusMode: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetCustomization: () => void;
  setHighlightedIndex: (i: number) => void;
  moveHighlight: (delta: number) => void;
  selectHighlighted: () => void;
}

const DEFAULT_BODY_COLOR = "#FF6F61";
const DEFAULT_WHEEL_COLOR = "#FBF4E7";

const DEFAULT_PLAYLIST: Song[] = [
  {
    id: "default-akkhep",
    youtubeVideoId: "4GrVEyDdoF4",
    title: "Akkhep (আক্ষেপ)",
    artist: "Beats of Dream",
    thumbnail: "https://i.ytimg.com/vi/4GrVEyDdoF4/mqdefault.jpg",
    duration: 250,
  },
  {
    id: "default-kolpona",
    youtubeVideoId: "mO1plXv6ZTU",
    title: "Kolpona (কল্পনা)",
    artist: "Achar",
    thumbnail: "https://i.ytimg.com/vi/mO1plXv6ZTU/mqdefault.jpg",
    duration: 220,
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      playlist: DEFAULT_PLAYLIST,
      currentSongId: DEFAULT_PLAYLIST[0].id,
      isPlaying: false,
      playerStatus: "idle",
      currentTime: 0,
      duration: 0,
      volume: 70,
      shuffle: false,
      repeatMode: "off",
      shuffleHistory: [],
      errorMessage: null,

      bodyColor: DEFAULT_BODY_COLOR,
      wheelColor: DEFAULT_WHEEL_COLOR,
      stickers: [],
      wallpaper: null,
      screenWallpaper: null,

      activeModal: null,
      focusMode: false,
      screenViewMode: "coverflow",
      settings: { autoplay: true, theme: "light", hapticsEnabled: true, soundEnabled: true },
      selectedStickerId: null,
      highlightedIndex: 0,

      addSong: (song, playImmediately = false) => {
        set((state) => {
          const exists = state.playlist.some((s) => s.youtubeVideoId === song.youtubeVideoId);
          const playlist = exists ? state.playlist : [...state.playlist, song];
          return {
            playlist,
            currentSongId: playImmediately ? song.id : state.currentSongId ?? song.id,
            isPlaying: playImmediately ? true : state.isPlaying,
          };
        });
      },

      removeSong: (id) => {
        set((state) => {
          const playlist = state.playlist.filter((s) => s.id !== id);
          const currentSongId =
            state.currentSongId === id ? playlist[0]?.id ?? null : state.currentSongId;
          return { playlist, currentSongId };
        });
      },

      reorderPlaylist: (fromIndex, toIndex) => {
        set((state) => {
          const playlist = [...state.playlist];
          const [moved] = playlist.splice(fromIndex, 1);
          playlist.splice(toIndex, 0, moved);
          return { playlist };
        });
      },

      clearPlaylist: () => set({ playlist: [], currentSongId: null, isPlaying: false }),

      loadSamplePlaylist: () =>
        set({
          playlist: DEFAULT_PLAYLIST,
          currentSongId: DEFAULT_PLAYLIST[0].id,
          isPlaying: false,
          highlightedIndex: 0,
        }),

      setScreenViewMode: (mode) => set({ screenViewMode: mode }),

      cycleScreenViewMode: () =>
        set((state) => {
          const modes: ScreenViewMode[] = ["coverflow", "nowplaying", "list"];
          const current = modes.indexOf(state.screenViewMode);
          return { screenViewMode: modes[(current + 1) % modes.length] };
        }),

      playSong: (id) => set({ currentSongId: id, isPlaying: true, playerStatus: "loading" }),

      togglePlay: () => {
        const { playlist, currentSongId } = get();
        if (!currentSongId && playlist.length > 0) {
          set({ currentSongId: playlist[0].id, isPlaying: true });
          return;
        }
        set((state) => ({ isPlaying: !state.isPlaying }));
      },

      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setPlayerStatus: (status) => set({ playerStatus: status }),
      setCurrentTime: (t) => set({ currentTime: t }),
      setDuration: (d) => set({ duration: d }),
      setVolume: (v) => set({ volume: Math.max(0, Math.min(100, v)) }),
      setErrorMessage: (msg) => set({ errorMessage: msg }),

      next: () => {
        const { playlist, currentSongId, shuffle, repeatMode, shuffleHistory } = get();
        if (playlist.length === 0) return;

        if (repeatMode === "one") {
          set({ currentTime: 0, isPlaying: true, playerStatus: "loading" });
          return;
        }

        const currentIndex = playlist.findIndex((s) => s.id === currentSongId);

        if (shuffle) {
          const remaining = playlist.filter((s) => !shuffleHistory.includes(s.id));
          const pool = remaining.length > 0 ? remaining : playlist;
          const pick = pool[Math.floor(Math.random() * pool.length)];
          const newHistory = remaining.length > 0 ? [...shuffleHistory, pick.id] : [pick.id];
          set({
            currentSongId: pick.id,
            isPlaying: true,
            playerStatus: "loading",
            shuffleHistory: newHistory,
          });
          return;
        }

        const isLast = currentIndex === playlist.length - 1 || currentIndex === -1;
        if (isLast) {
          if (repeatMode === "all") {
            set({ currentSongId: playlist[0].id, isPlaying: true, playerStatus: "loading" });
          } else {
            set({ isPlaying: false, playerStatus: "idle" });
          }
          return;
        }
        set({
          currentSongId: playlist[currentIndex + 1].id,
          isPlaying: true,
          playerStatus: "loading",
        });
      },

      previous: () => {
        const { playlist, currentSongId, currentTime } = get();
        if (playlist.length === 0) return;

        // Scrubbing back within the first 3s of a song restarts it, like a real device.
        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }

        const currentIndex = playlist.findIndex((s) => s.id === currentSongId);
        const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
        set({
          currentSongId: playlist[prevIndex].id,
          isPlaying: true,
          playerStatus: "loading",
        });
      },

      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle, shuffleHistory: [] })),

      cycleRepeat: () =>
        set((state) => {
          const order: RepeatMode[] = ["off", "all", "one"];
          const idx = order.indexOf(state.repeatMode);
          return { repeatMode: order[(idx + 1) % order.length] };
        }),

      setBodyColor: (hex) => set({ bodyColor: hex }),
      setWheelColor: (hex) => set({ wheelColor: hex }),
      setWallpaper: (wallpaper) => set({ wallpaper }),
      setScreenWallpaper: (wallpaper) => set({ screenWallpaper: wallpaper }),

      addSticker: (emoji) =>
        set((state) => ({
          stickers: [
            ...state.stickers,
            {
              id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              emoji,
              x: 50,
              y: 50,
              rotation: 0,
              scale: 1,
            },
          ],
        })),

      removeSticker: (id) =>
        set((state) => ({
          stickers: state.stickers.filter((s) => s.id !== id),
          selectedStickerId: state.selectedStickerId === id ? null : state.selectedStickerId,
        })),

      updateSticker: (id, patch) =>
        set((state) => ({
          stickers: state.stickers.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),

      setSelectedStickerId: (id) => set({ selectedStickerId: id }),

      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),
      toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),

      resetCustomization: () =>
        set({
          bodyColor: DEFAULT_BODY_COLOR,
          wheelColor: DEFAULT_WHEEL_COLOR,
          stickers: [],
          wallpaper: null,
          screenWallpaper: null,
        }),

      setHighlightedIndex: (i) => set({ highlightedIndex: i }),

      moveHighlight: (delta) =>
        set((state) => {
          if (state.playlist.length === 0) return {};
          const len = state.playlist.length;
          const next = ((state.highlightedIndex + delta) % len + len) % len;
          return { highlightedIndex: next };
        }),

      selectHighlighted: () => {
        const { playlist, highlightedIndex } = get();
        const song = playlist[highlightedIndex];
        if (song) set({ currentSongId: song.id, isPlaying: true, playerStatus: "loading" });
      },
    }),
    {
      name: "shufl-fm-storage",
      partialize: (state) => ({
        playlist: state.playlist,
        currentSongId: state.currentSongId,
        volume: state.volume,
        shuffle: state.shuffle,
        repeatMode: state.repeatMode,
        bodyColor: state.bodyColor,
        wheelColor: state.wheelColor,
        stickers: state.stickers,
        wallpaper: state.wallpaper,
        screenWallpaper: state.screenWallpaper,
        settings: state.settings,
      }),
    }
  )
);
