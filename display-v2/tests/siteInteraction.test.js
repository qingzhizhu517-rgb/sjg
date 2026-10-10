import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { siteSections, sectionForPath, isSectionLinkActive, safeReturnPath } from '../src/config/siteNavigation.js'
import * as atlas from '../src/config/atlasPreview.js'
import { culturePreviewItems } from '../src/config/culturePreview.js'
import { NINE_CITIES } from '../src/config/nineCities.js'
import { setupPage, testRoute, settle } from './helpers/componentSetup.js'
import { ref, reactive } from 'vue'
import * as emotions from '../src/utils/atlasEmotion.js'
import { NINE_SIGHTS } from '../src/config/nineSights.js'

test('各分区与详情路由定位正确，九城山水保持同一导航高亮', () => {
  for (const [path, section] of [['/regions/济南', 'landscape'], ['/spots/2', 'landscape'], ['/poems/302', 'literary'], ['/poets', 'literary'], ['/timeline', 'literary'], ['/food-opera/805', 'culture'], ['/cities/泰安', 'culture'], ['/learn/test', 'learning'], ['/compose', 'learning']]) {
    assert.equal(sectionForPath(path)?.id, section)
  }
  assert.equal(sectionForPath('/poems-other'), null)
  assert.equal(sectionForPath('/map'), null)
  const link = siteSections[0].links[0]
  for (const city of NINE_CITIES) assert.equal(isSectionLinkActive(`/regions/${encodeURIComponent(city)}`, link), true)
  assert.equal(isSectionLinkActive('/spots/2', link), true)
  assert.equal(isSectionLinkActive('/river-sandbox', link), false)
})

test('返回链接保留检索条件，只接受站内路径', () => {
  const valid = '/poems?keyword=望&region=泰安&preview=inkwash'
  assert.equal(safeReturnPath(valid, '/poems'), valid)
  for (const value of ['//example.com', 'https://example.com', '/\\example.com', '/\nexample.com', null, ['//example.com']]) {
    assert.equal(safeReturnPath(value, '/poems'), '/poems')
  }
  const link = atlas.atlasLink('/poems?region=济南#list', { query: { preview: 'inkwash' } })
  assert.deepEqual(link, { path: '/poems', query: { region: '济南', preview: 'inkwash' }, hash: '#list' })
})

async function openCollection({ path = '/poems', query = { preview: 'inkwash' }, get, category } = {}) {
  const boundary = testRoute(path, query)
  const calls = []
  const page = await setupPage(category ? 'components/CultureCollection.vue' : 'views/PoemList.vue', {
    ...atlas, culturePreviewItems, NINE_CITIES,
    useRoute: () => boundary.route, useRouter: () => boundary.router,
    useImage: () => ({ resolveFirstImage: fields => fields.find(Boolean) || '' }),
    api: { get: async (path, options) => { calls.push([path, options]); return get ? get(path, options) : { records: [] } } },
  }, category ? { category } : {})
  await page.ready
  await settle()
  return { ...page, ...boundary, calls }
}

test('诗词检索、城市筛选、详情返回与清除沿用真实页面逻辑，预览不访问公开接口', async t => {
  const page = await openCollection()
  t.after(page.dispose)
  page.state.keywordInput.value = '望岳'
  await page.state.submitSearch(); await settle()
  await page.state.setRegion('泰安'); await settle()
  assert.deepEqual(page.state.items.value.map(item => item.id), [302])
  const link = page.state.poemLink(page.state.items.value[0])
  assert.equal(link.query.returnTo, page.route.fullPath)
  assert.equal(link.query.preview, 'inkwash')
  page.route.query = { preview: 'inkwash', region: '济南', keyword: '如梦令' }
  await settle()
  assert.equal(page.state.keywordInput.value, '如梦令')
  assert.equal(page.state.region.value, '济南')
  assert.deepEqual(page.state.items.value.map(item => item.id), [306, 309])
  await page.state.clearSearch(); await settle()
  assert.equal(page.state.items.value.length, atlas.previewPoems.length)
  assert.equal(page.calls.length, 0)
})

test('文化检索返回恢复城市与关键词，无匹配条目可重置', async t => {
  const page = await openCollection({ path: '/festivals', category: 'festival', query: { preview: 'inkwash', region: '济南', keyword: '灯' } })
  t.after(page.dispose)
  assert.deepEqual(page.state.filtered.value.map(item => item.id), [802])
  assert.equal(page.state.detailLink(page.state.filtered.value[0]).query.returnTo, page.route.fullPath)
  page.route.query = { preview: 'inkwash', region: '菏泽', keyword: '牡丹' }
  await settle()
  assert.equal(page.state.draft.value, '牡丹')
  assert.deepEqual(page.state.filtered.value.map(item => item.id), [801])
  page.state.draft.value = '不存在的内容'; page.state.search(); await settle()
  assert.equal(page.state.filtered.value.length, 0)
  page.state.reset(); await settle()
  assert.equal(page.state.filtered.value.length, 2)
  assert.equal(page.calls.length, 0)
})

