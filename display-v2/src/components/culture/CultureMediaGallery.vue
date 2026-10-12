<template>
  <section v-if="active" class="culture-media-gallery" aria-label="作品与现场资料">
    <header>
      <p class="folio-eyebrow">{{ active.kind === 'video' ? '视频资料' : active.kind === 'audio' ? '原声资料' : active.presentation === 'archive' ? '图像文献' : '作品与现场' }}</p>
      <h2>{{ active.title || itemTitle }}</h2>
    </header>
    <figure>
      <div class="culture-media-gallery__stage">
        <video v-if="active.kind === 'video' && !failed" ref="playerRef" :key="active.url" :poster="active.poster" controls playsinline preload="auto" :aria-label="active.title || itemTitle" @error="failMedia()" />
        <img v-else-if="active.kind === 'image' && !failed" :key="active.url" :src="active.url" :alt="active.title || itemTitle" :width="active.width" :height="active.height" @error="failMedia()" />
        <audio v-else-if="active.kind === 'audio' && !failed" ref="playerRef" :key="active.url" controls preload="metadata" :aria-label="active.title || itemTitle" @error="failMedia()" />
        <div v-else class="culture-media-gallery__fallback" role="status">
          <p>来源素材暂时无法载入，可打开原页观看。</p>
          <a :href="active.sourceUrl" target="_blank" rel="noopener noreferrer">前往{{ active.authorOrg || '来源网站' }} ↗</a>
          <button type="button" @click="retryMedia">重新加载</button>
        </div>
      </div>
      <figcaption>
        <span>{{ active.authorOrg || '来源机构' }}<template v-if="active.caption"> · {{ active.caption }}</template></span>
        <a :href="active.sourceUrl" target="_blank" rel="noopener noreferrer">查看素材原页 ↗</a>
      </figcaption>
      <p v-if="active.note" class="culture-media-gallery__note">{{ active.note }}</p>
    </figure>
    <div v-if="available.length > 1" class="culture-media-gallery__navigation" aria-label="选择作品或影像">
      <button v-for="(asset, i) in available" :key="asset.url" type="button" :aria-pressed="index === i" @click="selectAsset(i)">
        <span>{{ String(i + 1).padStart(2, '0') }}</span>{{ asset.title || (asset.kind === 'video' ? '观看实录' : asset.kind === 'audio' ? '聆听原声' : '查看图像') }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { safeSourceUrl } from '../../utils/source.js'

const props = defineProps({ assets: { type: Array, default: () => [] }, itemTitle: { type: String, default: '' } })
const index = ref(0), failed = ref(false), playerRef = ref(null)
const kindPriority = { video: 0, image: 1, audio: 2 }
const secureUrl = value => { const url = safeSourceUrl(value); return url.startsWith('https://') ? url : '' }
const available = computed(() => (Array.isArray(props.assets) ? props.assets : [])
  .filter(asset => asset && asset.inlineVerified === true && Object.hasOwn(kindPriority, asset.kind))
  .map(asset => ({ ...asset, url: secureUrl(asset.url), sourceUrl: safeSourceUrl(asset.sourceUrl), poster: secureUrl(asset.poster) }))
  .filter(asset => asset.url && asset.sourceUrl)
  .sort((left, right) => kindPriority[left.kind] - kindPriority[right.kind]))
const active = computed(() => available.value[index.value] || available.value[0])
let hls = null, currentPlayer = null, connectionId = 0

function releasePlayer() {
  connectionId++
  hls?.destroy()
  hls = null
  if (currentPlayer) {
    currentPlayer.pause()
    currentPlayer.removeAttribute('src')
    currentPlayer.load()
    currentPlayer = null
  }
}

function failMedia(url = active.value?.url) {
  if (url !== active.value?.url) return
  releasePlayer()
  failed.value = true
}

function setNativeSource(player, asset) {
  player.src = asset.url
  player.load()
}

async function connectPlayer(player, asset = active.value, loadHls = () => import('hls.js')) {
  releasePlayer()
  if (!player || !asset || asset.kind === 'image' || failed.value) return
  currentPlayer = player
  const requestId = connectionId
  const isHls = asset.kind === 'video' && (asset.format === 'hls' || /\.m3u8$/i.test(new URL(asset.url).pathname))
  if (!isHls) { setNativeSource(player, asset); return }
  try {
    const { default: Hls } = await loadHls()
    if (requestId !== connectionId) return
    if (Hls.isSupported()) {
      hls = new Hls()
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal && requestId === connectionId) failMedia(asset.url)
      })
      hls.loadSource(asset.url)
      hls.attachMedia(player)
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) setNativeSource(player, asset)
    else failMedia(asset.url)
  } catch {
    if (requestId !== connectionId) return
    if (player.canPlayType('application/vnd.apple.mpegurl')) setNativeSource(player, asset)
    else failMedia(asset.url)
  }
}

