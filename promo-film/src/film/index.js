// Film engine: holds shared context, resolves the shot at a given time, and draws it.
// Identical path for live preview, still export and video rendering — one code path.
import { makeBoard, paintPaper, INK, clamp01 } from './gfx.js'
import { createRenderer, DEFAULTS } from './renderer.js'
import { loadAll, MEDIA, IMAGES, SIGHTS } from './assets.js'

// Section transitions. Keyed by shot *id pair* rather than by time, so they keep
// working when durations change (new narration, pace changes) with no edits here.
// `out` = seconds of the outgoing shot that bleed away; `in` = seconds of the
// incoming shot that resolve back out of paper.
const TRANSITIONS = [
  { from: 'black', to: 'title', out: 0.25, in: 0.55 },
  { from: 'riverHold', to: 'nineCard', out: 0.35, in: 0.55 },
  { from: 'city-8', to: 'bond', out: 0.40, in: 0.60 },
  { from: 'lake-spring', to: 'lake-peak', out: 0.26, in: 0.34 },
  { from: 'lake-peak', to: 'peak', out: 0.40, in: 0.60 },
  { from: 'ui-datav', to: 'gather', out: 0.40, in: 0.60 },
  { from: 'numbers', to: 'ui-source', out: 0.35, in: 0.55 },
  { from: 'ui-learn', to: 'closing', out: 0.45, in: 0.70 },
]

export function createFilm({ width = 1920, height = 1080, canvas, boardCanvas } = {}) {
  const cvs = canvas || document.getElementById('gl')
  const renderer = createRenderer(cvs)
  const board = boardCanvas || makeBoard(width, height)
  const bctx = board.getContext('2d', { alpha: false })

  // Scenes get one object that is both the Canvas2D context (save/drawImage/…)
  // and the film state (assets, W/H, paintPaper). None of these names collide
  // with CanvasRenderingContext2D members.
  const ctx = Object.assign(bctx, {
    W: width,
    H: height,
    t: 0,
    board,
    paintPaper: (opts) => paintPaper(bctx, width, height, opts),
    clear: () => {
      bctx.setTransform(1, 0, 0, 1, 0, 0)
      bctx.globalAlpha = 1
      bctx.globalCompositeOperation = 'source-over'
      bctx.filter = 'none'
      bctx.setLineDash([])
    },
    assets: {},
    s: {},          // scratch state shared between frames of a shot
    INK,
    clamp01,
  })

  const shots = []
  let total = 0

  function add(list) {
    for (const shot of list) {
      shots.push(shot)
      total += shot.duration
    }
    shots.sort((a, b) => a.start - b.start)
  }

  function resetAt(t) {
    ctx.s = {}
  }

  function shotAt(t) {
    for (let i = shots.length - 1; i >= 0; i--) {
      if (t >= shots[i].start) return shots[i]
    }
    return shots[0]
  }

  function draw(t) {
    const shot = shotAt(t)
    const p = shot.duration > 0 ? Math.min(1, Math.max(0, (t - shot.start) / shot.duration)) : 1
    if (!shot.__begun || t < shot.start) {
      resetAt(t)
      shot.__begun = true
    }
    ctx.t = t
    ctx.p = p
    ctx.shotId = shot.id
    ctx.t0 = shot.start
    ctx.entry = shot.entry
    ctx.clear()
    shot.draw(ctx, p, t)
    return shot
  }

  // Paper-bleed wipe for the shot playing at `t`, or null when there is no
  // transition at this boundary. Returned as a shader uniform.
  function wipeAt(t, shot) {
    for (let i = 0; i < TRANSITIONS.length; i++) {
      const tr = TRANSITIONS[i]
      if (tr.to === shot.id) {
        const done = shot.start + tr.in
        if (t < done) return { wipe: 1 - clamp01((t - shot.start) / tr.in), seed: i + 1 }
      }
      if (tr.from === shot.id) {
        const from = shot.start + shot.duration - tr.out
        if (t >= from) return { wipe: clamp01((t - from) / tr.out), seed: i + 1 }
      }
    }
    return null
  }

  function renderGL(t) {
    const shot = shotAt(t)
    const p = shot.duration > 0 ? Math.min(1, Math.max(0, (t - shot.start) / shot.duration)) : 1
    const base = shot.gl?.base ? shot.gl.base(ctx, p, t) : {}
    const over = shot.gl?.over ? shot.gl.over(ctx, p, t) : {}
    const u = { ...DEFAULTS, ...base, ...over }
    const wp = wipeAt(t, shot)
    if (wp) { u.wipe = wp.wipe; u.wipeSeed = wp.seed }
    if (u.bloomAt) u.bloomAt = [u.bloomAt[0], u.bloomAt[1]]
    renderer.render(board, u, t)
    return shot
  }

  async function preload() {
    ctx.assets = await loadAll({ ...MEDIA, ...IMAGES, ...SIGHTS })
    return ctx.assets
  }

  return {
    ctx, board, renderer, add, draw, renderGL, preload, shots,
    total: () => total,
    at: shotAt,
  }
}
