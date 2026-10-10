// Act I — the river arrives: title, long scroll, the nine cities, and the turn.
import {
  INK, FONTS, text, vtext, seal, rule, stroke, clamp01, easeOut, easeInOut, seg, lerp,
  verse, caption, indexTag, cornerMarks, cam, specks,
} from '../film/kit.js'
import { drawCover } from '../film/gfx.js'
import { CITIES } from '../data.js'
import {
  cameraFor, drawMapLayer, washPrefectures, drawRiver, drawSite, riverAt, toScreen, SITES, KM_PX,
} from '../film/shandongMap.js'

export const W = 1920
export const H = 1080

// Local scrim so type stays legible over a painting without flattening it.
export function scrim(ctx, { from = 'l', size = 0.62, strength = 0.55, color = '252,250,244' } = {}) {
  const g = from === 'l' || from === 'r'
    ? ctx.createLinearGradient(from === 'l' ? 0 : W, 0, from === 'l' ? W * size : W * (1 - size), 0)
    : ctx.createLinearGradient(0, from === 't' ? 0 : H, 0, from === 't' ? H * size : H * (1 - size))
  g.addColorStop(0, `rgba(${color},${strength})`)
  g.addColorStop(0.55, `rgba(${color},${strength * 0.42})`)
  g.addColorStop(1, `rgba(${color},0)`)
  ctx.save()
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.restore()
}

// ---------------------------------------------------------------------------
// black — cold open: an ink drop blooms, then stamps into a seal
// ---------------------------------------------------------------------------
export const black = {
  id: 'black',
  draw(ctx, p) {
    ctx.paintPaper({ vignette: 0.14 })
    const bite = seg(p, 0.28, 0.92)
    if (bite > 0) {
      seal(ctx, W / 2, H / 2, lerp(26, 210, easeOut(bite)), '山河', {
        alpha: easeOut(bite) * 0.92, rotate: lerp(-0.06, 0, easeOut(bite)),
      })
    }
    if (bite > 0.6) {
      text(ctx, 'SJG · 齐鲁文化数字人文平台', W / 2, H / 2 + 214, {
        size: 18, font: FONTS.latin, color: INK.ink45, alpha: easeOut(seg(p, 0.6, 1)) * 0.9, tracking: 6,
      })
    }
  },
  gl: {
    base: (ctx, p) => ({
      bleach: 0.03, vignette: 0.5, grain: 0.45, letterbox: 0.075,
      bloomAt: [0.5, 0.5], bloomR: lerp(0.05, 0.34, easeOut(seg(p, 0.28, 1))),
      bloomAmt: seg(p, 0.28, 0.5) * (1 - seg(p, 0.55, 0.9)) * 0.38, bloomDark: 1,
    }),
  },
}

// ---------------------------------------------------------------------------
// title — 「黄河，自西而来」
// ---------------------------------------------------------------------------
export const title = {
  id: 'title',
  draw(ctx, p) {
    ctx.paintPaper({ vignette: 0.1 })
    const a = ctx.assets
    if (a.riverLandscape) {
      drawCover(ctx, a.riverLandscape, 0, 0, W, H, {
        ...cam(p, { from: 1.06, to: 1.16, dx: -0.02 }), alpha: 0.5,
        filter: 'saturate(0.55) brightness(1.06)',
      })
      scrim(ctx, { from: 'r', size: 0.7, strength: 0.72 })
    }
    const grow = easeOut(seg(p, 0.04, 0.42))
    if (grow > 0) {
      text(ctx, '河', W * 0.30, H * 0.52, {
        size: lerp(520, 620, easeOut(seg(p, 0.05, 1))), font: FONTS.brush, color: INK.ink,
        alpha: grow, shadow: 40,
      })
    }
    const lineP = easeOut(seg(p, 0.34, 0.7))
    if (lineP > 0) {
      vtext(ctx, '黄河，自西而来', W * 0.66, H * 0.17, {
        size: 96, gap: 0.14, font: FONTS.brush, color: INK.ink, alpha: lineP, from: lineP, shadow: 26,
      })
      const l2 = easeOut(seg(p, 0.5, 0.85))
      vtext(ctx, '过山东，入海', W * 0.78, H * 0.30, {
        size: 62, gap: 0.16, font: FONTS.kai, color: INK.ink70, alpha: l2, from: l2,
      })
    }
    if (p > 0.6) {
      const t2 = easeOut(seg(p, 0.6, 1))
      rule(ctx, W * 0.30 - 190 * t2, H * 0.80, W * 0.30 + 190 * t2, H * 0.80, { color: 'rgba(158,44,34,0.55)', width: 2 })
      text(ctx, '黄河流域（山东段）文学景观 · 数字人文', W * 0.30, H * 0.80 + 44, {
        size: 24, font: FONTS.song, color: INK.ink70, alpha: t2, tracking: 8,
      })
    }
    specks(ctx, W, H, { count: 60, seed: 3, alpha: 0.045 })
    cornerMarks(ctx, W, H, { alpha: 0.22 })
  },
  gl: {
    base: (ctx, p) => ({
      bloomAt: [0.30, 0.52], bloomR: lerp(0.06, 0.5, easeOut(seg(p, 0.02, 0.5))),
      bloomAmt: seg(p, 0.02, 0.2) * (1 - seg(p, 0.3, 0.55)) * 0.32, bloomDark: 1,
      flow: 0.28 * seg(p, 0.15, 0.8), riverY: 0.62, riverW: 0.16, riverTilt: -0.05,
      warp: 0.0022, ink: 0.1, wet: 0.12, lift: 0.04, grain: 0.5, vignette: 0.6, shake: 0.6,
    }),
  },
}

