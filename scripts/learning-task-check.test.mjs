import test from 'node:test'
import assert from 'node:assert/strict'

import { validateLearningTask } from './learning-task-check.mjs'

function validTask() {
  return {
    version: 1,
    resources: [
      {
        id: 'poem-1',
        entityType: 'poem',
        entityId: 12,
        title: '趵突泉诗歌材料',
        snippet: '来源支持的诗句与地点摘要',
        sourceIds: [31],
      },
      {
        id: 'spot-1',
        entityType: 'scenic_spot',
        entityId: 8,
        title: '趵突泉景观材料',
        snippet: '来源支持的景观沿革摘要',
        sourceIds: [32],
      },
    ],
    steps: [
      {
        type: 'evidence',
        title: '证据阅读',
        questions: [{
          id: 'q1',
          prompt: '材料明确告诉了我们什么？',
          entityRefs: [{ type: 'poem', id: 12 }],
          sourceIds: [31],
        }],
      },
      {
        type: 'compare',
        title: '比较分析',
        questions: [{
          id: 'q2',
          prompt: '诗词与景观材料有哪些异同？',
          entityRefs: [{ type: 'poem', id: 12 }, { type: 'scenic_spot', id: 8 }],
          sourceIds: [31, 32],
        }],
      },
      {
        type: 'reflection',
        title: '反思表达',
        questions: [{
          id: 'q3',
          prompt: '你如何理解诗词与城市的关系？',
          entityRefs: [{ type: 'poem', id: 12 }],
          sourceIds: [31],
        }],
      },
    ],
  }
}

test('accepts a complete task with the three required learning steps', () => {
  assert.deepEqual(validateLearningTask(validTask()), [])
})

test('rejects incomplete or duplicated step types', () => {
  const task = validTask()
  task.steps[2].type = 'compare'

  const issues = validateLearningTask(task)

  assert.ok(issues.some((issue) => issue.path === 'steps' && issue.message.includes('各出现一次')))
})

test('rejects invalid entity and source bindings before database publishing', () => {
  const task = validTask()
  task.steps[0].questions[0].entityRefs = [{ type: 'poem', id: 0 }]
  task.steps[0].questions[0].sourceIds = []

  const issues = validateLearningTask(task)

  assert.ok(issues.some((issue) => issue.path.includes('entityRefs')))
  assert.ok(issues.some((issue) => issue.path.includes('sourceIds')))
})

test('requires comparison questions to reference at least two entities', () => {
  const task = validTask()
  task.steps[1].questions[0].entityRefs = [{ type: 'poem', id: 12 }]

  const issues = validateLearningTask(task)

  assert.ok(issues.some((issue) => issue.path.includes('steps[1].questions[0]')
    && issue.message.includes('两个实体')))
})

test('requires comparison questions to reference two distinct entities', () => {
  const task = validTask()
  task.steps[1].questions[0].entityRefs = [{ type: 'poem', id: 12 }, { type: 'poem', id: 12 }]

  const issues = validateLearningTask(task)

  assert.ok(issues.some((issue) => issue.path.includes('steps[1].questions[0]')
    && issue.message.includes('两个实体')))
})

test('requires comparison questions to cite two distinct sources', () => {
  const task = validTask()
  task.steps[1].questions[0].sourceIds = [31]

  const issues = validateLearningTask(task)

  assert.ok(issues.some((issue) => issue.path.includes('steps[1].questions[0]')
    && issue.message.includes('两个不同来源')))
})

test('requires every question entity and source to be covered by matching resources', () => {
  const task = validTask()
  task.resources[1].sourceIds = [99]

  const issues = validateLearningTask(task)

  assert.ok(issues.some((issue) => issue.path === 'steps[1].questions[0]'
    && (issue.message.includes('景点') || issue.message.includes('scenic_spot:8'))))
  assert.ok(issues.some((issue) => issue.path === 'steps[1].questions[0]'
    && issue.message.includes('32')))
})

test('matches the legacy spot alias to scenic_spot resources', () => {
  const task = validTask()
  task.steps[1].questions[0].entityRefs[1].type = 'spot'

  assert.deepEqual(validateLearningTask(task), [])
})

test('treats spot aliases as the same entity in comparison questions', () => {
  const task = validTask()
  task.steps[1].questions[0].entityRefs = [
    { type: 'spot', id: 8 },
    { type: 'scenic_spot', id: 8 },
  ]

  const issues = validateLearningTask(task)

  assert.ok(issues.some((issue) => issue.path.includes('steps[1].questions[0]')
    && issue.message.includes('两个实体')))
})

test('rejects template placeholders unless explicitly allowed', () => {
  const task = validTask()
  task.steps[0].questions[0].prompt = '替换为来源支持的问题'

  const issues = validateLearningTask(task)

  assert.ok(issues.some((issue) => issue.message.includes('占位')))
  assert.deepEqual(validateLearningTask(task, { rejectPlaceholders: false }), [])
})

test('requires every question to have a non-blank id', () => {
  const task = validTask()
  task.steps[0].questions[0].id = '   '

  const issues = validateLearningTask(task)

  assert.ok(issues.some((issue) => issue.path === 'steps[0].questions[0].id'
    && issue.message.includes('题目 ID')))
})

test('requires trimmed question ids to be globally unique', () => {
  const task = validTask()
  task.steps[2].questions[0].id = ' q1 '

  const issues = validateLearningTask(task)

  assert.ok(issues.some((issue) => issue.path === 'steps[2].questions[0].id'
    && issue.message.includes('唯一')))
})