test('普通模式接口失败不会混入设计样本，重试可恢复', async t => {
  for (const category of [undefined, 'literature']) {
    let failed = true
    const page = await openCollection({ category, query: { preview: 'true' }, get: async () => { if (failed) throw new Error('unavailable'); return { records: [{ id: 90, title: '真实记录' }] } } })
    t.after(page.dispose)
    assert.ok((category ? page.state.error : page.state.errorMsg).value)
    assert.deepEqual(page.state.items.value, [])
    failed = false
    await page.state.load()
    assert.deepEqual(page.state.items.value.map(item => item.id), [90])
    assert.equal((category ? page.state.error : page.state.errorMsg).value, '')
  }
})

test('快速切换城市时较慢的旧请求不能覆盖当前结果', async t => {
  for (const category of [undefined, 'food_opera']) {
    const pending = []
    const page = await openCollection({ category, query: {}, get: () => new Promise(resolve => pending.push(resolve)) })
    t.after(page.dispose)
    page.route.query = { region: '济南' }; await settle()
    assert.equal(pending.length, 2)
    pending[1]({ records: [{ id: 2, title: '济南结果' }] }); await settle()
    pending[0]({ records: [{ id: 1, title: '旧结果' }] }); await settle()
    assert.deepEqual(page.state.items.value.map(item => item.id), [2])
  }
})

test('导航组件接入主布局且研学入口可通过分区与全站导览到达', async () => {
  const [app, header] = await Promise.all(['App.vue', 'components/layout/SiteHeader.vue'].map(path => readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')))
  assert.match(app, /<SiteHeader\s*\/>/)
  const learning = siteSections.find(section => section.id === 'learning')
  assert.equal(learning.path, '/learn')
  assert.ok(learning.links.some(link => link.path === '/learn' && link.label === '探究任务'))
  assert.match(header, /v-for="section in siteSections"/)
  assert.match(header, /v-for="link in section.links"/)
})

test('景点页从网址恢复朝代和浏览方式，键盘切换后焦点落到目标标签', async t => {
  const boundary = testRoute('/spots/2', { preview: 'inkwash', dynasty: '5', tab: 'poets' }, { id: '2' })
  const focused = []
  const page = await setupPage('views/SpotDetail.vue', {
    ...atlas, ...emotions,
    useRoute: () => boundary.route, useRouter: () => boundary.router,
    useImage: () => ({ resolveFirstImage: fields => fields.find(Boolean) || '' }),
    document: { getElementById: id => ({ focus: () => focused.push(id) }) },
    api: { get() { assert.fail('设计样本不应调用公开接口') } },
  })
  t.after(page.dispose)
  await page.ready; await settle()
  assert.equal(page.state.selectedDynasty.value, '5')
  assert.equal(page.state.activeTab.value, 'poets')
  assert.deepEqual(page.state.filteredPoems.value.map(poem => poem.id), [306, 309])
  page.state.onTabKeydown({ key: 'Home', preventDefault() {} }, 'poets')
  await settle()
  assert.equal(page.state.activeTab.value, 'timeline')
  assert.equal(focused.at(-1), 'spot-tab-timeline')
  boundary.route.query = { preview: 'inkwash', tab: 'map' }; await settle()
  assert.equal(page.state.selectedDynasty.value, 'all')
  assert.equal(page.state.activeTab.value, 'map')
})

test('首页九城卡片在设计预览中均显示对应景点，且不访问生产接口', async t => {
  for (const sight of NINE_SIGHTS) {
    const boundary = testRoute(`/spots/${sight.spotId}`, { preview: 'inkwash' }, { id: String(sight.spotId) })
    const page = await setupPage('views/SpotDetail.vue', {
      ...atlas, ...emotions,
      useRoute: () => boundary.route, useRouter: () => boundary.router,
      useImage: () => ({ resolveFirstImage: fields => fields.find(Boolean) || '' }),
      api: { get() { assert.fail('设计预览不应调用公开接口') } },
    })
    t.after(page.dispose)
    await page.ready; await settle()
    assert.equal(page.state.spot.value.name, sight.name)
    assert.equal(page.state.spot.value.region, sight.city)
    assert.deepEqual(page.state.sources.value, [])
    assert.equal(page.state.loadError.value, '')
  }
})

test('时间线响应外部朝代变化且不回写循环，手动选择才发出导航事件', async t => {
  const props = reactive({ data: atlas.previewDynasties.map(dynasty => ({ dynasty, poems: [], poets: [] })), initialDynastyId: '5' })
  const moves = []
  const engine = { progress: ref(0), activeDynastyIndex: ref(0), isCruising: ref(false), dynastyNodes: ref([]), init() {}, goToDynasty: index => moves.push(index), autoCruise() {}, pauseCruise() {}, toggleCruise() {}, dispose() {} }
  const page = await setupPage('components/timeline/InkTimeline.vue', {
    atlasLink: atlas.atlasLink, useRoute: () => ({ query: { preview: 'inkwash' } }),
    window: { matchMedia: () => ({ matches: true }) }, useBoatJourney: () => engine,
  }, props)
  t.after(page.dispose)
  page.state.pathRef.value = {}; page.state.boatRef.value = {}
  page.state.tryInitBoat()
  assert.equal(moves.at(-1), 1)
  props.initialDynastyId = '8'; await settle()
  assert.equal(moves.at(-1), 4)
  assert.equal(page.events.length, 0)
  page.state.selectDynasty(0)
  assert.equal(page.events.length, 1)
  assert.equal(page.events[0][1].id, 4)
})
