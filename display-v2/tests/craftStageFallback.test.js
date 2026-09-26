import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/components/craft/CraftStage.vue', import.meta.url), 'utf8')

test('GLB 加载失败进入降级模式时立即选中当前工序静态图', () => {
  const activateFallback = source.match(/const activateFallback = \(\) => \{([\s\S]*?)\n\}/)?.[1] || ''
  assert.match(
    activateFallback,
    /fallback\.value\s*=\s*true[\s\S]*?updateFallbackImage\(\)/,
    '模型加载失败后应同步 fallbackSrc，不能只显示空占位',
  )
})
