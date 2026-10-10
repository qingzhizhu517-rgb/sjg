// Procedural ink map of Shandong — drawn from real boundaries, no painting.
//
// Map space is a fixed 1920×1080 sheet. The static layer (paper, sea ripples,
// prefecture borders, lakes, canal, mountain ranges, outline) is rendered once
// into an offscreen canvas; scenes then place it with a camera and draw the
// moving parts (river, sites, names) as vectors in the same map space.
import { PREFECTURES, OUTLINE, YELLOW_RIVER, NINE_SITES } from '../geo/shandong.js'
import { INK, FONTS, getPaper, lerp, clamp01 } from './gfx.js'

export const MAP_W = 1920
export const MAP_H = 1080
const SUPER = 1.5 // static layer resolution, so camera push-ins stay crisp

// ---- projection ---------------------------------------------------------------
// Equirectangular with cos(φ0) correction — at this scale it is visually exact.
const LON0 = 114.55
const LAT1 = 38.62
const KX = Math.cos((36.4 * Math.PI) / 180)
const PX_PER_DEG = 202
const ORIGIN_X = 352
const ORIGIN_Y = 112

export function project(lon, lat) {
  return [ORIGIN_X + (lon - LON0) * KX * PX_PER_DEG, ORIGIN_Y + (LAT1 - lat) * PX_PER_DEG]
}
export const KM_PX = PX_PER_DEG / 111.2

// ---- deterministic randomness ----------------------------------------------------
function rng(seed) {
  let s = (seed * 2654435761) >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

// ---- geometry helpers -------------------------------------------------------------
function tracePath(ctx, pts, close = true) {
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  if (close) ctx.closePath()
}
const projRing = (ring) => ring.map(([lon, lat]) => project(lon, lat))

const OUTLINE_PX = OUTLINE.map(projRing)
const PREF_PX = PREFECTURES.map((p) => ({ ...p, px: p.rings.map(projRing), c: project(...p.center) }))

// Land border vs coast: the province meets Hebei/Henan/Anhui/Jiangsu only on its
// west and south-west; everything else on the outline is sea.
const isLand = ([lon, lat]) => lon < 117.74 || (lat < 35.1 && lon < 119.24)
function coastRuns() {
  const runs = []
  OUTLINE.forEach((ring, ri) => {
    if (ri > 0) { runs.push(projRing(ring)); return }
    let cur = []
    ring.forEach((pt) => {
      if (isLand(pt)) { if (cur.length > 1) runs.push(cur); cur = [] }
      else cur.push(project(...pt))
    })
    if (cur.length > 1) runs.push(cur)
  })
  return runs
}

// Catmull-Rom through control points → dense polyline with cumulative length.
function smooth(points, perSeg = 14) {
  const out = []
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    for (let k = 0; k < perSeg; k++) {
      const t = k / perSeg
      const t2 = t * t
      const t3 = t2 * t
      out.push([0, 1].map((d) => 0.5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t
        + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)))
    }
  }
  out.push(points[points.length - 1])
  return out
}

function withLength(pts) {
  let L = 0
  return pts.map((p, i) => {
    if (i) L += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])
    return { x: p[0], y: p[1], s: L }
  })
}

// ---- the Yellow River -------------------------------------------------------------
// Course data stops at the provincial border, so a short lead-in from Henan and
// an estuary tongue into the Bohai are added for the picture.
const RIVER_CTRL = [[114.55, 34.9], ...YELLOW_RIVER, [119.32, 37.76]].map(([a, b]) => project(a, b))
export const RIVER = (() => {
  const dense = smooth(RIVER_CTRL, 16)
  // gentle meander so the line reads as water, not a polyline
  const r = withLength(dense)
  const wob = r.map((p, i) => {
    const a = r[Math.max(0, i - 1)]
    const b = r[Math.min(r.length - 1, i + 1)]
    const nx = -(b.y - a.y)
    const ny = b.x - a.x
    const n = Math.hypot(nx, ny) || 1
    const amp = Math.sin(p.s * 0.045) * 2.2 + Math.sin(p.s * 0.11 + 1.3) * 1.1
    return [p.x + (nx / n) * amp, p.y + (ny / n) * amp]
  })
  const pts = withLength(wob)
  return { pts, length: pts[pts.length - 1].s }
})()

