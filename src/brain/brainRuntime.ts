import { Group, Vector3 } from 'three'

/**
 * A tiny non-reactive bridge between the 3D brain and the DOM overlay layers.
 * The brain writes its group + per-region anchor points here; the projector reads
 * them each frame to compute screen positions for connectors and labels. Kept out
 * of the store so none of this causes React re-renders.
 */
export const brainRuntime: {
  group: Group | null
  centroids: Vector3[]
  anchors: Vector3[]
  /** Local-space outward unit direction per region (centroid normalized from origin) —
   * used to test whether a region's anchor currently faces the camera or is occluded by
   * the brain itself, so its connector line/dot hides when rotated out of view. */
  anchorNormals: Vector3[]
  ready: boolean
} = {
  group: null,
  centroids: [],
  anchors: [],
  anchorNormals: [],
  ready: false,
}
