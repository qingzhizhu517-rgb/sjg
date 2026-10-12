#!/usr/bin/env node
// Read-only public source research. No cookies, accounts, media downloads or publishing.
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { request } from 'node:https'
import { createBrotliDecompress, createGunzip, createInflate } from 'node:zlib'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_INPUT = 'display-v2/src/content/culture/enrichment.json'
const DEFAULT_OUTPUT = '.local/culture-research/crawl.json'
const USER_AGENT = 'SJGResearchBot/1.0 (public cultural source metadata research)'
const MAX_BYTES = 3 * 1024 * 1024
const REDIRECT_LIMIT = 5

function problem(reason) {
  const error = new Error(reason)
  error.reason = reason
  return error
}

function publicAddress(address) {
  const family = isIP(address)
  if (family === 4) {
    const octets = address.split('.').map(Number)
    const [a, b, c] = octets
    return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) || (a === 192 && b === 88 && c === 99) ||
      (a === 198 && (b === 18 || b === 19)) || (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113))
  }
  if (family !== 6) return false
  const [first, second = '0'] = address.toLowerCase().split(':').map(value => parseInt(value || '0', 16))
  // Only global-unicast IPv6; exclude transition, benchmarking and documentation ranges.
  return first >= 0x2000 && first <= 0x3fff && first !== 0x2002 && first !== 0x3fff &&
    !(first === 0x2001 && (second === 0 || second === 2 || second === 0xdb8 || (second >= 0x10 && second <= 0x2f)))
}

function publicUrl(value, { allowSearch = false } = {}) {
  let url
  try { url = new URL(value) } catch { throw problem('invalid_url') }
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) throw problem('https_public_only')
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (host === 'localhost' || /\.(?:localhost|local|internal|home|lan)$/.test(host) || !host.includes('.' ) && !isIP(host)) throw problem('private_hostname')
  if (isIP(host) && !publicAddress(host)) throw problem('private_address')
  if (/(?:^|\/)(?:login|signin|sign-in|signup|sign-up|auth|account)(?:\/|$)/i.test(url.pathname)) throw problem('account_url')
  if ([...url.searchParams.keys()].some(key => /^(?:token|access_token|api_key|apikey|password|authorization|session|sessionid)$/i.test(key))) throw problem('credential_url')
  if (!allowSearch && (/(?:^|\/)(?:search|so|s)(?:[./]|$)/i.test(url.pathname) || [...url.searchParams.keys()].some(key => /^(?:q|query|keyword|search)$/i.test(key)))) throw problem('search_page')
  url.hash = ''
  return url
}

async function validateTarget(value, options) {
  const url = publicUrl(value)
  const host = url.hostname.replace(/^\[|\]$/g, '')
  const addresses = isIP(host) ? [{ address: host, family: isIP(host) }] : await withinTimeout(options.dnsLookup(host, { all: true, verbatim: true }), options.timeoutMs)
  if (!Array.isArray(addresses) || !addresses.length || addresses.some(record => !publicAddress(record.address))) throw problem('private_dns_address')
  return { url, addresses }
}

async function withinTimeout(promise, timeoutMs) {
  let timer
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(problem('timeout')), timeoutMs) })]) }
  finally { clearTimeout(timer) }
}

// Connect to a vetted address, retaining the original hostname for TLS certificate validation.
function pinnedFetch(url, options) {
  return new Promise((resolve, reject) => {
    const req = request(url, {
      method: 'GET', headers: options.headers, signal: options.signal,
      lookup(_host, settings, callback) {
        const address = options.validatedAddresses[0]
        if (settings?.all) callback(null, options.validatedAddresses)
        else callback(null, address.address, address.family)
      },
    }, response => {
      const headers = new Headers()
      for (const [key, value] of Object.entries(response.headers)) if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value)
      const status = response.statusCode || 500
      const type = headers.get('content-type') || ''
      if ((status >= 300 && status < 400) || status === 204 || status === 304 || !/^(?:text\/|application\/(?:xhtml\+xml|json|dns-json))/i.test(type)) {
        response.destroy()
        resolve(new Response(null, { status, headers }))
        return
      }
      if (Number(headers.get('content-length')) > options.maxBytes) {
        response.destroy(); reject(problem('response_too_large')); return
      }
      const decompress = { gzip: createGunzip, deflate: createInflate, br: createBrotliDecompress }[headers.get('content-encoding')]
      const stream = decompress ? response.pipe(decompress()) : response
      let bytes = 0
      const chunks = []
      stream.on('data', chunk => {
        bytes += chunk.length
        if (bytes > options.maxBytes) { stream.destroy(); response.destroy(); reject(problem('response_too_large')); return }
        chunks.push(chunk)
      })
      stream.on('error', reject)
      response.on('error', reject)
      stream.on('end', () => resolve(new Response(Buffer.concat(chunks), { status, headers })))
    })
    req.on('error', reject)
    req.end()
  })
}

