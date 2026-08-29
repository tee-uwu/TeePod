import { useEffect, useRef } from "react";
import { useStore } from "../store/useStore";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiLoadPromise;
}

export interface YouTubePlayerController {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (v: number) => void;
}

/**
 * Owns a single hidden YouTube IFrame player instance and keeps it in sync
 * with the app's Zustand store (current song, play/pause, volume, seeking).
 * Also drives currentTime/duration polling and the "song ended -> next" flow.
 */
export function useYouTubePlayer(containerId: string) {
  const playerRef = useRef<any>(null);
  const pollRef = useRef<number | null>(null);
  const readyRef = useRef(false);
  const loadedVideoIdRef = useRef<string | null>(null);
  const seekRequestRef = useRef<number | null>(null);

  const currentSong = useStore((s) => s.playlist.find((p) => p.id === s.currentSongId));
  const isPlaying = useStore((s) => s.isPlaying);
  const volume = useStore((s) => s.volume);
  const setCurrentTime = useStore((s) => s.setCurrentTime);
  const setDuration = useStore((s) => s.setDuration);
  const setPlayerStatus = useStore((s) => s.setPlayerStatus);
  const setIsPlaying = useStore((s) => s.setIsPlaying);
  const setErrorMessage = useStore((s) => s.setErrorMessage);
  const next = useStore((s) => s.next);

  // Initialize the player once.
  useEffect(() => {
    let cancelled = false;

    loadYouTubeIframeApi().then(() => {
      if (cancelled) return;
      playerRef.current = new window.YT.Player(containerId, {
        height: "1",
        width: "1",
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            readyRef.current = true;
            playerRef.current?.setVolume(volume);
          },
          onStateChange: (event: any) => {
            const YTState = window.YT.PlayerState;
            if (event.data === YTState.ENDED) {
              setPlayerStatus("ended");
              next();
            } else if (event.data === YTState.PLAYING) {
              setPlayerStatus("playing");
              setIsPlaying(true);
              const dur = playerRef.current?.getDuration?.() ?? 0;
              if (dur) setDuration(dur);
            } else if (event.data === YTState.PAUSED) {
              setPlayerStatus("paused");
              setIsPlaying(false);
            } else if (event.data === YTState.BUFFERING) {
              setPlayerStatus("loading");
            }
          },
          onError: () => {
            setPlayerStatus("error");
            setErrorMessage("YouTube couldn't load this video. Skipping to the next song.");
            window.setTimeout(() => next(), 1200);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (pollRef.current) window.clearInterval(pollRef.current);
      playerRef.current?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll current time while playing.
  useEffect(() => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => {
      if (!readyRef.current || !playerRef.current?.getCurrentTime) return;
      try {
        const t = playerRef.current.getCurrentTime();
        if (typeof t === "number" && !Number.isNaN(t)) setCurrentTime(t);
      } catch {
        // player not ready yet; ignore.
      }
    }, 500);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [setCurrentTime]);

  // Load new video when the current song changes.
  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return;
    if (!currentSong) return;
    if (loadedVideoIdRef.current === currentSong.youtubeVideoId) return;

    loadedVideoIdRef.current = currentSong.youtubeVideoId;
    setPlayerStatus("loading");
    setCurrentTime(0);
    setDuration(currentSong.duration || 0);
    try {
      if (isPlaying) {
        playerRef.current.loadVideoById(currentSong.youtubeVideoId);
      } else {
        playerRef.current.cueVideoById(currentSong.youtubeVideoId);
      }
    } catch {
      setPlayerStatus("error");
      setErrorMessage("Something went wrong loading that song.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.youtubeVideoId]);

  // React to play/pause toggles.
  useEffect(() => {
    if (!readyRef.current || !playerRef.current || !currentSong) return;
    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch {
      // player still initializing.
    }
  }, [isPlaying, currentSong?.id]);

  // React to volume changes.
  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return;
    try {
      playerRef.current.setVolume(volume);
    } catch {
      // ignore.
    }
  }, [volume]);

  const controller: YouTubePlayerController = {
    playVideo: () => playerRef.current?.playVideo?.(),
    pauseVideo: () => playerRef.current?.pauseVideo?.(),
    seekTo: (seconds: number) => {
      if (seekRequestRef.current) window.clearTimeout(seekRequestRef.current);
      seekRequestRef.current = window.setTimeout(() => {
        try {
          playerRef.current?.seekTo?.(seconds, true);
          setCurrentTime(seconds);
        } catch {
          // ignore.
        }
      }, 40);
    },
    setVolume: (v: number) => playerRef.current?.setVolume?.(v),
  };

  return controller;
}
