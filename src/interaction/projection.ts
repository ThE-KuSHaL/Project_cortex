import { REGION_COUNT } from '../state/regions'

/**
 * Shared screen-space positions of each region's connector anchor, in CSS pixels.
 * Written every frame by <RegionProjector> (inside the canvas), read by the DOM
 * connector layer's rAF loop. A plain array — deliberately not React state.
 */
export interface ScreenPoint {
  x: number
  y: number
  visible: boolean
}

export const screenPoints: ScreenPoint[] = Array.from({ length: REGION_COUNT }, () => ({
  x: 0,
  y: 0,
  visible: false,
}))
