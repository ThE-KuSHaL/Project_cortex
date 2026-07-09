import { create } from 'zustand'
import { REGION_COUNT } from './regions'

/**
 * Project Cortex — discrete interaction state (zustand).
 *
 * IMPORTANT ARCHITECTURAL RULE: this store holds only DISCRETE state that changes
 * on user intent (which region is hovered / selected). Continuous per-frame values
 * (emissive intensity, packet speed, easing) are NOT stored here — they live in
 * shader uniforms mutated inside a single useFrame, so hovering/selecting never
 * triggers a per-frame React re-render.
 */

export type InteractionPhase = 'dormant' | 'idle'

interface CortexState {
  ready: boolean
  hovered: number | null
  selected: number[]
  phase: InteractionPhase

  setReady: (v: boolean) => void
  setHovered: (id: number | null) => void
  toggleSelected: (id: number) => void
  clearSelection: () => void
  isSelected: (id: number) => boolean
  activeCount: () => number
}

export const useCortex = create<CortexState>((set, get) => ({
  ready: false,
  hovered: null,
  selected: [],
  phase: 'dormant',

  setReady: (v) => set({ ready: v, phase: v ? 'idle' : 'dormant' }),
  setHovered: (id) => set({ hovered: id }),
  toggleSelected: (id) =>
    set((s) => {
      if (id < 0 || id >= REGION_COUNT) return s
      const has = s.selected.includes(id)
      return { selected: has ? s.selected.filter((x) => x !== id) : [...s.selected, id] }
    }),
  clearSelection: () => set({ selected: [] }),
  isSelected: (id) => get().selected.includes(id),
  activeCount: () => get().selected.length,
}))
