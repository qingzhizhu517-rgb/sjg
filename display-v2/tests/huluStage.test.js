import test from 'node:test'
import assert from 'node:assert/strict'
import { setupPage } from './helpers/componentSetup.js'
import { createWorkshopState } from '../src/utils/huluWorkshop.js'
const props = () => ({ work: createWorkshopState(), mode: 'observe', step: 0, tool: 'rotate', sideLight: false, beforeAfter: false, guideVisible: undefined })
const deps = factory => ({ createHuluRenderer: factory, createGourdTextures: () => { throw new Error('无DOM不创建平面纹理') }, resolveHuluPresentation: () => ({}) })

test('三维初始化全部完成后才发 ready，离页后的迟到结果立即释放', async () => {
  let complete, disposed = 0
  const api = { update() {}, dispose() { disposed++ } }
  const page = await setupPage('components/craft/HuluStage.vue', deps(() => new Promise(resolve => { complete = resolve })), props())
  assert.equal(page.events.length, 0)
  page.dispose(); complete(api); await page.ready
  assert.equal(disposed, 1)
  assert.equal(page.events.length, 0)
})
test('渲染失败进入平面模式，成功初始化先同步作品再 ready', async () => {
  const fallback = await setupPage('components/craft/HuluStage.vue', deps(async () => { throw new Error('WebGL unavailable') }), props())
  await fallback.ready
  assert.equal(fallback.state.capability.value, '2d')
  assert.ok(fallback.events.some(e => e[0] === 'ready' && e[1] === null))
  fallback.dispose()
  let updates = 0
  const api = { update() { updates++ }, dispose() {} }
  const scene = await setupPage('components/craft/HuluStage.vue', deps(async () => api), props())
  await scene.ready
  assert.equal(updates, 1)
  assert.equal(scene.state.capability.value, '3d')
  assert.ok(scene.events.some(e => e[0] === 'ready' && e[1] === api))
  scene.dispose()
})