export function riverAt(u) {
  const s = clamp01(u) * RIVER.length
  const pts = RIVER.pts
  let lo = 0
  let hi = pts.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (pts[mid].s < s) lo = mid
    else hi = mid
  }
  const a = pts[lo]
  const b = pts[hi]
  const f = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0
  return { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f), dx: b.x - a.x, dy: b.y - a.y }
}

// The nine riverside cities, with the point on the river each is tied to.
export const SITES = NINE_SITES.map((c) => {
  const [x, y] = project(c.lon, c.lat)
  let best = null
  for (const p of RIVER.pts) {
    const d = Math.hypot(p.x - x, p.y - y)
    if (!best || d < best.d) best = { d, p }
  }
  return { ...c, x, y, rx: best.p.x, ry: best.p.y, u: best.p.s / RIVER.length }
})

// Where each name sits relative to its site (map px). Hand-placed to keep the
// corridor legible: 济南/泰安 and 滨州/东营/淄博 sit close together.
const LABEL = {
  菏泽: [-50, 24], 济宁: [0, 40], 泰安: [50, 14], 聊城: [-54, -4], 济南: [-62, 14],
  德州: [-50, -16], 淄博: [48, 22], 滨州: [-48, -26], 东营: [54, 26],
}
SITES.forEach((s) => { const [dx, dy] = LABEL[s.name] || [40, 0]; s.lx = s.x + dx; s.ly = s.y + dy })

// ---- ink mountains --------------------------------------------------------------
// [lon, lat, rx°, ry°, count, max height px, seed]
const RANGES = [
  [117.10, 36.22, 0.24, 0.05, 7, 34, 1],    // 泰山
  [117.40, 35.98, 0.12, 0.03, 3, 22, 2],    // 徂徕山
  [117.02, 36.50, 0.14, 0.02, 3, 16, 3],    // 济南南山
  [118.00, 36.40, 0.20, 0.04, 4, 24, 4],    // 鲁山
  [118.55, 36.20, 0.22, 0.05, 5, 26, 5],    // 沂山
  [117.85, 35.55, 0.30, 0.06, 6, 28, 6],    // 蒙山
  [118.45, 35.85, 0.16, 0.05, 4, 20, 7],    // 沂蒙
  [117.25, 35.50, 0.10, 0.03, 3, 16, 8],    // 尼山
  [117.55, 35.05, 0.12, 0.03, 3, 16, 9],    // 抱犊崮
  [119.25, 35.75, 0.16, 0.05, 4, 22, 10],   // 五莲·九仙
  [120.60, 36.20, 0.08, 0.03, 3, 26, 11],   // 崂山
  [120.25, 36.95, 0.16, 0.04, 4, 20, 12],   // 大泽山
  [120.85, 37.20, 0.22, 0.04, 5, 22, 13],   // 艾山
  [121.65, 37.18, 0.22, 0.04, 5, 24, 14],   // 昆嵛山
  [116.30, 36.22, 0.03, 0.01, 1, 12, 15],   // 鱼山
]

