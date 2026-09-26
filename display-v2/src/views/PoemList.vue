<template>
  <div class="poem-list">
    <header class="poem-list__hero">
      <span class="poem-list__tag">文化长廊 · 古诗词</span>
      <h1 class="poem-list__title">诗词长卷 · 字里山河</h1>
      <p class="poem-list__desc">从一城风物入诗，循着标题、地域与文字，找到下一首值得细读的作品。</p>
    </header>

    <form class="poem-list__search" role="search" @submit.prevent="submitSearch">
      <label class="sr-only" for="poem-keyword">搜索诗词</label>
      <input
        id="poem-keyword"
        v-model="keywordInput"
        type="search"
        placeholder="搜索标题或诗句"
        autocomplete="off"
      />
      <button type="submit">检索</button>
    </form>

    <nav class="poem-list__regions" aria-label="按区域筛选">
      <button
        v-for="item in regionOptions"
        :key="item"
        type="button"
        class="poem-list__region"
        :class="{ active: region === item }"
        @click="setRegion(item)"
      >{{ item }}</button>
    </nav>

    <div v-if="!loaded" class="poem-list__grid" aria-busy="true" aria-label="诗词加载中">
      <SkeletonBlock v-for="i in 8" :key="i" height="210px" />
    </div>

    <ErrorState v-else-if="errorMsg" :message="errorMsg" @retry="load" />

    <div v-else-if="items.length" class="poem-list__grid">
      <router-link
        v-for="(item, index) in items"
        :key="item.id"
        :to="`/poems/${item.id}`"
        class="poem-card"
        :style="{ animationDelay: `${index * 0.04}s` }"
      >
        <span class="poem-card__seal">{{ sealOf(item) }}</span>
        <div class="poem-card__meta">
          <span>{{ item.region || (region === '全部' ? '齐鲁' : region) }}</span>
          <span v-if="item.dynastyName || item.dynasty">{{ item.dynastyName || item.dynasty }}</span>
        </div>
        <h2 class="poem-card__title">{{ item.title || '无题' }}</h2>
        <p class="poem-card__content">{{ excerptOf(item) }}</p>
        <span class="poem-card__link">展开诗笺 →</span>
      </router-link>
    </div>

    <EmptyState
      v-else
      icon="诗"
      message="暂无符合条件的诗词"
      hint="试试清空关键词或切换其他区域"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'
import { NINE_CITIES } from '../config/nineCities'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import EmptyState from '../components/homepage/EmptyState.vue'
import ErrorState from '../components/homepage/ErrorState.vue'

const route = useRoute()
const router = useRouter()
const regionOptions = ['全部', ...NINE_CITIES]

const region = ref(regionOptions.includes(route.query.region) ? route.query.region : '全部')
const keywordInput = ref(typeof route.query.keyword === 'string' ? route.query.keyword : '')
const items = ref([])
const loaded = ref(false)
const errorMsg = ref('')
let loadSequence = 0

const sealOf = (item) => (item.title ? item.title.slice(0, 1) : '诗')

const excerptOf = (item) => {
  const content = String(item.content || item.annotation || item.background || '').replace(/\s+/g, ' ').trim()
  return content.length > 120 ? `${content.slice(0, 120)}…` : content || '暂未录入正文'
}

const syncFromRoute = () => {
  region.value = regionOptions.includes(route.query.region) ? route.query.region : '全部'
  keywordInput.value = typeof route.query.keyword === 'string' ? route.query.keyword : ''
}

const updateQuery = (next) => {
  const query = { ...route.query }
  if (next.region && next.region !== '全部') query.region = next.region
  else delete query.region
  if (next.keyword) query.keyword = next.keyword
  else delete query.keyword
  router.replace({ query }).catch(() => {})
}

const setRegion = (nextRegion) => {
  updateQuery({ region: nextRegion, keyword: keywordInput.value.trim() })
}

const submitSearch = () => {
  updateQuery({ region: region.value, keyword: keywordInput.value.trim() })
}

const recordsOf = (data) => {
  if (Array.isArray(data)) return data
  return Array.isArray(data?.records) ? data.records : []
}

const load = async () => {
  const sequence = ++loadSequence
  loaded.value = false
  errorMsg.value = ''
  try {
    const params = { page: 1, size: 100 }
    if (region.value !== '全部') params.region = region.value
    if (keywordInput.value.trim()) params.keyword = keywordInput.value.trim()
    const data = await api.get('/poems', { params })
    if (sequence !== loadSequence) return
    items.value = recordsOf(data)
  } catch (error) {
    if (sequence !== loadSequence) return
    console.error('加载诗词列表失败:', error)
    errorMsg.value = error.message || '诗词数据加载失败，请稍后重试'
  } finally {
    if (sequence === loadSequence) loaded.value = true
  }
}

watch(
  () => [route.query.region, route.query.keyword],
  () => {
    syncFromRoute()
    load()
  },
)

onMounted(load)
</script>

<style scoped>
.poem-list {
  max-width: 1240px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 48px 24px 120px;
}

.poem-list__hero {
  max-width: 720px;
  margin: 0 auto 32px;
  text-align: center;
}

.poem-list__tag {
  display: inline-block;
  padding: 5px 12px;
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: 12px;
  letter-spacing: 2px;
}

.poem-list__title {
  margin: 18px 0 12px;
  color: var(--text-primary);
  font-family: var(--font-heading);
  font-size: clamp(30px, 5vw, 46px);
  font-weight: 500;
  letter-spacing: 4px;
}

.poem-list__desc {
  margin: 0;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.9;
}

.poem-list__search {
  display: flex;
  max-width: 660px;
  margin: 0 auto 20px;
  border-bottom: 1px solid var(--border);
}

.poem-list__search input {
  min-width: 0;
  flex: 1;
  padding: 12px 4px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
}

.poem-list__search button {
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  background: var(--accent);
  color: var(--text-on-accent);
  cursor: pointer;
  font: inherit;
}

.poem-list__regions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
}

.poem-list__region {
  min-height: 40px;
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font: inherit;
}

.poem-list__region.active,
.poem-list__region:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.poem-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.poem-card {
  position: relative;
  display: block;
  min-height: 210px;
  padding: 24px 22px 20px;
  border: 1px solid var(--line, var(--border));
  background: var(--card-bg, transparent);
  color: inherit;
  text-decoration: none;
  transition: border-color 180ms ease, transform 180ms ease;
  animation: poem-card-in 360ms ease both;
}

.poem-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
}

.poem-card__seal {
  position: absolute;
  top: 16px;
  right: 16px;
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--accent);
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 19px;
  transform: rotate(-5deg);
}

.poem-card__meta {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  color: var(--text-muted);
  font-size: 12px;
  letter-spacing: 1px;
}

.poem-card__title {
  max-width: calc(100% - 48px);
  margin: 0 0 14px;
  color: var(--text-primary);
  font-family: var(--font-heading);
  font-size: 21px;
  font-weight: 600;
}

.poem-card__content {
  min-height: 68px;
  margin: 0 0 18px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-line;
}

.poem-card__link {
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 1px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes poem-card-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 680px) {
  .poem-list { padding: 32px 16px 80px; }
  .poem-list__title { letter-spacing: 2px; }
  .poem-list__grid { grid-template-columns: 1fr; }
}
</style>
