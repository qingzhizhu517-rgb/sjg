import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parseReadingQuery, normalizeReadingLines, normalizeReadingMaterial, readingPairKey,
  readReadingDraft, saveReadingDraft, findReadingReference, mergeReadingSources,
} from '../src/utils/readingState.js'

test('对读参数只接受正整数ID、九城和安全站内返回路径', () => {
  assert.deepEqual(parseReadingQuery({ poem: '12', compare: '19', region: '济南', spot: '3', returnTo: '/poems?view=all' }),
    { poem: 12, compare: 19, region: '济南', spot: 3, returnTo: '/poems?view=all' })
  for (const value of ['1.2', '-1', '0', ' 2 ', ['2'], '9007199254740992']) assert.equal(parseReadingQuery({ poem: value }).poem, null)
  for (const value of ['//evil.test', '/\\evil.test', '/%5cevil.test', '/%2f%2fevil.test', '/a\n']) assert.equal(parseReadingQuery({ returnTo: value }).returnTo, '/poems')
  assert.equal(parseReadingQuery({ region: '任意城市' }).region, '')
})
test('原文行号与后端一样统一CRLF和CR、去空白行、从1递增', () => {
  assert.deepEqual(normalizeReadingLines(' 山色 \r\n\r水声\n  \n远帆 '), [{ number: 1, text: '山色' }, { number: 2, text: '水声' }, { number: 3, text: '远帆' }])
})
const materialA = normalizeReadingMaterial({ poem: { id: 12, title: '甲', content: '山\n水' }, poet: { name: '杜甫' }, dynasty: { name: '唐' }, sources: [{ title: '文献', sourceId: 7, locator: '卷一' }] }, 'A')
const materialB = normalizeReadingMaterial({ poem: { id: 19, title: '乙', content: '舟' }, sources: [{ title: '文献', sourceId: 7, locator: '卷一' }] }, 'B')
test('真实详情解包后保留原文、作者及实际来源', () => {
  assert.equal(materialA.author, '杜甫'); assert.equal(materialA.dynasty, '唐'); assert.equal(materialA.lines.length, 2)
  assert.equal(normalizeReadingMaterial({ poem: { id: 1 } }, 'A'), null)
  assert.equal(normalizeReadingMaterial({}, 'A'), null)
})
test('草稿键保留材料顺序；不存在的引用不能生成原文定位', () => {
  assert.notEqual(readingPairKey([materialA, materialB]), readingPairKey([materialB, materialA]))
  assert.equal(readingPairKey([materialA, null]), '')
  assert.deepEqual(findReadingReference('A', 2, [materialA, materialB]), { label: 'A', number: 2, text: '水' })
  assert.equal(findReadingReference('B', 2, [materialA, materialB]), null)
})
test('本机拒绝读取/保存与损坏草稿有不同可见状态', () => {
  const denied = { getItem() { throw new Error('denied') }, setItem() { throw new Error('denied') } }
  assert.equal(readReadingDraft(denied, 'key', [materialA, materialB]).status, 'unavailable')
  assert.equal(saveReadingDraft(denied, 'key', { answer: '判断', selected: [] }), false)
  assert.equal(readReadingDraft({ getItem: () => '{broken' }, 'key', [materialA, materialB]).status, 'corrupt')
  assert.equal(readReadingDraft({ getItem: () => JSON.stringify({ version: 1, answer: 99 }) }, 'key', [materialA, materialB]).status, 'corrupt')
  const valid = readReadingDraft({ getItem: () => JSON.stringify({ version: 1, answer: '我认为', selected: [{ label: 'A', number: 2, text: '水' }, { label: 'B', number: 99, text: '不存在' }] }) }, 'key', [materialA, materialB])
  assert.equal(valid.status, 'restored'); assert.equal(valid.draft.selected.length, 1); assert.equal(valid.draft.selected[0].text, '水')
})
test('同一文献合并时仍标明A和B两份材料归属', () => {
  const sources = mergeReadingSources([materialA, materialB])
  assert.equal(sources.length, 1); assert.match(sources[0].note, /材料 A《甲》/); assert.match(sources[0].note, /材料 B《乙》/)
})

test('同书同定位合并保留两份材料各自的真实关联说明', () => {
  const sources = mergeReadingSources([{ ...materialA, sources: [{ title: '文献', sourceId: 7, locator: '卷一', note: '甲的依据说明' }] }, { ...materialB, sources: [{ title: '文献', sourceId: 7, locator: '卷一', note: '乙的依据说明' }] }])
  assert.equal(sources.length, 1); assert.match(sources[0].note, /甲的依据说明/); assert.match(sources[0].note, /乙的依据说明/)
})

test('原文行号移动后旧选句不能静默变成新句，个人判断保留并提示', () => {
  const raw = JSON.stringify({ version: 1, answer: '关于水的判断', selected: [{ label: 'A', number: 2, text: '水' }] })
  const changed = { ...materialA, lines: [{ number: 1, text: '新首句' }, { number: 2, text: '山' }, { number: 3, text: '水' }] }
  const restored = readReadingDraft({ getItem: () => raw }, 'key', [changed, materialB])
  assert.equal(restored.draft.answer, '关于水的判断'); assert.equal(restored.draft.selected.length, 0); assert.equal(restored.changedEvidence, true)
})
