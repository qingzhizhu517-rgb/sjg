import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/views/CityCulture.vue', import.meta.url), 'utf8')

test('城市页在全部请求失败时进入可重试错误态，而不是伪装为空数据', () => {
  assert.match(source, /results\.every\(\s*\(result\)\s*=>\s*result\.status\s*===\s*['"]rejected['"]\s*\)/)
  assert.match(source, /城市文化数据加载失败，请稍后重试/)
})

test('城市页部分请求失败时保留成功数据并显示可理解提示', () => {
  assert.match(source, /failedCount/)
  assert.match(source, /部分城市资料暂时无法加载，已显示可用内容。/)
  assert.match(source, /cc-partial-warning/)
})
