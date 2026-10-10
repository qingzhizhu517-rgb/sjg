// Page harness for the film. Runs inside Chrome; window.__film exposes a
// deterministic frame API so node can step through time and capture frames
// without any wall-clock timing involved.
import { createFilm } from './film/index.js'
import { loadPlan } from './runtime/plan-loader.js'
import {
  black, title, riverHold, nineCard, cityShot, bond, lakeSpring, lakePeak,
} from './scenes/act1.js'
import {
  loadShots, peak, gather, numbers, closing,
  uiPoems, uiPoet, uiTimeline, uiCulture, uiDatav, uiSource, uiAi, uiLearn,
} from './scenes/act2.js'

const canvas = document.getElementById('gl')
canvas.width = 1920
canvas.height = 1080

const status = document.getElementById('status')
const say = (s) => { if (status) status.textContent = s }

const errors = []
window.addEventListener('error', (e) => errors.push(String(e.message)))
window.addEventListener('unhandledrejection', (e) => errors.push(String(e.reason)))

// Scene modules provide draw/gl; the plan provides id/start/duration. Keys from
// the plan are spread last, so its timing always wins.
function assemble(plan) {
  const byId = Object.fromEntries(plan.scenes.map((s) => [s.id, s]))
  const t = (id) => {
    if (!byId[id]) throw new Error(`plan has no shot "${id}"`)
    return byId[id]
  }
  const shots = [
    { ...black, ...t('black') },
    { ...title, ...t('title') },
    { ...riverHold, ...t('riverHold') },
    { ...nineCard, ...t('nineCard') },
  ]
  // nine cities, told once each: 泰山 / 大明湖 / 黄河入海 are these same shots
  // held longer (bigger type + a seal), not three extra repeated city cards
  const CITY_HOLD = new Set([2, 4, 8])
  for (let i = 0; i < 9; i++) {
    shots.push({ ...cityShot(i, { hold: CITY_HOLD.has(i) }), ...t(`city-${i}`) })
  }
  shots.push({ ...bond, ...t('bond') })
  shots.push({ ...lakeSpring, ...t('lake-spring') })
  shots.push({ ...lakePeak, ...t('lake-peak') })
  shots.push({ ...peak, ...t('peak') })
  shots.push({ ...uiPoems, ...t('ui-poems') })
  shots.push({ ...uiPoet, ...t('ui-poet') })
  shots.push({ ...uiTimeline, ...t('ui-timeline') })
  shots.push({ ...uiCulture, ...t('ui-culture') })
  shots.push({ ...uiDatav, ...t('ui-datav') })
  shots.push({ ...gather, ...t('gather') })
  shots.push({ ...numbers, ...t('numbers') })
  shots.push({ ...uiSource, ...t('ui-source') })
  shots.push({ ...uiAi, ...t('ui-ai') })
  shots.push({ ...uiLearn, ...t('ui-learn') })
  shots.push({ ...closing, ...t('closing') })

  // every plan shot must be claimed, or the timeline has a hole
  const claimed = new Set(shots.map((s) => s.id))
  const holes = plan.scenes.filter((s) => !claimed.has(s.id)).map((s) => s.id)
  if (holes.length) throw new Error(`no scene module for plan shots: ${holes.join(', ')}`)
  if (claimed.size !== shots.length) throw new Error('duplicate shot ids')
  return shots
}

async function boot() {
  say('loading plan…')
  const plan = await loadPlan()
  const film = createFilm({ width: 1920, height: 1080, canvas })

  say('loading artwork…')
  await film.preload()
  say('loading page captures…')
  const captures = await loadShots('')
  Object.assign(film.ctx.assets, captures)
  const missing = Object.entries(captures).filter(([, v]) => !v).map(([k]) => k.slice(5))

  film.add(assemble(plan))

  window.__film = {
    total: plan.total,
    plan,
    errors,
    missing,
    frame(t, { gl = true } = {}) {
      const shot = film.draw(t)
      if (gl) film.renderGL(t)
      return { shot: shot.id, label: shot.label, p: (t - shot.start) / shot.duration }
    },
    shotAt: (t) => film.at(t).id,
  }
  document.body.dataset.ready = '1'
  say(`ready · ${film.shots.length} shots · ${plan.total.toFixed(2)}s${missing.length ? ` · missing: ${missing.join(',')}` : ''}`)
}

boot().catch((e) => {
  errors.push(String(e && e.stack ? e.stack : e))
  say(`ERROR: ${e && e.message ? e.message : e}`)
  document.body.dataset.ready = 'error'
})
