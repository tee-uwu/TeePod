import { useEffect, useMemo, useState } from "react";
import type { Song } from "../types";
import {
  extractAlbumPalette,
  getFallbackPalette,
  preloadSongPalettes,
  type AlbumColorPalette,
} from "../utils/albumColor";

export function useAlbumPalette(
  activeSong: Song | null | undefined,
  allSongs: Song[] = []
): AlbumColorPalette {
  const fallbackKey = activeSong?.id || activeSong?.title || "default-teepod";

  // Pre-calculate immediate fallback so render is never blocked
  const initialPalette = useMemo(
    () => getFallbackPalette(fallbackKey),
    [fallbackKey]
  );

  const [palette, setPalette] = useState<AlbumColorPalette>(initialPalette);

  // Background preload for whole playlist
  useEffect(() => {
    if (allSongs.length > 0) {
      preloadSongPalettes(allSongs);
    }
  }, [allSongs]);

  // Extract or fetch from cache whenever activeSong changes (i.e. as user scrolls)
  useEffect(() => {
    if (!activeSong) {
      setPalette(initialPalette);
      return;
    }

    let isMounted = true;
    const thumbnail = activeSong.thumbnail || "";

    extractAlbumPalette(thumbnail, fallbackKey).then((result) => {
      if (isMounted) {
        setPalette(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeSong?.id, activeSong?.thumbnail, fallbackKey, initialPalette]);

  return palette;
}
