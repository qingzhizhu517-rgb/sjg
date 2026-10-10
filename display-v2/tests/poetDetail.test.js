import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { babelParse, compileScript, parse } from '@vue/compiler-sfc'
import { computed, reactive, ref } from 'vue'
import { atlasLink, isAtlasPreview, previewDynasties, previewPoet, previewPoets } from '../src/config/atlasPreview.js'
import { getCuratedPresentation } from '../src/config/curatedMedia.js'
import { mockPoets } from '../src/config/mockDetailData.js'
import { firstLine, pickSignaturePoem } from '../src/utils/poem.js'
import { safeReturnPath } from '../src/config/siteNavigation.js'

const source = await readFile(new URL('../src/views/PoetDetail.vue', import.meta.url), 'utf8')
const { descriptor } = parse(source)
let setupCode = compileScript(descriptor, { id: 'poet-detail-test', genDefaultAs: 'component' }).content
// 执行真实页面的 setup；仅替换路由、网络和媒体边界，不复制页面的数据处理逻辑。
const imports = babelParse(setupCode, { sourceType: 'module' }).program.body.filter(node => node.type === 'ImportDeclaration')
for (const node of imports.reverse()) setupCode = setupCode.slice(0, node.start) + setupCode.slice(node.end)

const realDetail = {
  poet: { id: 2, name: '杜甫', biography: '来自公开接口的生平记录。', birthYear: 712, deathYear: 770 },
  poems: [{ id: 25, title: '望岳', content: '岱宗夫如何？齐鲁青未了。' }],
  dynasty: { id: 4, name: '唐' },
  sources: [{ sourceId: 8, title: '杜诗详注', locator: '卷一' }],
}

function openDetail({ query = {}, id = '2', get = async () => realDetail } = {}) {
  const route = reactive({ params: { id }, query })
  const calls = []
  let ready
  const dependencies = {
    ref, computed,
    watch: (_source, callback, options) => { if (options?.immediate) ready = callback() },
    useRoute: () => route,
    useImage: () => ({ resolveFirstImage: values => values.find(Boolean) || '' }),
    getCuratedPresentation, atlasLink, isAtlasPreview, previewDynasties, previewPoet, previewPoets,
    mockPoets, firstLine, pickSignaturePoem, safeReturnPath,
    api: { get: async path => { calls.push(path); return get(path) } },
    ErrorState: {}, SkeletonBlock: {}, InkPlaceholder: {}, SourceList: {},
    console: { error() {} },
  }
  const component = new Function(...Object.keys(dependencies), `${setupCode}\nreturn component`)(...Object.values(dependencies))
  const state = component.setup({}, { expose() {} })
  return { state, route, calls, ready }
}

test('普通详情读取公开 API 和来源，不混入设计样本的补充生平', async () => {
  const page = openDetail()
  await page.ready
  assert.deepEqual(page.calls, ['/poets/2'])
  assert.deepEqual(page.state.poet.value, realDetail.poet)
  assert.deepEqual(page.state.poems.value, realDetail.poems)
  assert.deepEqual(page.state.sources.value, realDetail.sources)
  assert.equal(page.state.historicalImpact.value, '')
  assert.equal(page.state.milestones.value.length, 2)
  assert.match(descriptor.template.content, /<SourceList\b[^>]*:sources="sources"/)
})

test('仅显式水墨预览读取样本，且不发起公开接口请求或虚构来源', async () => {
  const page = openDetail({ query: { preview: 'inkwash' } })
  await page.ready
  assert.deepEqual(page.calls, [])
  assert.deepEqual(page.state.poet.value, previewPoet)
  assert.deepEqual(page.state.sources.value, [])
  assert.ok(page.state.milestones.value.length > 0)

  const ordinary = openDetail({ query: { preview: 'true' } })
  await ordinary.ready
  assert.deepEqual(ordinary.calls, ['/poets/2'])
  assert.deepEqual(ordinary.state.poet.value, realDetail.poet)
})

test('接口失败保持错误状态，不将样本伪装成公开详情；重试能恢复', async () => {
  let fail = true
  const page = openDetail({ get: async () => {
    if (fail) throw new Error('service unavailable')
    return { ...realDetail, sources: null }
  } })
  await page.ready
  assert.equal(page.state.poet.value, null)
  assert.deepEqual(page.state.poems.value, [])
  assert.deepEqual(page.state.sources.value, [])
  assert.ok(page.state.errorMsg.value)
  fail = false
  await page.state.loadDetail()
  assert.deepEqual(page.state.poet.value, realDetail.poet)
  assert.deepEqual(page.state.sources.value, [])
  assert.equal(page.state.errorMsg.value, null)
  assert.match(descriptor.template.content, /<ErrorState\b[^>]*@retry="loadDetail"/)
})

test('预览人物按 ID 匹配，未知 ID 明确报错且不会展示杜甫', async () => {
  for (const [id, name] of [['2', '杜甫'], ['3', '李清照'], ['4', '王士禛'], ['5', '老舍']]) {
    const page = openDetail({ id, query: { preview: 'inkwash' } })
    await page.ready
    assert.equal(page.state.poet.value.name, name)
    assert.equal(String(page.state.poet.value.id), id)
    assert.ok(page.state.poems.value.every(poem => String(poem.poetId) === id))
    assert.deepEqual(page.calls, [])
    assert.deepEqual(page.state.sources.value, [])
  }
  const unknown = openDetail({ id: '9999', query: { preview: 'inkwash' } })
  await unknown.ready
  assert.equal(unknown.state.poet.value, null)
  assert.ok(unknown.state.errorMsg.value)
  assert.deepEqual(unknown.state.poems.value, [])
  assert.deepEqual(unknown.calls, [])
})

test('题诗以完整诗句分列，标点不会把下一句首字挤到上一列', async () => {
  const page = openDetail({ query: { preview: 'inkwash' } })
  await page.ready
  assert.deepEqual(page.state.portraitQuoteLines.value, ['会当凌绝顶', '一览众山小'])
})

test('切换人物后旧请求的响应不能覆盖当前资料', async () => {
  const responses = new Map()
  const page = openDetail({ get: path => new Promise(resolve => responses.set(path, resolve)) })
  page.route.params.id = '9'
  const latestLoad = page.state.loadDetail()
  const current = { ...realDetail, poet: { id: 9, name: '当前人物' } }
  responses.get('/poets/9')(current)
  await latestLoad
  responses.get('/poets/2')(realDetail)
  await page.ready
  assert.deepEqual(page.state.poet.value, current.poet)
})

test('画像失败显示水墨占位，再次载入时允许重试画像', async () => {
  const page = openDetail()
  await page.ready
  assert.equal(page.state.avatarLoadFailed.value, false)
  page.state.onAvatarError()
  assert.equal(page.state.avatarLoadFailed.value, true)
  assert.match(descriptor.template.content, /v-if="avatar\s*&&\s*!avatarLoadFailed"/)
  assert.match(descriptor.template.content, /@error="onAvatarError"/)
  assert.match(descriptor.template.content, /<img\s+v-else\b[^>]*class=\"pd-portrait__scenery\"/)
  await page.state.loadDetail()
  assert.equal(page.state.avatarLoadFailed.value, false)
})

test('作品和代表句仍通过真实作品 ID 导航，并保留预览状态', () => {
  assert.match(descriptor.template.content, /:to="atlasLink\(`\/poems\/\$\{pm\.id\}`,\s*route\)"/)
  assert.match(descriptor.template.content, /:to="atlasLink\(`\/poems\/\$\{signature\.id\}`,\s*route\)"/)
})
