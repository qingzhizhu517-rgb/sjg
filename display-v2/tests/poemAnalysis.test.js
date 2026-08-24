import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const source = await readFile(
  new URL('../src/components/PoemAnalysis.vue', import.meta.url),
  'utf8',
)

test('移动端赏析标签按钮保留至少 44px 触控命中区', () => {
  const mobileRules = source.match(
    /@media\s*\(max-width:\s*768px\)[\s\S]*?\.tab-btn\s*\{([\s\S]*?)\n\s*\}/,
  )?.[1] || ''

  assert.match(mobileRules, /min-height:\s*44px/)
})

test('横向标签栏提供可滑动语义和可感知的边缘提示', () => {
  assert.match(source, /class="analysis-tabs-wrap"[^>]*aria-label="[^"]*横向滑动[^"]*"/)
  assert.match(source, /\.analysis-tabs-wrap::after\s*\{/)
})
