<template>
  <main class="reading-workspace">
    <header class="reading-hero">
      <img class="reading-landscape" src="/media/inkwash/reading/reading-landscape-v1.webp" alt="" aria-hidden="true" />
      <router-link class="reading-back" :to="atlasLink(query.returnTo, route)">← 返回作品与山河</router-link>
      <p class="reading-eyebrow">一山一水 · 两种写法</p>
      <h1>AI 对照阅读<span class="hero-seal" aria-hidden="true">对读</span></h1>
      <p class="reading-description">并读两篇作品，从原句里寻找不同，再写下自己的判断。</p>
      <div class="reading-process" aria-label="阅读步骤"><span>01 读原文</span><span>02 找线索</span><span>03 留依据</span></div>
    </header>

    <section class="reading-selector" aria-labelledby="selector-title">
      <div class="selector-heading"><div><span class="section-index">01</span><h2 id="selector-title">选择两篇作品</h2></div><button type="button" class="quiet-button" :aria-expanded="catalogOpen" aria-controls="reading-catalog" @click="catalogOpen = !catalogOpen">{{ catalogOpen ? '收起选材' : '展开选材' }} <span aria-hidden="true">{{ catalogOpen ? '−' : '+' }}</span></button></div>
      <div class="current-materials"><button v-for="(material, index) in materials" :key="index" type="button" :class="{ active: choosingLabel === labels[index] && catalogOpen }" @click="openChooser(labels[index])"><span class="small-seal">{{ labels[index] }}</span><span>{{ material?.title || '请选择一篇作品' }}</span><span class="current-change">更换 ↗</span></button></div>
      <div v-if="catalogOpen" id="reading-catalog" class="reading-catalog">
        <form class="catalog-search" @submit.prevent="loadCatalog(1)"><label class="region-field"><span class="sr-only">筛选城市</span><select v-model="region" :disabled="preview" @change="changeRegion"><option value="">沿黄九城</option><option v-for="city in NINE_CITIES" :key="city">{{ city }}</option></select></label><label class="keyword-field"><span class="sr-only">作品或原文关键词</span><input v-model="keyword" type="search" placeholder="搜作品或原文" maxlength="100" /></label><button type="submit" class="paper-button" :disabled="catalogLoading">{{ catalogLoading ? '查找中…' : '查找作品' }}</button></form>
        <div class="catalog-target" role="status">正在为材料 <strong>{{ choosingLabel }}</strong> 选一篇{{ preview ? ' · 设计预览样本' : ' · 仅显示已发布作品' }}</div>
        <p v-if="catalogError" class="reading-alert" role="alert">{{ catalogError }} <button type="button" class="quiet-button" @click="loadCatalog(page)">重新加载</button></p>
        <div v-else-if="catalogLoading" class="catalog-empty" role="status">正在查找作品…</div>
        <div v-else-if="!catalog.length" class="catalog-empty"><p>{{ keyword || region ? '没有找到符合筛选条件的已发布作品。可以换个关键词或城市。' : '这里暂时没有可选的已发布作品。内容完成审核与发布后会出现在这里。' }}</p><router-link class="sample-link" :to="sampleLink">查看对读样本 ↗</router-link></div>
        <ul v-else class="catalog-items"><li v-for="poem in catalog" :key="poem.id"><button type="button" :disabled="materials.some(material => material?.id === poem.id)" @click="choosePoem(poem.id)"><span>{{ poem.title || '未题名作品' }}</span><small>{{ poem.poetName || '打开原文查看作者' }}</small><span class="catalog-add" aria-hidden="true">{{ materials.some(material => material?.id === poem.id) ? '已选' : '+' }}</span></button></li></ul>
        <div v-if="total > pageSize" class="catalog-pagination"><button type="button" class="quiet-button" :disabled="page <= 1 || catalogLoading" @click="loadCatalog(page - 1)">← 上一页</button><span>{{ page }} / {{ Math.ceil(total / pageSize) }}</span><button type="button" class="quiet-button" :disabled="page * pageSize >= total || catalogLoading" @click="loadCatalog(page + 1)">下一页 →</button></div>
      </div>
    </section>

    <p v-if="contextNotice" class="context-notice" role="status">{{ contextNotice }}</p>
    <div class="reading-desk">
    <section class="reading-originals" aria-label="两篇作品原文">
      <ReadingMaterial v-for="(material, index) in materials" :key="labels[index]" :label="labels[index]" :material="material" :loading="materialsLoading" :error="materialErrors[index]" :selected="selected" :can-select="pairReady" :highlight="highlight" :detail-link="material ? atlasLink(`/poems/${material.id}`, route) : ''" @choose="openChooser" @select="toggleSelection" @retry="loadMaterials" />
    </section>

    <section class="reading-sources" aria-label="两篇作品的来源资料">
      <SourceList v-if="mergedSources.length" :sources="mergedSources" />
      <p v-for="material in materials.filter(Boolean).filter(item => !item.sources.length)" :key="material.label" class="source-missing"><span class="small-seal">据</span>材料 {{ material.label }}《{{ material.title }}》{{ preview ? '为设计样本，未提供文献来源。' : '尚未登记来源。阅读时请区分原文和后续解读。' }}</p>
    </section>

    <div class="reading-analysis-grid">
      <section class="reading-ai-panel" aria-labelledby="ai-reading-title">
        <header class="panel-heading"><span class="section-index">02</span><div><h2 id="ai-reading-title">寻找比较线索</h2><p>AI 提出问题与推断，原句才是判断的依据。</p></div><span class="ai-identity">{{ preview ? '导读示例' : 'AI 解读' }}</span></header>
        <div class="focus-chips" role="group" aria-label="比较方向"><button v-for="item in focusOptions" :key="item.value" type="button" :class="{ active: focus === item.value }" :aria-pressed="focus === item.value" @click="changeFocus(item.value)">{{ item.label }}</button></div>
        <p class="focus-prompt">{{ focusOptions.find(item => item.value === focus)?.prompt }}</p>
        <div v-if="preview" class="model-note">导读示例 · 非实时AI。样本关联未经本平台审核。</div>
        <div v-else class="model-note" :class="{ 'model-unavailable': modelStatus === 'unconfigured' }" role="status"><span>{{ modelLabel }}</span><button v-if="modelStatus === 'unknown'" type="button" class="quiet-button" @click="loadModelStatus">重查配置状态</button></div>
        <div class="generation-actions"><button v-if="preview" type="button" class="primary-button" :disabled="!pairReady" @click="showSampleGuide">查看导读示例 <span aria-hidden="true">↗</span></button><button v-else type="button" class="primary-button" :disabled="!canGenerate || generating" @click="generate('compare')">{{ generating && ai.mode === 'compare' ? '正在寻找线索…' : '寻找比较线索' }} <span aria-hidden="true">↗</span></button><button v-if="generating" type="button" class="paper-button" @click="stopGeneration">停止生成</button><button v-else-if="!preview && ['error', 'interrupted', 'stopped'].includes(ai.status) && ai.mode === 'compare'" type="button" class="quiet-button" :disabled="!canGenerate" @click="generate('compare')">重新尝试</button><button v-if="ai.status === 'error'" type="button" class="quiet-button" @click="loadMaterials">重新读取两篇原文</button></div>
        <div v-if="ai.mode !== 'feedback'" class="ai-output" tabindex="0" aria-label="AI比较线索，可滚动阅读"><p v-if="ai.status !== 'idle'" class="generation-state" role="status">{{ generationLabel }}</p><p v-if="ai.error" class="reading-alert" role="alert">{{ ai.error }}</p><ReadingAiResponse :text="ai.text" :materials="referenceMaterials" @reference="jumpToReference" /></div>
        <p class="ai-footnote">带行号的标记可跳回原文。请核对引用，保留你自己的判断。</p>
      </section>

      <section class="reading-reflection" aria-labelledby="reflection-title">
        <header class="panel-heading"><span class="section-index">03</span><div><h2 id="reflection-title">留下我的判断</h2><p>从你选的原句出发，写下相同与不同。</p></div></header>
        <div class="selected-evidence"><div class="evidence-heading"><h3>我的选句证据</h3><span>{{ selected.length }} 句</span></div><p v-if="!selected.length" class="evidence-empty">点击上方原句加入证据，再想一想它为何支持你的判断。</p><ul v-else><li v-for="item in selected" :key="`${item.label}:${item.number}`"><button type="button" class="evidence-reference" @click="jumpToReference(item)">[{{ item.label }}:{{ item.number }}]</button><span>{{ item.text }}</span><button type="button" class="remove-evidence" :aria-label="`移除材料${item.label}第${item.number}行证据`" @click="toggleSelection(item)">×</button></li></ul></div>
        <label for="reading-answer" class="answer-label">我的思考</label><textarea id="reading-answer" v-model="answer" maxlength="3000" rows="6" :disabled="!pairReady" placeholder="两篇作品怎样写出不同的山水感受？我从哪些原句看出来？" /><div class="answer-meta"><span>保存在当前浏览器 · {{ savedLabel }}</span><span>{{ answer.length }} / 3000</span></div>
        <p v-if="storageNotice" class="reading-alert" role="status">{{ storageNotice }}</p>
        <button type="button" class="paper-button feedback-button" :disabled="preview || !canGenerate || generating || !answer.trim()" @click="generate('feedback')">{{ generating && ai.mode === 'feedback' ? '正在检查依据…' : '检查我的依据' }} <span aria-hidden="true">↗</span></button><p class="feedback-hint">{{ preview ? '样本模式不调用模型，可自由记录与导出。' : 'AI 只提示证据和推理中的遗漏，判断仍由你完成。' }}</p>
        <p v-if="feedbackNotice" class="reading-alert" role="status">{{ feedbackNotice }}</p><div v-if="ai.mode === 'feedback'" class="feedback-output"><span class="ai-identity">AI 依据检查</span><p class="generation-state" role="status">{{ generationLabel }}</p><p v-if="ai.error" class="reading-alert" role="alert">{{ ai.error }}</p><ReadingAiResponse :text="ai.text" :materials="referenceMaterials" @reference="jumpToReference" /><button v-if="['error', 'interrupted', 'stopped'].includes(ai.status)" type="button" class="quiet-button" :disabled="!canGenerate || !answer.trim()" @click="generate('feedback')">重新检查依据</button></div>
      </section>
    </div>
    </div>
    <footer class="reading-export"><div><h2>把这一页，收进你的阅读札记</h2><p>导出原文、实际来源、选句与个人思考。</p></div><label class="include-ai"><input v-model="includeAi" type="checkbox" :disabled="!ai.text" />{{ preview ? '附上导读示例' : '附上 AI 解读与生成状态' }}</label><button type="button" class="paper-button" :disabled="!pairReady" @click="exportReading">导出阅读札记 ↓</button></footer>
  </main>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/index.js'
