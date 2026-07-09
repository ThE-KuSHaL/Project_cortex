import { BufferGeometry, Mesh } from 'three'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'

/**
 * Enable three-mesh-bvh accelerated raycasting globally. Picking a region on a
 * ~111k-triangle merged mesh on every pointer move would jank without a BVH; with
 * one it is effectively free. Imported for side effects.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(BufferGeometry.prototype as any).computeBoundsTree = computeBoundsTree
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(BufferGeometry.prototype as any).disposeBoundsTree = disposeBoundsTree
Mesh.prototype.raycast = acceleratedRaycast

export {}
