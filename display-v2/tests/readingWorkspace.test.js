import test from 'node:test'
import assert from 'node:assert/strict'
import { setupPage, testRoute, settle } from './helpers/componentSetup.js'
import * as stateUtils from '../src/utils/readingState.js'
import { createReadingStream } from '../src/utils/readingStream.js'
import { buildReadingExportMarkdown } from '../src/utils/readingExport.js'
import { previewPoems, previewPoets, previewDynasties, atlasLink, isAtlasPreview } from '../src/config/atlasPreview.js'
import { NINE_CITIES } from '../src/config/nineCities.js'

function deps(routeTools, get, storage) {
  return { ...stateUtils, createReadingStream, buildReadingExportMarkdown, atlasLink, isAtlasPreview, previewPoems, previewPoets, previewDynasties, NINE_CITIES,
    useRoute: () => routeTools.route, useRouter: () => routeTools.router, api: { get }, apiUrl: path => path,
    getReadingStorage: () => storage, fetch: () => { throw new Error('不得自动调用模型') }, }
}
const detail = (id, title = `作品${id}`) => ({ poem: { id, title, content: '山\n水' }, sources: [] })
const storage = () => { const values = new Map(); return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) } }

test('显式样本只读本地作品，零API或模型；导读示例标识清楚', async () => {
  const route = testRoute('/reading', { preview: 'inkwash' })
  let calls = 0
  const page = await setupPage('views/ReadingWorkspace.vue', deps(route, async () => { calls++; throw new Error('network') }, storage()))
  await page.ready
  assert.equal(calls, 0); assert.deepEqual(page.state.materials.value.map(item => item.id), [301, 306]); assert.equal(page.state.ai.value.status, 'idle')
  page.state.showSampleGuide(); assert.match(page.state.ai.value.text, /\[A:1\]/); assert.equal(page.state.ai.value.status, 'sample')
  assert.match(page.template, /导读示例/)
  page.dispose()
})
test('正式首进仅加载状态/材料，空列表有明确样本入口且不静默回填', async () => {
  const route = testRoute('/reading')
  const calls = []
  const page = await setupPage('views/ReadingWorkspace.vue', deps(route, async (url, options) => {
    calls.push({ url, options }); return url === '/ai/status' ? { generationConfigured: false, reason: 'not_configured' } : { records: [], total: 0 }
  }, storage()))
  await page.ready
  assert.equal(page.state.materials.value.filter(Boolean).length, 0); assert.equal(page.state.modelStatus.value, 'unconfigured')
  assert.equal(calls.filter(item => item.url.includes('compare')).length, 0); assert.match(page.template, /查看对读样本/)
  page.dispose()
})
test('参数指定原文详情，分页带keyword/region，模型状态失败不阻断原文', async () => {
  const route = testRoute('/reading', { poem: '12', compare: '19', region: '济南' })
  const calls = []
  const page = await setupPage('views/ReadingWorkspace.vue', deps(route, async (url, options) => {
    calls.push({ url, options })
    if (url === '/ai/status') throw new Error('offline')
    if (url === '/poems') return { records: [{ id: 12, title: '甲' }, { id: 19, title: '乙' }], total: 25 }
    return detail(Number(url.split('/').pop()))
  }, storage()))
  await page.ready
  assert.equal(page.state.modelStatus.value, 'unknown'); assert.equal(page.state.canGenerate.value, true)
  page.state.keyword.value = '山水'; await page.state.loadCatalog(2)
  const last = calls.filter(item => item.url === '/poems').at(-1)
  assert.deepEqual(last.options.params, { page: 2, size: 12, keyword: '山水', region: '济南' })
  assert.deepEqual(page.state.materials.value.map(item => item.id), [12, 19]); page.dispose()
})
test('切换材料恢复独立草稿，旧详情晚到不会覆盖新的作品', async () => {
  const route = testRoute('/reading', { poem: '12', compare: '19' })
  const local = storage()
  let resolveOld
  const page = await setupPage('views/ReadingWorkspace.vue', deps(route, async url => {
    if (url === '/ai/status') return { generationConfigured: true, reason: 'configured' }
    if (url === '/poems') return { records: [], total: 0 }
    if (url === '/poems/20') return new Promise(resolve => { resolveOld = resolve })
    return detail(Number(url.split('/').pop()))
  }, local))
  await page.ready
  page.state.answer.value = '第一对笔记'; page.state.toggleSelection({ label: 'A', number: 1 }); await settle(); page.state.persistDraft()
  await route.router.replace({ query: { poem: '20', compare: '19' } }); await settle()
  await route.router.replace({ query: { poem: '21', compare: '19' } }); await settle()
  resolveOld(detail(20, '晚到旧作品')); await settle()
  assert.equal(page.state.materials.value[0].id, 21); assert.equal(page.state.answer.value, '')
  await route.router.replace({ query: { poem: '12', compare: '19' } }); await settle()
  assert.equal(page.state.answer.value, '第一对笔记'); assert.equal(page.state.selected.value.length, 1)
  page.dispose()
})
test('存储拒绝和损坏草稿在真实setup中显示提示，仍可写个人判断', async () => {
  for (const [local, pattern] of [
    [{ getItem() { throw new Error('denied') }, setItem() { throw new Error('denied') } }, /无法.*保存|不可.*保存/],
    [{ getItem: () => '{bad', setItem() {} }, /损坏/],
  ]) {
    const route = testRoute('/reading', { preview: 'inkwash' })
    const page = await setupPage('views/ReadingWorkspace.vue', deps(route, () => {}, local)); await page.ready
    assert.match(page.state.storageNotice.value, pattern)
    page.state.answer.value = '仍可记录'; assert.equal(page.state.answer.value, '仍可记录'); page.dispose()
  }
})

