<template>
  <div class="folio-page culture-collection">
    <PageHeading :eyebrow="`齐鲁文化 / ${meta.label}`" :title="meta.title" :description="meta.description">
      <template #actions><router-link :to="atlasLink('/culture', route)" class="folio-button folio-button--quiet">文化总览 ↗</router-link></template>
    </PageHeading>
    <slot name="lead" />
    <form class="folio-toolbar" role="search" @submit.prevent="search">
      <label class="folio-field folio-field--search">在{{ meta.label }}中查找<input v-model="draft" class="folio-input" type="search" placeholder="输入名称、故事或关键词" /></label>
      <label class="folio-field">所属城市<select class="folio-select" :value="region" @change="selectRegion($event.target.value)"><option value="">全部城市</option><option v-for="city in NINE_CITIES" :key="city" :value="city">{{ city }}</option></select></label>
      <div class="folio-actions"><button type="submit" class="folio-button folio-button--primary">查找内容</button><button type="button" class="folio-button folio-button--quiet" :disabled="!region && !keyword && !draft" @click="reset">清除条件</button></div>
    </form>
    <div class="folio-result-bar" role="status"><span>{{ loading ? '正在整理册页…' : error ? '内容暂未载入' : `本页 ${filtered.length} 条${isAtlasPreview(route) ? '设计样本' : '内容'}` }}<template v-if="region"> · {{ region }}</template><template v-if="keyword"> · “{{ keyword }}”</template></span><span>选择条目，展开阅读</span></div>
    <div v-if="loading" class="collection-grid folio-grid" aria-busy="true"><SkeletonBlock v-for="n in 3" :key="n" height="250px" /></div>
    <ErrorState v-else-if="error" :message="error" @retry="load" />
    <div v-else-if="filtered.length" class="collection-grid folio-grid">
      <router-link v-for="(item, i) in filtered" :key="item.id" :to="detailLink(item)" class="collection-card">
        <div class="collection-card__art"><img v-if="imageOf(item) && !failedImages.has(item.id)" :src="imageOf(item)" :alt="item.title" loading="lazy" @error="failedImages.add(item.id)" /><span v-else aria-hidden="true">{{ item.title?.charAt(0) || meta.seal }}</span><small>{{ String(i + 1).padStart(2, '0') }}</small><em v-if="enrichmentOf(item)">{{ imageOf(item) && !failedImages.has(item.id) ? imageLabel(item) : '影像待补' }}</em></div>
        <div class="collection-card__body"><p class="folio-eyebrow">{{ item.region || '齐鲁' }} · {{ meta.label }}</p><h2>{{ item.title }}</h2><p class="collection-card__summary">{{ item.summary || '走进这则文化记录，继续阅读。' }}</p><p v-if="enrichmentOf(item)" class="collection-card__experience">{{ cultureExperienceLabel(enrichmentOf(item)) }} · {{ enrichmentOf(item).sources.length }} 则扩展资料</p><span class="collection-card__read">{{ enrichmentOf(item) ? '查看内容与资料' : '展开阅读' }} <i aria-hidden="true">↗</i></span></div>
      </router-link>
    </div>
    <template v-else><EmptyState message="没有找到符合条件的内容" hint="换一个关键词，或回到全部城市看看" /><div class="folio-empty-actions"><button class="folio-button" type="button" @click="reset">查看全部内容</button></div></template>
  </div>
