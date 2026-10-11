import test from 'node:test'
import assert from 'node:assert/strict'
import { unwrapResult, parseMediaUrls, firstMediaUrl } from '../shared/index.js'

test('Result supports null/false payloads and rejects business failure with code', () => {
  assert.equal(unwrapResult({ code: 200, data: null }), null)
  assert.equal(unwrapResult({ code: 200, data: false }), false)
  assert.throws(() => unwrapResult({ code: 429, message: '请求频繁' }), { code: 429, message: '请求频繁' })
})
test('media parsing handles arrays, JSON strings and raw paths consistently', () => {
  assert.deepEqual(parseMediaUrls('[" /a.webp ",null,""]'), ['/a.webp'])
  assert.deepEqual(parseMediaUrls('"/a.webp"'), ['/a.webp'])
  assert.deepEqual(parseMediaUrls('/a.webp'), ['/a.webp'])
  assert.equal(firstMediaUrl([]), '')
  assert.deepEqual(parseMediaUrls('{}'), [])
})
