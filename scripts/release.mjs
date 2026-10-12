import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { readJournal, writeJournal } from './release-journal.mjs'
import {
  validateReleaseConfig,
  releaseOrder,
  frontendEnvironment,
  relocateSharedLock,
  backendUploadSpec,
  injectBackendRuntime,
} from './release-lib.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const [phase = 'plan', selected] = process.argv.slice(2)
const revision =
  process.env.SJG_RELEASE_REVISION || (await run('git', ['rev-parse', 'HEAD'], { capture: true })).trim()
if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Use a complete release commit SHA')
const configText = process.env.SJG_RELEASE_REVISION
  ? await run('git', ['show', `${revision}:ops/release.json`], { capture: true })
  : await fs.readFile(path.join(root, 'ops/release.json'))
const config = validateReleaseConfig(JSON.parse(configText))
const directory = path.join(root, '.local/releases', revision)
const journalPath = path.join(directory, 'release.json')
const frontends = releaseOrder(config).filter((name) => config.services[name].provider === 'sites')

async function run(command, args, { cwd = root, env = process.env, input, capture = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ['pipe', capture ? 'pipe' : 'inherit', 'inherit'] })
    let output = ''
    if (capture)
      child.stdout.on('data', (chunk) => {
        output += chunk
      })
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0 ? resolve(output) : reject(new Error(`${command} failed (${code})`)),
    )
    child.stdin.end(input || '')
  })
}
async function secretInput() {
  console.log('Ready for release JSON on stdin (input is hidden).')
  if (!process.stdin.isTTY) {
    let value = ''
    for await (const chunk of process.stdin) value += chunk
    return JSON.parse(value)
  }
  process.stdin.setRawMode(true)
  const value = await new Promise((resolve) => {
    let input = ''
    const read = (chunk) => {
      input += chunk.toString()
      if (input.includes('\n')) {
        process.stdin.off('data', read)
        resolve(input.slice(0, input.indexOf('\n')))
      }
    }
    process.stdin.on('data', read)
    process.stdin.resume()
  })
  process.stdin.setRawMode(false)
  process.stdin.pause()
  return JSON.parse(value)
}
async function journal() {
  const value = await readJournal(journalPath)
  if (value.repository_revision !== revision) throw new Error('Release revision mismatch')
  return value
}
async function save(value) {
  await writeJournal(journalPath, value)
}
async function backendReady() {
  const base = config.services.backend.url
  const health = await fetch(`${base}/actuator/health`, { signal: AbortSignal.timeout(15000) })
  if (!health.ok || (await health.json()).status !== 'UP') throw new Error('Backend is unhealthy')
  const response = await fetch(`${base}/api/public/deployment`, { signal: AbortSignal.timeout(15000) })
  if (!response.ok || (await response.json()).data?.repository_revision !== revision)
    throw new Error('Backend release revision has not become live')
}
function railway(args) {
  return run('npx', ['--yes', `@railway/cli@${config.railway.cliVersion}`, ...args])
}
async function configureBackend(state) {
  const directory = path.join(root, '.local/release-runtime')
  await fs.mkdir(directory, { recursive: true })
  const command = ['--yes', `@railway/cli@${config.railway.cliVersion}`]
  await run('npx', [...command, 'link', ...targetArgs], { cwd: directory })
  await run(
    'npx',
    [
      ...command,
      'config',
      'pull',
      '--variables',
      'unmanaged',
      '--environment',
      config.railway.environmentId,
      '--force',
    ],
    { cwd: directory },
  )
  const current = JSON.parse(
    await run('npx', [...command, 'status', '--json'], { cwd: directory, capture: true }),
  )
  if (current.id !== config.railway.projectId) throw new Error('Railway project mismatch')
  const name = current.services.edges.find((item) => item.node.id === config.services.backend.serviceId)?.node
    .name
  if (!name) throw new Error('Configured Railway backend does not exist')
  const authoring = path.join(directory, '.railway/railway.ts')
  const runtime = JSON.parse(await fs.readFile(path.join(state.source, 'backend/railway.json'))).deploy
  await fs.writeFile(authoring, injectBackendRuntime(await fs.readFile(authoring, 'utf8'), name, runtime))
  const plan = JSON.parse(
    await run(
      'npx',
      [...command, 'config', 'plan', '--environment', config.railway.environmentId, '--json'],
      { cwd: directory, capture: true },
    ),
  )
  if (
    !plan.ok ||
    plan.diagnostics?.length ||
    plan.changeSet.changes.some(
      (change) =>
        change.kind !== 'resource.update' ||
        change.severity !== 'safe' ||
        !change.summary.startsWith(`Update ${name} `),
    )
  )
    throw new Error('Native runtime plan includes unexpected changes; inspect the local authoring file')
  if (plan.changeSet.changes.length)
    await run(
      'npx',
      [...command, 'config', 'apply', '--environment', config.railway.environmentId, '--yes'],
      { cwd: directory },
    )
  console.log('Native Railway backend runtime matches the release configuration')
}
const targetArgs = [
  '--project',
  config.railway.projectId,
  '--environment',
  config.railway.environmentId,
  '--service',
  config.services.backend.serviceId,
]

