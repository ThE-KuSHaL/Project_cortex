import { Bloom, EffectComposer, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useQuality } from '../state/qualityStore'

/**
 * Postprocessing (docs/08): bloom is the ONLY glow source and it operates in linear
 * HDR BEFORE the filmic curve — the renderer runs with NoToneMapping and tone mapping
 * lives here as the final effect. Only emissive authored above the luminance threshold
 * (cores / fiber / packets / hotspots / energy ring) can bloom; the graphite, titanium,
 * copper and ceramic never exceed it, so the structure can never glow.
 *
 * Bloom intensity is read from the adaptive quality store so the perf monitor can
 * dial it back on weaker hardware without a remount.
 */
export function Effects() {
  const bloomIntensity = useQuality((s) => s.bloomIntensity)
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.62}
        luminanceSmoothing={0.14}
        intensity={bloomIntensity}
        radius={0.66}
      />
      <Vignette eskil={false} offset={0.26} darkness={0.82} />
      <SMAA />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
