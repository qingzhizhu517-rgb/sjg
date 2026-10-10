// Act II & III — the platform: real screenshots inside the ink world, the
// convergence of the nine cities, the figures, and the sign-off.
import {
  INK, FONTS, text, vtext, seal, rule, stroke, wash, clamp01, easeOut, easeInOut, seg, lerp,
  verse, panel, caption, indexTag, cornerMarks, cam, specks, annotateCircle, arrow, figure,
} from '../film/kit.js'
import { drawCover, drawContain, wipe } from '../film/gfx.js'
import { CITIES, STATS } from '../data.js'
import { W, H, scrim } from './act1.js'

// Captured screenshots are folded into the same asset bag as the artwork, under
// `shot:<name>`, so scenes read them from ctx.assets like any other picture.
export const SHOT_NAMES = [
  'home', 'poems', 'poem-detail', 'poets', 'poet-graph', 'poet-detail', 'timeline',
  'culture', 'crafts', 'festivals', 'learn', 'compose', 'spot', 'region', 'city',
  'datav', 'admin-review',
]

// Loads a captured PNG by logical name; returns null when the capture is missing
// so every page scene degrades to typography instead of throwing.
function shot(ctx, name) {
  return ctx.assets[`shot:${name}`] || null
}

// Captured screenshots are not part of the artwork manifest, so they are loaded
// separately and merged into ctx.assets before the first frame.
export async function loadShots(base) {
  const out = {}
  for (const name of SHOT_NAMES) {
    const url = `${base}/promo-film/.build/capture/${name}.png`
    try {
      out[`shot:${name}`] = await new Promise((res, rej) => {
        const im = new Image()
        im.onload = () => res(im)
        im.onerror = () => rej(new Error('missing'))
        im.src = url
      })
    } catch {
      out[`shot:${name}`] = null
    }
  }
  return out
}

// A screenshot presented as a page of the album.
//
// `focus` is a rectangle in screenshot pixels (captures are 1920×1080). The panel
// takes the focus region's own aspect ratio and is fitted inside `box`, so the
// image is never cropped a second time. The slow push-in zooms around the focus
// centre. Returns `map(px, py)` which converts screenshot pixels to frame
// pixels with the exact same transform — annotations use it, so they land on
// the real UI element at every frame.
function pagePanel(ctx, img, box, { focus, zoom = 1, reveal = 1, alpha = 1, shadow = 70, filter = null, tone = 0 } = {}) {
  const f = focus || { x: 0, y: 0, w: 1920, h: 1080 }
  const aspect = f.w / f.h
  let w = box.w
  let h = w / aspect
  if (h > box.h) { h = box.h; w = h * aspect }
  const x = box.x + (box.w - w) / 2
  const y = box.y + (box.h - h) / 2

  const cw = f.w / zoom
  const ch = f.h / zoom
  const cx = f.x + (f.w - cw) / 2
  const cy = f.y + (f.h - ch) / 2
  const scale = w / cw
  const map = (px, py) => [x + (px - cx) * scale, y + (py - cy) * scale]
  const panel = { x, y, w, h, scale, map }
  if (!img || reveal <= 0) return panel

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.save()
  ctx.shadowColor = 'rgba(26,24,20,0.22)'
  ctx.shadowBlur = shadow
  ctx.shadowOffsetY = shadow * 0.22
  ctx.fillStyle = INK.paper
  ctx.beginPath()
  ctx.roundRect(x - 12, y - 12, w + 24, h + 24, 4)
  ctx.fill()
  ctx.restore()

  ctx.save()
  if (reveal < 1) wipe(ctx, x, y, w, h, easeOut(reveal), { dir: 'l', noise: 18 })
  else { ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip() }
  ctx.imageSmoothingQuality = 'high'
  if (filter) ctx.filter = filter
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h)
  if (filter) ctx.filter = 'none'
  if (tone > 0) {
    // 罩一层纸色：把深色界面（数据大屏）拉回纸本调性，而不是整块黑板嵌在画里
    ctx.fillStyle = `rgba(252,250,244,${tone})`
    ctx.fillRect(x, y, w, h)
  }
  ctx.restore()

  ctx.strokeStyle = 'rgba(60,54,44,0.38)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.roundRect(x - 12, y - 12, w + 24, h + 24, 4)
  ctx.stroke()
  ctx.restore()
  return panel
}

