import process from 'node:process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { allQualityGatesPass, runEvaluation, validateFixtureContract } from './ai-eval.mjs'

function option(name, fallback) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : fallback
}

function defaultOutputPath() {
  const stamp = new Date().toISOString().replace(/[.:]/g, '').replace('Z', 'Z')
  return path.join('.local', 'ai-eval', `${stamp}-${process.pid}.json`)
}

const baseUrl = option('--base-url', 'http://localhost:8080')
const fixturePath = option('--fixture', 'docs/ai-evaluation-set.json')
const outputPath = option('--output', defaultOutputPath())
const sourceMapPath = option('--source-map', process.env.SJG_AI_EVAL_SOURCE_MAP ?? '')
const timeoutMs = Number(option('--timeout-ms', '70000'))
const delayMs = Number(option('--delay-ms', '0'))
const limit = Number(option('--limit', '0'))
const validateOnly = process.argv.includes('--validate-only')
const overwrite = process.argv.includes('--overwrite')

if (validateOnly) {
  let validationExitCode = 0
  try {
    const validation = await validateFixtureContract(fixturePath)
    console.log(JSON.stringify(validation, null, 2))
  } catch (error) {
    console.error(`评估集校验失败：${error?.message ?? error}`)
    validationExitCode = 2
  }
  // Validation mode must never initialize a client or make a backend call.
  process.exit(validationExitCode)
}

const metadata = {
  model: option('--model', process.env.LLM_MODEL ?? '') || null,
  commit: option('--commit', process.env.GIT_COMMIT ?? '') || null,
  databaseSnapshot: option('--db-snapshot', process.env.SJG_DB_SNAPSHOT ?? '') || null,
  operator: option('--operator', process.env.SJG_AI_EVAL_OPERATOR ?? process.env.USER ?? '') || null,
}

let sourceMap = null
if (sourceMapPath) sourceMap = JSON.parse(await fs.readFile(sourceMapPath, 'utf8'))
const report = await runEvaluation({
  baseUrl,
  fixturePath,
  outputPath,
  sourceMap,
  sourceMapPath,
  timeoutMs,
  delayMs,
  limit,
  metadata,
  overwrite,
})
console.log(JSON.stringify(report.summary, null, 2))
console.log(`评估结果已写入 ${path.resolve(outputPath)}`)
const fullFixtureRun = report.evaluated === report.fixtureSize
if (!fullFixtureRun) {
  console.error(`本次仅评估 ${report.evaluated}/${report.fixtureSize} 题；结果仅供试跑，不能作为 54 题质量门验收。`)
  process.exitCode = 1
} else if (!allQualityGatesPass(report.summary, report.fixtureSize)) {
  console.error('真实 AI 评估未通过质量门槛，请查看逐题结果并先定位数据、检索或提示词问题。')
  process.exitCode = 1
}