function selectAsset(value) {
  if (available.value[value] && index.value !== value) index.value = value
}
function retryMedia() { failed.value = false }
watch(() => [props.assets, props.itemTitle], () => { index.value = 0; failed.value = false }, { deep: true, flush: 'sync' })
watch(() => active.value?.url, () => { releasePlayer(); failed.value = false }, { flush: 'sync' })
watch(() => [active.value?.url, playerRef.value, props.itemTitle], () => { if (playerRef.value) void connectPlayer(playerRef.value); else releasePlayer() }, { flush: 'post' })
onBeforeUnmount(releasePlayer)
</script>

<style scoped>
.culture-media-gallery { margin:36px 0 42px; }
.culture-media-gallery > header { display:flex; align-items:baseline; gap:18px; flex-wrap:wrap; margin-bottom:16px; }
.culture-media-gallery h2 { font:500 clamp(20px,2vw,26px)/1.6 var(--font-heading); }
.culture-media-gallery__stage { display:grid; place-items:center; min-height:240px; background:var(--bg-secondary); border:1px solid var(--border); }
.culture-media-gallery video { display:block; width:100%; aspect-ratio:16/9; object-fit:contain; background:#242018; }
.culture-media-gallery img { display:block; max-width:100%; max-height:650px; width:auto; height:auto; object-fit:contain; }
.culture-media-gallery audio { width:min(540px,90%); }
.culture-media-gallery__fallback { display:grid; justify-items:center; gap:14px; padding:32px; color:var(--text-secondary); text-align:center; }
.culture-media-gallery__fallback button { min-height:44px; border:1px solid var(--border); padding:8px 16px; background:transparent; color:var(--text-primary); font:13px var(--font-body); }
.culture-media-gallery figcaption { display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px; padding:14px 0; color:var(--text-secondary); font-size:12px; line-height:1.8; border-bottom:1px solid var(--border); }
.culture-media-gallery__note { margin:14px 0 0; padding-left:12px; border-left:2px solid var(--border); color:var(--text-secondary); font-size:13px; line-height:1.9; }
.culture-media-gallery a { color:var(--reading-green); text-decoration:underline; text-underline-offset:4px; }
.culture-media-gallery__navigation { display:flex; gap:10px; overflow-x:auto; margin-top:16px; padding-bottom:6px; }
.culture-media-gallery__navigation button { flex:0 0 auto; max-width:300px; min-height:44px; padding:10px 15px; border:1px solid var(--border); background:transparent; color:var(--text-secondary); font:13px/1.6 var(--font-body); text-align:left; scroll-margin-block:160px 32px; }
.culture-media-gallery__navigation button span { margin-right:8px; color:var(--accent); }
.culture-media-gallery__navigation [aria-pressed="true"] { border-color:var(--accent); background:var(--accent-faint); }
.culture-media-gallery button:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
@media(max-width:600px) { .culture-media-gallery { margin:24px 0; } .culture-media-gallery__stage { min-height:180px; } .culture-media-gallery__navigation button { max-width:220px; } }
</style>
