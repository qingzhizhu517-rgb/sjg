<!-- /crafts/workshop：工艺观摩、独立制作状态与本地作品集 -->
<template>
  <div class="craft-workshop folio-page">
    <PageHeading compact eyebrow="齐鲁文化 / 非遗工艺 / 专题工坊" title="一方葫芦，刻出自己的纹样" description="先看匠人实录，再布纹描刻、敷色擦色；把亲手制作的葫芦带走。">
      <template #actions><router-link :to="atlasLink('/crafts', route)" class="folio-button folio-button--quiet">全部非遗工艺 ↗</router-link></template>
    </PageHeading>
    <div class="cw-mode-bar" role="tablist" aria-label="工坊模式">
      <button v-for="item in modes" :id="`mode-${item.id}`" :key="item.id" type="button" role="tab" :aria-selected="mode === item.id" :aria-controls="`panel-${item.id}`" @click="setMode(item.id)">{{ item.label }}</button>
      <span>聊城 · 国家级非遗 · 数字体验</span>
    </div>
    <p v-if="message" class="cw-message" role="status">{{ message }}</p>
    <section v-if="pending" class="cw-confirm" aria-label="确认替换当前作品">
      <p>{{ pending.kind === 'restore' ? '恢复作品将替换当前未保存的笔迹及重做历史。' : '此操作将清除当前笔迹及重做历史；已保存的本地作品会保留。' }}</p>
      <div class="folio-actions"><button type="button" class="folio-button folio-button--primary" @click="confirmAction">确认{{ pending.kind === 'restore' ? '恢复' : '清除并继续' }}</button><button type="button" class="folio-button" @click="workshop.cancelPending">保留当前作品</button></div>
    </section>
    <div v-if="mode === 'watch'" id="panel-watch" role="tabpanel" aria-labelledby="mode-watch"><CraftVideoPreview :videos="HULU_VIDEOS" @make="setMode('make')" @observe="setMode('observe')" /></div>
    <div v-else :id="`panel-${mode}`" class="cw-main" role="tabpanel" :aria-labelledby="`mode-${mode}`">
      <div class="cw-stage-wrap">
        <div class="cw-stage-heading"><div><p>{{ mode === 'observe' ? '工艺观摩 · 教学演示' : mode === 'make' ? '动手制作 · 实际笔迹' : '作品赏鉴 · 当前器物' }}</p><h2>{{ mode === 'observe' ? stepMeta.name : work.name }}</h2></div><span>{{ mode === 'observe' ? String(viewStep + 1).padStart(2, '0') + ' / 05' : HULU_SHAPES.find(s => s.id === work.shape)?.label }}</span></div>
        <HuluStage ref="stageRef" :work="work" :mode="mode" :step="currentStep" :tool="activeTool" :side-light="sideLight" :before-after="beforeAfter" :guide-visible="guideVisible" @ready="onStageReady" @stroke="acceptStroke" @inspect="inspect" @error="onStageError" />
        <div class="cw-view-bar">
          <button v-if="sceneCapability === '3d'" type="button" :aria-pressed="sideLight" :disabled="sceneCapability !== '3d'" @click="sideLight = !sideLight">{{ sideLight ? '恢复柔光' : '侧光看刻痕' }}</button>
          <button v-if="mode !== 'observe'" type="button" :aria-pressed="beforeAfter" :disabled="!work.strokes.length" @click="beforeAfter = !beforeAfter">{{ beforeAfter ? '回到作品' : '对比原坯' }}</button>
          <button v-if="mode === 'make' && [1, 2].includes(makeStep)" type="button" :aria-pressed="guideEnabled" @click="guideEnabled = !guideEnabled">{{ guideEnabled ? '隐藏参考线' : '显示参考线' }}</button>
        </div>
        <KnowledgeCard :info="knowledgeInfo" :active="showKnowledge" @close="showKnowledge = false" />
      </div>

      <!-- 右侧控制面板 -->
      <aside class="cw-panel">
        <template v-if="mode === 'observe'">
          <StepRail :steps="config.steps" :current-step="viewStep" :step-meta="stepMeta" :playing="playing" @prev="prev" @next="next" @toggle-auto="toggleAuto" @jump-to="jumpTo" />
          <div class="cw-intro"><p class="folio-eyebrow">因形构图 · 凹槽留色</p><h3>{{ config.title }}</h3><p>东昌府堂邑的葫芦雕刻，与运河商贸和地方生活相伴。去皮干坯保留自然黄褐色，刻线经敷色、擦色后显出纹样。</p><button type="button" class="folio-button folio-button--primary" @click="setMode('make')">选一只葫芦，开始制作 →</button><small>五段为教学编排，快速变化不代表真实干燥或加工时长。</small></div>
        </template>
        <WorkshopPanel v-else-if="mode === 'make'" :work="work" :step="makeStep" :tool="tool" :scene-capability="sceneCapability" :assessment="assessment" :can-undo="canUndo" :can-redo="canRedo" @choose="workshop.choose" @enter="workshop.enter" @tool="selectTool" @undo="workshop.undo" @redo="workshop.redo" @save="workshop.save" @export="exportArtwork" @reset="workshop.reset" />
        <div v-else class="cw-intro cw-appraisal"><p class="folio-eyebrow">近看一件器物</p><h3>{{ work.strokes.length ? work.name : '你的作品，从一笔开始' }}</h3><p>{{ work.strokes.length ? `已记录 ${work.strokes.length} 笔操作。${sceneCapability === '3d' ? '旋转检视刻线和留白，切换侧光，或回看原坯。' : '检查平面纹样与留白，或回看原坯。'}` : '作品赏鉴展示你的实际笔迹。先进入制作，完成一件属于自己的葫芦。' }}</p><dl v-if="work.strokes.length"><div><dt>数字坯形</dt><dd>{{ HULU_SHAPES.find(s => s.id === work.shape)?.label }}</dd></div><div><dt>原创构图</dt><dd>{{ HULU_MOTIFS.find(m => m.id === work.motif)?.label }}</dd></div><div><dt>制作状态</dt><dd>{{ assessment.canFinish ? '已敷色擦净，可保存' : '练习进行中' }}</dd></div></dl><button type="button" class="folio-button folio-button--primary" @click="setMode('make')">{{ work.strokes.length ? '继续编辑作品' : '开始制作 →' }}</button><button type="button" class="folio-button" :disabled="!assessment.canFinish" @click="workshop.save">保存到本地作品集</button><button type="button" class="folio-button" :disabled="!work.strokes.length || exporting" @click="exportArtwork">{{ exporting ? '正在导出…' : '导出作品图片' }}</button><small>保存最多保留最近 6 件，只在当前浏览器中可用；导出图片可另行保留。</small></div>
      </aside>
    </div>
    <section v-if="mode === 'gallery'" class="cw-library" aria-label="本地作品集">
      <header class="cw-section-heading"><div><p class="folio-eyebrow">器物留痕</p><h2 class="folio-section-title">本地作品集</h2></div><span>{{ library.length }} / 6 件</span></header>
      <p v-if="!library.length" class="cw-empty">尚未保存作品。完成描刻、敷色与擦色后，即可把第一件作品收入此处。</p>
      <div v-else class="cw-library-grid"><article v-for="entry in library" :key="entry.id" class="cw-library-card"><div class="cw-library-card__seal">刻</div><div><h3>{{ entry.work.name }}</h3><p>{{ HULU_SHAPES.find(s => s.id === entry.work.shape)?.label }} · {{ HULU_MOTIFS.find(m => m.id === entry.work.motif)?.label }}</p><small>{{ formatDate(entry.savedAt) }} · {{ entry.work.strokes.length }} 笔</small></div><div class="cw-library-card__actions"><button type="button" @click="restoreWork(entry.id)">恢复并编辑 ↗</button><button v-if="deleting !== entry.id" type="button" @click="deleting = entry.id">移除</button><template v-else><button type="button" @click="removeWork(entry.id)">确认移除</button><button type="button" @click="deleting = null">取消</button></template></div></article></div>
    </section>
    <section class="cw-detail">
      <header class="cw-section-heading"><div><p class="folio-eyebrow">从材料到纹样</p><h2 class="folio-section-title">五段工艺，循序观察</h2></div><button type="button" class="folio-button folio-button--quiet" @click="exportExploration">导出探索记录 ↗</button></header>
      <div class="cw-detail-grid"><button v-for="(item, i) in config.steps" :key="item.key" type="button" class="cw-detail-card" :aria-pressed="mode === 'observe' && viewStep === i" @click="observeStep(i)"><span>{{ item.icon }}</span><h3>{{ item.name }}</h3><p>{{ item.desc }}</p></button></div>
      <p v-if="mode === 'observe' && viewStep === 4" class="cw-observed">已看完五段教学演示。进入「动手制作」留下实际刻线；观摩进度与制作进度分别记录。</p>
    </section>
    <section class="cw-knowledge"><header class="cw-section-heading"><div><p class="folio-eyebrow">器物里的文化</p><h2 class="folio-section-title">材料、刀具与留色</h2></div></header><div class="cw-knowledge-grid"><article v-for="(info, key) in config.knowledge" :key="key"><h3>{{ info.title }}</h3><p>{{ info.body }}</p></article></div></section>
    <SourceList :sources="HULU_SOURCES" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { atlasLink } from '../config/atlasPreview'
