import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const ENTITY_TYPE_ALIASES = new Map([
  ['scenic_spot', 'spot'],
  ['spot', 'spot'],
  ['poet', 'poet'],
  ['poem', 'poem'],
  ['cultural_item', 'cultural_item'],
  ['event', 'event'],
  ['dynasty', 'dynasty'],
  ['source_document', 'source_document'],
])

const REQUIRED_EVALUATION_CATEGORIES = [
  'poet',
  'poem',
  'spot',
  'city',
  'cultural_item',
  'event',
  'relation',
  'no_data',
  'context',
]

export const EVALUATION_REPORT_SCHEMA_VERSION = 1

// Keep this list small and stable so dashboards and downstream reports can
// group failures without parsing free-form provider messages.
export const EVALUATION_ERROR_TYPES = Object.freeze([
  'timeout',
  'network',
  'http',
  'protocol',
  'upstream',
  'unknown',
])

export function normalizeEntityType(type) {
  const normalized = String(type ?? '').trim().toLowerCase()
  return ENTITY_TYPE_ALIASES.get(normalized) ?? normalized
}

export function classifyError(error) {
  const text = String(error?.message ?? error ?? '').trim().toLowerCase()
  if (!text) return 'unknown'
  if (/(?:timeout|timed out|abort(?:ed)?|超时)/i.test(text)) return 'timeout'
  if (/^http\s+\d{3}\b|\bstatus\s*[:=]?\s*\d{3}\b/i.test(text)) return 'http'
  if (/(?:sse|content[- ]?type|done event|valid delta|响应为空|响应缺少)/i.test(text)) return 'protocol'
  if (/(?:upstream|provider|model|llm|上游|模型)/i.test(text)) return 'upstream'
  if (/(?:fetch|network|connect|socket|econn|enotfound|dns|网络|连接)/i.test(text)) return 'network'
  return 'unknown'
}

export function normalizeErrorType(type, error = null) {
  const normalized = String(type ?? '').trim().toLowerCase()
  return EVALUATION_ERROR_TYPES.includes(normalized)
    ? normalized
    : error
      ? classifyError(error)
      : 'unknown'
}

