export interface Song {
  id: string;
  youtubeVideoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number; // seconds
}

export interface SearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  durationSeconds: number;
}

export type RepeatMode = "off" | "one" | "all";

export interface StickerItem {
  id: string;
  emoji: string;
  x: number; // percentage 0-100 relative to the stage
  y: number; // percentage 0-100 relative to the stage
  rotation: number; // degrees
  scale: number;
}

export type ScreenViewMode = "coverflow" | "nowplaying" | "list";

export interface AppSettings {
  autoplay: boolean;
  theme: "light" | "dark";
  hapticsEnabled: boolean;
  soundEnabled: boolean;
}

export type ModalKind =
  | "menu"
  | "search"
  | "playlist"
  | "colorBody"
  | "colorWheel"
  | "stickers"
  | "wallpaper"
  | "settings"
  | "about"
  | null;

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

