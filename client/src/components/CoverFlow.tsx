import { AnimatePresence, motion } from "framer-motion";
import { Music2, Play } from "lucide-react";
import React, { useRef } from "react";
import type { Song } from "../types";

interface CoverFlowProps {
  playlist: Song[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  currentSongId: string | null;
  isPlaying: boolean;
}

export default function CoverFlow({
  playlist,
  selectedIndex,
  onSelect,
  currentSongId,
  isPlaying,
}: CoverFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);

  if (playlist.length === 0) return null;

  const activeSong = playlist[selectedIndex] || playlist[0];

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    dragStartX.current = null;

    if (Math.abs(deltaX) > 30) {
      if (deltaX < 0 && selectedIndex < playlist.length - 1) {
        onSelect(selectedIndex + 1);
      } else if (deltaX > 0 && selectedIndex > 0) {
        onSelect(selectedIndex - 1);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative flex h-full w-full flex-col justify-between overflow-hidden px-2 pt-1 pb-2 select-none cursor-grab active:cursor-grabbing"
    >
      {/* 3D Cover Flow Stage */}
      <div
        className="relative flex-1 flex items-center justify-center"
        style={{ perspective: "600px", transformStyle: "preserve-3d" }}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {playlist.map((song, i) => {
            const offset = i - selectedIndex;
            const isSelected = i === selectedIndex;
            const isPlayingThis = song.id === currentSongId && isPlaying;

            // Only render items within a 3-item distance for performance & clean visuals
            if (Math.abs(offset) > 3) return null;

            // Calculate 3D transforms
            const rotateY = isSelected ? 0 : offset < 0 ? 45 : -45;
            const translateX = isSelected ? 0 : offset * 64 + (offset < 0 ? -12 : 12);
            const scale = isSelected ? 1.08 : 0.72 - Math.abs(offset) * 0.05;
            const zIndex = 30 - Math.abs(offset) * 5;
            const opacity = isSelected ? 1 : Math.max(0.3, 0.75 - Math.abs(offset) * 0.15);

            return (
              <motion.div
                key={song.id}
                onClick={() => onSelect(i)}
                initial={false}
                animate={{
                  x: translateX,
                  rotateY,
                  scale,
                  opacity,
                  zIndex,
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 26,
                  mass: 0.8,
                }}
                className="absolute aspect-square w-[44%] max-w-[105px] rounded-lg cursor-pointer"
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: isSelected
                    ? "0 12px 28px -4px rgba(0, 0, 0, 0.75), 0 0 0 1.5px rgba(255, 255, 255, 0.25)"
                    : "0 6px 16px -2px rgba(0, 0, 0, 0.5)",
                }}
              >
                {/* Album Cover Art */}
                <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#1a202c]">
                  {song.thumbnail ? (
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#2d3748]">
                      <Music2 size={24} className="text-[#9fd4c7]" />
                    </div>
                  )}

                  {/* Playing Indicator Overlay */}
                  {isPlayingThis && (
                    <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#9fd4c7] text-[#12161a] shadow">
                      <Play size={10} fill="currentColor" />
                    </div>
                  )}
                </div>

                {/* Subtle Reflection below album cover */}
                <div
                  className="pointer-events-none absolute -bottom-[75%] left-0 right-0 h-[70%] overflow-hidden rounded-b-lg opacity-25"
                  style={{
                    transform: "scaleY(-1)",
                    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
                    WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
                  }}
                >
                  {song.thumbnail && (
                    <img
                      src={song.thumbnail}
                      alt=""
                      className="h-full w-full object-cover blur-[0.5px]"
                      draggable={false}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Track Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSong?.id || "empty"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="mt-1 text-center min-w-0 px-2"
        >
          <p className="truncate text-[12px] font-display font-semibold leading-tight text-[#eef3f6]">
            {activeSong?.title || "No Track Selected"}
          </p>
          <p className="truncate text-[10px] text-[#9fd4c7] font-medium mt-0.5">
            {activeSong?.artist || "Unknown Artist"}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
