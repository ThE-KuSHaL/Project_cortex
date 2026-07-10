import { useEffect, useMemo } from 'react'
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Object3D,
  OctahedronGeometry,
  Quaternion,
  Vector3,
} from 'three'
import { sampleSurface, type SurfaceSample } from './surfaceSampler'
import { STRUCTURAL } from '../config/palette'

/**
 * Real close-inspection hardware (docs/02 "almost no empty areas… rewards close
 * inspection"; docs/13 "surface detail visible at multiple zoom levels").
 *
 * This is REAL seated geometry, not texture: eight families of surface-mounted parts —
 * large ICs, dense SMD chips, copper vias, connector pads, capacitors, oscillator cans,
 * heatsink fins and micro solder beads — instanced flush against the brain surface with
 * correct per-part normal orientation. Because every family is one InstancedMesh, the
 * whole ~16k-part fabrication costs only eight draw calls regardless of instance count.
 *
 * All parts are passive structural PBR (ceramic / copper / titanium / steel) and NEVER
 * emit — emissive routing stays the shader's job so "graphite never glows" holds. They
 * live inside the brain group (float/rotate with it) and scale down by tier: Tier A gets
 * the full fabrication, Tier B ~45%, Tier C skips the layer entirely (parent-gated).
 *
 * The payoff: from far, only the silhouette + glow read; on zoom, thousands of discrete
 * components resolve across the whole surface, so inspection is continuously rewarded.
 */

const UP = new Vector3(0, 1, 0)

function seatMatrix(
  sample: SurfaceSample,
  scale: Vector3,
  lift: number,
  spin: number,
  out: Matrix4,
  q: Quaternion,
  pos: Vector3,
  obj: Object3D,
) {
  // Orient +Y to the surface normal, then spin about the normal for variety.
  q.setFromUnitVectors(UP, sample.normal)
  const spinQ = new Quaternion().setFromAxisAngle(UP, spin)
  q.multiply(spinQ)
  pos.copy(sample.normal).multiplyScalar(lift).add(sample.position)
  obj.position.copy(pos)
  obj.quaternion.copy(q)
  obj.scale.copy(scale)
  obj.updateMatrix()
  out.copy(obj.matrix)
}

/** Deterministic per-index hash in [0,1) — stable component layout across reloads. */
function hash01(i: number, salt: number): number {
  let x = (i * 2654435761 + salt * 40503) >>> 0
  x ^= x >>> 15
  x = Math.imul(x, 0x2c1b3c6d)
  x ^= x >>> 12
  return (x >>> 0) / 4294967296
}

interface Family {
  key: string
  /** Base instance count at Tier A. Scaled by the tier budget. */
  count: number
  /** Minimum face flatness to accept a seat (1 = only perfectly flat plateaus). */
  flatness: number
  /** Deterministic sampler seed — distinct per family so layouts don't collide. */
  seed: number
  /** Whether this family participates in the shadow pass (only the larger parts do). */
  shadow: boolean
  geometry: () => BufferGeometry
  material: () => MeshStandardMaterial
  /** Per-instance scale + surface lift, given a stable random r in [0,1) and index. */
  place: (r: number, idx: number) => { scale: Vector3; lift: number; spin: number }
}

