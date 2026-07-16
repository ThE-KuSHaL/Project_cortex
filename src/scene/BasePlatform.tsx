import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  DoubleSide,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  ShaderMaterial,
} from 'three'
import { STRUCTURAL } from '../config/palette'

/**
 * The engineered dock the brain is mounted to (docs/04 + 01 + modification_02): a
 * laboratory-grade pedestal built in layers —
 *   L1 structural graphite base (heavy, rough)
 *   L2 brushed titanium primary ring + machined radial grooves (instanced, 1 draw call)
 *   L3 PCB circuit disc: procedural radial routing, vias and blinking status LEDs in ONE
 *      cheap shader (zero extra draw calls for the detail)
 *   L4 recessed energy ring, soft cyan, slow pulse (the only strong emission)
 *   L5 calibration ring: engraved ticks (instanced) + a slow rotating sweep arc
 * plus a segmented mechanical mount whose power conduit travels upward on the same pulse
 * clock — the platform visually powers the brain.
 */

const TAU = Math.PI * 2

function makeCircuitDiscMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;

      float h21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        vec2 c = vUv - 0.5;
        float r = length(c) * 2.0;            // 0 centre -> 1 rim
        float ang = atan(c.y, c.x);           // -pi..pi

        vec3 base = vec3(0.043, 0.055, 0.070); // dark substrate
        vec3 copper = vec3(0.30, 0.17, 0.075);
        vec3 trace = vec3(0.0);

        // Concentric distribution traces (quantized radii, constant width).
        float ringId = floor(r * 22.0);
        float ringD = abs(fract(r * 22.0) - 0.5);
        float ringOn = step(0.35, h21(vec2(ringId, 3.7)));
        float ring = ringOn * (1.0 - smoothstep(0.06, 0.11, ringD));

        // Radial local traces with a 45-degree-style jog (angle shifts by ring band).
        float sector = ang / 6.2831853 + 0.5;
        float jog = (h21(vec2(ringId, 9.1)) - 0.5) * 0.02;
        float spokes = fract((sector + jog) * 96.0);
        float spokeD = abs(spokes - 0.5);
        float spokeOn = step(0.55, h21(vec2(floor((sector + jog) * 96.0), ringId)));
        float spoke = spokeOn * (1.0 - smoothstep(0.10, 0.18, spokeD)) * step(0.12, r) * (1.0 - step(0.97, r));

        float routing = max(ring * step(0.12, r), spoke * ring); // spokes live between rings

        // Vias where spokes meet rings.
        float via = spokeOn * ringOn * (1.0 - smoothstep(0.05, 0.09, length(vec2(spokeD * 0.6, ringD))));

        // Blinking status LEDs at fixed polar seats (async phases via hash).
        float led = 0.0;
        for (int i = 0; i < 9; i++) {
          float fi = float(i);
          float lr = 0.30 + h21(vec2(fi, 1.3)) * 0.62;
          float la = h21(vec2(fi, 7.7)) * 6.2831853;
          vec2 seat = vec2(cos(la), sin(la)) * lr * 0.5;
          float d = length(c - seat);
          float blink = smoothstep(0.35, 0.9, sin(uTime * (0.6 + h21(vec2(fi, 2.2)) * 1.7) + fi * 2.1) * 0.5 + 0.5);
          led += (1.0 - smoothstep(0.006, 0.012, d)) * blink;
        }

        vec3 col = base;
        col = mix(col, copper, clamp(routing, 0.0, 1.0) * 0.85);
        col += copper * via * 0.9;
        col += vec3(0.20, 0.55, 0.75) * routing * 0.06;   // faint cyan energize, below bloom
        col += vec3(0.35, 0.9, 1.0) * led * 0.5;          // LEDs: visible, still restrained

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
}

