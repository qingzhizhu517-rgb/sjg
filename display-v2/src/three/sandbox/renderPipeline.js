import { Vector2 } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

// Only HDR gold guides cross the bloom threshold. Low mode renders directly.
export function createRenderPipeline(renderer, scene, camera) {
  let composer = null,
    bloom = null
  let size = { width: 1, height: 1, ratio: 1 }
  function release() {
    if (!composer) return
    composer.passes.forEach((pass) => pass.dispose())
    composer.dispose()
    composer = bloom = null
  }
  function resize(width, height, ratio) {
    size = { width, height, ratio }
    if (composer) {
      composer.setPixelRatio(ratio)
      composer.setSize(width, height)
    }
  }
  return {
    setQuality(quality) {
      if (quality === 'low') {
        release()
        return
      }
      if (!composer) {
        composer = new EffectComposer(renderer)
        composer.addPass(new RenderPass(scene, camera))
        bloom = new UnrealBloomPass(new Vector2(size.width, size.height), 0.4, 0.3, 1.6)
        composer.addPass(bloom)
        composer.addPass(new OutputPass())
        resize(size.width, size.height, size.ratio)
      }
      bloom.strength = quality === 'high' ? 0.5 : 0.32
    },
    resize,
    render() {
      if (composer) composer.render()
      else renderer.render(scene, camera)
    },
    dispose: release,
  }
}
