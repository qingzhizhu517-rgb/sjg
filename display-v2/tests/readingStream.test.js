import test from 'node:test'
import assert from 'node:assert/strict'
import { createReadingStream } from '../src/utils/readingStream.js'
const evidence = { materials: [{ id: 12, label: 'A', title: '甲', lines: [{ number: 1, text: '山' }], sources: [] }, { id: 19, label: 'B', title: '乙', lines: [{ number: 1, text: '水' }], sources: [] }] }
const payload = { poemIds: [12, 19], focus: 'imagery', mode: 'compare', answer: '' }
const event = value => `data: ${JSON.stringify(value)}\n\n`
function response(text, chunkSize = 1) {
  const bytes = new TextEncoder().encode(text)
  return { ok: true, body: new ReadableStream({ start(controller) { for (let i = 0; i < bytes.length; i += chunkSize) controller.enqueue(bytes.slice(i, i + chunkSize)); controller.close() } }) }
}
test('中文逐字节分块、evidence先行、done尾事件均正确消费', async () => {
  const stream = createReadingStream()
  await stream.start(async () => response(event(evidence) + event({ delta: '山水之间' }) + 'data: {"done":true}'), '/compare', payload)
  assert.equal(stream.snapshot().status, 'complete'); assert.equal(stream.snapshot().text, '山水之间'); assert.equal(stream.snapshot().materials.length, 2)
})
test('没有evidence不得接纳delta；错误不能被后续done改成完成', async () => {
  const stream = createReadingStream()
  await stream.start(async () => response(event({ delta: '无依据' }) + event({ done: true })), '/compare', payload)
  assert.equal(stream.snapshot().status, 'error'); assert.equal(stream.snapshot().text, '')
  await stream.start(async () => response(event(evidence) + event({ delta: '部分' }) + event({ error: '服务不可用' }) + event({ done: true })), '/compare', payload)
  assert.equal(stream.snapshot().status, 'error'); assert.equal(stream.snapshot().text, '部分'); assert.match(stream.snapshot().error, /服务不可用/)
})
test('提前EOF保留片段并明确中断，不能宣称完成', async () => {
  const stream = createReadingStream()
  await stream.start(async () => response(event(evidence) + event({ delta: '未完' })), '/compare', payload)
  assert.equal(stream.snapshot().status, 'interrupted'); assert.equal(stream.snapshot().text, '未完')
})
test('停止和新请求阻止忽略AbortSignal的旧响应污染', async () => {
  let release
  let capturedSignal
  const pending = new Promise(resolve => { release = resolve })
  const stream = createReadingStream()
  const old = stream.start(async (_url, options) => { capturedSignal = options.signal; return pending }, '/compare', payload)
  stream.stop(); assert.equal(capturedSignal.aborted, true); assert.equal(stream.snapshot().status, 'stopped')
  await stream.start(async () => response(event(evidence) + event({ delta: '新的' }) + event({ done: true })), '/compare', payload)
  release(response(event(evidence) + event({ delta: '旧的' }) + event({ done: true })))
  await old; assert.equal(stream.snapshot().text, '新的'); assert.equal(stream.snapshot().status, 'complete')
})
test('不接受不同ID或无连续行号的服务器evidence', async () => {
  const stream = createReadingStream()
  await stream.start(async () => response(event({ materials: [{ ...evidence.materials[0], id: 99 }, evidence.materials[1]] })), '/compare', payload)
  assert.equal(stream.snapshot().status, 'error')
})

test('连续行号验证和等待时重复提交不会产生第二次请求', async () => {
  const stream = createReadingStream()
  await stream.start(async () => response(event({ materials: [{ ...evidence.materials[0], lines: [{ number: 2, text: '行号跳跃' }] }, evidence.materials[1]] })), '/compare', payload)
  assert.equal(stream.snapshot().status, 'error')
  let release, calls = 0
  const pending = stream.start(async () => { calls++; return new Promise(resolve => { release = resolve }) }, '/compare', payload)
  await stream.start(async () => { calls++; return response('') }, '/compare', payload)
  assert.equal(calls, 1)
  stream.stop(); release(response('')); await pending
})

test('当前原文快照与服务器evidence不同则停止，不能定位到旧原句', async () => {
  const stream = createReadingStream()
  const changed = { materials: [{ ...evidence.materials[0], lines: [{ number: 1, text: '新发布的河' }] }, evidence.materials[1]] }
  await stream.start(async () => response(event(changed) + event({ delta: '新河的解释[A:1]' }) + event({ done: true })), '/compare', payload, evidence.materials)
  assert.equal(stream.snapshot().status, 'error'); assert.equal(stream.snapshot().text, ''); assert.match(stream.snapshot().error, /原文.*更新|重新读取/)
})

test('标题按页面一致的trim和空题规则归一，不误报更新', async () => {
  const stream = createReadingStream()
  const padded = { materials: [{ ...evidence.materials[0], title: ' 甲 ' }, evidence.materials[1]] }
  await stream.start(async () => response(event(padded) + event({ delta: '线索[A:1]' }) + event({ done: true })), '/compare', payload, evidence.materials)
  assert.equal(stream.snapshot().status, 'complete')
})
