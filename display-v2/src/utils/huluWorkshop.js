// 参数化数字体验；档位和反馈阈值是产品设计，不是非遗技艺鉴定标准。
export const WORK_STORAGE_KEY = 'sjg-dongchang-works-v1'
export const WORK_LIMITS = Object.freeze({ strokes: 128, pointsPerStroke: 256, totalPoints: 8192, library: 6 })
export const HULU_SHAPES = [
  { id: 'balanced', label: '匀称', note: '上小下大，腹部舒展' },
  { id: 'slender', label: '长腰', note: '腰身修长，适合纵向布纹' },
  { id: 'full', label: '丰腹', note: '下腹丰圆，留出宽阔画面' },
]
export const HULU_MOTIFS = [
  { id: 'plum', label: '梅枝', note: '原创花卉构图 · 借枝干转折练习线条' },
  { id: 'lotus', label: '莲花', note: '原创花卉构图 · 沿花瓣练习弧线' },
  { id: 'fish', label: '游鱼', note: '原创吉祥题材构图 · 鱼身与水纹相映' },
]
export const MAKE_STEPS = ['选坯', '布纹', '描刻', '敷色擦色', '检视保存']
const round = n => Math.round(n * 10000) / 10000
const inRange = (n, min, max) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max
const hasId = (options, id) => options.some(o => o.id === id)
const pointValid = p => p && inRange(p.u, 0, 1) && inRange(p.v, 0, 1)

export function createWorkshopState(overrides = {}) {
  return {
    version: 1, shape: 'balanced', motif: 'plum', placement: { u: .5, v: .31, scale: 1, rotation: 0 },
    depth: 1, pigment: 'ink', practice: 'guided', tolerance: 'relaxed', name: '我的东昌葫芦', strokes: [], ...overrides,
  }
}

export function normalizeStroke(stroke) {
  if (!stroke || !['carve', 'coat', 'wipe'].includes(stroke.kind) || ![1, 2, 3].includes(stroke.depth) || !['ink', 'ochre'].includes(stroke.pigment)) return null
  if (!Array.isArray(stroke.points) || stroke.points.length < 2 || stroke.points.length > WORK_LIMITS.pointsPerStroke || !stroke.points.every(pointValid)) return null
  return { kind: stroke.kind, depth: stroke.depth, pigment: stroke.pigment, points: stroke.points.map(p => ({ u: round(p.u), v: round(p.v) })) }
}

export function normalizeWork(value) {
  if (!value || value.version !== 1 || !hasId(HULU_SHAPES, value.shape) || !hasId(HULU_MOTIFS, value.motif)) return null
  const p = value.placement
  if (!p || !inRange(p.u, .15, .85) || !inRange(p.v, .18, .68) || !inRange(p.scale, .55, 1.4) || !inRange(p.rotation, -180, 180)) return null
  if (![1, 2, 3].includes(value.depth) || !['ink', 'ochre'].includes(value.pigment) || !['guided', 'free'].includes(value.practice)) return null
  if (value.tolerance != null && !['relaxed', 'precise'].includes(value.tolerance)) return null
  if (typeof value.name !== 'string' || value.name.length > 48 || !Array.isArray(value.strokes) || value.strokes.length > WORK_LIMITS.strokes) return null
  const strokes = value.strokes.map(normalizeStroke)
  if (strokes.some(s => !s) || strokes.reduce((n, s) => n + s.points.length, 0) > WORK_LIMITS.totalPoints) return null
  return { version: 1, shape: value.shape, motif: value.motif, placement: { u: round(p.u), v: round(p.v), scale: round(p.scale), rotation: round(p.rotation) }, depth: value.depth, pigment: value.pigment, practice: value.practice, tolerance: value.tolerance || 'relaxed', name: value.name.trim() || '未命名葫芦', strokes }
}