// ---------------------------------------------------------------------------
// riverHold — the long scroll breathes, 「九曲黄河万里沙」
// ---------------------------------------------------------------------------
export const riverHold = {
  id: 'riverHold',
  draw(ctx, p, t) {
    ctx.paintPaper({ vignette: 0.08 })
    const a = ctx.assets
    if (a.riverLandscape) {
      drawCover(ctx, a.riverLandscape, 0, 0, W, H, {
        zoom: lerp(1.02, 1.14, easeInOut(p)),
        dx: lerp(-0.03, 0.03, easeInOut(p)) + Math.sin(t * 0.16) * 0.004,
        filter: 'saturate(0.72) contrast(1.04)',
      })
    }
    scrim(ctx, { from: 'r', size: 0.66, strength: 0.66 })
    scrim(ctx, { from: 't', size: 0.4, strength: 0.3 })
    verse(ctx, '九曲黄河万里沙', W * 0.845, H * 0.13, {
      size: 78, gap: 0.14, colGap: 1.42, font: FONTS.brush, color: INK.ink,
      reveal: easeOut(seg(p, 0.06, 0.6)), shadow: 22,
    })
    const att = easeOut(seg(p, 0.42, 0.8))
    if (att > 0) {
      text(ctx, '浪淘风簸自天涯', W * 0.60, H * 0.80, { size: 32, font: FONTS.kai, color: INK.ink70, alpha: att * 0.92, tracking: 3, align: 'right' })
      text(ctx, '刘禹锡《浪淘沙》', W * 0.60, H * 0.80 + 44, { size: 24, font: FONTS.kai, color: INK.ink70, alpha: att * 0.9, tracking: 4, align: 'right' })
      text(ctx, 'TANG DYNASTY · LIU YUXI', W * 0.60, H * 0.80 + 76, { size: 13, font: FONTS.latin, color: INK.ink45, alpha: att * 0.8, tracking: 5, align: 'right' })
    }
    indexTag(ctx, W, H, { index: 2, total: 30, alpha: easeOut(seg(p, 0.3, 0.9)) * 0.5 })
    cornerMarks(ctx, W, H, { alpha: 0.2 })
  },
  gl: {
    base: (ctx, p) => ({
      flow: 0.95 * (1 - seg(p, 0.88, 1)), riverY: 0.60, riverW: 0.13, riverTilt: -0.10,
      warp: 0.0042, ink: 0.14, wet: 0.16, grain: 0.52, vignette: 0.62, lift: 0.03, shake: 0.8,
      bloomAt: [0.52, 0.66], bloomR: 0.1, bloomAmt: 0.3, bloomDark: 0,
    }),
  },
}

// ---------------------------------------------------------------------------
// nineCard — the province drawn from real boundaries; the river inks itself in
// from Henan to the Bohai and ties each of the nine cities to its course
// ---------------------------------------------------------------------------
const MAP_FOCUS_FROM = [960, 560]
const MAP_FOCUS_TO = [840, 520]

