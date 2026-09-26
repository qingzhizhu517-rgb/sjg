import process from 'node:process'

import { inspectMigrationSet } from './migration-check.mjs'

const directory = process.argv[2] ?? 'backend/src/main/resources/db/migration'
const result = await inspectMigrationSet(directory)
for (const report of result.reports) {
  console.log(`V${report.version}: ${report.filename} OK`)
}
if (result.errors.length) {
  for (const error of result.errors) console.error(`迁移检查失败：${error}`)
  process.exitCode = 1
} else {
  console.log(`迁移检查通过：V${result.versions.join(', V')}`)
}
