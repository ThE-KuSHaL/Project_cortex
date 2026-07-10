import { Color, MeshStandardMaterial, type IUniform } from 'three'
import { REGION_COLOR_OBJECTS, STRUCTURAL } from '../config/palette'
import { REGION_COUNT } from '../state/regions'

/**
 * Project Cortex — Master Brain Material.
 *
 * A single MeshStandardMaterial (full PBR + env reflections + shadows) patched via
 * onBeforeCompile to add the cybernetic layers WITHOUT a monolithic custom shader:
 *   - per-region uniform arrays indexed by the per-vertex aRegionId (structural
 *     isolation: a fragment only ever reads its own region's colour/intensity, so
 *     cross-region colour bleed is impossible)
 *   - an engineered PCB routing field authored in the GLB's clean per-region UV islands
 *     (Manhattan + 45 deg buses, hierarchical widths, vias) with fwidth anti-aliasing so
 *     traces stay crisp at every zoom and gain a finer octave up close
 *   - region-coloured emissive gated to the routing only (dark-substrate law)
 *   - travelling packets + rare white hotspots (authored in HDR for selective bloom)
 *   - copper tint on the diffuse so routing reads even when unlit
 *   - micro roughness variation (machined surface) + a cool fresnel rim
 *
 * three r169 declares `attribute vec2 uv;` unconditionally for built-in materials, so
 * `uv` is used directly (never re-declared).
 */

export interface BrainUniforms {
  uTime: IUniform<number>
  uColors: IUniform<Float32Array>
  uActive: IUniform<Float32Array>
  uHover: IUniform<Float32Array>
  uBrainActivity: IUniform<number>
  uSync: IUniform<number>
  uEmissiveGain: IUniform<number>
  uMicroDetail: IUniform<number>
}

export interface BrainMaterialBundle {
  material: MeshStandardMaterial
  uniforms: BrainUniforms
}

function packColors(): Float32Array {
  const arr = new Float32Array(REGION_COUNT * 3)
  REGION_COLOR_OBJECTS.forEach((c, i) => {
    arr[i * 3 + 0] = c.r
    arr[i * 3 + 1] = c.g
    arr[i * 3 + 2] = c.b
  })
  return arr
}

const VERTEX_HEAD = /* glsl */ `
attribute float aRegionId;
uniform vec3 uColors[${REGION_COUNT}];
uniform float uActive[${REGION_COUNT}];
uniform float uHover[${REGION_COUNT}];
varying vec3 vRegionColor;
varying float vActiveMix;
varying vec2 vCortexUv;
varying vec3 vObjPos;
`

const VERTEX_BODY = /* glsl */ `
  int cortexRegion = int(aRegionId + 0.5);
  vRegionColor = uColors[cortexRegion];
  vActiveMix = clamp(uActive[cortexRegion] + uHover[cortexRegion] * 0.6, 0.0, 1.0);
  vCortexUv = uv;
  vObjPos = position;
`

const FRAGMENT_HEAD = /* glsl */ `
uniform float uTime;
uniform float uBrainActivity;
uniform float uSync;
uniform float uEmissiveGain;
uniform float uMicroDetail;
varying vec3 vRegionColor;
varying float vActiveMix;
varying vec2 vCortexUv;
varying vec3 vObjPos;

float cortexHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float cortexHash3(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// Cheap 3D value noise for machined micro roughness variation.
float cortexNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(cortexHash3(i + vec3(0, 0, 0)), cortexHash3(i + vec3(1, 0, 0)), f.x),
        mix(cortexHash3(i + vec3(0, 1, 0)), cortexHash3(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(cortexHash3(i + vec3(0, 0, 1)), cortexHash3(i + vec3(1, 0, 1)), f.x),
        mix(cortexHash3(i + vec3(0, 1, 1)), cortexHash3(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

// One layer of engineered routing on a cell grid: each populated cell carries a
// horizontal, vertical or 45-degree bus with a via, and a packet travelling along it.
// density (0..1) is the fraction of populated cells: coarse octaves stay sparse and
// bold (readable bus structure), fine octaves pack in as fabrication texture so the
// substrate reads "almost no empty areas" up close without flooding it with colour.
float cortexRoute(vec2 uv, float scale, float seed, float t, float width, float density, out float pk) {
  pk = 0.0;
  vec2 p = uv * scale;
  vec2 id = floor(p);
  vec2 gv = fract(p) - 0.5;
  float present = step(1.0 - density, cortexHash(id + seed + 3.3));
  if (present < 0.5) return 0.0;

  float o = cortexHash(id + seed + 7.1);
  float d;
  float along;
  if (o < 0.42) { d = abs(gv.y); along = gv.x; }
  else if (o < 0.84) { d = abs(gv.x); along = gv.y; }
  else { d = abs(gv.x - gv.y) * 0.70711; along = (gv.x + gv.y) * 0.70711; }

  float aa = fwidth(d) + 0.004;
  float line = 1.0 - smoothstep(width, width + aa, d);

  // via / pad at the cell centre — denser than before so zoom is rewarded with junctions
  float vr = length(gv);
  float via = (1.0 - smoothstep(0.052, 0.052 + fwidth(vr) + 0.004, vr)) * step(0.58, cortexHash(id + seed + 9.9));
  line = max(line, via);

  // Travelling packet. Cadence rises with global activity AND locally with this region's
  // own activation (vActiveMix = hover + select) — so hovering a lobe visibly quickens its
  // own packets (docs/07 / reference_ui "hover increases packet activity") right where the
  // user is looking, not just as a scene-wide average.
  float speed = (0.14 + 0.5 * cortexHash(id + seed + 1.3)) * (1.0 + uBrainActivity * 0.5 + vActiveMix * 0.9);
  float phase = fract(along + 0.5 - t * speed + cortexHash(id + seed));
  pk = line * (1.0 - smoothstep(0.05, 0.12, abs(phase - 0.5)));
  return line;
}
`