export async function resolvePublicHost(host, provided = {}) {
  const timeoutMs = Math.min(provided.timeoutMs || 20_000, 20_000)
  const original = await withinTimeout((provided.dnsLookup || lookup)(host, { all: true, verbatim: true }), timeoutMs)
  // Clash fake IP mode uses the benchmarking block. Do not relax the public-IP gate.
  if (!original.length || !original.every(record => /^198\.(?:18|19)\./.test(record.address))) return original
  const url = new URL('https://dns.google/resolve')
  url.searchParams.set('name', host); url.searchParams.set('type', 'A')
  const options = settings({ fetch: provided.dohFetch || pinnedFetch, timeoutMs, maxBytes: 64 * 1024, dnsLookup: lookup })
  const response = await fetchValidated({ url, addresses: [{ address: '8.8.8.8', family: 4 }] }, options)
  if (!response.ok) throw problem('public_dns_unavailable')
  const data = JSON.parse((await readLimited(response, options)).text)
  if (data.Status !== 0) throw problem('public_dns_unavailable')
  const addresses = (data.Answer || []).filter(answer => answer.type === 1).map(answer => ({ address: answer.data, family: 4 }))
  if (!addresses.length || addresses.some(record => !publicAddress(record.address))) throw problem('private_dns_answer')
  return addresses
}

function settings(options = {}) {
  return {
    ...options,
    fetch: options.fetch || pinnedFetch,
    dnsLookup: options.dnsLookup || resolvePublicHost,
    timeoutMs: Math.min(options.timeoutMs || 20_000, 20_000),
    maxBytes: Math.min(options.maxBytes || MAX_BYTES, MAX_BYTES),
    robotsCache: options.robotsCache || new Map(),
    now: options.now || (() => new Date().toISOString()),
  }
}

async function fetchValidated(target, options) {
  const controller = new AbortController()
  let timer
  try {
    return await Promise.race([
      options.fetch(target.url.href, {
        method: 'GET', redirect: 'manual', credentials: 'omit', signal: controller.signal,
        headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1', 'accept-encoding': 'identity' },
        validatedAddresses: target.addresses, maxBytes: options.maxBytes,
      }),
      new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(problem('timeout')) }, options.timeoutMs) }),
    ])
  } finally { clearTimeout(timer) }
}

async function readLimited(response, options) {
  if (Number(response.headers.get('content-length')) > options.maxBytes) { await response.body?.cancel(); throw problem('response_too_large') }
  if (!response.body) return { text: '', bytes: 0 }
  const reader = response.body.getReader(), chunks = []
  let bytes = 0
  try {
    while (true) {
      const next = await reader.read()
      if (next.done) break
      bytes += next.value.byteLength
      if (bytes > options.maxBytes) { await reader.cancel(); throw problem('response_too_large') }
      chunks.push(next.value)
    }
  } finally { reader.releaseLock() }
  const buffer = Buffer.concat(chunks)
  const declared = /charset\s*=\s*["']?([^;\s"']+)/i.exec(response.headers.get('content-type') || '')?.[1]
  const meta = /<meta\b[^>]*charset\s*=\s*["']?([^;\s"'<>]+)/i.exec(buffer.subarray(0, 4096).toString('ascii'))?.[1]
  const value = declared || meta || 'utf-8'
  const charset = /^(?:gbk|gb2312|gb_2312-80)$/i.test(value) ? 'gb18030' : value
  try { return { text: new TextDecoder(charset).decode(buffer), bytes } }
  catch { return { text: buffer.toString('utf8'), bytes } }
}

function robotGroups(text) {
  const groups = []
  let group = { agents: [], rules: [] }, hasRules = false
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim(), separator = line.indexOf(':')
    if (separator < 0) continue
    const key = line.slice(0, separator).trim().toLowerCase(), value = line.slice(separator + 1).trim()
    if (key === 'user-agent') {
      if (hasRules) { groups.push(group); group = { agents: [], rules: [] }; hasRules = false }
      group.agents.push(value.toLowerCase())
    } else if ((key === 'allow' || key === 'disallow') && group.agents.length) {
      hasRules = true
      if (value) group.rules.push({ value, allow: key === 'allow' })
    }
  }
  groups.push(group)
  return groups
}

function robotsAllow(text, url) {
  const groups = robotGroups(text)
  const specific = groups.filter(group => group.agents.some(agent => agent !== '*' && 'sjgresearchbot'.includes(agent)))
  const selected = specific.length ? specific : groups.filter(group => group.agents.includes('*'))
  const target = `${url.pathname}${url.search}`
  let winner = { length: -1, allow: true }
  for (const rule of selected.flatMap(group => group.rules)) {
    const ends = rule.value.endsWith('$'), value = ends ? rule.value.slice(0, -1) : rule.value
    const escaped = value.split('*').map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*')
    const length = value.replace(/\*/g, '').length
    if (new RegExp(`^${escaped}${ends ? '$' : ''}`).test(target) && (length > winner.length || (length === winner.length && rule.allow))) winner = { length, allow: rule.allow }
  }
  return winner.allow
}

async function retrieveRobots(origin, options) {
  let value = `${origin}/robots.txt`
  for (let hop = 0; hop <= REDIRECT_LIMIT; hop++) {
    const target = await validateTarget(value, options), response = await fetchValidated(target, options)
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      value = new URL(response.headers.get('location'), target.url).href
      await response.body?.cancel()
      continue
    }
    if (response.status === 404 || response.status === 410) return { text: '', available: true, httpStatus: response.status }
    if (!response.ok) return { text: '', available: false, httpStatus: response.status }
    return { ...(await readLimited(response, options)), available: true, httpStatus: response.status }
  }
  throw problem('robots_redirect_limit')
}