if (phase === 'plan') {
  console.log(
    JSON.stringify(
      {
        repository_revision: revision,
        order: releaseOrder(config),
        public_environment: frontendEnvironment(config),
        required: ['backup receipt', 'healthy matching backend', 'Sites source credentials through stdin'],
        directory,
      },
      null,
      2,
    ),
  )
} else if (phase === 'prepare') {
  if ((await run('git', ['status', '--porcelain', '--untracked-files=no'], { capture: true })).trim())
    throw new Error('Commit tracked changes before preparing a release')
  try {
    await fs.access(journalPath)
    console.log('Release already prepared; resume the existing journal')
    process.exit(0)
  } catch {
    /* new release */
  }
  await fs.mkdir(directory, { recursive: true, mode: 0o700 })
  const archive = path.join(directory, 'source.tar')
  await run('git', [
    'archive',
    '--format=tar',
    `--output=${archive}`,
    revision,
    'backend',
    'shared',
    ...frontends,
  ])
  const source = path.join(directory, 'source')
  await fs.mkdir(source)
  await run('tar', ['-xf', archive, '-C', source])
  await save({ repository_revision: revision, created_at: new Date().toISOString(), services: {}, source })
  console.log(`Prepared immutable source snapshot: ${directory}`)
} else if (phase === 'backup') {
  const receipt = await secretInput()
  const state = await journal()
  if (
    !receipt.sha256?.match(/^[a-f0-9]{64}$/) ||
    !receipt.completed_at ||
    !receipt.target_database ||
    !receipt.artifact
  )
    throw new Error('A real database backup receipt is required')
  state.backup = receipt
  await save(state)
  console.log('Backup receipt recorded')
} else if (phase === 'backend-config') {
  await configureBackend(await journal())
} else if (phase === 'backend') {
  const state = await journal()
  if (!state.backup) throw new Error('Back up the existing database before deployment')
  await configureBackend(state)
  const cors = frontends.map((name) => config.services[name].url).join(',')
  await railway([
    'variable',
    'set',
    ...targetArgs,
    '--skip-deploys',
    `SJG_RELEASE_REVISION=${revision}`,
    `SJG_BACKUP_CONFIRMED=${revision}`,
    `CORS_ALLOWED_ORIGINS=${cors}`,
    'SPRING_PROFILES_ACTIVE=prod',
    'RAG_FULLTEXT_ENABLED=true',
    'SWAGGER_ENABLED=false',
  ])
  state.services.backend = { status: 'submitted', submitted_at: new Date().toISOString() }
  await save(state)
  const upload = backendUploadSpec(state.source)
  await run(
    'npx',
    [
      '--yes',
      `@railway/cli@${config.railway.cliVersion}`,
      'up',
      upload.path,
      ...targetArgs,
      '--detach',
      ...upload.flags,
      '--message',
      `SJG unified release ${revision}`,
    ],
    { cwd: upload.cwd },
  )
  console.log('Backend submitted; run backend-check after Railway reports SUCCESS')
} else if (phase === 'backend-check') {
  await backendReady()
  const current = JSON.parse(
    await run('npx', ['--yes', `@railway/cli@${config.railway.cliVersion}`, 'status', '--json'], {
      capture: true,
    }),
  )
  const environment = current.environments.edges.find(
    (item) => item.node.id === config.railway.environmentId,
  )?.node
  const deployment = environment?.serviceInstances.edges.find(
    (item) => item.node.serviceId === config.services.backend.serviceId,
  )?.node.latestDeployment
  const runtime = deployment?.meta?.serviceManifest?.deploy
  if (
    deployment?.status !== 'SUCCESS' ||
    runtime?.healthcheckPath !== '/actuator/health' ||
    !runtime?.preDeployCommand?.some((command) => command.includes('ReleaseMigrationRunner')) ||
    runtime?.preDeployTimeoutSeconds !== 180
  )
    throw new Error('Live backend lacks the successful native migration gate')
  const state = await journal()
  state.services.backend = {
    ...state.services.backend,
    status: 'succeeded',
    deployment_id: deployment.id,
    native_migration_gate: true,
    verified_at: new Date().toISOString(),
  }
  await save(state)
  console.log(`Backend health and release SHA verified: ${revision}`)
} else if (phase === 'sites') {
  if (!frontends.includes(selected)) throw new Error('Select a configured frontend')
  await backendReady()
  const state = await journal(),
    service = config.services[selected]
  if (state.services.backend?.status !== 'succeeded' || !state.services.backend?.native_migration_gate)
    throw new Error('Verify the native backend migration gate before preparing frontends')
  for (const dependency of service.dependsOn)
    if (
      config.services[dependency].provider === 'sites' &&
      state.services[dependency]?.status !== 'succeeded'
    )
      throw new Error(`Publish ${dependency} before ${selected}`)
  if (state.services[selected]?.status === 'succeeded')
    throw new Error('This frontend is already published; verify or explicitly roll back')
  const helper = process.env.SITES_WORKFLOW_HELPER
  if (!helper || !path.isAbsolute(helper))
    throw new Error('Set SITES_WORKFLOW_HELPER to the official Sites helper absolute path')
  const input = await secretInput()
  if (!input.credential?.token) throw new Error('Provide the selected Site credential through stdin')
  const checkout = path.join(directory, 'sites', selected)
  await fs.mkdir(checkout, { recursive: true })
  let opened = state.services[selected]?.source
  async function workflow(payload) {
    const output = await run(process.execPath, [helper, '--project-id', service.projectId], {
      cwd: checkout,
      input: JSON.stringify(payload) + '\n',
      capture: true,
    })
    const result = output
      .trim()
      .split('\n')
      .reverse()
      .find((line) => line.startsWith('{') && line.includes('checkout_path'))
    if (!result) throw new Error('Sites helper returned no source result')
    return JSON.parse(result)
  }
  if (!opened) opened = await workflow({ credential: input.credential })
  state.services[selected] = { status: 'preparing', source: opened }
  await save(state)
  const siteRoot = opened.checkout_path
  const manifest = JSON.parse(await fs.readFile(path.join(siteRoot, '.openai/hosting.json')))
  if (manifest.project_id !== service.projectId) throw new Error('Sites checkout identity mismatch')
  // Preserve prior source outside the fresh checkout, including files removed by this release.
  const previous = (await run('git', ['ls-files', '-z'], { cwd: siteRoot, capture: true }))
    .split('\0')
    .filter(Boolean)
  for (const file of previous) {
    if (file.startsWith('.openai/') || file.startsWith('.sites-')) continue
    const preserved = path.join(directory, 'prior-site-source', selected, file)
    await fs.mkdir(path.dirname(preserved), { recursive: true })
    try {
      await fs.access(preserved)
      continue
    } catch {
      /* first preservation */
    }
    try {
      await fs.rename(path.join(siteRoot, file), preserved)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  await fs.cp(path.join(state.source, selected), siteRoot, { recursive: true })
  await fs.cp(path.join(state.source, 'shared'), path.join(siteRoot, 'shared'), { recursive: true })
  const packagePath = path.join(siteRoot, 'package.json'),
    lockPath = path.join(siteRoot, 'package-lock.json')
  const pkg = JSON.parse(await fs.readFile(packagePath))
  pkg.dependencies['@sjg/shared'] = 'file:./shared'
  await fs.writeFile(packagePath, JSON.stringify(pkg, null, 2) + '\n')
  await fs.writeFile(
    lockPath,
    JSON.stringify(relocateSharedLock(JSON.parse(await fs.readFile(lockPath))), null, 2) + '\n',
  )
  const env = frontendEnvironment(config)
  await fs.writeFile(
    path.join(siteRoot, '.env.production'),
    Object.entries(env)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n',
  )
  await fs.writeFile(
    path.join(siteRoot, 'public/deployment-info.json'),
    JSON.stringify(
      { repository_revision: revision, service: selected, backend: config.services.backend.url },
      null,
      2,
    ) + '\n',
  )
  const buildHelper = path.join(path.dirname(helper), 'build-site.mjs')
  const result = await workflow({
    credential: input.credential,
    source: opened,
    commands: [
      ['npm', 'ci'],
      [process.execPath, buildHelper],
    ],
    archivePath: path.join(directory, `${selected}.tar.gz`),
  })
  state.services[selected] = { status: 'prepared', source: result }
  await save(state)
  console.log(
    JSON.stringify(
      {
        next_tool: 'Sites save_version_and_deploy_private (after confirming owner-private audience)',
        project_id: service.projectId,
        commit_sha: result.commit_sha,
        archive: result.archive,
        repository_revision: revision,
      },
      null,
      2,
    ),
  )
} else if (phase === 'record') {
  if (!frontends.includes(selected)) throw new Error('Select a configured frontend')
  const receipt = await secretInput()
  const state = await journal()
  if (
    receipt.project_id !== config.services[selected].projectId ||
    receipt.status !== 'succeeded' ||
    !receipt.id ||
    !receipt.version_id ||
    receipt.url !== config.services[selected].url
  )
    throw new Error('Only a successful matching Sites deployment receipt may be recorded')
  state.services[selected] = {
    ...state.services[selected],
    status: 'succeeded',
    deployment_id: receipt.id,
    version_id: receipt.version_id,
    url: receipt.url,
    verified_at: new Date().toISOString(),
  }
  await save(state)
  console.log(`${selected} publication receipt recorded`)
} else if (phase === 'verify') {
  await backendReady()
  const state = await journal(),
    input = await secretInput()
  const checks = []
  for (const name of frontends) {
    if (state.services[name]?.status !== 'succeeded') throw new Error(`Frontend is not published: ${name}`)
    const token = input.siteTokens?.[config.services[name].projectId]
    if (!token) throw new Error(`Provide existing owner-scoped verification token for ${name}`)
    const response = await fetch(`${config.services[name].url}/deployment-info.json`, {
      headers: { 'OAI-Sites-Authorization': `Bearer ${token}` },
      redirect: 'error',
      signal: AbortSignal.timeout(30000),
    })
    if (!response.ok || (await response.json()).repository_revision !== revision)
      throw new Error(`Frontend version mismatch: ${name}`)
    const corsPath = name === 'admin-frontend' ? '/api/admin/content-reviews' : '/api/public/poems'
    const cors = await fetch(`${config.services.backend.url}${corsPath}`, {
      method: 'OPTIONS',
      headers: {
        Origin: config.services[name].url,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers':
          name === 'admin-frontend' ? 'authorization,content-type' : 'x-requested-with',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!cors.ok || cors.headers.get('access-control-allow-origin') !== config.services[name].url)
      throw new Error(`CORS failed for ${name}`)
    checks.push(name)
  }
  const anonymous = await fetch(`${config.services.backend.url}/api/admin/users`, {
    headers: { Origin: config.services['admin-frontend'].url },
    signal: AbortSignal.timeout(15000),
  })
  if (anonymous.status !== 401) throw new Error('Anonymous admin request was not rejected')
  if (anonymous.headers.get('access-control-allow-origin') !== config.services['admin-frontend'].url)
    throw new Error('Admin authentication errors do not retain CORS headers')
  state.validation = {
    completed_at: new Date().toISOString(),
    frontend_revisions: checks,
    backend_revision: revision,
    cors: 'passed',
    anonymous_admin: 401,
  }
  await save(state)
  console.log('Unified release HTTP verification passed')
} else
  throw new Error(
    'Use plan, prepare, backup, backend-config, backend, backend-check, sites NAME, record NAME, or verify',
  )
