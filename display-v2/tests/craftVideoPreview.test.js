import test from 'node:test'
import assert from 'node:assert/strict'
import { reactive } from 'vue'
import { setupPage, settle } from './helpers/componentSetup.js'
import { resolveVideoPreview } from '../src/utils/craftVideo.js'
const video = { title: '匠人实录', source: '人民周刊网', url: 'https://www.peopleweekly.cn/html/2025/shipin_0106/236182.html', mediaUrl: 'https://flv4mp4.people.com.cn/videofile7/example.mp4' }
test('外部视频只接受HTTPS原页与核验过的播放器域名', () => {
  assert.equal(resolveVideoPreview(video).mediaUrl, video.mediaUrl)
  assert.equal(resolveVideoPreview({ ...video, mediaUrl: 'https://evil.test/video.mp4' }).mediaUrl, null)
  assert.equal(resolveVideoPreview({ ...video, url: 'javascript:alert(1)' }), null)
  assert.equal(resolveVideoPreview({ ...video, mediaUrl: 'https://user:secret@flv4mp4.people.com.cn/a.mp4' }).mediaUrl, null)
})
test('视频默认可加载；切换来源暂停与释放播放，失败保留原页入口', async () => {
  const props = reactive({ videos: [video, { title: '央视专题', source: '央视网', url: 'https://tv.cctv.com/2015/03/27/VIDE1427460485447669.shtml' }] })
  const p = await setupPage('components/craft/CraftVideoPreview.vue', { resolveVideoPreview }, props)
  assert.equal(p.state.selected.value.mediaUrl, video.mediaUrl)
  assert.equal(p.state.failed.value, false)
  let paused=0,loaded=0,removed=0
  p.state.playerRef.value = { pause(){paused++},removeAttribute(){removed++},load(){loaded++} }
  p.state.failPreview(); assert.equal(p.state.failed.value, true)
  assert.equal(p.state.selected.value.url, video.url)
  p.state.selectVideo(1); await settle()
  assert.equal(p.state.failed.value, false)
  assert.equal(p.state.selected.value.mediaUrl, null)
  p.state.selectVideo(0); await settle()
  assert.equal(p.state.selected.value.mediaUrl, video.mediaUrl)
  assert.equal(p.state.failed.value, false)
  p.dispose(); assert.ok(paused && loaded && removed)
})