import { apiUrl } from '../api/url.js'
import { atlasLink, isAtlasPreview, previewPoems, previewPoets, previewDynasties } from '../config/atlasPreview.js'
import { NINE_CITIES } from '../config/nineCities.js'
import ReadingMaterial from '../components/reading/ReadingMaterial.vue'
import ReadingAiResponse from '../components/reading/ReadingAiResponse.vue'
import SourceList from '../components/SourceList.vue'
import { parseReadingQuery, normalizeReadingMaterial, readingPairKey, readReadingDraft, saveReadingDraft, findReadingReference, mergeReadingSources, getReadingStorage, positiveReadingId } from '../utils/readingState.js'
import { createReadingStream } from '../utils/readingStream.js'
import { buildReadingExportMarkdown } from '../utils/readingExport.js'

const route = useRoute(), router = useRouter()
const query = computed(() => parseReadingQuery(route.query)), preview = computed(() => isAtlasPreview(route))
const labels = ['A', 'B'], pageSize = 12
const materials = ref([null, null]), materialErrors = ref(['', '']), materialsLoading = ref(false)
const catalog = ref([]), catalogLoading = ref(false), catalogError = ref(''), catalogOpen = ref(false), choosingLabel = ref('A')
const keyword = ref(''), region = ref(query.value.region), page = ref(1), total = ref(0), contextNotice = ref('')
const modelStatus = ref('checking'), focus = ref('imagery')
const answer = ref(''), selected = ref([]), storageNotice = ref(''), savedLabel = ref('尚未记录'), includeAi = ref(false), highlight = ref(null), feedbackNotice = ref('')
const focusOptions = [
  { value: 'imagery', label: '意象', prompt: '同样的山水，哪些事物被看见？它们怎样组合？' },
  { value: 'perspective', label: '视角', prompt: '作者站在哪里，又把目光投向了哪里？' },
  { value: 'emotion', label: '情绪', prompt: '哪些原句传递了感受？你的理解有哪些依据？' },
  { value: 'language', label: '语言', prompt: '词语、节奏与动静，怎样改变阅读的感受？' },
]
const ai = ref({ status: 'idle', text: '', materials: [], error: '', mode: 'compare' })
const stream = createReadingStream(value => { ai.value = value })
const pairReady = computed(() => materials.value.every(Boolean) && materials.value[0].id !== materials.value[1].id && !materialsLoading.value)
const generating = computed(() => ['waiting', 'streaming'].includes(ai.value.status))
const canGenerate = computed(() => pairReady.value && !preview.value && modelStatus.value !== 'unconfigured' && modelStatus.value !== 'checking')
const mergedSources = computed(() => mergeReadingSources(materials.value))
const referenceMaterials = computed(() => ai.value.materials.length ? ai.value.materials : materials.value.filter(Boolean))
const sampleLink = computed(() => ({ path: '/reading', query: { preview: 'inkwash', poem: '301', compare: '306', returnTo: query.value.returnTo } }))
const modelLabel = computed(() => ({ checking: '正在确认生成配置…', configured: '已配置生成服务，可以主动尝试。实际结果以本次请求为准。', unconfigured: '生成尚未配置。原文阅读、选句与笔记仍可使用。', unknown: '暂时无法确认生成配置。你可以重查状态，或主动尝试生成。', sample: '设计预览样本' }[modelStatus.value]))
const generationLabel = computed(() => ({ waiting: '等待生成 · 正在准备原文依据', streaming: '正在生成 · 可随时停止', complete: '本次生成已完成 · AI解读需核对原文', stopped: '已停止 · 收到的文字尚未完成', interrupted: '生成中断 · 已保留收到的文字', error: '生成失败 · 已保留收到的文字', sample: '导读示例 · 非实时AI' }[ai.value.status] || ''))
let materialSequence = 0, catalogSequence = 0, modelSequence = 0, initSequence = 0, materialController, saveTimer, highlightTimer
let draftKey = '', restoring = false, draftDirty = false, disposed = false

