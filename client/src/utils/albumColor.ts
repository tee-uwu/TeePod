import type { Song } from "../types";

export interface AlbumColorPalette {
  dominantHex: string;
  rgb: [number, number, number];
  fadedLight: string;
  fadedDark: string;
  fadedGradientLight: string;
  fadedGradientDark: string;
  glowColor: string;
  accentColor: string;
}

const FALLBACK_PALETTES: [number, number, number][] = [
  [224, 86, 96], // Coral Rose
  [240, 160, 48], // Amber Gold
  [76, 175, 140], // Mint Green
  [58, 134, 255], // Sky Azure
  [155, 93, 229], // Royal Purple
  [254, 111, 154], // Bubblegum Pink
  [46, 196, 182], // Turquoise
  [231, 111, 81], // Terracotta
  [82, 182, 154], // Sage
  [114, 9, 183], // Deep Violet
];

// Base ambient background colors
const BASE_LIGHT: [number, number, number] = [246, 241, 233]; // Vintage warm cream #f6f1e9
const BASE_DARK: [number, number, number] = [22, 18, 15]; // Deep charcoal #16120f

function clamp(n: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

function blend(
  color: [number, number, number],
  base: [number, number, number],
  weight: number
): [number, number, number] {
  return [
    clamp(color[0] * weight + base[0] * (1 - weight)),
    clamp(color[1] * weight + base[1] * (1 - weight)),
    clamp(color[2] * weight + base[2] * (1 - weight)),
  ];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function createPaletteFromRgb(rgb: [number, number, number]): AlbumColorPalette {
  const dominantHex = rgbToHex(rgb[0], rgb[1], rgb[2]);

  // Light mode faded version: soft pastel watercolor wash
  const lightMid = blend(rgb, BASE_LIGHT, 0.18);
  const lightGlow = blend(rgb, [252, 248, 242], 0.28);
  const lightEdge = blend(rgb, [238, 232, 222], 0.1);
  const fadedLight = rgbToHex(...lightMid);
  const fadedGradientLight = `radial-gradient(ellipse 90% 70% at 50% 38%, ${rgbToHex(
    ...lightGlow
  )} 0%, ${fadedLight} 60%, ${rgbToHex(...lightEdge)} 100%)`;

  // Dark mode faded version: rich deep moody atmospheric tint
  const darkMid = blend(rgb, BASE_DARK, 0.22);
  const darkGlow = blend(rgb, [30, 24, 20], 0.32);
  const darkEdge = blend(rgb, [15, 12, 10], 0.12);
  const fadedDark = rgbToHex(...darkMid);
  const fadedGradientDark = `radial-gradient(ellipse 90% 70% at 50% 38%, ${rgbToHex(
    ...darkGlow
  )} 0%, ${fadedDark} 60%, ${rgbToHex(...darkEdge)} 100%)`;

  const glowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.22)`;
  const accentColor = dominantHex;

  return {
    dominantHex,
    rgb,
    fadedLight,
    fadedDark,
    fadedGradientLight,
    fadedGradientDark,
    glowColor,
    accentColor,
  };
}

export function getFallbackPalette(key: string): AlbumColorPalette {
  const hash = hashString(key || "default-teepod");
  const rgb = FALLBACK_PALETTES[hash % FALLBACK_PALETTES.length];
  return createPaletteFromRgb(rgb);
}

// Global in-memory cache for extracted palettes
const paletteCache = new Map<string, AlbumColorPalette>();

/**
 * Extracts dominant vibrant color from an image using off-screen canvas and color quantization.
 */
export async function extractAlbumPalette(
  imageUrl: string,
  fallbackKey: string
): Promise<AlbumColorPalette> {
  const cacheKey = `${imageUrl}::${fallbackKey}`;
  if (paletteCache.has(cacheKey)) {
    return paletteCache.get(cacheKey)!;
  }

  if (!imageUrl || typeof window === "undefined") {
    const fallback = getFallbackPalette(fallbackKey);
    paletteCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const rgb = await new Promise<[number, number, number]>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.referrerPolicy = "no-referrer";

      const timer = window.setTimeout(() => {
        reject(new Error("Image color extraction timeout"));
      }, 4000);

      img.onload = () => {
        window.clearTimeout(timer);
        try {
          const canvas = document.createElement("canvas");
          const size = 36;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) {
            resolve(FALLBACK_PALETTES[0]);
            return;
          }

          ctx.drawImage(img, 0, 0, size, size);
          const data = ctx.getImageData(0, 0, size, size).data;

          // 4-bit RGB bucket quantization to group similar hues
          const buckets = new Map<
            number,
            { r: number; g: number; b: number; count: number }
          >();

          let totalR = 0;
          let totalG = 0;
          let totalB = 0;
          let validCount = 0;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) continue;

            totalR += r;
            totalG += g;
            totalB += b;
            validCount++;

            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            // Ignore pure black letterboxing and blown-out whites
            if (lum < 0.1 || lum > 0.93) continue;

            const bucketKey = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
            const existing = buckets.get(bucketKey);
            if (existing) {
              existing.r += r;
              existing.g += g;
              existing.b += b;
              existing.count += 1;
            } else {
              buckets.set(bucketKey, { r, g, b, count: 1 });
            }
          }

          let bestRgb: [number, number, number] | null = null;
          let highestScore = -1;

          buckets.forEach((b) => {
            const avgR = b.r / b.count;
            const avgG = b.g / b.count;
            const avgB = b.b / b.count;

            const max = Math.max(avgR, avgG, avgB);
            const min = Math.min(avgR, avgG, avgB);
            const sat = (max - min) / (max || 1);
            const lum = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;

            // Prioritize saturated accent/logo colors over drab grays
            const lumWeight = 1 - Math.abs(lum - 0.5) * 1.1;
            const score = b.count * (1 + sat * 3.5) * Math.max(0.2, lumWeight);

            if (score > highestScore) {
              highestScore = score;
              bestRgb = [Math.round(avgR), Math.round(avgG), Math.round(avgB)];
            }
          });

          if (bestRgb) {
            resolve(bestRgb);
          } else if (validCount > 0) {
            resolve([
              Math.round(totalR / validCount),
              Math.round(totalG / validCount),
              Math.round(totalB / validCount),
            ]);
          } else {
            resolve(FALLBACK_PALETTES[0]);
          }
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error("Image failed to load for color extraction"));
      };

      img.src = imageUrl;
    });

    const palette = createPaletteFromRgb(rgb);
    paletteCache.set(cacheKey, palette);
    return palette;
  } catch (_e) {
    const fallback = getFallbackPalette(fallbackKey);
    paletteCache.set(cacheKey, fallback);
    return fallback;
  }
}

/**
 * Preload color palettes for a list of songs so scrolling has zero latency.
 */
export function preloadSongPalettes(songs: Song[]): void {
  for (const song of songs) {
    if (song?.thumbnail) {
      extractAlbumPalette(song.thumbnail, song.id || song.title);
    }
  }
}
