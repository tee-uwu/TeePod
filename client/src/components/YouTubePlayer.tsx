import { useYouTubePlayer } from "../hooks/useYouTubePlayer";

const CONTAINER_ID = "shufl-fm-youtube-player";

/**
 * Renders the mount point the YouTube IFrame API attaches to. It's sized to
 * 1x1 and visually hidden — Shufl FM's own screen and click wheel are the
 * actual UI; this just hosts the official embedded player that does the
 * real playback work.
 */
export default function YouTubePlayer() {
  useYouTubePlayer(CONTAINER_ID);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 left-0 h-px w-px overflow-hidden opacity-0"
    >
      <div id={CONTAINER_ID} />
    </div>
  );
}