</template>
<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'
import { NINE_CITIES } from '../config/nineCities'
import { atlasLink, isAtlasPreview } from '../config/atlasPreview'
import { culturePreviewItems } from '../config/culturePreview'
import { useImage } from '../composables/useImage'
import PageHeading from './ui/PageHeading.vue'
import ErrorState from './homepage/ErrorState.vue'
import EmptyState from './homepage/EmptyState.vue'
import SkeletonBlock from './homepage/SkeletonBlock.vue'
import { getCultureEnrichment, cultureExperienceLabel, culturePreviewImage } from '../utils/cultureEnrichment.js'
const props = defineProps({ category: { type: String, required: true } })
const route = useRoute(), router = useRouter()
const { resolveFirstImage } = useImage()
const catalog = {
  festival: { label: '民俗节庆', title: '岁时有序，风物有情', description: '从一场花会、一盏灯，走近黄河岸边的节令记忆。', seal: '节', path: '/festivals' },
  craft: { label: '非遗工艺', title: '指尖匠心，器物有灵', description: '一刀一线、一捏一织，看齐鲁匠人如何把寻常材料做成传世器物。', seal: '艺', path: '/crafts' },
  literature: { label: '民间文学', title: '口耳相传，字里乡音', description: '在传说与故事中，读见一方水土的生活与想象。', seal: '文', path: '/literature' },
  food_opera: { label: '饮食戏曲', title: '人间有味，梨园有声', description: '沿着味觉与乡音，体会齐鲁大地的日常风物。', seal: '味', path: '/food-opera' },
}
const meta = computed(() => catalog[props.category])
const region = computed(() => NINE_CITIES.includes(route.query.region) ? route.query.region : '')
const keyword = computed(() => typeof route.query.keyword === 'string' ? route.query.keyword.trim() : '')
const draft = ref(keyword.value), items = ref([]), loading = ref(true), error = ref('')
const failedImages = ref(new Set())
let sequence = 0
const filtered = computed(() => items.value.filter(item => !keyword.value || `${item.title || ''} ${item.summary || ''} ${item.content || ''}`.includes(keyword.value)))
const enrichmentOf = getCultureEnrichment
const imageOf = item => resolveFirstImage([culturePreviewImage(enrichmentOf(item)), item.imageAnimeUrl, item.imageUrl, enrichmentOf(item)?.image], '文', { placeholder: false })
const imageLabel = item => culturePreviewImage(enrichmentOf(item)) === imageOf(item) ? '来源影像' : '文化插画'
const detailLink = item => { const target = atlasLink(`${meta.value.path}/${item.id}`, route); return { ...(typeof target === 'string' ? { path: target } : target), query: { ...(typeof target === 'object' ? target.query : {}), returnTo: route.fullPath } } }
function update(values) { const query = { ...route.query, ...values }; for (const key of ['region','keyword']) if (!query[key]) delete query[key]; router.replace({ query }) }
function search() { update({ keyword: draft.value.trim() }) }
function selectRegion(value) { update({ region: value }) }
function reset() { draft.value = ''; update({ region: '', keyword: '' }) }
async function load() {
  const current = ++sequence; loading.value = true; error.value = ''; items.value = []; failedImages.value.clear()
  if (isAtlasPreview(route)) { items.value = culturePreviewItems.filter(item => item.category === props.category && (!region.value || item.region === region.value)); loading.value = false; return }
  try { const data = await api.get('/cultural', { params: { category: props.category, size: 100, ...(region.value ? { region: region.value } : {}) } }); if (current === sequence) items.value = Array.isArray(data?.records) ? data.records : [] }
  catch { if (current === sequence) error.value = '文化内容暂未载入，请重试或浏览其他栏目。' }
  finally { if (current === sequence) loading.value = false }
}
watch(keyword, value => { draft.value = value })
watch(() => [props.category, region.value, route.query.preview], load, { immediate: true })
onBeforeUnmount(() => { sequence++ })
</script>
<style scoped>
.collection-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 22px; }
.collection-card { min-width: 0; border: 1px solid var(--border-light); background: #faf7f05c; transition: border-color .2s, transform .2s; display: flex; flex-direction: column; }
.collection-card:hover { border-color: #a99c85; transform: translateY(-3px); }
.collection-card__art { position: relative; height: 170px; background: url('/media/inkwash/atlas/mountain-vignette.webp') right bottom/170px auto no-repeat; overflow: hidden; }
.collection-card__art > span { position: absolute; left: 28px; top: 14px; font: 84px/1.5 var(--font-display); color: #8d755840; }
.collection-card__art > small { position: absolute; right: 18px; top: 18px; font: italic 15px Georgia,serif; color: #a99c85; }
.collection-card__art > em { position:absolute; left:12px; bottom:10px; font:11px var(--font-body); color:var(--text-secondary); background:var(--bg-primary); padding:4px 8px; }
.collection-card__experience { margin:0 0 16px; font-size:12px; color:var(--reading-green); }
.collection-card__art img { width: 100%; height: 100%; object-fit: cover; }
.collection-card__body { display: flex; flex-direction: column; flex: 1; padding: 23px 26px; }
.collection-card h2 { font: 25px/1.5 var(--font-display); letter-spacing: 2px; }
.collection-card__summary { font-size: 14px; color: var(--text-secondary); line-height: 1.9; margin: 13px 0 24px; }
.collection-card__read { border-top: 1px solid var(--border-light); padding-top: 15px; margin-top: auto; display: flex; justify-content: space-between; color: var(--reading-green); font-size: 13px; }
.collection-card__read i { font-style: normal; }
@media(max-width:960px) { .collection-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
@media(max-width:600px) { .collection-grid { grid-template-columns: 1fr; gap: 16px; } .collection-card__art { height: 140px; } }
</style>
