import fs from 'node:fs/promises'
const base = process.env.SJG_SCHEMA_BASE_URL || 'http://localhost:8080'
const token = process.env.SJG_SCHEMA_ADMIN_TOKEN
if (!token) throw new Error('Provide SJG_SCHEMA_ADMIN_TOKEN from an approved admin login')
const response = await fetch(new URL('/v3/api-docs', base), {
  headers: { Authorization: `Bearer ${token}` },
  signal: AbortSignal.timeout(10000),
})
if (!response.ok) throw new Error(`OpenAPI export failed: HTTP ${response.status}`)
const schema = await response.json()
if (!schema.openapi || !schema.paths) throw new Error('Invalid OpenAPI document')
await fs.mkdir('.local/quality', { recursive: true })
await fs.writeFile('.local/quality/openapi.json', JSON.stringify(schema, null, 2))
console.log('Generated .local/quality/openapi.json from the running backend')
