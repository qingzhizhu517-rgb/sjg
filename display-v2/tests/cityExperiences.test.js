import test from 'node:test'
import assert from 'node:assert/strict'
import { ref, reactive } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import * as atlas from '../src/config/atlasPreview.js'
import { pickSignaturePoem } from '../src/utils/poem.js'
import { setupPage, testRoute, settle } from './helpers/componentSetup.js'

import * as config from '../src/config/cityExperiences.js'
const router = createRouter({ history: createMemoryHistory(), routes: ['/poets', '/poems', '/cities/:region', '/food-opera'].map(path => ({ path, component: {} })) })

test('体验入口分别通向本城景点、名士、诗词与城市文化，预览保留且参数只编码一次', () => {
  assert.equal(typeof config.cityExperiences, 'function', '需要可用的城市体验配置')
  for (const region of ['济南', '泰安', '东营']) {
    const { primary, secondary } = config.cityExperiences(region, '/local-city.webp')
    assert.equal(primary.href, '#city-spots')
    assert.equal(secondary.length, 3)
    for (const preview of [undefined, 'inkwash']) {
      const destinations = secondary.map(item => router.resolve(atlas.atlasLink(item.to, { query: { preview } })))
      assert.equal(destinations[0].path, '/poets')
      assert.equal(destinations[0].query.region, region)
      assert.equal(destinations[1].path, '/poems')
      assert.equal(destinations[1].query.region, region)
      assert.ok(destinations[2].params.region === region || destinations[2].query.region === region)
      for (const destination of destinations) assert.equal(destination.query.preview, preview)
    }
  }
})

test('济南图像独立，其他城市使用本城主图与三个不同图形', () => {
  assert.equal(typeof config.cityExperiences, 'function', '需要可用的城市体验配置')
  const jinan = config.cityExperiences('济南', '/old-jinan.webp')
  assert.equal(new Set([jinan.primary.image, ...jinan.secondary.map(item => item.image)]).size, 4)
  assert.match(jinan.primary.image, /jinan-springs-v1.webp$/)
  const dongying = config.cityExperiences('东营', '/dongying.webp')
  assert.equal(dongying.primary.image, '/dongying.webp')
  assert.equal(new Set(dongying.secondary.map(item => item.glyph)).size, 3)
  assert.ok(dongying.secondary.every(item => !item.image))
})

async function openPoets(query, swrGet, graphDependencies = {}) {
  const boundary = testRoute('/poets', query)
  const calls = []
  const page = await setupPage('views/PoetList.vue', {
    ...atlas, pickSignaturePoem,
    useRoute: () => boundary.route, useRouter: () => boundary.router,
    useTheme: () => ({ isAnime: ref(true) }), useImage: () => ({ getImageUrl: value => value }),
    usePoetEnrichment: () => ({ map: ref({}), build: async () => {}, enrich: value => value }),
    useReveal: () => ({ reveal() {} }),
    ...graphDependencies,
    api: { get: graphDependencies.get, swrGet: (path, params) => { calls.push([path, params]); return swrGet ? swrGet(path, params) : Promise.resolve({ data: { records: [] } }) } },
  })
  return { ...boundary, ...page, calls }
}

test('真实名士页把当前城市传给公开接口，切城重新加载并拒绝慢旧响应', async t => {
  const pending = []
  const page = await openPoets({ region: '济南', dynasty: '5' }, () => new Promise(resolve => pending.push(resolve)))
  t.after(page.dispose)
  assert.equal(page.calls[0][1].region, '济南')
  page.route.query = { region: '泰安', dynasty: '5' }; await settle()
  assert.equal(page.calls.length, 2)
  assert.equal(page.calls[1][1].region, '泰安')
  pending[1]({ data: { records: [{ id: 2, name: '泰安名士', dynastyId: 5, completeness: 50 }] } }); await settle()
  pending[0]({ data: { records: [{ id: 1, name: '旧城名士', dynastyId: 5 }] } }); await page.ready; await settle()
  assert.deepEqual(page.state.filteredEnrichedPoets.value.map(poet => poet.id), [2])
  assert.equal(page.state.selectedDynastyId.value, 5)
})

test('名士预览按出生地或生平筛选本城，清除条件保留preview与视图', async t => {
  const page = await openPoets({ region: '济南', preview: 'inkwash', view: 'all' })
  t.after(page.dispose)
  await page.ready; await settle()
  assert.deepEqual(page.state.filteredEnrichedPoets.value.map(poet => poet.name), ['李清照', '老舍'])
  page.route.query = { region: '泰安', preview: 'inkwash', view: 'all' }; await settle()
  assert.deepEqual(page.state.filteredEnrichedPoets.value, [])
  page.state.clearPoetFilters(); await settle()
  assert.equal(page.route.query.region, undefined)
  assert.equal(page.route.query.preview, 'inkwash')
  assert.equal(page.route.query.view, 'all')
  assert.equal(page.state.filteredEnrichedPoets.value.length, atlas.previewPoets.length)
  assert.equal(page.calls.length, 0)
})

