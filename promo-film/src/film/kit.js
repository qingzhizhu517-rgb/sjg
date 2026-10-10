// Shared scene vocabulary: panels, verses, captions, stat figures, annotation marks.
import { INK, FONTS, text, vtext, seal, rule, wash, stroke, clamp01, easeOut, easeInOut, seg, lerp, feather } from './gfx.js'

export { INK, FONTS, text, vtext, seal, rule, wash, stroke, clamp01, easeOut, easeInOut, seg, lerp, feather }

const PUNCT = '，。、；：！？「」『』（）《》'

// Splits a line of classical verse into vertical columns at punctuation, the way
// a printed anthology sets it.
export function verseColumns(str, perCol = 0) {
  if (perCol > 0) {
    const chars = [...str]
    const cols = []
    for (let i = 0; i < chars.length; i += perCol) cols.push(chars.slice(i, i + perCol))
    return cols
  }
  const parts = []
  let cur = ''
  for (const ch of str) {
    cur += ch
    if (PUNCT.includes(ch)) { parts.push(cur); cur = '' }
  }
  if (cur) parts.push(cur)
  // merge columns that are too short to sit alone
  const out = []
  for (const p of parts) {
    if (out.length && [...p].length <= 2) out[out.length - 1] += p
    else out.push(p)
  }
  return out
}

// Renders verse as right-to-left vertical columns, inking in over `reveal` (0..1).
export function verse(ctx, str, x, y, {
  size = 58, gap = 0.18, colGap = 1.5, font = FONTS.kai, color = INK.ink,
  reveal = 1, alpha = 1, perCol = 0, weight = '', shadow = 0, punctuation = true,
} = {}) {
  const cols = verseColumns(str, perCol)
  const step = size * colGap
  const n = cols.length
  const total = n
  cols.forEach((col, ci) => {
    const cx = x - (n - 1 - ci) * step
    const colStart = ci / total
    const colEnd = (ci + 1) / total
    const local = clamp01((reveal - colStart) / Math.max(0.0001, colEnd - colStart))
    const body = punctuation ? col : col.replace(new RegExp(`[${PUNCT}]`, 'g'), '')
    vtext(ctx, body, cx, y, {
      size, gap, font, color, weight, alpha, from: local, shadow,
    })
  })
  void stroke
  return { width: n * step, columns: n }
}