// 原创矢量线稿：曲线在 UV 面定义，避免材质贴花与真实笔迹各自采用不同坐标。
const curve = (a, b, c, d, count = 24) => Array.from({ length: count + 1 }, (_, i) => {
  const t = i / count, k = 1 - t
  return { x: k ** 3 * a[0] + 3 * k ** 2 * t * b[0] + 3 * k * t ** 2 * c[0] + t ** 3 * d[0], y: k ** 3 * a[1] + 3 * k ** 2 * t * b[1] + 3 * k * t ** 2 * c[1] + t ** 3 * d[1] }
})
const oval = (x, y, rx, ry) => Array.from({ length: 33 }, (_, i) => ({ x: x + Math.cos(i / 32 * Math.PI * 2) * rx, y: y + Math.sin(i / 32 * Math.PI * 2) * ry }))
const petal = (x, y, angle, size) => {
  const local = [...curve([0, 0], [-size * .9, size * .8], [-size * .6, size * 1.65], [0, size * 1.45]), ...curve([0, size * 1.45], [size * .6, size * 1.65], [size * .9, size * .8], [0, 0]).slice(1)]
  return local.map(p => ({ x: x + p.x * Math.cos(angle) - p.y * Math.sin(angle), y: y + p.x * Math.sin(angle) + p.y * Math.cos(angle) }))
}
function motifDrawing(id) {
  if (id === 'lotus') return [
    ...[-.95, -.5, 0, .5, .95].map(a => petal(0, -.03, a, .32)),
    curve([-.52, -.03], [-.4, -.36], [.4, -.36], [.52, -.03]),
    curve([0, -.2], [.06, -.38], [-.08, -.49], [-.12, -.68]),
    curve([-.12, -.55], [-.58, -.3], [-.63, -.72], [-.12, -.55]),
    curve([.1, -.5], [.32, -.29], [.55, -.54], [.1, -.5]),
    curve([-.63, -.74], [-.3, -.62], [.25, -.84], [.61, -.7]),
  ]
  if (id === 'fish') return [
    curve([-.5, .04], [-.19, .52], [.5, .47], [.54, .03]),
    curve([.54, .03], [.28, -.4], [-.18, -.32], [-.5, .04]),
    curve([-.48, .04], [-.82, .4], [-.72, -.34], [-.48, .04]),
    oval(.33, .12, .045, .06),
    curve([.16, .32], [-.08, .1], [.03, -.09], [.16, -.25]),
    petal(-.01, .32, -.7, .18),
    ...[-.3, -.16, -.02].map(x => curve([x, .24], [x + .14, .14], [x + .14, -.04], [x, -.13])),
    curve([-.72, -.53], [-.26, -.34], [.15, -.73], [.65, -.47]),
    curve([-.5, -.68], [-.18, -.52], [.26, -.83], [.52, -.63]),
  ]
  return [
    curve([-.57, -.7], [-.25, -.4], [.02, .1], [.52, .5]),
    curve([-.42, -.55], [-.05, -.25], [.2, -.24], [.53, -.04]),
    curve([-.11, -.1], [-.4, .12], [-.34, .38], [-.44, .58]),
    ...[{ x: .28, y: .3, size: .14 }, { x: -.31, y: .23, size: .12 }].flatMap(f => [
      ...Array.from({ length: 5 }, (_, i) => petal(f.x, f.y, i * Math.PI * 2 / 5, f.size)), oval(f.x, f.y, .035, .035),
    ]),
    oval(.51, -.04, .06, .075), petal(-.25, -.35, 1.35, .15),
  ]
}
export function getMotifPaths(work) {
  const { u, v, scale, rotation } = work.placement
  const angle = rotation * Math.PI / 180
  return motifDrawing(work.motif).map(path => path.map(p => {
    const x = p.x * .17 * scale, y = p.y * .19 * scale
    return { u: round(Math.min(.99, Math.max(.01, u + x * Math.cos(angle) - y * Math.sin(angle)))), v: round(Math.min(.98, Math.max(.02, v + x * Math.sin(angle) + y * Math.cos(angle)))) }
  }))
}
export function placementHint(work) {
  const paths = getMotifPaths(work).flat()
  if (paths.some(p => p.v > .5 && p.v < .66)) return '纹样靠近束腰，弧面会压缩线条；可向下移或缩小。'
  if (paths.some(p => p.v < .05 || p.v > .9 || p.u < .05 || p.u > .95)) return '纹样接近器物边缘，建议缩小后再描刻。'
  return '纹样落在腹部，旋转检查留白后即可描刻。'
}
export function uvDistance(a, b) {
  const dx = Math.min(Math.abs(a.u - b.u), 1 - Math.abs(a.u - b.u))
  return Math.hypot(dx, a.v - b.v)
}
function samples(points, max = 200) {
  const result = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i]
    if (Math.abs(a.u - b.u) > .5 || uvDistance(a, b) > .14) { result.push(b); continue }
    const n = Math.min(64, Math.max(1, Math.ceil(uvDistance(a, b) / .008)))
    for (let j = 1; j <= n; j++) result.push({ u: a.u + (b.u - a.u) * j / n, v: a.v + (b.v - a.v) * j / n })
  }
  return result.length <= max ? result : Array.from({ length: max }, (_, i) => result[Math.round(i * (result.length - 1) / (max - 1))])
}
const near = (p, points, tolerance) => points.some(q => uvDistance(p, q) <= tolerance)
export function evaluateWork(work) {
  const strokes = work.strokes || []
  const carved = strokes.flatMap((s, index) => s.kind === 'carve' ? samples(s.points).map(p => ({ ...p, index, depth: s.depth })) : [])
  // 固定采样预算，反馈无需逐个像素扫描整张纹理。
  const stride = Math.max(1, Math.ceil(carved.length / 600))
  const actual = carved.filter((_, i) => i % stride === 0)
  const reference = getMotifPaths(work).flatMap(path => samples(path, 60))
  const refs = reference.filter((_, i) => i % Math.max(1, Math.ceil(reference.length / 320)) === 0)
  const length = strokes.filter(s => s.kind === 'carve').reduce((total, s) => total + s.points.slice(1).reduce((n, p, i) => n + (Math.abs(p.u - s.points[i].u) > .5 || uvDistance(p, s.points[i]) > .14 ? 0 : uvDistance(p, s.points[i])), 0), 0)
  const tolerance = work.tolerance === 'precise' ? .01 : .017
  const coverage = refs.length ? Math.round(100 * refs.filter(p => near(p, actual, tolerance)).length / refs.length) : 0
  const deviation = actual.length ? Math.round(100 * actual.filter(p => !near(p, refs, tolerance * 1.5)).length / actual.length) : 0
  const colorStrokes = strokes.map((s, index) => ({ ...s, index, sampled: samples(s.points) })).filter(s => s.kind !== 'carve')
  let coated = 0, wiped = 0
  for (const p of actual) {
    let hasColor = false, hasWipe = false
    for (const s of colorStrokes) {
      if (s.index <= p.index || !near(p, s.sampled, s.kind === 'coat' ? .035 : .055)) continue
      if (s.kind === 'coat') { hasColor = true; hasWipe = false } else if (hasColor) hasWipe = true
    }
    if (hasColor) coated++
    if (hasWipe) wiped++
  }
  const colorCoverage = actual.length ? Math.round(coated * 100 / actual.length) : 0
  const wipeCoverage = actual.length ? Math.round(wiped * 100 / actual.length) : 0
  const deep = actual.filter(p => p.depth === 3 && actual.some(q => q.index !== p.index && q.depth === 3 && uvDistance(p, q) < .008)).length
  const deepWarning = actual.length > 0 && deep / actual.length > .2
  const canColor = length >= .04 && (work.practice === 'free' || coverage >= 30)
  const canFinish = canColor && colorCoverage >= 60 && wipeCoverage >= 50
  const score = work.practice === 'free' ? null : Math.max(0, Math.round(coverage * .7 + (100 - deviation) * .3 - (deepWarning ? 10 : 0)))
  const hint = !canColor ? (work.practice === 'guided' ? '沿参考线继续描刻，覆盖达到 30% 后可敷色。' : '留下一段完整刻线，再进入敷色。') : colorCoverage < 60 ? '敷色覆盖刻线的 60%，让色料进入凹槽。' : wipeCoverage < 50 ? '用擦色工具清去浮色，刻线覆盖至少 50%。' : '刻线已显纹，可进入赏鉴并保存作品。'
  return { coverage, deviation, colorCoverage, wipeCoverage, score, deepWarning, canColor, canFinish, hint, count: strokes.length }
}

