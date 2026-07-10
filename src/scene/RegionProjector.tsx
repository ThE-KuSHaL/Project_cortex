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
 *
 * Also hides a region's connector when its anchor is rotated to the far side of the
 * brain (occluded by the mesh itself): the anchor's outward normal is rotated into world
 * space and compared against the direction from the camera to the anchor — if they point
 * the same way, the surface faces away from the camera and the line/dot must not show.
 */
export function RegionProjector() {
  const v = useMemo(() => new Vector3(), [])
  const worldPos = useMemo(() => new Vector3(), [])
  const worldNormal = useMemo(() => new Vector3(), [])
  const viewDir = useMemo(() => new Vector3(), [])

  useFrame((state) => {
    const g = brainRuntime.group
    if (!g || !brainRuntime.ready) return
    const { width, height } = state.size
    for (let i = 0; i < REGION_COUNT; i++) {
      const anchor = brainRuntime.anchors[i]
      const normal = brainRuntime.anchorNormals[i]
      if (!anchor) continue

      worldPos.copy(anchor).applyMatrix4(g.matrixWorld)
      v.copy(worldPos).project(state.camera)
      if (Number.isNaN(v.x) || Number.isNaN(v.y)) {
        screenPoints[i].visible = false
        continue
      }
      screenPoints[i].x = (v.x * 0.5 + 0.5) * width
      screenPoints[i].y = (-v.y * 0.5 + 0.5) * height

      let facingCamera = true
      if (normal) {
        worldNormal.copy(normal).applyQuaternion(g.quaternion)
        viewDir.copy(worldPos).sub(state.camera.position).normalize()
        // Small positive tolerance so near-silhouette regions don't flicker at the edge.
        facingCamera = worldNormal.dot(viewDir) < 0.08
      }

      screenPoints[i].visible = v.z > -1 && v.z < 1 && facingCamera
    }
  })

  return null
}
