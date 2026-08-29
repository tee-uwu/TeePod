import { motion } from "framer-motion";
import { MoreHorizontal, Plus, Sparkles } from "lucide-react";
import { useStore } from "../store/useStore";
import { darken, lighten } from "../utils/color";
import IPodScreen from "./IPodScreen";
import ClickWheel from "./ClickWheel";
import StickerLayer from "./StickerLayer";

export default function IPod() {
  const bodyColor = useStore((s) => s.bodyColor);
  const focusMode = useStore((s) => s.focusMode);
  const openModal = useStore((s) => s.openModal);
  const toggleFocusMode = useStore((s) => s.toggleFocusMode);

  const bodyLight = lighten(bodyColor, 0.28);
  const bodyDark = darken(bodyColor, 0.22);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 170, damping: 20 }}
      className="relative mx-auto w-full max-w-[22rem]"
    >
      <div
        className="relative rounded-[2.25rem] p-5 pb-8 shadow-device bg-noise transition-colors duration-500"
        style={{
          background: `linear-gradient(155deg, ${bodyLight}, ${bodyColor} 45%, ${bodyDark})`,
        }}
      >
        {!focusMode && <StickerLayer />}

        {/* top row: brand + menu */}
        <div className="mb-3 flex items-center justify-between px-1">
          <span
            className="font-display text-sm font-semibold tracking-wide"
            style={{ color: darken(bodyColor, 0.35) }}
          >
            TeePod
          </span>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => openModal("menu")}
            className="rounded-full p-1.5 transition-transform active:scale-90"
            style={{ color: darken(bodyColor, 0.3) }}
          >
            <MoreHorizontal size={20} />
          </button>
        </div>

        <IPodScreen />

        {!focusMode && (
          <div className="mt-3 flex items-center justify-center gap-2 px-1">
            <button
              type="button"
              onClick={toggleFocusMode}
              className="flex items-center gap-1 rounded-full bg-black/10 px-3 py-1 text-[11px] font-display font-medium text-white/90 backdrop-blur-sm transition active:scale-95"
            >
              <Sparkles size={12} /> Focus
            </button>
            <button
              type="button"
              onClick={() => openModal("search")}
              className="flex items-center gap-1 rounded-full bg-black/10 px-3 py-1 text-[11px] font-display font-medium text-white/90 backdrop-blur-sm transition active:scale-95"
            >
              <Plus size={12} /> Add
            </button>
            <button
              type="button"
              onClick={() => openModal("menu")}
              className="flex items-center gap-1 rounded-full bg-black/10 px-3 py-1 text-[11px] font-display font-medium text-white/90 backdrop-blur-sm transition active:scale-95"
            >
              <MoreHorizontal size={12} /> More
            </button>
          </div>
        )}

        <ClickWheel />

        {focusMode && (
          <button
            type="button"
            onClick={toggleFocusMode}
            className="mt-4 block w-full text-center text-[11px] font-display font-medium text-white/80 underline underline-offset-2"
          >
            Exit focus mode
          </button>
        )}
      </div>
    </motion.div>
  );
}
