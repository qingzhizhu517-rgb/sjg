import test from 'node:test'
import assert from 'node:assert/strict'
import { setupPage, testRoute } from './helpers/componentSetup.js'
import { useHuluWorkshop } from '../src/composables/useHuluWorkshop.js'
import { HULU_PROCESS, HULU_SOURCES } from '../src/content/crafts/dongchang-hulu.js'
import { HULU_SHAPES, HULU_MOTIFS, createWorkshopState } from '../src/utils/huluWorkshop.js'
const create = () => {
  const { route } = testRoute('/crafts/workshop', { preview: 'inkwash' })
  const storage = { getItem: () => null, setItem() {} }
  return setupPage('views/CraftWorkshop.vue', { useRoute: () => route, useReveal: () => ({ reveal() {} }), atlasLink: path => `${path}?preview=inkwash`, useHuluWorkshop: () => useHuluWorkshop(storage), HULU_PROCESS, HULU_SOURCES, HULU_SHAPES, HULU_MOTIFS })
}
test('观摩与制作进度独立；导览末步不会生成或保存作品', async () => {
  const page = await create(); await page.ready
  assert.equal(typeof page.state.setMode, 'function')
  assert.equal(page.state.mode.value, 'watch')
  page.state.setMode('observe')
  page.state.jumpTo(4)
  assert.equal(page.state.currentStep.value, 4)
  page.state.setMode('make')
  assert.equal(page.state.currentStep.value, 0)
  assert.equal(page.state.workshop.assessment.value.canFinish, false)
  assert.equal(page.state.workshop.save(), false)
  page.state.setMode('observe')
  assert.equal(page.state.currentStep.value, 4)
  assert.ok(page.template.includes('<SourceList'))
  page.dispose()
})
test('切换模式和卸载立即停止连续播放，错误降级不改变真实作品', async () => {
  const page = await create(); await page.ready
  page.state.setMode('observe')
  page.state.toggleAuto()
  assert.equal(page.state.playing.value, true)
  page.state.setMode('make')
  assert.equal(page.state.playing.value, false)
  page.state.workshop.enter(2)
  page.state.acceptStroke({ kind: 'carve', depth: 1, pigment: 'ink', points: [{ u: .4, v: .3 }, { u: .5, v: .3 }] })
  assert.equal(page.state.workshop.work.value.strokes.length, 1)
  page.state.onStageReady(null)
  assert.equal(page.state.sceneCapability.value, '2d')
  assert.equal(page.state.workshop.work.value.strokes.length, 1)
  page.dispose()
})
test('图库恢复的确认路径与直接路径都进入制作编辑', async () => {
  const page = await create(); await page.ready
  page.state.workshop.enter(2)
  page.state.workshop.addStroke({ kind: 'carve', depth: 1, pigment: 'ink', points: [{ u: .4, v: .3 }, { u: .5, v: .3 }] })
  page.state.library.value = [{ id: 'saved-work', savedAt: new Date().toISOString(), work: createWorkshopState({ name: '已存梅枝' }) }]
  page.state.setMode('gallery')
  page.state.restoreWork('saved-work')
  assert.ok(page.state.pending.value)
  page.state.confirmAction()
  assert.equal(page.state.mode.value, 'make')
  assert.equal(page.state.work.value.name, '已存梅枝')
  page.dispose()
})
