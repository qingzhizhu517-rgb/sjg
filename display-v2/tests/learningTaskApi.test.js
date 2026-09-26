import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ensureSuccessfulResponse,
  buildLearningSubmissionPayload,
  fetchPublicLearningTask,
  publicLearningSubmissionUrl,
  publicLearningTaskUrl,
  normalizeLearningDraft,
  normalizeLearningText,
  normalizeTextMap,
  normalizeLearningContent,
  safeLearningResourcePath,
  readLearningStorage,
  writeLearningStorage,
  parseLearningDraft,
} from '../src/utils/learningTaskApi.js'

test('accepts successful fetch responses', async () => {
  const response = { ok: true }
  assert.equal(await ensureSuccessfulResponse(response), response)
})

test('surfaces backend message for failed fetch responses', async () => {
  const response = {
    ok: false,
    async json() { return { code: 400, message: '学习任务不存在或尚未发布' } },
  }
  await assert.rejects(
    () => ensureSuccessfulResponse(response),
    { message: '学习任务不存在或尚未发布' },
  )
})

test('uses fallback for non-json failed responses', async () => {
  const response = { ok: false, async json() { throw new Error('not json') } }
  await assert.rejects(() => ensureSuccessfulResponse(response, '网络暂时不可用'), { message: '网络暂时不可用' })
})

test('ignores malformed local learning drafts instead of blocking task loading', () => {
  assert.equal(parseLearningDraft('{not-json'), null)
  assert.equal(parseLearningDraft('[]'), null)
  assert.deepEqual(parseLearningDraft('{"answers":{"q1":"有依据"}}'), { answers: { q1: '有依据' } })
})

test('normalizes schema-valid drafts before they enter the learning page', () => {
  const rawDraft = {
    answers: {
      supported: '有依据',
      numeric: 42,
      nested: { text: '不应进入文本框' },
      empty: '',
    },
    feedbacks: {
      supported: '请补充出处',
      numeric: 7,
      nested: ['不应进入 Markdown'],
      empty: '',
    },
    currentStep: -3,
  }
  const parsed = parseLearningDraft(JSON.stringify(rawDraft))
  assert.deepEqual(parsed.answers, { supported: '有依据', empty: '' })
  assert.deepEqual(parsed.feedbacks, { supported: '请补充出处', empty: '' })

  const draft = normalizeLearningDraft(parsed, 3)

  assert.deepEqual(draft.answers, { supported: '有依据', empty: '' })
  assert.deepEqual(draft.feedbacks, { supported: '请补充出处', empty: '' })
  assert.equal(draft.currentStep, 0)
})

test('normalizes non-finite and out-of-range step indexes without throwing', () => {
  assert.equal(parseLearningDraft('{"currentStep":1e999}').currentStep, 0)
  for (const value of [Infinity, NaN, 'Infinity', 'not-a-number', null, true]) {
    assert.equal(normalizeLearningDraft({ currentStep: value }, 3).currentStep, 0)
  }
  assert.equal(normalizeLearningDraft({ currentStep: 9.8 }, 3).currentStep, 2)
  assert.equal(normalizeLearningDraft({ currentStep: '1.9' }, 3).currentStep, 1)
})

test('non-object answer and feedback maps become empty maps', () => {
  for (const value of [null, [], '回答', 12, true]) {
    assert.deepEqual(normalizeTextMap(value), {})
  }
  assert.deepEqual(normalizeTextMap({ q1: '保留', q2: 0 }), { q1: '保留' })
})

test('a JSON draft with non-object answer and feedback maps restores safely', () => {
  const parsed = parseLearningDraft(JSON.stringify({ answers: [], feedbacks: '损坏', currentStep: -1 }))
  const restored = normalizeLearningDraft(parsed, 3)
  assert.deepEqual(restored.answers, {})
  assert.deepEqual(restored.feedbacks, {})
  assert.equal(restored.currentStep, 0)
})

