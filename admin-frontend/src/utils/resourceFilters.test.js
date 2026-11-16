import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanParams, parseQualityFromRoute } from './resourceFilters.js'

test('cleanParams removes empty values but keeps zero and ids', () => {
  assert.deepEqual(cleanParams({
    page: 1,
    size: 10,
    keyword: '',
    region: '泰安',
    poetId: null,
    dynastyId: 0,
    quality: undefined
  }), {
    page: 1,
    size: 10,
    region: '泰安',
    dynastyId: 0
  })
})

test('parseQualityFromRoute reads string quality query', () => {
  assert.equal(parseQualityFromRoute({ query: { quality: 'missingImages' } }), 'missingImages')
  assert.equal(parseQualityFromRoute({ query: { quality: ['a', 'b'] } }), 'a')
  assert.equal(parseQualityFromRoute({ query: {} }), '')
})
