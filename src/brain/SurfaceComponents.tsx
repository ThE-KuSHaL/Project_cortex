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
  Quaternion,
  Vector3,
} from 'three'
import { sampleSurface, type SurfaceSample } from './surfaceSampler'
import { STRUCTURAL } from '../config/palette'

/**
 * Real close-inspection hardware (docs/04 detail hierarchy, 03_references material 04):
 * surface-mounted ceramic ICs and copper vias seated flush on the brain surface via
 * instancing. Two InstancedMeshes => two draw calls regardless of count. These are
 * passive/neutral (matte ceramic, dull copper) and never emit — the emissive routing
 * stays the shader's job. They live inside the brain group so they float and rotate
 * with it, and they are tier-gated (skipped entirely on Tier C).
 *
 * The payoff: from far away only the silhouette + glow read; on zoom, discrete chips
 * and vias resolve, rewarding inspection exactly as the spec requires.
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

export function SurfaceComponents({ geometry, count = 130 }: { geometry: BufferGeometry; count?: number }) {
  const { chipGeo, chipMat, viaGeo, viaMat, chipMatrices, viaMatrices } = useMemo(() => {
    const samples = sampleSurface(geometry, count, 20260706)
    const obj = new Object3D()
    const m = new Matrix4()
    const q = new Quaternion()
    const p = new Vector3()

    // ~60% chips, ~40% vias.
    const chipCount = Math.floor(samples.length * 0.6)
    const chips: Matrix4[] = []
    const vias: Matrix4[] = []

    samples.forEach((s, idx) => {
      const r = ((idx * 2654435761) >>> 0) / 4294967296 // stable per-index jitter
      if (idx < chipCount) {
        const w = 0.03 + r * 0.045
        const l = 0.03 + ((idx * 40503) % 100) / 100 * 0.05
        seatMatrix(s, new Vector3(w, 0.012, l), 0.006, r * Math.PI, m, q, p, obj)
        chips.push(m.clone())
      } else {
        const rad = 0.006 + r * 0.006
        seatMatrix(s, new Vector3(rad, 0.01, rad), 0.004, 0, m, q, p, obj)
        vias.push(m.clone())
      }
    })

    const chipGeo = new BoxGeometry(1, 1, 1)
    const chipMat = new MeshStandardMaterial({
      color: new Color('#1a1e24'), // matte charcoal ceramic
      metalness: 0.2,
      roughness: 0.85,
    })
    const viaGeo = new CylinderGeometry(1, 1, 1, 10)
    const viaMat = new MeshStandardMaterial({
      color: new Color(STRUCTURAL.copper),
      metalness: 0.9,
      roughness: 0.42,
    })

    return { chipGeo, chipMat, viaGeo, viaMat, chipMatrices: chips, viaMatrices: vias }
  }, [geometry, count])

  // Release the instanced geometries/materials when this remounts or unmounts.
  useEffect(() => {
    return () => {
      chipGeo.dispose()
      chipMat.dispose()
      viaGeo.dispose()
      viaMat.dispose()
    }
  }, [chipGeo, chipMat, viaGeo, viaMat])

  const setRef = (matrices: Matrix4[]) => (inst: InstancedMesh | null) => {
    if (!inst) return
    matrices.forEach((mat, i) => inst.setMatrixAt(i, mat))
    inst.instanceMatrix.needsUpdate = true
    inst.computeBoundingSphere()
  }

  return (
    <>
      <instancedMesh
        ref={setRef(chipMatrices)}
        args={[chipGeo, chipMat, chipMatrices.length]}
        castShadow
        frustumCulled={false}
      />
      <instancedMesh
        ref={setRef(viaMatrices)}
        args={[viaGeo, viaMat, viaMatrices.length]}
        frustumCulled={false}
      />
    </>
  )
}
