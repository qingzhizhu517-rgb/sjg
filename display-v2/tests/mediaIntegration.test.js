import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const readSource = (relativePath) =>
  readFile(new URL(`../src/${relativePath}`, import.meta.url), 'utf8')

// 专属册页插画可以自行决定构图；数据库媒体仍须使用统一解析器处理字段与候选路径。
for (const [view, primaryField, fallbackField] of [
  ['views/PoetDetail.vue', 'avatarAnimeUrl', 'avatarUrl'],
  ['views/SpotDetail.vue', 'imageAnimeUrl', 'imageUrl'],
  ['views/RegionSpots.vue', 'imageAnimeUrl', 'imageUrl'],
  ['views/CulturalDetail.vue', 'imageAnimeUrl', 'imageUrl'],
  ['components/CultureCollection.vue', 'imageAnimeUrl', 'imageUrl'],
]) {
  test(`${view} 的普通媒体仍由统一解析器读取候选字段`, async () => {
    const source = await readSource(view)
    assert.match(source, /useImage\s*\(/)
    assert.match(source, new RegExp(`resolveFirstImage\\s*\\(\\s*\\[[^\\]]*\\b${primaryField}\\b[^\\]]*\\b${fallbackField}\\b[^\\]]*\\]`))
  })
}

test('文化详情和饮食戏曲列表没有绕开解析器直接选取原始媒体字段', async () => {
  const [cultural, foodOpera] = await Promise.all([
    readSource('views/CulturalDetail.vue'),
    readSource('components/CultureCollection.vue'),
  ])
  assert.doesNotMatch(cultural, /parseFirstUrl\(item\.value\?\.imageAnimeUrl\)/)
  assert.doesNotMatch(foodOpera, /parseFirstUrl\(item\.imageAnimeUrl\)/)
})

test('三个文化栏目复用同一个媒体解析与筛选组件', async () => {
  for (const [view, category] of [['FestivalList', 'festival'], ['LiteratureList', 'literature'], ['FoodOperaList', 'food_opera']]) {
    const source = await readSource(`views/${view}.vue`)
    assert.match(source, new RegExp(`<CultureCollection category="${category}"`))
  }
})
