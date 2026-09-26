import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

import {
  normalizeEntityType,
  applySourceMap,
  parseSseEvents,
  evaluateCase,
  inferContextHit,
  loadFixture,
  runCase,
  runEvaluation,
  summarizeResults,
  qualityGate,
  allQualityGatesPass,
  buildReportMetadata,
  classifyError,
  writeEvaluationReport,
} from './ai-eval.mjs'

test('parseSseEvents collects named events and multiline data', () => {
  const events = parseSseEvents([
    'event: evidence',
    'data: {"items":[{"entityType":"scenic_spot","sourceIds":[3]}]}',
    '',
    'event: delta',
    'data: {"delta":',
    'data: "第一行\\n第二行"}',
    '',
    'event: done',
    'data: {"done":true}',
    '',
  ].join('\n'))

  assert.equal(events.length, 3)
  assert.equal(events[0].event, 'evidence')
  assert.equal(events[1].data.delta, '第一行\n第二行')
  assert.equal(events[2].data.done, true)
})

test('evaluateCase measures evidence, citations and forbidden claims', () => {
  const result = evaluateCase(
    {
      id: 'spot-01',
      expectedEntityTypes: ['spot'],
      mustCiteSourceIds: [3],
      forbiddenClaims: ['杜撰名人题刻'],
      allowUnknown: false,
    },
    {
      answer: '大明湖相关资料见来源 3。',
      evidence: [{ entityType: 'scenic_spot', sourceIds: [3] }],
      error: null,
      latencyMs: 12,
    },
  )

  assert.equal(normalizeEntityType('scenic_spot'), 'spot')
  assert.equal(result.evidenceHit, true)
  assert.equal(result.citationCovered, true)
  assert.equal(result.forbiddenClaim, false)
  assert.equal(result.success, true)
})

test('evaluateCase records matched entities and treats linked sources as source evidence', () => {
  const result = evaluateCase(
    {
      id: 'spot-source-01',
      expectedEntityTypes: ['spot', 'source_document'],
      mustCiteSourceIds: [3],
      forbiddenClaims: ['虚构开放时间'],
    },
    {
      answer: '该景点的开放时间是每天八点，属于虚构开放时间。',
      evidence: [{ entityType: 'scenic_spot', entityId: 7, sourceIds: [3, 4] }],
      error: null,
      latencyMs: 12,
    },
  )

  assert.equal(result.evidenceHit, true)
  assert.deepEqual(result.evidenceEntities, [{ entityType: 'spot', entityId: 7 }])
  assert.deepEqual(result.citedSourceIds, ['3', '4'])
  assert.deepEqual(result.matchedSourceIds, ['3'])
  assert.deepEqual(result.matchedForbiddenClaims, ['虚构开放时间'])
})

test('evaluateCase requires every expected entity type to be represented', () => {
  const result = evaluateCase(
    {
      id: 'poem-compare',
      expectedEntityTypes: ['poem', 'spot'],
      mustCiteSourceIds: [],
      forbiddenClaims: [],
    },
    {
      answer: '只返回诗词证据。',
      evidence: [{ entityType: 'poem', entityId: 1 }],
      error: null,
    },
  )

  assert.equal(result.evidenceHit, false)
})

test('applySourceMap remaps fixture source ids without mutating the fixture', () => {
  const item = { id: 'p1', mustCiteSourceIds: [1, 2], expectedEntityTypes: [] }
  const mapped = applySourceMap(item, { '1': 31 })

  assert.deepEqual(mapped.mustCiteSourceIds, [31, 2])
  assert.deepEqual(item.mustCiteSourceIds, [1, 2])
})

test('summarizeResults keeps failed requests in quality denominators', () => {
  const summary = summarizeResults([
    { success: true, evidenceHit: true, citationCovered: true, forbiddenClaim: false, contextHit: true, latencyMs: 10 },
    { success: true, evidenceHit: false, citationCovered: true, forbiddenClaim: true, contextHit: false, latencyMs: 30 },
    { success: false, evidenceHit: false, citationCovered: false, forbiddenClaim: false, contextHit: null, latencyMs: 20 },
  ])

  assert.equal(summary.total, 3)
  assert.equal(summary.errors, 1)
  assert.equal(summary.errorRate, 1 / 3)
  assert.equal(summary.evidenceHitRate, 1 / 3)
  assert.equal(summary.citationCoverageRate, 2 / 3)
  assert.equal(summary.forbiddenClaimRate, 1 / 3)
  assert.equal(summary.contextHitRate, 0.5)
  assert.equal(summary.averageLatencyMs, 20)
})

