import { useEffect } from 'react'
import { useCortex } from '../state/cortexStore'
import { REGION_COUNT } from '../state/regions'

/**
 * Keyboard parity (docs/01.5 accessibility): arrows move the hovered region,
 * Enter activates/deactivates it, Escape clears the current selection.
 */
export function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useCortex.getState()
      // When a DOM control (the region navigator, a panel button) has focus, let it own
      // Tab/Enter/arrows — only keep Escape global to avoid double handling.
      const active = document.activeElement
      const inControl =
        !!active && (active.tagName === 'BUTTON' || active.closest('[data-region-nav]') != null)

      switch (e.key) {
        case 'Escape':
          s.clearSelection()
          s.setHovered(null)
          break
        case 'Enter':
        case ' ':
          if (!inControl && s.hovered != null) {
            s.toggleSelected(s.hovered)
            e.preventDefault()
          }
          break
        case 'ArrowRight':
        case 'ArrowDown': {
          if (inControl) break
          const next = ((s.hovered ?? -1) + 1 + REGION_COUNT) % REGION_COUNT
          s.setHovered(next)
          e.preventDefault()
          break
        }
        case 'ArrowLeft':
        case 'ArrowUp': {
          if (inControl) break
          const prev = ((s.hovered ?? REGION_COUNT) - 1 + REGION_COUNT) % REGION_COUNT
          s.setHovered(prev)
          e.preventDefault()
          break
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