function mapCam(p) {
  const e = easeInOut(p)
  return cameraFor(lerp(MAP_FOCUS_FROM[0], MAP_FOCUS_TO[0], e), lerp(MAP_FOCUS_FROM[1], MAP_FOCUS_TO[1], e), lerp(1.0, 1.2, e))
}
const RIVER_IN = [0.06, 0.74]
const riverReveal = (p) => easeInOut(seg(p, RIVER_IN[0], RIVER_IN[1]))
// each city lights when the river reaches it
const siteAt = (p, site) => {
  const u = riverReveal(p)
  return easeOut(clamp01((u - site.u + 0.02) / 0.14))
}

export const nineCard = {
  id: 'nineCard',
  draw(ctx, p, t) {
    ctx.paintPaper({ vignette: 0 })
    const camera = mapCam(p)
    drawMapLayer(ctx, camera, { alpha: easeOut(seg(p, 0, 0.16)) })
    const wash = {}
    SITES.forEach((s) => { wash[s.name] = siteAt(p, s) })
    washPrefectures(ctx, camera, wash)
    drawRiver(ctx, camera, riverReveal(p), t)
    SITES.forEach((s) => drawSite(ctx, camera, s, siteAt(p, s), { size: 34 }))

    // title block, set vertically in the left margin like a map cartouche
    const tp = easeOut(seg(p, 0.02, 0.3))
    vtext(ctx, '沿黄九市', 190, 250, { size: 58, gap: 0.12, font: FONTS.brush, color: INK.ink, alpha: tp, from: tp, shadow: 12 })
    if (tp > 0.6) seal(ctx, 190, 600, 46, '九城', { alpha: easeOut(seg(p, 0.18, 0.4)) * 0.9 })
    const lp = easeOut(seg(p, 0.5, 0.8))
    if (lp > 0) {
      text(ctx, '黄河山东段 · 东明入境，垦利入海', W - 120, H - 128, { size: 20, font: FONTS.song, color: INK.ink70, alpha: lp, tracking: 4, align: 'right' })
      text(ctx, 'NINE CITIES ALONG THE YELLOW RIVER', W - 120, H - 100, { size: 12, font: FONTS.latin, color: INK.ink45, alpha: lp * 0.85, tracking: 5, align: 'right' })
      // scale bar, true to the camera
      const km = 100 * KM_PX * camera.a
      const x0 = W - 120 - km
      const y0 = H - 168
      ctx.save()
      ctx.globalAlpha = lp * 0.8
      ctx.strokeStyle = INK.ink70
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x0, y0 - 5); ctx.lineTo(x0, y0); ctx.lineTo(x0 + km, y0); ctx.lineTo(x0 + km, y0 - 5)
      ctx.moveTo(x0 + km / 2, y0 - 3); ctx.lineTo(x0 + km / 2, y0)
      ctx.stroke()
      ctx.restore()
      text(ctx, '100 公里', x0 + km / 2, y0 - 16, { size: 13, font: FONTS.song, color: INK.ink45, alpha: lp * 0.85 })
    }
    // north mark
    const np = easeOut(seg(p, 0.1, 0.4))
    if (np > 0) {
      text(ctx, '北', W - 150, 168, { size: 22, font: FONTS.song, color: INK.ink70, alpha: np })
      rule(ctx, W - 150, 186, W - 150, 236, { color: INK.ink45, width: 1, alpha: np })
    }
    cornerMarks(ctx, W, H, { alpha: 0.2 })
  },
  gl: {
    base: () => ({}),
    over: (ctx, p) => {
      const camera = mapCam(p)
      const u = riverReveal(p)
      const h = riverAt(u)
      const [hx, hy] = toScreen(camera, h.x, h.y)
      return {
        bloomAt: [hx / W, hy / H], bloomR: 0.05,
        bloomAmt: (u > 0 && u < 1 ? 0.7 : 0) * (1 - seg(p, 0.86, 1)), bloomDark: 0,
        flow: 0, warp: 0.0016, ink: 0.06, wet: 0.1, grain: 0.5, vignette: 0.55, lift: 0.02, shake: 0.3,
      }
    },
  },
}