test('inferContextHit accepts an entity id backed by returned evidence', () => {
  const hit = inferContextHit(
    {
      category: 'context',
      context: { type: 'poem', poemId: '1' },
    },
    '我会结合当前诗词说明。',
    [{ entityType: 'poem', entityId: 1 }],
  )

  assert.equal(hit, true)
})

test('runCase treats a plain-text SSE error event as a failed request', async () => {
  const result = await runCase('http://example.test', { id: 'error-01', category: 'no_data' }, {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => 'text/event-stream; charset=UTF-8' },
      text: async () => 'event: error\ndata: upstream unavailable\n\n',
    }),
  })

  assert.equal(result.success, false)
  assert.equal(result.error, 'upstream unavailable')
})

test('runCase rejects a 200 response with an empty SSE body', async () => {
  const result = await runCase('http://example.test', { id: 'empty-01', category: 'no_data' }, {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => 'text/event-stream' },
      text: async () => '',
    }),
  })

  assert.equal(result.success, false)
  assert.match(result.error, /SSE/)
})

test('runCase rejects an SSE response without a done event or valid delta', async () => {
  const result = await runCase('http://example.test', { id: 'incomplete-01', category: 'no_data' }, {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => 'text/event-stream' },
      text: async () => 'event: delta\ndata: {"delta":"   "}\n\n',
    }),
  })

  assert.equal(result.success, false)
  assert.match(result.error, /done|delta/)
})

test('runCase rejects a successful response with the wrong content type', async () => {
  const result = await runCase('http://example.test', { id: 'content-type-01', category: 'no_data' }, {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      text: async () => JSON.stringify({ answer: 'not SSE' }),
    }),
  })

  assert.equal(result.success, false)
  assert.match(result.error, /Content-Type/)
})

test('runCase accepts a complete SSE response', async () => {
  const result = await runCase('http://example.test', { id: 'complete-01', category: 'no_data' }, {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => 'text/event-stream; charset=UTF-8' },
      text: async () => [
        'event: delta',
        'data: {"delta":"已核实"}',
        '',
        'event: done',
        'data: {"done":true}',
        '',
      ].join('\n'),
    }),
  })

  assert.equal(result.success, true)
  assert.equal(result.answer, '已核实')
})

test('quality gates fail when any request errors even if successful answers meet thresholds', () => {
  const summary = {
    total: 10,
    errors: 1,
    evidenceHitRate: 0.9,
    citationCoverageRate: 0.9,
    forbiddenClaimRate: 0,
    contextHitRate: 0.9,
  }

  assert.equal(qualityGate(summary).noErrors, false)
  assert.equal(allQualityGatesPass(summary), false)
})

test('quality gates reject a partial run when a full fixture is required', () => {
  const summary = {
    total: 1,
    errors: 0,
    evidenceHitRate: 1,
    citationCoverageRate: 1,
    forbiddenClaimRate: 0,
    contextHitRate: 1,
  }

  assert.equal(allQualityGatesPass(summary, 54), false)
  assert.equal(allQualityGatesPass({ ...summary, total: 54 }, 54), true)
})

test('summarizeResults counts failed context cases in the context denominator', () => {
  const summary = summarizeResults([
    { category: 'context', success: true, evidenceHit: true, citationCovered: true, forbiddenClaim: false, contextHit: true },
    { category: 'context', success: false, evidenceHit: false, citationCovered: false, forbiddenClaim: false, contextHit: null },
  ])

  assert.equal(summary.contextHitRate, 0.5)
})

test('buildReportMetadata records hashes and execution provenance', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sjg-ai-meta-'))
  const fixturePath = path.join(directory, 'fixture.json')
  const sourceMapPath = path.join(directory, 'source-map.json')
  await fs.writeFile(fixturePath, '[{"id":"one"}]\n')
  await fs.writeFile(sourceMapPath, '{"1":31}\n')

  const metadata = await buildReportMetadata({
    fixturePath,
    sourceMapPath,
    metadata: {
      model: 'test-model',
      commit: 'deadbeef',
      databaseSnapshot: 'snapshot-2026-09-10',
      operator: 'tester',
    },
  })

  assert.equal(metadata.model, 'test-model')
  assert.equal(metadata.commit, 'deadbeef')
  assert.equal(metadata.databaseSnapshot, 'snapshot-2026-09-10')
  assert.equal(metadata.operator, 'tester')
  assert.match(metadata.evaluationSetHash, /^[a-f0-9]{64}$/)
  assert.match(metadata.sourceMapHash, /^[a-f0-9]{64}$/)
  await fs.rm(directory, { recursive: true, force: true })
})

