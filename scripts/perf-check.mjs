import fs from 'node:fs/promises'
const base = process.argv[2] || 'http://localhost:8080'
const url = new URL(base)
if (
  !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
  process.env.ALLOW_REMOTE_BENCHMARK !== '1'
) {
  throw new Error('Remote load requires explicit ALLOW_REMOTE_BENCHMARK=1')
}
const paths = ['/actuator/health', '/api/public/poems?page=1&size=20']
const reports = []
for (const path of paths) {
  const times = []
  for (let batch = 0; batch < 20; batch++) {
    await Promise.all(
      Array.from({ length: 5 }, async () => {
        const start = performance.now()
        const response = await fetch(new URL(path, url), { signal: AbortSignal.timeout(10000) })
        await response.text()
        if (!response.ok) throw new Error(`Benchmark failed: ${path} HTTP ${response.status}`)
        times.push(performance.now() - start)
      }),
    )
  }
  times.sort((a, b) => a - b)
  reports.push({ path, requests: times.length, concurrency: 5, p50Ms: times[49], p95Ms: times[94] })
}
await fs.mkdir('.local/quality', { recursive: true })
await fs.writeFile(
  '.local/quality/api-performance.json',
  JSON.stringify({ date: new Date().toISOString(), base, reports }, null, 2),
)
console.log(reports)
if (reports.some((report) => report.p95Ms > Number(process.env.API_P95_BUDGET_MS || 1000)))
  process.exitCode = 1
