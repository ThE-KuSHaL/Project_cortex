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
  /** Per-region accumulated packet-boost clock (seconds of extra phase). Advancing this
   * faster while a region is hovered/selected raises packet cadence SUSTAINABLY — unlike
   * multiplying uTime by a time-varying speed, which bursts on transition then appears
   * to fade (the modification_02 hover defect). */
  uBoost: IUniform<Float32Array>
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
uniform float uBoost[${REGION_COUNT}];
varying vec3 vRegionColor;
varying float vActiveMix;
varying float vBoost;
varying vec2 vCortexUv;
varying vec3 vObjPos;
`

const VERTEX_BODY = /* glsl */ `
  int cortexRegion = int(aRegionId + 0.5);
  vRegionColor = uColors[cortexRegion];
  vActiveMix = clamp(uActive[cortexRegion] + uHover[cortexRegion] * 0.6, 0.0, 1.0);
  vBoost = uBoost[cortexRegion];
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
varying float vBoost;
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

// One layer of EDA routing modelled directly on circuit_reference.png: LONG continuous
// traces running as parallel lane bundles, the WHOLE bundle jogging together at exactly
// 45 degrees where the lane-offset field steps between columns, per-segment occupancy so
// nets start/stop like real routing, and round terminal pads (the reference's dots)
// where a net ends. No per-cell random orientation — flow is coherent across the field.
float cortexRoute(vec2 uv, float scale, float seed, float t, float width, float density, out float pk) {
  pk = 0.0;
  vec2 p = uv * scale;
  float x = p.x;

  // Lane-offset field: constant per column (long straight runs), ramping between
  // columns at EXACTLY 45 deg (slope +/-1), so neighbouring traces jog in parallel.
  float colW = 4.0;
  float c = floor(x / colW);
  float xc = fract(x / colW) * colW;
  float n0 = floor(cortexHash(vec2(c, seed)) * 5.0);
  float n1 = floor(cortexHash(vec2(c + 1.0, seed)) * 5.0);
  float d45 = n1 - n0;
  float ramp = clamp(xc - (colW - abs(d45)), 0.0, abs(d45));
  float off = n0 + sign(d45) * ramp;

  float yy = p.y - off;
  float lane = floor(yy);
  float fy = fract(yy) - 0.5;

  // Per-segment net occupancy: each lane carries its trace over long hash-gated runs.
  float segLen = 7.0 + 4.0 * cortexHash(vec2(lane, seed + 2.2));
  float sgi = floor(x / segLen);
  float occ  = step(1.0 - density, cortexHash(vec2(lane, sgi + seed * 0.7)));
  float occL = step(1.0 - density, cortexHash(vec2(lane, sgi - 1.0 + seed * 0.7)));

  float aa = fwidth(fy) + 0.004;
  float line = occ * (1.0 - smoothstep(width, width + aa, abs(fy)));

  // Round terminal pad where a net begins or ends — the reference's endpoint dots.
  float xb = sgi * segLen;
  float ends = abs(occ - occL);
  float pd = length(vec2(x - xb, fy));
  float pad = ends * (1.0 - smoothstep(width * 3.2, width * 3.2 + fwidth(pd) + 0.004, pd));
  line = max(line, pad);

  // Travelling packets on the region's boost clock (t = uTime + vBoost): sustained
  // hover/select cadence (modification_02) with an async priority lane so movement
  // never reads as synchronized.
  vec2 id = vec2(lane, sgi);
  float along = x * 0.30;
  float speed = (0.14 + 0.5 * cortexHash(id + seed + 1.3)) * (1.0 + uBrainActivity * 0.35);
  float phase = fract(along + 0.5 - t * speed + cortexHash(id + seed));
  pk = line * occ * (1.0 - smoothstep(0.05, 0.12, abs(phase - 0.5)));
  float lane2 = step(0.67, cortexHash(id + seed + 7.7));
  float phase2 = fract(along - t * speed * 1.8 + cortexHash(id + seed + 4.2));
  pk = max(pk, line * occ * lane2 * 0.65 * (1.0 - smoothstep(0.04, 0.1, abs(phase2 - 0.5))));
  return line;
}
`

const FRAGMENT_DIFFUSE = /* glsl */ `
  // Four routing octaves = four board layers. Octaves 1/3 flow horizontally, 2/4
  // vertically (uv swapped) so layers cross orthogonally with 45-degree jogs — the
  // multilayer topology of circuit_reference.png. The finest octave is the
  // reward-on-zoom layer and is skipped on the lowest tier only.
  float cortexPk1, cortexPk2, cortexPk3, cortexPk4;
  // Region-local packet clock: uTime plus this region's accumulated boost. Advancing the
  // boost faster during hover/select keeps cadence elevated for the whole interaction.
  float cortexT = uTime + vBoost;
  float cl1 = cortexRoute(vCortexUv, 7.0, 1.0, cortexT, 0.028, 0.42, cortexPk1);
  float cl2 = cortexRoute(vCortexUv.yx, 16.0, 13.0, cortexT, 0.020, 0.48, cortexPk2);
  float cl3 = cortexRoute(vCortexUv, 34.0, 27.0, cortexT, 0.014, 0.55, cortexPk3);
  float cl4 = uMicroDetail > 0.5 ? cortexRoute(vCortexUv.yx, 72.0, 41.0, cortexT, 0.010, 0.62, cortexPk4) : 0.0;
  if (uMicroDetail <= 0.5) cortexPk4 = 0.0;
  float cortexLine = clamp(cl1 + cl2 * 0.78 + cl3 * 0.55 + cl4 * 0.4, 0.0, 1.0);
  float cortexPacket = clamp(cortexPk1 + cortexPk2 * 0.72 + cortexPk3 * 0.5 + cortexPk4 * 0.35, 0.0, 1.0);
  vec3 cortexCopper = vec3(0.46, 0.23, 0.09);
  diffuseColor.rgb = mix(diffuseColor.rgb, cortexCopper, clamp(cortexLine * 0.80, 0.0, 0.80));

  // Silkscreen inspection markings (modification_01/02 "tiny engraved identifiers"):
  // sparse printed dashes + tiny squares on a fine grid, faint warm-white like component
  // designators. Non-emissive, micro-tier only — pure reward-on-zoom.
  if (uMicroDetail > 0.5) {
    vec2 sp = vCortexUv * 96.0;
    vec2 sid = floor(sp);
    vec2 sgv = fract(sp) - 0.5;
    float son = step(0.93, cortexHash(sid + 17.3));
    float kind = cortexHash(sid + 23.7);
    float mark;
    if (kind < 0.6) {
      mark = (1.0 - smoothstep(0.28, 0.33, abs(sgv.x))) * (1.0 - smoothstep(0.05, 0.09, abs(sgv.y))); // dash
    } else {
      mark = (1.0 - smoothstep(0.10, 0.15, max(abs(sgv.x), abs(sgv.y)))); // tiny square pad
    }
    diffuseColor.rgb += vec3(0.55, 0.58, 0.52) * son * mark * 0.16 * (1.0 - cortexLine);
  }
