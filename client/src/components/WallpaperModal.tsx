import { Check, Image as ImageIcon, Sparkles, Trash2, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { useStore } from "../store/useStore";
import ModalSheet from "./ModalSheet";

const PRESET_WALLPAPERS = [
  {
    name: "Lofi Chill",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=70",
  },
  {
    name: "Cyber Neon",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=300&q=70",
  },
  {
    name: "Cosmic Stars",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=70",
  },
  {
    name: "Wood Desk",
    url: "https://images.unsplash.com/photo-1546484475-7f7bd55792da?auto=format&fit=crop&w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1546484475-7f7bd55792da?auto=format&fit=crop&w=300&q=70",
  },
  {
    name: "Sunset Waves",
    url: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=300&q=70",
  },
  {
    name: "Tokyo Lights",
    url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=300&q=70",
  },
];

export default function WallpaperModal() {
  const activeModal = useStore((s) => s.activeModal);
  const closeModal = useStore((s) => s.closeModal);
  const wallpaper = useStore((s) => s.wallpaper);
  const setWallpaper = useStore((s) => s.setWallpaper);
  const screenWallpaper = useStore((s) => s.screenWallpaper);
  const setScreenWallpaper = useStore((s) => s.setScreenWallpaper);

  const [target, setTarget] = useState<"page" | "screen">("page");
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeValue = target === "page" ? wallpaper : screenWallpaper;
  const setActiveValue = target === "page" ? setWallpaper : setScreenWallpaper;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setActiveValue(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setActiveValue(customUrl.trim());
      setCustomUrl("");
    }
  };

  return (
    <ModalSheet open={activeModal === "wallpaper"} title="Wallpapers" onClose={closeModal}>
      <div className="flex flex-col gap-4">
        {/* Target Selector */}
        <div className="flex rounded-full bg-black/5 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTarget("page")}
            className={`flex-1 rounded-full py-1.5 transition ${
              target === "page" ? "bg-ink text-cream shadow" : "text-ink/60"
            }`}
          >
            Page Background
          </button>
          <button
            type="button"
            onClick={() => setTarget("screen")}
            className={`flex-1 rounded-full py-1.5 transition ${
              target === "screen" ? "bg-ink text-cream shadow" : "text-ink/60"
            }`}
          >
            iPod Screen
          </button>
        </div>

        {/* Upload Custom File Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/15 bg-white/60 py-3 text-xs font-display font-medium text-ink transition hover:border-ink/40 hover:bg-white active:scale-[0.99]"
          >
            <Upload size={16} />
            <span>Upload from phone or computer</span>
          </button>
        </div>

        {/* Preset Wallpapers Grid */}
        <div>
          <p className="mb-2 text-xs font-display font-semibold uppercase tracking-wide text-ink/50">
            Aesthetic Wallpapers
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {PRESET_WALLPAPERS.map((preset) => {
              const isSelected = activeValue === preset.url;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setActiveValue(preset.url)}
                  className={`group relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition active:scale-95 ${
                    isSelected ? "border-ink shadow-md" : "border-black/5 hover:border-black/20"
                  }`}
                >
                  <img
                    src={preset.preview}
                    alt={preset.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-1.5 py-1 text-[10px] font-display font-semibold text-white truncate">
                    {preset.name}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-cream shadow">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Image URL Input */}
        <div>
          <p className="mb-1.5 text-xs font-display font-semibold uppercase tracking-wide text-ink/50">
            Or Paste Image URL
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs outline-none focus:border-ink/30"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              disabled={!customUrl.trim()}
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-display font-medium text-cream transition disabled:opacity-40"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Reset / Status for Wallpaper */}
        {activeValue ? (
          <button
            type="button"
            onClick={() => setActiveValue(null)}
            className="flex items-center justify-center gap-1.5 rounded-full border border-ink/20 py-2 text-xs font-display font-medium text-ink transition hover:bg-black/5"
          >
            <Sparkles size={14} className="text-amber-500" /> Reset to Dynamic Album Color
            (Default)
          </button>
        ) : (
          <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-black/5 py-2.5 px-3 text-center text-xs font-display text-ink/70">
            <Sparkles size={13} className="text-amber-500" />
            <span>
              Dynamic album color active — fades to the currently selected music's artwork.
            </span>
          </div>
        )}
      </div>
    </ModalSheet>
  );
}
