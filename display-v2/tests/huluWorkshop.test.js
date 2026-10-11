import test from 'node:test'
import assert from 'node:assert/strict'
import * as api from '../src/utils/huluWorkshop.js'
const stroke = (kind, points, depth = 1) => ({ kind, points, depth, pigment: 'ink' })

test('制作没有实际刻线时不能完成，观摩字段不产生完成状态', () => {
  assert.equal(typeof api.createWorkshopState, 'function')
  const work = api.createWorkshopState()
  assert.equal(api.evaluateWork({ ...work, step: 4 }).canFinish, false)
})
test('未知版本、无穷坐标、越界与过量笔迹拒绝进入作品', () => {
  const work = api.createWorkshopState()
  assert.equal(api.normalizeWork({ ...work, version: 99 }), null)
  for (const u of [Infinity, NaN, -1, 1.1]) {
    assert.equal(api.normalizeWork({ ...work, strokes: [stroke('carve', [{ u, v: .3 }, { u: .5, v: .4 }])] }), null)
  }
  assert.equal(api.normalizeWork({ ...work, strokes: Array(api.WORK_LIMITS.strokes + 1).fill(stroke('carve', [{ u: .4, v: .3 }, { u: .5, v: .4 }])) }), null)
})
test('原创纹样按布纹参数映射，路径有限且不同纹样有差异', () => {
  const work = api.createWorkshopState()
  const paths = api.getMotifPaths(work)
  assert.ok(paths.length > 3)
  assert.ok(paths.flat().every(p => Number.isFinite(p.u) && p.u >= 0 && p.u <= 1 && p.v >= 0 && p.v <= 1))
  assert.notDeepEqual(paths, api.getMotifPaths({ ...work, motif: 'fish' }))
  const moved = api.getMotifPaths({ ...work, placement: { ...work.placement, u: .6 } })
  assert.ok(Math.abs(moved[0][0].u - paths[0][0].u - .1) < .001)
})
test('只有实际跟刻、敷色并擦色才能完成，后敷色会重新覆盖表面', () => {
  const work = api.createWorkshopState()
  const paths = api.getMotifPaths(work)
  work.strokes = paths.map(points => stroke('carve', points))
  assert.ok(api.evaluateWork(work).coverage > 95)
  assert.equal(api.evaluateWork(work).canFinish, false)
  work.strokes.push(...paths.map(points => stroke('coat', points)))
  assert.equal(api.evaluateWork(work).canFinish, false)
  work.strokes.push(...paths.map(points => stroke('wipe', points)))
  assert.equal(api.evaluateWork(work).canFinish, true)
  work.strokes.push(...paths.map(points => stroke('coat', points)))
  assert.equal(api.evaluateWork(work).canFinish, false)
})
test('自由练习不强制匹配参考线，仍须由实际笔迹生成作品', () => {
  const work = api.createWorkshopState({ practice: 'free' })
  const points = [{ u: .43, v: .4 }, { u: .54, v: .4 }]
  work.strokes = ['carve', 'coat', 'wipe'].map(kind => stroke(kind, points))
  assert.equal(api.evaluateWork(work).canFinish, true)
  assert.equal(api.evaluateWork(work).score, null)
})
test('长笔迹采样覆盖整条轨迹，尾部刻线能敷色擦色', () => {
  const work = api.createWorkshopState({ practice: 'free' })
  const path = Array.from({ length: 256 }, (_, i) => ({ u: .1 + .75 * i / 255, v: .3 }))
  work.strokes = [stroke('carve', [{ u: .7, v: .3 }, { u: .8, v: .3 }]), stroke('coat', path), stroke('wipe', path)]
  assert.equal(api.evaluateWork(work).canFinish, true)
  assert.equal(api.evaluateWork(work).wipeCoverage, 100)
})
test('作品 JSON 往返限量且损坏存储有明确反馈；写失败不声称保存成功', () => {
  const values = new Map()
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
  const work = api.createWorkshopState()
  let saved
  for (let i = 0; i < api.WORK_LIMITS.library + 2; i++) saved = api.saveWork(storage, work, null)
  assert.equal(saved.ok, true)
  const loaded = api.readLibrary(storage)
  assert.equal(loaded.works.length, api.WORK_LIMITS.library)
  assert.deepEqual(loaded.works[0].work, api.normalizeWork(work))
  values.set(api.WORK_STORAGE_KEY, '{broken')
  assert.match(api.readLibrary(storage).error, /损坏/)
  const denied = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError') } }
  assert.equal(api.saveWork(denied, work).ok, false)
  assert.match(api.saveWork(denied, work).error, /保存失败/)
})
