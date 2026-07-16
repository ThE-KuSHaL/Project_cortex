# Project Cortex — the Engineer's Brain

An interactive 3D **cybernetic brain** that maps an engineer's knowledge into seven
electrically-independent regions. A human-brain GLB is reskinned, entirely in-browser,
into a premium PCB processor: dark graphite substrate, region-coloured circuitry,
travelling data packets, restrained selective bloom — and every lobe is a clickable
knowledge domain.

> Built to the specification in [`docs/`](./docs). The implementation follows it
> faithfully rather than approximating it.

**Stack:** Vite · React 18 · TypeScript · three.js · @react-three/fiber · drei ·
@react-three/postprocessing · zustand · custom GLSL · three-mesh-bvh.

---

## Quick start

```bash
npm install
npm run dev        # → http://localhost:5173
```

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server (opens the app) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |

**How to use it:** hover a lobe (it brightens, a label names its domain), **click** to
open a glassmorphic knowledge panel with a connector line, **click several** to fan out
up to seven panels around the brain and watch it *synchronize*, **click again / ×  / Esc**
to close. **Drag** to orbit, **scroll** to zoom. **Keyboard:** press **Tab** to reveal
the region navigator, arrows/Enter to select, **Esc** to reset. Append `?perf` for an
FPS / tier overlay.

---

## What was built

The project was executed as three phases; implementation (Phase 3) shipped as seven
incremental milestones (M1–M7), each leaving the app fully functional and verified.

### Phase 1 — Understand
- Read all 14 specification documents in `docs/` (two are empty stubs covered elsewhere).
- Reverse-engineered the reference artwork (`assets/brain.png`) into its *engineering
  language* — not to be copied, per `02_reference_analysis.md`.
- Decoded `Brain_port.glb`: pre-segmented into 6 region meshes with a **single Temporal
  mesh spanning both hemispheres**, clean per-region UVs, no tangents, ~60k verts /
  111k tris, and an unlit "solid coloured lobes" texture (the exact anti-pattern the spec
  forbids) — confirming the GLB is a **canvas only**.
- **Surfaced + resolved a real spec conflict:** three docs disagreed on the emissive
  palette; resolved (your decision) to `docs/03_references/reference_colors.md` — the only
  complete per-region 7-colour mapping — keeping `01_design_language.md`'s colour philosophy.

### Phase 2 — Plan
- Designed the architecture via three competing whole-stack proposals scored by an
  adversarial judge panel against the spec's anti-patterns and acceptance tests.
- Winning approach: **bake the hard spatial reasoning, run a thin shader** — one merged
  mesh carrying a per-vertex region id, with every per-region behaviour driven by uniform
  arrays so **colour bleed and packet crossover are structurally impossible**.

### Phase 3 — Implementation (Milestones)

**M1 — Mesh pipeline + dark studio.** Loads the GLB, bakes node transforms, derives the
anatomical axes, and **splits the Temporal mesh into Left/Right on the mid-sagittal plane**
— verified as an exact 7878/7878 triangle split. Tags every vertex with a region id (0–6),
merges to **one BufferGeometry (a single draw call)**, normalizes it. Cinematic
key/fill/rim rig, procedural studio environment, engineered base + energy ring (never
floats), particles, selective bloom, filmic tone mapping applied *after* bloom in linear HDR.

**M2 — Engineered circuitry.** A single `MeshStandardMaterial` patched via
`onBeforeCompile` with **per-region uniform arrays** indexed by the vertex region id.
Crisp **UV-space Manhattan / 45° PCB routing** with hierarchical trace widths, vias and
`fwidth` anti-aliasing; a finer octave up close for reward-on-zoom. Region-coloured
emissive **gated to routing only** (dark-substrate law), travelling packets, white
hotspots, copper diffuse tint, micro roughness, cool fresnel rim.

**M3 — Interaction.** **BVH-accelerated** region picking; hover / select / **multi-select**
(up to 7). Glassmorphic panels in the **7-slot ring** (`LowerLeft → BottomCenter`, centre
always clear) with deploy animation + staggered chips. **Animated Manhattan connectors**
to each lobe's live screen position, a hover label, full keyboard navigation. Driven by
shader-uniform easing in **one `useFrame` — zero per-frame React re-renders**.