export function sanitizeErrorDetail(error) {
  if (error === null || error === undefined || error === '') return null
  let text = String(error?.message ?? error)
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
  // Error bodies can contain provider credentials. Keep a useful diagnostic
  // while removing common bearer/key/token forms before writing a report.
  text = text
    .replace(/(authorization\s*:\s*bearer\s+)[^\s,;]+/ig, '$1[REDACTED]')
    .replace(/(bearer\s+)[^\s,;]+/ig, '$1[REDACTED]')
    .replace(/((?:api[-_ ]?key|token|secret|password)\s*[:=]\s*["']?)[^\s,;"']+/ig, '$1[REDACTED]')
  return text.slice(0, 300)
}

export function parseSseEvents(raw) {
  const events = []
  const blocks = String(raw ?? '').replaceAll('\r\n', '\n').split('\n\n')
  for (const block of blocks) {
    if (!block.trim()) continue
    let event = 'message'
    const dataLines = []
    for (const line of block.split('\n')) {
      if (!line || line.startsWith(':')) continue
      if (line.startsWith('event:')) event = line.slice(6).trim() || 'message'
      if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
    }
    if (!dataLines.length) continue
    const text = dataLines.join('\n')
    let data
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
    events.push({ event, data })
  }
  return events
}

function asSourceIds(evidence) {
  return new Set(
    (evidence ?? []).flatMap((item) => Array.isArray(item?.sourceIds) ? item.sourceIds : [])
      .filter((id) => id !== null && id !== undefined && String(id).trim())
      .map((id) => String(id)),
  )
}

function contextTerms(context) {
  if (!context || typeof context !== 'object') return []
  const termKeys = new Set(['city', 'region', 'title', 'name', 'slug'])
  return Object.entries(context)
    .filter(([key, value]) => termKeys.has(key) && typeof value === 'string' && value.trim())
    .map(([, value]) => value.trim())
}

function contextEntityIds(context) {
  if (!context || typeof context !== 'object') return new Set()
  return new Set(Object.entries(context)
    .filter(([key, value]) => (key === 'entityId' || key.endsWith('Id')) && /^\d+$/.test(String(value ?? '').trim()))
    .map(([, value]) => String(value).trim()))
}

export function inferContextHit(item, answer, evidence = []) {
  if (item?.category !== 'context') return null
  const terms = [
    ...(Array.isArray(item.contextTerms) ? item.contextTerms : []),
    ...contextTerms(item.context),
  ]
  if (terms.length) return terms.some((term) => String(answer ?? '').includes(term))
  const entityIds = contextEntityIds(item.context)
  if (entityIds.size) {
    const contextType = normalizeEntityType(item.context?.type)
    return evidence.some((entry) => entityIds.has(String(entry?.entityId))
      && (!contextType || normalizeEntityType(entry?.entityType) === contextType))
  }
  return evidence.length > 0 || String(answer ?? '').includes('当前')
}

export function evaluateCase(item, observation) {
  const evidence = Array.isArray(observation?.evidence) ? observation.evidence : []
  const evidenceEntities = evidence
    .map((entry) => ({
      entityType: normalizeEntityType(entry?.entityType),
      entityId: entry?.entityId ?? null,
    }))
    .filter((entry) => entry.entityType || entry.entityId !== null)
  const expectedTypes = new Set((item.expectedEntityTypes ?? []).map(normalizeEntityType))
  const actualTypes = new Set(evidenceEntities.map((entry) => entry.entityType).filter(Boolean))
  // Source links are first-class evidence even though the API returns them on
  // an entity snippet rather than as a separate source_document item.
  if (evidence.some((entry) => asSourceIds([entry]).size > 0)) actualTypes.add('source_document')
  const evidenceHit = expectedTypes.size === 0
    ? evidence.length === 0
    : [...expectedTypes].every((type) => actualTypes.has(type))
  const requiredSources = (item.mustCiteSourceIds ?? []).map((id) => String(id))
  const availableSources = asSourceIds(evidence)
  const matchedSourceIds = requiredSources.filter((id) => availableSources.has(id))
  const citationCovered = requiredSources.length === 0 || matchedSourceIds.length > 0
  const answer = String(observation?.answer ?? '')
  const matchedForbiddenClaims = (item.forbiddenClaims ?? [])
    .filter((claim) => claim && answer.includes(claim))
  const forbiddenClaim = matchedForbiddenClaims.length > 0
  const error = sanitizeErrorDetail(observation?.error)
  const success = !error
  return {
    id: item.id,
    category: item.category,
    success,
    error,
    errorType: success ? null : normalizeErrorType(observation?.errorType, error),
    answer,
    evidenceCount: evidence.length,
    evidenceEntities,
    citedSourceIds: [...availableSources],
    matchedSourceIds,
    evidenceHit,
    citationCovered,
    forbiddenClaim,
    matchedForbiddenClaims,
    contextHit: observation?.contextHit ?? inferContextHit(item, answer, evidence),
    latencyMs: Number.isFinite(observation?.latencyMs) ? observation.latencyMs : null,
  }
}

const rate = (items, predicate) => items.length ? items.filter(predicate).length / items.length : null

export function summarizeResults(results) {
  const all = Array.isArray(results) ? results : []
  const contextual = all.filter((result) => result.category === 'context'
    || (result.contextHit !== null && result.contextHit !== undefined))
  const successful = all.filter((result) => result.success)
  const latencies = all.map((result) => result.latencyMs).filter((value) => Number.isFinite(value))
  const failureTypes = Object.fromEntries(EVALUATION_ERROR_TYPES.map((type) => [type, 0]))
  const failedCaseIds = []
  all.forEach((result) => {
    if (result.success) return
    const type = normalizeErrorType(result.errorType, result.error)
    failureTypes[type] += 1
    if (result.id !== undefined && result.id !== null) failedCaseIds.push(String(result.id))
  })
  return {
    total: all.length,
    success: successful.length,
    errors: all.length - successful.length,
    // Failed requests remain in the denominator so partial outages cannot inflate quality.
    errorRate: rate(all, (result) => !result.success),
    failureTypes,
    failedCaseIds,
    evidenceHitRate: rate(all, (result) => result.success && result.evidenceHit),
    citationCoverageRate: rate(all, (result) => result.success && result.citationCovered),
    forbiddenClaimRate: rate(all, (result) => result.success && result.forbiddenClaim),
    contextHitRate: rate(contextual, (result) => result.success && result.contextHit),
    averageLatencyMs: latencies.length
      ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
      : null,
  }
}

export function buildRequest(item) {
  return {
    message: item.question,
    history: [],
    context: item.context ?? { type: 'map' },
  }
}

export function applySourceMap(item, sourceMap) {
  if (!sourceMap || typeof sourceMap !== 'object') return item
  return {
    ...item,
    mustCiteSourceIds: (item.mustCiteSourceIds ?? []).map((id) => sourceMap[String(id)] ?? id),
  }
}

export async function runCase(baseUrl, item, { timeoutMs = 70000, fetchImpl = fetch } = {}) {
  const startedAt = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/api/public/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
      body: JSON.stringify(buildRequest(item)),
      signal: controller.signal,
    })
    const body = await response.text()
    const events = parseSseEvents(body)
    const evidence = events
      .filter((entry) => entry.event === 'evidence' && entry.data && typeof entry.data === 'object')
      .flatMap((entry) => Array.isArray(entry.data.items) ? entry.data.items : [])
    const answer = events
      .filter((entry) => entry.event === 'delta' && entry.data && typeof entry.data === 'object')
      .map((entry) => typeof entry.data.delta === 'string' ? entry.data.delta : '')
      .join('')
    const errorEvent = events.find((entry) => entry.event === 'error')
    let error = !response.ok
      ? `HTTP ${response.status}: ${body.slice(0, 300)}`
      : typeof errorEvent?.data === 'string'
        ? errorEvent.data
        : errorEvent?.data?.error ?? null
    let errorType = !response.ok
      ? 'http'
      : errorEvent
        ? 'upstream'
        : null
    if (!error && response.ok) {
      const contentType = getResponseHeader(response, 'content-type')
      if (!isEventStreamContentType(contentType)) {
        error = `响应 Content-Type 不是 text/event-stream：${contentType || '缺失'}`
        errorType = 'protocol'
      } else if (events.length === 0) {
        error = 'SSE 响应为空'
        errorType = 'protocol'
      } else if (!hasDoneEvent(events)) {
        error = 'SSE 响应缺少 done 事件'
        errorType = 'protocol'
      } else if (!hasValidDelta(events)) {
        error = 'SSE 响应缺少有效 delta'
        errorType = 'protocol'
      }
    }
    const observation = {
      answer,
      evidence,
      error,
      errorType,
      contextHit: inferContextHit(item, answer, evidence),
      latencyMs: Date.now() - startedAt,
    }
    return evaluateCase(item, observation)
  } catch (error) {
    return evaluateCase(item, {
      answer: '',
      evidence: [],
      contextHit: null,
      latencyMs: Date.now() - startedAt,
      error: error?.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : String(error?.message ?? error),
      errorType: error?.name === 'AbortError' ? 'timeout' : 'network',
    })
  } finally {
    clearTimeout(timeout)
  }
}