// A vermilion frame around a real UI element, drawn on progressively.
// It used to be a point-walk with a per-segment sine wobble (`sin(i*0.37)*1.4`) —
// each edge restarted its own phase, so the four sides never matched up and the
// corners came out as polylines. At 1080p that reads as a wobbly, distorted outline,
// especially on long thin boxes. Now it is an exact rounded rect whose stroke is
// revealed with a dash length, so the line stays true from start to finish.
function markUI(ctx, panel, a, p) {
  const t = clamp01(p)
  if (t <= 0) return
  const [x0, y0] = panel.map(a.x, a.y)
  const [x1, y1] = panel.map(a.x + a.w, a.y + a.h)
  const pad = 9
  const L = x0 - pad
  const T = y0 - pad
  const R = x1 + pad
  const B = y1 + pad
  const w = R - L
  const h = B - T
  const r = Math.min(10, w / 6, h / 6)
  const per = 2 * (w + h) - 8 * r + 2 * Math.PI * r

  ctx.save()
  ctx.strokeStyle = INK.zhu
  ctx.lineWidth = 2.6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.globalAlpha = 0.9
  ctx.beginPath()
  ctx.roundRect(L, T, w, h, r)
  ctx.setLineDash([easeOut(t) * per, per])
  ctx.stroke()
  ctx.restore()

  if (!a.label) return
  const la = easeOut(clamp01((t - 0.55) / 0.45))
  if (la <= 0) return
  const side = a.side || 'top'
  const size = 24
  ctx.save()
  ctx.font = `${size}px ${FONTS.kai}`
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '2px'
  const tw = ctx.measureText(a.label).width
  ctx.restore()
  let lx
  let ly
  if (side === 'top') { lx = (L + R) / 2; ly = T - 30 }
  else if (side === 'bottom') { lx = (L + R) / 2; ly = B + 30 }
  else if (side === 'left') { lx = L - 24 - tw / 2; ly = (T + B) / 2 }
  else { lx = R + 24 + tw / 2; ly = (T + B) / 2 }
  // a paper chip behind the label keeps it legible over busy UI
  ctx.save()
  ctx.globalAlpha = la * 0.94
  ctx.fillStyle = INK.paper
  ctx.strokeStyle = 'rgba(158,44,34,0.55)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(lx - tw / 2 - 14, ly - 20, tw + 28, 40, 3)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
  text(ctx, a.label, lx, ly + 1, { size, font: FONTS.kai, color: INK.zhu, alpha: la, tracking: 2 })
}

// Focus regions and annotation boxes, measured on the 1920×1080 captures.
export const PAGES = {
  poems: {
    focus: { x: 300, y: 160, w: 1320, h: 790 },
    marks: [
      { x: 361, y: 435, w: 986, h: 45, label: '按字句 · 按城市检索', side: 'top', at: 0.30 },
      { x: 337, y: 570, w: 298, h: 364, label: '九曲黄河万里沙', side: 'top', at: 0.52 },
    ],
  },
  graph: {
    // 特写：只取图谱的核心两块关系网，比重看全页更放大、也更像「在看细节」
    focus: { x: 450, y: 250, w: 1000, h: 620 },
    marks: [
      { x: 560, y: 375, w: 330, h: 345, label: '宋 · 古文与豪放', side: 'left', at: 0.30 },
      { x: 1115, y: 410, w: 290, h: 325, label: '明 · 后七子唱和', side: 'top', at: 0.52 },
    ],
  },
  timeline: {
    focus: { x: 300, y: 160, w: 1320, h: 690 },
    marks: [
      { x: 905, y: 468, w: 68, h: 80, label: '点选朝代', side: 'top', at: 0.30 },
      { x: 585, y: 600, w: 130, h: 92, label: '一舟巡游九朝', side: 'bottom', at: 0.52 },
    ],
  },
  culture: {
    // 特写：只取「五脉文华」三张卡片那一行，让三块并列的信息看得更清
    focus: { x: 300, y: 330, w: 1320, h: 430 },
    marks: [
      { x: 336, y: 382, w: 237, h: 334, label: '民俗节庆 14', side: 'bottom', at: 0.28 },
      { x: 842, y: 382, w: 236, h: 334, label: '非遗工艺 18', side: 'bottom', at: 0.44 },
      { x: 1347, y: 382, w: 237, h: 334, label: '饮食戏曲 15', side: 'bottom', at: 0.60 },
    ],
  },
  datav: {
    focus: { x: 0, y: 0, w: 1920, h: 1080 },
    marks: [
      { x: 18, y: 108, w: 340, h: 250, label: '九城景观分布', side: 'bottom', at: 0.30 },
      { x: 1563, y: 108, w: 340, h: 245, label: '已发布内容总览', side: 'bottom', at: 0.50 },
    ],
  },
  detail: { focus: { x: 346, y: 150, w: 1230, h: 800 } },
  learn: {
    focus: { x: 390, y: 160, w: 1140, h: 740 },
    marks: [
      { x: 420, y: 405, w: 950, h: 132, label: '读证据 → 作比较 → 写思考', side: 'top', at: 0.32 },
      { x: 457, y: 640, w: 1006, h: 55, label: '凭分享 ID 打开任务', side: 'bottom', at: 0.52 },
    ],
  },
}

