<template>
  <div class="food-opera-list" :class="{ 'anime-layout': isAnime }">
    <!-- 页头 -->
    <header class="fo-hero">
      <span class="fo-hero__tag">文化长廊 · 饮食戏曲</span>
      <h1 class="fo-hero__title">{{ isAnime ? '舌尖记忆 · 梨园春秋' : '黄河岸边的饮食戏曲' }}</h1>
      <p class="fo-hero__desc">
        {{ isAnime
          ? '一方水土，一方风味；一腔一调，皆是乡音。'
          : '从鲁菜经典到地方小吃，从山东快书到吕剧柳子，品味黄河岸边的生活艺术。' }}
      </p>
    </header>

    <!-- 分类标签(数据层 food/opera 细分在 detail.sub_category, 列表接口不返回, 仅作展示说明) -->
    <div class="category-tabs">
      <span class="category-tab category-tab--static">饮食文化</span>
      <span class="category-tab category-tab--static">戏曲艺术</span>
    </div>

    <!-- 区域筛选条 -->
    <nav class="fo-region-filter" aria-label="按区域筛选">
      <button
        v-for="r in regionOptions"
        :key="r"
        class="fo-region-chip"
        :class="{ active: region === r }"
        @click="setRegion(r)"
      >{{ r }}</button>
    </nav>

    <!-- 骨架 -->
    <div v-if="!loaded" class="fo-grid" aria-busy="true" aria-label="内容加载中">
      <SkeletonBlock v-for="i in 6" :key="i" height="220px" />
    </div>

    <!-- 列表 -->
    <div v-else-if="items.length" class="fo-grid">
      <article
        v-for="(item, i) in items"
        :key="item.id"
        class="fo-card card hover-lift"
        :style="{ animationDelay: `${i * 0.05}s` }"
        tabindex="0"
        role="link"
        data-reveal
        @click="$router.push(`/food-opera/${item.id}`)"
        @keydown.enter="$router.push(`/food-opera/${item.id}`)"
      >
        <div class="fo-card__image">
          <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.title" loading="lazy" />
          <div class="fo-card__category-badge">{{ isFood(item) ? '美食' : '戏曲' }}</div>
        </div>
        <div class="fo-card__body">
          <div class="fo-card__meta">
            <span class="fo-card__region">{{ item.region || '全域' }}</span>
            <span class="fo-card__type">{{ isFood(item) ? '饮食文化' : '戏曲艺术' }}</span>
          </div>
          <h3 class="fo-card__title">{{ item.title }}</h3>
          <p class="fo-card__summary">{{ item.summary }}</p>
          <div class="fo-card__tags">
            <span v-for="tag in tagsOf(item)" :key="tag" class="fo-tag">{{ tag }}</span>
          </div>
        </div>
      </article>
    </div>

    <!-- 错误态(此前被吞掉, 失败时误显示"暂无相关内容") -->
    <div v-else-if="errorMsg" class="fo-empty">
      <ErrorState :message="errorMsg" @retry="load" />
    </div>

    <!-- 空状态 -->
    <div v-else class="fo-empty">
      <EmptyState message="暂无相关内容" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import api from '../api'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import EmptyState from '../components/homepage/EmptyState.vue'
import ErrorState from '../components/homepage/ErrorState.vue'

const { isAnime } = useTheme()
const route = useRoute()
const router = useRouter()

// 九城顺序与全局一致(黄河上游→下游)
const NINE = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '淄博', '滨州', '东营']
const regionOptions = ['全部', ...NINE]

const items = ref([])
const loaded = ref(false)
const errorMsg = ref('')
const region = ref(NINE.includes(route.query.region) ? route.query.region : '全部')

function setRegion(r) {
  region.value = r
  const query = { ...route.query }
  if (r === '全部') delete query.region
  else query.region = r
  router.replace({ query }).catch(() => {})
  load()
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

// 饮食/戏曲粗分: 详情表 sub_category 不在列表接口中, 用标题关键词做展示级区分
function isFood(item) {
  return !/吕剧|柳子|快书|梆子|戏曲|京剧|琴书|戏/.test(item.title || '')
}

async function load() {
  loaded.value = false
  errorMsg.value = ''
  try {
    const params = { category: 'food_opera', size: 100 }
    if (region.value !== '全部') params.region = region.value
    const data = await api.get('/cultural', { params })
    items.value = data.records || data
  } catch (err) {
    console.error('加载饮食戏曲失败:', err)
    errorMsg.value = err.message || '加载失败'
  } finally {
    loaded.value = true
  }
}

onMounted(load)
</script>

<style scoped>
.food-opera-list {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 20px;
}

.fo-hero {
  text-align: center;
  padding: 60px 20px 40px;
  max-width: 800px;
  margin: 0 auto;
}

.fo-hero__tag {
  display: inline-block;
  padding: 4px 12px;
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: 12px;
  letter-spacing: 2px;
  margin-bottom: 16px;
}

.fo-hero__title {
  font-family: var(--font-heading);
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.fo-hero__desc {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.category-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
}

.category-tab {
  padding: 10px 24px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-tab--static {
  cursor: default;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border-color: color-mix(in srgb, var(--accent) 30%, transparent);
  color: var(--text-primary);
}

.category-tab:hover {
  background: var(--bg-hover);
}

.category-tab.active {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--accent);
}

.fo-region-filter {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.fo-region-chip {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.fo-region-chip:hover {
  background: var(--bg-hover);
}

.fo-region-chip.active {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--accent);
}

.fo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.fo-card {
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.fo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.fo-card__image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.fo-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fo-card__category-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: 12px;
  border-radius: 4px;
}

.fo-card__body {
  padding: 20px;
}

.fo-card__meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.fo-card__region,
.fo-card__type {
  font-size: 12px;
  padding: 2px 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  color: var(--text-muted);
}

.fo-card__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.fo-card__summary {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fo-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fo-tag {
  font-size: 12px;
  padding: 2px 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  color: var(--text-muted);
}

.fo-empty {
  text-align: center;
  padding: 80px 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .fo-hero__title {
    font-size: 28px;
  }
  
  .fo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