async function checkRobots(url, options) {
  if (!options.robotsCache.has(url.origin)) options.robotsCache.set(url.origin, retrieveRobots(url.origin, options).catch(error => ({ available: false, reason: error.reason || 'robots_fetch_failed' })))
  const robots = await options.robotsCache.get(url.origin)
  return { ...robots, allowed: robots.available && robotsAllow(robots.text, url) }
}

function decodeEntities(value) {
  return String(value || '').replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => {
    const number = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code)
    return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : ''
  }).replace(/&(amp|quot|apos|lt|gt|nbsp);/gi, (_, name) => ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' })[name.toLowerCase()])
}

function attributes(tag) {
  const result = {}
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4])
  return result
}

function mediaLink(value, base) {
  // Do not turn literal player/template expressions into apparently valid URLs.
  if (/[{}<>]|\$\{|['"]\s*\+|\+\s*['"]/.test(decodeEntities(value))) return null
  try { return publicUrl(new URL(decodeEntities(value), base).href, { allowSearch: true }).href }
  catch { return null }
}

function pageMetadata(html, base) {
  const metas = {}
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attrs = attributes(tag), key = (attrs.property || attrs.name || '').toLowerCase()
    if (key && attrs.content) metas[key] = attrs.content
  }
  const title = decodeEntities(/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || metas['og:title'] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const description = metas.description || metas['og:description'] || ''
  const media = { images: [], videos: [], audios: [] }
  const add = (kind, value) => { const url = value && mediaLink(value, base); if (url && !media[kind].includes(url) && media[kind].length < 40) media[kind].push(url) }
  for (const [key, value] of Object.entries(metas)) {
    if (/^(?:og:image|twitter:image)(?::url|:secure_url)?$/.test(key)) add('images', value)
    if (/^og:video(?::url|:secure_url)?$/.test(key)) add('videos', value)
    if (/^og:audio(?::url|:secure_url)?$/.test(key)) add('audios', value)
  }
  for (const tag of html.match(/<(?:img|video|audio|source)\b[^>]*>/gi) || []) {
    const attrs = attributes(tag), kind = /^<img/i.test(tag) || attrs.type?.startsWith('image/') ? 'images' : /^<audio/i.test(tag) || attrs.type?.startsWith('audio/') ? 'audios' : 'videos'
    if (attrs.poster) add('images', attrs.poster)
    for (const key of ['src', 'data-src', 'data-original']) if (attrs[key]) add(kind, attrs[key])
  }
  // Some official articles declare a direct media URL in their own player configuration.
  for (const value of html.match(/https?:\/\/[^\s"'<>\\]+\.(?:mp4|m3u8|mp3|wav|ogg|m4a)(?:\?[^\s"'<>\\]*)?/gi) || []) add(/\.(?:mp3|wav|ogg|m4a)(?:\?|$)/i.test(value) ? 'audios' : 'videos', value)
  const textExcerpt = decodeEntities(html.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 1500)
  return { title: title.slice(0, 300), description: description.slice(0, 600), textExcerpt, media }
}

export async function inspectSource(value, provided = {}) {
  const options = settings(provided)
  const result = { url: value, status: 'failed', permission: 'not_assessed', checkedAt: options.now(), redirects: [] }
  let current = value
  try {
    for (let hop = 0; hop <= REDIRECT_LIMIT; hop++) {
      let target
      try { target = await validateTarget(current, options) }
      catch (error) { if (error.reason === 'timeout') throw error; return { ...result, status: 'blocked', reason: error.reason || 'dns_lookup_failed' } }
      const robots = await checkRobots(target.url, options)
      if (!robots.available || !robots.allowed) return { ...result, status: 'skipped', reason: robots.available ? 'robots_disallowed' : 'robots_unavailable', robots: { httpStatus: robots.httpStatus ?? null, reason: robots.reason || '' } }
      const response = await fetchValidated(target, options)
      result.httpStatus = response.status
      result.contentType = response.headers.get('content-type') || ''
      result.finalUrl = target.url.href
      if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
        current = new URL(response.headers.get('location'), target.url).href
        result.redirects.push({ from: target.url.href, to: current, httpStatus: response.status })
        await response.body?.cancel()
        continue
      }
      if (!response.ok) { await response.body?.cancel(); return { ...result, status: 'http_error', reason: `http_${response.status}` } }
      if (!/^(?:text\/html|text\/plain|application\/xhtml\+xml)/i.test(result.contentType)) {
        await response.body?.cancel()
        return { ...result, status: 'skipped', reason: 'non_text_resource' }
      }
      const body = await readLimited(response, options)
      result.bytes = body.bytes
      result.metadata = pageMetadata(body.text, target.url)
      const gatedTitle = /(?:会员登录|用户登录|access denied|just a moment|verify you are human|安全验证|验证码)/i.test(result.metadata.title)
      const emptyLogin = /<input\b[^>]*type\s*=\s*["']?password/i.test(body.text) && result.metadata.textExcerpt.length < 250
      if (gatedTitle || emptyLogin) return { ...result, status: 'skipped', reason: 'login_or_challenge' }
      return { ...result, status: 'fetched', robots: { httpStatus: robots.httpStatus, allowed: true } }
    }
    return { ...result, reason: 'redirect_limit' }
  } catch (error) { return { ...result, reason: error.reason || (error.name === 'AbortError' ? 'timeout' : 'request_failed'), error: String(error.message || error).slice(0, 240) } }
}

export async function crawlCatalog(input, provided = {}) {
  const options = settings(provided), entries = Array.isArray(input) ? input : input.entries || []
  const unique = new Map()
  let totalSources = 0
  for (const entry of entries) for (const source of entry.sources || []) {
    if (!source?.url) continue
    totalSources++
    if (!unique.has(source.url)) unique.set(source.url, { url: source.url, entryTitles: [], sourceTitles: [] })
    const record = unique.get(source.url)
    if (entry.title && !record.entryTitles.includes(entry.title)) record.entryTitles.push(entry.title)
    if (source.title && !record.sourceTitles.includes(source.title)) record.sourceTitles.push(source.title)
  }
  const sources = [...unique.values()], results = new Array(sources.length)
  let cursor = 0
  await Promise.all(Array.from({ length: Math.min(Math.max(1, provided.concurrency || 3), 3, sources.length) }, async () => {
    while (cursor < sources.length) {
      const index = cursor++
      results[index] = { ...sources[index], ...(await inspectSource(sources[index].url, options)) }
      provided.onResult?.(results[index], index + 1, sources.length)
    }
  }))
  const summary = { fetched: 0, skipped: 0, blocked: 0, failed: 0, http_error: 0, pagesWithImages: 0, pagesWithVideo: 0, pagesWithAudio: 0 }
  for (const result of results) {
    summary[result.status]++
    if (result.status === 'fetched' && result.metadata?.media.images.length) summary.pagesWithImages++
    if (result.status === 'fetched' && result.metadata?.media.videos.length) summary.pagesWithVideo++
    if (result.status === 'fetched' && result.metadata?.media.audios.length) summary.pagesWithAudio++
  }
  return { generatedAt: options.now(), inputEntries: entries.length, totalSources, uniqueSources: sources.length, permissionNote: 'HTTP success and robots allowance do not establish reuse or redistribution permission. Media URLs are metadata candidates only; no media was downloaded.', summary, results }
}

async function main() {
  const args = process.argv.slice(2)
  let inputPath = DEFAULT_INPUT, outputPath = DEFAULT_OUTPUT
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--input' && args[index + 1]) inputPath = args[++index]
    else if (args[index] === '--output' && args[index + 1]) outputPath = args[++index]
    else throw new Error('Usage: node scripts/crawl-cultural-sources.mjs [--input catalog.json] [--output .local/culture-research/crawl.json]')
  }
  const output = path.resolve(outputPath), allowed = path.resolve('.local/culture-research') + path.sep
  if (!output.startsWith(allowed) || !output.endsWith('.json')) throw new Error('Output must be a JSON file inside .local/culture-research/.')
  const input = JSON.parse(await fs.readFile(inputPath, 'utf8'))
  const report = await crawlCatalog(input, { onResult: (result, index, total) => process.stdout.write(`${index}/${total} ${result.status} ${result.url}\n`) })
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n')
  process.stdout.write(JSON.stringify({ output, ...report.summary }) + '\n')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { process.stderr.write(error.message + '\n'); process.exitCode = 1 })
