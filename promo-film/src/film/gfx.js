// Canvas2D drawing primitives: the film's typesetting and "art board" toolkit.
// Everything a scene draws lands on the art board; the GL pass then treats the
// whole board as ink-on-paper (see shaders.js).
import { loadImage, paperTexture, textCanvas } from './assets.js'

export const FONTS = {
  brush: '"Baoli SC", "STKaiti", Kai, "Kaiti SC", serif',
  kai: 'Kai, "STKaiti", "Kaiti SC", "Songti SC", serif',
  song: '"Songti SC", "STSong", "Noto Serif SC", serif',
  latin: '"Iowan Old Style", "Times New Roman", Georgia, serif',
  sans: '"PingFang SC", "Helvetica Neue", sans-serif',
}

export const lerp = (a, b, t) => a + (b - a) * t
export const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t)
export const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3)
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const seg = (p, a, b) => clamp01((p - a) / (b - a))

// page palette — mirrors display-v2 variables.css
export const INK = {
  paper: '#FCFAF4',
  paperDeep: '#F1EADC',
  ink: '#22201D',
  ink70: '#4A463F',
  ink45: '#7C756A',
  ink22: '#B3AC9F',
  zhu: '#9E2C22',
  gold: '#B8860B',
}

let paperCanvas = null
export function getPaper() {
  if (!paperCanvas) paperCanvas = paperTexture({ seed: 11 })
  return paperCanvas
}

export function makeBoard(W, H) {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  return c
}

export function paintPaper(ctx, W, H, { color = INK.paper, alpha = 1, vignette = 0 } = {}) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.fillRect(0, 0, W, H)
  const pat = ctx.createPattern(getPaper(), 'repeat')
  ctx.globalAlpha = alpha * 0.5
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = pat
  ctx.fillRect(0, 0, W, H)
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  if (vignette > 0) {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.22, W / 2, H / 2, Math.max(W, H) * 0.76)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(1, `rgba(74,62,44,${vignette})`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }
  ctx.restore()
}

// ---- image placement --------------------------------------------------------

export function drawCover(ctx, img, x, y, w, h, { zoom = 1, dx = 0, dy = 0, alpha = 1, blend = null, filter = null } = {}) {
  if (!img) return
  const iw = img.videoWidth || img.naturalWidth || img.width
  const ih = img.videoHeight || img.naturalHeight || img.height
  if (!iw || !ih) return
  const scale = Math.max(w / iw, h / ih) * zoom
  const dw = iw * scale
  const dh = ih * scale
  const px = x + (w - dw) / 2 + dx * w
  const py = y + (h - dh) / 2 + dy * h
  ctx.save()
  if (alpha < 1) ctx.globalAlpha = alpha
  if (blend) ctx.globalCompositeOperation = blend
  if (filter) ctx.filter = filter
  ctx.drawImage(img, px, py, dw, dh)
  ctx.restore()
}

export function drawContain(ctx, img, x, y, w, h, opts = {}) {
  if (!img) return
  const iw = img.videoWidth || img.naturalWidth || img.width
  const ih = img.videoHeight || img.naturalHeight || img.height
  const scale = Math.min(w / iw, h / ih) * (opts.zoom || 1)
  const dw = iw * scale
  const dh = ih * scale
  ctx.save()
  if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha
  if (opts.blend) ctx.globalCompositeOperation = opts.blend
  if (opts.filter) ctx.filter = opts.filter
  ctx.drawImage(img, x + (w - dw) / 2 + (opts.dx || 0), y + (h - dh) / 2 + (opts.dy || 0), dw, dh)
  ctx.restore()
}

// Soft paper edge: fades an image out into the sheet on the given sides.
export function feather(ctx, x, y, w, h, sides = 'lrtb', size = 90, color = INK.paper) {
  const dirs = {
    l: [x, y, x + size, y, 'x'],
    r: [x + w, y, x + w - size, y, 'x'],
    t: [x, y, x, y + size, 'y'],
    b: [x, y + h, x, y + h - size, 'y'],
  }
  for (const s of sides) {
    const [x0, y0, x1, y1] = dirs[s]
    const g = ctx.createLinearGradient(x0, y0, x1, y1)
    g.addColorStop(0, color)
    g.addColorStop(1, `${color}00`)
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = g
    if (s === 'l') ctx.fillRect(x, y, size, h)
    if (s === 'r') ctx.fillRect(x + w - size, y, size, h)
    if (s === 't') ctx.fillRect(x, y, w, size)
    if (s === 'b') ctx.fillRect(x, y + h - size, w, size)
    ctx.restore()
  }
}

// ---- type -------------------------------------------------------------------

