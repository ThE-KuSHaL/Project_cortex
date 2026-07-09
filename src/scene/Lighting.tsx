import { Environment, Lightformer } from '@react-three/drei'
import { QUALITY, detectTier } from '../config/quality'

const ENV_RESOLUTION = QUALITY[detectTier()].envResolution

/**
 * Cinematic rig (docs/08_lighting_pipeline.md): darkness is default, light reveals form.
 * Cool key + soft fill + a critical cool rim, plus a compact procedural studio
 * environment (built from Lightformers — no network fetch) that supplies the subtle
 * reflections metals need without ever being visible.
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.1} color="#9fb2cc" />
      <hemisphereLight args={['#26374f', '#04060a', 0.28]} />

      {/* Cool key — reveals the overall brain form, soft shadow onto the base. */}
      <directionalLight
        position={[4.5, 6, 3.5]}
        intensity={1.5}
        color="#dce8ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-camera-near={0.5}
        shadow-camera-far={22}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      {/* Cool rim from behind — the spec's "critical" edge separation. Bright, cool,
          narrow: draws a clean highlight along the silhouette so the brain never
          dissolves into the void. */}
      <directionalLight position={[-5.5, 3.5, -4.5]} intensity={1.7} color="#8fb8ff" />

      {/* Second, lower cool rim on the opposite shoulder so both silhouette edges read. */}
      <directionalLight position={[-3.5, -1.5, -5]} intensity={0.7} color="#6f9bff" />

      {/* Warm secondary bounce, very low. */}
      <directionalLight position={[2, -3, -2]} intensity={0.28} color="#ffb877" />

      <Environment resolution={ENV_RESOLUTION} background={false}>
        <Lightformer form="rect" intensity={2.2} color="#bcd4ff" position={[0, 4, 3]} scale={[9, 6, 1]} />
        <Lightformer
          form="rect"
          intensity={1.3}
          color="#6f9bff"
          position={[-6, 2, -3]}
          scale={[5, 6, 1]}
          rotation={[0, Math.PI / 3, 0]}
        />
        <Lightformer form="ring" intensity={0.7} color="#ffffff" position={[4, -1.5, 4]} scale={2.4} />
      </Environment>
    </>
  )
}
