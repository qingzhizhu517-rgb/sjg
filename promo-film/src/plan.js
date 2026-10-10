// Plan builder: turns the narration manifest plus a picture budget into an ordered
// shot list with concrete start times. Picture length follows measured speech, so
// no line is ever clipped and no shot overstays.
// Writes .build/plan.json (runtime) and .build/plan.txt (human-readable check).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CITIES } from '../src/data.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const build = resolve(root, '.build')
mkdirSync(build, { recursive: true })

// global pace: 1.0 is the designed cut, lower is tighter, higher breathes more
export const PACE = Number(process.env.SJG_PACE || 1)

const BUDGET = {
  black: 2.0,
  title: 3.6,
  riverHold: 5.2,
  nineCard: 4.2,
  city: 1.35,
  citySlow: 2.8,
  bond: 2.6,
  lakeSpring: 1.9,
  lakePeak: 2.2,
  peak: 6.4,
  ui: { poems: 3.2, poet: 3.4, timeline: 3.6, culture: 3.2, datav: 3.4 },
  gather: 4.4,
  numbers: 5.4,
  source: 3.4,
  ai: 5.6,
  learn: 5.6,
  closing: 4.6,
}

// The three accents of the roll-call, keyed by city index. Each one is the same
// city shot, held longer — never a second, repeated city card.
const CITY_HOLD = { 2: '泰山', 4: '大明湖', 8: '黄河入海' }

// Every shot that carries a narration id must be at least as long as its line,
// measured after the pace scaling so a tight cut can never clip the voice.
function fit(id, budget, lines) {
  const scaled = budget * PACE
  const line = lines[id]
  if (!line) return scaled
  return Math.max(scaled, +(line.duration + 0.15).toFixed(3))
}

