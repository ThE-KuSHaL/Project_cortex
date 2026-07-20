# Project Cortex — modification_03_circuitry_reference.md

Version: 1.0 · Status: **PLAN — not yet implemented** · Written 2026-07-20

Reference asset: `assets/circuitry.avif` (the PCB-mural image).
Scope: art direction only. No architecture changes, no new interaction systems —
same rules as modification_01/02.

---

## 1. What the reference image actually contains

Studied element by element:

| # | Element | Description in the image |
|---|---------|--------------------------|
| E1 | **Terminal dot pads** | The dominant motif. Almost every trace END terminates in a small filled circle (via / test point). Many are on short stubs that branch off a longer run and exist only to end in a dot. Some pads are hollow rings instead of filled dots. |
| E2 | **Meandering parallel runs** | Traces travel in groups of 2–5 parallel lines, turning together with 45° chamfered corners, flowing AROUND components rather than through them. |
| E3 | **Chip islands + keep-out** | Every chip package sits in a calm zone; a rounded-rectangle outline frames it and the trace field routes around that frame. Chips are landmarks the wiring respects. |
| E4 | **Hero chip + radiating buses** | One large central CPU with gold pin rows; a handful of THICK gold buses sweep diagonally toward/away from it, visually more important than the ordinary dark traces. |
| E5 | **Component variety as texture** | Mid-size QFPs with visible pin legs, small SOICs, oval pads, and silver cylindrical capacitor cans scattered in the gaps between trace bundles. |
| E6 | **Density rhythm** | Dense bundles between islands, calm around chips — the eye rests on components, travels on traces. |

## 2. Gap analysis vs the current build (M19)

| Element | Current state | Gap |
|---|---|---|
| E1 pads | Pads appear only where per-segment occupancy flips — well under half of visible ends, small radius, filled-only | **Main complaint.** Need ≥ 50% of trace ends circled, larger, plus ring variant and stub-dots |
| E2 runs | Lane bundles with shared 45° jogs exist (M19) — good base | Missing: short branch stubs, corner pads |
| E3 islands | Chips are flatness-sampled at random spots; routing ignores them completely (traces pass under parts) | Need keep-out: routing suppressed under/around each region's hub chip + outline frame |
| E4 hero | No hub concept; all traces equal width per octave | Need one hub chip per region + 2–3 brighter/thicker buses anchored to it |
| E5 variety | 8 instanced families exist (M13, sparse per user direction) | Mostly covered; add pin-row detail to the hub IC only |
| E6 rhythm | Uniform density everywhere | Falls out of E3/E4 automatically (calm near hub, dense between) |

## 3. Planned changes — by file

### 3.1 `src/brain/masterMaterial.ts` (shader — the bulk of the work)

**A. Terminal pads ≥ 50% (E1).** In `cortexRoute`:
- Draw a pad circle at EVERY segment boundary of an occupied net (currently only at
  occupancy transitions). Pad radius up from `width*3.2` → `width*4.2`.
- Ring variant: per-end hash picks filled dot (60%) or hollow ring (40%) —
  `ring = smoothstep(band) - smoothstep(inner)` — matching the image's mixed pad styles.
- **Stub-dots:** on ~35% of lane cells, a short perpendicular stub (1–1.5 lanes long)
  branches from the run and terminates in a filled dot. This is the image's signature
  texture and is what pushes the "ends in a circle" ratio decisively past half.

**B. Region hub + keep-out (E3, E4).** New uniform `uHubUv[7]` (vec2 per region — the
UV coordinate of each region's hub chip seat, computed CPU-side, see 3.2):
- Keep-out: inside radius r₀ of the hub UV, routing is suppressed
  (`line *= smoothstep(r0, r0*1.25, dist)`); a thin rounded outline frame is drawn at r₀
  — the image's chip-island framing.
- Hero buses: 2–3 lanes whose hash sits nearest the hub get `width × 2.2` and
  `emissive × 1.6` within a falloff radius of the hub — the gold radiating buses,
  expressed in the region's own colour (design law: region identity, never literal gold).
- Cost: 7 vec2 uniforms + ~12 ALU. Cache key v11 → v12.

### 3.2 `src/brain/surfaceSampler.ts` + `src/brain/SurfaceComponents.tsx`

**C. UV capture in the sampler.** `sampleSurface` additionally reads the geometry's `uv`
attribute and returns `uv` per sample (barycentric-interpolated). Needed so a 3D chip
seat and its shader keep-out reference the SAME surface point. Small, additive change.

**D. Hub chip family (topography-aware).** One new instanced family `hubIC` (7 instances,
one per region): seated on the region's FLATTEST plateau nearest its centroid (highest
`minFlatness` pass over samples of that region, tie-break by distance to centroid).
Geometry: box body + a thin bright pin-strip box per side (one merged geometry, still
1 draw call). The seat's UV → `uHubUv[region]`, published via `brainRuntime`.

**E. Topography placement rules for existing families** (respecting the user's sparse
directive — counts stay as-is, only PLACEMENT logic changes):
- capacitor cans (`cap`) → prefer LOW-flatness samples (sulci valleys), like the image's
  cans sitting in gaps;
- SMD chips → orientation aligned to the UV lane axis (parallel to trace flow) instead
  of random spin, so parts sit "in the layout" the way the image's do.

### 3.3 Verification (phase gate for each step)

`tools/artdir.mjs` captures (dormant / close / sync) after each phase + one deep-zoom
(`tools/deepzoom.mjs`) for the pad-ratio check: count visible trace ends in a close
frame — accept when ≥ half are circled. Typecheck + production build must stay clean;
tier gating unchanged (stub-dots and ring pads ride the existing octaves, micro octave
still Tier-gated).

## 4. Execution order (single milestone M20, five steps)

1. **Pads + stubs + rings** (shader only) → capture → pad-ratio check.
2. **Sampler UV capture** (pure addition, nothing consumes it yet) → typecheck.
3. **Hub chip family** seated per region + `uHubUv` published → capture (chips at
   region centres, routing still ignores them).
4. **Keep-out + hero buses** in shader (consumes `uHubUv`) → capture (traces now route
   around hubs; each region has its radiating bright buses).
5. **Placement rules** for caps/SMDs + final captures, README M20 entry, commit, push.

Each step compiles and renders on its own — abortable at any phase boundary without
leaving the build broken.

## 5. Budget & constraints

- Draw calls: +1 (hubIC family). Everything else is shader math on existing passes.
- Uniforms: +7 vec2. No new render targets, no new loops, no per-frame allocations.
- "Graphite never glows" holds: pads/stubs are copper diffuse; only routing already
  gated by region activation emits. Hero buses brighten within the existing emissive
  path — no new bloom sources.
- The user's sparse-hardware directive (M13 rollback) is respected: no instance-count
  increases; only placement intelligence.

## 6. Acceptance criteria

- [ ] ≥ 50% of visible trace ends terminate in a circle (dot or ring) at close zoom
- [ ] Short stub-dots visibly branch off runs (image signature)
- [ ] One hub chip per region, seated on that region's flattest plateau
- [ ] Routing suppressed under hubs with a visible island outline; traces flow around
- [ ] 2–3 brighter buses radiate from each hub in the region's colour
- [ ] Capacitor cans favour sulci; SMDs align with trace flow
- [ ] Tiers A/B/C unchanged in structure; typecheck + build clean; zero shader errors
- [ ] Silhouette / far view unchanged — detail reads only on approach
