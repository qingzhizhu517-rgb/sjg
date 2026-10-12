import test from 'node:test'
import assert from 'node:assert/strict'
import { setupPage } from '../display-v2/tests/helpers/componentSetup.js'

const records = [
  { id: 10, entityType: 'poem', entityId: 1, status: 'needs_review' },
  { id: 11, entityType: 'cultural_item', entityId: 2, status: 'needs_review' },
  { id: 12, entityType: 'poem', entityId: 3, status: 'published' },
]
async function page(post, confirm = async () => {}) {
  let gets = 0
  const fixture = await setupPage('../../admin-frontend/src/views/ContentGovernance.vue', {
    api: { get: async () => { gets++; return { records, total: 3 } }, post },
    ElMessage: { warning() {}, success() {} }, ElMessageBox: { confirm },
  })
  await fixture.ready
  return { ...fixture, getCount: () => gets }
}

test('只有待审核记录可勾选，确认后只提交选中的审核ID，结果在刷新后保留', async () => {
  const calls = []
  const fixture = await page(async (url, body) => {
    calls.push({ url, body })
    return { total: 2, successCount: 1, failureCount: 1, items: [
      { reviewId: 10, success: true, status: 'published', message: '审核通过，已发布到用户端' },
      { reviewId: 11, success: false, message: '实体至少需要一条来源关联才能发布' },
    ] }
  })
  const { state } = fixture
  assert.equal(state.canSelectReview(records[0]), true)
  assert.equal(state.canSelectReview(records[2]), false)
  state.selectedReviews.value = records.slice(0,2)
  state.batchReviewNote.value = '核验完毕'
  await state.submitBatchReview()
  assert.deepEqual(calls, [{ url: '/admin/content-reviews/batch-approve', body: { reviewIds: [10,11], reviewNote: '核验完毕' } }])
  assert.equal(state.batchResult.value.successCount, 1)
  assert.equal(state.batchResult.value.items[1].entityType, 'cultural_item')
  assert.match(state.batchResult.value.items[1].message, /来源/)
  assert.equal(state.selectedReviews.value.length, 0)
  assert.equal(state.batchBusy.value, false)
  assert.ok(fixture.getCount() > 3)
  fixture.dispose()
})

test('取消确认不提交，重复点击只发送一次请求', async () => {
  let posts = 0
  const cancelled = await page(async () => { posts++ }, async () => { throw 'cancel' })
  cancelled.state.selectedReviews.value = records.slice(0,2)
  await cancelled.state.submitBatchReview()
  assert.equal(posts, 0)
  assert.equal(cancelled.state.batchError.value, '')
  cancelled.dispose()
  let finish
  const running = await page(() => { posts++; return new Promise(resolve => { finish = resolve }) })
  running.state.selectedReviews.value = records.slice(0,2)
  const first = running.state.submitBatchReview()
  await new Promise(resolve => setImmediate(resolve))
  await running.state.submitBatchReview()
  assert.equal(posts, 1)
  finish({ total: 2, successCount: 2, failureCount: 0, items: records.slice(0,2).map(row => ({ reviewId: row.id, success: true })) })
  await first
  running.dispose()
})

test('请求超时不伪造逐条失败，保留待核对说明并刷新队列', async () => {
  const fixture = await page(async () => { throw new Error('timeout') })
  fixture.state.selectedReviews.value = records.slice(0,2)
  await fixture.state.submitBatchReview()
  assert.equal(fixture.state.batchResult.value, null)
  assert.match(fixture.state.batchError.value, /结果尚未确认/)
  assert.match(fixture.state.batchError.value, /核对/)
  assert.ok(fixture.getCount() > 3)
  assert.equal(fixture.state.batchBusy.value, false)
  fixture.dispose()
})


test('来源待补充发布须显式勾选，确认说明与请求一致', async () => {
  let sent, confirmation
  const fixture = await page(async (_url, body) => {
    sent = body
    return { total: 1, successCount: 1, failureCount: 0, items: [] }
  }, async text => { confirmation = text })
  fixture.state.selectedReviews.value = [records[0]]
  assert.equal(fixture.state.allowUnreferenced.value, false)
  fixture.state.allowUnreferenced.value = true
  await fixture.state.submitBatchReview()
  assert.equal(sent.allowUnreferenced, true)
  assert.match(confirmation, /来源待补充/)
  assert.match(confirmation, /不进入 AI/)
  fixture.dispose()
})
