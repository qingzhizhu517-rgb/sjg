import test from 'node:test'
import assert from 'node:assert/strict'
import { reactive } from 'vue'
import { safeSourceUrl } from '../src/utils/source.js'
import { setupPage, settle } from './helpers/componentSetup.js'

const sourceUrl = 'https://source.example.org/article'
const image = { kind: 'image', url: 'https://media.example.org/work.jpg', sourceUrl, inlineVerified: true, title: '作品实拍', authorOrg: '来源机构' }
const video = { ...image, kind: 'video', url: 'https://media.example.org/record.mp4', title: '现场实录' }
const stream = { ...video, url: 'https://media.example.org/record.m3u8?quality=hd' }
const createPage = props => setupPage('components/culture/CultureMediaGallery.vue', { safeSourceUrl }, reactive(props))
function player(nativeSupport = '') {
  const calls = []
  return { calls, src: '', pause() { calls.push('pause') }, removeAttribute(name) { calls.push(`remove:${name}`); this.src = '' }, load() { calls.push('load') }, canPlayType() { return nativeSupport } }
}
function fakeHls(supported = true) {
  const instances = []
  class Hls {
    static Events = { ERROR: 'error' }
    static isSupported() { return supported }
    constructor() { instances.push(this); this.destroyed = false }
    on(_event, callback) { this.error = callback }
    loadSource(url) { this.url = url }
    attachMedia(element) { this.player = element }
    destroy() { this.destroyed = true }
  }
  return { Hls, instances }
}

test('仅核验过的 HTTPS 媒体与合法原页进入画廊；视频默认优先，海报独立校验', async () => {
  const page = await createPage({ assets: [null, image, { ...video, poster: 'javascript:alert(1)' },
    { ...image, inlineVerified: false }, { ...video, url: 'http://media.example.org/a.mp4' },
    { ...image, url: 'https://user:password@media.example.org/a.jpg' },
    { ...image, sourceUrl: 'data:text/html,abc' }, { ...image, kind: 'iframe' }] })
  assert.equal(page.state.available.value.length, 2)
  assert.equal(page.state.active.value.kind, 'video')
  assert.equal(page.state.active.value.poster, '')
  assert.equal(page.state.active.value.sourceUrl, sourceUrl)
  assert.match(page.template, /preload="auto"/)
  assert.doesNotMatch(page.template, /autoplay|CultureIllustration|<svg/)
  page.dispose()
})

test('节目年代与会期说明随素材保留，独立于机构署名展示', async () => {
  const note = '本片为 2018 年节目，会期与活动安排请以当年公告为准。'
  const page = await createPage({ assets: [{ ...video, note, caption: '2018 年节目' }] })
  assert.equal(page.state.active.value.note, note)
  assert.match(page.template, /v-if="active\.note"[^>]*>\{\{ active\.note \}\}/)
  page.dispose()
})

test('切换图集与条目清除错误和选择，原页入口在加载失败时保留', async () => {
  const props = reactive({ assets: [image, video], itemTitle: '甲条目' })
  const page = await setupPage('components/culture/CultureMediaGallery.vue', { safeSourceUrl }, props)
  page.state.failMedia()
  assert.equal(page.state.failed.value, true)
  assert.equal(page.state.active.value.sourceUrl, sourceUrl)
  page.state.selectAsset(1)
  await settle()
  assert.equal(page.state.failed.value, false)
  assert.equal(page.state.active.value.kind, 'image')
  page.state.failMedia()
  props.assets = [{ ...image, url: 'https://media.example.org/new-work.jpg' }]
  props.itemTitle = '乙条目'
  await settle()
  assert.equal(page.state.index.value, 0)
  assert.equal(page.state.failed.value, false)
  assert.match(page.state.active.value.url, /new-work/)
  page.state.selectAsset(99)
  assert.equal(page.state.index.value, 0)
  page.dispose()
})

test('MP4 直接交给浏览器，条目切换和卸载会暂停并释放媒体', async () => {
  const page = await createPage({ assets: [video, image] })
  const element = player()
  await page.state.connectPlayer(element)
  assert.equal(element.src, video.url)
  page.state.selectAsset(1)
  await settle()
  assert.ok(element.calls.includes('pause'))
  assert.ok(element.calls.includes('remove:src'))
  assert.equal(element.src, '')
  page.state.selectAsset(0)
  await settle()
  await page.state.connectPlayer(element)
  page.dispose()
  assert.equal(element.calls.filter(call => call === 'pause').length, 2)
})

test('HLS 致命错误降级为原页入口，切换后销毁实例且忽略旧播放器错误', async () => {
  const page = await createPage({ assets: [stream, image] })
  const element = player(), { Hls, instances } = fakeHls()
  await page.state.connectPlayer(element, page.state.active.value, async () => ({ default: Hls }))
  assert.equal(instances[0].url, stream.url)
  assert.equal(instances[0].player, element)
  instances[0].error('error', { fatal: false })
  assert.equal(page.state.failed.value, false)
  instances[0].error('error', { fatal: true })
  assert.equal(page.state.failed.value, true)
  assert.equal(instances[0].destroyed, true)
  assert.equal(page.state.active.value.sourceUrl, sourceUrl)
  page.state.selectAsset(1)
  await settle()
  instances[0].error('error', { fatal: true })
  assert.equal(page.state.failed.value, false)
  page.dispose()
})

test('不支持 MSE 时使用原生 HLS，均不支持时显示失败入口', async () => {
  const { Hls } = fakeHls(false)
  const page = await createPage({ assets: [stream] })
  const native = player('probably')
  await page.state.connectPlayer(native, page.state.active.value, async () => ({ default: Hls }))
  assert.equal(native.src, stream.url)
  assert.equal(page.state.failed.value, false)
  await page.state.connectPlayer(player(), page.state.active.value, async () => ({ default: Hls }))
  assert.equal(page.state.failed.value, true)
  page.dispose()
})

test('异步 HLS 初始化期间切换条目，不把过时媒体挂到新条目', async () => {
  const page = await createPage({ assets: [stream, image] })
  const { Hls, instances } = fakeHls()
  let complete
  const loading = page.state.connectPlayer(player(), page.state.active.value, () => new Promise(resolve => { complete = resolve }))
  page.state.selectAsset(1)
  await settle()
  complete({ default: Hls })
  await loading
  assert.equal(instances.length, 0)
  assert.equal(page.state.active.value.kind, 'image')
  assert.equal(page.state.failed.value, false)
  page.dispose()
})