// ---------------------------------------------------------------------------
// city — one riverside city, one real verse from the platform's own data
// ---------------------------------------------------------------------------
// 一城一张青绿山水（display-v2 首页「九城胜迹」那套，见 film/paths.js 的 SIGHTS）。
// 九张同源、风格统一，且滨州 · 无棣碣石山 有专属插画，不再借用黄河长卷。
const CITY_ART = {
  peony: 'sightHeze',
  kongmiao: 'sightJining',
  taishan: 'sightTaian',
  guangyue: 'sightLiaocheng',
  daming: 'sightJinan',
  dezhou: 'sightDezhou',
  zibo: 'sightZibo',
  binzhou: 'sightBinzhou',
  dongying: 'sightDongying',
}

const SEAL_TEXT = { 2: '泰山', 4: '明湖', 8: '入海' }

export function cityShot(index, { hold = false } = {}) {
  const city = CITIES[index]
  const mirrored = index % 2 === 1
  return {
    // one id per city: the accent shots are held versions of city-2/4/8, so the
    // timeline never carries two entries for the same city
    id: `city-${index}`,
    city,
    hold,
    draw(g, p) {
      const a = g.assets
      const img = a[CITY_ART[city.art]] || a.riverLandscape
      g.paintPaper({ vignette: 0.06 })
      const inP = clamp01(p / (hold ? 0.3 : 0.42))
      const ein = easeOut(inP)
      const outP = hold ? clamp01((p - 0.84) / 0.16) : 0
      if (img) {
        drawCover(g, img, 0, 0, W, H, {
          zoom: lerp(1.05, 1.15, easeInOut(p)) * (1 + outP * 0.05),
          dx: mirrored ? lerp(0.03, -0.03, p) : lerp(-0.03, 0.03, p),
          alpha: ein * (1 - outP), filter: 'saturate(0.8) contrast(1.05)',
        })
      }
      scrim(g, { from: mirrored ? 'r' : 'l', size: hold ? 0.72 : 0.62, strength: hold ? 0.8 : 0.72 })
      scrim(g, { from: 'b', size: 0.45, strength: 0.4 })

      const tx = mirrored ? W * 0.815 : W * 0.185
      const nameSize = hold ? 168 : lerp(112, 128, ein)
      const nameAlpha = ein * (1 - outP)
      const nameY = H * (hold ? 0.20 : 0.24)
      vtext(g, city.name, tx, nameY - (1 - ein) * 26, {
        size: nameSize, gap: 0.02, font: FONTS.brush, color: INK.ink,
        alpha: nameAlpha, from: easeOut(clamp01(inP * 1.35)), shadow: 30,
      })
      text(g, city.pinyin, tx, nameY + nameSize * 2.62, {
        size: 20, font: FONTS.latin, color: INK.ink45, alpha: nameAlpha * 0.9, tracking: 8,
      })

      const tagP = easeOut(clamp01((p - (hold ? 0.18 : 0.24)) / 0.3))
      if (tagP > 0) {
        const ty = nameY + nameSize * 2.95
        rule(g, tx - 90, ty, tx + 90, ty, { color: 'rgba(158,44,34,0.6)', width: 2, grow: tagP })
        text(g, `${city.tag} · ${city.sight}`, tx, ty + 42, {
          size: hold ? 30 : 24, font: FONTS.song, color: INK.ink70, alpha: tagP * (1 - outP), tracking: 5,
        })
      }

      const rev = hold ? easeOut(seg(p, 0.14, 0.62)) : easeOut(clamp01((p - 0.16) / 0.5))
      if (rev > 0) {
        const vx = mirrored ? W * 0.32 : W * 0.68
        const vy = H * (hold ? 0.58 : 0.62)
        const vSize = hold ? 54 : 40
        verse(g, city.verse, vx, vy, {
          size: vSize, gap: 0.12, colGap: 1.34, font: FONTS.kai, color: INK.ink,
          reveal: rev, alpha: (1 - outP) * 0.98, shadow: 16,
        })
        const at = easeOut(clamp01((rev - 0.55) / 0.45))
        if (at > 0) {
          const cols = city.verse.length > 10 ? 2 : 1
          text(g, `${city.poet} · ${city.dynasty}`, vx - (cols - 1) * vSize * 1.34 - vSize * 0.9, vy + vSize * 2.1, {
            size: 24, font: FONTS.kai, color: INK.ink70, alpha: at * (1 - outP), tracking: 3,
          })
        }
      }

      if (hold && p > 0.6) {
        const sp = easeOut(seg(p, 0.6, 0.92))
        seal(g, mirrored ? W * 0.14 : W * 0.86, H * 0.82, lerp(40, 100, sp), SEAL_TEXT[index] || '文', {
          alpha: sp * 0.92, rotate: lerp(-0.12, 0, sp),
        })
      }
      specks(g, W, H, { count: 40, seed: index + 2, alpha: 0.04 })
    },
    gl: {
      base: (g, p) => ({
        flow: hold ? 0.5 : 0.32, riverY: 0.76, riverW: 0.1, riverTilt: mirrored ? 0.08 : -0.08,
        warp: 0.0028, ink: hold ? 0.16 : 0.12, wet: 0.15, grain: 0.5,
        vignette: hold ? 0.64 : 0.6, lift: 0.035, shake: hold ? 0.7 : 0.9,
        bloomAt: [mirrored ? 0.82 : 0.18, 0.34], bloomR: 0.22,
        bloomAmt: hold ? 0.3 * (1 - seg(p, 0.7, 1)) : 0.22, bloomDark: 0,
        abr: hold ? 0.8 : 0,
      }),
    },
  }
}

