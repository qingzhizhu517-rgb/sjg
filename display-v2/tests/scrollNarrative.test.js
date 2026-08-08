import { test } from 'node:test'
import assert from 'node:assert/strict'
import { narrativePanels } from '../src/content/scrollNarrative.js'

test('narrativePanels: real 主题有 2 段叙事', () => {
  assert.ok(Array.isArray(narrativePanels.real))
  assert.equal(narrativePanels.real.length, 2)
})

test('narrativePanels: inkwash 主题有 3 段叙事', () => {
  assert.ok(Array.isArray(narrativePanels.inkwash))
  assert.equal(narrativePanels.inkwash.length, 3)
})

test('narrativePanels: 每条有 title 和 body 且非空', () => {
  for (const theme of ['real', 'inkwash']) {
    for (const panel of narrativePanels[theme]) {
      assert.ok(typeof panel.title === 'string' && panel.title.length > 0, `${theme} panel.title 非空`)
      assert.ok(typeof panel.body === 'string' && panel.body.length > 0, `${theme} panel.body 非空`)
    }
  }
})
