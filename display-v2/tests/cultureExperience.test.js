import test from 'node:test'
import assert from 'node:assert/strict'
import { reactive } from 'vue'
import { setupPage, settle } from './helpers/componentSetup.js'
import { normalizeCultureExperience } from '../src/utils/cultureExperience.js'

const dependencies = { normalizeCultureExperience }
const experience = kind => ({
  kind,
  steps: [{ title: '材料准备', description: '先观察材料的自然形态。' }, { title: '成形', description: '对照匠人影像，观察成形动作。' }],
  facts: [{ label: '材料', value: '柳条' }, { label: '来源版本', value: '地方整理的讲述版本，具体见原始来源。' }],
})

test('空内容不产生观察面板或补写事实', async () => {
  const page = await setupPage('components/culture/CultureExperience.vue', dependencies, reactive({ experience: { kind: 'craft', steps: [null, { title: '  ' }], facts: [{ label: '材料' }] } }))
  assert.equal(page.state.hasNotes.value, false)
  assert.deepEqual(page.state.content.value.steps, [])
  assert.deepEqual(page.state.content.value.facts, [])
  page.dispose()
})

test('故事保留章节正文与已有版本信息，事实说明和来源提示分开阅读', async () => {
  const page = await setupPage('components/culture/CultureExperience.vue', dependencies, reactive({ experience: experience('story'), itemTitle: '地方传说' }))
  assert.equal(page.state.isStory.value, true)
  assert.equal(page.state.content.value.steps[1].description, '对照匠人影像，观察成形动作。')
  assert.deepEqual(page.state.versionNotes.value, [{ label: '来源版本', value: '地方整理的讲述版本，具体见原始来源。' }])
  assert.deepEqual(page.state.contextNotes.value, [{ label: '材料', value: '柳条' }])
  assert.match(page.template, /传说叙述不作为历史实证/)
  page.dispose()
})

test('工序索引默认折叠，切换条目不会延续已展开的阅读状态', async () => {
  const props = reactive({ experience: experience('craft'), itemTitle: '柳编' })
  const page = await setupPage('components/culture/CultureExperience.vue', dependencies, props)
  assert.equal(page.state.expanded.value, false)
  assert.equal(page.state.indexLabel.value, '工序索引与观察线索')
  page.state.syncExpanded({ target: { open: true } })
  assert.equal(page.state.expanded.value, true)
  props.experience = experience('opera')
  await settle()
  assert.equal(page.state.expanded.value, false)
  assert.equal(page.state.indexLabel.value, '观察线索')
  page.state.syncExpanded({ target: { open: true } })
  props.experience.steps.splice(0, 2)
  await settle()
  assert.equal(page.state.expanded.value, false)
  assert.equal(page.state.hasNotes.value, true, '有事实说明时仍可查看精简观察线索')
  page.dispose()
})

test('阅读组件不渲染SVG、纹样参数、节拍或问答小游戏', async () => {
  const page = await setupPage('components/culture/CultureExperience.vue', dependencies, reactive({ experience: experience('opera') }))
  assert.doesNotMatch(page.template, /CultureIllustration|<svg|type="range"|拍点|节拍|小游戏|challenge|互动体验/)
  assert.equal(page.state.tapBeat, undefined)
  assert.equal(page.state.patternColor, undefined)
  assert.equal(page.state.chooseAnswer, undefined)
  assert.match(page.template, /<details/)
  assert.match(page.template, /<summary/)
  page.dispose()
})