// ---------------------------------------------------------------------------
// bond — 「城因河而生，诗因人而传」
// ---------------------------------------------------------------------------
export const bond = {
  id: 'bond',
  draw(ctx, p) {
    ctx.paintPaper({ vignette: 0.12 })
    const a = ctx.assets
    if (a.riverLandscapeOld) {
      drawCover(ctx, a.riverLandscapeOld, 0, 0, W, H, {
        ...cam(p, { from: 1.14, to: 1.04, dy: 0.02 }), alpha: 0.28,
        filter: 'grayscale(0.4) brightness(1.08)',
      })
    }
    const sweep = easeInOut(seg(p, 0.05, 0.6))
    stroke(ctx, lerp(-100, W * 1.1, sweep), H * 0.5, lerp(120, W + 100, sweep), H * 0.5, {
      color: 'rgba(158,44,34,0.35)', width: 3, alpha: 0.9, taper: 0.7, seed: 9,
    })
    const l1 = easeOut(seg(p, 0.06, 0.4))
    const l2 = easeOut(seg(p, 0.34, 0.68))
    if (l1 > 0) vtext(ctx, '城因河而生', W * 0.36, H * 0.24, { size: 92, gap: 0.14, font: FONTS.brush, color: INK.ink, alpha: l1, from: l1, shadow: 24 })
    if (l2 > 0) vtext(ctx, '诗因人而传', W * 0.62, H * 0.24, { size: 92, gap: 0.14, font: FONTS.brush, color: INK.zhu, alpha: l2, from: l2, shadow: 24 })
    if (p > 0.55) {
      text(ctx, '城 与 诗', W * 0.5, H * 0.85, { size: 22, font: FONTS.song, color: INK.ink45, alpha: easeOut(seg(p, 0.55, 0.9)) * 0.9, tracking: 16 })
    }
    specks(ctx, W, H, { count: 50, seed: 12, alpha: 0.05 })
  },
  gl: {
    base: (ctx, p) => ({
      flow: 0.85 * (1 - seg(p, 0.82, 1)), riverY: 0.5, riverW: 0.06, riverTilt: 0.0,
      warp: 0.005 * (1 - seg(p, 0.82, 1)), ink: 0.2, wet: 0.18, grain: 0.5,
      vignette: 0.62, lift: 0.04, shake: 0.7,
      bloomAt: [0.36, 0.3], bloomR: 0.24, bloomAmt: 0.28 * (1 - seg(p, 0.7, 1)), bloomDark: 0,
    }),
  },
}