// One peak in the 界画/舆图 manner: a soft-shouldered silhouette, paper body so
// nearer peaks occlude farther ones, a wash that fades into mist at the foot,
// a few 披麻皴 strokes on the shaded flank and a heavier brush line at the crown.
function drawPeak(ctx, x, y, w, h, r, tone) {
  const apex = x + (r() - 0.5) * w * 0.22
  const top = y - h
  const lS = [x - w * (0.24 + r() * 0.08), y - h * (0.42 + r() * 0.14)]
  const rS = [x + w * (0.22 + r() * 0.08), y - h * (0.36 + r() * 0.16)]
  const sil = () => {
    ctx.beginPath()
    ctx.moveTo(x - w / 2, y)
    ctx.bezierCurveTo(x - w * 0.42, y - h * 0.12, lS[0] - w * 0.06, lS[1] + h * 0.14, lS[0], lS[1])
    ctx.bezierCurveTo(lS[0] + w * 0.06, lS[1] - h * 0.12, apex - w * 0.12, top + h * 0.06, apex, top)
    ctx.bezierCurveTo(apex + w * 0.1, top + h * 0.05, rS[0] - w * 0.06, rS[1] - h * 0.1, rS[0], rS[1])
    ctx.bezierCurveTo(rS[0] + w * 0.06, rS[1] + h * 0.16, x + w * 0.42, y - h * 0.1, x + w / 2, y)
  }
  sil()
  ctx.closePath()
  ctx.fillStyle = '#FAF7EF'
  ctx.fill()
  const g = ctx.createLinearGradient(0, top, 0, y)
  g.addColorStop(0, `rgba(58,54,46,${0.36 * tone})`)
  g.addColorStop(0.5, `rgba(120,104,80,${0.16 * tone})`)
  g.addColorStop(1, 'rgba(170,150,118,0)')
  ctx.fillStyle = g
  ctx.fill()
  ctx.save()
  ctx.clip()
  // shaded (east) flank
  const gs = ctx.createLinearGradient(apex, 0, apex + w * 0.45, 0)
  gs.addColorStop(0, `rgba(44,40,34,${0.2 * tone})`)
  gs.addColorStop(1, 'rgba(44,40,34,0.02)')
  ctx.fillStyle = gs
  ctx.fillRect(apex, top, w, h)
  ctx.strokeStyle = `rgba(44,40,34,${0.4 * tone})`
  ctx.lineCap = 'round'
  const n = 3 + Math.floor(r() * 3)
  for (let i = 0; i < n; i++) {
    const f = (i + 0.5) / n
    const sx = lerp(apex - w * 0.05, rS[0] + w * 0.04, f) + (r() - 0.5) * 3
    const sy = lerp(top + h * 0.12, rS[1], f) + 2
    ctx.lineWidth = 0.55 + r() * 0.45
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(sx + w * 0.04, sy + h * 0.22, sx + w * (0.02 + r() * 0.08), sy + h * (0.3 + r() * 0.25))
    ctx.stroke()
  }
  ctx.restore()
  sil()
  ctx.strokeStyle = `rgba(30,27,23,${0.62 * tone})`
  ctx.lineWidth = 0.9
  ctx.lineJoin = 'round'
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(lS[0], lS[1])
  ctx.bezierCurveTo(lS[0] + w * 0.06, lS[1] - h * 0.12, apex - w * 0.12, top + h * 0.06, apex, top)
  ctx.bezierCurveTo(apex + w * 0.1, top + h * 0.05, rS[0] - w * 0.06, rS[1] - h * 0.1, rS[0], rS[1])
  ctx.strokeStyle = `rgba(26,23,20,${0.85 * tone})`
  ctx.lineWidth = 1.6
  ctx.stroke()
  ctx.fillStyle = `rgba(26,23,20,${0.75 * tone})`
  const dots = 1 + Math.floor(r() * 3)
  for (let i = 0; i < dots; i++) {
    const t = 0.2 + r() * 0.6
    ctx.beginPath()
    ctx.ellipse(lerp(lS[0], apex, t), lerp(lS[1], top, t) - 1.2, 1.3, 0.8, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawRange(ctx, [lon, lat, rxd, ryd, count, maxH, seed]) {
  const r = rng(seed * 97 + 13)
  const [cx, cy] = project(lon, lat)
  const rx = rxd * KX * PX_PER_DEG
  const ry = ryd * PX_PER_DEG
  // under-wash that ties the range to the ground
  ctx.save()
  ctx.filter = 'blur(10px)'
  ctx.fillStyle = 'rgba(150,128,94,0.16)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + ry * 0.3, rx * 1.15, ry * 1.2 + 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // peaks laid out along the range's long axis, back rows smaller and paler
  const peaks = []
  for (let i = 0; i < count; i++) {
    const f = count === 1 ? 0.5 : i / (count - 1)
    const x = cx + (f - 0.5) * 2 * rx * (0.9 + r() * 0.1) + (r() - 0.5) * 8
    const y = cy + (r() - 0.5) * 2 * ry
    const centre = 1 - Math.abs(f - 0.5) * 1.4
    const h = 1.3 * maxH * (0.45 + 0.55 * centre) * (0.8 + r() * 0.3)
    peaks.push({ x, y, h, w: h * (1.7 + r() * 0.6) })
  }
  if (seed === 1) peaks.push({ x: cx - 4, y: cy + ry * 0.5, h: maxH * 2.3, w: maxH * 2.5 }) // 玉皇顶
  peaks.sort((a, b) => a.y - b.y)
  const ymin = peaks[0].y
  const ymax = peaks[peaks.length - 1].y
  peaks.forEach((p) => drawPeak(ctx, p.x, p.y, p.w, p.h, r, 0.62 + 0.38 * ((p.y - ymin) / Math.max(1, ymax - ymin))))
}

// ---- water --------------------------------------------------------------------------
const LAKES = [
  // 南四湖（微山湖）
  [[116.64, 35.30], [116.78, 35.18], [116.95, 35.00], [117.10, 34.84], [117.18, 34.72],
    [117.12, 34.70], [116.98, 34.84], [116.82, 34.99], [116.66, 35.15], [116.58, 35.25]],
  // 东平湖
  [[116.12, 36.03], [116.22, 36.06], [116.31, 36.00], [116.29, 35.92], [116.18, 35.89], [116.11, 35.95]],
]
const CANAL = [[116.62, 35.38], [116.42, 35.62], [116.26, 35.88], [116.14, 36.18], [115.99, 36.44],
  [115.92, 36.72], [116.08, 37.02], [116.30, 37.40], [116.55, 37.72], [116.82, 38.05]]

function fillSea(ctx) {
  // coastal ripples: concentric offset lines, the old 舆图 way of drawing a shore.
  // Built on a side canvas, then faded out toward the land borders so they never
  // spill onto Hebei / Jiangsu.
  const rip = document.createElement('canvas')
  rip.width = ctx.canvas.width
  rip.height = ctx.canvas.height
  const rc = rip.getContext('2d')
  rc.setTransform(ctx.getTransform())
  rc.lineJoin = 'round'
  rc.lineCap = 'round'
  const runs = coastRuns().filter((r) => r.length > 14)
  // a soft sea wash hugging the shore
  rc.filter = 'blur(40px)'
  rc.strokeStyle = 'rgba(92,100,104,0.16)'
  rc.lineWidth = 220
  runs.forEach((run) => { rc.beginPath(); tracePath(rc, run, false); rc.stroke() })
  rc.filter = 'none'
  // each ring is the outline of a fat stroke: stroke wide, punch out slightly narrower
  const tmp = document.createElement('canvas')
  tmp.width = rip.width
  tmp.height = rip.height
  const tc = tmp.getContext('2d')
  tc.lineJoin = 'round'
  tc.lineCap = 'round'
  const N = 7
  for (let k = 1; k <= N; k++) {
    const wdt = 4 + k * 11 + k * k * 0.6
    tc.setTransform(1, 0, 0, 1, 0, 0)
    tc.clearRect(0, 0, tmp.width, tmp.height)
    tc.setTransform(ctx.getTransform())
    tc.globalCompositeOperation = 'source-over'
    tc.strokeStyle = `rgba(56,62,66,${0.5 * Math.pow(1 - (k - 1) / N, 1.3)})`
    tc.lineWidth = wdt * 2
    runs.forEach((run) => { tc.beginPath(); tracePath(tc, run, false); tc.stroke() })
    tc.globalCompositeOperation = 'destination-out'
    tc.strokeStyle = '#000'
    tc.lineWidth = wdt * 2 - 1.2
    runs.forEach((run) => { tc.beginPath(); tracePath(tc, run, false); tc.stroke() })
    rc.save()
    rc.setTransform(1, 0, 0, 1, 0, 0)
    rc.drawImage(tmp, 0, 0)
    rc.restore()
  }
  // re-lay the wash on top of the ring stack so it isn't cut by the rings
  rc.globalCompositeOperation = 'source-over'
  // fade toward the land borders
  rc.globalCompositeOperation = 'destination-in'
  const [fx0] = project(117.55, 0)
  const [fx1] = project(118.25, 0)
  const gx = rc.createLinearGradient(fx0, 0, fx1, 0)
  gx.addColorStop(0, 'rgba(0,0,0,0)')
  gx.addColorStop(1, 'rgba(0,0,0,1)')
  rc.fillStyle = gx
  rc.fillRect(0, 0, MAP_W, MAP_H)
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.drawImage(rip, 0, 0)
  ctx.restore()
}

function drawWater(ctx, ring) {
  const px = smooth(projRing(ring), 6)
  ctx.save()
  ctx.beginPath()
  tracePath(ctx, px)
  ctx.fillStyle = 'rgba(112,122,124,0.16)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(40,44,46,0.55)'
  ctx.lineWidth = 0.8
  ctx.stroke()
  ctx.clip()
  ctx.strokeStyle = 'rgba(250,247,239,0.5)'
  ctx.lineWidth = 0.7
  const xs = px.map((q) => q[0])
  const ys = px.map((q) => q[1])
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)]
  for (let y = Math.min(...ys) + 3; y < Math.max(...ys); y += 6) {
    ctx.beginPath()
    for (let x = x0; x <= x1; x += 4) ctx.lineTo(x, y + Math.sin(x * 0.25 + y) * 0.9)
    ctx.strokeStyle = 'rgba(70,78,80,0.28)'
    ctx.stroke()
  }
  ctx.restore()
}

// ---- static layer -------------------------------------------------------------------
let layer = null
export function getMapLayer() {
  if (layer) return layer
  const c = document.createElement('canvas')
  c.width = MAP_W * SUPER
  c.height = MAP_H * SUPER
  const ctx = c.getContext('2d')
  ctx.scale(SUPER, SUPER)

  // paper
  ctx.fillStyle = INK.paper
  ctx.fillRect(0, 0, MAP_W, MAP_H)
  ctx.globalAlpha = 0.5
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = ctx.createPattern(getPaper(), 'repeat')
  ctx.fillRect(0, 0, MAP_W, MAP_H)
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1

  // everything off the province — neighbours and sea alike — sits a shade lower,
  // so the province reads as a raised sheet
  ctx.fillStyle = 'rgba(160,146,120,0.12)'
  ctx.fillRect(0, 0, MAP_W, MAP_H)
  fillSea(ctx)

  // the province itself — clean paper with a soft inner shadow
  ctx.save()
  ctx.beginPath()
  OUTLINE_PX.forEach((r) => tracePath(ctx, r))
  ctx.shadowColor = 'rgba(70,58,40,0.28)'
  ctx.shadowBlur = 26
  ctx.fillStyle = '#FBF8F0'
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.globalAlpha = 0.45
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = ctx.createPattern(getPaper(), 'repeat')
  ctx.fill()
  ctx.restore()

  // prefecture borders: fine dotted ink, the way 舆图 mark 府界
  ctx.save()
  ctx.setLineDash([1.2, 3.4])
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'rgba(70,62,52,0.5)'
  ctx.lineWidth = 0.9
  PREF_PX.forEach((p) => p.px.forEach((r) => { ctx.beginPath(); tracePath(ctx, r); ctx.stroke() }))
  ctx.restore()

  // canal and lakes, kept inside the province
  ctx.save()
  ctx.beginPath()
  OUTLINE_PX.forEach((r) => tracePath(ctx, r))
  ctx.clip()
  ctx.strokeStyle = 'rgba(70,74,76,0.55)'
  ctx.lineWidth = 1.1
  ctx.setLineDash([7, 4])
  ctx.beginPath()
  tracePath(ctx, smooth(projRing(CANAL), 8), false)
  ctx.stroke()
  ctx.setLineDash([])
  LAKES.forEach((l) => drawWater(ctx, l))
  ctx.restore()

  RANGES.forEach((rg) => drawRange(ctx, rg))

  // provincial outline: a confident brush line, doubled along the coast
  ctx.save()
  ctx.lineJoin = 'round'
  ctx.strokeStyle = 'rgba(34,31,27,0.82)'
  ctx.lineWidth = 1.8
  OUTLINE_PX.forEach((r) => { ctx.beginPath(); tracePath(ctx, r); ctx.stroke() })
  ctx.strokeStyle = 'rgba(34,31,27,0.18)'
  ctx.lineWidth = 5
  coastRuns().forEach((r) => { ctx.beginPath(); tracePath(ctx, r, false); ctx.stroke() })
  ctx.restore()

  // quiet labels: the sea, the other prefectures, the mountain
  const lab = (s, lon, lat, size, color, font = FONTS.song, spacing = 6) => {
    const [x, y] = project(lon, lat)
    ctx.save()
    ctx.font = `${size}px ${font}`
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = `${spacing}px`
    ctx.fillText(s, x, y)
    ctx.restore()
  }
  const vlab = (s, lon, lat, size, color) => [...s].forEach((ch, i) => lab(ch, lon, lat - i * (size * 1.35) / PX_PER_DEG, size, color))
  vlab('渤海', 119.75, 38.45, 30, 'rgba(60,64,66,0.55)')
  vlab('黄海', 122.2, 35.75, 30, 'rgba(60,64,66,0.55)')
  for (const n of ['青岛', '烟台', '威海', '潍坊', '日照', '临沂', '枣庄']) {
    const p = PREFECTURES.find((q) => q.name === n)
    if (p) lab(n, p.center[0], p.center[1] - 0.06, 15, 'rgba(90,82,70,0.62)')
  }
  for (const [n, lon, lat] of [['河北', 116.0, 38.3], ['河南', 115.2, 35.75], ['江苏', 118.3, 34.55], ['安徽', 116.3, 34.45]]) {
    lab(n, lon, lat, 22, 'rgba(120,108,90,0.42)', FONTS.song, 14)
  }
  lab('运河', 116.0, 36.92, 13, 'rgba(70,74,76,0.7)', FONTS.kai, 3)
  layer = c
  return c
}

// Places the static layer under a camera. Returns the matrix for vector overlays.
export function cameraFor(cx, cy, zoom, W = 1920, H = 1080) {
  return { a: zoom, e: W / 2 - cx * zoom, f: H / 2 - cy * zoom }
}
export function drawMapLayer(ctx, cam, { alpha = 1 } = {}) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.setTransform(cam.a, 0, 0, cam.a, cam.e, cam.f)
  ctx.drawImage(getMapLayer(), 0, 0, MAP_W, MAP_H)
  ctx.restore()
}
export const toScreen = (cam, x, y) => [x * cam.a + cam.e, y * cam.a + cam.f]

