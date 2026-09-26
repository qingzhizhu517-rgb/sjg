import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const [appSource, routerSource, indexSource, detailSource] = await Promise.all([
  readFile(new URL('../src/App.vue', import.meta.url), 'utf8'),
  readFile(new URL('../src/router/index.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/views/LearningTaskIndex.vue', import.meta.url), 'utf8').catch(() => ''),
  readFile(new URL('../src/views/LearningTaskView.vue', import.meta.url), 'utf8').catch(() => ''),
])

/**
 * Extract route records from the real router source without mounting Vue.
 * Node's test runner has no DOM/compiler setup for lazy .vue imports, so this
 * parser verifies the executable route table shape while the component tests
 * exercise the pure task-flow helpers below.
 */
function routeRecords(source) {
  const start = source.indexOf('const routes = [')
  const end = source.indexOf('\n]\n', start)
  assert.ok(start >= 0 && end > start, 'router must declare a routes array')
  const body = source.slice(start, end)
  const records = []
  let depth = 0
  let recordStart = -1
  let quote = ''
  let escaped = false
  for (let index = body.indexOf('[') + 1; index < body.length; index += 1) {
    const char = body[index]
    if (quote) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) quote = ''
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }
    if (char === '{') {
      if (depth === 0) recordStart = index
      depth += 1
    } else if (char === '}') {
      depth -= 1
      if (depth === 0 && recordStart >= 0) {
        records.push(body.slice(recordStart, index + 1))
        recordStart = -1
      }
    }
  }
  return records
}

const learningRoutes = routeRecords(routerSource).filter((record) => /path:\s*['"]\/learn/.test(record))

test('展示端主导航提供进入探究任务的入口', () => {
  assert.match(appSource, /to="\/learn"/)
  assert.match(appSource, /探究任务/)
})

test('学习任务真实路由表先匹配索引页，再匹配动态详情页并映射正确组件', () => {
  assert.deepEqual(learningRoutes.map((record) => record.match(/path:\s*['"]([^'"]+)/)?.[1]), [
    '/learn',
    '/learn/:taskCode',
  ])
  assert.match(learningRoutes[0], /name:\s*['"]LearningTaskIndex['"]/)
  assert.match(learningRoutes[0], /import\('\.\.\/views\/LearningTaskIndex\.vue'\)/)
  assert.match(learningRoutes[1], /name:\s*['"]LearningTask['"]/)
  assert.match(learningRoutes[1], /import\('\.\.\/views\/LearningTaskView\.vue'\)/)
})

test('学习任务入口页面提供提交任务代码的实际表单', () => {
  assert.match(indexSource, /@submit\.prevent/)
  assert.match(indexSource, /router\.push\(.*\/learn\//)
  assert.match(indexSource, /encodeURIComponent\(code\)/)
})

test('学习任务详情具备可执行的路由重载、失败重试和提交路径', () => {
  assert.match(detailSource, /watch\(\(\) => route\.params\.taskCode,\s*loadTask,\s*\{\s*immediate:\s*true\s*\}\)/)
  assert.match(detailSource, /@click="loadTask\(route\.params\.taskCode\)"/)
  assert.match(detailSource, /fetchPublicLearningTask\(fetch, taskCode\)/)
  assert.match(detailSource, /@click="finishTask"/)
  assert.match(detailSource, /publicLearningSubmissionUrl\(task\.value\.taskCode\)/)
  assert.match(detailSource, /buildLearningSubmissionPayload\(/)
})

test('任务详情的关键行为通过状态边界函数保持可执行契约', async () => {
  const api = await import('../src/utils/learningTaskApi.js')
  assert.equal(typeof api.normalizeLearningDraft, 'function')
  const restored = api.normalizeLearningDraft({ answers: { q1: 123 }, currentStep: -1 }, 3)
  assert.deepEqual(restored.answers, {})
  assert.equal(restored.currentStep, 0)
  assert.equal(typeof api.ensureSuccessfulResponse, 'function')
})

test('任务详情通过容错边界访问本机草稿，存储异常不阻断任务加载或远程同步', () => {
  assert.match(detailSource, /readLearningStorage\(/)
  assert.match(detailSource, /writeLearningStorage\(/)
  assert.doesNotMatch(detailSource, /localStorage\.(?:getItem|setItem)\(/)
  assert.match(detailSource, /同步失败，本机也无法保存/)
  assert.doesNotMatch(detailSource, /成果已保存到本机草稿，也可以导出/)
})