**M4 — Synchronization, tiers, hardening.** Knowledge states **Dormant → Awakened →
Expanding → Synchronized** (packets accelerate, the whole brain swells as all seven
activate). **FPS-driven adaptive quality** that downshifts (micro-detail → pixel ratio →
bloom) with hysteresis. Subtle camera focus on the active regions. Error boundary,
`prefers-reduced-motion`, dev perf overlay (`?perf`), inert future seams (`src/future`).

**M5 — Surface detail + responsive.** **Real surface-mounted hardware** — instanced
ceramic chips + copper vias seated flush on the surface via an area-weighted sampler
(two draw calls, tier-gated, non-glowing). **Responsive/mobile:** on narrow viewports
panels stack in a scrollable **bottom dock** and connectors hide, one interaction model.

**M6 — Accessibility + cross-browser + robustness.**
- **Keyboard-first region navigator** (`RegionNav`) — hidden for mouse users, revealed on
  Tab as a legend; focusing a region hovers it, activating toggles it; `aria-pressed`
  conveys state without relying on colour. A polite **live-region announcer** narrates
  activation and the synchronized state. Global `:focus-visible` rings; panels use
  `role="group"`; keyboard handler defers to focused controls.
- **Cross-browser:** WebGL2 preflight with a calm fallback message, **WebGL context-loss
  recovery**, a `color-mix()` `@supports` fallback for older Safari, `-webkit-` backdrop
  filters. Favicon + social/meta tags.

**M7 — Bundle, WCAG polish, acceptance sign-off.**
- **Code-split** into acyclic vendor chunks — app entry **31 KB**, `react` 142 KB,
  `render` 480 KB, `three` core 671 KB — so first load parallelizes and the heavy vendors
  cache across releases. Production source maps dropped.
- **WCAG fixes:** HUD text contrast raised (no stacked opacity), close-button hit area
  30 px, canvas `aria-label`, error screen `role="alert"`, keyboard hint in the HUD.
- **Perf/correctness:** tier-aware HDRI resolution, instanced-resource disposal, connector
  rAF paused when no panels are open, NaN guard on projection.

### Art-direction log (architecture frozen — tuning only)

> From M8 on, no systems are redesigned. Each pass tunes existing shader/rig/UI constants
> toward the reference's engineering language, verified by eye across dormant / close /
> synchronized, with the build and vendor chunks byte-identical each time.

**M8 — Routing field.** _(2026-07-08)_ With the architecture
frozen, the routing field was tuned toward the reference's engineering language — no new
systems, no perf regressions. The `cortexRoute` layer gained a per-octave **density**
parameter so coarse buses stay bold and sparse while finer octaves pack the substrate as
dim fabrication texture ("almost no empty areas"). Four octaves (7 / 16 / 34 / 72) with
thinner widths read as fine PCB routing rather than wide ribbons; vias are denser; **idle
luminance raised** (0.20 → 0.34) so dormant circuitry still reads as live, while the
hover/select step-up stays clearly larger. Bloom threshold nudged 0.70 → 0.62 to catch
the routing without ever letting the graphite/copper structure glow. The finest octave
remains gated behind `uMicroDetail`, so **Tier C mobile still runs exactly three
octaves** — the performance contract is unchanged.

**M9 — Material, lighting & grade.** _(2026-07-08)_ Second tuning pass, targeting the
reference docs' explicit material/lighting directives (`03_references/reference_*.md`):
- **Critical rim separation.** The structural cool fresnel rim (authored on the surface,
  so it reads from every angle without a positioned light) was strengthened
  (0.12 → 0.24, tighter falloff), and the backlight rig gained a **brighter primary cool
  rim** plus a **second low rim on the opposite shoulder** — the silhouette no longer
  dissolves into the void from any angle. This also delivers the spec's AO intent
  (emphasize folds / routing channels / seams) through edge light rather than a new pass.
- **Machined substrate.** Graphite nudged toward "subtle metallic response, soft ambient
  reflections" (metalness 0.28 → 0.34, envMapIntensity 0.6 → 0.85) so it reads as PCB
  substrate catching the studio env, not matte clay — while still never emitting.