test('正在生成禁止重复，切换方向取消请求且晚到结果不显示', async () => {
  const route = testRoute('/reading', { poem: '12', compare: '19' })
  let release, signal, postCalls = 0
  const injection = deps(route, async url => url === '/ai/status' ? { generationConfigured: true, reason: 'configured' } : url === '/poems' ? { records: [], total: 0 } : detail(Number(url.split('/').pop())), storage())
  injection.fetch = async (_url, options) => { postCalls++; signal = options.signal; return new Promise(resolve => { release = resolve }) }
  const page = await setupPage('views/ReadingWorkspace.vue', injection); await page.ready
  const pending = page.state.generate('compare'); await page.state.generate('compare')
  assert.equal(postCalls, 1); assert.equal(page.state.ai.value.status, 'waiting')
  page.state.changeFocus('emotion'); assert.equal(signal.aborted, true); assert.equal(page.state.ai.value.status, 'idle')
  release({ ok: true, body: new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('data: {"delta":"旧线索"}\n\n')); controller.close() } }) })
  await pending; assert.equal(page.state.ai.value.text, ''); page.dispose()
})

test('模型未配置拒绝生成；反馈空答案拒绝，有效答案带服务器ID和focus', async () => {
  const route = testRoute('/reading', { poem: '12', compare: '19' })
  let configured = false, payload, postCalls = 0
  const injection = deps(route, async url => url === '/ai/status' ? { generationConfigured: configured, reason: configured ? 'configured' : 'not_configured' } : url === '/poems' ? { records: [], total: 0 } : detail(Number(url.split('/').pop())), storage())
  injection.fetch = async (_url, options) => { postCalls++; payload = JSON.parse(options.body); return { ok: false, status: 429, json: async () => ({ message: '请稍后再试' }) } }
  const page = await setupPage('views/ReadingWorkspace.vue', injection); await page.ready
  await page.state.generate('compare'); assert.equal(postCalls, 0)
  configured = true; await page.state.loadModelStatus(); await page.state.generate('feedback'); assert.equal(postCalls, 0)
  page.state.answer.value = '我的判断来自A第1行'; page.state.changeFocus('language'); await page.state.generate('feedback')
  assert.deepEqual(payload, { poemIds: [12, 19], focus: 'language', mode: 'feedback', answer: '我的判断来自A第1行' }); assert.equal(page.state.ai.value.status, 'error'); assert.match(page.state.ai.value.error, /请稍后/); page.dispose()
})

