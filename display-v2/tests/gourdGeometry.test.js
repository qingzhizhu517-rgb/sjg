import test from 'node:test'
import assert from 'node:assert/strict'

let gourd
try {
  gourd = await import('../src/craft/gourdGeometry.js')
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error
}

test('连续葫芦几何提供可独立于浏览器调用的工厂', () => {
  assert.equal(typeof gourd?.createGourdGeometry, 'function')
})

for (const shape of ['balanced', 'slender', 'full']) {
  test(`${shape} 的位置、法线与归一 UV 均有限，移动面数低于三万`, () => {
    assert.ok(gourd, '几何工厂尚未实现')
    const geometry = gourd.createGourdGeometry(shape, 'mobile')
    for (const key of ['position', 'normal', 'uv']) {
      assert.ok([...geometry.attributes[key].array].every(Number.isFinite), key)
    }
    assert.ok([...geometry.attributes.uv.array].every((x) => x >= 0 && x <= 1))
    assert.ok(geometry.index.count / 3 < 30000)
    geometry.dispose()
  })
}

test('桌面形体在三万至八万面预算中，且三形轮廓确实不同', () => {
  assert.ok(gourd, '几何工厂尚未实现')
  const profiles = []
  for (const shape of ['balanced', 'slender', 'full']) {
    const geometry = gourd.createGourdGeometry(shape)
    assert.ok(geometry.index.count / 3 >= 30000)
    assert.ok(geometry.index.count / 3 <= 80000)
    profiles.push(geometry.userData.gourd.profile.map((point) => point.radius))
    geometry.dispose()
  }
  assert.notDeepEqual(profiles[0], profiles[1])
  assert.notDeepEqual(profiles[0], profiles[2])
  assert.notDeepEqual(profiles[1], profiles[2])
})

test('上腹小于下腹，束腰连续且没有两球相接的尖角', () => {
  assert.ok(gourd, '几何工厂尚未实现')
  for (const shape of ['balanced', 'slender', 'full']) {
    const geometry = gourd.createGourdGeometry(shape)
    const points = geometry.userData.gourd.profile
    const lower = Math.max(...points.filter((p) => p.v < 0.48).map((p) => p.radius))
    const upper = Math.max(...points.filter((p) => p.v > 0.65).map((p) => p.radius))
    const waist = points.filter((p) => p.v >= 0.5 && p.v <= 0.64)
    assert.ok(lower > upper * 1.25)
    assert.ok(Math.min(...waist.map((p) => p.radius)) < upper * 0.64)
    // Neighboring slopes on a dense profile should evolve smoothly through the waist.
    const slopes = waist.slice(1).map((p, i) => (p.radius - waist[i].radius) / (p.y - waist[i].y))
    assert.ok(Math.max(...slopes.slice(1).map((s, i) => Math.abs(s - slopes[i]))) < 0.35)
    geometry.dispose()
  }
})

test('所有曲面法线单位化，闭合接缝两侧法线一致', () => {
  assert.ok(gourd, '几何工厂尚未实现')
  const geometry = gourd.createGourdGeometry('balanced', 'mobile')
  const normal = geometry.attributes.normal
  const { radialSegments, heightSegments } = geometry.userData.gourd
  for (let i = 0; i < normal.count; i += 1) {
    const length = Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i))
    assert.ok(Math.abs(length - 1) < 1e-5, `normal ${i}`)
  }
  // LatheGeometry stores each longitudinal profile for one radial sample.
  for (let j = 0; j <= heightSegments; j += 1) {
    const end = radialSegments * (heightSegments + 1) + j
    assert.ok(Math.abs(normal.getX(j) - normal.getX(end)) < 1e-6)
    assert.ok(Math.abs(normal.getZ(j) - normal.getZ(end)) < 1e-6)
  }
  geometry.dispose()
})
test('干坯有独立内壁，保持有限壳厚并控制内壁面数', () => {
  assert.equal(typeof gourd.createGourdInteriorGeometry, 'function')
  const inside = gourd.createGourdInteriorGeometry('balanced', 'mobile')
  assert.ok(inside.userData.shellThickness > 0)
  assert.ok(inside.index.count / 3 < 5000)
  assert.ok([...inside.attributes.position.array].every(Number.isFinite))
  assert.ok(inside.boundingBox.min.y > -1.43)
  inside.dispose()
})

let textures
try {
  textures = await import('../src/craft/gourdTextures.js')
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error
}

test('UV 接缝、漏过表面与背面跳点不会被纹理连成一条横线', () => {
  assert.equal(typeof textures?.splitUvPaths, 'function')
  const paths = textures.splitUvPaths([
    { u: 0.97, v: 0.3 }, { u: 0.99, v: 0.31 },
    { u: 0.01, v: 0.32 }, { u: 0.03, v: 0.33 },
    { u: 0.6, v: 0.7 }, { u: 0.61, v: 0.71 },
  ])
  assert.deepEqual(paths.map((path) => path.length), [2, 2, 2])
})

test('纹理路径忽略非法 UV，合法短笔迹保留', () => {
  assert.equal(typeof textures?.splitUvPaths, 'function')
  assert.deepEqual(textures.splitUvPaths([
    { u: 0.5, v: 0.3 }, { u: 0.51, v: 0.31 },
    { u: NaN, v: 0.31 }, { u: 3, v: 0.31 },
    { u: 0.55, v: 0.31 },
  ]).map((path) => path.length), [2, 1])
})

let rendering
try {
  rendering = await import('../src/craft/huluRenderer.js')
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error
}

const emptyWork = { version: 1, shape: 'balanced', motif: 'plum',
  placement: { u: 0.5, v: 0.31, scale: 1, rotation: 0 }, depth: 2, pigment: 'ink', strokes: [] }

test('制作模式辅助稿不会产生雕刻，赏鉴仍只展示真实笔迹', () => {
  assert.equal(typeof rendering?.resolveHuluPresentation, 'function')
  const make = rendering.resolveHuluPresentation({ work: emptyWork, mode: 'make', step: 2 })
  assert.equal(make.guideVisible, true)
  assert.deepEqual(make.strokes, [])
  const gallery = rendering.resolveHuluPresentation({ work: emptyWork, mode: 'gallery', step: 4 })
  assert.equal(gallery.guideVisible, false)
  assert.deepEqual(gallery.strokes, [])
})

test('观摩第三步才出现演示刻线，原坯对比不改写作品', () => {
  assert.equal(typeof rendering?.resolveHuluPresentation, 'function')
  assert.equal(rendering.resolveHuluPresentation({ work: emptyWork, mode: 'observe', step: 2 }).strokes.length, 0)
  assert.ok(rendering.resolveHuluPresentation({ work: emptyWork, mode: 'observe', step: 3 }).strokes.length > 0)
  const work = { ...emptyWork, strokes: [{ kind: 'carve', depth: 2, pigment: 'ink',
    points: [{ u: 0.5, v: 0.3 }, { u: 0.51, v: 0.31 }] }] }
  assert.equal(rendering.resolveHuluPresentation({ work, mode: 'gallery', step: 4, beforeAfter: true }).strokes.length, 0)
  assert.equal(work.strokes.length, 1)
})
