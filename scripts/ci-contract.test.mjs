import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const workflow = fs.readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8')

test('CI runs the platform-specific quality gates', () => {
  for (const command of [
    'npm run test:ai-eval',
    'npm run test:learning-task',
    'npm run test:admin-contract',
    'npm run test:migrations',
    'npm run check:migrations',
    'npm run test:content-ledger',
    'python3 scripts/apply_migration_test.py',
  ]) {
    assert.match(workflow, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      `CI must run ${command}`)
  }
})