- **Grade.** Deeper vignette (0.72 → 0.82) for the spec's "slightly dark overall,
  background one level darker," pulling focus to the brain.
- **Cost:** one extra non-shadow directional light and a slightly stronger fresnel term —
  no new geometry, no new render pass. Build and chunks unchanged; verified across
  dormant / close / synchronized.

**M10 — Environment & atmosphere.** _(2026-07-09)_ Third tuning pass, grounding the brain
in a laboratory space (docs/02 composition, docs/08 background illumination):
- **Instrument floor.** The base gained two outer **concentric HUD rings** at larger radii
  (reusing the existing additive energy-ring pattern), each breathing on a staggered
  phase — the dock now reads as a live instrument pedestal expanding outward, not a
  saucer. The brain sits at the centre of something engineered.
- **Background atmosphere.** A single inward-facing sphere with a cheap radial-gradient
  shader (`Atmosphere.tsx`) adds the reference's faint cool haze pooling behind and above
  the subject, falling to true void at the edges — depth without a visible light source.
  Renders first, writes no depth, no per-frame work, stays below the bloom threshold.
- **Particle grade.** Dust nudged very slightly larger/cooler and a touch more
  transparent so it reads as energy in the volume without ever becoming fireflies.
- **Cost:** one static gradient sphere (trivial shader) + two static ring meshes animated
  inside the base's existing `useFrame`. No new pass, no new per-frame loop. Build and
  chunks unchanged; verified across dormant / close / synchronized.