// Prefecture wash for the nine cities, keyed by name, 0..1 each.
export function washPrefectures(ctx, cam, amounts) {
  ctx.save()
  ctx.setTransform(cam.a, 0, 0, cam.a, cam.e, cam.f)
  ctx.globalCompositeOperation = 'multiply'
  PREF_PX.forEach((p) => {
    const a = amounts[p.name] || 0
    if (a <= 0) return
    ctx.beginPath()
    p.px.forEach((r) => tracePath(ctx, r))
    ctx.fillStyle = `rgba(214,190,150,${0.32 * a})`
    ctx.fill()
  })
  ctx.restore()
}

// The river, inked up to `reveal` (0..1) along its length; `t` drives the current.
export function drawRiver(ctx, cam, reveal, t, { alpha = 1 } = {}) {
  if (reveal <= 0) return
  const pts = RIVER.pts
  const sMax = reveal * RIVER.length
  const vis = []
  for (const p of pts) { if (p.s > sMax) break; vis.push(p) }
  const head = riverAt(reveal)
  vis.push({ x: head.x, y: head.y, s: sMax })
  if (vis.length < 2) return
  const widthAt = (s) => lerp(3.2, 7.5, s / RIVER.length)

  ctx.save()
  ctx.setTransform(cam.a, 0, 0, cam.a, cam.e, cam.f)
  ctx.globalAlpha = alpha
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // soft silt wash either side
  ctx.strokeStyle = 'rgba(190,150,84,0.16)'
  ctx.lineWidth = 26
  ctx.beginPath(); tracePath(ctx, vis.map((p) => [p.x, p.y]), false); ctx.stroke()
  // banks + body as a tapered ribbon
  const left = []
  const right = []
  vis.forEach((p, i) => {
    const a = vis[Math.max(0, i - 1)]
    const b = vis[Math.min(vis.length - 1, i + 1)]
    let nx = -(b.y - a.y)
    let ny = b.x - a.x
    const n = Math.hypot(nx, ny) || 1
    nx /= n; ny /= n
    const w = widthAt(p.s) * (i === vis.length - 1 ? 0.6 : 1)
    left.push([p.x + nx * w, p.y + ny * w])
    right.push([p.x - nx * w, p.y - ny * w])
  })
  ctx.beginPath()
  tracePath(ctx, [...left, ...right.reverse()])
  const g = ctx.createLinearGradient(vis[0].x, vis[0].y, head.x, head.y)
  g.addColorStop(0, 'rgba(176,132,62,0.78)')
  g.addColorStop(1, 'rgba(158,112,48,0.86)')
  ctx.fillStyle = g
  ctx.fill()
  right.reverse()
  ctx.strokeStyle = 'rgba(48,38,24,0.8)'
  ctx.lineWidth = 1.1
  ctx.beginPath(); tracePath(ctx, left, false); ctx.stroke()
  ctx.beginPath(); tracePath(ctx, right, false); ctx.stroke()
  // current: light streaks drifting downstream
  ctx.setLineDash([10, 16])
  ctx.lineDashOffset = -t * 38
  ctx.strokeStyle = 'rgba(255,240,206,0.55)'
  ctx.lineWidth = 1.1
  ctx.beginPath(); tracePath(ctx, vis.map((p) => [p.x, p.y]), false); ctx.stroke()
  ctx.setLineDash([])
  // the travelling light at the head
  if (reveal < 1) {
    const hg = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 40)
    hg.addColorStop(0, 'rgba(255,236,190,0.9)')
    hg.addColorStop(1, 'rgba(255,236,190,0)')
    ctx.fillStyle = hg
    ctx.beginPath(); ctx.arc(head.x, head.y, 40, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

// A site: a small vermilion seal at the city and its name.
export function drawSite(ctx, cam, site, a, { size = 34 } = {}) {
  if (a <= 0) return
  ctx.save()
  ctx.setTransform(cam.a, 0, 0, cam.a, cam.e, cam.f)
  const s = 9 * clamp01(a * 1.4)
  ctx.fillStyle = `rgba(158,44,34,${0.95 * clamp01(a * 1.4)})`
  ctx.fillRect(site.x - s / 2, site.y - s / 2, s, s)
  ctx.strokeStyle = `rgba(250,247,239,${0.9 * clamp01(a * 1.4)})`
  ctx.lineWidth = 1
  ctx.strokeRect(site.x - s / 2 + 2, site.y - s / 2 + 2, s - 4, s - 4)

  const ta = clamp01((a - 0.25) / 0.75)
  if (ta > 0) {
    ctx.font = `${size}px ${FONTS.brush}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = '4px'
    // paper halo keeps the name readable over hatching and mountains
    ctx.globalAlpha = ta
    ctx.lineWidth = 7
    ctx.strokeStyle = 'rgba(251,248,240,0.9)'
    ctx.lineJoin = 'round'
    ctx.strokeText(site.name, site.lx, site.ly + (1 - ta) * 8)
    ctx.fillStyle = INK.ink
    ctx.fillText(site.name, site.lx, site.ly + (1 - ta) * 8)
  }
  ctx.restore()
}
