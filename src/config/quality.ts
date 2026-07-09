/**
 * Project Cortex — performance tiers.
 *
 * Tier A (high-end desktop), B (laptop / integrated GPU), C (mobile).
 * Each tier scales cost (bloom, particles, pixel ratio, micro-detail) while
 * preserving brain + interaction + panel quality. A full adaptive downshift
 * ladder arrives in a later milestone; this establishes the contract.
 */

export type Tier = 'A' | 'B' | 'C'

export interface QualitySettings {
  tier: Tier
  maxPixelRatio: number
  bloom: boolean
  bloomIntensity: number
  particleCount: number
  microDetail: boolean
  envResolution: number
}

export const QUALITY: Record<Tier, QualitySettings> = {
  A: { tier: 'A', maxPixelRatio: 2, bloom: true, bloomIntensity: 0.85, particleCount: 380, microDetail: true, envResolution: 256 },
  B: { tier: 'B', maxPixelRatio: 1.5, bloom: true, bloomIntensity: 0.7, particleCount: 200, microDetail: true, envResolution: 128 },
  C: { tier: 'C', maxPixelRatio: 1, bloom: true, bloomIntensity: 0.55, particleCount: 90, microDetail: false, envResolution: 64 },
}

/** Cheap heuristic tier probe. Refined with live FPS monitoring in a later milestone. */
export function detectTier(): Tier {
  if (typeof navigator === 'undefined') return 'A'
  const ua = navigator.userAgent || ''
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua)
  if (isMobile) return 'C'
  const cores = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 8
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  if (cores <= 4 || mem <= 4) return 'B'
  return 'A'
}
