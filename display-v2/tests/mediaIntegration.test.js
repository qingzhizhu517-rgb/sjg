import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const readSource = (relativePath) =>
  readFile(new URL(`../src/${relativePath}`, import.meta.url), 'utf8')

test('诗人和景点详情使用统一媒体解析并应用精选构图', async () => {
  const [poet, spot] = await Promise.all([
    readSource('views/PoetDetail.vue'),
    readSource('views/SpotDetail.vue'),
  ])

  for (const source of [poet, spot]) {
    assert.match(source, /resolveFirstImage/)
    assert.match(source, /getCuratedPresentation/)
    assert.match(source, /objectFit/)
    assert.match(source, /objectPosition/)
  }
})

test('地区、文化详情和饮食戏曲列表不再直接挑数据库图片字段', async () => {
  const [region, cultural, foodOpera] = await Promise.all([
    readSource('views/RegionSpots.vue'),
    readSource('views/CulturalDetail.vue'),
    readSource('views/FoodOperaList.vue'),
  ])

  for (const source of [region, cultural, foodOpera]) {
    assert.match(source, /resolveFirstImage/)
    assert.match(source, /getCuratedPresentation/)
  }

  assert.doesNotMatch(cultural, /parseFirstUrl\(item\.value\?\.imageAnimeUrl\)/)
  assert.doesNotMatch(foodOpera, /parseFirstUrl\(item\.imageAnimeUrl\)/)
})
