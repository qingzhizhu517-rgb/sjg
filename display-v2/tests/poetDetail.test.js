import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const source = await readFile(
  new URL('../src/views/PoetDetail.vue', import.meta.url),
  'utf8',
)

test('B-1 删除头像方印并把代表句放在生平之后', () => {
  assert.doesNotMatch(source, /pd-portrait__seal/)
  assert.match(source, /pd-signature__link/)
  assert.ok(source.indexOf('>生平</h2>') < source.indexOf('>代表句</span>'))
  assert.ok(source.indexOf('>代表句</span>') < source.indexOf('>传世诗篇</h2>'))
})

test('B-1 画像使用大尺寸、3:4 contain 和右侧渐隐层', () => {
  assert.match(source, /\.pd-portrait\s*\{[\s\S]*?width:\s*clamp\(360px/)
  assert.match(source, /aspect-ratio:\s*3\s*\/\s*4/)
  assert.match(source, /object-fit:\s*contain/)
  assert.match(source, /\.pd-hero__art::after\s*\{[\s\S]*?linear-gradient\([^;]*var\(--bg-primary\)/)
})

test('代表句是指向诗词详情的真实链接，并在头像失败时显示占位', () => {
  assert.match(source, /:to="`\/poems\/\$\{signature\.id\}`"/)
  assert.match(source, /avatarLoadFailed/)
  assert.match(source, /InkPlaceholder/)
  assert.match(source, /@error="onAvatarError"/)
})

test('生平正文使用宽幅阅读列而非窄 measure 卡片', () => {
  assert.match(source, /grid-template-columns:\s*minmax\(180px,\s*0\.28fr\)/)
  assert.match(source, /max-width:\s*var\(--measure-wide\)/)
  assert.doesNotMatch(source, /\.pd-bio[\s\S]*?max-width:\s*var\(--measure\)/)
})
