// Pure, deterministic sandbox state. Heights are illustrative, never surveyed DEM.
export const LIMIT = 18
export const GRID = 112
export const emptyDraft = () => ({ schemaVersion: 1, objects: [], heights: {}, weather: 'clear' })
const clone = (value) => JSON.parse(JSON.stringify(value))
const finite = (v, min, max) => Number.isFinite(v) && v >= min && v <= max
export function validateDraft(input) {
  const d = typeof input === 'string' ? JSON.parse(input) : input
  if (
    !d ||
    d.schemaVersion !== 1 ||
    !Array.isArray(d.objects) ||
    d.objects.length > 500 ||
    !['clear', 'fog', 'rain'].includes(d.weather) ||
    !d.heights ||
    typeof d.heights !== 'object' ||
    Array.isArray(d.heights)
  )
    throw new Error('草稿格式或版本不受支持')
  const ids = new Set()
  const objects = d.objects.map((o) => {
    if (
      !o ||
      typeof o.id !== 'string' ||
      o.id.length > 80 ||
      ids.has(o.id) ||
      !['pavilion', 'tree', 'rock'].includes(o.asset) ||
      !finite(o.x, -LIMIT, LIMIT) ||
      !finite(o.z, -LIMIT, LIMIT) ||
      !finite(o.rotation, -360, 360) ||
      !finite(o.scale, 0.2, 4)
    )
      throw new Error('草稿物件参数无效')
    ids.add(o.id)
    return { id: o.id, asset: o.asset, x: o.x, z: o.z, rotation: o.rotation, scale: o.scale }
  })
  const heights = {}
  if (Object.keys(d.heights).length > (GRID + 1) ** 2) throw new Error('地形数据过大')
  for (const [key, value] of Object.entries(d.heights)) {
    if (!/^\d+,\d+$/.test(key) || key.split(',').some((n) => Number(n) > GRID) || !finite(value, -3, 5))
      throw new Error('地形数据无效')
    heights[key] = value
  }
  return { schemaVersion: 1, objects, heights, weather: d.weather }
}
export function createHistory(initial) {
  let value = clone(initial),
    back = [],
    forward = []
  return {
    get value() {
      return clone(value)
    },
    get canUndo() {
      return back.length > 0
    },
    get canRedo() {
      return forward.length > 0
    },
    commit(next) {
      back.push(value)
      if (back.length > 100) back.shift()
      value = clone(next)
      forward = []
    },
    undo() {
      if (!back.length) return false
      forward.push(value)
      value = back.pop()
      return true
    },
    redo() {
      if (!forward.length) return false
      back.push(value)
      value = forward.pop()
      return true
    },
  }
}
export function createFlight() {
  let flight = null
  return {
    start(from, to, duration = 1) {
      flight = { from: [...from], to: [...to], duration, t: 0 }
    },
    cancel() {
      flight = null
    },
    step(dt) {
      if (!flight) return null
      flight.t += dt
      const p = Math.min(1, flight.t / flight.duration),
        e = p * p * (3 - 2 * p)
      const result = flight.from.map((v, i) => v + (flight.to[i] - v) * e)
      if (p === 1) flight = null
      return result
    },
  }
}
export function createGesture() {
  const pointers = new Map()
  let previous = null
  return {
    down(id, x, y) {
      pointers.set(id, { x, y, invalid: pointers.size > 0 })
      if (pointers.size > 1) for (const p of pointers.values()) p.invalid = true
    },
    move(id, x, y) {
      const p = pointers.get(id)
      if (p && Math.hypot(x - p.x, y - p.y) > 6) p.invalid = true
    },
    up(id, x, y, target, time) {
      const p = pointers.get(id)
      pointers.delete(id)
      if (!p || p.invalid || Math.hypot(x - p.x, y - p.y) > 6) {
        previous = null
        return null
      }
      const double =
        previous &&
        previous.target === target &&
        time - previous.time < 300 &&
        Math.hypot(x - previous.x, y - previous.y) < 12
      previous = { target, time, x, y }
      return double ? 'double' : 'single'
    },
    cancel() {
      pointers.clear()
      previous = null
    },
  }
}
export function createTerrain({ base, riverDistance }) {
  let edits = {}
  const step = (LIMIT * 2) / GRID
  const baseline = new Float64Array((GRID + 1) ** 2)
  for (let j = 0; j <= GRID; j++)
    for (let i = 0; i <= GRID; i++) baseline[j * (GRID + 1) + i] = base(-LIMIT + i * step, -LIMIT + j * step)
  const sampleCache = new Map()
  const minimumHeight = -0.4
  function baseAt(x, z) {
    const key = `${x},${z}`
    if (sampleCache.has(key)) return sampleCache.get(key)
    const result = { height: base(x, z), river: riverDistance(x, z) }
    if (sampleCache.size < 100000) sampleCache.set(key, result)
    return result
  }
  const cell = (i, j) => baseline[j * (GRID + 1) + i] + (edits[`${i},${j}`] || 0)
  const sample = (x, z) => {
    const u = Math.max(0, Math.min(GRID, (x + LIMIT) / step)),
      v = Math.max(0, Math.min(GRID, (z + LIMIT) / step))
    const i = Math.min(GRID - 1, Math.floor(u)),
      j = Math.min(GRID - 1, Math.floor(v)),
      a = u - i,
      b = v - j
    const point = baseAt(x, z)
    const influence = Math.max(0, Math.min(1, (point.river - 0.5) / 0.25))
    const delta =
      (edits[`${i},${j}`] || 0) * (1 - a) * (1 - b) +
      (edits[`${i + 1},${j}`] || 0) * a * (1 - b) +
      (edits[`${i},${j + 1}`] || 0) * (1 - a) * b +
      (edits[`${i + 1},${j + 1}`] || 0) * a * b
    return Math.max(minimumHeight, point.height + delta * influence)
  }
  return {
    sample,
    get edits() {
      return { ...edits }
    },
    restore(next) {
      for (const [key, value] of Object.entries(next)) {
        const [i, j] = key.split(',').map(Number)
        if (base(-LIMIT + i * step, -LIMIT + j * step) + value < minimumHeight - 1e-6)
          throw new Error('草稿低于展台最低地表高度，请保留原草稿并调整后导入')
        if (value && riverDistance(-LIMIT + i * step, -LIMIT + j * step) < 0.5)
          throw new Error('草稿不可修改受保护河岸')
      }
      edits = { ...next }
    },
    paint({ x, z, type, radius = 1, strength = 0.1, target = sample(x, z) }) {
      const next = { ...edits }
      for (let i = 0; i <= GRID; i++)
        for (let j = 0; j <= GRID; j++) {
          const px = -LIMIT + i * step,
            pz = -LIMIT + j * step,
            d = Math.hypot(px - x, pz - z)
          if (d >= radius || riverDistance(px, pz) < 0.5) continue
          const weight = (1 - d / radius) ** 2
          const old = cell(i, j)
          let delta = (type === 'lower' ? -1 : 1) * strength * weight
          if (type === 'flatten') delta = (target - old) * Math.min(1, strength) * weight
          if (type === 'smooth') {
            const average =
              (sample(px - step, pz) +
                sample(px + step, pz) +
                sample(px, pz - step) +
                sample(px, pz + step)) /
              4
            delta = (average - old) * Math.min(1, strength) * weight
          }
          next[`${i},${j}`] = Math.max(
            Math.max(-3, minimumHeight - baseline[j * (GRID + 1) + i]),
            Math.min(5, (edits[`${i},${j}`] || 0) + delta),
          )
        }
      edits = next
    },
  }
}

