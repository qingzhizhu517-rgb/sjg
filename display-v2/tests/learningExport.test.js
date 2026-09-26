import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import { buildLearningExportMarkdown } from '../src/utils/learningExport.js'

const [taskViewSource, evidenceStepSource] = await Promise.all([
  readFile(new URL('../src/views/LearningTaskView.vue', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/learning/EvidenceStep.vue', import.meta.url), 'utf8'),
])

const task = {
  taskCode: 'jinan-poetry-01',
  title: '济南诗词探究',
  goal: '用材料理解诗词与城市的关系',
}

const steps = [{
  type: 'reflection',
  title: '反思表达',
  questions: [{
    id: 'q-reflection-1',
    prompt: '这座城市在诗词中如何出现？',
    entityRefs: [
      { type: 'poem', id: 1 },
      { type: 'scenic_spot', id: 2 },
    ],
    sourceIds: [10, 20],
  }],
}]

const resources = [
  { entityType: 'poem', entityId: 1, title: '诗一', snippet: '诗词材料', sourceIds: [10, 99] },
  { entityType: 'scenic_spot', entityId: 2, title: '景二', snippet: '景观材料', sourceIds: [20] },
]

test('逐题导出实体、来源和匹配材料，且不泄露题目范围外的来源', () => {
  const markdown = buildLearningExportMarkdown({
    task,
    steps,
    resources,
    answers: { 'q-reflection-1': '我的判断' },
    feedbacks: { 'q-reflection-1': '请继续核对第二份材料。' },
  })

  assert.match(markdown, /题目 ID：q-reflection-1/)
  assert.match(markdown, /绑定实体：poem#1、scenic_spot#2/)
  assert.match(markdown, /绑定来源：10、20/)
  assert.match(markdown, /诗一：诗词材料（来源：10）/)
  assert.match(markdown, /景二：景观材料（来源：20）/)
  assert.doesNotMatch(markdown, /来源：10、99/)
  assert.match(markdown, /我的判断/)
  assert.match(markdown, /请继续核对第二份材料。/)
})

test('缺少题目绑定时导出明确标记追溯缺口', () => {
  const markdown = buildLearningExportMarkdown({
    task,
    steps: [{ type: 'evidence', questions: [{ id: 'q-1', prompt: '未绑定题目' }] }],
  })

  assert.match(markdown, /绑定实体：未声明/)
  assert.match(markdown, /绑定来源：未声明/)
  assert.match(markdown, /题目材料：未匹配到专属材料/)
})

test('学习任务页面使用逐题追溯导出器', () => {
  assert.match(taskViewSource, /buildLearningExportMarkdown/)
  assert.match(taskViewSource, /const markdown = buildLearningExportMarkdown\(/)
})

test('证据材料卡显示来源 ID，保留来源链提示', () => {
  assert.match(evidenceStepSource, /resource\.sourceIds/)
  assert.match(evidenceStepSource, /来源 ID/)
})

test('证据材料卡在渲染链接时再次执行协议白名单', () => {
  assert.match(evidenceStepSource, /safeLearningResourcePath/)
  assert.doesNotMatch(evidenceStepSource, /:href="resource\.path"/)
})
