import test from 'node:test'
import assert from 'node:assert/strict'

const implementation = await import('./crawl-cultural-sources.mjs').catch(() => ({}))
const publicDns = async () => [{ address: '93.184.216.34', family: 4 }]
const okHtml = '<html><title>公开文化资料</title><p>可核验的地方文化记录。</p></html>'

function fixtureFetch(pages = {}) {
  const calls = []
  const fetch = async (url, options) => {
    calls.push({ url: String(url), options })
    const value = pages[String(url)]
    if (!value) return new Response('', { status: 404 })
    return new Response(value.body || '', { status: value.status || 200, headers: value.headers || { 'content-type': 'text/html; charset=utf-8' } })
  }
  return { fetch, calls }
}

test('exposes an injectable source inspection and catalog crawler', () => {
  assert.equal(typeof implementation.inspectSource, 'function')
  assert.equal(typeof implementation.crawlCatalog, 'function')
})

test('blocks private addresses, credentials, non HTTPS, login and search URLs before a request', async () => {
  const fixtures = fixtureFetch()
  for (const url of ['http://example.org/a', 'https://127.0.0.1/a', 'https://[::1]/a', 'https://[::ffff:127.0.0.1]/a', 'https://user:pass@example.org/a', 'https://example.org/login', 'https://example.org/search?q=葫芦', 'https://example.org/a?token=secret']) {
    const result = await implementation.inspectSource(url, { fetch: fixtures.fetch, dnsLookup: publicDns })
    assert.equal(result.status, 'blocked', url)
  }
  assert.equal(fixtures.calls.length, 0)
})

test('blocks a hostname when any DNS address is private or reserved', async () => {
  const fixtures = fixtureFetch()
  for (const address of ['10.0.0.2', '169.254.169.254', '192.0.2.1', '100.64.0.1', 'fc00::1', '2001:db8::1', '2001:0db8::1', '2001:0000::1', 'fe80::1']) {
    const result = await implementation.inspectSource('https://example.org/a', {
      fetch: fixtures.fetch,
      dnsLookup: async () => [{ address: '93.184.216.34', family: 4 }, { address, family: address.includes(':') ? 6 : 4 }],
    })
    assert.equal(result.status, 'blocked', address)
  }
  assert.equal(fixtures.calls.length, 0)
})

test('honors robots disallow and a more specific allow rule', async () => {
  const fixtures = fixtureFetch({
    'https://example.org/robots.txt': { body: 'User-agent: *\nDisallow: /private/\nAllow: /private/public.html', headers: { 'content-type': 'text/plain' } },
    'https://example.org/private/public.html': { body: okHtml },
  })
  const options = { fetch: fixtures.fetch, dnsLookup: publicDns }
  const blocked = await implementation.inspectSource('https://example.org/private/a.html', options)
  assert.equal(blocked.status, 'skipped')
  assert.equal(blocked.reason, 'robots_disallowed')
  assert.equal(fixtures.calls.some(call => call.url.endsWith('/private/a.html')), false)
  const allowed = await implementation.inspectSource('https://example.org/private/public.html', options)
  assert.equal(allowed.status, 'fetched')
})

test('revalidates every redirect without requesting its private target', async () => {
  const fixtures = fixtureFetch({ 'https://example.org/a': { status: 302, headers: { location: 'https://private.example/a' } } })
  const result = await implementation.inspectSource('https://example.org/a', {
    fetch: fixtures.fetch,
    dnsLookup: async host => [{ address: host === 'private.example' ? '10.0.0.1' : '93.184.216.34', family: 4 }],
  })
  assert.equal(result.status, 'blocked')
  assert.equal(fixtures.calls.some(call => call.url.startsWith('https://private.example')), false)
  assert.equal(fixtures.calls.find(call => call.url.endsWith('/a')).options.redirect, 'manual')
  assert.deepEqual(fixtures.calls.find(call => call.url.endsWith('/a')).options.validatedAddresses, [{ address: '93.184.216.34', family: 4 }])
})

test('checks the redirected destination robots policy before fetching the destination', async () => {
  const fixtures = fixtureFetch({
    'https://example.org/a': { status: 302, headers: { location: 'https://other.example/blocked/a' } },
    'https://other.example/robots.txt': { body: 'User-agent: *\nDisallow: /blocked/', headers: { 'content-type': 'text/plain' } },
  })
  const result = await implementation.inspectSource('https://example.org/a', { fetch: fixtures.fetch, dnsLookup: publicDns })
  assert.equal(result.status, 'skipped')
  assert.equal(result.reason, 'robots_disallowed')
  assert.equal(fixtures.calls.some(call => call.url.endsWith('/blocked/a')), false)
})

