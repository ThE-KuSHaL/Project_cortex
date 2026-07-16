import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { BrainMesh } from '../brain/BrainMesh'
import { Lighting } from './Lighting'
import { Atmosphere } from './Atmosphere'
import { BasePlatform } from './BasePlatform'
import { Particles } from './Particles'
import { RegionProjector } from './RegionProjector'
import { PerfMonitor } from '../engine/PerfMonitor'
import { CameraRig } from '../systems/CameraRig'

/**
 * Assembles the 3D scene: dark background, cinematic rig, the merged brain on its
 * dock, ambient particles, and an intentional (never orthographic) orbit camera.
 */
export function Stage({ particleCount }: { particleCount: number }) {
  return (
    <>
      <color attach="background" args={['#050608']} />
      <Atmosphere />

      <Lighting />

      <Suspense fallback={null}>
        <BrainMesh />
      </Suspense>

      <BasePlatform />
      <Particles count={particleCount} />
      <RegionProjector />
      <CameraRig />
      <PerfMonitor />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.045}
        rotateSpeed={0.55}
        zoomSpeed={0.65}
        minDistance={1.75}
        maxDistance={8}
        maxPolarAngle={Math.PI * 0.86}
        target={[0, 0, 0]}
      />
    </>
  )
}
