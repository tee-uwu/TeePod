import {
  Circle,
  Image as ImageIcon,
  Info,
  Layers,
  ListMusic,
  Palette,
  Repeat,
  Repeat1,
  Search,
  Settings as SettingsIcon,
  Shuffle,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { useStore } from "../store/useStore";
import ModalSheet from "./ModalSheet";

export default function MenuModal() {
  const activeModal = useStore((s) => s.activeModal);
  const openModal = useStore((s) => s.openModal);
  const closeModal = useStore((s) => s.closeModal);
  const shuffle = useStore((s) => s.shuffle);
  const repeatMode = useStore((s) => s.repeatMode);
  const toggleShuffle = useStore((s) => s.toggleShuffle);
  const cycleRepeat = useStore((s) => s.cycleRepeat);
  const focusMode = useStore((s) => s.focusMode);
  const toggleFocusMode = useStore((s) => s.toggleFocusMode);
  const screenViewMode = useStore((s) => s.screenViewMode);
  const cycleScreenViewMode = useStore((s) => s.cycleScreenViewMode);

  const items: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    trailing?: React.ReactNode;
  }[] = [
    { icon: <ListMusic size={17} />, label: "Playlist", onClick: () => openModal("playlist") },
    { icon: <Search size={17} />, label: "Search", onClick: () => openModal("search") },
    {
      icon: <Layers size={17} />,
      label: "Screen View",
      onClick: cycleScreenViewMode,
      trailing: (
        <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-mono text-cream capitalize">
          {screenViewMode}
        </span>
      ),
    },
    { icon: <Palette size={17} />, label: "Customize iPod", onClick: () => openModal("colorBody") },
    { icon: <Circle size={17} />, label: "Customize Wheel", onClick: () => openModal("colorWheel") },
    { icon: <ImageIcon size={17} />, label: "Wallpapers", onClick: () => openModal("wallpaper") },
    { icon: <StickyNote size={17} />, label: "Stickers", onClick: () => openModal("stickers") },
    {
      icon: <Shuffle size={17} />,
      label: "Shuffle",
      onClick: toggleShuffle,
      trailing: (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
            shuffle ? "bg-ink text-cream" : "bg-black/5 text-ink/50"
          }`}
        >
          {shuffle ? "ON" : "OFF"}
        </span>
      ),
    },
    {
      icon: repeatMode === "one" ? <Repeat1 size={17} /> : <Repeat size={17} />,
      label: "Repeat",
      onClick: cycleRepeat,
      trailing: (
        <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-mono text-ink/50 capitalize">
          {repeatMode}
        </span>
      ),
    },
    {
      icon: <Sparkles size={17} />,
      label: "Focus Mode",
      onClick: toggleFocusMode,
      trailing: (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
            focusMode ? "bg-ink text-cream" : "bg-black/5 text-ink/50"
          }`}
        >
          {focusMode ? "ON" : "OFF"}
        </span>
      ),
    },
    { icon: <SettingsIcon size={17} />, label: "Settings", onClick: () => openModal("settings") },
    { icon: <Info size={17} />, label: "About", onClick: () => openModal("about") },
  ];

  return (
    <ModalSheet open={activeModal === "menu"} title="Menu" onClose={closeModal}>
      <ul className="flex flex-col divide-y divide-black/5">
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center gap-3 py-3 text-left text-sm font-medium text-ink transition active:scale-[0.99]"
            >
              <span className="text-ink/60">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.trailing}
            </button>
          </li>
        ))}
      </ul>
    </ModalSheet>
  );
}
