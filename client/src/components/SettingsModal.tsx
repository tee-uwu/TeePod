import { useStore } from "../store/useStore";
import ModalSheet from "./ModalSheet";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked ? "bg-ink justify-end" : "bg-black/15 justify-start"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-cream shadow-sm" />
    </button>
  );
}

const SHORTCUTS: [string, string][] = [
  ["Space", "Play / Pause"],
  ["→", "Next song"],
  ["←", "Previous song"],
  ["↑ / ↓", "Volume up / down"],
  ["M", "Open / close menu"],
  ["Enter", "Select highlighted"],
  ["Esc", "Close modal"],
];

export default function SettingsModal() {
  const activeModal = useStore((s) => s.activeModal);
  const closeModal = useStore((s) => s.closeModal);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const volume = useStore((s) => s.volume);
  const setVolume = useStore((s) => s.setVolume);
  const shuffle = useStore((s) => s.shuffle);
  const toggleShuffle = useStore((s) => s.toggleShuffle);
  const repeatMode = useStore((s) => s.repeatMode);
  const cycleRepeat = useStore((s) => s.cycleRepeat);
  const resetCustomization = useStore((s) => s.resetCustomization);
  const clearPlaylist = useStore((s) => s.clearPlaylist);

  return (
    <ModalSheet open={activeModal === "settings"} title="Settings" onClose={closeModal}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Autoplay</p>
            <p className="text-xs text-ink/50">Automatically play the next song when one ends.</p>
          </div>
          <Toggle
            checked={settings.autoplay}
            onChange={() => updateSettings({ autoplay: !settings.autoplay })}
            label="Toggle autoplay"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Touch Haptics</p>
            <p className="text-xs text-ink/50">Vibrate touchscreen on wheel steps &amp; button taps.</p>
          </div>
          <Toggle
            checked={settings.hapticsEnabled}
            onChange={() => updateSettings({ hapticsEnabled: !settings.hapticsEnabled })}
            label="Toggle haptics"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Wheel Click Sound</p>
            <p className="text-xs text-ink/50">Play mechanical iPod scroll wheel click sounds.</p>
          </div>
          <Toggle
            checked={settings.soundEnabled}
            onChange={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            label="Toggle click sound"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Volume</p>
            <span className="text-xs font-mono text-ink/50">{volume}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="w-full accent-ink"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Shuffle</p>
          <Toggle checked={shuffle} onChange={toggleShuffle} label="Toggle shuffle" />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Repeat</p>
          <button
            type="button"
            onClick={cycleRepeat}
            className="rounded-full bg-black/5 px-3 py-1 text-xs font-mono capitalize text-ink/70"
          >
            {repeatMode}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Theme</p>
            <p className="text-xs text-ink/50">Background brightness around the device.</p>
          </div>
          <div className="flex overflow-hidden rounded-full border border-black/10 text-xs font-medium">
            {(["light", "dark"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => updateSettings({ theme: mode })}
                className={`px-3 py-1.5 capitalize ${
                  settings.theme === mode ? "bg-ink text-cream" : "bg-transparent text-ink/60"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-black/5 pt-4">
          <p className="mb-2 text-xs font-display font-semibold uppercase tracking-wide text-ink/50">
            Keyboard controls
          </p>
          <ul className="grid grid-cols-2 gap-y-1.5 text-xs text-ink/70">
            {SHORTCUTS.map(([key, action]) => (
              <li key={key} className="flex items-center gap-2">
                <span className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[10px]">
                  {key}
                </span>
                {action}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 border-t border-black/5 pt-4">
          <button
            type="button"
            onClick={resetCustomization}
            className="rounded-full border border-black/10 py-2 text-xs font-display font-medium text-ink/70 transition hover:bg-black/5"
          >
            Reset colors &amp; stickers
          </button>
          <button
            type="button"
            onClick={clearPlaylist}
            className="rounded-full border border-red-200 py-2 text-xs font-display font-medium text-red-500 transition hover:bg-red-50"
          >
            Clear playlist
          </button>
        </div>
      </div>
    </ModalSheet>
  );
}