import { useHuluWorkshop } from '../composables/useHuluWorkshop.js'
import { HULU_PROCESS, HULU_SOURCES, HULU_VIDEOS } from '../content/crafts/dongchang-hulu.js'
import { HULU_SHAPES, HULU_MOTIFS } from '../utils/huluWorkshop.js'
import PageHeading from '../components/ui/PageHeading.vue'
import HuluStage from '../components/craft/HuluStage.vue'
import WorkshopPanel from '../components/craft/WorkshopPanel.vue'
import CraftVideoPreview from '../components/craft/CraftVideoPreview.vue'
import StepRail from '../components/craft/StepRail.vue'
import KnowledgeCard from '../components/craft/KnowledgeCard.vue'
import SourceList from '../components/SourceList.vue'

const route = useRoute(), config = HULU_PROCESS
const workshop = useHuluWorkshop()
const { work, step: makeStep, tool, assessment, library, message, pending, canUndo, canRedo } = workshop
const modes = [{ id: 'watch', label: '匠人实录' }, { id: 'observe', label: '观摩工序' }, { id: 'make', label: '动手制作' }, { id: 'gallery', label: '作品赏鉴' }]
const mode = ref('watch'), viewStep = ref(0), playing = ref(false), stageRef = ref(null)
const sceneCapability = ref('loading'), sideLight = ref(false), beforeAfter = ref(false), guideEnabled = ref(true)
const knowledgeInfo = ref(null), showKnowledge = ref(false), exporting = ref(false), deleting = ref(null)
const currentStep = computed(() => mode.value === 'observe' ? viewStep.value : mode.value === 'make' ? makeStep.value : 4)
const stepMeta = computed(() => config.steps[viewStep.value])
const activeTool = computed(() => mode.value === 'make' ? tool.value : 'rotate')
const guideVisible = computed(() => mode.value === 'observe' ? viewStep.value === 2 : mode.value === 'make' && [1, 2].includes(makeStep.value) && guideEnabled.value)
let timer = null, disposed = false
const blobUrls = new Set()
const stopAuto = () => { clearInterval(timer); timer = null; playing.value = false }
const visibilityChanged = () => { if (globalThis.document?.hidden) stopAuto() }
onBeforeUnmount(() => {
  disposed = true; stopAuto(); globalThis.document?.removeEventListener('visibilitychange', visibilityChanged)
  blobUrls.forEach(url => URL.revokeObjectURL(url)); blobUrls.clear()
})
const onStageReady = api => { if (!disposed) sceneCapability.value = api ? '3d' : '2d' }
const onStageError = () => { if (!disposed) sceneCapability.value = '2d' }
const setMode = value => {
  if (!modes.some(item => item.id === value)) return
  stopAuto(); mode.value = value; beforeAfter.value = false; showKnowledge.value = false; stageRef.value?.resetView()
}
const jumpTo = index => {
  if (!Number.isInteger(index)) return
  stopAuto(); viewStep.value = Math.max(0, Math.min(4, index)); showKnowledge.value = false; stageRef.value?.resetView()
}
const prev = () => jumpTo(viewStep.value - 1)
const next = () => jumpTo(viewStep.value + 1)
const observeStep = index => { setMode('observe'); jumpTo(index) }
const toggleAuto = () => {
  if (mode.value !== 'observe') return
  if (playing.value) return stopAuto()
  if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return jumpTo(4)
  if (viewStep.value === 4) viewStep.value = 0
  playing.value = true; stageRef.value?.resetView()
  timer = setInterval(() => {
    if (viewStep.value >= 4) return stopAuto()
    viewStep.value++; stageRef.value?.resetView()
    if (viewStep.value === 4) stopAuto()
  }, 3200)
}
const selectTool = value => { beforeAfter.value = false; showKnowledge.value = false; workshop.selectTool(value) }
const acceptStroke = stroke => { if (mode.value === 'make' && !beforeAfter.value) workshop.addStroke(stroke) }
const inspect = info => {
  const part = info.part === 'stem' || info.part === 'base' ? 'gourd_body' : mode.value === 'observe' && viewStep.value === 0 ? 'gourd_raw' : currentStep.value >= 3 ? (currentStep.value === 4 ? 'painted_layer' : 'carved_layer') : 'gourd_body'
  knowledgeInfo.value = config.knowledge[part]; showKnowledge.value = true
}
const confirmAction = () => { const kind = pending.value?.kind; workshop.confirmPending(); if (kind === 'restore') setMode('make') }
const restoreWork = id => { workshop.restore(id); if (!pending.value) setMode('make') }
const removeWork = id => { workshop.remove(id); deleting.value = null }
const formatDate = date => new Date(date).toLocaleDateString('zh-CN')
watch(makeStep, () => { beforeAfter.value = false; showKnowledge.value = false; stageRef.value?.resetView() })
watch(() => work.value.shape, () => stageRef.value?.resetView())
onMounted(() => globalThis.document?.addEventListener('visibilitychange', visibilityChanged))
const download = (blob, filename) => {
  if (disposed) return
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  blobUrls.add(url); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove()
  setTimeout(() => { URL.revokeObjectURL(url); blobUrls.delete(url) }, 1000)
}
const exportArtwork = async () => {
  if (exporting.value || !work.value.strokes.length || !stageRef.value) return
  exporting.value = true
  try {
    const blob = await stageRef.value.exportImage()
    download(blob, `${work.value.name.replace(/[\\/:\u0000-\u001f]/g, '-')}-东昌葫芦.png`)
    if (!disposed) message.value = '作品图片已导出；其中保留的是你的实际刻线。'
  } catch (error) { if (!disposed) message.value = error.message || '图片导出失败，请重试。' }
  finally { exporting.value = false }
}
const exportExploration = () => {
  const lines = [`# ${config.title}探索记录`, '', config.subtitle, '', '五段为数字教学编排，演示时长不代表实际加工时间。', '', '## 工艺', ...config.steps.map((item, i) => `${i + 1}. ${item.name}：${item.desc}`), '', '## 知识点', ...Object.values(config.knowledge).map(info => `- ${info.title}：${info.body}`), '', '## 来源', ...HULU_SOURCES.map(source => `- ${source.authorOrg}：《${source.title}》 ${source.url}；${source.note}`)]
  download(new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' }), 'dongchang-hulu-探索记录.md')
}
</script>

<style scoped>
.craft-workshop { padding-top:28px; }
.cw-mode-bar { display:flex; gap:4px; align-items:center; padding-bottom:20px; margin-bottom:24px; border-bottom:1px solid var(--border); }
.cw-mode-bar button { min-height:44px; padding:10px 22px; border:1px solid transparent; background:transparent; color:var(--text-secondary); cursor:pointer; font-size:var(--fs-body-sm); letter-spacing:1px; }
.cw-mode-bar [aria-selected="true"] { border-color:var(--accent); color:var(--text-on-accent); background:var(--accent); }
.cw-mode-bar > span { margin-left:auto; color:var(--text-muted); font-size:var(--fs-caption); }
.cw-main { display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:28px; align-items:start; }
.cw-stage-wrap, .cw-panel { min-width:0; } .cw-stage-wrap { position:relative; }
.cw-stage-heading { display:flex; justify-content:space-between; align-items:center; padding:0 0 16px; gap:16px; }
.cw-stage-heading p { margin:0 0 5px; font-size:var(--fs-caption); letter-spacing:1px; color:var(--text-muted); }
.cw-stage-heading h2 { margin:0; color:var(--text-primary); font:600 24px/1.5 var(--font-heading); letter-spacing:2px; overflow-wrap:anywhere; }
.cw-stage-heading > span { flex:0 0 auto; font-size:var(--fs-caption); color:var(--text-muted); }
.cw-panel { display:grid; gap:16px; } .cw-intro { padding:24px; border:1px solid var(--border); background:var(--card-bg); border-radius:var(--radius-sm); }
.cw-intro h3 { font:600 22px/1.5 var(--font-heading); letter-spacing:2px; margin:8px 0 14px; }
.cw-intro > p:not(.folio-eyebrow) { color:var(--text-secondary); font-size:var(--fs-body-sm); line-height:1.95; margin:0 0 20px; }
.cw-intro small { display:block; color:var(--text-muted); line-height:1.8; font-size:var(--fs-caption); margin-top:18px; }
.cw-intro .folio-button { width:100%; margin-top:10px; font-size:13px; }
.cw-view-bar { display:flex; flex-wrap:wrap; gap:8px; padding:12px 0; }
.cw-view-bar button { min-height:44px; padding:9px 14px; border:1px solid var(--border); border-radius:var(--radius-sm); background:transparent; color:var(--text-secondary); cursor:pointer; font-size:var(--fs-caption); }
.cw-view-bar [aria-pressed="true"] { color:var(--accent); border-color:var(--accent); background:var(--accent-faint); }
.cw-message { padding:14px 18px; margin:0 0 20px; color:var(--text-secondary); background:var(--bg-secondary); border-left:2px solid var(--accent); font-size:var(--fs-body-sm); line-height:1.8; }
.cw-confirm { border:1px solid var(--accent); padding:18px; margin-bottom:20px; background:var(--accent-faint); }
.cw-confirm p { font-size:var(--fs-body-sm); line-height:1.8; margin:0 0 12px; }
.cw-detail, .cw-library, .cw-knowledge { margin-top:48px; padding-top:28px; border-top:1px solid var(--border); }
.cw-section-heading { display:flex; align-items:end; justify-content:space-between; gap:20px; margin-bottom:24px; }
.cw-section-heading .folio-eyebrow { margin:0 0 8px; } .cw-section-heading h2 { margin:0; }
.cw-section-heading > span { color:var(--text-muted); font-size:var(--fs-caption); }
.cw-detail-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:16px; }
.cw-detail-card { text-align:left; border:1px solid var(--border-light); border-radius:var(--radius-sm); padding:20px; background:transparent; color:var(--text-primary); cursor:pointer; }
.cw-detail-card[aria-pressed="true"] { border-color:var(--accent); background:var(--accent-faint); }
.cw-detail-card > span { display:grid; place-items:center; height:30px; width:30px; font-family:var(--font-display); color:var(--accent); border:1px solid var(--accent-a35); margin-bottom:16px; }
.cw-detail-card h3 { font:600 17px/1.6 var(--font-heading); letter-spacing:1px; margin:0 0 10px; }
.cw-detail-card p { font-size:var(--fs-caption); line-height:1.9; color:var(--text-secondary); margin:0; }
.cw-observed { padding:16px; border-left:2px solid var(--accent); font-size:var(--fs-body-sm); color:var(--text-secondary); line-height:1.8; background:var(--bg-secondary); }
.cw-knowledge-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; }
.cw-knowledge-grid article { border-bottom:1px solid var(--border-light); padding-bottom:18px; }
.cw-knowledge-grid h3 { font:600 17px/1.6 var(--font-heading); margin:0 0 10px; }
.cw-knowledge-grid p { color:var(--text-secondary); font-size:var(--fs-body-sm); line-height:1.9; margin:0; }
.cw-knowledge { margin-bottom:40px; }
.cw-appraisal dl { padding:12px 0; margin:0 0 12px; border-top:1px solid var(--border-light); border-bottom:1px solid var(--border-light); }
.cw-appraisal dl div { display:flex; justify-content:space-between; gap:12px; font-size:var(--fs-caption); line-height:2.2; } .cw-appraisal dt { color:var(--text-muted); } .cw-appraisal dd { margin:0; }
.cw-library-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
.cw-library-card { display:grid; grid-template-columns:36px minmax(0,1fr); gap:16px; padding:22px; border:1px solid var(--border); background:var(--card-bg); }
.cw-library-card__seal { display:grid; place-items:center; width:36px; height:36px; border:1px solid var(--accent-a35); color:var(--accent); font:24px var(--font-display); }
.cw-library-card h3 { overflow-wrap:anywhere; margin:0 0 6px; font:600 18px/1.6 var(--font-heading); }
.cw-library-card p, .cw-library-card small { margin:0; font-size:var(--fs-caption); line-height:1.9; color:var(--text-muted); }
.cw-library-card__actions { grid-column:1/-1; display:flex; flex-wrap:wrap; justify-content:space-between; gap:8px; border-top:1px solid var(--border-light); padding-top:12px; }
.cw-library-card__actions button { border:0; background:transparent; color:var(--accent); min-height:44px; cursor:pointer; font-size:var(--fs-caption); }
.cw-empty { padding:24px; background:var(--bg-secondary); color:var(--text-secondary); font-size:var(--fs-body-sm); line-height:1.8; }
button:disabled { opacity:.45; cursor:default; }
@media (max-width:1100px) { .cw-main { grid-template-columns:minmax(0,1fr) 320px; gap:20px; } .cw-detail-grid { gap:10px; } .cw-detail-card { padding:16px; } }
@media (max-width:900px) { .cw-main { grid-template-columns:minmax(0,1fr); } .cw-panel { grid-template-columns:minmax(0,1fr); } .cw-mode-bar > span { display:none; } .cw-detail-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .cw-knowledge-grid, .cw-library-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:600px) { .cw-mode-bar { gap:0; } .cw-mode-bar button { flex:1; padding:10px 8px; font-size:13px; letter-spacing:0; } .cw-section-heading { align-items:start; flex-direction:column; gap:12px; } .cw-stage-heading h2 { font-size:21px; } .cw-detail-grid, .cw-knowledge-grid, .cw-library-grid { grid-template-columns:1fr; } .cw-detail-card { display:grid; grid-template-columns:32px 1fr; gap:8px 14px; } .cw-detail-card > span { grid-row:1/3; margin:0; } .cw-detail-card h3 { margin:0; } .cw-detail-card p { grid-column:2; } }
</style>
