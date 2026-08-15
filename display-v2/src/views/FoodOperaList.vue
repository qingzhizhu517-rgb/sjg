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

    <!-- 分类标签 -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="category-tab"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

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
          <img :src="item.imageUrl" :alt="item.title" loading="lazy" />
          <div class="fo-card__category-badge">{{ item.category === 'food' ? '美食' : '戏曲' }}</div>
        </div>
        <div class="fo-card__body">
          <div class="fo-card__meta">
            <span class="fo-card__region">{{ item.region || '全域' }}</span>
            <span class="fo-card__type">{{ item.category === 'food' ? '饮食文化' : '戏曲艺术' }}</span>
          </div>
          <h3 class="fo-card__title">{{ item.title }}</h3>
          <p class="fo-card__summary">{{ item.summary }}</p>
          <div class="fo-card__tags">
            <span v-for="tag in item.tags" :key="tag" class="fo-tag">{{ tag }}</span>
          </div>
        </div>
      </article>
    </div>

    <!-- 空状态 -->
    <div v-else class="fo-empty">
      <EmptyState message="暂无相关内容" />
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

const activeCategory = ref('all')
const items = ref([])
const loaded = ref(false)
const errorMsg = ref('')

const categories = [
  { key: 'all', label: '全部' },
  { key: 'food', label: '饮食文化' },
  { key: 'opera', label: '戏曲艺术' }
]

const filteredItems = computed(() => {
  if (activeCategory.value === 'all') return items.value
  return items.value.filter(item => item.category === activeCategory.value)
})

async function load() {
  loaded.value = false
  errorMsg.value = ''
  try {
    const data = await api.get('/cultural-items', {
      params: { category: 'food_opera' }
    })
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

.category-tab:hover {
  background: var(--bg-hover);
}

.category-tab.active {
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
