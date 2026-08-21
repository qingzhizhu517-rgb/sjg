import { test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { resolveCityHeroMedia } from '../src/utils/cityHeroMedia.js'

const illustration = '/assets/city-jinan.png'

test('有 manifest 素材时用它（视频优先）', () => {
  const resolveAsset = (key) =>
    key === 'city-jinan'
      ? { url: '/media/real/cities/jinan.mp4', type: 'video', poster: '/media/real/cities/jinan-poster.jpg' }
      : null
  const r = resolveCityHeroMedia({ slug: 'jinan', resolveAsset, illustration })
  assert.deepEqual(r, {
    url: '/media/real/cities/jinan.mp4',
    type: 'video',
    poster: '/media/real/cities/jinan-poster.jpg',
    kind: 'media',
  })
})

test('缺素材时回退插画', () => {
  const resolveAsset = () => null
  const r = resolveCityHeroMedia({ slug: 'jinan', resolveAsset, illustration })
  assert.deepEqual(r, { type: 'image', url: illustration, poster: null, kind: 'illustration' })
})

test('缺素材且无插画返回 null', () => {
  const r = resolveCityHeroMedia({ slug: 'nowhere', resolveAsset: () => null, illustration: null })
  assert.equal(r, null)
})

test('空 slug 不查 manifest，直接回退插画', () => {
  const resolveAsset = mock.fn(() => ({ url: '/media/x.mp4', type: 'video', poster: null }))
  const r = resolveCityHeroMedia({ slug: '', resolveAsset, illustration })
  assert.deepEqual(r, { type: 'image', url: illustration, poster: null, kind: 'illustration' })
  assert.equal(resolveAsset.mock.callCount(), 0)
})

test('有素材但无插画时仍用素材', () => {
  const resolveAsset = () => ({ url: '/media/real/cities/heze.png', type: 'image', poster: null })
  const r = resolveCityHeroMedia({ slug: 'heze', resolveAsset, illustration: null })
  assert.deepEqual(r, { url: '/media/real/cities/heze.png', type: 'image', poster: null, kind: 'media' })
})
