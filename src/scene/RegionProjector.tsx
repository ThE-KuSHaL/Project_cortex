import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import { brainRuntime } from '../brain/brainRuntime'
import { screenPoints } from '../interaction/projection'
import { REGION_COUNT } from '../state/regions'

/**
 * Projects each region's world-space anchor to screen pixels every frame so the DOM
 * connector/label layers can track the lobes as the brain floats and rotates.
 * Writes into the shared `screenPoints` array (no React state, no re-renders).
 */
export function RegionProjector() {
  const v = useMemo(() => new Vector3(), [])

  useFrame((state) => {
    const g = brainRuntime.group
    if (!g || !brainRuntime.ready) return
    const { width, height } = state.size
    for (let i = 0; i < REGION_COUNT; i++) {
      const anchor = brainRuntime.anchors[i]
      if (!anchor) continue
      v.copy(anchor).applyMatrix4(g.matrixWorld).project(state.camera)
      if (Number.isNaN(v.x) || Number.isNaN(v.y)) {
        screenPoints[i].visible = false
        continue
      }
      screenPoints[i].x = (v.x * 0.5 + 0.5) * width
      screenPoints[i].y = (-v.y * 0.5 + 0.5) * height
      screenPoints[i].visible = v.z > -1 && v.z < 1
    }
  })

  return null
}
