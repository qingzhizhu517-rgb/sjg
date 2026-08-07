import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveCityHeroMedia } from '../src/utils/cityHeroMedia.js'

const illustration = '/assets/city-jinan.png'

test('inkwash 恒用插画，不查 manifest', () => {
  const resolveAsset = () => ({ url: '/media/inkwash/x.mp4', type: 'video', poster: null })
  const r = resolveCityHeroMedia({ isReal: false, slug: 'jinan', resolveAsset, illustration })
  assert.deepEqual(r, { type: 'image', url: illustration, poster: null, kind: 'illustration' })
})

test('real 有素材时用 manifest 媒体（视频）', () => {
  const resolveAsset = (key) =>
    key === 'city-jinan' ? { url: '/media/real/cities/jinan.mp4', type: 'video', poster: '/media/real/cities/jinan-poster.jpg' } : null
  const r = resolveCityHeroMedia({ isReal: true, slug: 'jinan', resolveAsset, illustration })
  assert.deepEqual(r, { url: '/media/real/cities/jinan.mp4', type: 'video', poster: '/media/real/cities/jinan-poster.jpg', kind: 'media' })
})

test('real 缺素材时回退插画', () => {
  const resolveAsset = () => null
  const r = resolveCityHeroMedia({ isReal: true, slug: 'jinan', resolveAsset, illustration })
  assert.deepEqual(r, { type: 'image', url: illustration, poster: null, kind: 'illustration' })
})

test('real 缺素材且无插画返回 null', () => {
  const r = resolveCityHeroMedia({ isReal: true, slug: 'nowhere', resolveAsset: () => null, illustration: null })
  assert.equal(r, null)
})