test('体验组件响应城市切换，主推荐保持原生页内锚点', async t => {
  assert.equal(typeof config.cityExperiences, 'function', '需要可用的城市体验配置')
  const props = reactive({ region: '济南', cityImage: '/jinan.webp', pending: true })
  const page = await setupPage('components/CityExperiences.vue', { cityExperiences: config.cityExperiences, atlasLink: atlas.atlasLink, useRoute: () => ({ query: { preview: 'inkwash' } }) }, props)
  t.after(page.dispose)
  assert.equal(page.state.experiences.value.primary.title, '泉畔漫游')
  assert.equal(page.state.experiences.value.primary.href, '#city-spots')
  props.region = '东营'; props.cityImage = '/dongying.webp'; await settle()
  assert.equal(page.state.experiences.value.primary.image, '/dongying.webp')
  assert.equal(router.resolve(page.state.experienceLink(page.state.experiences.value.secondary[0])).query.region, '东营')
})

test('体验主图与城市画像相同时只保留一次，独立场景图仍展示', async t => {
  const props = reactive({ region: '菏泽', cityImage: '/heze.webp', pending: false })
  const page = await setupPage('components/CityExperiences.vue', {
    cityExperiences: config.cityExperiences, atlasLink: atlas.atlasLink,
    useRoute: () => ({ query: { preview: 'inkwash' } }),
  }, props)
  t.after(page.dispose)
  assert.equal(page.state.showPrimaryImage?.value, false, '同一牡丹图不应重复出现')
  props.region = '济南'; props.cityImage = '/jinan-portrait.webp'; await settle()
  assert.equal(page.state.showPrimaryImage.value, true, '独立泉水场景应保留')
})

test('空景点主入口进入本城文化并保留预览，有内容时恢复景点锚点', async t => {
  const props = reactive({ region: '菏泽', cityImage: '/heze.webp', pending: true })
  const page = await setupPage('components/CityExperiences.vue', {
    cityExperiences: config.cityExperiences, atlasLink: atlas.atlasLink,
    useRoute: () => ({ query: { preview: 'inkwash' } }),
  }, props)
  t.after(page.dispose)
  assert.equal(page.state.primaryAction?.value, '走进城市文化')
  const destination = router.resolve(page.state.cityCultureLink.value)
  assert.equal(destination.params.region, '菏泽')
  assert.equal(destination.query.preview, 'inkwash')
  props.pending = false; await settle()
  assert.equal(page.state.primaryAction.value, '阅览经典景点')
  assert.equal(page.state.experiences.value.primary.href, '#city-spots')
})

async function openCity({ query = {}, get } = {}) {
  const boundary = testRoute('/regions/济南', query, { region: '济南' })
  const calls = []
  const page = await setupPage('views/RegionSpots.vue', {
    ...atlas,
    useRoute: () => boundary.route, useRouter: () => boundary.router,
    useImage: () => ({ resolveFirstImage: values => values.find(Boolean) }),
    cityIllustration: city => ({ img: `/local-${city}.webp`, reach: '城市山水' }),
    nextCityOf: () => '德州', resolveContent: () => null,
    api: { get: async (path, options) => { calls.push([path, options]); return get ? get(path, options) : { records: [] } } },
  })
  await page.ready; await settle()
  return { ...boundary, ...page, calls }
}

test('城市册页区分真实空数据、API失败与显式预览，预览不调用接口', async t => {
  const empty = await openCity()
  const failed = await openCity({ get: async () => { throw new Error('连接失败') } })
  const preview = await openCity({ query: { preview: 'inkwash' } })
  for (const page of [empty, failed, preview]) t.after(page.dispose)
  assert.equal(empty.state.loaded.value, true)
  assert.equal(empty.state.errorMsg.value, null)
  assert.deepEqual(empty.state.spots.value, [])
  assert.equal(failed.state.errorMsg.value, '连接失败')
  assert.deepEqual(failed.state.spots.value, [])
  assert.equal(preview.state.previewMode.value, true)
  assert.equal(preview.calls.length, 0)
  preview.route.params.region = '泰安'; await settle()
  assert.deepEqual(preview.state.spots.value.map(spot => spot.id), atlas.previewSpots.map(spot => spot.id))
  assert.equal(preview.calls.length, 0)
  assert.deepEqual(preview.state.sources.value, [])
})

test('城市册页保留真实请求参数、来源与切城竞态，配图响应当前城市', async t => {
  const pending = []
  const page = await openCity({ get: () => new Promise(resolve => pending.push(resolve)) })
  t.after(page.dispose)
  assert.equal(page.calls[0][1].params.region, '济南')
  assert.match(page.state.cityImage.value, /jinan-portrait-v1.webp$/)
  page.route.params.region = '东营'; await settle()
  assert.equal(page.calls[1][1].params.region, '东营')
  pending[1]({ records: [{ id: 2, name: '东营真实景点' }], sources: [{ title: '真实来源' }] }); await settle()
  pending[0]({ records: [{ id: 1, name: '旧城结果' }], sources: [] }); await settle()
  assert.deepEqual(page.state.spots.value.map(spot => spot.id), [2])
  assert.deepEqual(page.state.sources.value, [{ title: '真实来源' }])
  assert.equal(page.state.cityImage.value, '/local-东营.webp')
})


