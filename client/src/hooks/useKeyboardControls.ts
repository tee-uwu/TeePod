import { useEffect } from "react";
import { useStore } from "../store/useStore";

export function useKeyboardControls() {
  const togglePlay = useStore((s) => s.togglePlay);
  const next = useStore((s) => s.next);
  const previous = useStore((s) => s.previous);
  const setVolume = useStore((s) => s.setVolume);
  const volume = useStore((s) => s.volume);
  const activeModal = useStore((s) => s.activeModal);
  const openModal = useStore((s) => s.openModal);
  const closeModal = useStore((s) => s.closeModal);
  const selectHighlighted = useStore((s) => s.selectHighlighted);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isTyping) {
        if (e.key === "Escape") closeModal();
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          previous();
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(volume + 5);
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(volume - 5);
          break;
        case "m":
        case "M":
          openModal(activeModal ? null : "menu");
          break;
        case "Enter":
          selectHighlighted();
          break;
        case "Escape":
          closeModal();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, next, previous, setVolume, volume, activeModal, openModal, closeModal, selectHighlighted]);
}
