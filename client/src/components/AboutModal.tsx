import { Github, Instagram } from "lucide-react";
import { useStore } from "../store/useStore";
import ModalSheet from "./ModalSheet";

export default function AboutModal() {
  const activeModal = useStore((s) => s.activeModal);
  const closeModal = useStore((s) => s.closeModal);

  return (
    <ModalSheet open={activeModal === "about"} title="About TeePod" onClose={closeModal}>
      <div className="flex flex-col items-center gap-4 text-sm text-ink/80 text-center">
        <img
          src="/teepod.png"
          alt="TeePod Logo"
          className="h-24 w-24 object-contain rounded-2xl drop-shadow-md"
        />
        <p>
          TeePod is a customizable, click-wheel music player that searches YouTube for songs
          and plays them through YouTube's official embedded player.
        </p>
        <p className="text-xs text-ink/60">
          Playback runs entirely inside the official YouTube IFrame Player. Playlist, customization, and settings are saved locally on your device.
        </p>

        <div className="mt-2 flex flex-col items-center gap-2 border-t border-black/10 pt-3 w-full">
          <p className="font-mono text-xs tracking-wider opacity-70">developed by tee_hee</p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram profile"
              className="text-ink/70 hover:text-ink transition active:scale-90"
            >
              <Instagram size={22} />
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="text-ink/70 hover:text-ink transition active:scale-90"
            >
              <Github size={22} />
            </a>
          </div>
        </div>
      </div>
    </ModalSheet>
  );
}
