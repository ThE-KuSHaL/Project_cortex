import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { Spherical, Vector3 } from 'three'
import { brainRuntime } from '../brain/brainRuntime'
import { useCortex } from '../state/cortexStore'

/**
 * Subtle camera choreography (docs/01.5, 07): the orbit target eases toward the mean
 * of the active regions so the view "settles" on what you activated, and returns to
 * centre on deselect. The nudge is clamped to a small radius so it never disorients,
 * and only the target moves — user rotation and zoom stay fully in control.
 *
 * Focus flight (card click): when a knowledge card is clicked, `focusRegion` is set and
 * the rig flies the camera to that region's optimal viewing angle — along the region's
 * outward normal in WORLD space, recomputed every frame so the flight stays correct
 * while the brain keeps rotating. Orbit distance is preserved (no zoom jump), the polar
 * angle is clamped to the OrbitControls limits, and any user orbit input cancels the
 * flight immediately — the user is always in charge.
 */
export function CameraRig() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controls = useThree((s) => s.controls) as any
  const camera = useThree((s) => s.camera)
  const desired = useMemo(() => new Vector3(), [])
  const tmp = useMemo(() => new Vector3(), [])
  const worldDir = useMemo(() => new Vector3(), [])
  const desiredPos = useMemo(() => new Vector3(), [])
  const offset = useMemo(() => new Vector3(), [])
  const sph = useMemo(() => new Spherical(), [])

  // Any user orbit gesture cancels an in-flight focus — the user is always in charge.
  useEffect(() => {
    if (!controls || !controls.addEventListener) return
    const cancel = () => {
      if (useCortex.getState().focusRegion != null) useCortex.getState().clearFocus()
    }
    controls.addEventListener('start', cancel)
    return () => controls.removeEventListener('start', cancel)
  }, [controls])

  useFrame((_, dt) => {
    if (!controls || !controls.target) return
    const s = useCortex.getState()
    const sel = s.selected
    const focus = s.focusRegion
    const g = brainRuntime.group

    // --- Orbit-target settle: mean of active anchors (focused region takes priority) ---
    desired.set(0, 0, 0)
    if (focus != null && g && brainRuntime.anchors[focus]) {
      g.updateWorldMatrix(true, false)
      desired.copy(brainRuntime.anchors[focus]).applyMatrix4(g.matrixWorld)
      if (desired.length() > 0.28) desired.setLength(0.28)
      desired.y *= 0.5
    } else if (sel.length && g) {
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

    // Softer, more cinematic settle (modification_02 camera polish) — never dramatic.
    const k = 1 - Math.pow(0.1, Math.min(dt, 0.1))
    controls.target.lerp(desired, k * 0.5)

    // --- Focus flight: swing the camera to face the focused region head-on ---
    if (focus != null && g) {
      const normal = brainRuntime.anchorNormals[focus]
      if (normal) {
        // Region's outward direction in world space — live, so the flight tracks the
        // brain's continuous idle rotation in real time.
        worldDir.copy(normal).applyQuaternion(g.quaternion)

        // Keep the user's current orbit distance; only the angle changes.
        const dist = camera.position.distanceTo(controls.target)
        desiredPos.copy(controls.target).addScaledVector(worldDir, dist)

        // Respect the OrbitControls polar clamp so the flight can never go under the
        // floor or over the pole (cerebellum/brainstem normals point steeply down).
        offset.copy(desiredPos).sub(controls.target)
        sph.setFromVector3(offset)
        sph.phi = Math.min(Math.max(sph.phi, Math.PI * 0.14), Math.PI * 0.86)
        offset.setFromSpherical(sph)
        desiredPos.copy(controls.target).add(offset)

        // Deliberate glide (~0.6s), same easing family as selection deploy.
        const kf = 1 - Math.pow(0.008, Math.min(dt, 0.1))
        camera.position.lerp(desiredPos, kf)

        // Arrived at the (clamped) destination: hand control back so the idle rotation
        // doesn't keep chasing the region forever. Measured against desiredPos, not the
        // raw normal, so steep-normal regions (brainstem) still terminate cleanly.
        if (camera.position.distanceTo(desiredPos) < dist * 0.02) s.clearFocus()
      } else {
        s.clearFocus()
      }
    }
  })

  return null
}
