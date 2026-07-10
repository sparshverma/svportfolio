import { useEffect, useRef, useState } from 'react';

export type QualityTier = 'high' | 'mid' | 'low';

export type QualitySettings = {
  tier: QualityTier;
  dpr: [number, number];
  tileCount: number;
  enableStarfield: boolean;
  enableOrbitLight: boolean;
  enableCursorTilt: boolean;
};

const PRESETS: Record<QualityTier, QualitySettings> = {
  high: { tier: 'high', dpr: [1, 2], tileCount: 260, enableStarfield: true, enableOrbitLight: true, enableCursorTilt: true },
  mid: { tier: 'mid', dpr: [1, 1.5], tileCount: 180, enableStarfield: true, enableOrbitLight: false, enableCursorTilt: true },
  low: { tier: 'low', dpr: [1, 1], tileCount: 110, enableStarfield: false, enableOrbitLight: false, enableCursorTilt: false },
};

const LOW_GPU_RE = /(Adreno \(TM\) [345]\d{2}|Mali-4|Mali-T[67]|PowerVR SGX|Intel.*HD Graphics [234]?\d{3})/i;

function detectInitialTier(): QualityTier {
  if (typeof window === 'undefined') return 'high';
  try {
    const cores = navigator.hardwareConcurrency ?? 8;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const small = window.matchMedia('(max-width: 768px)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) return 'low';

    // GPU string sniff
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
    let gpuLow = false;
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string;
        if (renderer && LOW_GPU_RE.test(renderer)) gpuLow = true;
      }
    }

    if (gpuLow || (coarse && small && mem <= 4)) return 'low';
    if (coarse || small || cores <= 4 || mem <= 4) return 'mid';
    return 'high';
  } catch {
    return 'mid';
  }
}

/** Adaptive quality: initial device tier + runtime FPS-driven downgrade. */
export function useAdaptiveQuality(): QualitySettings & {
  report: (deltaSeconds: number) => void;
} {
  const [tier, setTier] = useState<QualityTier>('high');
  const initialized = useRef(false);
  const lowFrames = useRef(0);
  const lockedDown = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setTier(detectInitialTier());
  }, []);

  const report = (dt: number) => {
    if (lockedDown.current) return;
    if (dt <= 0) return;
    const fps = 1 / dt;
    if (fps < 40) {
      lowFrames.current++;
      if (lowFrames.current > 120) {
        // ~2s of sustained low fps → step down one tier (one-way)
        lowFrames.current = 0;
        setTier((prev) => {
          if (prev === 'high') return 'mid';
          if (prev === 'mid') {
            lockedDown.current = true;
            return 'low';
          }
          lockedDown.current = true;
          return 'low';
        });
      }
    } else {
      lowFrames.current = Math.max(0, lowFrames.current - 1);
    }
  };

  return { ...PRESETS[tier], report };
}