async function loadModelStatus() {
  const sequence = ++modelSequence
  if (preview.value) { modelStatus.value = 'sample'; return }
  modelStatus.value = 'checking'
  try {
    const result = await api.get('/ai/status')
    if (sequence !== modelSequence || disposed) return
    modelStatus.value = result.generationConfigured === true && result.reason === 'configured' ? 'configured'
      : result.generationConfigured === false && result.reason === 'not_configured' ? 'unconfigured' : 'unknown'
  } catch { if (sequence === modelSequence && !disposed) modelStatus.value = 'unknown' }
}
async function loadCatalog(nextPage = 1) {
  const sequence = ++catalogSequence
  page.value = nextPage; catalogLoading.value = true; catalogError.value = ''
  try {
    let result
    if (preview.value) {
      const filtered = previewPoems.filter(poem => !keyword.value.trim() || `${poem.title} ${poem.content || ''}`.includes(keyword.value.trim()))
      result = { records: filtered.slice((nextPage - 1) * pageSize, nextPage * pageSize), total: filtered.length }
    } else result = await api.get('/poems', { params: { page: nextPage, size: pageSize, keyword: keyword.value.trim(), region: region.value } })
    if (sequence !== catalogSequence || disposed) return
    catalog.value = Array.isArray(result?.records) ? result.records.filter(poem => positiveReadingId(poem?.id)).map(poem => ({ ...poem, id: Number(poem.id) })) : []
    total.value = Number.isFinite(Number(result?.total)) ? Number(result.total) : catalog.value.length
  } catch (error) {
    if (sequence === catalogSequence && !disposed) { catalog.value = []; total.value = 0; catalogError.value = error.message || '作品列表暂时无法读取，请检查网络后重试。' }
  } finally { if (sequence === catalogSequence && !disposed) catalogLoading.value = false }
}
function persistDraft() {
  clearTimeout(saveTimer)
  if (!draftKey || restoring || !draftDirty) return
  const saved = saveReadingDraft(getReadingStorage(), draftKey, { answer: answer.value, selected: selected.value })
  savedLabel.value = saved ? '已保存本机' : '尚未保存'
  if (saved) { draftDirty = false; storageNotice.value = '' }
  else storageNotice.value = '当前浏览器无法保存笔记。内容仍可编辑，请导出阅读札记。'
}
function restoreDraft() {
  restoring = true; draftKey = readingPairKey(materials.value)
  // 预览与正式材料即使 ID 偶然相同，也各自保存。
  if (draftKey && preview.value) draftKey += ':preview'
  answer.value = ''; selected.value = []; draftDirty = false; savedLabel.value = '尚未记录'; storageNotice.value = ''
  if (draftKey) {
    const result = readReadingDraft(getReadingStorage(), draftKey, materials.value)
    if (result.draft) { answer.value = result.draft.answer; selected.value = result.draft.selected; savedLabel.value = '已恢复本机草稿' }
    if (result.changedEvidence) storageNotice.value = '原文或行号已变化，失配的旧选句没有恢复。个人思考已保留，请重新核对并选句。'
    if (result.status === 'unavailable') storageNotice.value = '当前浏览器无法读取或保存笔记。可以继续阅读并导出札记。'
    if (result.status === 'corrupt') storageNotice.value = '这对作品的本机草稿已损坏，未恢复。重新记录后可保存新草稿。'
  }
  restoring = false
}
async function loadMaterials() {
  const sequence = ++materialSequence
  persistDraft(); draftKey = ''; restoring = true; answer.value = ''; selected.value = []; restoring = false
  materialController?.abort(); materialController = new AbortController(); stream.reset(); highlight.value = null
  materialsLoading.value = true; materials.value = [null, null]; materialErrors.value = ['', '']; contextNotice.value = ''; storageNotice.value = ''; includeAi.value = false
  const params = query.value
  let ids = [params.poem, params.compare]
  try {
    if (preview.value) {
      ids[0] ||= ids[1] === 301 ? 306 : 301
      ids[1] ||= ids[0] === 306 ? 301 : 306
    }
    else if (params.spot && !ids.every(Boolean)) {
      try {
        const spot = await api.get(`/spots/${params.spot}`, { signal: materialController.signal })
        if (sequence !== materialSequence || disposed) return
        const related = (Array.isArray(spot?.poems) ? spot.poems : []).map(poem => positiveReadingId(poem.id)).filter(Boolean)
        ids[0] ||= related.find(id => id !== ids[1]) || null
        ids[1] ||= related.find(id => id !== ids[0]) || null
        if (!related.length) contextNotice.value = '这个景点暂时没有可读的已发布关联作品。你可以从选材栏自行选择。'
      } catch (error) { if (sequence === materialSequence) contextNotice.value = `关联作品暂时无法读取：${error.message || '请重试'}` }
    }
    if (sequence !== materialSequence || disposed) return
    if (!preview.value && !params.spot) {
      ids[0] ||= catalog.value.find(poem => poem.id !== ids[1])?.id || null
      ids[1] ||= catalog.value.find(poem => poem.id !== ids[0])?.id || null
    }
    if (ids[0] && ids[0] === ids[1]) { ids[1] = null; materialErrors.value[1] = '请选择另一篇作品，两篇材料不能相同。' }
    const responses = await Promise.allSettled(ids.map(async (id, index) => {
      if (!id) return null
      let detail
      if (preview.value) {
        const poem = previewPoems.find(item => item.id === id)
        detail = { poem, poet: previewPoets.find(item => item.id === poem?.poetId), dynasty: previewDynasties.find(item => item.id === poem?.dynastyId), sources: [] }
      } else detail = await api.get(`/poems/${id}`, { signal: materialController.signal })
      const material = normalizeReadingMaterial(detail, labels[index])
      if (!material) throw new Error(preview.value ? '这个样本不存在。请选择列表中的样本作品。' : '这篇作品的原文缺失，暂时无法对读。')
      return material
    }))
    if (sequence !== materialSequence || disposed) return
    const errors = [...materialErrors.value]
    materials.value = responses.map((result, index) => {
      if (result.status === 'fulfilled') return result.value
      const message = result.reason?.message || '网络连接失败，请重试。'
      errors[index] = /不存在|404|未发布|尚未发布/.test(message) ? '这篇作品不存在或尚未发布，请换一篇已发布作品。' : message
      return null
    })
    materialErrors.value = errors; restoreDraft()
    if (!materials.value.some(Boolean)) catalogOpen.value = true
  } finally { if (sequence === materialSequence && !disposed) materialsLoading.value = false }
}
async function initialize() {
  const sequence = ++initSequence
  region.value = query.value.region
  const catalogRequest = loadCatalog(1), modelRequest = loadModelStatus()
  if (preview.value || query.value.spot || (query.value.poem && query.value.compare)) {
    await Promise.allSettled([catalogRequest, modelRequest, loadMaterials()])
  } else {
    await catalogRequest
    if (sequence === initSequence && !disposed) await loadMaterials()
    await modelRequest
  }
}
watch(() => [route.query.poem, route.query.compare, route.query.region, route.query.spot, route.query.preview], () => { stream.reset(); materialSequence++; materialController?.abort(); initialize() })
onMounted(initialize)
watch([answer, selected], () => {
  if (restoring || !draftKey || materialsLoading.value) return
  draftDirty = true; savedLabel.value = '正在记录…'; clearTimeout(saveTimer); saveTimer = setTimeout(persistDraft, 350)
}, { deep: true, flush: 'sync' })
watch(answer, () => {
  if (!restoring && ai.value.mode === 'feedback' && ai.value.status !== 'idle') {
    stream.reset(); includeAi.value = false
    feedbackNotice.value = '个人思考已修改，上次依据检查已清除。可重新检查当前判断。'
  }
}, { flush: 'sync' })
function openChooser(label) { choosingLabel.value = label; catalogOpen.value = true; nextTick(() => document.getElementById('selector-title')?.scrollIntoView({ block: 'nearest' })) }
async function choosePoem(id) {
  if (!positiveReadingId(id)) return
  const nextQuery = { ...route.query, poem: materials.value[0]?.id || query.value.poem || undefined, compare: materials.value[1]?.id || query.value.compare || undefined }
  nextQuery[choosingLabel.value === 'A' ? 'poem' : 'compare'] = id
  await router.replace({ path: '/reading', query: nextQuery })
  choosingLabel.value = choosingLabel.value === 'A' ? 'B' : 'A'
}
async function changeRegion() { await router.replace({ path: '/reading', query: { ...route.query, region: region.value || undefined } }) }
function toggleSelection(item) {
  const line = findReadingReference(item.label, item.number, materials.value)
  if (!line || !pairReady.value) return
  const exists = selected.value.some(candidate => candidate.label === line.label && candidate.number === line.number)
  selected.value = exists ? selected.value.filter(candidate => candidate.label !== line.label || candidate.number !== line.number) : [...selected.value, line]
}
function changeFocus(value) { if (focus.value !== value) { focus.value = value; stream.reset(); includeAi.value = false } }
function showSampleGuide() {
  if (!preview.value || !pairReady.value) return
  const firstA = materials.value[0].lines[0].text, firstB = materials.value[1].lines[0].text
  ai.value = { status: 'sample', mode: 'compare', materials: [], error: '', text: `### 先从开篇比较\n\n材料 A 以“${firstA}”展开 [A:1]，材料 B 从“${firstB}”进入 [B:1]。试着标出各自写到的时间、地点与动作。\n\n**你的阅读问题**\n\n- 两篇的视线先落在哪里？\n- 哪个词改变了你感受到的节奏？\n- 你的理解能由哪一句支持？\n\n这是导读示例，非实时AI。它示范核对原文的方法，不提供经审核的文学结论。` }
}
async function generate(mode) {
  if (!canGenerate.value || generating.value || (mode === 'feedback' && !answer.value.trim())) return
  includeAi.value = false
  feedbackNotice.value = ''
  await stream.start(fetch, apiUrl('/api/public/poems/compare'), { poemIds: materials.value.map(item => item.id), focus: focus.value, mode, answer: mode === 'feedback' ? answer.value.trim() : '' }, materials.value)
}
function stopGeneration() { stream.stop() }
async function jumpToReference(item) {
  const line = findReadingReference(item.label, item.number, materials.value)
  if (!line) return
  highlight.value = line; await nextTick()
  const element = document.getElementById(`reading-${line.label}-${line.number}`)
  element?.scrollIntoView({ block: 'center', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); element?.focus({ preventScroll: true })
  clearTimeout(highlightTimer); highlightTimer = setTimeout(() => { highlight.value = null }, 4500)
}
function exportReading() {
  if (!pairReady.value) return
  persistDraft()
  const markdown = buildReadingExportMarkdown({ materials: materials.value, selected: selected.value, answer: answer.value, origin: window.location?.origin || '', preview: preview.value, includeAi: includeAi.value, ai: ai.value })
  const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = `对读札记-${materials.value.map(item => item.id).join('-')}.md`; link.click(); URL.revokeObjectURL(url)
}
onBeforeUnmount(() => { persistDraft(); disposed = true; initSequence++; materialSequence++; catalogSequence++; modelSequence++; materialController?.abort(); stream.reset(); clearTimeout(saveTimer); clearTimeout(highlightTimer) })
</script>

<style scoped>
.reading-workspace { max-width:1240px; margin:0 auto; padding:24px 32px 70px; }
.reading-hero { position:relative; min-height:180px; border-bottom:1px solid var(--border); padding:0 0 16px; overflow:hidden; isolation:isolate; }
.reading-landscape { position:absolute; right:-10px; top:10px; width:55%; height:175px; object-fit:cover; object-position:right center; mix-blend-mode:multiply; opacity:.8; z-index:-1; mask-image:linear-gradient(to right,transparent,black 35%); }
.reading-back { display:inline-flex; align-items:center; min-height:44px; color:var(--text-muted); font-size:13px; } .reading-eyebrow { color:var(--accent); font-size:12px; letter-spacing:3px; display:inline-block; vertical-align:middle; margin:0 0 0 20px; } h1 { display:flex; align-items:center; gap:20px; font-family:var(--font-display); font-weight:400; font-size:clamp(32px,3.3vw,40px); line-height:1.45; margin:3px 0 4px; } .hero-seal { display:inline-flex; align-items:center; justify-content:center; width:30px; height:40px; padding:4px; border:1px solid var(--accent); color:var(--accent); font-size:15px; line-height:1.05; writing-mode:vertical-rl; transform:rotate(2deg); } .reading-description { color:var(--text-secondary); font-size:15px; max-width:36em; } .reading-process { display:flex; gap:26px; margin-top:10px; color:var(--text-muted); font-size:12px; letter-spacing:1px; }
.reading-selector { border-bottom:1px solid var(--border); padding:14px 0 16px; } .selector-heading,.panel-heading { display:flex; align-items:flex-start; gap:12px; } .selector-heading { align-items:center; justify-content:space-between; } .selector-heading>div { display:flex; align-items:center; gap:10px; } h2 { font-family:var(--font-display); font-size:23px; font-weight:400; line-height:1.5; } .section-index { color:var(--accent); font-size:12px; font-variant-numeric:tabular-nums; border-top:1px solid var(--accent); padding-top:2px; margin-top:6px; } .quiet-button { display:inline-flex; align-items:center; gap:8px; min-height:44px; padding:0 5px; color:var(--accent); font-size:13px; } button:disabled { opacity:.5; cursor:not-allowed; } .current-materials { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; margin-top:8px; } .current-materials>button { display:flex; align-items:center; gap:12px; min-height:48px; padding:7px 14px; border:1px solid var(--border); border-radius:2px; background:var(--card-bg); text-align:left; } .current-materials>button>span:nth-child(2) { flex:1; min-width:0; overflow-wrap:anywhere; } .current-materials>button.active { border-color:var(--accent-a35); background:var(--accent-faint); } .small-seal { display:inline-grid; place-items:center; width:22px; height:25px; flex:0 0 22px; border:1px solid var(--accent-a35); color:var(--accent); font-size:12px; } .current-change { color:var(--text-muted); font-size:12px; white-space:nowrap; }
.reading-catalog { margin-top:20px; } .catalog-search { display:flex; gap:10px; } input,select,textarea { background:var(--card-bg); border:1px solid var(--border); border-radius:2px; color:var(--text-primary); font:inherit; } .catalog-search select,.catalog-search input { width:100%; height:46px; padding:0 12px; font-size:14px; } .region-field { flex:0 0 132px; min-width:0; } .keyword-field { flex:1; min-width:0; } .paper-button,.primary-button { display:inline-flex; align-items:center; justify-content:center; gap:10px; min-height:46px; padding:9px 16px; font-size:14px; line-height:1.7; border:1px solid var(--border); border-radius:2px; color:var(--text-primary); background:var(--card-bg); } .primary-button { color:var(--text-on-accent); background:var(--accent); border-color:var(--accent); } .paper-button:hover { background:var(--bg-secondary); } .primary-button:hover { background:var(--accent-dark); } .catalog-target { color:var(--text-muted); font-size:12px; margin:12px 0; } .catalog-target strong { color:var(--accent); font-weight:600; } .catalog-items { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; list-style:none; } .catalog-items button { display:grid; grid-template-columns:minmax(0,1fr) 30px; gap:2px 8px; text-align:left; width:100%; min-height:74px; padding:12px; border:1px solid var(--border-light); color:var(--text-primary); } .catalog-items button>span:first-child { overflow-wrap:anywhere; } .catalog-items button small { grid-row:2; color:var(--text-muted); font-size:12px; } .catalog-add { grid-column:2; grid-row:1/3; align-self:center; justify-self:end; font-size:12px; color:var(--accent); } .catalog-items button:hover:not(:disabled) { background:var(--accent-faint); border-color:var(--accent-a35); } .catalog-empty { padding:18px; background:var(--bg-secondary); color:var(--text-secondary); font-size:14px; } .sample-link { display:inline-flex; min-height:44px; align-items:center; color:var(--accent); text-decoration:underline; text-underline-offset:4px; } .catalog-pagination { display:flex; align-items:center; justify-content:flex-end; gap:20px; margin-top:10px; font-size:12px; color:var(--text-muted); }
.context-notice { color:var(--text-secondary); font-size:14px; margin-top:18px; } .reading-originals { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; margin-top:24px; align-items:start; } .reading-sources { padding:20px 0; } .source-missing { display:flex; align-items:baseline; gap:9px; color:var(--text-muted); font-size:12px; margin:5px 0; overflow-wrap:anywhere; } .source-missing .small-seal { align-self:center; } .reading-analysis-grid { display:grid; grid-template-columns:minmax(0,1.05fr) minmax(0,1fr); gap:30px; margin-top:12px; border-top:1px solid var(--border); padding-top:28px; } .reading-ai-panel,.reading-reflection { min-width:0; } .reading-reflection { border-left:1px solid var(--border); padding-left:30px; } .panel-heading>div { flex:1; min-width:0; } .panel-heading p { color:var(--text-muted); font-size:13px; line-height:1.8; margin-top:5px; } .ai-identity { display:inline-flex; border:1px solid var(--accent-a25); padding:2px 6px; color:var(--accent); font-size:11px; white-space:nowrap; margin-top:5px; }
.focus-chips { display:flex; gap:9px; flex-wrap:wrap; margin:21px 0 13px; } .focus-chips button { border:1px solid var(--border); padding:8px 18px; min-height:44px; border-radius:2px; color:var(--text-secondary); font-size:14px; } .focus-chips button.active { border-color:var(--accent); color:var(--accent); background:var(--accent-faint); } .focus-prompt { font-size:14px; color:var(--text-secondary); } .model-note { font-size:12px; color:var(--text-muted); line-height:1.8; margin:15px 0 10px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; } .model-unavailable { color:var(--accent); } .generation-actions { display:flex; align-items:center; flex-wrap:wrap; gap:12px; } .ai-output { border-top:1px solid var(--border-light); margin-top:22px; padding-top:12px; } .generation-state { color:var(--text-muted); font-size:12px; margin:7px 0; } .reading-alert { color:var(--accent); font-size:13px; line-height:1.8; margin:10px 0; overflow-wrap:anywhere; } .ai-footnote,.feedback-hint { font-size:12px; color:var(--text-muted); margin-top:14px; line-height:1.8; }
.selected-evidence { margin:24px 0 20px; padding:15px 16px; border:1px solid var(--border-light); background:var(--card-bg); } .evidence-heading { display:flex; justify-content:space-between; gap:10px; align-items:center; } .evidence-heading h3 { font-size:14px; font-weight:600; } .evidence-heading>span { font-size:12px; color:var(--text-muted); } .evidence-empty { color:var(--text-muted); font-size:13px; line-height:1.8; margin-top:9px; } .selected-evidence ul { list-style:none; margin-top:8px; } .selected-evidence li { display:flex; gap:8px; align-items:baseline; padding:4px 0; font-size:13px; } .selected-evidence li>span { flex:1; overflow-wrap:anywhere; } .evidence-reference { min-height:44px; color:var(--accent); flex:0 0 auto; font-size:12px; } .remove-evidence { min-width:44px; min-height:44px; font-size:19px; color:var(--text-muted); margin-right:-10px; } .answer-label { display:block; font-size:14px; font-weight:600; margin-bottom:8px; } textarea { display:block; width:100%; resize:vertical; min-height:170px; padding:13px; font-size:14px; line-height:1.9; } textarea:disabled { opacity:.65; } .answer-meta { display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-top:6px; color:var(--text-muted); font-size:11px; } .feedback-button { margin-top:18px; } .feedback-output { border-top:1px solid var(--border-light); padding-top:15px; margin-top:20px; }
.reading-export { display:flex; align-items:center; gap:24px; flex-wrap:wrap; border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:24px 0; margin-top:36px; } .reading-export>div { flex:1; min-width:200px; } .reading-export h2 { font-size:20px; } .reading-export p { font-size:12px; color:var(--text-muted); margin-top:5px; } .include-ai { display:flex; align-items:center; gap:8px; min-height:44px; font-size:12px; color:var(--text-secondary); } .include-ai input { width:18px; height:18px; accent-color:var(--accent); }
.sr-only { position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }
@media(max-width:900px) { .reading-workspace { padding:18px 24px 50px; } .reading-analysis-grid { gap:22px; } .reading-reflection { padding-left:22px; } .catalog-items { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:700px) { .reading-workspace { padding:14px 16px 45px; } .reading-hero { min-height:210px; padding-bottom:18px; } .reading-landscape { width:75%; right:-40px; top:40px; opacity:.38; } .reading-description { font-size:14px; max-width:21em; } h1 { font-size:34px; gap:15px; } .reading-process { gap:18px; font-size:11px; } .selector-heading h2 { font-size:21px; } .current-materials { grid-template-columns:1fr; gap:8px; } .current-materials>button { min-height:50px; font-size:14px; } .catalog-search { flex-wrap:wrap; } .region-field { flex:0 0 108px; } .keyword-field { flex:1; } .catalog-search>.paper-button { width:100%; } .catalog-items { grid-template-columns:1fr; } .catalog-items button { min-height:67px; } .reading-originals { grid-template-columns:1fr; gap:15px; margin-top:20px; } .reading-analysis-grid { grid-template-columns:1fr; gap:28px; padding-top:23px; } .reading-reflection { border-left:0; padding-left:0; border-top:1px solid var(--border); padding-top:25px; } .panel-heading { gap:9px; } .panel-heading h2 { font-size:23px; } .focus-chips { gap:8px; } .focus-chips button { padding:8px 16px; } .reading-export { gap:12px; margin-top:26px; } .reading-export>div { flex-basis:100%; } .reading-export>.paper-button { width:100%; } }

@media(min-width:1100px) {
  .reading-desk { display:grid; grid-template-columns:minmax(0,1fr) 350px; grid-template-areas:"originals ai" "sources ai" "reflection reflection"; column-gap:22px; row-gap:0; margin-top:20px; align-items:start; }
  .reading-originals { grid-area:originals; gap:14px; margin-top:0; }
  .reading-sources { grid-area:sources; padding:13px 0 18px; min-width:0; }
  .reading-sources :deep(.source-list__entry) { grid-template-columns:1fr; gap:12px; }
  .reading-analysis-grid { display:contents; }
  .reading-ai-panel { grid-area:ai; padding:20px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--card-bg); }
  .reading-ai-panel .panel-heading { flex-wrap:wrap; gap:8px; }
  .reading-ai-panel .panel-heading>div { flex:1 1 235px; }
  .reading-ai-panel .panel-heading h2 { font-size:23px; }
  .reading-ai-panel .ai-identity { margin-left:24px; margin-top:0; }
  .reading-ai-panel .focus-chips { gap:7px; margin:15px 0 10px; }
  .reading-ai-panel .focus-chips button { flex:1 1 56px; padding:8px 10px; }
  .reading-ai-panel .focus-prompt { font-size:13px; }
  .reading-ai-panel .model-note { margin:10px 0; }
  .reading-ai-panel .generation-actions { gap:8px; }
  .reading-ai-panel .primary-button { width:100%; }
  .reading-ai-panel .ai-output { max-height:450px; overflow:auto; overscroll-behavior:contain; scrollbar-gutter:stable; margin-top:16px; padding-top:9px; }
  .reading-reflection { grid-area:reflection; border-left:0; border-top:1px solid var(--border); padding:23px 0 0; margin-top:10px; display:grid; grid-template-columns:minmax(250px,.42fr) minmax(0,1fr); column-gap:26px; align-items:start; }
  .reading-reflection>.panel-heading { grid-column:1/-1; margin-bottom:19px; }
  .reading-reflection>.selected-evidence { grid-column:1; grid-row:2/span 7; margin:0; }
  .reading-reflection>.answer-label,.reading-reflection>textarea,.reading-reflection>.answer-meta,.reading-reflection>.reading-alert,.reading-reflection>.feedback-button,.reading-reflection>.feedback-hint { grid-column:2; }
  .reading-reflection>.feedback-button { justify-self:start; }
  .reading-reflection>.feedback-output { grid-column:1/-1; }
}
@media(prefers-reduced-motion:reduce) { *,*::before,*::after { scroll-behavior:auto!important; animation:none!important; transition:none!important; } }
</style>
