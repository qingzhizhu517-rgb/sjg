import test from 'node:test'
import assert from 'node:assert/strict'
import { SANDBOX_ASSETS } from '../src/config/sandboxAssets.js'
import { setupPage } from './helpers/componentSetup.js'

test('editor reports storage failures and always releases its busy state', async () => {
  const engine = {
    saveDraft: async () => {
      throw new Error('空间不足')
    },
  }
  const page = await setupPage('components/sandbox/SandboxEditor.vue', { SANDBOX_ASSETS }, { engine })
  await page.state.save()
  assert.equal(page.state.busy.value, false)
  assert.match(page.state.feedback.value, /空间不足/)
  page.dispose()
})

test('editor imports text through validation and preserves scene on rejected input', async () => {
  let calls = 0
  const engine = {
    importDraft: async (text) => {
      calls++
      assert.equal(text, '{bad}')
      throw new Error('草稿格式不正确')
    },
  }
  const page = await setupPage('components/sandbox/SandboxEditor.vue', { SANDBOX_ASSETS }, { engine })
  const event = { target: { files: [{ size: 6, text: async () => '{bad}' }], value: 'draft.json' } }
  await page.state.importFile(event)
  assert.equal(calls, 1)
  assert.match(page.state.feedback.value, /草稿格式不正确/)
  assert.equal(event.target.value, '')
  page.dispose()
})

test('editor refuses oversized imports before reading them', async () => {
  const engine = { importDraft: () => assert.fail('must not import') }
  const page = await setupPage('components/sandbox/SandboxEditor.vue', { SANDBOX_ASSETS }, { engine })
  await page.state.importFile({
    target: { files: [{ size: 6_000_000, text: () => assert.fail('must not read') }], value: 'big.json' },
  })
  assert.match(page.state.feedback.value, /5 MB/)
  page.dispose()
})
