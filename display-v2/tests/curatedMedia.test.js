import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CURATED_MEDIA, getCuratedPresentation } from '../src/config/curatedMedia.js'

test('20 张精选素材全部有展示配置', () => {
  assert.equal(Object.keys(CURATED_MEDIA).length, 20)
})

test('诗人素材使用竖幅展签', () => {
  assert.deepEqual(getCuratedPresentation('/images/poets/li_qingzhao_anime.webp'), {
    aspectRatio: '3 / 4',
    objectFit: 'contain',
    objectPosition: 'center center',
    kind: 'portrait',
  })
})

test('横幅景点保留完整构图', () => {
  assert.equal(getCuratedPresentation('/images/spots/daming_lake_anime.png').objectFit, 'contain')
  assert.equal(getCuratedPresentation('/images/spots/daming_lake_anime.png').aspectRatio, '16 / 9')
})

test('方形文化图使用 1:1', () => {
  assert.equal(getCuratedPresentation('/images/cultural/lu_brocade_weaving.webp').aspectRatio, '1 / 1')
})
