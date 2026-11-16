import test from 'node:test'
import assert from 'node:assert/strict'
import { buildKpis, maxDistributionValue, qualityRoute } from './dashboard.js'

test('buildKpis maps dashboard summary into stable admin KPI cards', () => {
  const cards = buildKpis({
    totals: { poets: 2, spots: 3, poems: 5, events: 7, users: 11 },
    pending: { users: 13 }
  })

  assert.deepEqual(cards.map(card => card.key), ['poets', 'spots', 'poems', 'events', 'users', 'pendingUsers'])
  assert.equal(cards.find(card => card.key === 'pendingUsers').value, 13)
  assert.equal(cards.find(card => card.key === 'spots').label, '景点')
})

test('maxDistributionValue returns at least one to avoid divide by zero', () => {
  assert.equal(maxDistributionValue([]), 1)
  assert.equal(maxDistributionValue([{ spotCount: 0 }, { spotCount: 4 }], 'spotCount'), 4)
})

test('qualityRoute includes filter query when provided', () => {
  assert.equal(qualityRoute({ route: '/spots', filter: 'missingImages' }), '/spots?quality=missingImages')
  assert.equal(qualityRoute({ route: '/poets' }), '/poets')
})
