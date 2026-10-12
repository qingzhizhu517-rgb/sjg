<template>
  <section class="culture-resources" aria-labelledby="culture-media-heading">
    <header><p class="folio-eyebrow">继续观察</p><h2 id="culture-media-heading" class="folio-section-title">来源原页与影像</h2><p>前往资料原页，继续了解{{ itemTitle }}的现场、作品与讲述。</p></header>
    <div class="culture-resources__grid">
      <article v-for="resource in validMedia" :key="resource.url" class="culture-resource">
        <video v-if="inlineVideo(resource) && !failed.has(resource.url)" :src="inlineVideo(resource)" controls playsinline preload="metadata" :aria-label="resource.title" @error="failed.add(resource.url)" />
        <div class="culture-resource__body">
          <span class="culture-resource__kind">{{ kindLabel(resource.kind) }}</span><h3>{{ resource.title }}</h3>
          <p v-if="resource.note">{{ resource.note }}</p><p v-if="failed.has(resource.url)" role="status">页内视频暂未载入，可打开来源原页。</p>
          <a :href="safeSourceUrl(resource.url)" target="_blank" rel="noopener noreferrer" class="folio-button">{{ resource.kind === 'video' ? '观看来源视频' : resource.kind === 'audio' ? '收听来源音频' : resource.kind === 'image' ? '查看原页图像' : '阅读来源资料' }} ↗</a>
          <small>由来源机构提供 · {{ inlineVideo(resource) ? '页内预览及原页观看' : '在来源原页观看' }}</small>
        </div>
      </article>
    </div>
  </section>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { safeSourceUrl } from '../../utils/source.js'
const props = defineProps({ media: { type: Array, default: () => [] }, itemTitle: { type: String, default: '' } })
const failed = ref(new Set())
const validMedia = computed(() => props.media.filter(resource => safeSourceUrl(resource.url)))
const kindLabel = kind => ({ video: '视频实录', audio: '声音档案', image: '图像资料', article: '图文资料' }[kind] || '来源资料')
// Inline playback is opt-in only for a reviewed source-owned MP4; web pages stay links.
function inlineVideo(resource) {
  const url = safeSourceUrl(resource.inlineUrl)
  if (!url || resource.inlineVerified !== true) return ''
  const parsed = new URL(url)
  return parsed.protocol === 'https:' && parsed.hostname === 'flv4mp4.people.com.cn' && /\.mp4$/i.test(parsed.pathname) ? url : ''
}
watch(() => props.media, () => { failed.value = new Set() })
</script>
<style scoped>
.culture-resources > header > p:last-child { font-size:var(--fs-body-sm); line-height:1.9; color:var(--text-secondary); margin:12px 0 24px; }
.culture-resources__grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
.culture-resource { border:1px solid var(--border); min-width:0; background:var(--card-bg); }
.culture-resource video { display:block; width:100%; aspect-ratio:16/9; background:var(--text-primary); }
.culture-resource__body { padding:22px; }
.culture-resource__kind { color:var(--reading-green); font-size:12px; letter-spacing:2px; }
.culture-resource h3 { font:600 18px/1.6 var(--font-heading); margin:10px 0 16px; }
.culture-resource p { font-size:13px; line-height:1.8; color:var(--text-secondary); }
.culture-resource small { display:block; font-size:11px; color:var(--text-secondary); margin-top:14px; }
@media(max-width:600px) { .culture-resources__grid { grid-template-columns:1fr; } }
</style>