function getResponseHeader(response, name) {
  const headers = response?.headers
  if (!headers) return ''
  if (typeof headers.get === 'function') return String(headers.get(name) ?? '')
  return String(headers[name] ?? headers[name.toLowerCase()] ?? '')
}

function isEventStreamContentType(contentType) {
  return /^text\/event-stream(?:\s*;|\s*$)/i.test(String(contentType ?? '').trim())
}

function hasDoneEvent(events) {
  return events.some((entry) => entry.event === 'done'
    && entry.data && typeof entry.data === 'object'
    && entry.data.done === true)
}

function hasValidDelta(events) {
  return events.some((entry) => entry.event === 'delta'
    && entry.data && typeof entry.data === 'object'
    && typeof entry.data.delta === 'string'
    && entry.data.delta.trim().length > 0)
}

export async function loadFixture(fixturePath) {
  const raw = await fs.readFile(fixturePath, 'utf8')
  const fixture = JSON.parse(raw)
  if (!Array.isArray(fixture) || fixture.length !== 54) {
    throw new Error('评估集必须是恰好 54 题的 JSON 数组')
  }
  const ids = new Set()
  fixture.forEach((item, index) => validateFixtureItem(item, index, ids))
  const categories = new Set(fixture.map((item) => item.category))
  const missingCategories = REQUIRED_EVALUATION_CATEGORIES.filter((category) => !categories.has(category))
  if (missingCategories.length) {
    throw new Error(`评估集必须覆盖类别：${missingCategories.join(', ')}`)
  }
  return fixture
}