// ---------------------------------------------------------------------------
// peak — 「会当凌绝顶，一览众山小」
// ---------------------------------------------------------------------------
export const peak = {
  id: 'peak',
  draw(ctx, p) {
    ctx.paintPaper({ vignette: 0.05 })
    const a = ctx.assets
    if (a.taishan) {
      drawCover(ctx, a.taishan, 0, 0, W, H, {
        zoom: lerp(1.04, 1.20, easeInOut(p)), dy: lerp(0.02, -0.03, p),
        filter: 'saturate(0.86) contrast(1.06)',
      })
    }
    // 两行诗并排在左侧。原来第二行落在 x=0.62，正好压在最密的山体上——
    // 朱红字压在深色岩石上完全读不出来。右侧整幅留给山景。
    scrim(ctx, { from: 'l', size: 0.46, strength: 0.80 })
    scrim(ctx, { from: 'b', size: 0.5, strength: 0.44 })
    const r1 = easeOut(seg(p, 0.08, 0.42))
    const r2 = easeOut(seg(p, 0.36, 0.68))
    verse(ctx, '会当凌绝顶', W * 0.17, H * 0.16, {
      size: 84, gap: 0.12, colGap: 1.4, font: FONTS.brush, color: INK.ink, reveal: r1, shadow: 26,
    })
    verse(ctx, '一览众山小', W * 0.275, H * 0.16, {
      size: 84, gap: 0.12, colGap: 1.4, font: FONTS.brush, color: INK.zhu, reveal: r2, shadow: 26,
    })
    const at = easeOut(seg(p, 0.55, 0.85))
    if (at > 0) {
      text(ctx, '杜甫《望岳》· 唐', W * 0.5, H * 0.80, { size: 28, font: FONTS.kai, color: INK.ink, alpha: at * 0.92, tracking: 6, shadow: 18 })
      text(ctx, '泰山 · 泰安', W * 0.5, H * 0.80 + 42, { size: 15, font: FONTS.latin, color: INK.ink45, alpha: at * 0.85, tracking: 5 })
    }
    const note = easeOut(seg(p, 0.72, 1))
    if (note > 0) {
      text(ctx, '古人站在河边，写下的从来不只是风景。', W * 0.5, H * 0.90, {
        size: 30, font: FONTS.song, color: INK.ink70, alpha: note, tracking: 4, shadow: 14,
      })
    }
    specks(ctx, W, H, { count: 70, seed: 21, alpha: 0.05 })
    cornerMarks(ctx, W, H, { alpha: 0.22 })
  },
  gl: {
    base: (ctx, p) => ({
      flow: 0.42 * (1 - seg(p, 0.88, 1)), riverY: 0.86, riverW: 0.1, riverTilt: -0.06,
      warp: 0.0032, ink: 0.16, wet: 0.17, grain: 0.5, vignette: 0.66, lift: 0.03,
      bloomAt: [0.3, 0.3], bloomR: 0.3, bloomAmt: 0.32 * (1 - seg(p, 0.5, 1)), bloomDark: 0,
      shake: 0.5, abr: 0.5,
    }),
  },
}

// ---------------------------------------------------------------------------
// generic product page scene — a real screenshot, its title, and ink marks on
// the actual UI elements
// ---------------------------------------------------------------------------
const PAGE_BOX = { x: W * 0.215, y: H * 0.115, w: W * 0.75, h: H * 0.70 }