test('extracts public page title, description, readable text and distinct media without fetching media', async () => {
  const fixtures = fixtureFetch({ 'https://example.org/article/1': { body: `<html><head><title>齐鲁 &amp; 非遗</title><meta content="织造工序" name="description"><meta property="og:image" content="/photo.jpg"></head><body><script>secret script</script><p>经纬交织的鲁锦。</p><img src="/photo.jpg"><video poster="/poster.jpg"><source src="https://cdn.example.org/movie.mp4" type="video/mp4"></video><audio src="/song.mp3"></audio></body></html>` } })
  const result = await implementation.inspectSource('https://example.org/article/1', { fetch: fixtures.fetch, dnsLookup: publicDns })
  assert.equal(result.status, 'fetched')
  assert.equal(result.httpStatus, 200)
  assert.equal(result.metadata.title, '齐鲁 & 非遗')
  assert.equal(result.metadata.description, '织造工序')
  assert.match(result.metadata.textExcerpt, /经纬交织/)
  assert.doesNotMatch(result.metadata.textExcerpt, /secret script/)
  assert.deepEqual(result.metadata.media.images, ['https://example.org/photo.jpg', 'https://example.org/poster.jpg'])
  assert.deepEqual(result.metadata.media.videos, ['https://cdn.example.org/movie.mp4'])
  assert.deepEqual(result.metadata.media.audios, ['https://example.org/song.mp3'])
  assert.equal(fixtures.calls.some(call => /\.(jpg|mp4|mp3)$/.test(call.url)), false)
  assert.equal(result.permission, 'not_assessed')
})

test('stops on login pages and robots access failures without bypassing them', async () => {
  const login = fixtureFetch({ 'https://example.org/article': { body: '<title>会员登录</title><form><input type="password"></form>' } })
  const loginResult = await implementation.inspectSource('https://example.org/article', { fetch: login.fetch, dnsLookup: publicDns })
  assert.equal(loginResult.status, 'skipped')
  assert.equal(loginResult.reason, 'login_or_challenge')
  const robots = fixtureFetch({ 'https://example.org/robots.txt': { status: 403 } })
  const robotsResult = await implementation.inspectSource('https://example.org/article', { fetch: robots.fetch, dnsLookup: publicDns })
  assert.equal(robotsResult.status, 'skipped')
  assert.equal(robotsResult.reason, 'robots_unavailable')
  assert.equal(robots.calls.length, 1)
})

test('records HTTP failure and refuses to read a body larger than its limit', async () => {
  const fixtures = fixtureFetch({
    'https://example.org/missing': { status: 410 },
    'https://example.org/large': { body: 'x'.repeat(200), headers: { 'content-type': 'text/html', 'content-length': '200' } },
  })
  const options = { fetch: fixtures.fetch, dnsLookup: publicDns, maxBytes: 100 }
  const missing = await implementation.inspectSource('https://example.org/missing', options)
  assert.equal(missing.status, 'http_error')
  assert.equal(missing.httpStatus, 410)
  const large = await implementation.inspectSource('https://example.org/large', options)
  assert.equal(large.status, 'failed')
  assert.equal(large.reason, 'response_too_large')
})

test('deduplicates catalog sources and limits simultaneous fetches to three', async () => {
  let inFlight = 0, maximum = 0
  const fetch = async url => {
    inFlight++; maximum = Math.max(maximum, inFlight)
    await new Promise(resolve => setTimeout(resolve, 2))
    inFlight--
    return new Response(String(url).endsWith('/robots.txt') ? '' : okHtml, { status: String(url).endsWith('/robots.txt') ? 404 : 200, headers: { 'content-type': 'text/html' } })
  }
  const entries = Array.from({ length: 6 }, (_, i) => ({ title: `条目${i}`, sources: [{ title: '来源', url: `https://example.org/${i}` }, { title: '重复', url: 'https://example.org/0' }] }))
  const result = await implementation.crawlCatalog({ entries }, { fetch, dnsLookup: publicDns, concurrency: 3, now: () => '2026-10-12T00:00:00.000Z' })
  assert.equal(result.results.length, 6)
  assert.equal(result.totalSources, 12)
  assert.equal(result.summary.fetched, 6)
  assert.equal(result.generatedAt, '2026-10-12T00:00:00.000Z')
  assert.ok(maximum <= 3)
  assert.equal(result.results.find(item => item.url.endsWith('/0')).entryTitles.length, 6)
})

