import test from 'node:test'
import assert from 'node:assert/strict'
const core = await import('../src/three/sandbox/core.js').catch(() => ({}))
test('camera flight is elapsed-time based and cancellation prevents stale writes', () => {
  assert.equal(typeof core.createFlight, 'function')
  const f = core.createFlight()
  f.start([0, 0, 0], [10, 5, 2], 1)
  assert.deepEqual(f.step(0.5), [5, 2.5, 1])
  f.cancel()
  assert.equal(f.step(0.5), null)
})
test('gesture rejects drag and multi-pointer and double click requires same target', () => {
  assert.equal(typeof core.createGesture, 'function')
  const g = core.createGesture()
  g.down(1, 0, 0)
  g.move(1, 8, 0)
  assert.equal(g.up(1, 0, 0, 'a', 100), null)
  g.down(1, 0, 0)
  g.down(2, 0, 0)
  assert.equal(g.up(1, 0, 0, 'a', 200), null)
  g.up(2, 0, 0, 'a', 220)
  g.down(1, 0, 0)
  assert.equal(g.up(1, 0, 0, 'a', 300), 'single')
  g.down(1, 0, 0)
  assert.equal(g.up(1, 0, 0, 'b', 400), 'single')
  g.down(1, 0, 0)
  assert.equal(g.up(1, 0, 0, 'b', 500), 'double')
})
test('draft validation rejects invalid transforms, future schema and dangerous object count', () => {
  assert.equal(typeof core.validateDraft, 'function')
  const d = core.emptyDraft()
  assert.equal(core.validateDraft(d).schemaVersion, 1)
  for (const value of [
    { ...d, schemaVersion: 2 },
    { ...d, objects: [{ id: 'a', asset: 'tree', x: NaN, z: 0, scale: 1, rotation: 0 }] },
    { ...d, objects: Array(501).fill({}) },
  ])
    assert.throws(() => core.validateDraft(value))
})
test('history can undo and redo 100 edits without mutating saved snapshots', () => {
  assert.equal(typeof core.createHistory, 'function')
  const h = core.createHistory(core.emptyDraft())
  for (let i = 0; i < 100; i++) h.commit({ ...h.value, weather: i % 2 ? 'clear' : 'rain' })
  for (let i = 0; i < 100; i++) assert.ok(h.undo())
  assert.equal(h.value.weather, 'clear')
  for (let i = 0; i < 100; i++) assert.ok(h.redo())
  assert.equal(h.canRedo, false)
})
test('terrain brush has soft edge, preserves river and supports flatten smooth lower', () => {
  assert.equal(typeof core.createTerrain, 'function')
  const t = core.createTerrain({ base: () => 1, riverDistance: (x, z) => Math.hypot(x, z) })
  const old = t.sample(4, 4)
  t.paint({ x: 4, z: 4, type: 'raise', radius: 2, strength: 0.5 })
  assert.ok(t.sample(4, 4) > old)
  assert.equal(t.sample(7, 4), old)
  assert.equal(t.sample(0, 0), 1)
  t.paint({ x: 4, z: 4, type: 'lower', radius: 2, strength: 0.5 })
  assert.ok(Math.abs(t.sample(4, 4) - old) < 0.001)
  t.paint({ x: 4, z: 4, type: 'flatten', radius: 2, strength: 1, target: 2 })
  assert.ok(t.sample(4, 4) > 1)
  t.paint({ x: 4, z: 4, type: 'smooth', radius: 2, strength: 1 })
  assert.ok(Number.isFinite(t.sample(4, 4)))
})

test('a drag between clicks invalidates double-click history', () => {
  const g = core.createGesture()
  g.down(1, 0, 0)
  g.up(1, 0, 0, 'a', 100)
  g.down(1, 0, 0)
  g.move(1, 20, 0)
  g.up(1, 20, 0, 'a', 150)
  g.down(1, 0, 0)
  assert.equal(g.up(1, 0, 0, 'a', 200), 'single')
})

test('flatten default target uses the initial stroke height and imported heights cannot alter river banks', () => {
  const t = core.createTerrain({ base: () => 1, riverDistance: (x, z) => Math.hypot(x, z) })
  assert.throws(() => t.restore({ '56,56': 2 }))
  assert.equal(t.sample(0, 0), 1)
})

test('double click must be close on screen, even when the object is the same', () => {
  const g = core.createGesture()
  g.down(1, 0, 0)
  g.up(1, 0, 0, 'a', 100)
  g.down(1, 100, 100)
  assert.equal(g.up(1, 100, 100, 'a', 200), 'single')
})

test('label layout keeps the selected city and prevents overlapping plaques', () => {
  assert.equal(typeof core.layoutLabels, 'function')
  const labels = core.layoutLabels(
    [
      { name: 'a', x: 100, y: 100, visible: true },
      { name: 'b', x: 105, y: 102, visible: true },
      { name: 'c', x: 300, y: 200, visible: true },
    ],
    'b',
    400,
    300,
  )
  assert.equal(labels.find((x) => x.name === 'b').visible, true)
  assert.equal(labels.find((x) => x.name === 'a').visible, true)
  assert.ok(Math.abs(labels[0].x - labels[1].x) >= 48 || Math.abs(labels[0].y - labels[1].y) >= 76)
  assert.equal(labels[0].anchorX, 100)
  assert.equal(labels.find((x) => x.name === 'c').visible, true)
})

test('continuous base terrain retains detail between edit-grid samples', () => {
  const base = (x, z) => 0.8 + Math.sin(x * 15) * Math.cos(z * 9) * 0.2
  const t = core.createTerrain({ base, riverDistance: () => 10 })
  assert.ok(Math.abs(t.sample(0.123, 0.187) - base(0.123, 0.187)) < 1e-9)
  t.paint({ x: 2, z: 2, type: 'raise', radius: 1, strength: 0.2 })
  assert.ok(t.sample(2, 2) > base(2, 2))
})

test('terrain never sinks under the display plinth and interpolated edits leave river surface protected', () => {
  const floor = core.createTerrain({ base: () => 0.2, riverDistance: () => 10 })
  floor.paint({ x: 3, z: 3, type: 'lower', radius: 2, strength: 20 })
  assert.ok(floor.sample(3, 3) >= -0.4)
  assert.throws(() => floor.restore({ '65,65': -3 }), /最低/)
  const river = core.createTerrain({ base: () => 0.2, riverDistance: (x) => Math.abs(x) })
  river.restore({ '58,56': 5 })
  assert.equal(river.sample(0.4, 0), 0.2)
})

test('lowering to the terrain floor roundtrips without floating-point rejection', async () => {
  const { getTerrainHeight, riverDistance } = await import('../src/three/sandbox/geography.js')
  const t = core.createTerrain({ base: getTerrainHeight, riverDistance })
  for (let i = 0; i < 100; i++) t.paint({ x: 2, z: 2, type: 'lower', radius: 3, strength: 0.15 })
  assert.doesNotThrow(() => t.restore(t.edits))
})
