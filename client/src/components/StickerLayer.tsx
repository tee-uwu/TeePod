import { useRef } from "react";
import { RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { useStore } from "../store/useStore";

export default function StickerLayer() {
  const stickers = useStore((s) => s.stickers);
  const updateSticker = useStore((s) => s.updateSticker);
  const removeSticker = useStore((s) => s.removeSticker);
  const selectedStickerId = useStore((s) => s.selectedStickerId);
  const setSelectedStickerId = useStore((s) => s.setSelectedStickerId);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragId = useRef<string | null>(null);

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    dragId.current = id;
    setSelectedStickerId(id);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const id = dragId.current;
    const stage = stageRef.current;
    if (!id || !stage) return;
    const rect = stage.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    updateSticker(id, {
      x: Math.max(-6, Math.min(106, x)),
      y: Math.max(-6, Math.min(106, y)),
    });
  };

  const endDrag = () => {
    dragId.current = null;
  };

  return (
    <div
      ref={stageRef}
      className="pointer-events-none absolute inset-0 z-20"
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {stickers.map((sticker) => {
        const isSelected = sticker.id === selectedStickerId;
        return (
          <div
            key={sticker.id}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 touch-none"
            style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
          >
            <button
              type="button"
              aria-label={`${sticker.emoji} sticker, drag to move, tap to select`}
              onPointerDown={(e) => onPointerDown(e, sticker.id)}
              className="cursor-grab select-none text-3xl leading-none drop-shadow-md active:cursor-grabbing"
              style={{
                transform: `rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                outline: isSelected ? "2px dashed rgba(0,0,0,0.25)" : "none",
                outlineOffset: 6,
                borderRadius: 999,
              }}
            >
              {sticker.emoji}
            </button>

            {isSelected && (
              <div className="absolute left-1/2 top-full mt-1 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/95 px-1.5 py-1 shadow-md">
                <button
                  type="button"
                  aria-label="Shrink sticker"
                  onClick={() =>
                    updateSticker(sticker.id, { scale: Math.max(0.5, sticker.scale - 0.15) })
                  }
                  className="rounded-full p-1 hover:bg-black/5"
                >
                  <ZoomOut size={13} />
                </button>
                <button
                  type="button"
                  aria-label="Enlarge sticker"
                  onClick={() =>
                    updateSticker(sticker.id, { scale: Math.min(2.4, sticker.scale + 0.15) })
                  }
                  className="rounded-full p-1 hover:bg-black/5"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  type="button"
                  aria-label="Rotate sticker"
                  onClick={() =>
                    updateSticker(sticker.id, { rotation: (sticker.rotation + 20) % 360 })
                  }
                  className="rounded-full p-1 hover:bg-black/5"
                >
                  <RotateCw size={13} />
                </button>
                <button
                  type="button"
                  aria-label="Remove sticker"
                  onClick={() => removeSticker(sticker.id)}
                  className="rounded-full p-1 text-red-500 hover:bg-red-50"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