const FRAGMENT_DIFFUSE = /* glsl */ `
  // Four routing octaves: a macro bus layer down to fine PCB traces. Thinner widths than
  // before read as fabricated circuitry rather than wide ribbons; the 4th (finest) octave
  // is the reward-on-zoom layer and is skipped on the lowest tier only.
  float cortexPk1, cortexPk2, cortexPk3, cortexPk4;
  float cl1 = cortexRoute(vCortexUv, 7.0, 1.0, uTime, 0.028, 0.52, cortexPk1);
  float cl2 = cortexRoute(vCortexUv, 16.0, 13.0, uTime, 0.020, 0.62, cortexPk2);
  float cl3 = cortexRoute(vCortexUv, 34.0, 27.0, uTime, 0.014, 0.72, cortexPk3);
  float cl4 = uMicroDetail > 0.5 ? cortexRoute(vCortexUv, 72.0, 41.0, uTime, 0.010, 0.80, cortexPk4) : 0.0;
  if (uMicroDetail <= 0.5) cortexPk4 = 0.0;
  float cortexLine = clamp(cl1 + cl2 * 0.78 + cl3 * 0.55 + cl4 * 0.4, 0.0, 1.0);
  float cortexPacket = clamp(cortexPk1 + cortexPk2 * 0.72 + cortexPk3 * 0.5 + cortexPk4 * 0.35, 0.0, 1.0);
  vec3 cortexCopper = vec3(0.46, 0.23, 0.09);
  diffuseColor.rgb = mix(diffuseColor.rgb, cortexCopper, clamp(cortexLine * 0.80, 0.0, 0.80));
`

const FRAGMENT_ROUGHNESS = /* glsl */ `
  float cortexRough = cortexNoise(vObjPos * 42.0);
  roughnessFactor = clamp(roughnessFactor + (cortexRough - 0.5) * 0.14, 0.06, 1.0);
`

const FRAGMENT_EMISSIVE = /* glsl */ `
  // Idle circuitry still glows (reference reads "live" even at rest), but stays well under
  // the activation ceiling so hovering/selecting remains a clear, dramatic step-up.
  float cortexIdle = 0.34 + 0.16 * uBrainActivity;
  float cortexActivation = mix(cortexIdle, 1.0, vActiveMix);
  vec3 cortexEmis = vRegionColor * (cortexLine * 0.62 + cortexPacket * 3.0) * cortexActivation * uEmissiveGain;
  cortexEmis += vec3(1.0) * pow(cortexPacket, 3.0) * cortexActivation * (1.15 + uSync * 0.6); // white hotspots
  cortexEmis *= (1.0 + uSync * 0.28); // full-synchronization swell (all 7 regions active)
  // Structural cool rim — the spec's "critical" edge separation, authored on the surface
  // so it reads from every angle without a positioned light. Kept cool and deliberately
  // below the bloom threshold: it separates the silhouette from the void, never glows.
  vec3 cortexView = normalize(vViewPosition);
  float cortexFres = pow(1.0 - clamp(dot(normal, cortexView), 0.0, 1.0), 2.6);
  cortexEmis += vec3(0.26, 0.42, 0.72) * cortexFres * 0.24;
  totalEmissiveRadiance += cortexEmis;
`

export function createBrainMaterial(): BrainMaterialBundle {
  const uniforms: BrainUniforms = {
    uTime: { value: 0 },
    uColors: { value: packColors() },
    uActive: { value: new Float32Array(REGION_COUNT) },
    uHover: { value: new Float32Array(REGION_COUNT) },
    uBrainActivity: { value: 0 },
    uSync: { value: 0 },
    uEmissiveGain: { value: 1 },
    uMicroDetail: { value: 1 },
  }

  const material = new MeshStandardMaterial({
    color: new Color(STRUCTURAL.graphite),
    metalness: 0.34, // subtle metallic response — machined PCB substrate, not matte clay
    roughness: 0.70,
    envMapIntensity: 0.85, // soft ambient reflections catch the studio env on the shoulders
    dithering: true,
  })

  material.onBeforeCompile = (shader) => {
    // Guard the shader patch (docs/13 "failed shader compilation handled"): if string
    // injection ever throws, fall back to the un-patched standard PBR material so the
    // brain still renders as graphite instead of vanishing. Real graceful degradation —
    // the React ErrorBoundary cannot catch render-loop compile errors, this can.
    try {
      shader.uniforms.uTime = uniforms.uTime
      shader.uniforms.uColors = uniforms.uColors
      shader.uniforms.uActive = uniforms.uActive
      shader.uniforms.uHover = uniforms.uHover
      shader.uniforms.uBrainActivity = uniforms.uBrainActivity
      shader.uniforms.uSync = uniforms.uSync
      shader.uniforms.uEmissiveGain = uniforms.uEmissiveGain
      shader.uniforms.uMicroDetail = uniforms.uMicroDetail

      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${VERTEX_HEAD}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${VERTEX_BODY}`)

      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${FRAGMENT_HEAD}`)
        .replace('#include <map_fragment>', `#include <map_fragment>\n${FRAGMENT_DIFFUSE}`)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${FRAGMENT_ROUGHNESS}`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${FRAGMENT_EMISSIVE}`)
    } catch (err) {
      console.error('[Project Cortex] shader patch failed — falling back to standard PBR:', err)
    }
  }

  material.customProgramCacheKey = () => 'cortex-master-material-v7'

  return { material, uniforms }
}
