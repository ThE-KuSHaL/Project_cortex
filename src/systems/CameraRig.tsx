import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import { brainRuntime } from '../brain/brainRuntime'
import { useCortex } from '../state/cortexStore'

/**
 * Subtle camera choreography (docs/01.5, 07): the orbit target eases toward the mean
 * of the active regions so the view "settles" on what you activated, and returns to
 * centre on deselect. The nudge is clamped to a small radius so it never disorients,
 * and only the target moves — user rotation and zoom stay fully in control.
 */
export function CameraRig() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controls = useThree((s) => s.controls) as any
  const desired = useMemo(() => new Vector3(), [])
  const tmp = useMemo(() => new Vector3(), [])

  useFrame((_, dt) => {
    if (!controls || !controls.target) return
    const sel = useCortex.getState().selected
    const g = brainRuntime.group

    desired.set(0, 0, 0)
    if (sel.length && g) {
      g.updateWorldMatrix(true, false)
      let n = 0
      for (const id of sel) {
        const a = brainRuntime.anchors[id]
        if (!a) continue
        tmp.copy(a).applyMatrix4(g.matrixWorld)
        desired.add(tmp)
        n++
      }
      if (n) desired.multiplyScalar(1 / n)
      if (desired.length() > 0.28) desired.setLength(0.28)
      desired.y *= 0.5
    }

    const k = 1 - Math.pow(0.06, Math.min(dt, 0.1))
    controls.target.lerp(desired, k * 0.5)
  })

  return null
}
