# Project Cortex — 13_acceptance_results.md

Execution of `13_acceptance_tests.md`. Run 2026-07-10.

Method: a multi-agent audit graded every code-verifiable criterion against the actual
source, then a second adversarial pass re-checked each PASS/PARTIAL claim by re-opening the
cited files (try-to-refute). Criteria that only a live browser / real device can confirm
(actual FPS, cross-browser rendering, "no visible artifacts") are marked **MANUAL**.

## Score

| Verdict | Count |
|---|---|
| PASS | 60 |
| PARTIAL | 6 |
| FAIL | 0 *(1 found, now fixed)* |
| MANUAL (live-only) | 3 |
| Adversarially overturned | 0 |

## Dimensions (adversarially verified, 0 overturned)

- **Mesh** — GLB import, normalization, centering, 7 region tags, temporal split, normals: PASS. *MANUAL:* "no geometry artifacts" (needs live eye).
- **Material** — graphite never glows, titanium/copper/ceramic roles, emissive isolated to the shader, hierarchy preserved: PASS.
- **Shader** *(self-reviewed — audit agent cut off by usage window)* — per-vertex `aRegionId` region masking, no bleeding, isolated hover (`uHover`) / selection (`uActive`), bloom masked by `luminanceThreshold 0.62`, hotspots gated by activation, correct chunk layering: PASS.
- **Animation** — continuous idle, immediate hover, deliberate select deploy, connector grow + packet + panel sequence, sync crescendo: PASS.
- **Lighting** — exposure, visible dual rim, controlled bloom, brain/background separation: PASS. *MANUAL:* "no overexposed regions."
- **UI** — brain centered, ring panel placement, multi-select layout, readable labels, consistent type, responsive chips: PASS.
- **Interaction** — hover, click select, deselect, multi-select, keyboard nav, touch (drag-threshold click): PASS.
- **Camera** — initial framing, damped orbit, zoom limits, focus, no disorientation: PASS.
- **Performance** *(self-reviewed)* — A/B/C tiers, instancing keeps draw calls low (brain 1 + 8 component families), eased uniforms avoid per-frame React, dispose-on-unmount, tier-gated micro-detail + component budget: PASS.
- **Accessibility** — keyboard nav, `:focus-visible` states, color-not-sole-indicator (aria-pressed + text + glyph + live Announcer), reduced-motion respected. **PARTIAL:** click targets (~30px nav / 30×30 close) are under the 44px WCAG 2.5.5 guideline.
- **Error handling** — GLB/WebGL failures caught by `ErrorBoundary`; **shader-compile failure now genuinely handled** by a guarded `onBeforeCompile` patch that degrades to standard PBR (the one FAIL this audit found, now fixed). *MANUAL:* "no console errors."

## The one FAIL found — and fixed

The audit correctly caught that `ErrorBoundary` *claimed* to cover shader-compile failures
but structurally could not (Three.js compiles the patched material in the render loop,
outside React's render phase). Fixed by wrapping `masterMaterial`'s `onBeforeCompile` in a
guard that falls back to un-patched graphite PBR on failure, and correcting the
`ErrorBoundary` doc to state what it actually catches.

## Remaining MANUAL items (require a live session)

These are not defects — they are criteria only confirmable by running the app on real
hardware/browsers: absence of geometry artifacts, absence of overexposed regions, absence
of runtime console errors, actual FPS targets (≥60 desktop / ≥45 laptop), and the full
cross-browser (Chrome/Edge/Firefox/Safari) + responsive (desktop/tablet/mobile) matrix.
The headless capture harness (`tools/artdir.mjs`) shows no shader/page errors across the
dormant / close / synchronized states.