test('名士城市条件也约束关系图谱，朝代过滤仍可叠加', async t => {
  let displayed
  class GraphBoundary {
    constructor(options) { displayed = options.data }
    setData(data) { displayed = data }
    render() {}
    on() {}
    setPlugins() {}
    destroy() {}
  }
  const page = await openPoets({ region: '济南' }, async () => ({ data: { records: [{ id: 1, dynastyId: 5 }, { id: 2, dynastyId: 4 }] } }), {
    Graph: GraphBoundary, cssVar: () => '#a93226',
    get: async () => ({ nodes: [{ id: 1, name: '本城宋人', dynastyId: 5, dynasty: '宋' }, { id: 2, name: '本城唐人', dynastyId: 4, dynasty: '隋唐' }, { id: 3, name: '别城宋人', dynastyId: 5, dynasty: '宋' }], edges: [{ source: 1, target: 2, relationType: '交游' }, { source: 1, target: 3, relationType: '交游' }] }),
  })
  t.after(page.dispose)
  await page.ready; await settle()
  page.state.g6Container.value = { clientWidth: 800, clientHeight: 600, addEventListener() {}, removeEventListener() {} }
  await page.state.initG6()
  assert.deepEqual(displayed.nodes.map(node => node.id), ['1', '2'])
  assert.equal(displayed.edges.length, 1)
  page.state.selectDynasty(5); await settle()
  assert.deepEqual(displayed.nodes.map(node => node.id), ['1'])
  assert.equal(displayed.edges.length, 0)
})

test('城市名士有记录而无关系节点时显示筛选空态，清除城市后恢复图谱', async t => {
  let displayed
  class GraphBoundary {
    constructor(options) { displayed = options.data }
    setData(data) { displayed = data }
    getNodeData() { return displayed.nodes }
    getEdgeData() { return displayed.edges }
    render() {}
    on() {}
    setPlugins() {}
    destroy() {}
  }
  const page = await openPoets({ region: '济南' }, async (_path, params) => ({ data: { records: params.region ? [{ id: 1, name: '李清照', dynastyId: 5 }] : [{ id: 1, name: '李清照', dynastyId: 5 }, { id: 2, name: '别城名士', dynastyId: 4 }] } }), {
    Graph: GraphBoundary, cssVar: () => '#a93226',
    get: async () => ({ nodes: [{ id: 2, name: '别城名士', dynastyId: 4, dynasty: '隋唐' }], edges: [] }),
  })
  t.after(page.dispose)
  await page.ready; await settle()
  const container = { clientWidth: 800, clientHeight: 600, addEventListener() {}, removeEventListener() {} }
  page.state.g6Container.value = container
  const mountedContainer = page.state.g6Container.value
  page.state.setTab('graph'); await settle()
  assert.equal(page.state.poets.value.length, 1)
  assert.deepEqual(displayed.nodes, [])
  assert.equal(page.state.graphStatus.value, 'ready', '筛选空态不能覆盖全库状态')
  assert.equal(page.state.graphFilterEmpty?.value, true, '应显式标记过滤后的无节点状态')
  assert.equal(page.state.graphFilterEmptyMessage?.value, '济南暂无符合筛选条件的关系数据')
  await page.state.clearRegion(); await settle()
  assert.equal(page.state.region.value, '')
  assert.equal(page.state.graphFilterEmpty.value, false)
  assert.equal(page.state.graphStatus.value, 'ready')
  assert.deepEqual(displayed.nodes.map(node => node.id), ['2'])
  assert.equal(page.state.g6Container.value, mountedContainer, '清除条件不销毁画布容器')
  page.state.selectDynasty(5); await settle()
  assert.equal(page.state.graphFilterEmpty.value, true)
  page.state.selectDynasty(null); await settle()
  assert.equal(page.state.graphFilterEmpty.value, false)
  assert.deepEqual(displayed.nodes.map(node => node.id), ['2'])
})

test('筛选空态不会覆盖图谱原始的加载、全库空数据和请求失败状态', async t => {
  let resolveGraph
  let fail = false
  const page = await openPoets({ region: '济南' }, undefined, {
    cssVar: () => '#a93226',
    get: () => fail ? Promise.reject(new Error('关系服务不可用')) : new Promise(resolve => { resolveGraph = resolve }),
  })
  t.after(page.dispose)
  await page.ready; await settle()
  page.state.g6Container.value = { clientWidth: 800, clientHeight: 600, addEventListener() {}, removeEventListener() {} }
  const loading = page.state.initG6()
  assert.equal(page.state.graphStatus.value, 'loading')
  assert.equal(page.state.graphFilterEmpty.value, false)
  resolveGraph({ nodes: [], edges: [] }); await loading
  assert.equal(page.state.graphStatus.value, 'empty')
  assert.equal(page.state.graphFilterEmpty.value, false)
  fail = true
  await page.state.initG6()
  assert.equal(page.state.graphStatus.value, 'error')
  assert.equal(page.state.graphFilterEmpty.value, false)
})
