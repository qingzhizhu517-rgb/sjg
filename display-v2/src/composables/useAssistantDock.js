import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ASSISTANT_DOCK_STORAGE_KEY,
  clampDockPosition,
  defaultDockPosition,
  getAssistantDrawerRect,
  normalizeDockPosition,
  normalizeViewport,
  parseDockPosition,
  restoreDockPosition,
  serializeDockPosition,
} from '../utils/assistantDock.js'

function readViewport() {
  if (typeof window === 'undefined') return normalizeViewport()
  const visible = window.visualViewport
  return normalizeViewport({
    width: visible?.width ?? window.innerWidth,
    height: visible?.height ?? window.innerHeight,
    offsetLeft: visible?.offsetLeft ?? 0,
    offsetTop: visible?.offsetTop ?? 0,
  })
}

function readSavedPosition() {
  try {
    return parseDockPosition(window.localStorage.getItem(ASSISTANT_DOCK_STORAGE_KEY))
  } catch {
    return null
  }
}

export function useAssistantDock() {
  const viewport = ref(readViewport())
  let savedPosition = readSavedPosition()
  const position = ref(savedPosition
    ? restoreDockPosition(savedPosition, viewport.value)
    : defaultDockPosition(viewport.value))
  const isDragging = ref(false)
  let pointer = null
  let suppressClickUntil = 0
  let visibleViewport = null

  const dockStyle = computed(() => ({ left: `${position.value.x}px`, top: `${position.value.y}px` }))
  const drawerStyle = computed(() => {
    const rect = getAssistantDrawerRect(position.value, viewport.value)
    return {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    }
  })

  function savePosition() {
    savedPosition = normalizeDockPosition(position.value, viewport.value)
    try {
      window.localStorage.setItem(ASSISTANT_DOCK_STORAGE_KEY, serializeDockPosition(position.value, viewport.value))
    } catch { /* 隐私模式下仍可拖动，仅不保存位置。 */ }
  }

  function updateViewport() {
    viewport.value = readViewport()
    position.value = savedPosition
      ? restoreDockPosition(savedPosition, viewport.value)
      : defaultDockPosition(viewport.value)
    // 缩放或软键盘改变坐标系时结束当前拖动，防止下一次移动跳跃。
    if (pointer) finishPointer(isDragging.value)
  }

  function onPointerDown(event) {
    if (pointer || event.isPrimary === false || (event.button !== undefined && event.button !== 0)) return
    pointer = {
      id: event.pointerId,
      target: event.currentTarget,
      x: event.clientX,
      y: event.clientY,
      start: { ...position.value },
    }
    suppressClickUntil = 0
    try { pointer.target.setPointerCapture(pointer.id) } catch { /* 浏览器可能已取消触点。 */ }
  }

  function onPointerMove(event) {
    if (!pointer || event.pointerId !== pointer.id) return
    const deltaX = event.clientX - pointer.x
    const deltaY = event.clientY - pointer.y
    if (!isDragging.value && Math.hypot(deltaX, deltaY) <= 5) return
    isDragging.value = true
    event.preventDefault()
    position.value = clampDockPosition({ x: pointer.start.x + deltaX, y: pointer.start.y + deltaY }, viewport.value)
    savedPosition = normalizeDockPosition(position.value, viewport.value)
  }

  function finishPointer(suppressClick) {
    if (!pointer) return
    const active = pointer
    pointer = null
    if (suppressClick) {
      suppressClickUntil = Date.now() + 400
      savePosition()
    }
    isDragging.value = false
    try { active.target.releasePointerCapture(active.id) } catch { /* 捕获可能已自动释放。 */ }
  }

  function onPointerUp(event) {
    if (pointer?.id === event.pointerId) finishPointer(isDragging.value)
  }

  function onPointerCancel(event) {
    if (pointer?.id === event.pointerId) finishPointer(true)
  }

  function onClick(event, callback) {
    if (event.detail !== 0 && Date.now() < suppressClickUntil) {
      suppressClickUntil = 0
      event.preventDefault()
      event.stopPropagation()
      return
    }
    suppressClickUntil = 0
    callback()
  }

  function onKeydown(event) {
    if (!event.shiftKey) return
    const directions = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }
    const direction = directions[event.key]
    if (!direction) return
    event.preventDefault()
    position.value = clampDockPosition({ x: position.value.x + direction[0], y: position.value.y + direction[1] }, viewport.value)
    savePosition()
  }

  function resetPosition() {
    finishPointer(false)
    savedPosition = null
    position.value = defaultDockPosition(viewport.value)
    try { window.localStorage.removeItem(ASSISTANT_DOCK_STORAGE_KEY) } catch { /* 存储不可用时忽略。 */ }
  }

  onMounted(() => {
    updateViewport()
    window.addEventListener('resize', updateViewport)
    visibleViewport = window.visualViewport
    visibleViewport?.addEventListener('resize', updateViewport)
    visibleViewport?.addEventListener('scroll', updateViewport)
  })

  onBeforeUnmount(() => {
    finishPointer(false)
    window.removeEventListener('resize', updateViewport)
    visibleViewport?.removeEventListener('resize', updateViewport)
    visibleViewport?.removeEventListener('scroll', updateViewport)
  })

  return {
    dockStyle,
    drawerStyle,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onClick,
    onKeydown,
    resetPosition,
  }
}
