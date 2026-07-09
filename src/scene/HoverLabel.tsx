import { Html } from '@react-three/drei'
import { brainRuntime } from '../brain/brainRuntime'
import { useCortex } from '../state/cortexStore'
import { REGIONS } from '../state/regions'
import { REGION_COLORS } from '../config/palette'

/**
 * A small camera-facing tag on the hovered lobe showing its knowledge family.
 * Rendered inside the brain group so it tracks the lobe as the brain moves.
 * Hover communicates possibility; no panel appears here (docs/01.5, 09).
 */
export function HoverLabel() {
  const hovered = useCortex((s) => s.hovered)
  const selected = useCortex((s) => s.selected)

  if (hovered == null) return null
  // Once selected, the panel carries the label — avoid doubling up.
  if (selected.includes(hovered)) return null

  const anchor = brainRuntime.anchors[hovered]
  if (!anchor) return null
  const region = REGIONS[hovered]
  const color = REGION_COLORS[hovered].primary

  return (
    <Html
      position={[anchor.x, anchor.y, anchor.z]}
      center
      zIndexRange={[6, 6]}
      style={{ pointerEvents: 'none' }}
      distanceFactor={undefined}
    >
      <div className="lobe-label" style={{ borderColor: color }}>
        <span className="lobe-label__dot" style={{ background: color }} />
        <span className="lobe-label__text">{region.knowledge}</span>
      </div>
    </Html>
  )
}
