import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import { prepareBatchReviewBrowser, exerciseBatchReviewBrowser } from './batch-review-browser-fixture.mjs'

const targets = [
  ['display-v2', 4175, '/map?preview=inkwash'],
  ['display-v2', 4175, '/poets?preview=inkwash'],
  ['admin-frontend', 4173, '/login'],
  ['admin-frontend', 4173, '/content-governance'],
  ['sjg-datav', 4180, '/'],
]
const servers = new Map()
const reports = []
let browser
try {
  for (const [project, port] of targets) {
    if (servers.has(port)) continue
    const child = spawn(
      'npm',
      [
        '--prefix',
        project,
        'run',
        'preview',
        '--',
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--strictPort',
      ],
      { stdio: 'ignore', detached: true },
    )
    servers.set(port, child)
    let ready = false
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null) throw new Error(`Preview exited: ${project}`)
      try {
        ready = (await fetch(`http://127.0.0.1:${port}`)).ok
      } catch {}
      if (ready) break
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    if (!ready) throw new Error(`Preview failed: ${project}`)
  }
  browser = await chromium.launch({ channel: process.platform === 'darwin' ? 'chrome' : undefined })
  for (const [project, port, path] of targets) {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    if (path === '/content-governance') await prepareBatchReviewBrowser(context, page)
    await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: 'networkidle' })
    if (path === '/content-governance') await exerciseBatchReviewBrowser(page)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    const navigation = await page.evaluate(() => performance.getEntriesByType('navigation')[0]?.toJSON())
    const blocking = results.violations.filter((item) => ['critical', 'serious'].includes(item.impact))
    reports.push({
      project,
      path,
      navigation,
      violations: results.violations,
      blockingCount: blocking.length,
    })
    console.log(`${project}${path}: ${blocking.length} serious/critical accessibility failures`)
    await context.close()
  }
  await fs.mkdir('.local/quality', { recursive: true })
  await fs.writeFile('.local/quality/accessibility.json', JSON.stringify(reports, null, 2))
  if (reports.some((report) => report.blockingCount)) process.exitCode = 1
} finally {
  await browser?.close()
  for (const child of servers.values()) {
    try {
      process.kill(-child.pid, 'SIGTERM')
    } catch {}
  }
}