// ---------------------------------------------------------------------------
// lakeSpring — 「湖泊是泉的注脚」：趵突泉满幅
// ---------------------------------------------------------------------------
// 原来是把「趵突泉」与「泰山」各裁一半、并排各占半屏，中间再画一道波浪线。
// 两幅画各自的画风、密度、色调都不同，并置后既挤又散——拼贴不等于构图，
// 换素材也救不回来。改成一景一镜、一镜一句，两镜之间用纸色洇开连成一对。
export const lakeSpring = {
  id: 'lake-spring',
  draw(ctx, p) {
    ctx.paintPaper({ vignette: 0.1 })
    const a = ctx.assets
    if (a.baotu) {
      drawCover(ctx, a.baotu, 0, 0, W, H, {
        zoom: lerp(1.06, 1.16, easeInOut(p)),
        dy: lerp(0.02, -0.02, p),
        alpha: easeOut(seg(p, 0.02, 0.45)),
        filter: 'saturate(0.78) contrast(1.02)',
      })
    }
    // 左侧渐变压得重一些：这张图的亭子正好在标题区，不压住飞檐字就糊在一起
    scrim(ctx, { from: 'l', size: 0.46, strength: 0.80 })
    scrim(ctx, { from: 'b', size: 0.36, strength: 0.28 })
    const t1 = easeOut(seg(p, 0.14, 0.5))
    if (t1 > 0) {
      vtext(ctx, '趵突泉', W * 0.145, H * 0.17, {
        size: 104, gap: 0.10, font: FONTS.brush, color: INK.ink, alpha: t1, from: t1, shadow: 26,
      })
      const sp = easeOut(seg(p, 0.3, 0.66))
      text(ctx, '湖泊是泉的注脚', W * 0.145, H * 0.78, {
        size: 40, font: FONTS.song, color: INK.ink70, alpha: sp, tracking: 9, shadow: 14,
      })
    }
    specks(ctx, W, H, { count: 42, seed: 15, alpha: 0.042 })
    cornerMarks(ctx, W, H, { alpha: 0.2 })
  },
  gl: {
    base: (ctx, p) => ({
      warp: 0.0036 * (1 - seg(p, 0.85, 1)), flow: 0.34, riverY: 0.68, riverW: 0.075, riverTilt: 0.04,
      ink: 0.14, wet: 0.15, grain: 0.5, vignette: 0.6, lift: 0.035, shake: 0.6,
      bloomAt: [0.32, 0.6], bloomR: 0.2, bloomAmt: 0.28 * (1 - seg(p, 0.6, 1)), bloomDark: 0, abr: 0.5,
    }),
  },
}

// ---------------------------------------------------------------------------
// lakePeak — 「高山是河的回望」：泰山群峰满幅（标题与上一镜左右呼应）
// ---------------------------------------------------------------------------
export const lakePeak = {
  id: 'lake-peak',
  draw(ctx, p) {
    ctx.paintPaper({ vignette: 0.1 })
    const a = ctx.assets
    if (a.sightTaian) {
      drawCover(ctx, a.sightTaian, 0, 0, W, H, {
        zoom: lerp(1.16, 1.05, easeInOut(p)),
        dy: lerp(-0.02, 0.02, p),
        alpha: easeOut(seg(p, 0.02, 0.45)),
        filter: 'saturate(0.78) contrast(1.03)',
      })
    }
    scrim(ctx, { from: 'r', size: 0.5, strength: 0.74 })
    scrim(ctx, { from: 't', size: 0.34, strength: 0.26 })
    const t1 = easeOut(seg(p, 0.14, 0.5))
    if (t1 > 0) {
      vtext(ctx, '岱宗', W * 0.855, H * 0.17, {
        size: 120, gap: 0.10, font: FONTS.brush, color: INK.ink, alpha: t1, from: t1, shadow: 26,
      })
      const sp = easeOut(seg(p, 0.3, 0.66))
      text(ctx, '高山是河的回望', W * 0.855, H * 0.78, {
        size: 40, font: FONTS.song, color: INK.ink70, alpha: sp, tracking: 9, shadow: 14,
      })
    }
    specks(ctx, W, H, { count: 42, seed: 26, alpha: 0.042 })
    cornerMarks(ctx, W, H, { alpha: 0.2 })
  },
  gl: {
    base: (ctx, p) => ({
      warp: 0.0036 * (1 - seg(p, 0.85, 1)), flow: 0.42, riverY: 0.72, riverW: 0.08, riverTilt: -0.05,
      ink: 0.15, wet: 0.16, grain: 0.5, vignette: 0.62, lift: 0.033, shake: 0.55,
      bloomAt: [0.5, 0.35], bloomR: 0.24, bloomAmt: 0.3 * (1 - seg(p, 0.6, 1)), bloomDark: 0, abr: 0.5,
    }),
  },
}
