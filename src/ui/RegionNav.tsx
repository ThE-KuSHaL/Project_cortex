import { useCortex } from '../state/cortexStore'
import { REGIONS } from '../state/regions'
import { REGION_COLORS } from '../config/palette'

/**
 * Accessible, keyboard-first navigation of the seven regions (docs/13 accessibility:
 * every mouse interaction must work by keyboard, with visible focus).
 *
 * Visually hidden for mouse users, but Tab reveals it (`:focus-within`) as a compact
 * legend. Focusing a region hovers it (lighting the lobe + its 3D label); activating it
 * toggles selection. `aria-pressed` conveys state without relying on colour alone.
 */
export function RegionNav() {
  const selected = useCortex((s) => s.selected)
  const setHovered = useCortex((s) => s.setHovered)
  const toggle = useCortex((s) => s.toggleSelected)

  return (
    <nav className="region-nav" data-region-nav aria-label="Knowledge regions">
      <ul className="region-nav__list">
        {REGIONS.map((r) => {
          const on = selected.includes(r.id)
          return (
            <li key={r.id}>
              <button
                type="button"
                className="region-nav__btn"
                style={{ ['--accent' as string]: REGION_COLORS[r.id].primary }}
                aria-pressed={on}
                aria-label={`${r.knowledge} — ${r.name} lobe${on ? ', active' : ''}`}
                onFocus={() => setHovered(r.id)}
                onBlur={() => setHovered(null)}
                onMouseEnter={() => setHovered(r.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => toggle(r.id)}
              >
                <span className="region-nav__dot" style={{ background: REGION_COLORS[r.id].primary }} />
                <span className="region-nav__name">{r.knowledge}</span>
                <span className="region-nav__state" aria-hidden="true">
                  {on ? '●' : '○'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
