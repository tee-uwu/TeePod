import { useStore } from "../store/useStore";
import ModalSheet from "./ModalSheet";

const AVAILABLE_STICKERS = [
  "🌸",
  "⭐",
  "💎",
  "✨",
  "🌈",
  "☀️",
  "❤️",
  "🎵",
  "🦋",
  "🍒",
  "🍋",
  "😎",
];

export default function StickerPicker() {
  const activeModal = useStore((s) => s.activeModal);
  const closeModal = useStore((s) => s.closeModal);
  const addSticker = useStore((s) => s.addSticker);
  const stickers = useStore((s) => s.stickers);

  return (
    <ModalSheet open={activeModal === "stickers"} title="Stickers" onClose={closeModal}>
      <p className="mb-3 text-xs text-ink/50">
        Tap a sticker to add it, then drag it around the iPod. Tap a placed sticker to resize,
        rotate, or remove it.
      </p>
      <div className="grid grid-cols-6 gap-2">
        {AVAILABLE_STICKERS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`Add ${emoji} sticker`}
            onClick={() => addSticker(emoji)}
            className="flex aspect-square items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-black/5 transition active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs font-display font-semibold uppercase tracking-wide text-ink/50">
        Placed ({stickers.length})
      </p>
      {stickers.length === 0 ? (
        <p className="mt-1 text-xs text-ink/40">No stickers yet — add one above.</p>
      ) : (
        <p className="mt-1 text-xs text-ink/40">
          {stickers.length} sticker{stickers.length === 1 ? "" : "s"} on your device.
        </p>
      )}
    </ModalSheet>
  );
}
