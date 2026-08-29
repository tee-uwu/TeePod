import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { BODY_COLOR_PRESETS, WHEEL_COLOR_PRESETS, isValidHex, normalizeHex } from "../utils/color";
import IPod from "./IPod";
import ModalSheet from "./ModalSheet";

function presetsFor(kind: "body" | "wheel") {
  return kind === "body" ? BODY_COLOR_PRESETS : WHEEL_COLOR_PRESETS;
}

function ColorEditor({
  title,
  presets,
  value,
  onChange,
  onSave,
}: {
  title: string;
  presets: { name: string; hex: string }[];
  value: string;
  onChange: (hex: string) => void;
  onSave: (hex: string) => void;
}) {
  const [hexInput, setHexInput] = useState(value);
  const [error, setError] = useState(false);

  useEffect(() => setHexInput(value), [value]);

  const commitHex = (raw: string) => {
    setHexInput(raw);
    if (isValidHex(raw)) {
      setError(false);
      onChange(normalizeHex(raw));
    } else {
      setError(raw.length > 0);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="pointer-events-none scale-[0.62] origin-top -mb-24 sm:scale-75 sm:-mb-16">
        <IPod />
      </div>

      <div>
        <p className="mb-2 text-xs font-display font-semibold uppercase tracking-wide text-ink/50">
          Presets
        </p>
        <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-9">
          {presets.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              aria-label={preset.name}
              title={preset.name}
              onClick={() => {
                onChange(preset.hex);
                setHexInput(preset.hex);
                setError(false);
              }}
              className="relative aspect-square rounded-full ring-1 ring-black/10 transition active:scale-90"
              style={{ background: preset.hex }}
            >
              {value.toLowerCase() === preset.hex.toLowerCase() && (
                <Check
                  size={14}
                  className="absolute inset-0 m-auto"
                  color={
                    preset.hex.toLowerCase() === "#ffffff" || preset.hex.toLowerCase() === "#fbf4e7"
                      ? "#2B2320"
                      : "#FBF4E7"
                  }
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-display font-semibold uppercase tracking-wide text-ink/50">
          Custom color
        </p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            aria-label="Pick a custom color"
            value={isValidHex(value) ? normalizeHex(value) : "#ffffff"}
            onChange={(e) => commitHex(e.target.value)}
            className="h-11 w-11 cursor-pointer rounded-xl border border-black/10 bg-transparent p-0.5"
          />
          <div className="flex-1">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => commitHex(e.target.value)}
              placeholder="#7E99EB"
              aria-label="Hex color value"
              className={`w-full rounded-full border px-3 py-2 text-sm font-mono outline-none ${
                error ? "border-red-300 bg-red-50" : "border-black/10 bg-white"
              }`}
            />
            {error && <p className="mt-1 text-[11px] text-red-500">Enter a valid hex color.</p>}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSave(isValidHex(hexInput) ? normalizeHex(hexInput) : value)}
        className="w-full rounded-full bg-ink py-2.5 text-sm font-display font-semibold text-cream transition active:scale-[0.98]"
      >
        Save {title}
      </button>
    </div>
  );
}

export function BodyColorModal() {
  const activeModal = useStore((s) => s.activeModal);
  const closeModal = useStore((s) => s.closeModal);
  const bodyColor = useStore((s) => s.bodyColor);
  const setBodyColor = useStore((s) => s.setBodyColor);

  return (
    <ModalSheet open={activeModal === "colorBody"} title="Choose iPod color" onClose={closeModal}>
      <ColorEditor
        title="body color"
        presets={presetsFor("body")}
        value={bodyColor}
        onChange={setBodyColor}
        onSave={(hex) => {
          setBodyColor(hex);
          closeModal();
        }}
      />
    </ModalSheet>
  );
}

export function WheelColorModal() {
  const activeModal = useStore((s) => s.activeModal);
  const closeModal = useStore((s) => s.closeModal);
  const wheelColor = useStore((s) => s.wheelColor);
  const setWheelColor = useStore((s) => s.setWheelColor);

  return (
    <ModalSheet open={activeModal === "colorWheel"} title="Choose wheel color" onClose={closeModal}>
      <ColorEditor
        title="wheel color"
        presets={presetsFor("wheel")}
        value={wheelColor}
        onChange={setWheelColor}
        onSave={(hex) => {
          setWheelColor(hex);
          closeModal();
        }}
      />
    </ModalSheet>
  );
}