export function text(ctx, str, x, y, {
  size = 42, font = FONTS.song, color = INK.ink, align = 'center', baseline = 'middle',
  weight = '', tracking = 0, alpha = 1, shadow = 0, shadowColor = 'rgba(34,32,29,0.28)',
} = {}) {
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.font = `${weight} ${size}px ${font}`.trim()
  ctx.textAlign = align === 'center' ? 'center' : align
  ctx.textBaseline = baseline
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${tracking}px`
  ctx.fillStyle = color
  if (shadow > 0) {
    ctx.shadowColor = shadowColor
    ctx.shadowBlur = shadow
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = size * 0.05
  }
  ctx.fillText(str, x, y)
  ctx.restore()
  ctx.letterSpacing = '0px'
}

// Vertical (traditional) typesetting, characters stacked top→bottom.
export function vtext(ctx, str, x, y, {
  size = 64, gap = 0.16, font = FONTS.song, color = INK.ink, weight = '',
  alpha = 1, from = 1, shadow = 0,
} = {}) {
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.font = `${weight} ${size}px ${font}`.trim()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  if (shadow > 0) { ctx.shadowColor = 'rgba(34,32,29,0.3)'; ctx.shadowBlur = shadow }
  const step = size * (1 + gap)
  const chars = [...str]
  chars.forEach((ch, i) => {
    const local = clamp01(from * chars.length - i)
    if (local <= 0) return
    ctx.save()
    ctx.globalAlpha *= local
    ctx.translate(0, (1 - local) * size * 0.18)
    ctx.fillText(ch, x, y + i * step)
    ctx.restore()
  })
  ctx.restore()
}

export function seal(ctx, x, y, size, chars = '山河', { rotate = 0, color = INK.zhu, alpha = 1 } = {}) {
  const cs = [...chars]
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  ctx.rotate(rotate)
  ctx.strokeStyle = color
  ctx.lineWidth = Math.max(2, size * 0.055)
  ctx.strokeRect(-size / 2, -size / 2, size, size)
  ctx.lineWidth = size * 0.03
  ctx.strokeRect(-size / 2 + size * 0.075, -size / 2 + size * 0.075, size * 0.85, size * 0.85)
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // 1–2 characters stack in one column; 3–4 sit in two columns read right-to-left.
  if (cs.length <= 2) {
    const fs = size * (cs.length === 1 ? 0.62 : 0.38)
    ctx.font = `${fs}px ${FONTS.song}`
    cs.forEach((ch, i) => {
      const cy = cs.length === 1 ? 0 : (i === 0 ? -1 : 1) * size * 0.2
      ctx.fillText(ch, 0, cy)
    })
  } else {
    const fs = size * 0.36
    ctx.font = `${fs}px ${FONTS.song}`
    cs.forEach((ch, i) => {
      const col = Math.floor(i / 2)
      const row = i % 2
      ctx.fillText(ch, (col === 0 ? 1 : -1) * size * 0.2, (row === 0 ? -1 : 1) * size * 0.2)
    })
  }
  ctx.restore()
}

export function rule(ctx, x1, y1, x2, y2, { color = INK.ink22, width = 1, alpha = 1, grow = 1 } = {}) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(lerp(x1, x2, grow), lerp(y1, y2, grow))
  ctx.stroke()
  ctx.restore()
}

// ---- ink-wash marks ---------------------------------------------------------

export function wash(ctx, x, y, r, { color = '34,32,29', alpha = 0.16, squash = 1, irregular = 0.35, seed = 1 } = {}) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(1, squash)
  const blobs = 7
  for (let i = 0; i < blobs; i++) {
    const a = (i / blobs) * Math.PI * 2 + seed
    const rr = r * (0.45 + ((Math.sin(seed * 3.1 + i * 2.7) + 1) / 2) * irregular)
    const ox = Math.cos(a) * r * 0.34 * ((Math.sin(seed + i) + 1) / 2)
    const oy = Math.sin(a) * r * 0.22 * ((Math.cos(seed * 1.7 + i) + 1) / 2)
    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, rr)
    g.addColorStop(0, `rgba(${color},${alpha})`)
    g.addColorStop(0.55, `rgba(${color},${alpha * 0.55})`)
    g.addColorStop(1, `rgba(${color},0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(ox, oy, rr, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

// A dry-brush stroke, used for underlines and separators.
export function stroke(ctx, x1, y1, x2, y2, { color = INK.ink, width = 6, alpha = 0.7, taper = 0.35, seed = 3 } = {}) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  const steps = 48
  for (let i = 0; i < steps; i++) {
    const t0 = i / steps
    const t1 = (i + 1) / steps
    const w = width * (1 - Math.abs(t0 - 0.5) * 2 * 0.55) * (1 + Math.sin(seed + i * 0.7) * 0.08)
    ctx.lineWidth = taper > 0 ? Math.max(0.4, w * (1 - t0 * taper)) : w
    ctx.beginPath()
    ctx.moveTo(lerp(x1, x2, t0), lerp(y1, y2, t0) + Math.sin(seed + i * 0.35) * width * 0.35)
    ctx.lineTo(lerp(x1, x2, t1), lerp(y1, y2, t1) + Math.sin(seed + (i + 1) * 0.35) * width * 0.35)
    ctx.stroke()
  }
  ctx.restore()
}

// Ink-brush border used when a real screenshot is shown inside the film.
export function screenshotFrame(ctx, img, x, y, w, h, { p = 1, zoom = 1, dx = 0, dy = 0, label = '' } = {}) {
  ctx.save()
  ctx.shadowColor = 'rgba(30,28,24,0.22)'
  ctx.shadowBlur = 60
  ctx.shadowOffsetY = 18
  ctx.fillStyle = INK.paper
  ctx.beginPath()
  ctx.roundRect(x - 10, y - 10, w + 20, h + 20, 6)
  ctx.fill()
  ctx.restore()
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const scale = Math.max(w / iw, h / ih) * zoom
  ctx.drawImage(img, x + (w - iw * scale) / 2 + dx, y + (h - ih * scale) / 2 + dy, iw * scale, ih * scale)
  ctx.restore()
  ctx.save()
  ctx.strokeStyle = 'rgba(60,54,44,0.35)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x - 10, y - 10, w + 20, h + 20, 6)
  ctx.stroke()
  ctx.restore()
  if (label) {
    text(ctx, label, x + w / 2, y + h + 42, { size: 20, font: FONTS.latin, color: INK.ink45, tracking: 3 })
  }
  void p
}

// Torn-paper reveal for screenshots and panels: 'l' | 'r' | 't' | 'b' | 'radial'.
// Clips the current path so the caller's drawImage only lands inside the reveal.
export function wipe(ctx, x, y, w, h, p, { dir = 'l', noise = 24 } = {}) {
  const t = clamp01(p)
  ctx.beginPath()
  if (t <= 0) {
    ctx.rect(x, y, 0, 0)
    ctx.clip()
    return
  }
  if (dir === 'radial') {
    ctx.rect(x, y, w, h)
    ctx.clip()
    const cx = x + w / 2
    const cy = y + h / 2
    const r = Math.hypot(w, h) * 0.6 * t
    const g = ctx.createRadialGradient(cx, cy, r * 0.72, cx, cy, r)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    const saved = ctx.globalCompositeOperation
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = g
    ctx.fillRect(x, y, w, h)
    ctx.globalCompositeOperation = saved
    return
  }
  const vertical = dir === 't' || dir === 'b'
  const steps = vertical ? 46 : 34
  // The revealed region is bounded by the fixed side the wipe starts from and a
  // ragged moving edge: 'l' reveals [x, edge], 'r' reveals [edge, x+w], etc.
  if (vertical) {
    const edge = dir === 't' ? y + h * t : y + h * (1 - t)
    const anchor = dir === 't' ? y : y + h
    ctx.moveTo(x, anchor)
    for (let i = 0; i <= steps; i++) {
      const xx = x + (w * i) / steps
      const n = (Math.sin(i * 1.9) * noise + Math.sin(i * 0.61) * noise * 0.5) * Math.sin((i / steps) * Math.PI)
      ctx.lineTo(xx, edge + (dir === 't' ? n * 0.5 : -n * 0.5))
    }
    ctx.lineTo(x + w, anchor)
  } else {
    const edge = dir === 'l' ? x + w * t : x + w * (1 - t)
    const anchor = dir === 'l' ? x : x + w
    ctx.moveTo(anchor, y)
    for (let i = 0; i <= steps; i++) {
      const yy = y + (h * i) / steps
      const n = (Math.sin(i * 1.7) * noise + Math.sin(i * 0.53) * noise * 0.6) * Math.sin((i / steps) * Math.PI)
      ctx.lineTo(edge + (dir === 'l' ? n : -n), yy)
    }
    ctx.lineTo(anchor, y + h)
  }
  ctx.closePath()
  ctx.clip()
}

export async function loadSceneAssets(sources) {
  const out = {}
  for (const [k, src] of Object.entries(sources)) {
    try {
      out[k] = await loadImage(src)
    } catch {
      out[k] = null
    }
  }
  return out
}

export { textCanvas }
