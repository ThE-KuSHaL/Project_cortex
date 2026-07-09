import { useEffect, useRef, useState } from 'react'
import { useQuality } from '../state/qualityStore'

/**
 * Dev-only FPS/quality readout. Enable with ?perf in the URL or
 * localStorage.setItem('__CORTEX_PERF','1'). Invisible to visitors.
 */
function perfEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const url = new URLSearchParams(window.location.search)
  return url.has('perf') || window.localStorage.getItem('__CORTEX_PERF') === '1'
}

export function PerfOverlay() {
  const [enabled] = useState(perfEnabled)
  const [fps, setFps] = useState(0)
  const level = useQuality((s) => s.level)
  const frames = useRef({ t: performance.now(), n: 0 })

  useEffect(() => {
    if (!enabled) return
    let raf = 0
    const loop = () => {
      const f = frames.current
      f.n++
      const now = performance.now()
      if (now - f.t >= 500) {
        setFps(Math.round((f.n * 1000) / (now - f.t)))
        f.t = now
        f.n = 0
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [enabled])

  if (!enabled) return null
  return (
    <div className="perf-overlay">
      {fps} fps · tier {level === 0 ? 'A' : level === 1 ? 'B' : 'C'}
    </div>
  )
}
