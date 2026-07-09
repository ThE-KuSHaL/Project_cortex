import { create } from 'zustand'
import { QUALITY, detectTier } from '../config/quality'

/**
 * Live, adaptive quality (docs/12). Seeded from the detected tier, then only ever
 * downshifted by the PerfMonitor when sustained FPS is low (never auto-upshifts, so it
 * can't oscillate). Effects/particles/material subscribe to the values they care about.
 */
const seed = QUALITY[detectTier()]

interface QualityState {
  level: number
  dpr: number
  bloomIntensity: number
  microDetail: boolean
  particleCount: number
  downshift: () => void
}

export const useQuality = create<QualityState>((set) => ({
  level: 0,
  dpr: seed.maxPixelRatio,
  bloomIntensity: seed.bloomIntensity,
  microDetail: seed.microDetail,
  particleCount: seed.particleCount,
  downshift: () =>
    set((s) => {
      if (s.level >= 2) return s
      const level = s.level + 1
      if (level === 1) {
        return { level, microDetail: false, dpr: Math.min(s.dpr, 1.25), bloomIntensity: Math.min(s.bloomIntensity, 0.6) }
      }
      return { level, dpr: 1, bloomIntensity: Math.min(s.bloomIntensity, 0.5) }
    }),
}))
