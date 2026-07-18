import { useEffect, useRef } from 'react'
import { useCortex } from '../state/cortexStore'
import { REGIONS } from '../state/regions'
import { REGION_COLORS } from '../config/palette'
import { screenPoints } from '../interaction/projection'
import { KnowledgePanel } from './KnowledgePanel'
import { slotForOrder } from './ringLayout'
import { useMediaQuery } from './useMediaQuery'

/**
 * DOM overlay: one knowledge panel per selected region in the ring, plus an SVG
 * connector from each lobe's projected screen position to its panel. Panel mount /
 * unmount is React (discrete); connector geometry is updated imperatively in a rAF
 * loop so tracking the moving brain never triggers a re-render.
 */
export function PanelLayer() {
  const selected = useCortex((s) => s.selected)
  const toggleSelected = useCortex((s) => s.toggleSelected)
  const requestFocus = useCortex((s) => s.requestFocus)
  const compact = useMediaQuery('(max-width: 720px)')

  const panelRefs = useRef(new Map<number, HTMLDivElement>())
  const pathRefs = useRef(new Map<number, SVGPathElement>())
  const nodeRefs = useRef(new Map<number, SVGCircleElement>())
  const selectedRef = useRef<number[]>(selected)
  selectedRef.current = selected

  useEffect(() => {
    if (compact || selected.length === 0) return // nothing to track — don't spin a frame loop
    let raf = 0
    const loop = () => {
      const order = selectedRef.current
      for (let i = 0; i < order.length; i++) {
        const id = order[i]
        const panel = panelRefs.current.get(id)
        const path = pathRefs.current.get(id)
        const node = nodeRefs.current.get(id)
        const sp = screenPoints[id]
        if (!panel || !path || !sp) continue

        // The lobe's anchor is on the far side of the brain (rotated out of view) —
        // hide the connector line and node entirely rather than drawing to a point
        // that isn't actually visible on the model.
        path.style.display = sp.visible ? '' : 'none'
        if (node) node.style.display = sp.visible ? '' : 'none'
        if (!sp.visible) continue

        const slot = slotForOrder(i)
        const r = panel.getBoundingClientRect()
        let ax: number
        let ay: number
        if (slot.side === 'left') {
          ax = r.right
          ay = r.top + r.height / 2
        } else if (slot.side === 'right') {
          ax = r.left
          ay = r.top + r.height / 2
        } else {
          ax = r.left + r.width / 2
          ay = r.top
        }

        // Manhattan elbow: panel edge -> horizontal to mid -> vertical -> to lobe.
        const midx = (sp.x + ax) / 2
        path.setAttribute('d', `M ${ax} ${ay} L ${midx} ${ay} L ${midx} ${sp.y} L ${sp.x} ${sp.y}`)
        if (node) {
          node.setAttribute('cx', String(sp.x))
          node.setAttribute('cy', String(sp.y))
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [compact, selected.length])

  if (compact) {
    return (
      <div className="panel-dock">
        {selected.map((id) => (
          <KnowledgePanel
            key={id}
            region={REGIONS[id]}
            palette={REGION_COLORS[id]}
            slot={{ side: 'bottom', style: {} }}
            panelRef={(el) => registerRef(panelRefs, id, el)}
            onClose={() => toggleSelected(id)}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <svg className="connectors" aria-hidden="true">
        {selected.map((id) => {
          const color = REGION_COLORS[id].primary
          return (
            <g key={id}>
              <path
                ref={(el) => registerRef(pathRefs, id, el)}
                className="connector__path"
                pathLength={1}
                stroke={color}
                fill="none"
              />
              <circle
                ref={(el) => registerRef(nodeRefs, id, el)}
                className="connector__node"
                r={4}
                fill={color}
              />
            </g>
          )
        })}
      </svg>

      {selected.map((id, order) => (
        <KnowledgePanel
          key={id}
          region={REGIONS[id]}
          palette={REGION_COLORS[id]}
          slot={slotForOrder(order)}
          panelRef={(el) => registerRef(panelRefs, id, el)}
          onClose={() => toggleSelected(id)}
          onFocus={() => requestFocus(id)}
        />
      ))}
    </>
  )
}

function registerRef<T>(ref: React.MutableRefObject<Map<number, T>>, id: number, el: T | null) {
  if (el) ref.current.set(id, el)
  else ref.current.delete(id)
}