test('spot用于找到关联ID，每一篇仍读取公开诗词详情', async () => {
  const route = testRoute('/reading', { spot: '7' }), calls = []
  const page = await setupPage('views/ReadingWorkspace.vue', deps(route, async url => {
    calls.push(url)
    if (url === '/ai/status') return { generationConfigured: false, reason: 'not_configured' }
    if (url === '/poems') return { records: [{ id: 88 }], total: 1 }
    if (url === '/spots/7') return { poems: [{ id: 12, content: '关联列表不可代替详情' }, { id: 19 }] }
    return detail(Number(url.split('/').pop()))
  }, storage())); await page.ready
  assert.deepEqual(page.state.materials.value.map(item => item.id), [12, 19]); assert.ok(calls.includes('/poems/12')); assert.ok(calls.includes('/poems/19')); assert.equal(page.state.materials.value[0].lines[0].text, '山'); page.dispose()
})

test('404、原文缺失与网络错误保持明确差异，不使用样本', async () => {
  const route = testRoute('/reading', { poem: '12', compare: '19' })
  let fail = '404'
  const page = await setupPage('views/ReadingWorkspace.vue', deps(route, async url => {
    if (url === '/ai/status') return { generationConfigured: false, reason: 'not_configured' }
    if (url === '/poems') return { records: [], total: 0 }
    if (url === '/poems/12') {
      if (fail === '404') throw new Error('作品不存在')
      if (fail === 'network') throw new Error('网络连接失败')
      return { poem: { id: 12, title: '空原文', content: '' } }
    }
    return detail(19)
  }, storage())); await page.ready
  assert.match(page.state.materialErrors.value[0], /不存在或尚未发布/)
  fail = 'network'; await page.state.loadMaterials(); assert.match(page.state.materialErrors.value[0], /网络连接失败/)
  fail = 'missing'; await page.state.loadMaterials(); assert.match(page.state.materialErrors.value[0], /原文缺失/)
  assert.equal(page.state.materials.value[0], null); assert.equal(page.state.materials.value[1].id, 19); page.dispose()
})

test('个人思考修改时取消正在检查的旧答案，保留已修改笔记', async () => {
  const route = testRoute('/reading', { poem: '12', compare: '19' })
  let release, signal
  const injection = deps(route, async url => url === '/ai/status' ? { generationConfigured: true, reason: 'configured' } : url === '/poems' ? { records: [], total: 0 } : detail(Number(url.split('/').pop())), storage())
  injection.fetch = async (_url, options) => { signal = options.signal; return new Promise(resolve => { release = resolve }) }
  const page = await setupPage('views/ReadingWorkspace.vue', injection); await page.ready
  page.state.answer.value = '第一份判断'; const pending = page.state.generate('feedback')
  page.state.answer.value = '修改后的判断'; await settle()
  assert.equal(signal.aborted, true); assert.equal(page.state.ai.value.status, 'idle'); assert.match(page.state.feedbackNotice.value, /修改/)
  release({ ok: true, body: new ReadableStream({ start(controller) { controller.close() } }) }); await pending
  assert.equal(page.state.answer.value, '修改后的判断'); assert.equal(page.state.ai.value.text, ''); page.dispose()
})

test('只指定B时补A必须排除B，显式样本单篇306也不会与默认B重复', async () => {
  for (const [query, expected] of [[{ compare: '19' }, [12, 19]], [{ preview: 'inkwash', poem: '306' }, [306, 301]], [{ preview: 'inkwash', compare: '301' }, [306, 301]]]) {
    const route = testRoute('/reading', query)
    const page = await setupPage('views/ReadingWorkspace.vue', deps(route, async url => {
      if (url === '/ai/status') return { generationConfigured: false, reason: 'not_configured' }
      if (url === '/poems') return { records: [{ id: 19 }, { id: 12 }], total: 2 }
      return detail(Number(url.split('/').pop()))
    }, storage())); await page.ready
    assert.deepEqual(page.state.materials.value.map(item => item?.id), expected); page.dispose()
  }
})

test('显式双ID原文不等待慢列表或模型状态响应', async () => {
  const route = testRoute('/reading', { poem: '12', compare: '19' })
  let releaseCatalog, releaseStatus
  const page = await setupPage('views/ReadingWorkspace.vue', deps(route, async url => {
    if (url === '/poems') return new Promise(resolve => { releaseCatalog = resolve })
    if (url === '/ai/status') return new Promise(resolve => { releaseStatus = resolve })
    return detail(Number(url.split('/').pop()))
  }, storage()))
  await settle(); assert.deepEqual(page.state.materials.value.map(item => item?.id), [12, 19])
  releaseCatalog({ records: [], total: 0 }); releaseStatus({ generationConfigured: false, reason: 'not_configured' }); await page.ready; page.dispose()
})