`

const FRAGMENT_ROUGHNESS = /* glsl */ `
  // Machined micro-variation on the graphite, PLUS material differentiation: copper
  // routing is smoother/more reflective than substrate (metal vs matte), and a subtle
  // carbon-fiber weave modulates the bare substrate's roughness in a fine cross-hatch.
  float cortexRough = cortexNoise(vObjPos * 42.0);
  float cortexWeave = sin(vCortexUv.x * 620.0) * sin(vCortexUv.y * 620.0); // CF cross-hatch
  roughnessFactor = clamp(roughnessFactor + (cortexRough - 0.5) * 0.14 + cortexWeave * 0.03, 0.06, 1.0);
  roughnessFactor = mix(roughnessFactor, 0.32, cortexLine * 0.8); // copper: polished
`

const FRAGMENT_METALNESS = /* glsl */ `
  metalnessFactor = mix(metalnessFactor, 0.9, cortexLine * 0.85); // copper: metallic
`

const FRAGMENT_EMISSIVE = /* glsl */ `
  // Idle circuitry still glows (reference reads "live" even at rest), but stays well under
  // the activation ceiling so hovering/selecting remains a clear, dramatic step-up.
  // The platform powers the brain (modification_02): the base conduit travels upward on a
  // 0.35 Hz clock; as each pulse ARRIVES (cycle end) the idle glow lifts softly, so the
  // brain visibly breathes on the pedestal's power rhythm.
  float cortexFeed = pow(fract(uTime * 0.35), 6.0);
  float cortexIdle = 0.34 + 0.16 * uBrainActivity + cortexFeed * 0.07;
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
    uBoost: { value: new Float32Array(REGION_COUNT) },
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
      shader.uniforms.uBoost = uniforms.uBoost
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
        .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>\n${FRAGMENT_METALNESS}`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${FRAGMENT_EMISSIVE}`)
    } catch (err) {
      console.error('[Project Cortex] shader patch failed — falling back to standard PBR:', err)
    }
  }

  material.customProgramCacheKey = () => 'cortex-master-material-v11'

  return { material, uniforms }
}
