import { ref, computed } from 'vue'
import { createWorkshopState, normalizeWork, normalizeStroke, evaluateWork, readLibrary, saveWork, writeLibrary, WORK_LIMITS } from '../utils/huluWorkshop.js'

export function useHuluWorkshop(storage) {
  if (storage === undefined) { try { storage = globalThis.localStorage } catch { storage = null } }
  const initial = readLibrary(storage)
  const work = ref(createWorkshopState())
  const step = ref(0)
  const tool = ref('rotate')
  const library = ref(initial.works)
  const message = ref(initial.error)
  const pending = ref(null)
  const redoStack = ref([])
  const savedId = ref(null)
  const assessment = computed(() => evaluateWork(work.value))
  const canUndo = computed(() => work.value.strokes.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)
  const replace = next => { work.value = next; redoStack.value = []; savedId.value = null; tool.value = 'rotate' }
  const choose = (key, value) => {
    const next = normalizeWork({ ...work.value, [key]: value })
    if (!next) return false
    if (['shape', 'motif', 'placement'].includes(key) && (work.value.strokes.length || redoStack.value.length)) {
      pending.value = { kind: 'change', next: { ...next, strokes: [] } }
      return false
    }
    work.value = next
    return true
  }
  const confirmPending = () => {
    const action = pending.value
    if (!action) return
    replace(action.next)
    step.value = action.kind === 'restore' ? (evaluateWork(action.next).canFinish ? 4 : 2) : action.kind === 'reset' ? 0 : 1
    if (action.id) savedId.value = action.id
    pending.value = null
    message.value = action.kind === 'restore' ? '已恢复本地作品，可以继续编辑。' : '已更换构图，旧笔迹已清除。'
  }
  const addStroke = value => {
    if (!((step.value === 2 && value?.kind === 'carve') || (step.value === 3 && ['coat', 'wipe'].includes(value?.kind)))) return false
    const stroke = normalizeStroke(value)
    const next = stroke && normalizeWork({ ...work.value, strokes: [...work.value.strokes, stroke] })
    if (!next) { message.value = `笔迹已达保存上限（${WORK_LIMITS.strokes} 笔），可撤销部分笔迹或保存另起一件。`; return false }
    work.value = next; redoStack.value = []; message.value = ''
    return true
  }
  const undo = () => {
    if (!canUndo.value) return
    const strokes = [...work.value.strokes]
    redoStack.value = [...redoStack.value, strokes.pop()]
    work.value = { ...work.value, strokes }
  }
  const redo = () => {
    if (!canRedo.value) return
    const redo = [...redoStack.value]
    work.value = { ...work.value, strokes: [...work.value.strokes, redo.pop()] }
    redoStack.value = redo
  }
  const enter = index => {
    if (!Number.isInteger(index) || index < 0 || index > 4) return false
    if (index >= 3 && !assessment.value.canColor || index === 4 && !assessment.value.canFinish) { message.value = assessment.value.hint; return false }
    step.value = index; tool.value = 'rotate'; message.value = ''
    return true
  }
  const selectTool = value => {
    if (value === 'rotate' || step.value === 2 && value === 'carve' || step.value === 3 && ['coat', 'wipe'].includes(value)) { tool.value = value; return true }
    return false
  }
  const save = () => {
    if (!assessment.value.canFinish) { message.value = assessment.value.hint; return false }
    const result = saveWork(storage, work.value, savedId.value)
    message.value = result.ok ? '已保存在此浏览器的作品集。最多保留最近 6 件，不会上传到服务器。' : result.error
    if (result.ok) { library.value = result.works; savedId.value = result.id }
    return result.ok
  }
  const restore = id => {
    const entry = library.value.find(w => w.id === id)
    if (!entry) return false
    pending.value = { kind: 'restore', next: normalizeWork(entry.work), id }
    if (!work.value.strokes.length && !redoStack.value.length) confirmPending()
    return true
  }
  const remove = id => {
    const result = writeLibrary(storage, library.value.filter(w => w.id !== id))
    if (result.ok) { library.value = result.works; if (savedId.value === id) savedId.value = null; message.value = '已移除本地作品。' } else message.value = result.error
  }
  const reset = () => { pending.value = { kind: 'reset', next: createWorkshopState() } }
  return { work, step, tool, assessment, library, message, pending, canUndo, canRedo, choose, confirmPending, cancelPending: () => { pending.value = null }, addStroke, undo, redo, enter, selectTool, save, restore, remove, reset }
}
