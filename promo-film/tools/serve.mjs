// Tiny static server for the page harness. Serves the repo root so the harness can
// fetch .build/plan.json and .build/capture/*.png alongside the display-v2 artwork.
import { createServer } from 'node:http'
import { createReadStream, statSync } from 'node:fs'
import { extname, resolve, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(fileURLToPath(import.meta.url), '../../..')
const port = Number(process.env.SJG_FILM_PORT || 5199)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
}

const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0])
  const rel = normalize(url).replace(/^(\.\.[/\\])+/, '')
  const file = resolve(repoRoot, `.${rel}`)
  if (!file.startsWith(repoRoot)) {
    res.writeHead(403).end('forbidden')
    return
  }
  try {
    const st = statSync(file)
    if (st.isDirectory()) {
      res.writeHead(404).end('not found')
      return
    }
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    })
    createReadStream(file).pipe(res)
  } catch {
    res.writeHead(404).end('not found')
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`serving ${repoRoot} on http://127.0.0.1:${port}`)
  if (process.env.SJG_SERVER_ONCE === '1') setTimeout(() => process.exit(0), 120000)
})
