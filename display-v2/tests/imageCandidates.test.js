import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildLocalImageCandidates,
  pickExistingImage,
  firstMediaValue,
} from '../src/utils/imageCandidates.js'

test('PNG 数据库路径优先命中同名 WebP，再回退原路径', () => {
  assert.deepEqual(
    buildLocalImageCandidates('/images/poets/li_qingzhao_anime.png'),
    [
      '/images/poets/li_qingzhao_anime.webp',
      '/images/poets/li_qingzhao_anime.png',
    ],
  )
})

test('显式请求水墨候选时，在精确路径之后尝试 _anime 变体', () => {
  assert.deepEqual(
    buildLocalImageCandidates('/images/poets/li_qingzhao.jpg', { inkwash: true }),
    [
      '/images/poets/li_qingzhao.webp',
      '/images/poets/li_qingzhao.jpg',
      '/images/poets/li_qingzhao_anime.webp',
      '/images/poets/li_qingzhao_anime.png',
      '/images/poets/li_qingzhao_anime.jpg',
    ],
  )
})

test('已经带 _anime 的路径不重复追加后缀', () => {
  const paths = buildLocalImageCandidates('/images/spots/daming_lake_anime.png', { inkwash: true })
  assert.equal(paths.filter((path) => path.includes('_anime_anime')).length, 0)
})

test('pickExistingImage 返回第一个真实存在的候选', () => {
  const existing = new Set(['/images/a.png', '/images/a.webp'])
  assert.equal(pickExistingImage('/images/a.png', existing), '/images/a.webp')
})

test('firstMediaValue 跳过空值并保持字段优先顺序', () => {
  assert.equal(firstMediaValue([null, '', '/images/anime.webp', '/images/real.jpg']), '/images/anime.webp')
})

test('firstMediaValue 先解析 JSON 数组字段，再选择首个有效媒体值', () => {
  assert.equal(
    firstMediaValue(['[]', '["/images/anime.webp"]', '/images/real.jpg']),
    '/images/anime.webp',
  )
})