test('loadFixture rejects a regression set that is not exactly 54 questions', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sjg-ai-eval-'))
  const fixturePath = path.join(directory, 'fixture.json')
  await fs.writeFile(fixturePath, JSON.stringify(Array.from({ length: 53 }, (_, index) => ({ id: String(index) }))))

  await assert.rejects(loadFixture(fixturePath), /54 题/)
  await fs.rm(directory, { recursive: true, force: true })
})

test('loadFixture rejects duplicate or incomplete question contracts', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sjg-ai-contract-'))
  const fixturePath = path.join(directory, 'fixture.json')
  const fixture = Array.from({ length: 54 }, (_, index) => ({
    id: index === 53 ? 'question-0' : `question-${index}`,
    category: 'poet',
    question: `问题 ${index}`,
    expectedEntityTypes: [],
    mustCiteSourceIds: [],
    forbiddenClaims: [],
    allowUnknown: true,
  }))
  await fs.writeFile(fixturePath, JSON.stringify(fixture))

  await assert.rejects(loadFixture(fixturePath), /题目 ID 必须唯一/)
  await fs.rm(directory, { recursive: true, force: true })
})

test('loadFixture requires every evaluation category', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sjg-ai-categories-'))
  const fixturePath = path.join(directory, 'fixture.json')
  const fixture = Array.from({ length: 54 }, (_, index) => ({
    id: `question-${index}`,
    category: 'poet',
    question: `问题 ${index}`,
    expectedEntityTypes: [],
    mustCiteSourceIds: [],
    forbiddenClaims: [],
    allowUnknown: true,
  }))
  await fs.writeFile(fixturePath, JSON.stringify(fixture))

  await assert.rejects(loadFixture(fixturePath), /类别|category/)
  await fs.rm(directory, { recursive: true, force: true })
})

test('run-ai-eval refuses an enabled run without complete LLM configuration', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sjg-ai-runner-'))
  const env = {
    ...process.env,
    SJG_AI_EVAL_ENABLED: 'true',
    LLM_API_KEY: 'test-secret-that-must-not-be-printed',
    LLM_BASE_URL: '   ',
    LLM_MODEL: '',
    SJG_AI_EVAL_FIXTURE: path.join(directory, 'missing-fixture.json'),
    SJG_AI_EVAL_OUTPUT: path.join(directory, 'report.json'),
  }

  await assert.rejects(
    execFileAsync('bash', [path.resolve('scripts/run-ai-eval.sh')], {
      cwd: path.resolve('.'),
      env,
    }),
    (error) => {
      assert.equal(error.code, 2)
      assert.match(error.stderr, /LLM_BASE_URL/)
      assert.match(error.stderr, /LLM_MODEL/)
      assert.doesNotMatch(`${error.stdout}\n${error.stderr}`, /test-secret-that-must-not-be-printed/)
      return true
    },
  )

  await fs.rm(directory, { recursive: true, force: true })
})

test('failed cases expose a stable error type and summaries group failures by type', () => {
  const result = evaluateCase(
    {
      id: 'network-01',
      category: 'no_data',
      expectedEntityTypes: [],
      mustCiteSourceIds: [],
      forbiddenClaims: [],
      allowUnknown: true,
    },
    {
      answer: '',
      evidence: [],
      error: 'fetch failed: ECONNREFUSED',
      errorType: 'network',
    },
  )

  assert.equal(result.success, false)
  assert.equal(result.errorType, 'network')
  const summary = summarizeResults([result])
  assert.equal(summary.failureTypes.network, 1)
  assert.equal(summary.failureTypes.unknown, 0)
  assert.deepEqual(summary.failedCaseIds, ['network-01'])
})

test('runCase classifies protocol failures and never persists a bearer token in the error detail', async () => {
  const result = await runCase('http://example.test', { id: 'protocol-01', category: 'no_data' }, {
    fetchImpl: async () => ({
      ok: false,
      status: 502,
      headers: { get: () => 'text/event-stream' },
      text: async () => 'upstream error Authorization: Bearer super-secret-token',
    }),
  })

  assert.equal(result.success, false)
  assert.equal(result.errorType, 'http')
  assert.doesNotMatch(result.error, /super-secret-token/)
  assert.match(result.error, /REDACTED/)
})

