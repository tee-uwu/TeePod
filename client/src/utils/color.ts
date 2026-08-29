export function isValidHex(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

export function normalizeHex(value: string): string {
  let v = value.trim();
  if (!v.startsWith("#")) v = `#${v}`;
  if (v.length === 4) {
    v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return v.toLowerCase();
}

function hexToRgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex).slice(1);
  const num = parseInt(h, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Mixes a color toward white (amount 0-1) to create a highlight shade. */
export function lighten(hex: string, amount: number): string {
  if (!isValidHex(hex)) return hex;
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

/** Mixes a color toward black (amount 0-1) to create a shadow shade. */
export function darken(hex: string, amount: number): string {
  if (!isValidHex(hex)) return hex;
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/** Returns black or white, whichever gives better contrast against the given color. */
export function contrastText(hex: string): "#2B2320" | "#FBF4E7" {
  if (!isValidHex(hex)) return "#2B2320";
  const [r, g, b] = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#2B2320" : "#FBF4E7";
}

export const BODY_COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: "Coral", hex: "#FF6F61" },
  { name: "Tangerine", hex: "#FF9F45" },
  { name: "Lemon", hex: "#FFD93D" },
  { name: "Mint", hex: "#5FD8A6" },
  { name: "Sky", hex: "#4D8DFF" },
  { name: "Grape", hex: "#8B6FED" },
  { name: "Bubblegum", hex: "#FF7EB6" },
  { name: "Charcoal", hex: "#2B2320" },
  { name: "Cloud", hex: "#FBF4E7" },
];

export const WHEEL_COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: "Cloud", hex: "#FBF4E7" },
  { name: "Snow", hex: "#FFFFFF" },
  { name: "Sand", hex: "#EFE2C8" },
  { name: "Blush", hex: "#FBD9DE" },
  { name: "Mist", hex: "#D9E8F5" },
  { name: "Sage", hex: "#DCE8D6" },
  { name: "Slate", hex: "#3A3532" },
];
