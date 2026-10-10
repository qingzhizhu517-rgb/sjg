// Frame renderer: drives main.js over CDP, one PNG per frame.
//
//   node scripts/render.mjs --still 12.0 --out preview      one frame, for review
//   node scripts/render.mjs --stills 0,8,20,45              several frames
//   node scripts/render.mjs --range 0 12 --dir frames/a     a segment at full rate
//   node scripts/render.mjs                                 the whole film
import { launchChrome, sleep } from '../tools/cdp.mjs'
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const build = resolve(root, '.build')
const PORT = 5199
const url = `http://127.0.0.1:${PORT}/promo-film/index.html`

const args = process.argv.slice(2)
const flag = (name, def = null) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def
}
const has = (name) => args.includes(`--${name}`)

const plan = JSON.parse(readFileSync(resolve(build, 'plan.json'), 'utf8'))
const fps = plan.fps
const quality = Number(flag('quality', 92))
const outDir = resolve(root, flag('dir', `.build/frames`))
mkdirSync(outDir, { recursive: true })

if (has('clean')) {
  for (const f of ['stills', 'frames']) rmSync(resolve(build, f), { recursive: true, force: true })
}

let times = []
if (has('still')) times = [Number(flag('still'))]
else if (has('stills')) times = flag('stills').split(',').map(Number)
else if (has('range')) {
  const from = Number(args[args.indexOf('--range') + 1])
  const to = Number(args[args.indexOf('--range') + 2])
  const step = Number(flag('step', 1 / fps))
  for (let t = from; t < to; t += step) times.push(+t.toFixed(4))
} else {
  for (let i = 0; i < Math.round(plan.total * fps); i++) times.push(i / fps)
}

const server = spawn(process.execPath, [resolve(root, 'tools/serve.mjs')], {
  env: { ...process.env, SJG_FILM_PORT: String(PORT) },
  stdio: ['ignore', 'pipe', 'inherit'],
})
await new Promise((r) => server.stdout.once('data', r))

const chrome = await launchChrome({ port: 9346, width: 1920, height: 1080 })
let ok = 0
const failures = []
try {
  const page = await chrome.newPage(url)
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false })
  // wait for boot
  for (let i = 0; i < 240; i++) {
    const r = await page.send('Runtime.evaluate', {
      expression: 'document.body.dataset.ready || ""', returnByValue: true,
    })
    const v = r.result.value
    if (v === '1') break
    if (v === 'error') {
      const st = await page.send('Runtime.evaluate', { expression: 'document.getElementById("status").textContent', returnByValue: true })
      throw new Error(`harness failed: ${st.result.value}`)
    }
    await sleep(250)
  }
  const boot = await page.send('Runtime.evaluate', { expression: '({total: __film.total, n: __film.plan.scenes.length})', returnByValue: true })
  if (!boot.result.value) throw new Error('harness never exposed __film')
  await page.send('Runtime.evaluate', { expression: "document.getElementById('status').style.display='none'" })
  console.log(`plan ${boot.result.value.total.toFixed(2)}s · ${times.length} frames to render`)

  const t0 = Date.now()
  for (let i = 0; i < times.length; i++) {
    const t = times[i]
    const { result } = await page.send('Runtime.evaluate', {
      expression: `(() => { const r = __film.frame(${t}); return r })()`,
      returnByValue: true,
    })
    if (result.value === undefined || result.value === null) {
      failures.push({ t, why: 'frame() returned nothing' })
      continue
    }
    const { data } = await page.send('Page.captureScreenshot', { format: 'jpeg', quality, captureBeyondViewport: false })
    const name = `f${String(Math.round(t * fps)).padStart(5, '0')}.jpg`
    writeFileSync(resolve(outDir, name), Buffer.from(data, 'base64'))
    ok++
    if (i % 30 === 0 || i === times.length - 1) {
      const el = (Date.now() - t0) / 1000
      const rate = (i + 1) / el
      const eta = (times.length - i - 1) / Math.max(rate, 0.001)
      process.stdout.write(`\r${i + 1}/${times.length}  t=${t.toFixed(2)}s  ${result.value.shot.padEnd(12)} ${rate.toFixed(1)} fps  eta ${eta.toFixed(0)}s   `)
    }
  }
  const errs = await page.send('Runtime.evaluate', { expression: '__film.errors', returnByValue: true })
  if (errs.result.value?.length) {
    console.log(`\npage errors:\n  ${errs.result.value.slice(0, 8).join('\n  ')}`)
  }
} catch (e) {
  console.error(`\nrender failed: ${e.message}`)
  process.exitCode = 1
} finally {
  console.log(`\n${ok}/${times.length} frames → ${outDir}`)
  await chrome.close()
  server.kill('SIGTERM')
}
if (failures.length) console.log(`${failures.length} failures`, failures.slice(0, 5))
if (existsSync(resolve(build, 'frames')) && !times.length) console.log('nothing rendered')