export function buildPlan() {
  const manifest = JSON.parse(readFileSync(resolve(build, 'narration/manifest.json'), 'utf8'))
  const lines = Object.fromEntries(manifest.lines.map((l) => [l.id, l]))

  const scenes = []
  let t = 0
  // `duration` arrives already pace-scaled from fit(); no second scaling here.
  const push = (id, label, duration, extra = {}) => {
    const d = +duration.toFixed(3)
    const shot = { id, label, start: +t.toFixed(3), duration: d, ...extra }
    t += d
    scenes.push(shot)
    return shot
  }

  // ---- Act I — the river arrives --------------------------------------------
  push('black', '黑场', BUDGET.black * PACE)
  push('title', '片题 · 黄河，自西而来', fit('open', BUDGET.title, lines), { narration: 'open' })
  push('riverHold', '长卷 · 九曲黄河万里沙', fit('river', BUDGET.riverHold, lines), { narration: 'river' })
  push('nineCard', '九城 · 一河串九城', fit('nine', BUDGET.nineCard, lines), { narration: 'nine' })

  // nine cities, upstream → downstream. 六快三慢：泰山 / 大明湖 / 黄河入海 三处停顿
  // 并入对应城市镜头本身（同一次出场，只是更慢、更大、带印章），不再另起一个重复镜头。
  for (let i = 0; i < CITIES.length; i++) {
    const hold = CITY_HOLD[i]
    push(
      `city-${i}`,
      hold ? `停 · ${hold}` : `城 · ${CITIES[i].name}`,
      fit(`city-${i}`, hold ? BUDGET.citySlow : BUDGET.city, lines),
      { city: i, narration: `city-${i}`, ...(hold ? { hold: true } : {}) },
    )
  }

  push('bond', '转 · 城因河而生', fit('bond', BUDGET.bond, lines), { narration: 'bond' })
  // 泉与山：一对对句，各占一镜、各配一句，用纸色洇开连成一组
  push('lake-spring', '转 · 泉 · 湖泊是泉的注脚', fit('lake-spring', BUDGET.lakeSpring, lines), { narration: 'lake-spring' })
  push('lake-peak', '转 · 山 · 高山是河的回望', fit('lake-peak', BUDGET.lakePeak, lines), { narration: 'lake-peak' })

  // ---- Act II — the platform gathers it --------------------------------------
  push('peak', '诗 · 会当凌绝顶', fit('peak', BUDGET.peak, lines), { narration: 'peak' })
  push('ui-poems', '产品 · 诗词检索', BUDGET.ui.poems * PACE)
  push('ui-poet', '产品 · 诗人图谱', BUDGET.ui.poet * PACE)
  push('ui-timeline', '产品 · 文脉长河', BUDGET.ui.timeline * PACE)
  push('ui-culture', '产品 · 齐鲁文化', BUDGET.ui.culture * PACE)
  push('ui-datav', '产品 · 数据大屏', BUDGET.ui.datav * PACE)
  push('gather', '收 · 同一条河边', fit('gather', BUDGET.gather, lines), { narration: 'gather' })
  push('numbers', '数字 · 山河成册', fit('numbers', BUDGET.numbers, lines), { narration: 'numbers' })

  // ---- Act III — how it works, and why ---------------------------------------
  push('ui-source', '溯源 · 每条都有出处', fit('source', BUDGET.source, lines), { narration: 'source' })
  push('ui-ai', 'AI 小文 · 带着出处的回答', fit('ai', BUDGET.ai, lines), { narration: 'ai' })
  push('ui-learn', '研学 · 一城一课', fit('learn', BUDGET.learn, lines), { narration: 'teach' })
  push('closing', '落款 · 山河有迹，文脉有声', fit('sign', BUDGET.closing, lines), { narration: 'sign' })

  // Every line now owns its shot — the nine-city roll-call became city-0…city-8 —
  // so a line starts exactly where its host shot starts. fit() has already made each
  // city shot at least as long as its own line, which is what the old roll-call
  // compensation used to patch up after the fact.
  const narration = manifest.lines
    .map((line) => {
      const host = scenes.find((s) => s.narration === line.id)
      if (!host) return null
      return {
        id: line.id, file: line.file, text: line.text,
        start: host.start, duration: line.duration, scene: host.id,
        end: +(host.start + line.duration).toFixed(3),
      }
    })
    .filter(Boolean)

  const last = scenes[scenes.length - 1]
  const total = +(last.start + last.duration).toFixed(3)
  const speechEnd = Math.max(...narration.map((n) => n.end))
  const plan = {
    generatedAt: new Date().toISOString(),
    fps: 30, width: 1920, height: 1080, pace: PACE,
    total,
    speechEnd: +speechEnd.toFixed(3),
    scenes,
    narration,
  }
  writeFileSync(resolve(build, 'plan.json'), JSON.stringify(plan, null, 2))

  const out = [
    `SJG promo film — ${total.toFixed(2)}s (${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, '0')}) @ ${plan.fps}fps, pace ${PACE}`,
    `narration ends at ${speechEnd.toFixed(2)}s`,
    '',
    ...scenes.map((s) => {
      const vo = s.narration ? `  ◀ ${s.narration}` : ''
      return `${s.start.toFixed(2).padStart(7)} +${s.duration.toFixed(2).padStart(5)}  ${s.id.padEnd(12)} ${s.label}${vo}`
    }),
    '',
    'narration lines:',
    ...narration.map((n) => `  ${n.start.toFixed(2).padStart(7)} → ${n.end.toFixed(2).padStart(7)}  ${n.id.padEnd(9)} ${n.text}`),
  ]
  writeFileSync(resolve(build, 'plan.txt'), out.join('\n'))
  return plan
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const plan = buildPlan()
  console.log(readFileSync(resolve(build, 'plan.txt'), 'utf8'))
  console.log(`\n${plan.scenes.length} shots`)
}

// Keep PACE from shrinking a scene below its spoken line: compute the budget first,
// scale it, then fit the narration on top of the scaled value.
