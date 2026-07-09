import { useCortex } from '../state/cortexStore'

/**
 * Minimal instrument HUD (docs/09). The brain is the interface; this only frames it.
 * Interactive knowledge panels, connectors and labels arrive in the interaction milestone.
 */
function stageLabel(active: number): string {
  if (active === 0) return 'Dormant'
  if (active === 1) return 'Awakened'
  if (active >= 7) return 'Synchronized'
  return 'Expanding'
}

export function Hud() {
  const active = useCortex((s) => s.selected.length)
  return (
    <div className="hud">
      <header className="hud__heading">
        <h1 className="hud__title">Engineer&rsquo;s Brain</h1>
        <p className="hud__subtitle">Interactive Knowledge Architecture</p>
        <p className="hud__lede" style={{ opacity: active > 0 ? 0 : undefined }}>
          A cybernetic processor whose regions map an engineer&rsquo;s knowledge. Every
          illuminated pathway is computation — not decoration.
        </p>
      </header>

      <div className="hud__hint">
        {active > 0
          ? 'Click a region to close · Esc to reset'
          : 'Hover a region · Click to explore · Tab for keyboard'}
      </div>
      <div className="hud__status">
        {stageLabel(active).toUpperCase()} &middot; {active} / 7 active
      </div>
    </div>
  )
}

export function LoadingOverlay() {
  const ready = useCortex((s) => s.ready)
  return (
    <div className="loader" style={{ opacity: ready ? 0 : 1, pointerEvents: ready ? 'none' : 'auto' }}>
      <div className="loader__inner">
        <div className="loader__ring" />
        <div className="loader__label">Initializing Cortex</div>
      </div>
    </div>
  )
}
