import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import {
  inspectMigrationText,
  inspectMigrationSet,
} from './migration-check.mjs'

test('inspectMigrationText accepts an idempotent migration with required tables', () => {
  const result = inspectMigrationText(
    'V29__learning_tasks.sql',
    'CREATE TABLE IF NOT EXISTS learning_task (id BIGINT);\nCREATE TABLE IF NOT EXISTS learning_submission (id BIGINT);',
    ['learning_task', 'learning_submission'],
  )

  assert.deepEqual(result.errors, [])
  assert.equal(result.version, 29)
})

test('inspectMigrationText rejects missing idempotence and destructive SQL', () => {
  const result = inspectMigrationText(
    'V27__content_provenance.sql',
    'DROP TABLE source_document; CREATE TABLE source_document (id BIGINT);',
    ['source_document'],
  )

  assert.ok(result.errors.some((error) => error.includes('IF NOT EXISTS')))
  assert.ok(result.errors.some((error) => error.includes('DROP')))
})

test('inspectMigrationSet validates the repository target migrations', async () => {
  const result = await inspectMigrationSet('backend/src/main/resources/db/migration')

  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.versions, [27, 28, 29, 30])
})

test('V27 initializes review records for every public historical entity domain', async () => {
  const text = await fs.readFile(
    'backend/src/main/resources/db/migration/V27__content_provenance.sql',
    'utf8',
  )

  for (const entityType of ['dynasty', 'poet', 'poem', 'scenic_spot', 'event']) {
    assert.match(text, new RegExp("SELECT ['\\\"]" + entityType + "['\\\"], id, 'needs_review'"))
  }
  assert.match(text, /TABLE_NAME\s*=\s*'cultural_item'/i)
  assert.match(text, /TABLE_NAME\s*=\s*'poem_analysis'/i)
})

test('V27 guards optional domains missing from older snapshots', async () => {
  const text = await fs.readFile(
    'backend/src/main/resources/db/migration/V27__content_provenance.sql',
    'utf8',
  )

  assert.match(text, /information_schema\.TABLES[\s\S]*cultural_item/i)
  assert.match(text, /information_schema\.TABLES[\s\S]*poem_analysis/i)
  assert.match(text, /PREPARE\s+\w+\s+FROM\s+@\w+/i)
})

test('accepts V30 idempotent data migration for poet relation governance', () => {
  const result = inspectMigrationText(
    'V30__poet_relation_provenance.sql',
    "INSERT INTO content_review (entity_type, entity_id) SELECT 'poet_relation', id FROM poet_relation ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;",
  )

  assert.deepEqual(result.errors, [])
})

test('V30 migration initializes poet relation review records without fabricating sources', async () => {
  const text = await fs.readFile(
    'backend/src/main/resources/db/migration/V30__poet_relation_provenance.sql',
    'utf8',
  )

  assert.match(text, /SELECT\s+'poet_relation'\s*,\s*id\s*,\s*'needs_review'/i)
  assert.match(text, /ON\s+DUPLICATE\s+KEY\s+UPDATE/i)
  assert.doesNotMatch(text, /content_source_link\s*\(/i)
})
