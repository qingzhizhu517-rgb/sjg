<template>
  <div class="literature-list" :class="{ 'anime-layout': isAnime }">
    <!-- 页头 -->
    <header class="lit-hero">
      <span class="lit-hero__tag">文化长廊 · 民间文学</span>
      <h1 class="lit-hero__title">{{ isAnime ? '口耳相传 · 民间记忆' : '黄河岸边的民间故事' }}</h1>
      <p class="lit-hero__desc">
        {{ isAnime
          ? '传说故事，口耳相传；民间智慧，代代相承。'
          : '从孟姜女到梁祝，从泰山传说到运河故事，聆听黄河岸边的民间文学。' }}
      </p>
    </header>

    <!-- 区域筛选条 -->
    <nav class="region-filter" aria-label="按区域筛选">
      <button
        v-for="r in regionOptions"
        :key="r"
        class="region-chip"
        :class="{ active: region === r }"
        @click="setRegion(r)"
      >{{ r }}</button>
    </nav>

    <!-- 骨架 -->
    <div v-if="!loaded" class="lit-grid" aria-busy="true" aria-label="民间文学加载中">
      <SkeletonBlock v-for="i in 6" :key="i" height="220px" />
    </div>

    <!-- 列表 -->
    <div v-else-if="items.length" class="lit-grid">
      <article
        v-for="(item, i) in items"
        :key="item.id"
        class="lit-card card hover-lift"
        :style="{ animationDelay: `${i * 0.05}s` }"
        tabindex="0"
        role="link"
        data-reveal
        @click="$router.push(`/literature/${item.id}`)"
        @keydown.enter="$router.push(`/literature/${item.id}`)"
      >
        <div class="lit-card__seal">{{ sealOf(item) }}</div>
        <div class="lit-card__body">
          <div class="lit-card__meta">
            <span class="lit-card__region">{{ item.region || '全域' }}</span>
            <span class="lit-card__category">{{ item.category }}</span>
          </div>
          <h3 class="lit-card__title">{{ item.title }}</h3>
          <p class="lit-card__summary">{{ item.summary }}</p>
          <div class="lit-card__tags">
            <span v-for="tag in tagsOf(item)" :key="tag" class="lit-tag">{{ tag }}</span>
          </div>
        </div>
      </article>
    </div>

    <!-- 空状态 -->
    <div v-else class="lit-empty">
      <EmptyState message="暂无民间文学内容" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTheme } from '../composables/useTheme'
import api from '../api'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import EmptyState from '../components/homepage/EmptyState.vue'

const { isAnime } = useTheme()

const region = ref('')
const items = ref([])
const loaded = ref(false)
const errorMsg = ref('')

const regionOptions = ['全部', '济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '临沂', '德州', '聊城', '滨州', '菏泽']

function setRegion(r) {
  region.value = r === '全部' ? '' : r
  load()
}

async function load() {
  loaded.value = false
  errorMsg.value = ''
  try {
    const params = { category: 'literature', size: 100 }
    if (region.value) params.region = region.value
    const data = await api.get('/cultural', { params })
    items.value = data.records || data
  } catch (err) {
    console.error('加载民间文学失败:', err)
    errorMsg.value = err.message || '加载失败'
  } finally {
    loaded.value = true
  }
}

// tags 为 DB json 列, 后端序列化为 JSON 字符串, 需解析成数组
function tagsOf(item) {
  const t = item && item.tags
  if (Array.isArray(t)) return t
  if (typeof t === 'string') {
    try {
      const p = JSON.parse(t)
      return Array.isArray(p) ? p : []
    } catch {
      return []
    }
  }
  return []
}

function sealOf(item) {
  const seals = ['传', '说', '故', '事', '民', '间']
  return seals[item.id % seals.length]
}

onMounted(load)
</script>

<style scoped>
.literature-list {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 20px;
}

.lit-hero {
  text-align: center;
  padding: 60px 20px 40px;
  max-width: 800px;
  margin: 0 auto;
}

.lit-hero__tag {
  display: inline-block;
  padding: 4px 12px;
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: 12px;
  letter-spacing: 2px;
  margin-bottom: 16px;
}

.lit-hero__title {
  font-family: var(--font-heading);
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.lit-hero__desc {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.region-filter {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.region-chip {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.region-chip:hover {
  background: var(--bg-hover);
}

.region-chip.active {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--accent);
}

.lit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.lit-card {
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.lit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.lit-card__seal {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: var(--accent);
  color: var(--text-on-accent);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  transform: rotate(-15deg);
}

.lit-card__body {
  padding: 24px;
}

.lit-card__meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.lit-card__region,
.lit-card__category {
  font-size: 12px;
  padding: 2px 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  color: var(--text-muted);
}

.lit-card__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.lit-card__summary {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lit-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lit-tag {
  font-size: 12px;
  padding: 2px 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  color: var(--text-muted);
}

.lit-empty {
  text-align: center;
  padding: 80px 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .lit-hero__title {
    font-size: 28px;
  }
  
  .lit-grid {
    grid-template-columns: 1fr;
  }
}
</style>