const FAMILIES: Family[] = [
  // 1 — Large ICs: bold ceramic packages on plateaus. Read first on zoom.
  {
    key: 'bigIC',
    count: 30,
    flatness: 0.9,
    seed: 20260706,
    shadow: true,
    geometry: () => new BoxGeometry(1, 1, 1),
    material: () => new MeshStandardMaterial({ color: new Color('#2b323c'), metalness: 0.45, roughness: 0.62 }),
    place: (r, idx) => ({
      scale: new Vector3(0.048 + r * 0.055, 0.018, 0.048 + ((idx * 40503) % 100) / 100 * 0.055),
      lift: 0.009,
      spin: r * Math.PI,
    }),
  },
  // 2 — SMD chips: sparse accent fill, not dense.
  {
    key: 'smdChip',
    count: 50,
    flatness: 0.72,
    seed: 771113,
    shadow: false,
    geometry: () => new BoxGeometry(1, 1, 1),
    material: () => new MeshStandardMaterial({ color: new Color('#4b5563'), metalness: 0.55, roughness: 0.48 }),
    place: (r, idx) => ({
      scale: new Vector3(0.016 + r * 0.026, 0.013, 0.016 + hash01(idx, 7) * 0.028),
      lift: 0.007,
      spin: hash01(idx, 3) * Math.PI,
    }),
  },
  // 3 — Copper vias: sparse metallic accents.
  {
    key: 'via',
    count: 40,
    flatness: 0.6,
    seed: 550099,
    shadow: false,
    geometry: () => new CylinderGeometry(1, 1, 1, 10),
    material: () => new MeshStandardMaterial({ color: new Color(STRUCTURAL.copper), metalness: 0.92, roughness: 0.4 }),
    place: (r) => {
      const rad = 0.005 + r * 0.006
      return { scale: new Vector3(rad, 0.009, rad), lift: 0.004, spin: 0 }
    },
  },
  // 4 — Connector pads: sparse landing points.
  {
    key: 'pad',
    count: 25,
    flatness: 0.8,
    seed: 918273,
    shadow: false,
    geometry: () => new CylinderGeometry(1, 1, 1, 14),
    material: () => new MeshStandardMaterial({ color: new Color('#8a5a2c'), metalness: 0.85, roughness: 0.5 }),
    place: (r) => {
      const rad = 0.014 + r * 0.013
      return { scale: new Vector3(rad, 0.003, rad), lift: 0.0025, spin: 0 }
    },
  },
  // 5 — Capacitors: sparse tall accents.
  {
    key: 'cap',
    count: 20,
    flatness: 0.85,
    seed: 336699,
    shadow: true,
    geometry: () => new CylinderGeometry(1, 1, 1, 12),
    material: () => new MeshStandardMaterial({ color: new Color(STRUCTURAL.steel), metalness: 0.78, roughness: 0.38 }),
    place: (r, idx) => {
      const rad = 0.01 + r * 0.007
      return { scale: new Vector3(rad, 0.03 + hash01(idx, 11) * 0.025, rad), lift: 0.016, spin: 0 }
    },
  },
  // 6 — Oscillator crystals: sparse faceted accents.
  {
    key: 'osc',
    count: 18,
    flatness: 0.8,
    seed: 145263,
    shadow: true,
    geometry: () => new OctahedronGeometry(1, 0),
    material: () => new MeshStandardMaterial({ color: new Color('#6b7784'), metalness: 0.85, roughness: 0.3 }),
    place: (r, idx) => {
      const s = 0.014 + r * 0.012
      return { scale: new Vector3(s, s * 0.7, s), lift: 0.01, spin: hash01(idx, 5) * Math.PI }
    },
  },
  // 7 — Heatsink fins: sparse plates.
  {
    key: 'heatsink',
    count: 15,
    flatness: 0.88,
    seed: 604020,
    shadow: true,
    geometry: () => new BoxGeometry(1, 1, 1),
    material: () => new MeshStandardMaterial({ color: new Color(STRUCTURAL.titanium), metalness: 0.8, roughness: 0.36 }),
    place: (r, idx) => ({
      scale: new Vector3(0.05 + r * 0.03, 0.022 + hash01(idx, 9) * 0.014, 0.007),
      lift: 0.012,
      spin: hash01(idx, 13) * Math.PI,
    }),
  },
  // 8 — Micro solder beads: very sparse, only on flat areas.
  {
    key: 'bead',
    count: 30,
    flatness: 0.65,
    seed: 987321,
    shadow: false,
    geometry: () => new OctahedronGeometry(1, 0),
    material: () => new MeshStandardMaterial({ color: new Color('#5c3c20'), metalness: 0.7, roughness: 0.55 }),
    place: (r) => {
      const s = 0.005 + r * 0.004
      return { scale: new Vector3(s, s, s), lift: 0.002, spin: 0 }
    },
  },
]

interface BuiltFamily {
  key: string
  geometry: BufferGeometry
  material: MeshStandardMaterial
  matrices: Matrix4[]
  shadow: boolean
}

export function SurfaceComponents({
  geometry,
  budget = 1,
}: {
  geometry: BufferGeometry
  /** Tier scale on all instance counts (Tier A = 1, Tier B ≈ 0.45). */
  budget?: number
}) {
  const built = useMemo<BuiltFamily[]>(() => {
    const obj = new Object3D()
    const m = new Matrix4()
    const q = new Quaternion()
    const p = new Vector3()

    return FAMILIES.map((fam) => {
      const count = Math.max(1, Math.round(fam.count * budget))
      let samples = sampleSurface(geometry, count, fam.seed, fam.flatness)
      // Brainstem (id 6) is thin/curved — keep only 20% of parts there.
      samples = samples.filter((s, idx) => s.regionId !== 6 || idx % 5 === 0)
      const matrices: Matrix4[] = []
      samples.forEach((s, idx) => {
        const r = hash01(idx, fam.seed & 0xffff)
        const { scale, lift, spin } = fam.place(r, idx)
        seatMatrix(s, scale, lift, spin, m, q, p, obj)
        matrices.push(m.clone())
      })
      return { key: fam.key, geometry: fam.geometry(), material: fam.material(), matrices, shadow: fam.shadow }
    })
  }, [geometry, budget])

  // Release every family's geometry + material on remount / unmount.
  useEffect(() => {
    return () => {
      built.forEach((b) => {
        b.geometry.dispose()
        b.material.dispose()
      })
    }
  }, [built])

  const setRef = (matrices: Matrix4[]) => (inst: InstancedMesh | null) => {
    if (!inst) return
    matrices.forEach((mat, i) => inst.setMatrixAt(i, mat))
    inst.instanceMatrix.needsUpdate = true
    inst.computeBoundingSphere()
  }

  return (
    <>
      {built.map((b) => (
        <instancedMesh
          key={b.key}
          ref={setRef(b.matrices)}
          args={[b.geometry, b.material, b.matrices.length]}
          castShadow={b.shadow}
          frustumCulled={false}
        />
      ))}
    </>
  )
}