test('evaluation report has an explicit status and is atomically written with private permissions', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sjg-ai-report-'))
  const outputPath = path.join(directory, 'nested', 'report.json')
  const report = {
    schemaVersion: 1,
    runStatus: 'failed',
    summary: { total: 1, errors: 1 },
    results: [{ id: 'one', success: false, errorType: 'network' }],
  }

  await writeEvaluationReport(outputPath, report)
  const saved = JSON.parse(await fs.readFile(outputPath, 'utf8'))
  assert.equal(saved.schemaVersion, 1)
  assert.equal(saved.runStatus, 'failed')
  const fileMode = (await fs.stat(outputPath)).mode & 0o777
  const directoryMode = (await fs.stat(path.dirname(outputPath))).mode & 0o777
  assert.equal(fileMode, 0o600)
  assert.equal(directoryMode, 0o700)

  await assert.rejects(
    writeEvaluationReport(outputPath, { ...report, runStatus: 'partial' }),
    /已存在|symlink|不能覆盖|overwrite/i,
  )
  await fs.rm(directory, { recursive: true, force: true })
})

test('classifyError uses stable categories for timeout, protocol, HTTP and network failures', () => {
  assert.equal(classifyError('timeout after 100ms'), 'timeout')
  assert.equal(classifyError('SSE 响应缺少 done 事件'), 'protocol')
  assert.equal(classifyError('HTTP 503'), 'http')
  assert.equal(classifyError('fetch failed: ECONNRESET'), 'network')
  assert.equal(classifyError('未知故障'), 'unknown')
})

test('run-ai-eval supports an offline full-fixture validation entry point', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sjg-ai-validate-'))
  const env = {
    ...process.env,
    SJG_AI_EVAL_ENABLED: 'false',
    SJG_AI_EVAL_VALIDATE_ONLY: 'true',
    SJG_AI_EVAL_FIXTURE: path.resolve('docs/ai-evaluation-set.json'),
    SJG_AI_EVAL_OUTPUT: path.join(directory, 'must-not-exist.json'),
  }

  const result = await execFileAsync('bash', [path.resolve('scripts/run-ai-eval.sh')], {
    cwd: path.resolve('.'),
    env,
  })

  assert.match(result.stdout, /54/) 
  await assert.rejects(fs.access(env.SJG_AI_EVAL_OUTPUT))
  await fs.rm(directory, { recursive: true, force: true })
})

test('offline fixture validation returns a non-zero status for an invalid fixture', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sjg-ai-invalid-'))
  const fixturePath = path.join(directory, 'invalid.json')
  await fs.writeFile(fixturePath, '[]')
  const result = await execFileAsync('node', [
    path.resolve('scripts/ai-eval-cli.mjs'),
    '--validate-only',
    '--fixture',
    fixturePath,
  ]).then(
    () => ({ code: 0, stdout: '', stderr: '' }),
    (error) => ({ code: error.code, stdout: error.stdout, stderr: error.stderr }),
  )

  assert.equal(result.code, 2)
  assert.match(result.stderr, /评估集校验失败/)
  await fs.rm(directory, { recursive: true, force: true })
})

test('runEvaluation writes a partial report contract without requiring a live server when a fetch implementation is supplied', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sjg-ai-run-eval-'))
  const outputPath = path.join(directory, 'report.json')
  let calls = 0
  const report = await runEvaluation({
    baseUrl: 'http://example.test',
    fixturePath: path.resolve('docs/ai-evaluation-set.json'),
    outputPath,
    limit: 1,
    fetchImpl: async () => {
      calls += 1
      return {
        ok: true,
        status: 200,
        headers: { get: () => 'text/event-stream' },
        text: async () => 'event: delta\ndata: {"delta":"已核实"}\n\nevent: done\ndata: {"done":true}\n\n',
      }
    },
  })

  assert.equal(calls, 1)
  assert.equal(report.schemaVersion, 1)
  assert.equal(report.runStatus, 'partial')
  assert.equal(report.evaluated, 1)
  assert.equal(report.summary.total, 1)
  assert.equal(report.results[0].errorType, null)
  assert.equal(JSON.parse(await fs.readFile(outputPath, 'utf8')).runStatus, 'partial')
  await fs.rm(directory, { recursive: true, force: true })
})
