export const ASSISTANT_DOCK_SIZE = Object.freeze({ width: 88, height: 96 })
export const ASSISTANT_DOCK_STORAGE_KEY = 'sjg-assistant-dock-v1'

const finite = (value) => typeof value === 'number' && Number.isFinite(value)
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function normalizeViewport(viewport = {}) {
  return {
    width: finite(viewport.width) && viewport.width > 0 ? viewport.width : 1024,
    height: finite(viewport.height) && viewport.height > 0 ? viewport.height : 768,
    offsetLeft: finite(viewport.offsetLeft) ? Math.max(0, viewport.offsetLeft) : 0,
    offsetTop: finite(viewport.offsetTop) ? Math.max(0, viewport.offsetTop) : 0,
  }
}

function dockBounds(viewport) {
  const view = normalizeViewport(viewport)
  const availableX = Math.max(0, view.width - ASSISTANT_DOCK_SIZE.width)
  const availableY = Math.max(0, view.height - ASSISTANT_DOCK_SIZE.height)
  const marginX = Math.min(12, availableX / 2)
  const marginY = Math.min(12, availableY / 2)
  return {
    minX: view.offsetLeft + marginX,
    maxX: view.offsetLeft + availableX - marginX,
    minY: view.offsetTop + marginY,
    maxY: view.offsetTop + availableY - marginY,
  }
}

export function clampDockPosition(position, viewport) {
  const bounds = dockBounds(viewport)
  return {
    x: clamp(finite(position?.x) ? position.x : bounds.maxX, bounds.minX, bounds.maxX),
    y: clamp(finite(position?.y) ? position.y : bounds.maxY, bounds.minY, bounds.maxY),
  }
}

export function defaultDockPosition(viewport) {
  const view = normalizeViewport(viewport)
  return clampDockPosition({
    x: view.offsetLeft + view.width - ASSISTANT_DOCK_SIZE.width - 16,
    y: view.offsetTop + view.height - ASSISTANT_DOCK_SIZE.height - 20,
  }, view)
}

export function normalizeDockPosition(position, viewport) {
  const point = clampDockPosition(position, viewport)
  const bounds = dockBounds(viewport)
  return {
    x: bounds.maxX === bounds.minX ? 0 : (point.x - bounds.minX) / (bounds.maxX - bounds.minX),
    y: bounds.maxY === bounds.minY ? 0 : (point.y - bounds.minY) / (bounds.maxY - bounds.minY),
  }
}

export function restoreDockPosition(saved, viewport) {
  const bounds = dockBounds(viewport)
  return {
    x: bounds.minX + clamp(saved.x, 0, 1) * (bounds.maxX - bounds.minX),
    y: bounds.minY + clamp(saved.y, 0, 1) * (bounds.maxY - bounds.minY),
  }
}

export function parseDockPosition(value) {
  if (typeof value !== 'string' || value.length > 200) return null
  try {
    const saved = JSON.parse(value)
    if (saved?.version !== 1 || !finite(saved.x) || !finite(saved.y)) return null
    if (saved.x < 0 || saved.x > 1 || saved.y < 0 || saved.y > 1) return null
    return { x: saved.x, y: saved.y }
  } catch {
    return null
  }
}

export function serializeDockPosition(position, viewport) {
  return JSON.stringify({ version: 1, ...normalizeDockPosition(position, viewport) })
}

export function getAssistantDrawerRect(position, viewport) {
  const view = normalizeViewport(viewport)
  const point = clampDockPosition(position, view)
  const margin = Math.min(12, view.width / 4, view.height / 4)
  const width = Math.min(390, view.width - margin * 2)
  const height = Math.min(560, view.height - margin * 2)
  const minX = view.offsetLeft + margin
  const maxX = view.offsetLeft + view.width - margin - width
  const minY = view.offsetTop + margin
  const maxY = view.offsetTop + view.height - margin - height
  if (view.width <= 600) {
    return { left: minX, top: maxY, width: view.width - margin * 2, height }
  }
  const leftSide = point.x - width - 12
  const rightSide = point.x + ASSISTANT_DOCK_SIZE.width + 12
  const prefersLeft = point.x + ASSISTANT_DOCK_SIZE.width / 2 >= view.offsetLeft + view.width / 2
  let left = prefersLeft ? leftSide : rightSide
  if (left < minX || left > maxX) {
    const alternate = prefersLeft ? rightSide : leftSide
    if (alternate >= minX && alternate <= maxX) left = alternate
  }
  return {
    left: clamp(left, minX, maxX),
    top: clamp(point.y + ASSISTANT_DOCK_SIZE.height - height, minY, maxY),
    width,
    height,
  }
}
