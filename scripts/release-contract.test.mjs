import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {
  releaseOrder,
  validateReleaseConfig,
  frontendEnvironment,
  relocateSharedLock,
  backendUploadSpec,
  injectBackendRuntime,
} from './release-lib.mjs'

const config = JSON.parse(await fs.readFile(new URL('../ops/release.json', import.meta.url)))
test('native Railway runtime injection preserves imported database and secret policy', () => {
  const source =
    'export default function() {\n const MySQL = mysql("MySQL", {});\n const api = service("sjg-api", {healthcheck:"/old"});\n return {variables:{managed:false},resources:[MySQL,api]};\n}'
  const runtime = {
    healthcheckPath: '/actuator/health',
    preDeployCommand: ['java migration'],
    preDeployTimeoutSeconds: 180,
  }
  const generated = injectBackendRuntime(source, 'sjg-api', runtime)
  assert.ok(generated.includes('MySQL = mysql("MySQL", {})'))
  assert.ok(generated.includes('variables:{managed:false}'))
  assert.ok(generated.includes('api.deploy ='))
  assert.ok(generated.includes('"preDeployCommand":["java migration"]'))
  assert.throws(() => injectBackendRuntime(source, 'wrong-service', runtime), /not found/)
})
test('native SDK project-return imports retain their wrapper after injection', () => {
  const source =
    'export default defineRailway(() => {\n const api = service("sjg-api", {});\n return project("sjg", {variables:{managed:false},resources:[api]});\n});'
  const value = injectBackendRuntime(source, 'sjg-api', { healthcheckPath: '/actuator/health' })
  assert.ok(value.includes('return project("sjg",'))
  assert.ok(value.includes('api.deploy ='))
})
test('Railway discovers railway.json from the backend snapshot directory', () => {
  const upload = backendUploadSpec('/isolated/source')
  assert.equal(upload.cwd, '/isolated/source/backend')
  assert.equal(upload.path, '.')
  assert.ok(upload.flags.includes('--no-gitignore'))
})
test('dependency order places the database before backend and display after datav', () => {
  assert.deepEqual(releaseOrder(config), ['mysql', 'backend', 'sjg-datav', 'admin-frontend', 'display-v2'])
  const cycle = structuredClone(config)
  cycle.services.mysql.dependsOn = ['display-v2']
  assert.throws(() => releaseOrder(cycle), /cycle/)
})
test('production targets require HTTPS, known dependencies and unique Site identities', () => {
  assert.doesNotThrow(() => validateReleaseConfig(config))
  for (const update of [
    (c) => {
      c.services.backend.url = 'http://localhost:8080'
    },
    (c) => {
      c.services.backend.dependsOn = ['missing']
    },
    (c) => {
      c.services['display-v2'].projectId = c.services['sjg-datav'].projectId
    },
  ]) {
    const invalid = structuredClone(config)
    update(invalid)
    assert.throws(() => validateReleaseConfig(invalid))
  }
})
test('frontend build variables are the same public origins and cannot contain backend secrets', () => {
  const env = frontendEnvironment(config)
  assert.equal(env.VITE_BACKEND_URL, config.services.backend.url)
  assert.equal(env.VITE_DATAV_URL, config.services['sjg-datav'].url)
  assert.deepEqual(Object.keys(env).sort(), ['VITE_BACKEND_URL', 'VITE_DATAV_URL', 'VITE_OSS_BUCKET_URL'])
})
test('standalone Sites source retains a valid local shared package lock', () => {
  const original = {
    packages: {
      '': { dependencies: { '@sjg/shared': 'file:../shared' } },
      '../shared': { name: '@sjg/shared', version: '1.0.0' },
      'node_modules/@sjg/shared': { resolved: '../shared', link: true },
    },
  }
  const relocated = relocateSharedLock(original)
  assert.equal(relocated.packages[''].dependencies['@sjg/shared'], 'file:./shared')
  assert.equal(relocated.packages['node_modules/@sjg/shared'].resolved, 'shared')
  assert.equal(relocated.packages.shared.name, '@sjg/shared')
  assert.equal(original.packages['node_modules/@sjg/shared'].resolved, '../shared')
})