export function BasePlatform() {
  const ringMat = useRef<MeshStandardMaterial>(null)
  const halo1 = useRef<MeshStandardMaterial>(null)
  const halo2 = useRef<MeshStandardMaterial>(null)
  const sweep = useRef<Mesh>(null)
  const conduit = useRef<Mesh>(null)
  const conduitMat = useRef<MeshStandardMaterial>(null)
  const circuitMat = useMemo(makeCircuitDiscMaterial, [])

  // Machined radial grooves (L2) + calibration ticks (L5) — two instanced meshes.
  const { grooveGeo, grooveMat, grooveMatrices, tickGeo, tickMat, tickMatrices } = useMemo(() => {
    const obj = new Object3D()
    const grooves: Matrix4[] = []
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * TAU
      obj.position.set(Math.cos(a) * 1.52, 0.082, Math.sin(a) * 1.52)
      obj.rotation.set(0, -a, 0)
      obj.scale.set(0.05, 0.006, 0.008)
      obj.updateMatrix()
      grooves.push(obj.matrix.clone())
    }
    const ticks: Matrix4[] = []
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * TAU
      const major = i % 10 === 0
      obj.position.set(Math.cos(a) * 1.66, 0.005, Math.sin(a) * 1.66)
      obj.rotation.set(0, -a, 0)
      obj.scale.set(major ? 0.045 : 0.02, 0.004, major ? 0.006 : 0.004)
      obj.updateMatrix()
      ticks.push(obj.matrix.clone())
    }
    return {
      grooveGeo: new BoxGeometry(1, 1, 1),
      grooveMat: new MeshStandardMaterial({ color: new Color('#20262e'), metalness: 0.85, roughness: 0.3 }),
      grooveMatrices: grooves,
      tickGeo: new BoxGeometry(1, 1, 1),
      tickMat: new MeshStandardMaterial({
        color: new Color('#131a24'),
        emissive: new Color('#3d84b8'),
        emissiveIntensity: 0.5,
        metalness: 0.4,
        roughness: 0.5,
      }),
      tickMatrices: ticks,
    }
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    circuitMat.uniforms.uTime.value = t
    if (ringMat.current) {
      ringMat.current.emissiveIntensity = 0.7 + Math.sin(t * 0.7) * 0.18
    }
    // Outer HUD rings: dimmer, slower, phase-staggered — a floor that breathes.
    if (halo1.current) halo1.current.emissiveIntensity = 0.34 + Math.sin(t * 0.5 + 1.1) * 0.12
    if (halo2.current) halo2.current.emissiveIntensity = 0.2 + Math.sin(t * 0.4 + 2.3) * 0.08
    // Calibration sweep: one slow, elegant revolution (~24s).
    if (sweep.current) sweep.current.rotation.z = t * 0.26
    // Power conduit rides up the mount on the energy-ring pulse clock, feeding the brain.
    if (conduit.current && conduitMat.current) {
      const cycle = (t * 0.35) % 1
      conduit.current.position.y = 0.14 + cycle * 0.62
      conduitMat.current.emissiveIntensity = (1 - cycle) * 1.4 + 0.2
      conduitMat.current.opacity = 0.9 - cycle * 0.55
    }
  })

  const setInst = (matrices: Matrix4[]) => (inst: InstancedMesh | null) => {
    if (!inst) return
    matrices.forEach((m, i) => inst.setMatrixAt(i, m))
    inst.instanceMatrix.needsUpdate = true
    inst.computeBoundingSphere()
  }

  return (
    <group position={[0, -1.32, 0]}>
      {/* L1 — structural graphite base: heavy, rough */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[1.55, 1.75, 0.16, 96]} />
        <meshStandardMaterial color={STRUCTURAL.graphite} metalness={0.45} roughness={0.7} />
      </mesh>

      {/* L2 — brushed titanium primary ring + machined radial grooves */}
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.045, 24, 120]} />
        <meshStandardMaterial color={STRUCTURAL.titanium} metalness={0.88} roughness={0.32} />
      </mesh>
      <instancedMesh ref={setInst(grooveMatrices)} args={[grooveGeo, grooveMat, grooveMatrices.length]} frustumCulled={false} />

      {/* L3 — PCB circuit disc: procedural routing + vias + blinking status LEDs */}
      <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]} material={circuitMat}>
        <circleGeometry args={[1.45, 96]} />
      </mesh>

      {/* L4 — recessed energy ring (bloom-eligible), soft cyan, slow pulse */}
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

      {/* L5 — calibration ring: engraved ticks + slow rotating sweep arc */}
      <instancedMesh ref={setInst(tickMatrices)} args={[tickGeo, tickMat, tickMatrices.length]} frustumCulled={false} />
      <mesh ref={sweep} position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.58, 1.74, 48, 1, 0, Math.PI / 7]} />
        <meshStandardMaterial
          color="#0a1420"
          emissive={new Color('#4f9fe6')}
          emissiveIntensity={0.4}
          transparent
          opacity={0.22}
          blending={AdditiveBlending}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer concentric HUD rings — the laboratory floor (M10) */}
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

      {/* Segmented mechanical mount: collar -> column -> neck, carbon-dark with titanium
          collars, plus a power conduit ring that travels upward into the brainstem. */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.26, 0.32, 0.1, 32]} />
        <meshStandardMaterial color={STRUCTURAL.titanium} metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.13, 0.2, 0.5, 32]} />
        <meshStandardMaterial color="#101318" metalness={0.6} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.24, 32]} />
        <meshStandardMaterial color={STRUCTURAL.titanium} metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh ref={conduit} position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.012, 10, 40]} />
        <meshStandardMaterial
          ref={conduitMat}
          color="#0a1420"
          emissive={new Color('#57b6ff')}
          emissiveIntensity={1.2}
          transparent
          opacity={0.9}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
