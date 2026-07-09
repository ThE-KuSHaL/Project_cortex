/**
 * Project Cortex — reserved expansion seams (docs/14_future_expansion.md).
 *
 * These are intentionally inert. The seven-region core never changes; a future mode is
 * added by supplying a panel type + an update system + (optionally) a post pass, all of
 * which slot into the existing architecture:
 *
 *   - new knowledge/skills           -> extend state/regions.ts (contents only)
 *   - a new panel kind               -> a new component rendered by ui/PanelLayer.tsx
 *   - a new animated subsystem       -> a component with its own useFrame, mounted in Stage
 *   - a new render effect            -> a pass added to scene/Effects.tsx
 *   - external data (GitHub, etc.)   -> a lazy-loaded module under src/future/<mode>
 *
 * Documented, not stubbed — nothing here runs until a mode is actually built.
 */
export const FUTURE_MODES = [
  'projectMode',
  'timeline',
  'github',
  'research',
  'patents',
  'aiAssistant',
] as const

export type FutureMode = (typeof FUTURE_MODES)[number]
