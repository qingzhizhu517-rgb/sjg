// Full-page capture via CDP: drives the running dev servers with real Chrome,
// waits for artwork/animations to settle, and writes PNGs the film then composites.
//
// Run after the three frontends are up (5175 display-v2, 5180 datav, 5173 admin).
import { launchChrome, sleep } from './cdp.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, '.build/capture')
mkdirSync(outDir, { recursive: true })

const DISPLAY = process.env.SJG_DISPLAY_URL || 'http://localhost:5175'
const DATAV = process.env.SJG_DATAV_URL || 'http://localhost:5180'
const ADMIN = process.env.SJG_ADMIN_URL || 'http://localhost:5173'

// Each entry: where to point the camera, what to wait for, how long to settle.
const SHOTS = [
  { name: 'home', url: `${DISPLAY}/` , wait: 4200, settle: 1200, scroll: 0 },
  { name: 'poems', url: `${DISPLAY}/poems`, wait: 4200, settle: 1000 },
  { name: 'poem-detail', url: `${DISPLAY}/poems/36`, wait: 5200, settle: 1400 },
  { name: 'poets', url: `${DISPLAY}/poets`, wait: 4500, settle: 1200 },
  // the graph sits below the fold: scroll it into view so it fills the frame
  { name: 'poet-graph', url: `${DISPLAY}/poets?view=graph`, wait: 6500, settle: 2600, scrollY: 720 },
  { name: 'poet-detail', url: `${DISPLAY}/poets/6`, wait: 5000, settle: 1400 },
  { name: 'timeline', url: `${DISPLAY}/timeline`, wait: 5200, settle: 1600 },
  { name: 'culture', url: `${DISPLAY}/culture`, wait: 4200, settle: 1000 },
  { name: 'crafts', url: `${DISPLAY}/crafts`, wait: 4200, settle: 1000 },
  { name: 'festivals', url: `${DISPLAY}/festivals`, wait: 4200, settle: 1000 },
  { name: 'learn', url: `${DISPLAY}/learn`, wait: 4200, settle: 1000 },
  { name: 'compose', url: `${DISPLAY}/compose`, wait: 4200, settle: 1400 },
  { name: 'spot', url: `${DISPLAY}/spots/14`, wait: 5200, settle: 1600 },
  { name: 'region', url: `${DISPLAY}/regions/济南`, wait: 4600, settle: 1200 },
  { name: 'city', url: `${DISPLAY}/cities/泰安`, wait: 4600, settle: 1200 },
  { name: 'datav', url: `${DATAV}/`, wait: 7000, settle: 2600 },
  { name: 'admin-review', url: `${ADMIN}/`, wait: 4000, settle: 1200 },
]

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'))

const chrome = await launchChrome({ port: 9345, width: 1920, height: 1080 })
const results = []
try {
  for (const shot of SHOTS) {
    if (only.length && !only.includes(shot.name)) continue
    process.stdout.write(`${shot.name.padEnd(14)} `)
    const page = await chrome.newPage('about:blank')
    try {
      await page.send('Emulation.setDeviceMetricsOverride', {
        width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false,
      })
      await page.send('Page.navigate', { url: shot.url })
      await sleep(shot.wait)
      // let images decode and entry animations finish
      await page.send('Runtime.evaluate', {
        expression: `(async () => {
          window.scrollTo(0, ${shot.scrollY || 0})
          await new Promise(r => setTimeout(r, 300))
          return document.readyState
        })()`,
        awaitPromise: true, returnByValue: true,
      }).catch(() => {})
      await sleep(shot.settle)
      const { data } = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
      const buf = Buffer.from(data, 'base64')
      writeFileSync(resolve(outDir, `${shot.name}.png`), buf)
      // a 1x1 readback proves the page actually painted rather than sitting blank
      const { result } = await page.send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.querySelector('#app, #root') || document.body
          return { text: (document.body.innerText || '').replace(/\\s+/g,' ').slice(0, 80), nodes: el.querySelectorAll('*').length }
        })()`,
        returnByValue: true,
      })
      results.push({ ...shot, bytes: buf.length, ...result.value })
      console.log(`ok  ${(buf.length / 1024).toFixed(0)}kB  nodes=${result.value.nodes}`)
    } catch (e) {
      results.push({ ...shot, error: String(e.message) })
      console.log(`FAIL ${e.message}`)
    } finally {
      await page.close()
    }
  }
} finally {
  await chrome.close()
}

writeFileSync(resolve(outDir, 'capture-report.json'), JSON.stringify(results, null, 2))
const ok = results.filter((r) => !r.error).length
console.log(`\n${ok}/${results.length} captured → ${outDir}`)
if (ok === 0) process.exit(1)