export async function validateFixtureContract(fixturePath) {
  const fixture = await loadFixture(fixturePath)
  const categoryCounts = Object.fromEntries(REQUIRED_EVALUATION_CATEGORIES.map((category) => [category, 0]))
  fixture.forEach((item) => {
    categoryCounts[item.category] = (categoryCounts[item.category] ?? 0) + 1
  })
  return {
    valid: true,
    fixturePath: path.resolve(fixturePath),
    fixtureSize: fixture.length,
    categoryCounts,
    evaluationSetHash: await hashFile(fixturePath),
  }
}

function validateFixtureItem(item, index, ids) {
  const prefix = `评估集第 ${index + 1} 题`
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw new Error(`${prefix}必须是对象`)
  }
  if (typeof item.id !== 'string' || !item.id.trim()) {
    throw new Error(`${prefix}必须有非空字符串 id`)
  }
  if (ids.has(item.id)) throw new Error('题目 ID 必须唯一')
  ids.add(item.id)
  if (typeof item.category !== 'string' || !item.category.trim()) {
    throw new Error(`${prefix}必须有非空 category`)
  }
  if (typeof item.question !== 'string' || !item.question.trim()) {
    throw new Error(`${prefix}必须有非空 question`)
  }
  if (!Array.isArray(item.expectedEntityTypes)) {
    throw new Error(`${prefix}的 expectedEntityTypes 必须是数组`)
  }
  if (item.expectedEntityTypes.some((type) => typeof type !== 'string' || !type.trim())) {
    throw new Error(`${prefix}的 expectedEntityTypes 只能包含非空字符串`)
  }
  if (!Array.isArray(item.mustCiteSourceIds)) {
    throw new Error(`${prefix}的 mustCiteSourceIds 必须是数组`)
  }
  if (item.mustCiteSourceIds.some((id) => !isPositiveInteger(id))) {
    throw new Error(`${prefix}的 mustCiteSourceIds 只能包含正整数`)
  }
  if (!Array.isArray(item.forbiddenClaims)) {
    throw new Error(`${prefix}的 forbiddenClaims 必须是数组`)
  }
  if (item.forbiddenClaims.some((claim) => typeof claim !== 'string' || !claim.trim())) {
    throw new Error(`${prefix}的 forbiddenClaims 只能包含非空字符串`)
  }
  if (typeof item.allowUnknown !== 'boolean') {
    throw new Error(`${prefix}的 allowUnknown 必须是布尔值`)
  }
  if (item.category === 'context'
    && (!item.context || typeof item.context !== 'object' || Array.isArray(item.context)
      || typeof item.context.type !== 'string' || !item.context.type.trim())) {
    throw new Error(`${prefix}的 context 题必须声明非空 context.type`)
  }
}

function isPositiveInteger(value) {
  if (typeof value === 'number') return Number.isInteger(value) && value > 0
  return typeof value === 'string' && /^[1-9]\d*$/.test(value.trim())
}

