import { test } from 'node:test'
import assert from 'node:assert/strict'
import { setupPage, testRoute, settle } from './helpers/componentSetup.js'
import { atlasLink, isAtlasPreview } from '../src/config/atlasPreview.js'
import { consumeSseBuffer } from '../src/utils/sse.js'
import { buildReadingLink } from '../src/utils/readingLink.js'

const statusResponse = (configured = true) => ({ ok: true, json: async () => ({ code: 200, data: { generationConfigured: configured, reason: configured ? 'configured' : 'not_configured' } }) })
const encoder = new TextEncoder()

async function openChat({ query = {}, fetch: network, open = true } = {}) {
  const boundary = testRoute('/poems/12', query, { id: '12' })
  boundary.route.name = 'PoemDetail'
  const calls = []
  const page = await setupPage('components/AiChatBox.vue', {
    useRoute: () => boundary.route, useRouter: () => boundary.router,
    apiUrl: path => path, atlasLink, isAtlasPreview, consumeSseBuffer, buildReadingLink,
    marked: { setOptions() {}, parse: text => text }, DOMPurify: { addHook() {}, sanitize: text => text },
    fetch: async (url, options) => { calls.push({ url, options }); return network ? network(url, options) : statusResponse() },
  })
  await page.ready
  if (open) { page.state.isOpen.value = true; await settle() }
  return { ...page, ...boundary, calls }
}

test('小文只在首次打开时检查生成配置，并正确解包 Result', async t => {
  const page = await openChat({ open: false })
  t.after(page.dispose)
  assert.equal(page.calls.length, 0)
  page.state.isOpen.value = true; await settle()
  assert.equal(page.calls[0].url, '/api/public/ai/status')
  assert.equal(page.state.generationStatus.value, 'configured')
  assert.equal(page.state.canGenerate.value, true)
  page.state.isOpen.value = false; await settle()
  page.state.isOpen.value = true; await settle()
  assert.equal(page.calls.length, 1)
  assert.doesNotMatch(page.state.messages.value[0].content, /已为您接入/)
})

test('未配置时禁用生成，仍能进入本页诗词的对照阅读', async t => {
  const page = await openChat({ fetch: async () => statusResponse(false) })
  t.after(page.dispose)
  assert.equal(page.state.generationStatus.value, 'not_configured')
  assert.equal(page.state.canGenerate.value, false)
  assert.match(page.state.generationNotice.value, /未配置/)
  const destination = new URL(page.state.readingLink.value, 'https://sjg.local')
  assert.equal(destination.pathname, '/reading')
  assert.equal(destination.searchParams.get('poem'), '12')
  assert.equal(destination.searchParams.get('returnTo'), page.route.fullPath)
  page.state.inputMsg.value = '赏析这首诗'
  await page.state.sendMessage()
  assert.equal(page.calls.length, 1)
  assert.equal(page.state.messages.value.length, 1)
})

test('状态检查失败可主动重试，也允许用户尝试生成', async t => {
  let failed = true
  const page = await openChat({ fetch: async () => failed ? { ok: true, json: async () => ({ code: 400, message: '失败' }) } : statusResponse() })
  t.after(page.dispose)
  assert.equal(page.state.generationStatus.value, 'unknown')
  assert.match(page.state.generationNotice.value, /无法确认/)
  assert.equal(page.state.canGenerate.value, true)
  failed = false
  await page.state.checkGenerationStatus()
  assert.equal(page.state.generationStatus.value, 'configured')
  assert.equal(page.calls.length, 2)
})

test('预览打开、提问和反馈均不发网络请求，站内资料导航保留预览', async t => {
  const page = await openChat({ query: { preview: 'inkwash' }, fetch() { assert.fail('预览不发送网络请求') } })
  t.after(page.dispose)
  assert.equal(page.state.canGenerate.value, false)
  assert.match(page.state.generationNotice.value, /样本.*不.*发送/)
  page.state.inputMsg.value = '样本问题'
  await page.state.sendMessage()
  const msg = { auditId: 5, feedback: null }
  await page.state.sendFeedback(msg, 'helpful')
  await page.state.checkGenerationStatus()
  page.state.navigateTo({ route: '/regions/济南' })
  assert.equal(page.calls.length, 0)
  assert.equal(msg.feedback, null)
  assert.equal(page.destinations[0].query.preview, 'inkwash')
  assert.equal(page.state.readingLink.value.query.preview, 'inkwash')
})

test('首个流式字到达后继续占用生成状态，直到流结束才允许再次发送', async t => {
  let stream
  const page = await openChat({ fetch: async url => url.endsWith('/status') ? statusResponse() : { ok: true, body: new ReadableStream({ start(controller) { stream = controller } }) } })
  t.after(page.dispose)
  page.state.inputMsg.value = '第一问'
  const pending = page.state.sendMessage(); await settle()
  stream.enqueue(encoder.encode('data: {"delta":"第一段"}\n\n')); await settle()
  assert.equal(page.state.messages.value.at(-1).content, '第一段')
  assert.equal(page.state.isTyping.value, true)
  page.state.inputMsg.value = '第二问'
  await page.state.sendMessage()
  assert.equal(page.calls.filter(call => call.url.endsWith('/chat')).length, 1)
  stream.close(); await pending
  assert.equal(page.state.isTyping.value, false)
})

