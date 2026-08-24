import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  shouldAutoRotate,
  visibleTermIndexes,
  wrapTermIndex,
} from '../src/utils/solarTermGallery.js'

const riverHeroSource = readFileSync(
  new URL('../src/components/homepage/RiverHero.vue', import.meta.url),
  'utf8',
)
const solarTermGallerySource = readFileSync(
  new URL('../src/components/homepage/SolarTermGallery.vue', import.meta.url),
  'utf8',
)

test('wrapTermIndex 处理首尾循环', () => {
  assert.equal(wrapTermIndex(-1, 24), 23)
  assert.equal(wrapTermIndex(24, 24), 0)
  assert.equal(wrapTermIndex(7, 24), 7)
})

test('桌面窗口为当前、前两项、后三项', () => {
  assert.deepEqual(visibleTermIndexes(5, 24), [3, 4, 5, 6, 7, 8])
})

test('窗口在立春处正确跨年循环', () => {
  assert.deepEqual(visibleTermIndexes(0, 24), [22, 23, 0, 1, 2, 3])
})

test('仅在页面可见、窗口聚焦且用户未交互时自动轮播', () => {
  const ready = {
    autoPlay: true,
    reducedMotion: false,
    pageVisible: true,
    windowFocused: true,
    pointerInside: false,
    focusWithin: false,
  }

  assert.equal(shouldAutoRotate(ready), true)
  assert.equal(shouldAutoRotate({ ...ready, reducedMotion: true }), false)
  assert.equal(shouldAutoRotate({ ...ready, pageVisible: false }), false)
  assert.equal(shouldAutoRotate({ ...ready, windowFocused: false }), false)
  assert.equal(shouldAutoRotate({ ...ready, pointerInside: true }), false)
  assert.equal(shouldAutoRotate({ ...ready, focusWithin: true }), false)
})

test('短屏桌面压缩 Hero 纵向间距以保留画廊控制行', () => {
  const ruleStart = riverHeroSource.indexOf('@media (min-width: 981px) and (max-height: 800px)')
  const nextRuleStart = riverHeroSource.indexOf('@media (max-width: 980px)', ruleStart)
  assert.notEqual(ruleStart, -1, '应为宽屏短视口提供专用布局规则')
  const shortDesktopRule = riverHeroSource.slice(ruleStart, nextRuleStart)
  assert.match(shortDesktopRule, /\.rh\s*\{[\s\S]*?min-height:\s*0;/)
  assert.match(shortDesktopRule, /\.rh\s*\{[\s\S]*?padding:\s*var\(--sp-4\)\s+var\(--sp-5\);/)
  assert.match(
    shortDesktopRule,
    /\.rh__inner\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.8fr\)\s+minmax\(300px,\s*1fr\);/,
  )

  const galleryRuleStart = solarTermGallerySource.indexOf(
    '@media (min-width: 981px) and (max-height: 800px)',
  )
  const nextGalleryRuleStart = solarTermGallerySource.indexOf('@media (max-width: 760px)', galleryRuleStart)
  assert.notEqual(galleryRuleStart, -1, '画廊应为宽屏短视口提供间距规则')
  const shortGalleryRule = solarTermGallerySource.slice(galleryRuleStart, nextGalleryRuleStart)
  assert.match(
    shortGalleryRule,
    /\.solar-gallery__thumbs\s*,[\s\S]*?\.solar-gallery__controls\s*\{[\s\S]*?margin-top:\s*var\(--sp-1\);/,
  )
})
