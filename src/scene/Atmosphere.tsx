import { useMemo } from 'react'
import { BackSide, ShaderMaterial, Color } from 'three'

/**
 * Background atmosphere (docs/08 + 02): the void is the canvas, but the reference is not
 * dead-flat black — it carries a faint cool lift behind the subject that falls off to
 * pure black at the edges, giving depth without ever becoming a visible light source.
 *
 * A single inward-facing sphere with a cheap radial gradient shader. No lighting, no
 * bloom participation (kept well below threshold), no per-frame work. Renders first and
 * writes no depth so everything draws in front of it.
 */
export function Atmosphere() {
  const material = useMemo(() => {
    return new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uInner: { value: new Color('#0c1622') }, // faint cool haze behind the brain
        uOuter: { value: new Color('#050608') }, // the true void at the edges
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uInner;
        uniform vec3 uOuter;
        varying vec3 vDir;
        void main() {
          // Vertical-ish falloff biased slightly above the horizon: the haze pools behind
          // and just above the brain, the way a soft backlight fills a dark studio.
          float h = clamp(vDir.y * 0.5 + 0.62, 0.0, 1.0);
          float glow = pow(1.0 - abs(vDir.y - 0.15), 3.0);
          vec3 c = mix(uOuter, uInner, clamp(h * 0.5 + glow * 0.6, 0.0, 1.0));
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    })
  }, [])

  return (
    <mesh scale={40} renderOrder={-1} frustumCulled={false} material={material}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  )
}
