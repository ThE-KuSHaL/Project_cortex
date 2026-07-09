import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Points } from 'three'

/**
 * Ambient computational dust (docs/07): very small, slow, sparse, independent.
 * Never fireflies/snow/sparks. Suggests energy in the volume around the brain.
 */
export function Particles({ count = 320 }: { count?: number }) {
  const ref = useRef<Points>(null)

  const geometry = useMemo(() => {
    const g = new BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // distribute in a shell around the brain
      const r = 1.7 + Math.random() * 1.9
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.7
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    g.setAttribute('position', new Float32BufferAttribute(pos, 3))
    return g
  }, [count])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += Math.min(delta, 0.1) * 0.012
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.05
    }
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.018}
        color="#b8d2ff"
        transparent
        opacity={0.42}
        sizeAttenuation
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
