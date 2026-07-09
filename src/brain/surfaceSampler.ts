import { BufferGeometry, Vector3 } from 'three'
import { REGION_COUNT } from '../state/regions'

export interface SurfaceSample {
  position: Vector3
  normal: Vector3
  regionId: number
}

/**
 * Deterministic (seeded) surface sampler for the merged brain geometry.
 *
 * Picks points on the surface weighted by triangle area so density is uniform, seats
 * downstream instanced hardware (chips, vias) flush against the surface via the face
 * normal, and tags each sample with the triangle's region id so per-region caps and
 * colours apply. Curvature-flat triangles are preferred so chips sit on plateaus
 * rather than bridging deep sulci — approximated by rejecting samples whose triangle
 * normal deviates too far from its vertex-normal average (creased faces).
 */
export function sampleSurface(geometry: BufferGeometry, count: number, seed = 1337): SurfaceSample[] {
  const pos = geometry.getAttribute('position')
  const norm = geometry.getAttribute('normal')
  const region = geometry.getAttribute('aRegionId')
  if (!pos || !region) return []

  const triCount = Math.floor(pos.count / 3)

  // Cumulative area distribution for area-weighted selection.
  const cumulative = new Float32Array(triCount)
  const a = new Vector3()
  const b = new Vector3()
  const c = new Vector3()
  const ab = new Vector3()
  const ac = new Vector3()
  let total = 0
  for (let t = 0; t < triCount; t++) {
    const i = t * 3
    a.fromBufferAttribute(pos, i)
    b.fromBufferAttribute(pos, i + 1)
    c.fromBufferAttribute(pos, i + 2)
    ab.subVectors(b, a)
    ac.subVectors(c, a)
    total += ab.cross(ac).length() * 0.5
    cumulative[t] = total
  }

  // Small deterministic PRNG (mulberry32) so instance layout is stable across reloads.
  let s = seed >>> 0
  const rand = () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let x = Math.imul(s ^ (s >>> 15), 1 | s)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }

  const pickTri = (target: number) => {
    let lo = 0
    let hi = triCount - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (cumulative[mid] < target) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  const samples: SurfaceSample[] = []
  const na = new Vector3()
  const nb = new Vector3()
  const nc = new Vector3()
  const faceN = new Vector3()
  const vertN = new Vector3()
  let attempts = 0
  const maxAttempts = count * 6

  while (samples.length < count && attempts < maxAttempts) {
    attempts++
    const t = pickTri(rand() * total)
    const i = t * 3
    a.fromBufferAttribute(pos, i)
    b.fromBufferAttribute(pos, i + 1)
    c.fromBufferAttribute(pos, i + 2)

    // Reject creased/steep triangles (deep folds) so components sit on plateaus.
    faceN.subVectors(b, a).cross(ac.subVectors(c, a)).normalize()
    if (norm) {
      na.fromBufferAttribute(norm, i)
      nb.fromBufferAttribute(norm, i + 1)
      nc.fromBufferAttribute(norm, i + 2)
      vertN.copy(na).add(nb).add(nc).normalize()
      if (faceN.dot(vertN) < 0.86) continue
    }

    // Uniform barycentric point in the triangle.
    let u = rand()
    let v = rand()
    if (u + v > 1) {
      u = 1 - u
      v = 1 - v
    }
    const px = a.x + u * (b.x - a.x) + v * (c.x - a.x)
    const py = a.y + u * (b.y - a.y) + v * (c.y - a.y)
    const pz = a.z + u * (b.z - a.z) + v * (c.z - a.z)

    const n = norm ? vertN.clone() : faceN.clone()
    const rid = Math.round(region.getX(i))
    samples.push({
      position: new Vector3(px, py, pz),
      normal: n,
      regionId: rid >= 0 && rid < REGION_COUNT ? rid : 0,
    })
  }

  return samples
}