test('reflection text boundary accepts strings only', () => {
  assert.equal(normalizeLearningText('## 依据'), '## 依据')
  for (const value of [null, undefined, 0, false, {}, []]) {
    assert.equal(normalizeLearningText(value), '')
  }
})

test('builds encoded public task and submission URLs without changing the API shape', () => {
  assert.equal(publicLearningTaskUrl('jinan/01'), '/api/public/learning-tasks/jinan%2F01')
  assert.equal(publicLearningSubmissionUrl('jinan/01'), '/api/public/learning-tasks/jinan%2F01/submissions')
})

test('builds a safe submission payload from normalized answer text', () => {
  assert.deepEqual(buildLearningSubmissionPayload({
    sessionKey: 'session-1',
    answers: { q1: '依据', q2: { injected: true } },
    currentStep: -2,
    status: 'submitted',
  }), {
    sessionKey: 'session-1',
    answersJson: JSON.stringify({ q1: '依据' }),
    currentStep: 0,
    status: 'submitted',
  })
})

test('loads a published task through an executable retry boundary', async () => {
  let calls = 0
  const fetcher = async () => {
    calls += 1
    if (calls === 1) {
      return { ok: false, async json() { return { message: '暂时失败' } } }
    }
    return {
      ok: true,
      async json() {
        return {
          data: {
            taskCode: 'jinan-01',
            contentJson: JSON.stringify({ steps: [{ type: 'reflection' }], resources: [] }),
          },
        }
      },
    }
  }

  await assert.rejects(() => fetchPublicLearningTask(fetcher, 'jinan-01'), { message: '暂时失败' })
  const loaded = await fetchPublicLearningTask(fetcher, 'jinan-01')
  assert.equal(calls, 2)
  assert.equal(loaded.task.taskCode, 'jinan-01')
  assert.equal(loaded.content.steps[0].type, 'reflection')
})

test('normalizes malformed nested questions before they reach learning components', () => {
  const content = normalizeLearningContent({
    steps: [
      { type: ' Evidence ', questions: [null, 7, 'question', { id: 'q-1', prompt: '保留' }] },
      { type: 'COMPARE', questions: null },
      { type: ' reflection ', questions: { id: 'not-an-array' } },
    ],
    resources: [],
  })

  assert.deepEqual(content.steps[0].questions, [{ id: 'q-1', prompt: '保留' }])
  assert.deepEqual(content.steps[1].questions, [])
  assert.deepEqual(content.steps[2].questions, [])
  assert.deepEqual(content.steps.map((step) => step.type), ['evidence', 'compare', 'reflection'])
})

test('only allows same-origin or explicit HTTP resource paths', () => {
  assert.equal(safeLearningResourcePath('/poems/1'), '/poems/1')
  assert.equal(safeLearningResourcePath('./spots/2'), './spots/2')
  assert.equal(safeLearningResourcePath('https://example.com/reference'), 'https://example.com/reference')
  assert.equal(safeLearningResourcePath('javascript:alert(1)'), '')
  assert.equal(safeLearningResourcePath('data:text/html,<script>alert(1)</script>'), '')
  assert.equal(safeLearningResourcePath('vbscript:msgbox(1)'), '')
  assert.equal(safeLearningResourcePath('//evil.example/path'), '')
  assert.equal(safeLearningResourcePath(null), '')

  const content = normalizeLearningContent({
    steps: [],
    resources: [
      { id: 'safe', path: '/poems/1' },
      { id: 'unsafe', path: 'java\nscript:alert(1)' },
    ],
  })
  assert.equal(content.resources[0].path, '/poems/1')
  assert.equal(content.resources[1].path, '')
})

test('isolates learning draft storage failures from task loading and saving', () => {
  const brokenStorage = {
    getItem() { throw new Error('storage unavailable') },
    setItem() { throw new Error('storage unavailable') },
  }

  assert.equal(readLearningStorage('sjg-learning:test', brokenStorage), null)
  assert.equal(writeLearningStorage('sjg-learning:test', '{}', brokenStorage), false)
})
