import test from 'node:test'
import assert from 'node:assert/strict'
import { useThreeSandbox } from '../src/composables/useThreeSandbox.js'

test('awaitable init settles false when canvas is absent and disposal clears state', async () => {
  const engine = useThreeSandbox()
  assert.equal(await engine.init(), false)
  assert.equal(engine.loading.value, false)
  assert.equal(engine.status.value, 'error')
  engine.dispose()
  assert.equal(engine.status.value, 'disposed')
  assert.deepEqual(engine.cityLabels.value, [])
})
test('dispose aborts pending fetch and ignores an eventual successful response', async () => {
  const original = globalThis.fetch
  let resolve, signal
  globalThis.fetch = (_url, options) => {
    signal = options.signal
    return new Promise((r) => (resolve = r))
  }
  try {
    const engine = useThreeSandbox()
    engine.canvas3d.value = {}
    const pending = engine.init()
    engine.dispose()
    assert.equal(signal.aborted, true)
    resolve({ ok: true, json: async () => ({ features: [{}] }) })
    assert.equal(await pending, false)
    assert.equal(engine.getScene(), null)
    assert.equal(engine.ready.value, false)
    assert.equal(engine.loading.value, false)
  } finally {
    globalThis.fetch = original
  }
})
test('invalid import is atomic and reset is undoable', () => {
  const engine = useThreeSandbox()
  engine.setWeather('rain')
  const before = engine.exportDraft()
  assert.throws(() => engine.importDraft('{"schemaVersion":999}'))
  assert.equal(engine.exportDraft(), before)
  engine.resetDraft()
  assert.equal(JSON.parse(engine.exportDraft()).weather, 'clear')
  engine.undo()
  assert.equal(JSON.parse(engine.exportDraft()).weather, 'rain')
  engine.redo()
  assert.equal(JSON.parse(engine.exportDraft()).weather, 'clear')
})
