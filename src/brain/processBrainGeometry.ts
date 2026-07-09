import {
  Box3,
  BufferGeometry,
  Float32BufferAttribute,
  Matrix4,
  Mesh,
  Object3D,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {
  REGIONS,
  REGION_COUNT,
  TEMPORAL_LEFT_ID,
  TEMPORAL_MATCH,
  TEMPORAL_RIGHT_ID,
} from '../state/regions'

export interface ProcessedBrain {
  /** Single merged, normalized geometry with position, normal, uv, aRegionId. One draw call. */
  geometry: BufferGeometry
  /** Local-space centroid of each region (index = regionId) in the normalized geometry. */
  regionCentroids: Vector3[]
  /** Normalized bounding box (centered on origin). */
  bounds: Box3
  /** Uniform scale applied during normalization (source units -> world units). */
  normalizeScale: number
}

const TARGET_SIZE = 2.4 // longest axis, world units

interface Tagged {
  regionId: number | 'temporal'
  geometry: BufferGeometry
}

/** Strip a geometry down to the exact attribute set required for a clean merge. */
function sanitize(src: BufferGeometry, worldMatrix: Matrix4): BufferGeometry {
  const g = src.clone()
  g.applyMatrix4(worldMatrix)
  const nonIndexed = g.index ? g.toNonIndexed() : g

  const out = new BufferGeometry()
  const pos = nonIndexed.getAttribute('position')
  out.setAttribute('position', pos.clone())

  if (nonIndexed.getAttribute('normal')) {
    out.setAttribute('normal', nonIndexed.getAttribute('normal').clone())
  } else {
    out.computeVertexNormals()
  }

  if (nonIndexed.getAttribute('uv')) {
    out.setAttribute('uv', nonIndexed.getAttribute('uv').clone())
  } else {
    out.setAttribute('uv', new Float32BufferAttribute(new Float32Array((pos.count as number) * 2), 2))
  }
  if (!out.getAttribute('normal')) out.computeVertexNormals()
  return out
}

/** Find which region a mesh belongs to by testing its own name and every ancestor's name. */
function classify(mesh: Mesh): number | 'temporal' | null {
  const names: string[] = []
  let node: Object3D | null = mesh
  while (node) {
    if (node.name) names.push(node.name)
    node = node.parent
  }
  const joined = names.join(' ')
  if (TEMPORAL_MATCH.test(joined)) return 'temporal'
  for (const r of REGIONS) {
    if (r.match && r.match.test(joined)) return r.id
  }
  return null
}

function centroidOf(geom: BufferGeometry): Vector3 {
  geom.computeBoundingBox()
  const c = new Vector3()
  geom.boundingBox!.getCenter(c)
  return c
}

/**
 * Turn the anatomical GLB scene into the production geometry:
 *  - bakes all node transforms into world space
 *  - splits the single Temporal mesh into Left/Right on the mid-sagittal plane
 *  - tags every vertex with aRegionId (0..6)
 *  - merges to one BufferGeometry and normalizes (centered, ~2.4u, one draw call)
 */
export function processBrainScene(root: Object3D): ProcessedBrain {
  root.updateWorldMatrix(true, true)

  const tagged: Tagged[] = []
  const perRegionCentroid = new Map<number, Vector3>()

  root.traverse((obj) => {
    const mesh = obj as Mesh
    if (!mesh.isMesh || !mesh.geometry) return
    const region = classify(mesh)
    if (region === null) return
    const geom = sanitize(mesh.geometry as BufferGeometry, mesh.matrixWorld)
    tagged.push({ regionId: region, geometry: geom })
    if (typeof region === 'number') perRegionCentroid.set(region, centroidOf(geom))
  })

  if (tagged.length === 0) {
    throw new Error('Project Cortex: no recognizable brain regions found in GLB.')
  }

  // Derive the anatomical anterior->posterior and lateral (left/right) axes so the
  // temporal split is correct regardless of the model's baked orientation.
  const frontalC = perRegionCentroid.get(0)
  const occipitalC = perRegionCentroid.get(4)
  const up = new Vector3(0, 1, 0)
  let lateral = new Vector3(1, 0, 0)
  if (frontalC && occipitalC) {
    const ap = occipitalC.clone().sub(frontalC).normalize()
    const l = new Vector3().crossVectors(up, ap)
    if (l.lengthSq() > 1e-6) lateral = l.normalize()
  }

  // Overall brain center (baked space) — the mid-sagittal plane passes through it.
  const worldBounds = new Box3()
  for (const t of tagged) {
    t.geometry.computeBoundingBox()
    worldBounds.union(t.geometry.boundingBox!)
  }
  const brainCenter = new Vector3()
  worldBounds.getCenter(brainCenter)

  // Tag every vertex with its region id (splitting temporal per-triangle).
  const geometriesToMerge: BufferGeometry[] = []
  const tmp = new Vector3()
  for (const t of tagged) {
    const g = t.geometry
    const pos = g.getAttribute('position')
    const count = pos.count as number
    const ids = new Float32Array(count)

    if (t.regionId === 'temporal') {
      // non-indexed => every 3 consecutive vertices form one triangle
      for (let tri = 0; tri < count; tri += 3) {
        let cx = 0
        let cy = 0
        let cz = 0
        for (let k = 0; k < 3; k++) {
          cx += pos.getX(tri + k)
          cy += pos.getY(tri + k)
          cz += pos.getZ(tri + k)
        }
        tmp.set(cx / 3, cy / 3, cz / 3).sub(brainCenter)
        const side = tmp.dot(lateral) < 0 ? TEMPORAL_LEFT_ID : TEMPORAL_RIGHT_ID
        ids[tri] = side
        ids[tri + 1] = side
        ids[tri + 2] = side
      }
    } else {
      ids.fill(t.regionId)
    }
    g.setAttribute('aRegionId', new Float32BufferAttribute(ids, 1))
    geometriesToMerge.push(g)
  }

  const merged = mergeGeometries(geometriesToMerge, false)
  if (!merged) {
    throw new Error('Project Cortex: geometry merge failed (attribute mismatch).')
  }

  // Normalize: center on origin, scale longest axis to TARGET_SIZE.
  merged.computeBoundingBox()
  const box = merged.boundingBox!
  const size = new Vector3()
  box.getSize(size)
  const center = new Vector3()
  box.getCenter(center)
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const scale = TARGET_SIZE / maxDim

  merged.translate(-center.x, -center.y, -center.z)
  merged.scale(scale, scale, scale)
  merged.computeBoundingBox()
  merged.computeBoundingSphere()

  // Region centroids in normalized space (for connectors / labels / camera focus).
  const regionCentroids: Vector3[] = Array.from({ length: REGION_COUNT }, () => new Vector3())
  const regionCounts = new Array(REGION_COUNT).fill(0)
  const npos = merged.getAttribute('position')
  const nid = merged.getAttribute('aRegionId')
  for (let i = 0; i < npos.count; i++) {
    const id = Math.round(nid.getX(i))
    if (id < 0 || id >= REGION_COUNT) continue
    regionCentroids[id].x += npos.getX(i)
    regionCentroids[id].y += npos.getY(i)
    regionCentroids[id].z += npos.getZ(i)
    regionCounts[id]++
  }
  for (let i = 0; i < REGION_COUNT; i++) {
    if (regionCounts[i] > 0) regionCentroids[i].multiplyScalar(1 / regionCounts[i])
  }

  // Dispose the intermediate per-region geometries; keep only the merged result.
  for (const g of geometriesToMerge) g.dispose()

  return {
    geometry: merged,
    regionCentroids,
    bounds: merged.boundingBox!.clone(),
    normalizeScale: scale,
  }
}
