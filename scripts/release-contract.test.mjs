import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {
  releaseOrder,
  validateReleaseConfig,
  frontendEnvironment,
  relocateSharedLock,
} from './release-lib.mjs'

const config = JSON.parse(await fs.readFile(new URL('../ops/release.json', import.meta.url)))
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
