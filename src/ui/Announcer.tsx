import { useEffect, useRef, useState } from 'react'
import { useCortex } from '../state/cortexStore'
import { REGIONS, REGION_COUNT } from '../state/regions'

/**
 * Screen-reader live region: announces activation / deactivation and the synchronized
 * state so non-visual users follow the interaction (docs/13 accessibility).
 */
export function Announcer() {
  const selected = useCortex((s) => s.selected)
  const prev = useRef<number[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const added = selected.filter((id) => !prev.current.includes(id))
    const removed = prev.current.filter((id) => !selected.includes(id))
    let msg = ''
    if (selected.length >= REGION_COUNT) msg = 'All seven knowledge regions synchronized'
    else if (added.length) msg = `${REGIONS[added[0]].knowledge} activated. ${selected.length} of ${REGION_COUNT} regions active.`
    else if (removed.length) msg = `${REGIONS[removed[0]].knowledge} deactivated. ${selected.length} of ${REGION_COUNT} regions active.`
    if (msg) setMessage(msg)
    prev.current = selected
  }, [selected])

  return (
    <div className="sr-only" aria-live="polite" role="status">
      {message}
    </div>
  )
}