// Paper panel used to keep type legible over artwork.
// It used to be a five-point polygon with each corner nudged by a different sine
// offset (`sin(seed + i*1.7) * 2.2`) — so the four sides came out non-parallel and
// every corner sat askew. On a 64px-tall chip that is exactly the "distorted frame"
// it looked like. A true rounded rect with the same soft shadow reads identically
// but stays square.
export function panel(ctx, x, y, w, h, { alpha = 0.9, r = 8, seed = 3, shadow = 60, color = INK.paper } = {}) {
  void seed
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  if (shadow > 0) {
    ctx.shadowColor = 'rgba(28,26,22,0.18)'
    ctx.shadowBlur = shadow
    ctx.shadowOffsetY = shadow * 0.22
  }
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.globalAlpha = alpha * 0.5
  ctx.strokeStyle = 'rgba(120,112,98,0.5)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

// Lower-third caption: Chinese line plus a small latin line, fading with `p`.
export function caption(ctx, W, H, zh, en, p, { y = null, size = 34, alpha = 1, color = INK.ink, rule2 = true } = {}) {
  const cy = y ?? H - 118
  const a = alpha * clamp01((p - 0.06) / 0.14) * clamp01((1 - p) / 0.1 + 0.02)
  if (a <= 0.01) return
  const grow = easeOut(clamp01(p / 0.35))
  text(ctx, zh, W / 2, cy, { size, font: FONTS.song, color, alpha: a, tracking: 4, shadow: 18, weight: '' })
  if (en) text(ctx, en, W / 2, cy + size * 0.95, { size: 15, font: FONTS.latin, color: INK.ink45, alpha: a * 0.9, tracking: 5 })
  if (rule2) {
    rule(ctx, W / 2 - 150 * grow, cy - size * 0.92, W / 2 + 150 * grow, cy - size * 0.92, {
      color: 'rgba(158,44,34,0.65)', width: 2, alpha: a * 0.85,
    })
  }
}

// Margin marks: running index of the reel, like a film leader.
export function indexTag(ctx, W, H, { index, total, alpha = 0.5 }) {
  text(ctx, `${String(index).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, 92, H - 74, {
    size: 15, font: FONTS.latin, color: INK.ink45, alpha, align: 'left', tracking: 3,
  })
}

export function cornerMarks(ctx, W, H, { alpha = 0.35, size = 26, inset = 60 } = {}) {
  const c = `rgba(60,54,44,${alpha})`
  ctx.save()
  ctx.strokeStyle = c
  ctx.lineWidth = 1
  const L = size
  const pts = [
    [inset, inset, 1, 1], [W - inset, inset, -1, 1],
    [inset, H - inset, 1, -1], [W - inset, H - inset, -1, -1],
  ]
  for (const [x, y, sx, sy] of pts) {
    ctx.beginPath()
    ctx.moveTo(x, y + sy * L)
    ctx.lineTo(x, y)
    ctx.lineTo(x + sx * L, y)
    ctx.stroke()
  }
  ctx.restore()
}

// A counting number, eased, with a unit and label. Used by the figures scene.
export function figure(ctx, x, y, { to, unit, label, p, size = 148, color = INK.ink, en = '' }) {
  const e = easeOut(clamp01(p))
  const value = Math.round(to * e)
  const cx = x
  text(ctx, String(value), cx, y, { size, font: FONTS.song, color, weight: '600', alpha: 0.96, tracking: -2 })
  const w = ctx.measureText(String(to)).width
  text(ctx, unit, cx + size * 0.72, y + size * 0.22, { size: size * 0.3, font: FONTS.kai, color: INK.zhu, alpha: 0.9 })
  rule(ctx, cx - size * 1.05, y + size * 0.66, cx + size * 1.05, y + size * 0.66, { color: 'rgba(120,112,98,0.5)', width: 1, alpha: 0.8 })
  text(ctx, label, cx, y + size * 0.92, { size: 32, font: FONTS.song, color: INK.ink70, tracking: 6 })
  if (en) text(ctx, en, cx, y + size * 1.28, { size: 14, font: FONTS.latin, color: INK.ink45, tracking: 4, alpha: 0.85 })
  void w
}

// Ink circle / arrow annotation drawn over a screenshot.
export function annotateCircle(ctx, x, y, r, p, { color = INK.zhu, width = 3, seed = 2 } = {}) {
  const t = clamp01(p)
  if (t <= 0) return
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  const start = -Math.PI * 0.55
  const span = Math.PI * 2 * t
  const steps = Math.max(3, Math.floor(48 * t))
  ctx.beginPath()
  for (let i = 0; i <= steps; i++) {
    const a = start + (span * i) / steps
    const rr = r * (1 + Math.sin(a * 3 + seed) * 0.045)
    const px = x + Math.cos(a) * rr
    const py = y + Math.sin(a) * rr * 0.82
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()
  ctx.restore()
}

export function arrow(ctx, x1, y1, x2, y2, p, { color = INK.zhu, width = 3 } = {}) {
  const t = easeOut(clamp01(p))
  const ex = lerp(x1, x2, t)
  const ey = lerp(y1, y2, t)
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(ex, ey)
  ctx.stroke()
  if (t > 0.85) {
    const a = Math.atan2(y2 - y1, x2 - x1)
    ctx.beginPath()
    ctx.moveTo(ex, ey)
    ctx.lineTo(ex - 18 * Math.cos(a - 0.4), ey - 18 * Math.sin(a - 0.4))
    ctx.moveTo(ex, ey)
    ctx.lineTo(ex - 18 * Math.cos(a + 0.4), ey - 18 * Math.sin(a + 0.4))
    ctx.stroke()
  }
  ctx.restore()
}

// Slow camerawork: returns a frame rect for cover-drawing inside a moving crop.
export function cam(p, { from = 1.0, to = 1.08, dx = 0, dy = 0, ease = easeOut } = {}) {
  const e = ease(clamp01(p))
  return { zoom: lerp(from, to, e), dx: dx * e, dy: dy * e }
}

// Ink specks scattered deterministically — keeps flat fills from looking digital.
export function specks(ctx, W, H, { count = 90, seed = 5, alpha = 0.05, size = 2.4 } = {}) {
  ctx.save()
  let s = seed * 7919
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
  ctx.fillStyle = `rgba(40,36,30,${alpha})`
  for (let i = 0; i < count; i++) {
    const x = rnd() * W
    const y = rnd() * H
    const r = rnd() * size + 0.4
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}