export function readLibrary(storage) {
  try {
    const raw = storage?.getItem(WORK_STORAGE_KEY)
    if (!raw) return { works: [], error: '' }
    if (raw.length > 2200000) return { works: [], error: '本地作品数据过大，无法读取。' }
    const data = JSON.parse(raw)
    if (data.version !== 1 || !Array.isArray(data.works)) return { works: [], error: '本地作品版本不受支持。' }
    const works = data.works.slice(0, WORK_LIMITS.library).flatMap(entry => {
      const work = normalizeWork(entry?.work)
      return work && typeof entry.id === 'string' && entry.id.length < 100 && Number.isFinite(Date.parse(entry.savedAt)) ? [{ id: entry.id, savedAt: entry.savedAt, work }] : []
    })
    return { works, error: works.length !== Math.min(data.works.length, WORK_LIMITS.library) ? '部分本地作品已损坏，已跳过。' : '' }
  } catch { return { works: [], error: '本地作品无法读取或已损坏；现有数据不会自动覆盖。' } }
}
export function writeLibrary(storage, works) {
  try {
    if (!storage) throw new Error('Storage unavailable')
    storage.setItem(WORK_STORAGE_KEY, JSON.stringify({ version: 1, works: works.slice(0, WORK_LIMITS.library) }))
    return { ok: true, works: works.slice(0, WORK_LIMITS.library), error: '' }
  } catch { return { ok: false, error: '本地保存失败：存储可能已满或被浏览器禁用，请导出图片保留作品。' } }
}
export function saveWork(storage, work, id) {
  const normalized = normalizeWork(work)
  if (!normalized) return { ok: false, error: '作品数据无效，无法保存。' }
  const library = readLibrary(storage)
  if (library.error) return { ok: false, error: library.error }
  const entry = { id: id || globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`, savedAt: new Date().toISOString(), work: normalized }
  return { ...writeLibrary(storage, [entry, ...library.works.filter(w => w.id !== entry.id)]), id: entry.id }
}