test('生成连接没有回答便结束时，显示可重试状态', async t => {
  const page = await openChat({ fetch: async url => url.endsWith('/status') ? statusResponse() : { ok: true, body: new ReadableStream({ start(controller) { controller.close() } }) } })
  t.after(page.dispose)
  page.state.inputMsg.value = '没有收到回答的问题'
  await page.state.sendMessage()
  assert.equal(page.state.isTyping.value, false)
  assert.match(page.state.messages.value.at(-1).content, /未收到回复/)
  assert.equal(page.state.errorMsg.value, '未收到回复')
})

test('路由切换中止旧流，旧 AbortError 晚到不能解锁新的请求', async t => {
  const pending = []
  const page = await openChat({ fetch: (url, options) => url.endsWith('/status') ? statusResponse() : new Promise((resolve, reject) => pending.push({ resolve, reject, signal: options.signal })) })
  t.after(page.dispose)
  page.state.inputMsg.value = '旧页面'
  const oldRequest = page.state.sendMessage(); await settle()
  page.route.path = '/spots/5'; page.route.name = 'SpotDetail'; page.route.params = { id: '5' }; await settle()
  assert.equal(pending[0].signal.aborted, true)
  assert.equal(page.state.isTyping.value, false)
  page.state.inputMsg.value = '新页面'
  const newRequest = page.state.sendMessage(); await settle()
  pending[0].reject(Object.assign(new Error('aborted'), { name: 'AbortError' })); await oldRequest
  assert.equal(page.state.isTyping.value, true)
  assert.equal(page.state.errorMsg.value, null)
  pending[1].resolve({ ok: true, body: new ReadableStream({ start(controller) { controller.enqueue(encoder.encode('data: {"delta":"新回答"}\n\n')); controller.close() } }) })
  await newRequest
  assert.equal(page.state.messages.value.at(-1).content, '新回答')
  assert.equal(page.state.isTyping.value, false)
})

test('路由切入预览立即取消生成，旧状态响应不启用样本生成', async t => {
  let resolveStatus, statusSignal
  const page = await openChat({ fetch: (url, options) => new Promise(resolve => { resolveStatus = resolve; statusSignal = options.signal }) })
  t.after(page.dispose)
  page.route.query = { preview: 'inkwash' }; await settle()
  assert.equal(statusSignal.aborted, true)
  resolveStatus(statusResponse()); await settle()
  assert.equal(page.state.canGenerate.value, false)
  assert.equal(page.calls.length, 1)
})

test('反馈的 HTTP 200 业务错误不算成功，保留可重试状态', async t => {
  let failed = true
  const page = await openChat({ fetch: async url => url.endsWith('/status') ? statusResponse() : { ok: true, json: async () => failed ? { code: 400, message: '回答记录不存在' } : { code: 200, data: null } } })
  t.after(page.dispose)
  const msg = { auditId: 5, feedback: null }
  await page.state.sendFeedback(msg, 'helpful')
  assert.equal(msg.feedback, null)
  assert.match(msg.feedbackError, /重试/)
  assert.equal(msg.feedbackSending, false)
  failed = false
  await page.state.sendFeedback(msg, 'helpful')
  assert.equal(msg.feedback, 'helpful')
  assert.equal(msg.feedbackError, '')
})

test('重新检查配置期间不能吞掉聊天失败后的重试入口', async t => {
  let statusCalls = 0, resolveStatus
  const page = await openChat({ fetch: (url) => {
    if (!url.endsWith('/status')) return { ok: false }
    statusCalls += 1
    if (statusCalls === 1) return { ok: false }
    return new Promise(resolve => { resolveStatus = resolve })
  } })
  t.after(page.dispose)
  page.state.inputMsg.value = '失败的问题'
  await page.state.sendMessage()
  const contents = page.state.messages.value.map(message => message.content)
  const error = page.state.errorMsg.value
  const checking = page.state.checkGenerationStatus(); await settle()
  assert.equal(page.state.canGenerate.value, false)
  await page.state.retryLastMessage()
  assert.deepEqual(page.state.messages.value.map(message => message.content), contents)
  assert.equal(page.state.errorMsg.value, error)
  resolveStatus(statusResponse()); await checking
  assert.equal(page.state.canGenerate.value, true)
})

test('组件卸载会中止正在生成的请求', async () => {
  let signal, rejectChat
  const page = await openChat({ fetch: (url, options) => url.endsWith('/status') ? statusResponse() : new Promise((resolve, reject) => { signal = options.signal; rejectChat = reject }) })
  page.state.inputMsg.value = '问题'
  const pending = page.state.sendMessage(); await settle()
  page.dispose()
  assert.equal(signal.aborted, true)
  rejectChat(Object.assign(new Error('aborted'), { name: 'AbortError' })); await pending
  assert.equal(page.state.isTyping.value, false)
})
