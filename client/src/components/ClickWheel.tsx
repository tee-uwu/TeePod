import { motion } from "framer-motion";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useState } from "react";
import { useClickWheelRotation, type WheelQuadrant } from "../hooks/useClickWheelRotation";
import { useStore } from "../store/useStore";
import { darken, lighten } from "../utils/color";
import {
  playButtonSound,
  triggerHapticButton,
  triggerHapticSelect,
} from "../utils/haptics";

export default function ClickWheel() {
  const wheelColor = useStore((s) => s.wheelColor);
  const isPlaying = useStore((s) => s.isPlaying);
  const playlist = useStore((s) => s.playlist);
  const currentSongId = useStore((s) => s.currentSongId);
  const togglePlay = useStore((s) => s.togglePlay);
  const next = useStore((s) => s.next);
  const previous = useStore((s) => s.previous);
  const moveHighlight = useStore((s) => s.moveHighlight);
  const selectHighlighted = useStore((s) => s.selectHighlighted);
  const openModal = useStore((s) => s.openModal);
  const activeModal = useStore((s) => s.activeModal);
  const hapticsEnabled = useStore((s) => s.settings.hapticsEnabled);
  const soundEnabled = useStore((s) => s.settings.soundEnabled);

  const [activeButton, setActiveButton] = useState<WheelQuadrant | null>(null);
  const [ripple, setRipple] = useState<{ dir: 1 | -1; key: number } | null>(null);

  const handleButtonTap = (button: WheelQuadrant) => {
    setActiveButton(button);
    setTimeout(() => setActiveButton(null), 180);

    if (hapticsEnabled) triggerHapticButton();
    if (soundEnabled) playButtonSound();

    switch (button) {
      case "menu":
        openModal(activeModal === "menu" ? null : "menu");
        break;
      case "previous":
        previous();
        break;
      case "next":
        next();
        break;
      case "play":
        togglePlay();
        break;
    }
  };

  const { ref, handlers } = useClickWheelRotation({
    onStep: (direction) => {
      setRipple({ dir: direction, key: Date.now() });
      if (playlist.length > 0) {
        moveHighlight(direction);
      }
    },
    onButtonTap: handleButtonTap,
  });

  const handleCenter = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (hapticsEnabled) triggerHapticSelect();
    if (soundEnabled) playButtonSound(0.65);

    if (playlist.length > 0) {
      selectHighlighted();
    } else {
      togglePlay();
    }
  };

  const wheelLight = lighten(wheelColor, 0.5);
  const wheelDark = darken(wheelColor, 0.12);

  return (
    <div className="relative mx-auto mt-6 aspect-square w-[78%] max-w-[19rem] select-none">
      {/* Outer rotary ring controller */}
      <div
        ref={ref}
        {...handlers}
        role="slider"
        aria-label="iPod Click Wheel — drag anywhere on the ring to scroll, tap top/bottom/left/right for controls"
        aria-valuemin={0}
        aria-valuemax={playlist.length || 1}
        aria-valuenow={playlist.findIndex((s) => s.id === currentSongId) + 1}
        tabIndex={0}
        className="absolute inset-0 rounded-full shadow-wheel cursor-grab active:cursor-grabbing touch-none select-none"
        style={{
          background: `radial-gradient(circle at 32% 28%, ${wheelLight}, ${wheelColor} 55%, ${wheelDark} 100%)`,
          touchAction: "none",
        }}
      >
        {/* Step Ripple Animation */}
        {ripple && (
          <motion.div
            key={ripple.key}
            initial={{ opacity: 0.45, scale: 0.9 }}
            animate={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-3 rounded-full"
            style={{
              boxShadow: `0 0 0 2.5px ${darken(wheelColor, 0.3)}`,
            }}
          />
        )}

        {/* Button Labels & Icons (pointer-events-none so touch down on top/MENU passes to wheel) */}
        <div
          className={`pointer-events-none absolute left-1/2 top-[9%] -translate-x-1/2 text-[11px] font-display font-semibold tracking-wide text-[var(--ipod-body-dark)]/70 transition-transform ${
            activeButton === "menu" ? "scale-90 opacity-100 text-black" : "scale-100"
          }`}
        >
          MENU
        </div>

        <div
          className={`pointer-events-none absolute left-[9%] top-1/2 -translate-y-1/2 text-[var(--ipod-body-dark)]/70 transition-transform ${
            activeButton === "previous" ? "scale-90 opacity-100 text-black" : "scale-100"
          }`}
        >
          <SkipBack size={20} strokeWidth={2.25} />
        </div>

        <div
          className={`pointer-events-none absolute right-[9%] top-1/2 -translate-y-1/2 text-[var(--ipod-body-dark)]/70 transition-transform ${
            activeButton === "next" ? "scale-90 opacity-100 text-black" : "scale-100"
          }`}
        >
          <SkipForward size={20} strokeWidth={2.25} />
        </div>

        <div
          className={`pointer-events-none absolute left-1/2 bottom-[9%] -translate-x-1/2 text-[var(--ipod-body-dark)]/70 transition-transform ${
            activeButton === "play" ? "scale-90 opacity-100 text-black" : "scale-100"
          }`}
        >
          {isPlaying ? (
            <Pause size={19} strokeWidth={2.25} />
          ) : (
            <Play size={19} strokeWidth={2.25} />
          )}
        </div>
      </div>

      {/* Center Select Button */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
        <motion.button
          type="button"
          aria-label={playlist.length > 0 ? "Select highlighted song" : isPlaying ? "Pause" : "Play"}
          onPointerDown={handleCenter}
          whileTap={{ scale: 0.94 }}
          className="pointer-events-auto aspect-square w-[38%] rounded-full shadow-lg touch-none"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${lighten(wheelColor, 0.15)}, ${darken(
              wheelColor,
              0.18
            )})`,
            boxShadow: `0 3px 8px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.4)`,
          }}
        />
      </div>
    </div>
  );
}
