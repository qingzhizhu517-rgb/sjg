// Minimal Chrome DevTools Protocol client. Zero dependencies (Node 22+ native WebSocket).
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const CHROME_BIN = process.env.CHROME_BIN ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function launchChrome({
  port = 9333,
  width = 1920,
  height = 1080,
  profile = null,
  extraArgs = [],
} = {}) {
  const userDataDir = profile || mkdtempSync(join(tmpdir(), 'sjg-chrome-'))
  const args = [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    `--window-size=${width},${height}`,
    '--force-device-scale-factor=1',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--mute-audio',
    '--allow-file-access-from-files',
    '--autoplay-policy=no-user-gesture-required',
    '--use-angle=metal',
    // Chrome's own sandbox can fail to initialise in restricted / hosted environments:
    // the GPU process dies (exit_code=6) and Target.createTarget then hangs forever
    // while /json/version still answers 200 — an easy misdiagnosis as "port in use".
    // Disabling it makes capture and render work everywhere. This is a local headless
    // render of our own pages, not a browsing session, so the sandbox buys us nothing.
    '--no-sandbox',
    '--disable-gpu-sandbox',
    'about:blank',
    ...extraArgs,
  ]
  const proc = spawn(CHROME_BIN, args, { stdio: ['ignore', 'ignore', 'pipe'] })
  let stderr = ''
  proc.stderr.on('data', (d) => { stderr += d.toString() })

  const base = `http://127.0.0.1:${port}`
  let version = null
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`${base}/json/version`)
      if (res.ok) { version = await res.json(); break }
    } catch { /* not up yet */ }
    await sleep(100)
  }
  if (!version) {
    proc.kill('SIGKILL')
    throw new Error(`Chrome did not expose CDP on ${port}. stderr:\n${stderr.slice(-2000)}`)
  }

  async function connect(wsUrl) {
    const ws = new WebSocket(wsUrl)
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true })
      ws.addEventListener('error', () => rej(new Error(`WS connect failed: ${wsUrl}`)), { once: true })
    })
    let nextId = 1
    const pending = new Map()
    const listeners = new Map()
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString())
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id)
        pending.delete(msg.id)
        if (msg.error) reject(new Error(`${msg.error.message} (${JSON.stringify(msg.error.data ?? '')})`))
        else resolve(msg.result)
      } else if (msg.method) {
        for (const fn of listeners.get(msg.method) || []) fn(msg.params)
      }
    })
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
      const id = nextId++
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
    })
    return {
      send,
      on(method, fn) {
        if (!listeners.has(method)) listeners.set(method, [])
        listeners.get(method).push(fn)
      },
      close: () => ws.close(),
    }
  }

  // Attach to the about:blank target that the initial page created.
  const targets = await (await fetch(`${base}/json/list`)).json()
  const page = targets.find((t) => t.type === 'page')
  if (!page) throw new Error('no page target')
  const client = await connect(page.webSocketDebuggerUrl)

  return {
    port,
    base,
    proc,
    client,
    userDataDir,
    async newPage(url = 'about:blank') {
      const { targetId } = await client.send('Target.createTarget', { url })
      const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true })
      const send = (method, params) => client.send(method, params, sessionId)
      await send('Page.enable')
      await send('Runtime.enable')
      return {
        sessionId,
        targetId,
        send,
        close: async () => { try { await client.send('Target.closeTarget', { targetId }) } catch {} },
      }
    },
    async close() {
      try { client.close() } catch {}
      proc.kill('SIGTERM')
      await sleep(300)
      if (!proc.killed) proc.kill('SIGKILL')
      try { rmSync(userDataDir, { recursive: true, force: true }) } catch {}
    },
  }
}
