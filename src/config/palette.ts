import { Color } from 'three'

/**
 * Project Cortex — single source of truth for color.
 *
 * Resolves the specification conflict in favour of docs/03_references/reference_colors.md
 * (the complete, per-region palette) while retaining 01_design_language.md's philosophy:
 * the interface exists in darkness, color is reserved exclusively for information.
 *
 * Every color in the app should originate here.
 */

export const STRUCTURAL = {
  background: '#050608', // infinite space, lets bloom breathe
  panel: '#0B0F14', // UI containers
  graphite: '#161B22', // brain substrate / machinery
  titanium: '#2A313A', // mechanical shell
  steel: '#5A6675', // mechanical highlights / edges
  copper: '#7A4A24', // conductive routing (visible even when unlit, never neon)
  hotspot: '#FFFFFF', // electrical convergence — used sparingly
} as const

export interface RegionPalette {
  primary: string
  accent: string
  glow: string
}

/** Indexed by regionId 0..6 — order matches state/regions.ts and the aRegionId attribute. */
export const REGION_COLORS: RegionPalette[] = [
  { primary: '#3EA8FF', accent: '#79C7FF', glow: 'Cool Blue' }, // 0 Frontal — Programming Languages
  { primary: '#2DFF88', accent: '#6BFFAF', glow: 'Emerald Green' }, // 1 Parietal — Frameworks
  { primary: '#FFB347', accent: '#FFD37A', glow: 'Amber' }, // 2 Temporal_Left — Core CS
  { primary: '#8C5BFF', accent: '#B18CFF', glow: 'Electric Purple' }, // 3 Temporal_Right — AI
  { primary: '#57F7FF', accent: '#A5FFFF', glow: 'Cyan' }, // 4 Occipital — Design & Dev Tools
  { primary: '#FF6464', accent: '#FF9090', glow: 'Soft Red' }, // 5 Cerebellum — Cloud & DevOps
  { primary: '#FFE45A', accent: '#FFF2A6', glow: 'Warm Gold' }, // 6 Brainstem — IoT & Hardware
]

/** Pre-built THREE.Color list (linear-correct) for shader uniform upload. */
export const REGION_COLOR_OBJECTS: Color[] = REGION_COLORS.map((r) => new Color(r.primary))
export const REGION_ACCENT_OBJECTS: Color[] = REGION_COLORS.map((r) => new Color(r.accent))
