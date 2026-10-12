import test from 'node:test'
import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import catalog from '../src/content/culture/enrichment.json' with { type: 'json' }
import { getCultureEnrichment, mergeCultureSources, cultureMedia } from '../src/utils/cultureEnrichment.js'
import { setupPage, settle, testRoute } from './helpers/componentSetup.js'

test('44条已盘点内容都有核验来源，真实素材与仍缺影像的状态明确区分', async () => {
  assert.equal(catalog.entries.length, 44)
  const counts = {}
  for (const entry of catalog.entries) {
    counts[entry.category] = (counts[entry.category] || 0) + 1
    if (entry.experience) {
      assert.ok(['craft', 'story'].includes(entry.experience.kind))
      assert.ok(entry.experience.steps.length >= 2, `${entry.title}缺阅读线索`)
      assert.equal(entry.experience.illustration, undefined)
      assert.equal(entry.experience.challenge, undefined)
    }
    assert.ok(entry.sources.length, `${entry.title}缺来源`)
    for (const source of entry.sources) {
      const url = new URL(source.url)
      assert.equal(url.protocol, 'https:')
      assert.equal(url.username + url.password, '')
      assert.equal(source.verifiedAt, '2026-10-12')
      assert.ok(source.title && source.authorOrg)
    }
    if (entry.image) await access(new URL(`../public${entry.image}`, import.meta.url))
    assert.ok(Array.isArray(entry.realAssets))
    assert.ok(entry.mediaStatus.status)
    for (const asset of entry.realAssets) {
      assert.ok(['video', 'image', 'audio'].includes(asset.kind))
      assert.equal(new URL(asset.url).protocol, 'https:')
      assert.ok(entry.sources.some(source => source.url === asset.sourceUrl), `${entry.title}的素材缺出处`)
      assert.equal(typeof asset.inlineVerified, 'boolean')
      assert.ok(asset.reason && asset.authorOrg)
    }
    if (!entry.realAssets.some(asset => asset.inlineVerified)) assert.ok(entry.mediaStatus.pendingReason)
  }
  assert.deepEqual(counts, { festival: 14, craft: 12, literature: 10, food_opera: 8 })
  assert.equal(catalog.entries.filter(entry => entry.experience?.kind === 'craft').length, 12)
  assert.equal(catalog.entries.filter(entry => entry.experience?.kind === 'story').length, 10)
})

test('配图及体验按类别名称匹配，不依赖不同数据库中的ID且不补出未知内容', () => {
  const original = catalog.entries[0]
  assert.equal(getCultureEnrichment({ ...original, id: 9001 }), getCultureEnrichment({ ...original, id: 1 }))
  assert.equal(getCultureEnrichment({ category: 'poem', title: original.title }), null)
  assert.equal(getCultureEnrichment({ category: original.category, title: '未审核的未知条目' }), null)
  assert.equal(getCultureEnrichment(null), null)
})

test('来源差异进入体验内容，人物版本、会期和媒体机构不与核验结果冲突', () => {
  const byTitle = title => catalog.entries.find(entry => entry.title === title)
  const mengjiang = byTitle('孟姜女传说（淄博）').experience
  assert.match(mengjiang.facts[0].value, /杞梁/)
  assert.doesNotMatch(JSON.stringify(mengjiang), /范喜良|秦始皇/)
  const sinv = byTitle('四女寺的传说').experience
  assert.match(JSON.stringify(sinv.steps), /柳树/)
  assert.doesNotMatch(JSON.stringify(sinv), /京剧|四女槐/)
  assert.match(JSON.stringify(byTitle('宁津蟋蟀文化节（暨杂技古会）').researchNotes), /会期/)
  assert.match(byTitle('淄博国际聊斋文化旅游节（聊斋文化节）').sources.find(source => source.url.includes('v.iqilu.com')).authorOrg, /山东广播电视台/)
})

test('扩展来源去重且保留后端出处；媒体丢弃不安全链接', () => {
  const sources = [{ sourceId: 8, title: '后端文献', url: 'https://www.ihchina.cn/example.html' }]
  const result = mergeCultureSources(sources, { sources: [{ title: '重复', url: sources[0].url }, { title: '新增', url: 'https://tv.cctv.com/source' }] })
  assert.equal(result.length, 2)
  assert.equal(result[0].sourceId, 8)
  assert.equal(cultureMedia({ media: [{ url: 'javascript:alert(1)' }, { url: 'https://tv.cctv.com/source' }] }).length, 1)
})

test('真实详情成功加载才挂扩展体验；API失败保留错误态且不落入样本', async () => {
  const entry = catalog.entries[0]
  const { route } = testRoute('/festivals/1', {}, { id: '1' })
  const dependencies = {
    useRoute: () => route,
    useImage: () => ({ resolveFirstImage: values => values.find(Boolean) || null }),
    getCuratedPresentation: () => ({ aspectRatio: '4 / 3', objectFit: 'contain' }),
    CATEGORY_LABELS: {},
    getCultureEnrichment, mergeCultureSources, cultureMedia,
    isAtlasPreview: () => false,
    atlasLink: path => path,
    safeReturnPath: (_path, fallback) => fallback,
    api: { get: async () => ({ item: { id: 1, category: entry.category, title: entry.title }, detail: {}, sources: [] }) },
  }
  const page = await setupPage('views/CulturalDetail.vue', dependencies)
  await settle()
  assert.equal(page.state.enrichment.value.title, entry.title)
  assert.deepEqual(page.state.sources.value, [])
  assert.ok(page.state.supplementalSources.value.length)
  page.dispose()
  const errorPage = await setupPage('views/CulturalDetail.vue', { ...dependencies, api: { get: async () => { throw new Error('真实API失败') } } })
  await settle()
  assert.equal(errorPage.state.enrichment.value, null)
  assert.equal(errorPage.state.item.value, null)
  assert.equal(errorPage.state.errorMsg.value, '真实API失败')
  errorPage.dispose()
})
