// Asset manifest + asset loading helpers (textures, videos, text-to-canvas).
// All paths are relative to display-v2/public so the film uses the shipping artwork.
import { MEDIA, IMAGES, SIGHTS } from './paths.js'

const imageCache = new Map()

export { MEDIA, IMAGES, SIGHTS }

export function loadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src)
  const p = new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`image failed: ${src}`))
    img.src = src
  })
  imageCache.set(src, p)
  return p
}

export async function loadAll(sources) {
  const entries = await Promise.all(
    Object.entries(sources).map(async ([k, src]) => [k, await loadImage(src)]),
  )
  return Object.fromEntries(entries)
}

export function loadVideo(src) {
  return new Promise((resolve) => {
    const v = document.createElement('video')
    v.muted = true
    v.playsInline = true
    v.preload = 'auto'
    v.crossOrigin = 'anonymous'
    v.addEventListener('loadeddata', () => resolve(v), { once: true })
    v.addEventListener('error', () => resolve(null), { once: true })
    setTimeout(() => resolve(v.videoWidth ? v : null), 8000)
    v.src = src
    v.load()
  })
}

// Renders text into an offscreen canvas so the shader can use it as an ink mask.
export function textCanvas({
  text, font = '700 420px "Baoli SC", "STKaiti", Kai, serif',
  width = 1920, height = 1080, fill = '#fff', letterSpacing = 0, vertical = false,
  lineHeight = 1.06, align = 'center', baseline = 'middle',
}) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const ctx = c.getContext('2d')
  ctx.fillStyle = fill
  ctx.textAlign = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center'
  ctx.textBaseline = baseline
  ctx.font = font
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${letterSpacing}px`

  const chars = [...text]
  if (vertical || text.includes('\n')) {
    // Vertical layout: one column per line, characters stacked top to bottom.
    const lines = vertical ? [chars] : text.split('\n')
    const size = parseFloat(font.match(/(\d+)px/)?.[1] || '400')
    const step = size * lineHeight
    const cols = lines.length
    const totalW = cols * step
    const startX = align === 'left' ? step / 2 : align === 'right' ? width - totalW + step / 2 : (width - totalW) / 2 + step / 2
    const maxLen = Math.max(...lines.map((l) => (Array.isArray(l) ? l.length : [...l].length)))
    const startY = baseline === 'top' ? size : (height - maxLen * step) / 2 + size
    lines.forEach((line, ci) => {
      const cs = Array.isArray(line) ? line : [...line]
      cs.forEach((ch, i) => {
        ctx.fillText(ch, startX + ci * step, startY + i * step)
      })
    })
    return c
  }

  const paragraphs = text.split('\n')
  const size = parseFloat(font.match(/(\d+)px/)?.[1] || '400')
  const lh = size * lineHeight
  const totalH = lh * paragraphs.length
  const x = align === 'left' ? width * 0.5 : align === 'right' ? width - 40 : width / 2
  const y0 = (height - totalH) / 2 + lh / 2
  paragraphs.forEach((p, i) => ctx.fillText(p, x, y0 + i * lh))
  return c
}

// Deterministic paper-fibre noise, used as a full-page backdrop and grain source.
export function paperTexture({ width = 1024, height = 1024, seed = 7 } = {}) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(width, height)
  let s = seed >>> 0
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
  // coarse blotches
  const blobs = Array.from({ length: 220 }, () => ({
    x: rnd() * width, y: rnd() * height, r: 40 + rnd() * 320, a: 0.02 + rnd() * 0.05,
  }))
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      let v = 246 + (rnd() - 0.5) * 7
      for (const b of blobs) {
        const d = Math.hypot(x - b.x, y - b.y)
        if (d < b.r) v -= b.a * 90 * (1 - d / b.r)
      }
      img.data[i] = Math.min(255, Math.max(228, v))
      img.data[i + 1] = Math.min(255, Math.max(222, v - 3))
      img.data[i + 2] = Math.min(255, Math.max(210, v - 11))
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return c
}
