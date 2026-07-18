import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, ShaderMaterial, Color } from 'three'

/**
 * Background atmosphere (docs/08 + 02 + modification_02): the void is the canvas, but
 * the reference is not dead-flat black — it carries a faint cool lift behind the subject
 * that falls off to pure black at the edges, giving depth without ever becoming a
 * visible light source. On top: an OCCASIONAL horizontal scanning line — a thin, very
 * faint band that sweeps up the backdrop every ~9s (holographic inspection sweep), and
 * tiny static background data points. Both stay far below bloom threshold; the
 * environment supports the brain, it never competes with it.
 *
 * A single inward-facing sphere with a cheap gradient shader. No lighting, no bloom
 * participation, one uniform write per frame. Renders first and writes no depth.
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
        uTime: { value: 0 },
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
        uniform float uTime;
        varying vec3 vDir;

        float ah(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        void main() {
          // Vertical-ish falloff biased slightly above the horizon: the haze pools behind
          // and just above the brain, the way a soft backlight fills a dark studio.
          float h = clamp(vDir.y * 0.5 + 0.62, 0.0, 1.0);
          float glow = pow(1.0 - abs(vDir.y - 0.15), 3.0);
          vec3 c = mix(uOuter, uInner, clamp(h * 0.5 + glow * 0.6, 0.0, 1.0));

          // Occasional scanning line: a thin band sweeping bottom->top over ~2.2s of a
          // 9s cycle, gated so it's absent most of the time. Very faint, cool cyan.
          float cyc = fract(uTime / 9.0);
          float scanY = -0.6 + cyc * 4.4; // sweeps through view then rests off-screen
          float scan = (1.0 - smoothstep(0.002, 0.012, abs(vDir.y - scanY)));
          c += vec3(0.10, 0.22, 0.30) * scan * 0.16;

          // Tiny static background data points (holographic dust), extremely sparse.
          vec2 cell = floor(vDir.xy * 60.0 + vDir.z * 13.0);
          float dot_ = step(0.995, ah(cell)) * ah(cell + 7.7);
          c += vec3(0.14, 0.20, 0.26) * dot_ * 0.25;

          gl_FragColor = vec4(c, 1.0);
        }
      `,
    })
  }, [])
  const mat = useRef(material)

  useFrame((state) => {
    mat.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh scale={40} renderOrder={-1} frustumCulled={false} material={material}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  )
}
