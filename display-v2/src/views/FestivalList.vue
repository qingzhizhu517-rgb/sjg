<template>
  <ErrorState v-if="errorMsg" :message="errorMsg" @retry="load" />

  <div v-else class="festival-list">
    <!-- 页头 -->
    <header class="fest-hero">
      <span class="fest-hero__tag">文化长廊 · 民俗节庆</span>
      <h1 class="fest-hero__title">岁时节令 · 齐鲁风物</h1>
      <p class="fest-hero__desc">
        爆竹声里，灯影桨声；一方节俗，一方人情。从春节元宵到牡丹盛会，沿黄九市的节庆记忆在此汇聚。
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
    <div v-if="!loaded" class="fest-grid" aria-busy="true" aria-label="节庆加载中">
      <SkeletonBlock v-for="i in 6" :key="i" height="220px" />
    </div>

    <!-- 列表：real 卡片栅格 / inkwash 卷轴式 -->
    <div v-else-if="items.length" class="fest-grid">
      <article
        v-for="(f, i) in items"
        :key="f.id"
        class="fest-card card hover-lift"
        :style="{ animationDelay: `${i * 0.05}s` }"
        tabindex="0"
        role="link"
        data-reveal
        @click="$router.push(`/festivals/${f.id}`)"
        @keydown.enter="$router.push(`/festivals/${f.id}`)"
      >
        <div class="fest-card__seal">{{ sealOf(f) }}</div>
        <div class="fest-card__body">
          <div class="fest-card__meta">
            <span class="fest-card__region">{{ f.region || '全域' }}</span>
          </div>
          <h3 class="fest-card__title">{{ f.title }}</h3>
          <p class="fest-card__summary">{{ f.summary }}</p>
        </div>
      </article>
    </div>

    <!-- 空态 -->
    <EmptyState
      v-else
      icon="节"
      message="节庆内容收录中"
      hint="试试切换其他区域"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'
import { NINE_CITIES } from '../config/nineCities'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import EmptyState from '../components/homepage/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const regionOptions = ['全部', ...NINE_CITIES]

const items = ref([])
const loaded = ref(false)
const errorMsg = ref(null)
// ?region= 初始值(非法回退全部), 与筛选条双向同步
const region = ref(NINE_CITIES.includes(route.query.region) ? route.query.region : '全部')

const sealOf = (f) => (f.title ? f.title[0] : '节')

const setRegion = (r) => {
  region.value = r
  const query = { ...route.query }
  if (r === '全部') delete query.region
  else query.region = r
  router.replace({ query }).catch(() => {})
  load()
}

const load = async () => {
  loaded.value = false
  errorMsg.value = null
  try {
    const params = { category: 'festival', size: 100 }
    if (region.value !== '全部') params.region = region.value
    const data = await api.get('/cultural', { params })
    items.value = data.records
  } catch (err) {
    console.error('加载节庆列表失败:', err)
    errorMsg.value = '加载节庆数据失败，请稍后重试'
  } finally {
    loaded.value = true
  }
}

onMounted(load)
</script>

<style scoped>
.festival-list {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--sp-7) var(--sp-5) var(--sp-10);
}

/* 页头 */
.fest-hero {
  text-align: center;
  margin-bottom: var(--sp-6);
}

.fest-hero__tag {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: var(--fs-caption);
  font-weight: 600;
  letter-spacing: 3px;
  color: var(--text-on-accent);
  background: var(--accent);
  padding: 5px 12px;
  border-radius: 2px;
  margin-bottom: var(--sp-4);
}

.fest-hero__title {
  font-family: var(--font-heading);
  font-size: clamp(26px, 3.4vw, 38px);
  font-weight: 600;
  letter-spacing: 6px;
  color: var(--text-primary);
  margin: 0 0 var(--sp-3);
}

.fest-hero__desc {
  font-size: var(--fs-body-sm);
  color: var(--text-muted);
  letter-spacing: 1px;
  margin: 0;
}

/* 区域筛选 */
.region-filter {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: var(--sp-6);
}

.region-chip {
  font-family: var(--font-heading);
  font-size: var(--fs-caption);
  letter-spacing: 2px;
  padding: 7px 18px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--card-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.region-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.region-chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-on-accent);
}

/* 卡片栅格 */
.fest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--sp-5);
}

.fest-card {
  position: relative;
  display: flex;
  gap: var(--sp-4);
  padding: var(--sp-5);
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
  animation: fadeSlideUp 0.5s ease both;
}

.fest-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: var(--card-shadow-hover);
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.fest-card__seal {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 26px;
  font-weight: 600;
  color: var(--text-on-accent);
  background: var(--accent);
  border-radius: var(--radius-sm);
}

.fest-card__body {
  min-width: 0;
}

.fest-card__meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.fest-card__region {
  color: var(--accent);
  font-weight: 600;
}

.fest-card__title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.fest-card__summary {
  font-size: var(--fs-caption);
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .festival-list {
    padding: var(--sp-6) var(--sp-4) var(--sp-8);
  }

  .fest-grid {
    grid-template-columns: 1fr;
  }

  .fest-hero__title {
    letter-spacing: 3px;
  }
}
</style>