**M11 — Panel / HUD visual language.** _(2026-07-09)_ Fourth tuning pass, bringing the
knowledge cards up to the reference's "floating technical instrument" language
(`reference_ui.md`):
- **Hexagon node glyph.** Each panel head now carries a minimal region-coloured hexagon
  icon (the reference's per-card instrument mark), with a soft coloured drop-shadow — a
  card now reads unmistakably as a *knowledge node*, reinforcing colour-as-information
  without adding noise.
- **Thin illuminated edge.** A crisp region-coloured luminous seam along each card's
  leading edge (the spec's "thin illuminated border"), and the head re-laid as a glyph +
  text row.
- **Cost:** pure DOM/CSS — one inline SVG + a few style rules. No JS, no 3D, no perf
  impact. `color-mix()` fallback path already covers older Safari.

**M12 — Motion choreography.** _(2026-07-09)_ Fifth tuning pass, making idle / hover /
select feel like one coherent, intentional system (docs/07 animation + reference_ui):
- **Hover vs. select now feel distinct.** The easing was a single rate for both; it is now
  split — **hover is snappy** (~0.1s, a light immediate touch) while **selection deploys
  deliberately** (~0.28s, a weighty power-up that never pops). Two gestures, two feels.
- **Local packet acceleration.** Packet cadence now rises with a region's *own* activation
  (`vActiveMix`), not just the scene-wide mean — so hovering a lobe visibly quickens *its*
  packets right where the user is looking (the spec's "hover increases packet activity").
- **Consistent reduced-motion.** The idle scale-breath now respects
  `prefers-reduced-motion` alongside the drift/rotation it already honoured.
- **Cost:** two easing constants + one shader term. No new loop, no new uniform. Build and
  chunks unchanged.

**M13 — Real geometry: 100× surface hardware.** _(2026-07-10)_ Per an explicit directive to
add real 3D *structure* (not more texturing), `SurfaceComponents` was expanded from 2
instanced families / ~150 parts to **8 families / ~16,000 real seated hardware pieces
(≈108×)** — large ICs, dense SMD chips, copper vias, connector pads, capacitor cans,
oscillator crystals, heatsink fins and micro solder beads, each oriented to the surface
normal:
- **Architecture-safe scale.** Every family is one `InstancedMesh`, so the whole ~16k-part
  fabrication is **8 draw calls total** regardless of instance count — draw calls scale with
  families, not parts. No new system; the existing instancing + `sampleSurface` seat path is
  reused, with a new per-family flatness tolerance so tiny parts fill the sulci while large
  chips stay on plateaus.
- **Tier-scaled + passive.** Tier A gets the full fabrication, Tier B ~45%, Tier C skips the
  layer. All parts are neutral structural PBR (ceramic / copper / titanium / steel) and
  **never emit**, so "graphite never glows" and the emissive-routing hierarchy hold.
- **Rewards zoom.** The orbit zoom floor dropped (2.3 → 1.75) so continuous close inspection
  actually resolves the parts — far view still reads as silhouette + glow + fine texture;
  on zoom, thousands of discrete components appear (docs/02, docs/13).
- **Cost:** ~300k added triangles across 8 draw calls, computed once at mount, no per-frame
  work. Procedural — zero bundle-size change.

**M14 — Acceptance execution + docs status.** _(2026-07-10)_ Executed
`docs/13_acceptance_tests.md` as a multi-dimension audit with an adversarial verify pass
(results in `docs/13_acceptance_results.md`): **60 PASS · 6 PARTIAL · 0 FAIL (1 found, fixed)
· 3 live-only MANUAL · 0 overturned.** The one real defect — `ErrorBoundary` over-claiming
shader-compile coverage it structurally can't provide — was fixed with a guarded
`onBeforeCompile` that degrades to standard PBR on failure. `docs/14_future_expansion.md` is
a forward-looking roadmap; its requirements on the *current* codebase are met — the
extension seams exist (`src/future/index.ts`) and its near-term items are already shipped
(reduced-motion, adaptive quality tiers + FPS downshift, keyboard-first nav). Its
speculative modes (GitHub / AI assistant / timeline / patents) are intentionally deferred,
as the doc itself directs ("nothing runs until a mode is actually built").

**Docs status: all 21 specification markdowns executed.** Core specs (00–12) built in
M1–M7; reference specs art-directed in M8–M13; acceptance (13) executed in M14; future
roadmap (14) satisfied at the architecture level.

**M15 — modification_02: hover fix, computational packets, laboratory pedestal.**
_(2026-07-10)_ Executed `docs/modification 2.md` (feature-freeze art direction):
- **Hover defect fixed with a boost clock.** Hover previously accelerated packets via a
  time-multiplier, which bursts on transition then visually fades. Packets now advance on
  a per-region clock `uTime + uBoost[region]`; while hovered the CPU advances that
  region's clock faster (+45%, select +60%) so cadence stays elevated for the **entire**
  hover and eases back only on exit. Acceleration ~50% of the old value — confident, not
  aggressive.
- **Computational packets.** A second asynchronous priority lane (~⅓ of cells, 1.8×
  speed, offset phase) breaks synchronization — traffic reads as scheduled computation.
- **Laboratory pedestal (5 layers).** Graphite structural base → brushed-titanium primary
  ring with 72 machined radial grooves (instanced, 1 draw call) → procedural **PCB circuit
  disc** (concentric buses, radial traces, vias, 9 async blinking status LEDs — one cheap
  shader, zero extra draw calls) → recessed cyan energy ring → calibration ring with 120
  engraved ticks (instanced) + a slow 24s holographic sweep arc.
- **Powered mount.** The stem is now a segmented assembly (titanium collar → carbon column
  → titanium neck) with an emissive **power conduit ring that travels upward** on the pulse
  clock — the platform visibly powers the brain.
- **Cost:** +2 instanced meshes, +1 trivial shader disc, +4 small meshes. No architecture
  change; tiers unaffected. Build clean, chunks unchanged.

**M16 — EDA-grade routing, silkscreen, material split.** _(2026-07-10)_ The routing field
now follows `circuit_reference.png`'s manufacturing topology:
- **45°-dominant orientation set.** Cells route straight, on *both* 45° diagonals, or with
  the EDA signature **mid-cell 45° jog** (a run that elbows at centre). Constant trace
  width everywhere — never organic strokes.
- **Parallel bus pairs.** ~30% of cells carry a companion trace at constant 3×-width
  spacing — the parallel-routing signature of professional PCB layout (visible as the
  multi-lane buses in the captures).
- **Silkscreen inspection markings.** Sparse printed dashes and tiny pads on a fine 96×
  grid (micro tier only, non-emissive, off-routing) — the "tiny engraved identifiers"
  reward-on-zoom layer.
- **Material differentiation.** Copper routing is now physically distinct from substrate:
  polished (roughness → 0.32) and metallic (→ 0.9) via a metalness-chunk injection, while
  bare graphite carries a faint **carbon-fiber cross-hatch** in its roughness. Trace
  highlights now read as metal, not paint.
- **Cost:** shader-only (cache v9). Build clean, chunks unchanged.

---

## Acceptance & audit

A five-reviewer adversarial audit (acceptance tests, anti-patterns, accessibility,
performance, correctness) plus a synthesis pass was run against `docs/13` and the design
docs. Results:

- **Anti-patterns: zero detected** — full compliance with `01_design_language.md` /
  `02_reference_analysis.md` (dark substrate, colour = information, emissive isolated to
  routing, restrained localized bloom, no solid lobes / plastic / chrome / rainbow /
  fireflies).
- **Visual, mesh, material, shader, animation, lighting, UI, interaction, camera** —
  all pass on inspection.
- **Accessibility** — the audit's only blockers were missing a11y styling; **fixed in
  M6/M7** (region navigator, live region, focus rings, contrast, target sizes).
- **Performance/bundle** — code-splitting, tier-aware env, disposal and rAF findings
  **addressed in M7**.

### Verified
Build clean · TypeScript clean · mesh pipeline unit-checked (exact Temporal 50/50 split) ·
runs headlessly with **zero shader/page errors** across idle, hover, multi-select, the
full 7-region Synchronized state, zoomed-in (surface hardware), mobile dock, and
keyboard-navigator states — each captured via the harness in `tools/`.

### Honest open items (require your hardware / devices)
- **Real-GPU frame rate** — headless tests ran on software SwiftShader (which correctly
  triggered the adaptive downshift). Confirm the 60–120 fps Tier-A target on your GPU via `?perf`.
- **Real Safari + touch devices** — code paths exist (WebGL2, `-webkit-` filters, pointer
  events, pinch via orbit controls) but want a pass on physical devices.
- Surface chips are intentionally subtle; can be tuned brighter on request.

---

## Architecture (`src/`, 37 modules)

Every rendering system is independently maintainable, as the spec requires.

```
config/       palette.ts (colour source of truth) · quality.ts (perf tiers)
state/        regions.ts (fixed 7-region model) · cortexStore.ts (discrete interaction)
              · qualityStore.ts (adaptive quality)
brain/        processBrainGeometry.ts (mesh pipeline) · masterMaterial.ts (shader)
              · BrainMesh.tsx · surfaceSampler.ts · SurfaceComponents.tsx · brainRuntime.ts
scene/        CortexCanvas · Stage · Lighting · BasePlatform · Particles · Effects
              · RegionProjector · HoverLabel
interaction/  bvh.ts · projection.ts · useKeyboard.ts
systems/      CameraRig.tsx        engine/  PerfMonitor.tsx
ui/           PanelLayer · KnowledgePanel · ringLayout · Hud · PerfOverlay · ErrorBoundary
              · RegionNav · Announcer · useMediaQuery
future/       index.ts (documented, inert expansion seams)
tools/        screenshot.mjs · shot-interact.mjs · shot-sync.mjs · shot-m5.mjs
              · shot-a11y.mjs (dev-only verification harnesses)
```

### The seven regions
Frontal → Programming Languages (blue) · Parietal → Frameworks (green) · Left Temporal →
Core CS (amber) · Right Temporal → AI (purple) · Occipital → Design & Dev Tools (cyan) ·
Cerebellum → Cloud & DevOps (red) · Brainstem → IoT & Hardware (gold).

---

## Beyond

The seven-region core is complete and hardened. Future modes (project explorer, timeline,
GitHub, AI assistant — `docs/14`) slot into the reserved `src/future` seams without a
redesign. Optional fidelity work: move routing generation into an offline `npm run bake`
step for tighter 45°/90° control, and per-region packet flow-maps.

> `puppeteer` is a dev-only screenshot/verification harness — not required to run the app.
> Remove with `npm remove puppeteer`.
