import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { useQuality } from '../state/qualityStore'

/**
 * Samples FPS in 1s windows and downshifts quality after two sustained low windows,
 * with a cooldown so it never flip-flops (docs/12 adaptive ladder + hysteresis).
 * Downshift order: micro-detail -> pixel ratio -> bloom.
 */
export function PerfMonitor() {
  const gl = useThree((s) => s.gl)
  const acc = useRef({ t: 0, frames: 0, low: 0, cooldown: 0 })

  useFrame((_, dt) => {
    const a = acc.current
    a.t += dt
    a.frames++
    a.cooldown -= dt
    if (a.t < 1) return

    const fps = a.frames / a.t
    a.t = 0
    a.frames = 0

    const q = useQuality.getState()
    if (fps < 45 && q.level < 2 && a.cooldown <= 0) {
      a.low++
      if (a.low >= 2) {
        q.downshift()
        const nq = useQuality.getState()
        gl.setPixelRatio(Math.min(window.devicePixelRatio, nq.dpr))
        a.low = 0
        a.cooldown = 3
      }
    } else if (fps >= 48) {
      a.low = 0
    }
  })

  return null
}