export async function runEvaluation({ baseUrl, fixturePath, outputPath, sourceMap = null,
  sourceMapPath = null, timeoutMs = 70000, delayMs = 0, limit = 0, metadata = {},
  overwrite = false, fetchImpl = fetch }) {
  const fixture = await loadFixture(fixturePath)
  const cases = limit > 0 ? fixture.slice(0, limit) : fixture
  const results = []
  for (const item of cases) {
    results.push(await runCase(baseUrl, applySourceMap(item, sourceMap), { timeoutMs, fetchImpl }))
    if (delayMs > 0 && item !== cases.at(-1)) await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  const summary = summarizeResults(results)
  const qualityGates = qualityGate(summary)
  const fullFixtureRun = cases.length === fixture.length
  const report = {
    schemaVersion: EVALUATION_REPORT_SCHEMA_VERSION,
    runStatus: !fullFixtureRun
      ? 'partial'
      : Object.values(qualityGates).every(Boolean)
        ? 'passed'
        : 'failed',
    generatedAt: new Date().toISOString(),
    baseUrl,
    fixturePath: path.resolve(fixturePath),
    fixtureSize: fixture.length,
    evaluated: cases.length,
    sourceMapPath: sourceMapPath ? path.resolve(sourceMapPath) : null,
    metadata: await buildReportMetadata({ fixturePath, sourceMap, sourceMapPath, metadata }),
    qualityGates,
    summary,
    results,
  }
  await writeEvaluationReport(outputPath, report, { overwrite })
  return report
}

export async function writeEvaluationReport(outputPath, report, { overwrite = false } = {}) {
  if (typeof outputPath !== 'string' || !outputPath.trim()) {
    throw new Error('评估结果路径不能为空')
  }
  const targetPath = path.resolve(outputPath)
  const parentPath = path.dirname(targetPath)
  await ensurePrivateOutputDirectory(parentPath)

  let existing = null
  try {
    existing = await fs.lstat(targetPath)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
  if (existing?.isSymbolicLink()) {
    throw new Error(`评估结果路径不能是符号链接：${targetPath}`)
  }
  if (existing && !overwrite) {
    throw new Error(`评估结果已存在，默认拒绝覆盖：${targetPath}`)
  }

  const temporaryPath = path.join(
    parentPath,
    `.${path.basename(targetPath)}.${process.pid}.${crypto.randomBytes(8).toString('hex')}.tmp`,
  )
  const serialized = `${JSON.stringify(report, null, 2)}\n`
  let handle = null
  try {
    handle = await fs.open(temporaryPath, 'wx', 0o600)
    await handle.writeFile(serialized, 'utf8')
    await handle.chmod(0o600)
    await handle.sync()
    await handle.close()
    handle = null
    if (overwrite) {
      await fs.rename(temporaryPath, targetPath)
    } else {
      // A hard-link create is atomic and refuses an unexpected concurrent
      // writer, preserving the no-overwrite guarantee.
      await fs.link(temporaryPath, targetPath)
      await fs.unlink(temporaryPath)
    }
    await fs.chmod(targetPath, 0o600)
  } finally {
    if (handle) await handle.close().catch(() => {})
    await fs.unlink(temporaryPath).catch(() => {})
  }
  return targetPath
}

async function ensurePrivateOutputDirectory(directoryPath) {
  let existing = null
  try {
    existing = await fs.lstat(directoryPath)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
  if (existing?.isSymbolicLink()) {
    throw new Error(`评估结果目录不能是符号链接：${directoryPath}`)
  }
  if (existing && !existing.isDirectory()) {
    throw new Error(`评估结果目录不是目录：${directoryPath}`)
  }
  await fs.mkdir(directoryPath, { recursive: true, mode: 0o700 })
  if (!existing) await fs.chmod(directoryPath, 0o700)
}

export function qualityGate(summary) {
  return {
    noErrors: summary.errors === 0,
    evidenceHit: summary.evidenceHitRate !== null && summary.evidenceHitRate >= 0.9,
    citationCoverage: summary.citationCoverageRate !== null && summary.citationCoverageRate >= 0.85,
    forbiddenClaims: summary.forbiddenClaimRate !== null && summary.forbiddenClaimRate < 0.1,
    contextHit: summary.contextHitRate !== null && summary.contextHitRate >= 0.9,
  }
}

export function allQualityGatesPass(summary, expectedTotal = null) {
  if (expectedTotal !== null && summary?.total !== expectedTotal) return false
  return Object.values(qualityGate(summary)).every(Boolean)
}

export async function buildReportMetadata({ fixturePath, sourceMap = null, sourceMapPath = null,
  metadata = {} } = {}) {
  const fixtureHash = await hashFile(fixturePath)
  const sourceMapHash = sourceMapPath
    ? await hashFile(sourceMapPath)
    : sourceMap
      ? sha256(stableStringify(sourceMap))
      : null
  return {
    model: metadata.model ?? process.env.LLM_MODEL ?? null,
    commit: metadata.commit ?? process.env.GIT_COMMIT ?? await currentGitCommit(),
    evaluationSetHash: fixtureHash,
    sourceMapHash,
    databaseSnapshot: metadata.databaseSnapshot ?? process.env.SJG_DB_SNAPSHOT ?? null,
    operator: metadata.operator ?? process.env.SJG_AI_EVAL_OPERATOR ?? process.env.USER ?? null,
  }
}

async function hashFile(filePath) {
  const content = await fs.readFile(filePath)
  return sha256(content)
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

async function currentGitCommit() {
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'])
    return stdout.trim() || null
  } catch {
    return null
  }
}