function pageScene({ id, shotName, page, title, sub, note, box = PAGE_BOX, tone = 0, filter = null }) {
  return {
    id,
    draw(ctx, p) {
      ctx.paintPaper({ vignette: 0.12 })
      const img = shot(ctx, shotName)
      const panel = pagePanel(ctx, img, box, {
        focus: page.focus, zoom: lerp(1.0, 1.025, easeInOut(p)), reveal: clamp01(p / 0.2),
        tone, filter,
      })

      const tp = easeOut(seg(p, 0.12, 0.45))
      if (tp > 0) {
        const sp = easeOut(seg(p, 0.26, 0.6))
        // title column: vertical headline, vertical subtitle beside it
        vtext(ctx, title, W * 0.085, H * 0.19, {
          size: 64, gap: 0.12, font: FONTS.brush, color: INK.ink, alpha: tp, from: tp, shadow: 20,
        })
        vtext(ctx, sub, W * 0.145, H * 0.19 + 6, {
          size: 26, gap: 0.22, font: FONTS.kai, color: INK.ink70, alpha: sp, from: sp,
        })
        seal(ctx, W * 0.085, H * 0.19 + title.length * 72 + 40, 42, title.slice(0, 1), { alpha: sp * 0.9 })
      }

      for (const m of page.marks || []) markUI(ctx, panel, m, seg(p, m.at, m.at + 0.24))

      const na = easeOut(seg(p, 0.6, 0.9))
      if (note && na > 0) {
        text(ctx, note, panel.x + panel.w / 2, panel.y + panel.h + 46, {
          size: 24, font: FONTS.song, color: INK.ink70, alpha: na, tracking: 5,
        })
      }
    },
    gl: {
      base: (g, p) => ({
        flow: 0, warp: 0.0012, ink: 0.06, wet: 0.08, grain: 0.42, vignette: 0.5, lift: 0.02, shake: 0.35,
        bloomAt: [0.1, 0.4], bloomR: 0.18, bloomAmt: 0.16 * (1 - seg(p, 0.3, 0.8)), bloomDark: 0, abr: 0,
      }),
    },
  }
}

export const uiPoems = pageScene({
  id: 'ui-poems', shotName: 'poems', page: PAGES.poems,
  title: '诗词检索', sub: '以字句为线索', note: '两百余首诗，可按句、按城检索',
})

export const uiPoet = pageScene({
  id: 'ui-poet', shotName: 'poet-graph', page: PAGES.graph,
  title: '诗人图谱', sub: '谁与谁同游', note: '35 组诗人关系，按朝代着色',
})

export const uiTimeline = pageScene({
  id: 'ui-timeline', shotName: 'timeline', page: PAGES.timeline,
  title: '文脉长河', sub: '两千年一卷', note: '先秦至清，九个朝代一线铺开',
})

export const uiCulture = pageScene({
  id: 'ui-culture', shotName: 'culture', page: PAGES.culture,
  title: '齐鲁文化', sub: '岁时百工烟火', note: '五脉文华，按九城归档',
})

export const uiDatav = pageScene({
  id: 'ui-datav', shotName: 'datav', page: PAGES.datav,
  title: '数据大屏', sub: '一河九城一屏', note: '同一份数据，另一种看法',
  // 大屏是全片唯一的深色界面：降对比 + 罩纸色，让它落进纸本调性里，而不是一块黑板
  tone: 0.17, filter: 'saturate(0.72) contrast(0.90) brightness(1.06)',
})

// ---------------------------------------------------------------------------
// gather — the nine cities are drawn back to one river
// ---------------------------------------------------------------------------
const CITY_IMG = ['sightHeze', 'sightJining', 'sightTaian', 'sightLiaocheng', 'sightJinan', 'sightDezhou', 'sightZibo', 'sightBinzhou', 'sightDongying']

function albumLeaf(ctx, img, cx, cy, w, h, { rot = 0, alpha = 1 } = {}) {
  if (!img) return
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(cx, cy)
  ctx.rotate(rot)
  ctx.shadowColor = 'rgba(26,24,20,0.2)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 6
  ctx.fillStyle = INK.paper
  ctx.fillRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16)
  ctx.shadowColor = 'transparent'
  ctx.beginPath()
  ctx.rect(-w / 2, -h / 2, w, h)
  ctx.clip()
  // 九张同源（display-v2 九城胜迹），不必再压掉各图之间的色差，只轻微降饱和融入纸本
  ctx.filter = 'saturate(0.82) contrast(1.02)'
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const s = Math.max(w / iw, h / ih)
  ctx.drawImage(img, -iw * s / 2, -ih * s / 2, iw * s, ih * s)
  ctx.restore()
}

