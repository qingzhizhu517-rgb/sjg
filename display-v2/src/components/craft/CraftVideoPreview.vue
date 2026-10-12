<template>
  <section v-if="selected" class="craft-video" aria-label="非遗匠人实录">
    <div class="craft-video__main">
      <div class="craft-video__screen">
        <video v-if="selected.mediaUrl && !failed" ref="playerRef" :key="selected.url" :src="selected.mediaUrl" controls playsinline preload="auto" controlslist="nodownload" :aria-label="selected.title" @error="failPreview" />
        <div v-else class="craft-video__cover">
          <span class="craft-video__seal">刻</span><p>匠人实录 · 东昌葫芦</p><h2>{{ selected.title }}</h2>
          <p v-if="failed" role="status">视频暂时无法加载，可前往来源原页观看。</p>
          <a v-if="!selected.mediaUrl || failed" :href="selected.url" target="_blank" rel="noopener noreferrer" class="folio-button">到{{ selected.source }}观看 ↗</a>
        </div>
      </div>
      <div class="craft-video__caption"><span>{{ selected.source }} · {{ selected.date }}</span><a :href="selected.url" target="_blank" rel="noopener noreferrer">查看原文与视频 ↗</a></div>
      <p class="craft-video__note">{{ selected.note }} 视频由来源网站提供，可直接在此播放。</p>
    </div>
    <aside class="craft-video__aside">
      <p class="folio-eyebrow">从观看到创作</p><h3>先看手艺，再试一笔</h3><p>留意天然葫芦的形态、刀下的细线与作品留白。带着观察，试着做一件自己的数字作品。</p>
      <ol><li>看器物：腹部与束腰如何安排纹样</li><li>看工艺：区分刀刻、针雕与烙画</li><li>试制作：布纹、描刻、敷色与擦色</li></ol>
      <button type="button" class="folio-button folio-button--primary" @click="$emit('make')">试着亲手做一件 →</button>
      <button type="button" class="folio-button" @click="$emit('observe')">先看五段工序演示</button>
      <div class="craft-video__sources" aria-label="选择视频资料"><button v-for="(item, i) in available" :key="item.url" type="button" :aria-pressed="index === i" @click="selectVideo(i)"><span>{{ item.source }}</span>{{ item.title }}<small>{{ item.mediaUrl ? '页内预览' : '原页观看' }}</small></button></div>
    </aside>
  </section>
  <p v-else>暂无可用的视频资料。</p>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { resolveVideoPreview } from '../../utils/craftVideo.js'
const props = defineProps({ videos: { type: Array, default: () => [] } })
defineEmits(['make', 'observe'])
const index = ref(0), failed = ref(false), playerRef = ref(null)
const available = computed(() => props.videos.map(resolveVideoPreview).filter(Boolean))
const selected = computed(() => available.value[index.value] || available.value[0])
const releasePlayer = () => { const player = playerRef.value; if (player) { player.pause(); player.removeAttribute('src'); player.load() } }
const stopPreview = () => { releasePlayer(); failed.value = false }
const failPreview = () => { releasePlayer(); failed.value = true }
const selectVideo = value => { if (available.value[value] && index.value !== value) { stopPreview(); index.value = value } }
watch(() => selected.value?.url, stopPreview)
onBeforeUnmount(releasePlayer)
</script>

<style scoped>
.craft-video { display:grid; grid-template-columns:minmax(0,1fr) 320px; gap:32px; align-items:start; }
.craft-video__main, .craft-video__aside { min-width:0; }
.craft-video__screen { aspect-ratio:16/9; background:#e8dfce; border:1px solid var(--border); overflow:hidden; }
.craft-video video { display:block; width:100%; height:100%; object-fit:contain; background:#242018; }
.craft-video__cover { width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:16px; padding:28px; background:radial-gradient(ellipse at 50% 30%,#f8f3e7,transparent 75%); }
.craft-video__seal { width:52px; height:52px; display:grid; place-items:center; border:1px solid var(--accent); color:var(--accent); font:32px var(--font-display); }
.craft-video__cover p { margin:0; color:var(--text-secondary); font-size:var(--fs-caption); line-height:1.8; }
.craft-video__cover h2 { margin:0 0 8px; max-width:580px; font:600 clamp(18px,2.1vw,28px)/1.6 var(--font-heading); color:var(--text-primary); }
.craft-video__caption { display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; padding:14px 0; border-bottom:1px solid var(--border); font-size:var(--fs-caption); color:var(--text-secondary); }
.craft-video a { color:var(--accent); } .craft-video__note { font-size:var(--fs-caption); line-height:1.9; color:var(--text-secondary); }
.craft-video__aside h3 { font:600 25px/1.5 var(--font-heading); margin:10px 0 14px; }
.craft-video__aside > p:not(.folio-eyebrow), .craft-video__aside li { font-size:var(--fs-body-sm); line-height:1.9; color:var(--text-secondary); }
.craft-video__aside ol { padding-left:22px; margin:20px 0 24px; } .craft-video__aside > button { width:100%; min-height:44px; margin-bottom:10px; font-size:13px; }
.craft-video__sources { display:grid; gap:10px; margin-top:24px; padding-top:20px; border-top:1px solid var(--border); }
.craft-video__sources button { text-align:left; border:1px solid var(--border); background:transparent; padding:14px; color:var(--text-primary); font:14px/1.8 var(--font-body); cursor:pointer; }
.craft-video__sources span, .craft-video__sources small { display:block; font-size:12px; color:var(--text-secondary); }
.craft-video__sources [aria-pressed="true"] { border-color:var(--accent); background:var(--accent-faint); }
@media(max-width:900px) { .craft-video { grid-template-columns:minmax(0,1fr); gap:24px; } .craft-video__sources { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:600px) { .craft-video__screen { aspect-ratio:auto; min-height:280px; } .craft-video video { aspect-ratio:16/9; min-height:240px; } .craft-video__cover { min-height:280px; padding:20px; gap:12px; } .craft-video__seal { width:40px; height:40px; font-size:26px; } .craft-video__sources { grid-template-columns:1fr; } }
</style>
