import { consumeSseBuffer } from './sse.js'
import { normalizeSourceEntries } from './source.js'

const idle = () => ({ status: 'idle', text: '', materials: [], error: '', mode: 'compare' })
const active = status => ['waiting', 'streaming'].includes(status)
function validEvidence(value, ids) {
  if (!Array.isArray(value) || value.length !== 2) return null
  const materials = value.map((material, index) => {
    if (material?.id !== ids[index] || material.label !== ['A', 'B'][index]
      || !Array.isArray(material.lines) || !material.lines.length
      || material.lines.some((line, i) => line?.number !== i + 1 || typeof line.text !== 'string' || !line.text.trim())) return null
    return { ...material, title: typeof material.title === 'string' && material.title.trim() ? material.title.trim() : '未题名作品', sources: normalizeSourceEntries(material.sources) }
  })
  return materials.every(Boolean) ? materials : null
}
export function createReadingStream(onUpdate = () => {}) {
  let state = idle(), sequence = 0, controller = null, reader = null
  const update = patch => { state = { ...state, ...patch }; onUpdate({ ...state }) }
  const cancel = () => { controller?.abort(); const pending = reader?.cancel(); pending?.catch?.(() => {}); reader = null }
  const snapshot = () => ({ ...state })
  const stop = () => { sequence++; cancel(); if (active(state.status)) update({ status: 'stopped', error: '' }) }
  const reset = () => { sequence++; cancel(); state = idle(); onUpdate(snapshot()) }
  async function start(fetcher, url, payload, expectedMaterials = []) {
    if (active(state.status)) return false
    const ownSequence = ++sequence
    cancel(); controller = new AbortController()
    state = { ...idle(), status: 'waiting', mode: payload.mode }; onUpdate(snapshot())
    const current = () => ownSequence === sequence
    let localReader
    try {
      const response = await fetcher(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal })
      if (!current()) return false
      if (!response.ok) {
        let message = `生成请求失败（${response.status || '网络'}）`
        try { const result = await response.json(); message = result.message || message } catch { /* no JSON body */ }
        throw new Error(message)
      }
      if (!response.body) throw new Error('浏览器无法读取生成流，请重试')
      localReader = response.body.getReader(); reader = localReader
      const decoder = new TextDecoder(); let buffer = ''
      const consume = flush => {
        const parsed = consumeSseBuffer(buffer, flush); buffer = parsed.rest
        for (const event of parsed.events) {
          if (!current() || !active(state.status)) break
          let value
          try { value = JSON.parse(event) } catch { throw new Error('生成流格式异常，已保留收到的文字') }
          if (typeof value.error === 'string') throw new Error(value.error)
          if (value.materials) {
            const materials = validEvidence(value.materials, payload.poemIds)
            if (!materials) throw new Error('生成依据与当前材料不一致，请重试')
            if (expectedMaterials.length && materials.some((material, index) => {
              const expected = expectedMaterials[index]
              return !expected || material.title !== expected.title || material.lines.length !== expected.lines.length
                || material.lines.some((line, i) => line.number !== expected.lines[i].number || line.text !== expected.lines[i].text)
            })) throw new Error('原文已更新，请重新读取两篇原文后再生成。')
            update({ materials })
          }
          if (typeof value.delta === 'string') {
            if (!state.materials.length) throw new Error('尚未收到原文依据，已停止生成')
            update({ status: 'streaming', text: state.text + value.delta })
          }
          if (value.done === true) {
            if (!state.materials.length || !state.text.trim()) throw new Error('生成没有返回可读线索，请重试')
            update({ status: 'complete' })
          }
        }
      }
      while (current() && active(state.status)) {
        const { done, value } = await localReader.read()
        if (!current()) return false
        if (done) { buffer += decoder.decode(); consume(true); break }
        buffer += decoder.decode(value, { stream: true }); consume(false)
      }
      if (current() && active(state.status)) update({ status: 'interrupted', error: '连接提前结束，收到的文字尚未完成。可以重试。' })
    } catch (error) {
      if (current()) update({ status: error.name === 'AbortError' ? 'stopped' : 'error', error: error.name === 'AbortError' ? '' : (error.message || '生成暂时无法连接') })
    } finally {
      if (localReader) { try { await localReader.cancel() } catch { /* already closed */ } }
      if (current()) { reader = null; controller = null }
    }
    return current()
  }
  return { start, stop, reset, snapshot }
}
