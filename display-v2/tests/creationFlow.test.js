import { test } from 'node:test'
import assert from 'node:assert/strict'
import { setupPage, testRoute, settle } from './helpers/componentSetup.js'
import * as learningApi from '../src/utils/learningTaskApi.js'
import { atlasLink } from '../src/config/atlasPreview.js'
import { createPoemCard, wrapPoemText } from '../src/utils/poemCard.js'

async function learningPage(fetch, storage = new Map()) {
  const { route } = testRoute('/learn/lesson-one', {}, { taskCode: 'lesson-one' })
  const page = await setupPage('views/LearningTaskView.vue', {
    ...learningApi, atlasLink, useRoute: () => route, fetch,
    fetchPublicLearningTask: async (_fetch, taskCode) => ({ task: { taskCode, title: '阅读任务' }, content: { steps: [{ type: 'reflection', questions: [] }], resources: [] } }),
    readLearningStorage: key => storage.get(key) || null,
    writeLearningStorage: (key, value) => { storage.set(key, value); return true },
  })
  await settle()
  return { ...page, route, storage }
}

test('完成任务先保存本机草稿，同步期间重复点击只提交一次', async t => {
  const requests = []
  let resolve
  const page = await learningPage((url, options) => { requests.push([url, options]); return new Promise(done => { resolve = done }) })
  t.after(page.dispose)
  page.state.answers.value = { question1: '我的思考' }
  const saving = page.state.finishTask()
  await page.state.finishTask()
  assert.equal(page.state.saving.value, true)
  assert.equal(requests.length, 1)
  assert.equal(JSON.parse(page.storage.get('sjg-learning:lesson-one')).completed, true)
  assert.equal(JSON.parse(requests[0][1].body).status, 'submitted')
  resolve(new Response('{}', { status: 200 }))
  await saving
  assert.equal(page.state.savedLabel.value, '成果已同步')
  assert.equal(page.state.saving.value, false)
})

test('任务同步失败时保留本机草稿，旧任务响应不覆盖新任务', async t => {
  let reject
  const page = await learningPage(() => new Promise((_, fail) => { reject = fail }))
  t.after(page.dispose)
  const first = page.state.finishTask()
  reject(new Error('offline')); await first
  assert.equal(page.state.savedLabel.value, '已保存本机草稿')
  const oldRequest = page.state.finishTask()
  await page.state.loadTask('lesson-two')
  const currentLabel = page.state.savedLabel.value
  reject(new Error('late error')); await oldRequest
  assert.equal(page.state.task.value.taskCode, 'lesson-two')
  assert.equal(page.state.savedLabel.value, currentLabel)
  assert.equal(page.storage.has('sjg-learning:lesson-two'), false)
})

test('创作表单拒绝空白与重复生成，结果沿用提交时的偏好', async t => {
  const requests = []
  let resolve
  const page = await setupPage('components/PoemComposer.vue', { createPoemCard, api: { post: (...args) => { requests.push(args); return new Promise(done => { resolve = done }) } } })
  t.after(page.dispose)
  page.state.form.value.theme = '   '
  await page.state.composePoem()
  assert.equal(requests.length, 0)
  page.state.form.value.theme = ' 泰山 '
  const generating = page.state.composePoem()
  await page.state.composePoem()
  assert.equal(requests.length, 1)
  assert.equal(requests[0][2].params.theme, '泰山')
  page.state.form.value.style = '婉约'
  resolve({ title: '山行', content: '山色入诗笺。\n清风伴我还。' })
  await generating
  assert.equal(page.state.poem.value.style, '豪放')
  assert.equal(page.state.poem.value.lines.length, 2)
  assert.equal(page.state.loading.value, false)
})

test('空生成结果显示可重试错误，不展示空白成功页', async t => {
  const page = await setupPage('components/PoemComposer.vue', { createPoemCard, api: { post: async () => ({ content: '' }) } })
  t.after(page.dispose)
  page.state.form.value.theme = '黄河'
  await page.state.composePoem()
  assert.equal(page.state.poem.value, null)
  assert.match(page.state.error.value, /未生成/)
  assert.equal(page.state.loading.value, false)
})

test('导出诗笺保留全部诗文，长句自动换行且落在画布内', () => {
  const measure = text => [...text].length * 44
  const poem = { title: '黄河山水行', lines: ['清风入画。', '齐鲁青未了。'.repeat(6)], style: '山水', wordCount: '不限' }
  const wrapped = wrapPoemText(poem.lines.join('\n'), measure, 940)
  assert.equal(wrapped.join(''), poem.lines.join(''))
  assert.ok(wrapped.every(row => measure(row) <= 940))
  const painted = []
  const ctx = { measureText: text => ({ width: measure(text) }), fillRect() {}, strokeRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, fill() {}, fillText: (text, x, y) => painted.push({ text, x, y }) }
  const canvas = { getContext: () => ctx }
  assert.equal(createPoemCard(poem, { createElement: () => canvas }), canvas)
  assert.equal(canvas.width, 1200)
  assert.ok(painted.every(line => line.y > 52 && line.y < canvas.height - 52))
  for (const row of wrapped) assert.ok(painted.some(line => line.text === row))
  assert.ok(painted.some(line => line.text.includes('AI 诗词创作')))
})