export const gather = {
  id: 'gather',
  draw(ctx, p) {
    ctx.paintPaper({ vignette: 0.1 })
    const a = ctx.assets
    const band = easeOut(seg(p, 0.05, 0.5))
    if (band > 0) {
      const g = ctx.createLinearGradient(0, H * 0.47 - 130, 0, H * 0.47 + 130)
      g.addColorStop(0, 'rgba(184,134,11,0)')
      g.addColorStop(0.5, `rgba(184,134,11,${0.12 * band})`)
      g.addColorStop(1, 'rgba(184,134,11,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, H * 0.47 - 130, W, 260)
    }
    const leafW = 190
    const leafH = 130
    const gap = 18
    const total = CITIES.length * leafW + (CITIES.length - 1) * gap
    const x0 = (W - total) / 2 + leafW / 2
    CITIES.forEach((c, i) => {
      // every leaf has settled by p = 0.72
      const delay = 0.06 + i * 0.045
      const t = easeOut(seg(p, delay, delay + 0.3))
      if (t <= 0) return
      const tx = x0 + i * (leafW + gap)
      const ty = H * 0.47 + (i % 2 ? 14 : -14)
      const sx = W * (i % 2 ? 1.15 : -0.15)
      const sy = H * (i % 2 ? 1.2 : -0.2)
      albumLeaf(ctx, a[CITY_IMG[i]], lerp(sx, tx, t), lerp(sy, ty, t), leafW, leafH, {
        rot: lerp(i % 2 ? 0.35 : -0.35, i % 2 ? 0.015 : -0.015, t), alpha: easeOut(seg(p, delay, delay + 0.12)),
      })
      const la = easeOut(seg(p, delay + 0.26, delay + 0.4))
      if (la > 0) text(ctx, c.name, tx, ty + leafH / 2 + 36, { size: 24, font: FONTS.song, color: INK.ink70, alpha: la, tracking: 5 })
    })
    const tp = easeOut(seg(p, 0.55, 0.85))
    if (tp > 0) {
      text(ctx, '九城，回到同一条河边', W * 0.5, H * 0.77, { size: 46, font: FONTS.song, color: INK.ink, alpha: tp, tracking: 12, shadow: 18 })
      text(ctx, 'ONE RIVER · NINE CITIES · ONE PLATFORM', W * 0.5, H * 0.77 + 48, { size: 14, font: FONTS.latin, color: INK.ink45, alpha: tp * 0.9, tracking: 6 })
    }
    const sp = easeOut(seg(p, 0.7, 0.95))
    if (sp > 0) seal(ctx, W * 0.5, H * 0.21, lerp(40, 92, sp), '文脉', { alpha: sp * 0.9, rotate: lerp(-0.1, 0, sp) })
    cornerMarks(ctx, W, H, { alpha: 0.2 })
  },
  gl: {
    base: (ctx, p) => ({
      flow: 0.55 * (1 - seg(p, 0.8, 1)), riverY: 0.47, riverW: 0.12, riverTilt: 0.0,
      warp: 0.0026, ink: 0.12, wet: 0.12, grain: 0.48, vignette: 0.6, lift: 0.03, shake: 0.5,
      bloomAt: [0.5, 0.47], bloomR: 0.26, bloomAmt: 0.24 * (1 - seg(p, 0.45, 0.9)), bloomDark: 0,
    }),
  },
}

// ---------------------------------------------------------------------------
// numbers — the collection, counted
// ---------------------------------------------------------------------------
export const numbers = {
  id: 'numbers',
  draw(ctx, p) {
    ctx.paintPaper({ vignette: 0.12 })
    const a = ctx.assets
    if (a.inkwashMap) {
      drawContain(ctx, a.inkwashMap, -100, -160, W + 200, H + 320, {
        alpha: 0.13 * easeOut(seg(p, 0.05, 0.5)), filter: 'grayscale(0.6) contrast(1.1)',
      })
    }
    const tp = easeOut(seg(p, 0.04, 0.35))
    if (tp > 0) {
      text(ctx, '山河成册', W * 0.5, H * 0.17, { size: 56, font: FONTS.brush, color: INK.ink, alpha: tp, tracking: 16, shadow: 24 })
      text(ctx, 'THE COLLECTION, COUNTED', W * 0.5, H * 0.17 + 52, { size: 14, font: FONTS.latin, color: INK.ink45, alpha: tp * 0.9, tracking: 6 })
    }
    rule(ctx, W * 0.2, H * 0.30, W * 0.8, H * 0.30, { color: 'rgba(120,112,98,0.42)', width: 1, alpha: easeOut(seg(p, 0.1, 0.5)) })

    STATS.forEach((s, i) => {
      const t = seg(p, 0.16 + i * 0.09, 0.66 + i * 0.07)
      if (t <= 0) return
      const x = W * (0.185 + i * 0.21)
      figure(ctx, x, H * 0.52, { to: s.value, unit: s.unit, label: s.label, en: s.en, p: t, size: 132 })
    })

    const fp = easeOut(seg(p, 0.7, 1))
    if (fp > 0) {
      rule(ctx, W * 0.3 - 220 * fp, H * 0.80, W * 0.3 + 220 * fp, H * 0.80, { color: 'rgba(158,44,34,0.5)', width: 2 })
      text(ctx, '每一条都经人工审核后发布', W * 0.5, H * 0.80 + 48, { size: 30, font: FONTS.song, color: INK.ink70, alpha: fp, tracking: 8 })
    }
    specks(ctx, W, H, { count: 50, seed: 33, alpha: 0.045 })
    cornerMarks(ctx, W, H, { alpha: 0.2 })
    void wash
  },
  gl: {
    base: (ctx, p) => ({
      flow: 0.34, riverY: 0.88, riverW: 0.09, riverTilt: 0.0,
      warp: 0.0028, ink: 0.13, wet: 0.14, grain: 0.5, vignette: 0.6, lift: 0.03, shake: 0.45,
      bloomAt: [0.5, 0.5], bloomR: 0.24, bloomAmt: 0.2 * (1 - seg(p, 0.35, 0.8)), bloomDark: 0,
    }),
  },
}

// ---------------------------------------------------------------------------
// source — 「每一条内容，都经审核、可追溯」
// ---------------------------------------------------------------------------
export const uiSource = {
  id: 'ui-source',
  draw(ctx, p) {
    ctx.paintPaper({ vignette: 0.1 })
    const img = shot(ctx, 'poem-detail') || shot(ctx, 'poems')
    pagePanel(ctx, img, { x: W * 0.42, y: H * 0.12, w: W * 0.53, h: H * 0.74 }, {
      focus: PAGES.detail.focus, zoom: lerp(1.0, 1.05, easeInOut(p)), reveal: clamp01(p / 0.2),
    })
    const tp = easeOut(seg(p, 0.1, 0.42))
    if (tp > 0) {
      text(ctx, '溯源', W * 0.21, H * 0.27, { size: 88, font: FONTS.brush, color: INK.ink, alpha: tp, tracking: 18, shadow: 20 })
      const sp = easeOut(seg(p, 0.24, 0.56))
      text(ctx, '每一条内容，都经审核、可追溯。', W * 0.21, H * 0.27 + 96, { size: 26, font: FONTS.song, color: INK.ink70, alpha: sp, tracking: 4 })
    }
    // what the platform actually binds to a poem — no invented bibliography
    const chips = ['原文 · 杜甫《望岳》', '关联胜迹 · 泰山 · 泰安', '审核状态 · 已发布']
    chips.forEach((c, i) => {
      const t = easeOut(seg(p, 0.38 + i * 0.1, 0.58 + i * 0.1))
      if (t <= 0) return
      const cw = 440
      const x = W * 0.21 - cw / 2 + (1 - t) * -60
      const y = H * 0.50 + i * 92
      panel(ctx, x, y, cw, 64, { alpha: t * 0.94, shadow: 18, seed: i + 2 })
      seal(ctx, x + 40, y + 32, 34, '源', { alpha: t * 0.95 })
      text(ctx, c, x + 76, y + 33, { size: 23, font: FONTS.kai, color: INK.ink, alpha: t * 0.95, align: 'left', tracking: 3 })
    })
    cornerMarks(ctx, W, H, { alpha: 0.2 })
  },
  gl: {
    base: (ctx, p) => ({
      flow: 0, warp: 0.0012, ink: 0.06, wet: 0.08, grain: 0.42, vignette: 0.5, lift: 0.02, shake: 0.35,
      bloomAt: [0.2, 0.45], bloomR: 0.18, bloomAmt: 0.16 * (1 - seg(p, 0.3, 0.8)), bloomDark: 0,
    }),
  },
}

// ---------------------------------------------------------------------------
// ai — AI 小文 answers with the platform evidence attached
// ---------------------------------------------------------------------------
export const uiAi = {
  id: 'ui-ai',
  draw(ctx, p) {
    ctx.paintPaper({ vignette: 0.1 })
    const a = ctx.assets
    if (a.riverLandscape) {
      drawCover(ctx, a.riverLandscape, 0, 0, W, H, {
        zoom: lerp(1.05, 1.1, p), dx: 0.08, alpha: 0.38, filter: 'saturate(0.5) brightness(1.08)',
      })
      scrim(ctx, { from: 'l', size: 0.62, strength: 0.96 })
    }

    const px = W * 0.09
    const pw = W * 0.44
    const bubbles = [
      { me: true, lines: ['「会当凌绝顶」是谁写的？'], at: 0.12 },
      { me: false, lines: ['出自杜甫《望岳》，写他远望泰山。', '首句：岱宗夫如何？齐鲁青未了。'], at: 0.28 },
      { me: false, src: true, lines: ['依据 · 平台诗词库 · 杜甫《望岳》· 泰山'], at: 0.46 },
    ]
    const heights = bubbles.map((b) => 28 + b.lines.length * 38)
    const ph = 96 + heights.reduce((s, h) => s + h + 20, 0) + 54
    const py = (H - ph) / 2
    const rp = easeOut(seg(p, 0.02, 0.24))
    if (rp > 0) {
      ctx.save()
      ctx.globalAlpha = rp
      panel(ctx, px, py, pw, ph, { alpha: 0.97, shadow: 70 })
      ctx.restore()
      seal(ctx, px + 46, py + 40, 34, '文', { alpha: rp })
      text(ctx, 'AI 小文', px + 80, py + 41, { size: 26, font: FONTS.song, color: INK.ink, align: 'left', alpha: rp, tracking: 4 })
      rule(ctx, px + 24, py + 76, px + pw - 24, py + 76, { color: 'rgba(120,112,98,0.4)', width: 1, alpha: rp })
      let by = py + 98
      bubbles.forEach((b, i) => {
        const bh = heights[i]
        const t = easeOut(seg(p, b.at, b.at + 0.16))
        if (t > 0) {
          ctx.save()
          ctx.font = `22px ${FONTS.song}`
          const bw = Math.min(pw - 60, Math.max(...b.lines.map((l) => ctx.measureText(l).width)) + 48)
          ctx.restore()
          const bx = b.me ? px + pw - 30 - bw : px + 30
          ctx.save()
          ctx.globalAlpha = t
          ctx.translate(0, (1 - t) * 12)
          ctx.fillStyle = b.me ? 'rgba(158,44,34,0.09)' : b.src ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.85)'
          ctx.strokeStyle = b.src ? 'rgba(158,44,34,0.55)' : 'rgba(120,112,98,0.32)'
          ctx.lineWidth = b.src ? 1.5 : 1
          ctx.beginPath()
          ctx.roundRect(bx, by, bw, bh, 8)
          ctx.fill()
          ctx.stroke()
          b.lines.forEach((ln, li) => {
            text(ctx, ln, bx + 24, by + 33 + li * 38, {
              size: b.src ? 21 : 22, font: b.src ? FONTS.kai : FONTS.song,
              color: b.src ? INK.zhu : INK.ink, align: 'left', tracking: 1,
            })
          })
          ctx.restore()
        }
        by += bh + 20
      })
      const cp = easeOut(seg(p, 0.6, 0.85))
      if (cp > 0) text(ctx, '对话示意 · 回答附带平台证据', px + pw / 2, py + ph - 28, { size: 17, font: FONTS.song, color: INK.ink45, alpha: cp, tracking: 4 })
    }

    const tp = easeOut(seg(p, 0.18, 0.5))
    if (tp > 0) {
      const cx = W * 0.77
      text(ctx, 'AI 小文', cx, H * 0.38, { size: 104, font: FONTS.brush, color: INK.ink, alpha: tp, tracking: 10, shadow: 22 })
      rule(ctx, cx - 120 * tp, H * 0.38 + 78, cx + 120 * tp, H * 0.38 + 78, { color: 'rgba(158,44,34,0.6)', width: 2 })
      const sp = easeOut(seg(p, 0.34, 0.66))
      text(ctx, '带着出处的回答', cx, H * 0.38 + 128, { size: 32, font: FONTS.song, color: INK.ink70, alpha: sp, tracking: 10 })
      const np = easeOut(seg(p, 0.54, 0.84))
      text(ctx, '模型输出不直接进入事实库', cx, H * 0.38 + 186, { size: 22, font: FONTS.kai, color: INK.ink45, alpha: np, tracking: 4 })
    }
    cornerMarks(ctx, W, H, { alpha: 0.2 })
  },
  gl: {
    base: (ctx, p) => ({
      flow: 0, warp: 0.0012, ink: 0.06, wet: 0.08, grain: 0.42, vignette: 0.52, lift: 0.02, shake: 0.35,
      bloomAt: [0.77, 0.4], bloomR: 0.16, bloomAmt: 0.12 * (1 - seg(p, 0.3, 0.8)), bloomDark: 0,
    }),
  },
}