// Anchor points remain geographic; compact plaques can shift with visible leaders.
export function layoutLabels(labels, selected, width, height) {
  const accepted = []
  const compact = width < 600
  const landmarks = ['济南', '菏泽', '东营']
  const priority = (label) =>
    label.name === selected ? -1 : landmarks.includes(label.name) ? landmarks.indexOf(label.name) : 9
  const ordered = [...labels].sort(
    (a, b) =>
      Number(b.name === selected) - Number(a.name === selected) ||
      (compact
        ? priority(a) - priority(b) || Math.abs(a.x - width / 2) - Math.abs(b.x - width / 2)
        : b.y - a.y),
  )
  const offsets = compact
    ? [
        [0, -20],
        [44, -20],
        [-44, -20],
        [0, -75],
      ]
    : [
        [0, -26],
        [54, -26],
        [-54, -26],
        [0, -110],
        [108, -26],
        [-108, -26],
        [54, -110],
        [-54, -110],
        [0, 66],
      ]
  for (const label of ordered) {
    const anchorX = label.x,
      anchorY = label.y
    label.anchorX = anchorX
    label.anchorY = anchorY
    if (!label.visible) continue
    label.visible = false
    if (compact && accepted.length >= 3) continue
    for (const [dx, dy] of offsets) {
      const x = anchorX + dx,
        y = anchorY + dy
      if (x < 26 || x > width - 26 || y < 62 || y > height - (compact ? 76 : 20)) continue
      if (accepted.some((other) => Math.abs(other.x - x) < 48 && Math.abs(other.y - y) < 76)) continue
      label.x = x
      label.y = y
      label.visible = true
      accepted.push(label)
      break
    }
  }
  return labels
}
