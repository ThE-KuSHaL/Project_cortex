import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { AdditiveBlending, MeshStandardMaterial, Color, DoubleSide } from 'three'
import { STRUCTURAL } from '../config/palette'

/**
 * The engineered dock the brain is mounted to (docs/04 + 01: never floats).
 * Graphite disc + titanium bevel + frosted glass inset + concentric energy rings (the
 * only emission the base is allowed) that expand outward like a laboratory HUD floor,
 * each breathing on a staggered phase so the pedestal reads as live instrumentation.
 */
export function BasePlatform() {
  const ringMat = useRef<MeshStandardMaterial>(null)
  const halo1 = useRef<MeshStandardMaterial>(null)
  const halo2 = useRef<MeshStandardMaterial>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ringMat.current) {
      ringMat.current.emissiveIntensity = 0.7 + Math.sin(t * 0.7) * 0.18
    }
    // Outer HUD rings: dimmer, slower, phase-staggered — a floor that breathes.
    if (halo1.current) halo1.current.emissiveIntensity = 0.34 + Math.sin(t * 0.5 + 1.1) * 0.12
    if (halo2.current) halo2.current.emissiveIntensity = 0.20 + Math.sin(t * 0.4 + 2.3) * 0.08
  })

  return (
    <group position={[0, -1.32, 0]}>
      {/* Graphite disc */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[1.55, 1.75, 0.16, 96]} />
        <meshStandardMaterial color={STRUCTURAL.graphite} metalness={0.5} roughness={0.55} />
      </mesh>

      {/* Titanium bevel ring */}
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.045, 24, 120]} />
        <meshStandardMaterial color={STRUCTURAL.titanium} metalness={0.85} roughness={0.35} />
      </mesh>

      {/* Frosted glass inset */}
      <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.45, 96]} />
        <meshStandardMaterial
          color="#0c1118"
          metalness={0.1}
          roughness={0.15}
          transparent
          opacity={0.55}
          side={DoubleSide}
        />
      </mesh>

      {/* Concentric energy ring (bloom-eligible) */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.2, 128]} />
        <meshStandardMaterial
          ref={ringMat}
          color="#0a1420"
          emissive={new Color('#57b6ff')}
          emissiveIntensity={1.2}
          transparent
          opacity={0.9}
          blending={AdditiveBlending}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer concentric HUD rings — flat on the floor, expanding beyond the dock, so
          the brain sits at the centre of a laboratory instrument rather than on a saucer.
          Thin, dim and additive: pure atmosphere, never competing with the routing. */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.85, 1.87, 160]} />
        <meshStandardMaterial
          ref={halo1}
          color="#0a1420"
          emissive={new Color('#4f9fe6')}
          emissiveIntensity={0.34}
          transparent
          opacity={0.55}
          blending={AdditiveBlending}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.35, 2.36, 180]} />
        <meshStandardMaterial
          ref={halo2}
          color="#0a1420"
          emissive={new Color('#3f7fc0')}
          emissiveIntensity={0.2}
          transparent
          opacity={0.4}
          blending={AdditiveBlending}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Titanium mount stem so the brainstem meets the dock */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 0.8, 32]} />
        <meshStandardMaterial color={STRUCTURAL.titanium} metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  )
}
