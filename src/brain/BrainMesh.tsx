import { useGLTF } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Group } from 'three'
import '../interaction/bvh'
import { processBrainScene } from './processBrainGeometry'
import { createBrainMaterial } from './masterMaterial'
import { brainRuntime } from './brainRuntime'
import { SurfaceComponents } from './SurfaceComponents'
import { HoverLabel } from '../scene/HoverLabel'
import { useCortex } from '../state/cortexStore'
import { useQuality } from '../state/qualityStore'
import { REGION_COUNT } from '../state/regions'

const MODEL_URL = '/models/Brain_port.glb'
useGLTF.preload(MODEL_URL)

const DRAG_THRESHOLD_SQ = 36 // px^2 — beyond this a pointer-up is an orbit drag, not a click

/** Resolve which region a pointer event hit by reading the face's per-vertex region id. */
function regionFromEvent(e: ThreeEvent<PointerEvent>): number | null {
  const geom = (e.object as unknown as { geometry: BufferGeometry }).geometry
  const attr = geom.getAttribute('aRegionId')
  if (!attr) return null
  let vi: number
  if (e.face) vi = e.face.a
  else if (e.faceIndex != null) vi = e.faceIndex * 3
  else return null
  const id = Math.round(attr.getX(vi))
  return id >= 0 && id < REGION_COUNT ? id : null
}

/**
 * The Engineer's Brain: one merged, region-tagged mesh with the master material.
 * A single useFrame advances time, applies idle float/rotate/breathe, and eases the
 * per-region activation/hover uniforms toward the discrete store state — so hovering
 * or selecting never causes a per-frame React re-render.
 */
export function BrainMesh() {
  const { scene } = useGLTF(MODEL_URL)
  const processed = useMemo(() => {
    const p = processBrainScene(scene)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(p.geometry as any).computeBoundsTree?.()
    return p
  }, [scene])
  const { material, uniforms } = useMemo(() => createBrainMaterial(), [])
  // Real surface hardware rewards zoom; skipped on the lowest tier (level 2 = Tier C).
  // Tier A (level 0) gets the full ~16k-part fabrication, Tier B (level 1) ~45%.
  const componentLevel = useQuality((s) => s.level)
  const showComponents = componentLevel < 2
  const componentBudget = componentLevel === 0 ? 1 : 0.45

  const groupRef = useRef<Group>(null)
  const activeEase = useRef(new Float32Array(REGION_COUNT))
  const hoverEase = useRef(new Float32Array(REGION_COUNT))
  const down = useRef({ x: 0, y: 0, region: -1 })
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    brainRuntime.group = groupRef.current
    brainRuntime.centroids = processed.regionCentroids
    brainRuntime.anchors = processed.regionCentroids.map((c) =>
      c.clone().add(c.clone().normalize().multiplyScalar(0.14)),
    )
    brainRuntime.ready = true
    useCortex.getState().setReady(true)
    return () => {
      brainRuntime.ready = false
      brainRuntime.group = null
      material.dispose()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(processed.geometry as any).disposeBoundsTree?.()
      processed.geometry.dispose()
    }
  }, [material, processed])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const t = state.clock.elapsedTime
    uniforms.uTime.value = t

    // Idle breathing: a calm, alive rest state — slow vertical drift, a slower rotation,
    // and a gentle scale breath on its own frequency so the motion never reads as a loop.
    // All three respect prefers-reduced-motion consistently.
    const motion = reducedMotion ? 0 : 1
    const g = groupRef.current
    if (g) {
      g.position.y = Math.sin(t * 0.5) * 0.03 * motion
      g.rotation.y += dt * 0.022 * motion
      g.scale.setScalar(1 + Math.sin(t * 0.8) * 0.006 * motion)
    }

    // Interaction choreography (docs/07 + reference_ui): hover is a light, immediate touch;
    // selection "deploys" — a deliberate, weightier power-up that never pops. Two easing
    // rates, not one, so the two gestures feel distinct.
    const s = useCortex.getState()
    const kHover = 1 - Math.pow(0.0008, dt) // snappy: ~0.1s to settle
    const kSelect = 1 - Math.pow(0.02, dt) // deliberate deploy: ~0.28s
    let target = 0
    for (let i = 0; i < REGION_COUNT; i++) {
      const ta = s.selected.includes(i) ? 1 : 0
      const th = s.hovered === i ? 1 : 0
      activeEase.current[i] += (ta - activeEase.current[i]) * kSelect
      hoverEase.current[i] += (th - hoverEase.current[i]) * kHover
      uniforms.uActive.value[i] = activeEase.current[i]
      uniforms.uHover.value[i] = hoverEase.current[i]
      target += ta
    }
    uniforms.uBrainActivity.value += (target / REGION_COUNT - uniforms.uBrainActivity.value) * kSelect

    // Synchronization crescendo: swells when all seven regions are active (~1.5s ease).
    const syncTarget = target >= REGION_COUNT ? 1 : 0
    const ks = 1 - Math.pow(0.02, dt)
    uniforms.uSync.value += (syncTarget - uniforms.uSync.value) * ks
    uniforms.uMicroDetail.value = useQuality.getState().microDetail ? 1 : 0
  })

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const r = regionFromEvent(e)
    if (r != null && useCortex.getState().hovered !== r) useCortex.getState().setHovered(r)
    document.body.style.cursor = r != null ? 'pointer' : 'auto'
  }
  const onPointerOut = () => {
    useCortex.getState().setHovered(null)
    document.body.style.cursor = 'auto'
  }
  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    down.current = { x: e.clientX, y: e.clientY, region: regionFromEvent(e) ?? -1 }
  }
  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    const dx = e.clientX - down.current.x
    const dy = e.clientY - down.current.y
    if (dx * dx + dy * dy > DRAG_THRESHOLD_SQ) return // was an orbit drag
    const r = regionFromEvent(e)
    if (r != null && r === down.current.region) useCortex.getState().toggleSelected(r)
  }

  return (
    <group ref={groupRef}>
      <mesh
        geometry={processed.geometry}
        material={material}
        castShadow
        receiveShadow
        frustumCulled={false}
        onPointerMove={onPointerMove}
        onPointerOut={onPointerOut}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />
      {showComponents && <SurfaceComponents geometry={processed.geometry} budget={componentBudget} />}
      <HoverLabel />
    </group>
  )
}
