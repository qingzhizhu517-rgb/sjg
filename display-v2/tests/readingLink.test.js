import test from 'node:test'
import assert from 'node:assert/strict'
import { reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import * as atlas from '../src/config/atlasPreview.js'
import * as emotions from '../src/utils/atlasEmotion.js'
import { safeReturnPath } from '../src/config/siteNavigation.js'
import { NINE_CITIES } from '../src/config/nineCities.js'
import { cityExperiences } from '../src/config/cityExperiences.js'
import { setupPage, testRoute, settle } from './helpers/componentSetup.js'

const reading = await import('../src/utils/readingLink.js').catch(() => ({}))
const router = createRouter({ history: createMemoryHistory(), routes: [
  { path: '/reading', component: {} },
  { path: '/learn/:taskCode', component: {} },
] })
const queryOf = link => Object.fromEntries(new URL(router.resolve(link).fullPath, 'https://sjg.local').searchParams)
const build = (...args) => {
  assert.equal(typeof reading.buildReadingLink, 'function', '需要统一的上下文阅读链接构造器')
  return reading.buildReadingLink(...args)
}

test('阅读链接携带已知上下文并仅编码一次中文与检索返回路径', () => {
  const returnTo = '/poems?region=%E6%B5%8E%E5%8D%97&keyword=山水#result'
  const link = build({ poem: 12, compare: '19', spot: 2, region: '济南 & 湖', returnTo })
  assert.equal(router.resolve(link).path, '/reading')
  assert.deepEqual(queryOf(link), { poem: '12', compare: '19', spot: '2', region: '济南 & 湖', returnTo })
})

test('阅读链接仅接受安全的正整数实体 ID，不把标题或对象拼入查询', () => {
  for (const invalid of [0, -1, 1.5, NaN, Infinity, true, '1e2', '+1', '1.0', ' 2 ', '02', '望岳', [], {}, Number.MAX_SAFE_INTEGER + 1]) {
    assert.deepEqual(queryOf(build({ poem: invalid, compare: invalid, spot: invalid })), {})
  }
  assert.deepEqual(queryOf(build({ poem: '2', compare: 3, spot: '4' })), { poem: '2', compare: '3', spot: '4' })
})

test('阅读链接省略外部返回地址及全部城市状态', () => {
  for (const returnTo of ['https://example.com', '//example.com', '/\\example.com', '/\nexample.com', ['https://example.com'], null]) {
    assert.deepEqual(queryOf(build({ region: '全部', returnTo })), {})
  }
  assert.deepEqual(queryOf(build({ region: ' 济南 ', returnTo: '/spots/2?tab=map' })), { region: '济南', returnTo: '/spots/2?tab=map' })
  assert.deepEqual(queryOf(build()), {})
})

test('阅读链接通过 atlasLink 保留预览，查询保持解码后的原始值', () => {
  const returnTo = '/regions/%E6%B5%8E%E5%8D%97?preview=inkwash'
  const link = build({ poem: 301, region: '济南', returnTo }, { query: { preview: 'inkwash' } })
  assert.deepEqual(link, { path: '/reading', query: { poem: '301', region: '济南', returnTo, preview: 'inkwash' }, hash: '' })
  assert.equal(queryOf(link).returnTo, returnTo)
})

async function openPage(relativePath, boundary, get = async () => ({ records: [] }), props = {}) {
  const page = await setupPage(relativePath, {
    ...atlas, ...emotions, ...reading, safeReturnPath, NINE_CITIES, cityExperiences,
    useRoute: () => boundary.route, useRouter: () => boundary.router,
    useImage: () => ({ resolveFirstImage: fields => fields.find(Boolean) || '' }),
    parseTags: () => [], parseFirstUrl: () => '',
    adaptPoem: () => ({ image: '' }), adaptSpot: () => ({ image: '' }), pickMoodBackdrop: () => '',
    api: { get },
  }, props)
  await page.ready
  await settle()
  return page
}

function entryQuery(page) {
  assert.match(page.template, /<router-link\b[^>]*:to="readingLink"[^>]*>\s*AI对照阅读[^<]*<\/router-link>/, '必须提供真实 RouterLink 阅读入口')
  assert.ok(page.state.readingLink, '页面应提供上下文阅读链接')
  return queryOf(page.state.readingLink.value)
}

test('诗词列表入口跟随当前城市，列表失败时也不伪造诗词 ID', async t => {
  const boundary = testRoute('/poems', { region: '济南', keyword: '望' })
  const page = await openPage('views/PoemList.vue', boundary, async () => { throw new Error('请求失败') })
  t.after(page.dispose)
  assert.ok(page.state.errorMsg.value)
  assert.deepEqual(entryQuery(page), { region: '济南', returnTo: boundary.route.fullPath })
  boundary.route.query = { region: '泰安' }; await settle()
  assert.equal(entryQuery(page).region, '泰安')
  boundary.route.query = {}; await settle()
  assert.equal(entryQuery(page).region, undefined)
})

test('诗词详情入口使用当前已加载作品，失败后不会复用旧诗词或路由 ID', async t => {
  const boundary = testRoute('/poems/12', {}, { id: '12' })
  const page = await openPage('views/PoemDetail.vue', boundary, async url => {
    if (url === '/poems/12') return { poem: { id: 12 }, spot: { id: 2, region: '济南' } }
    throw new Error('未发布或不存在')
  })
  t.after(page.dispose)
  assert.equal(entryQuery(page).poem, '12')
  assert.equal(entryQuery(page).returnTo, boundary.route.fullPath)
  boundary.route.params.id = '99'; boundary.route.path = '/poems/99'; await settle()
  assert.ok(page.state.errorMsg.value)
  assert.equal(queryOf(page.state.readingLink.value).poem, undefined)
})

test('景点入口带当前景点与城市，从可用关联诗词中选两首不同作品', async t => {
  const boundary = testRoute('/spots/2', { tab: 'poets' }, { id: '2' })
  const page = await openPage('views/SpotDetail.vue', boundary, async url => url === '/spots/2'
    ? { spot: { id: 2, region: '济南' }, poems: [{ id: 0 }, { id: '1e2' }, { id: 12 }, { id: '12' }, { id: 19 }] }
    : { records: [] })
  t.after(page.dispose)
  assert.deepEqual(entryQuery(page), { poem: '12', compare: '19', spot: '2', region: '济南', returnTo: boundary.route.fullPath })
  page.state.poems.value = [{ id: 12 }]; await settle()
  assert.equal(entryQuery(page).compare, undefined)
  page.state.poems.value = []; await settle()
  assert.deepEqual(entryQuery(page), { spot: '2', region: '济南', returnTo: boundary.route.fullPath })
})

test('景点载入失败时阅读上下文不使用未审核的路由参数', async t => {
  const boundary = testRoute('/spots/99', {}, { id: '99' })
  const page = await openPage('views/SpotDetail.vue', boundary, async () => { throw new Error('请求失败') })
  t.after(page.dispose)
  assert.ok(page.state.loadError.value)
  assert.ok(page.state.readingLink, '失败状态也应清空阅读上下文')
  assert.deepEqual(queryOf(page.state.readingLink.value), { returnTo: boundary.route.fullPath })
})

test('城市体验入口响应城市切换并保留预览', async t => {
  const boundary = testRoute('/regions/济南', { preview: 'inkwash' }, { region: '济南' })
  const props = reactive({ region: '济南', cityImage: '/jinan.webp' })
  const page = await openPage('components/CityExperiences.vue', boundary, undefined, props)
  t.after(page.dispose)
  assert.equal(entryQuery(page).region, '济南')
  assert.equal(entryQuery(page).preview, 'inkwash')
  props.region = '东营'; await settle()
  assert.equal(entryQuery(page).region, '东营')
  assert.equal(entryQuery(page).poem, undefined)
})

test('学习任务索引提供辅助阅读入口并保留 taskCode 校验与既有分享流程', async t => {
  const boundary = testRoute('/learn', { preview: 'inkwash' })
  const page = await openPage('views/LearningTaskIndex.vue', boundary)
  t.after(page.dispose)
  assert.deepEqual(entryQuery(page), { returnTo: boundary.route.fullPath, preview: 'inkwash' })
  page.state.taskCode.value = 'bad/code'; page.state.openTask()
  assert.ok(page.state.errorMsg.value)
  assert.equal(boundary.destinations.length, 0)
  page.state.taskCode.value = ' JINAN-POETRY-01 '; page.state.openTask()
  assert.equal(page.state.errorMsg.value, '')
  const task = router.resolve(boundary.destinations[0])
  assert.equal(task.path, '/learn/jinan-poetry-01')
  assert.equal(task.query.preview, 'inkwash')
})