// ---------------------------------------------------------------------------
// learn — 一城一课: from a poem to a student's own line
// ---------------------------------------------------------------------------
export const uiLearn = {
  ...pageScene({
    id: 'ui-learn', shotName: 'learn', page: PAGES.learn,
    title: '一城一课', sub: '带着问题读诗', note: '',
  }),
  id: 'ui-learn',
}
const learnDraw = uiLearn.draw
uiLearn.draw = (ctx, p) => {
  learnDraw(ctx, p)
  const wp = easeOut(seg(p, 0.68, 0.92))
  if (wp <= 0) return
  const cw = 560
  const x = W * 0.59 - cw / 2
  const y = H * 0.83
  panel(ctx, x, y, cw, 70, { alpha: wp * 0.96, shadow: 26, seed: 8 })
  text(ctx, '示例习作', x + 70, y + 36, { size: 18, font: FONTS.song, color: INK.ink45, alpha: wp, tracking: 3 })
  text(ctx, '「泰山高几许，黄河去不还。」', x + cw / 2 + 50, y + 36, { size: 24, font: FONTS.kai, color: INK.zhu, alpha: wp, tracking: 2 })
}

// ---------------------------------------------------------------------------
// closing — 「山河有迹，文脉有声」
// ---------------------------------------------------------------------------
export const closing = {
  id: 'closing',
  draw(ctx, p, t) {
    ctx.paintPaper({ vignette: 0.18 })
    const a = ctx.assets
    if (a.riverLandscape) {
      drawCover(ctx, a.riverLandscape, 0, 0, W, H, {
        zoom: lerp(1.02, 1.1, easeInOut(p)), dx: Math.sin(t * 0.12) * 0.004,
        alpha: 0.42, filter: 'saturate(0.6) brightness(1.07)',
      })
    }
    scrim(ctx, { from: 't', size: 0.5, strength: 0.4 })
    scrim(ctx, { from: 'b', size: 0.45, strength: 0.42 })

    const r1 = easeOut(seg(p, 0.06, 0.4))
    const r2 = easeOut(seg(p, 0.28, 0.62))
    vtext(ctx, '山河有迹', W * 0.42, H * 0.20, {
      size: 96, gap: 0.12, font: FONTS.brush, color: INK.ink, alpha: r1, from: r1, shadow: 26,
    })
    vtext(ctx, '文脉有声', W * 0.56, H * 0.20, {
      size: 96, gap: 0.12, font: FONTS.brush, color: INK.zhu, alpha: r2, from: r2, shadow: 26,
    })
    const sp = easeOut(seg(p, 0.44, 0.78))
    if (sp > 0) {
      seal(ctx, W * 0.70, H * 0.30, lerp(40, 118, sp), '齐鲁', { alpha: sp * 0.94, rotate: lerp(-0.14, -0.05, sp) })
    }
    const fp = easeOut(seg(p, 0.58, 1))
    if (fp > 0) {
      text(ctx, 'SJG · 齐鲁文化数字人文平台', W * 0.5, H * 0.79, {
        size: 26, font: FONTS.song, color: INK.ink, alpha: fp, tracking: 8,
      })
      text(ctx, '黄河流域（山东段）文学景观 · 数字人文', W * 0.5, H * 0.79 + 44, {
        size: 18, font: FONTS.song, color: INK.ink70, alpha: fp * 0.9, tracking: 5,
      })
      text(ctx, 'display · data · teaching · evidence-first AI', W * 0.5, H * 0.79 + 82, {
        size: 12, font: FONTS.latin, color: INK.ink45, alpha: fp * 0.8, tracking: 5,
      })
    }
    specks(ctx, W, H, { count: 70, seed: 44, alpha: 0.05 })
    cornerMarks(ctx, W, H, { alpha: 0.24 })
  },
  gl: {
    base: (ctx, p) => ({
      flow: 0.4, riverY: 0.62, riverW: 0.12, riverTilt: -0.03,
      warp: 0.0032, ink: 0.14, wet: 0.15, grain: 0.5, vignette: 0.66, lift: 0.03, shake: 0.4,
      bloomAt: [0.5, 0.5], bloomR: 0.3, bloomAmt: 0.26 * (1 - seg(p, 0.3, 0.9)), bloomDark: 0,
      bleach: 0.02 * easeOut(seg(p, 0.7, 1)),
      letterbox: lerp(0.075, 0.11, easeOut(seg(p, 0.7, 1))),
    }),
  },
}

export { pagePanel, markUI }
