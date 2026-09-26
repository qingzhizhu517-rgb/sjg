import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  resourcesForQuestion,
  formatEvidenceForQuestion,
} from '../src/utils/learningEvidence.js'

const [taskViewSource, reflectionSource] = await Promise.all([
  readFile(new URL('../src/views/LearningTaskView.vue', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/learning/ReflectionStep.vue', import.meta.url), 'utf8'),
])

const resources = [
  { entityType: 'poem', entityId: 1, title: '诗一', snippet: '甲', sourceIds: [10] },
  { entityType: 'scenic_spot', entityId: 2, title: '景二', snippet: '乙', sourceIds: [20] },
  { entityType: 'poem', entityId: 3, title: '诗三', snippet: '丙', sourceIds: [20] },
]

test('反思题按 entityRefs 和 sourceIds 的交集筛选专属资源', () => {
  const matched = resourcesForQuestion({
    entityRefs: [{ type: 'poem', id: 1 }],
    sourceIds: [10],
  }, resources)
  assert.deepEqual(matched.map((item) => item.title), ['诗一'])
})

test('反思题兼容旧 entityType/entityIds 结构和 spot 别名', () => {
  const matched = resourcesForQuestion({
    entityType: 'spot',
    entityIds: [2],
    sourceIds: [20],
  }, resources)
  assert.deepEqual(matched.map((item) => item.title), ['景二'])
})

test('没有匹配资源时不会把全部任务材料发送给模型', () => {
  const evidence = formatEvidenceForQuestion({ entityRefs: [{ type: 'event', id: 9 }], sourceIds: [99] }, resources)
  assert.match(evidence, /未匹配到专属材料/)
  assert.doesNotMatch(evidence, /诗一|景二|诗三/)
})

test('反思组件不保留未使用的全量 evidenceText 传递链', () => {
  assert.doesNotMatch(taskViewSource, /evidence-text|evidenceText/)
  assert.doesNotMatch(reflectionSource, /evidenceText/)
})

test('学习任务资源卡在窄屏下允许正文收缩和长文本换行', () => {
  assert.match(taskViewSource, /\.resource-item\s*\{[^}]*min-width:\s*0/s)
  assert.match(taskViewSource, /\.resource-item h3\s*\{[^}]*overflow-wrap:\s*anywhere/s)
  assert.match(taskViewSource, /\.resource-item a\s*\{[^}]*white-space:\s*normal/s)
})
