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
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { checkApiHealth } from "./services/youtube";
import { useStore } from "./store/useStore";

export default function App() {
  useKeyboardControls();

  const theme = useStore((s) => s.settings.theme);
  const wallpaper = useStore((s) => s.wallpaper);
  const setErrorMessage = useStore((s) => s.setErrorMessage);

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
      className={`min-h-[100dvh] w-full transition-all duration-500 bg-cover bg-center bg-no-repeat ${
        theme === "dark" ? "bg-[#1c1712] text-cream" : "bg-[#f2e9da] text-ink"
      }`}
      style={wallpaper ? { backgroundImage: `url(${wallpaper})` } : undefined}
    >
      {wallpaper && (
        <div className="fixed inset-0 bg-black/20 pointer-events-none backdrop-blur-[1px]" />
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
