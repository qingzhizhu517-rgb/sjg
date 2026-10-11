import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { readJournal, writeJournal } from './release-journal.mjs'

test('a stale release writer cannot erase another service publication receipt', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sjg-release-journal-'))
  const file = path.join(directory, 'release.json')
  await writeJournal(file, { services: {} })
  const datav = await readJournal(file),
    admin = await readJournal(file)
  datav.services.datav = { status: 'succeeded' }
  await writeJournal(file, datav)
  admin.services.admin = { status: 'succeeded' }
  await assert.rejects(writeJournal(file, admin), /changed/)
  const latest = await readJournal(file)
  assert.equal(latest.services.datav.status, 'succeeded')
  latest.services.admin = admin.services.admin
  await writeJournal(file, latest)
  assert.equal((await readJournal(file)).services.admin.status, 'succeeded')
})
