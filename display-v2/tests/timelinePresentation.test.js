import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const componentUrl = new URL('../src/components/timeline/InkTimeline.vue', import.meta.url)
const boatUrl = new URL('../public/media/inkwash/timeline/boat-rower.webp', import.meta.url)

test('时间轴场景完整展示，不再用 cover 裁切画面', async () => {
  const source = await readFile(componentUrl, 'utf8')
  const sceneRule = source.match(/\.ink-timeline__scene\s*\{([\s\S]*?)\n\}/)?.[1] || ''

  assert.match(sceneRule, /object-fit:\s*contain/)
})

test('小舟保持原始比例并使用响应式命中区', async () => {
  const source = await readFile(componentUrl, 'utf8')
  const boatRule = source.match(/\.ink-timeline__boat\s*\{([\s\S]*?)\n\}/)?.[1] || ''

  assert.match(boatRule, /width:\s*clamp\(82px,\s*7vw,\s*120px\)/)
  assert.match(boatRule, /height:\s*auto/)
})

test('小舟 WebP 包含透明通道且控制在 300KB 内', async () => {
  const buffer = await readFile(boatUrl)
  const hasAlphaChunk = buffer.includes(Buffer.from('ALPH')) || buffer.includes(Buffer.from('VP8L'))

  assert.equal(hasAlphaChunk, true)
  assert.ok(buffer.byteLength <= 300 * 1024, `boat asset is ${buffer.byteLength} bytes`)
})