test('records a timed-out DNS lookup as a failed source', async () => {
  const fixtures = fixtureFetch()
  const result = await implementation.inspectSource('https://example.org/a', {
    fetch: fixtures.fetch, dnsLookup: () => new Promise(() => {}), timeoutMs: 10,
  })
  assert.equal(result.status, 'failed')
  assert.equal(result.reason, 'timeout')
  assert.equal(fixtures.calls.length, 0)
})

test('extracts picture sources as images and refuses private media metadata', async () => {
  const fixtures = fixtureFetch({ 'https://example.org/a': { body: '<picture><source type="image/webp" src="/photo.webp"></picture><img src="https://127.0.0.1/private.jpg">' } })
  const result = await implementation.inspectSource('https://example.org/a', { fetch: fixtures.fetch, dnsLookup: publicDns })
  assert.deepEqual(result.metadata.media.images, ['https://example.org/photo.webp'])
  assert.deepEqual(result.metadata.media.videos, [])
})

test('does not treat interpolated template expressions as media URLs', async () => {
  const fixtures = fixtureFetch({ 'https://example.org/a': { body: `<img src="' + list[i].avatar + '"><video src="'+ _src +'"><img src="/works/photo.jpg">` } })
  const result = await implementation.inspectSource('https://example.org/a', { fetch: fixtures.fetch, dnsLookup: publicDns })
  assert.deepEqual(result.metadata.media.images, ['https://example.org/works/photo.jpg'])
  assert.deepEqual(result.metadata.media.videos, [])
})

test('recovers only benchmark fake IP DNS using a pinned public resolver and still rejects private answers', async () => {
  const calls = []
  const options = {
    dnsLookup: async () => [{ address: '198.18.1.46', family: 4 }],
    dohFetch: async (url, opts) => {
      calls.push({ url, opts })
      return new Response(JSON.stringify({ Status: 0, Answer: [{ type: 1, data: '116.178.76.56' }] }), { headers: { 'content-type': 'application/json' } })
    },
  }
  assert.equal(typeof implementation.resolvePublicHost, 'function')
  const addresses = await implementation.resolvePublicHost('www.ihchina.cn', options)
  assert.deepEqual(addresses, [{ address: '116.178.76.56', family: 4 }])
  assert.equal(new URL(calls[0].url).hostname, 'dns.google')
  assert.equal(new URL(calls[0].url).searchParams.get('name'), 'www.ihchina.cn')
  assert.deepEqual(calls[0].opts.validatedAddresses, [{ address: '8.8.8.8', family: 4 }])
  const originalPrivate = await implementation.resolvePublicHost('internal.example', { ...options, dnsLookup: async () => [{ address: '10.0.0.1', family: 4 }] })
  assert.deepEqual(originalPrivate, [{ address: '10.0.0.1', family: 4 }])
  assert.equal(calls.length, 1)
  await assert.rejects(() => implementation.resolvePublicHost('public.example', { ...options, dohFetch: async () => new Response(JSON.stringify({ Status: 0, Answer: [{ type: 1, data: '10.0.0.1' }] }), { headers: { 'content-type': 'application/json' } }) }), /private_dns_answer/)
})

test('decodes charset declared in HTML metadata when HTTP headers omit it', async () => {
  const utf8 = Buffer.from('<meta charset="gb2312"><title>', 'ascii')
  const title = Buffer.from([0xc6, 0xeb, 0xc2, 0xb3])
  const body = Buffer.concat([utf8, title, Buffer.from('</title>', 'ascii')])
  const fetch = async url => new Response(String(url).endsWith('/robots.txt') ? '' : body, { status: String(url).endsWith('/robots.txt') ? 404 : 200, headers: { 'content-type': 'text/html' } })
  const result = await implementation.inspectSource('https://example.org/a', { fetch, dnsLookup: publicDns })
  assert.equal(result.metadata.title, '齐鲁')
})

test('does not mistake an optional login form on a readable article for an access gate', async () => {
  const body = `<title>公开非遗文章</title><p>${'公共文化内容。'.repeat(60)}</p><aside><input type="password"></aside>`
  const fixtures = fixtureFetch({ 'https://example.org/a': { body } })
  const result = await implementation.inspectSource('https://example.org/a', { fetch: fixtures.fetch, dnsLookup: publicDns })
  assert.equal(result.status, 'fetched')
})
