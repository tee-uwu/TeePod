import { Github, Instagram } from "lucide-react";
import { useEffect } from "react";
import AboutModal from "./components/AboutModal";
import { BodyColorModal, WheelColorModal } from "./components/ColorPicker";
import ErrorBanner from "./components/ErrorBanner";
import IPod from "./components/IPod";
import MenuModal from "./components/MenuModal";
import Playlist from "./components/Playlist";
import SearchModal from "./components/SearchModal";
import SettingsModal from "./components/SettingsModal";
import StickerPicker from "./components/StickerPicker";
import WallpaperModal from "./components/WallpaperModal";
import YouTubePlayer from "./components/YouTubePlayer";
import { useAlbumPalette } from "./hooks/useAlbumPalette";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { checkApiHealth } from "./services/youtube";
import { useStore } from "./store/useStore";

export default function App() {
  useKeyboardControls();

  const theme = useStore((s) => s.settings.theme);
  const wallpaper = useStore((s) => s.wallpaper);
  const setErrorMessage = useStore((s) => s.setErrorMessage);
  const playlist = useStore((s) => s.playlist);
  const highlightedIndex = useStore((s) => s.highlightedIndex);
  const currentSongId = useStore((s) => s.currentSongId);

  // Active song when scrolling through music or playing
  const activeSong =
    playlist[highlightedIndex] ??
    playlist.find((s) => s.id === currentSongId) ??
    playlist[0] ??
    null;

  const palette = useAlbumPalette(activeSong, playlist);

  useEffect(() => {
    checkApiHealth().then((health) => {
      if (!health.hasApiKey) {
        setErrorMessage(
          "Please check your API configuration — the server is missing a YouTube API key."
        );
      }
    });
  }, [setErrorMessage]);

  return (
    <div
      className={`min-h-[100dvh] w-full transition-[background-color,background-image,color] duration-700 ease-out bg-cover bg-center bg-no-repeat relative overflow-x-hidden ${
        theme === "dark" ? "text-cream" : "text-ink"
      }`}
      style={
        wallpaper
          ? { backgroundImage: `url(${wallpaper})` }
          : {
              backgroundColor: theme === "dark" ? palette.fadedDark : palette.fadedLight,
              backgroundImage:
                theme === "dark"
                  ? palette.fadedGradientDark
                  : palette.fadedGradientLight,
            }
      }
    >
      {/* User custom wallpaper dim overlay */}
      {wallpaper && (
        <div className="fixed inset-0 bg-black/20 pointer-events-none backdrop-blur-[1px]" />
      )}

      {/* Dynamic ambient color glow from the active album */}
      {!wallpaper && (
        <div
          className="pointer-events-none fixed inset-0 transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle at 50% 42%, ${palette.glowColor} 0%, transparent 68%)`,
          }}
        />
      )}

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-2xl flex-col items-center justify-center px-4 py-8 sm:py-12">
        <IPod />

        {/* Developer Credit Footer */}
        <footer className="mt-6 flex flex-col items-center gap-2 text-center select-none">
          <p className="font-mono text-xs tracking-wider opacity-60">developed by tee_hee</p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram profile"
              className="opacity-70 hover:opacity-100 transition active:scale-90"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="opacity-70 hover:opacity-100 transition active:scale-90"
            >
              <Github size={20} />
            </a>
          </div>
        </footer>
      </div>

      <YouTubePlayer />
      <ErrorBanner />

      <MenuModal />
      <SearchModal />
      <Playlist />
      <BodyColorModal />
      <WheelColorModal />
      <StickerPicker />
      <WallpaperModal />
      <SettingsModal />
      <AboutModal />
    </div>
  );
}
