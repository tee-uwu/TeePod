import { useCallback, useRef } from "react";
import { useStore } from "../store/useStore";
import { playClickSound, triggerHapticStep, unlockAudio } from "../utils/haptics";

const DEGREES_PER_STEP = 15; // 15 degrees per item click = 24 items per 360-degree circle

export type WheelQuadrant = "menu" | "previous" | "next" | "play";

interface Options {
  onStep: (direction: 1 | -1) => void;
  onButtonTap?: (button: WheelQuadrant) => void;
  disabled?: boolean;
}

/**
 * Implements an authentic circular iPod click-wheel rotary controller.
 * Tracks continuous angle changes around wheel center, handles angle wrapping,
 * prevents native page scrolling, and distinguishes rotational dragging from button taps.
 */
export function useClickWheelRotation({ onStep, onButtonTap, disabled }: Options) {
  const ref = useRef<HTMLDivElement | null>(null);
  const lastAngleRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const totalRotationRef = useRef(0);
  const activePointerId = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingRotaryRef = useRef(false);

  const hapticsEnabled = useStore((s) => s.settings.hapticsEnabled);
  const soundEnabled = useStore((s) => s.settings.soundEnabled);

  const calculateAngleAndRadius = useCallback((clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = rect.width / 2;
    const minRadius = maxRadius * 0.28; // Ignore touches inside center button
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return { angle, radius, minRadius, maxRadius, dx, dy };
  }, []);

  const triggerStepFeedback = useCallback(() => {
    if (hapticsEnabled) triggerHapticStep();
    if (soundEnabled) playClickSound();
  }, [hapticsEnabled, soundEnabled]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      unlockAudio();

      const info = calculateAngleAndRadius(e.clientX, e.clientY);
      if (!info) return;

      // Ignore touches outside outer ring or inside center select button
      if (info.radius < info.minRadius || info.radius > info.maxRadius * 1.15) {
        return;
      }

      // Prevent native browser scroll or pull-to-refresh
      e.preventDefault();
      e.stopPropagation();

      lastAngleRef.current = info.angle;
      accumulatedRef.current = 0;
      totalRotationRef.current = 0;
      activePointerId.current = e.pointerId;
      isDraggingRotaryRef.current = false;
      startPosRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };

      (e.target as Element).setPointerCapture?.(e.pointerId);
    },
    [calculateAngleAndRadius, disabled]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      if (activePointerId.current !== e.pointerId) return;
      if (lastAngleRef.current === null) return;

      e.preventDefault();

      const info = calculateAngleAndRadius(e.clientX, e.clientY);
      if (!info) return;

      let delta = info.angle - lastAngleRef.current;
      // Wrap-around normalization at +/-180 degrees
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      // Ignore microscopic jitter (under 0.35 degrees)
      if (Math.abs(delta) < 0.35) return;

      lastAngleRef.current = info.angle;
      accumulatedRef.current += delta;
      totalRotationRef.current += Math.abs(delta);

      // Flag as rotational drag once finger has rotated >= 3.5 degrees
      if (totalRotationRef.current >= 3.5) {
        isDraggingRotaryRef.current = true;
      }

      // Step calculation
      while (accumulatedRef.current >= DEGREES_PER_STEP) {
        triggerStepFeedback();
        onStep(1);
        accumulatedRef.current -= DEGREES_PER_STEP;
      }
      while (accumulatedRef.current <= -DEGREES_PER_STEP) {
        triggerStepFeedback();
        onStep(-1);
        accumulatedRef.current += DEGREES_PER_STEP;
      }
    },
    [calculateAngleAndRadius, disabled, onStep, triggerStepFeedback]
  );

  const endGesture = useCallback(
    (e: React.PointerEvent) => {
      if (activePointerId.current !== e.pointerId) return;

      const startPos = startPosRef.current;
      const isRotary = isDraggingRotaryRef.current;

      if (startPos && !isRotary && onButtonTap) {
        const duration = performance.now() - startPos.time;
        const dist = Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y);

        // If tap was short (< 350ms) and didn't drag around, trigger button quadrant
        if (duration < 350 && dist < 15) {
          const info = calculateAngleAndRadius(startPos.x, startPos.y);
          if (info) {
            const angle = info.angle; // -180 to 180 degrees
            // Quadrant mapping:
            // Top (-135 to -45): MENU
            // Bottom (45 to 135): PLAY
            // Right (-45 to 45): NEXT
            // Left (-180 to -135 OR 135 to 180): PREVIOUS
            let quadrant: WheelQuadrant;
            if (angle >= -135 && angle < -45) {
              quadrant = "menu";
            } else if (angle >= 45 && angle < 135) {
              quadrant = "play";
            } else if (angle >= -45 && angle < 45) {
              quadrant = "next";
            } else {
              quadrant = "previous";
            }
            onButtonTap(quadrant);
          }
        }
      }

      lastAngleRef.current = null;
      accumulatedRef.current = 0;
      totalRotationRef.current = 0;
      activePointerId.current = null;
      startPosRef.current = null;
      isDraggingRotaryRef.current = false;
    },
    [calculateAngleAndRadius, onButtonTap]
  );

  return {
    ref,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endGesture,
      onPointerCancel: endGesture,
      onPointerLeave: endGesture,
    },
  };
}
