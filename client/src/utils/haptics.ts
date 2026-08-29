// Haptic & Acoustic Click Utilities for Shufl FM

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Synthesizes an authentic mechanical iPod click sound using Web Audio API.
 * High-pass filtered click transient (~4ms burst).
 */
export function playClickSound(volume = 0.35) {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== "running") return;

    const now = ctx.currentTime;
    
    // Create short noise buffer for click mechanical attack
    const bufferSize = ctx.sampleRate * 0.004; // 4ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // High pass filter for sharp click metallic snap
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1800, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.004);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.005);
  } catch {
    // Ignore audio context errors
  }
}

/**
 * Synthesizes a slightly deeper mechanical button click sound.
 */
export function playButtonSound(volume = 0.5) {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== "running") return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.015);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  } catch {
    // Ignore audio errors
  }
}

/**
 * Triggers light tactile haptic vibration for scroll wheel steps.
 */
export function triggerHapticStep() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(8);
    } catch {
      // Ignore vibration errors
    }
  }
}

/**
 * Triggers distinct tactile haptic vibration for button taps.
 */
export function triggerHapticButton() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(14);
    } catch {
      // Ignore vibration errors
    }
  }
}

/**
 * Triggers select haptic vibration.
 */
export function triggerHapticSelect() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate([10, 20, 15]);
    } catch {
      // Ignore vibration errors
    }
  }
}

/**
 * Unlocks audio context on user interaction.
 */
export function unlockAudio() {
  getAudioContext();
}
