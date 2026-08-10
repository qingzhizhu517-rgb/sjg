<template>
  <ErrorState v-if="errorMsg" :message="errorMsg" @retry="load" />

  <div v-else ref="rootRef" class="festival-detail" :class="{ 'anime-layout': isAnime }">
    <!-- 骨架 -->
    <div v-if="!loaded" class="detail-skeleton" aria-busy="true" aria-label="节庆详情加载中">
      <SkeletonBlock height="200px" />
      <SkeletonBlock height="320px" />
    </div>

    <template v-else-if="item">
      <!-- 返回 -->
      <nav class="detail-nav">
        <button class="back-btn" @click="$router.push('/festivals')">
          ← 返回节庆列表
        </button>
      </nav>

      <!-- 头部 -->
      <header class="detail-hero">
        <div class="detail-hero__seal">{{ sealOf }}</div>
        <div class="detail-hero__meta">
          <span class="meta-chip region">{{ item.region || '全域' }}</span>
          <span v-if="detail?.festivalDate" class="meta-chip date">{{ detail.festivalDate }}</span>
        </div>
        <h1 class="detail-hero__title">{{ item.title }}</h1>
        <p v-if="item.summary" class="detail-hero__summary">{{ item.summary }}</p>
      </header>

      <!-- 正文 -->
      <article class="detail-content card">
        <p class="detail-content__text">{{ item.content }}</p>
      </article>

      <!-- 扩展四区块 -->
      <section v-if="detail" class="detail-sections">
        <div v-if="detail.origin" class="detail-block card" data-reveal>
          <h2 class="detail-block__title"><span class="block-seal">源</span>起源渊源</h2>
          <p class="detail-block__text">{{ detail.origin }}</p>
        </div>
        <div v-if="detail.customs" class="detail-block card" data-reveal>
          <h2 class="detail-block__title"><span class="block-seal">俗</span>习俗活动</h2>
          <p class="detail-block__text">{{ detail.customs }}</p>
        </div>
        <div v-if="detail.food" class="detail-block card" data-reveal>
          <h2 class="detail-block__title"><span class="block-seal">食</span>节庆饮食</h2>
          <p class="detail-block__text">{{ detail.food }}</p>
        </div>
      </section>

      <!-- 空态：无正文也无扩展 -->
      <EmptyState
        v-if="!item.content && !detail"
        icon="节"
        message="详情内容整理中"
        hint="先回列表看看其他节庆"
      />
    </template>

    <EmptyState
      v-else
      icon="节"
      message="节庆不存在或已下架"
      hint="返回列表看看其他节庆"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useReveal } from '../composables/useReveal'
import api from '../api'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import EmptyState from '../components/homepage/EmptyState.vue'

const route = useRoute()
const { isAnime } = useTheme()
const { reveal } = useReveal()

const rootRef = ref(null)
const item = ref(null)
const detail = ref(null)
const loaded = ref(false)
const errorMsg = ref(null)

const sealOf = computed(() => (item.value?.title ? item.value.title[0] : '节'))

const load = async () => {
  loaded.value = false
  errorMsg.value = null
  try {
    const data = await api.get(`/cultural/${route.params.id}`)
    item.value = data.item
    detail.value = data.detail
  } catch (err) {
    console.error('加载节庆详情失败:', err)
    errorMsg.value = '加载节庆详情失败，请稍后重试'
  } finally {
    loaded.value = true
    await nextTick()
    if (rootRef.value) reveal(rootRef.value)
  }
}

onMounted(load)
</script>

<style scoped>
.festival-detail {
  max-width: 860px;
  margin: 0 auto;
  padding: 40px 24px 96px;
}

.detail-skeleton {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-nav {
  margin-bottom: 32px;
}

.back-btn {
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--text-secondary);
  border: 1px solid var(--border, #e8e0d5);
  padding: 7px 16px;
  border-radius: 20px;
  background: var(--card-bg, #fdfaf5);
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  border-color: var(--accent, #9e2b25);
  color: var(--accent, #9e2b25);
}

/* 头部 */
.detail-hero {
  text-align: center;
  margin-bottom: 40px;
}

.detail-hero__seal {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 36px;
  font-weight: 900;
  color: #fff;
  background: var(--accent, #9e2b25);
  border-radius: 8px;
}

.anime-layout .detail-hero__seal {
  border-radius: 4px;
  box-shadow: 3px 3px 0 rgba(169, 50, 38, 0.25);
}

.detail-hero__meta {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.meta-chip {
  font-size: 12px;
  letter-spacing: 2px;
  padding: 4px 14px;
  border-radius: 14px;
  border: 1px solid var(--border, #e8e0d5);
  color: var(--text-secondary);
}

.meta-chip.region {
  border-color: var(--accent, #9e2b25);
  color: var(--accent, #9e2b25);
  font-weight: 700;
}

.detail-hero__title {
  font-family: var(--font-heading);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 900;
  letter-spacing: 8px;
  color: var(--text-primary);
  margin: 0 0 16px;
}

.detail-hero__summary {
  font-size: 15px;
  line-height: 1.9;
  color: var(--text-secondary);
  margin: 0;
}

/* 正文 */
.detail-content {
  background: var(--card-bg, #fdfaf5);
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 6px;
  padding: 36px 40px;
  margin-bottom: 32px;
}

.detail-content__text {
  font-size: 15px;
  line-height: 2.1;
  color: var(--text-primary);
  text-align: justify;
  letter-spacing: 0.5px;
  margin: 0;
}

/* 扩展区块 */
.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-block {
  background: var(--card-bg, #fdfaf5);
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 6px;
  padding: 28px 32px;
}

.detail-block__title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--text-primary);
  margin: 0 0 14px;
}

.block-seal {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 900;
  color: #fff;
  background: var(--accent, #9e2b25);
  border-radius: 5px;
}

.detail-block__text {
  font-size: 14px;
  line-height: 2;
  color: var(--text-secondary);
  text-align: justify;
  margin: 0;
}

@media (max-width: 768px) {
  .festival-detail {
    padding: 28px 16px 64px;
  }

  .detail-hero__title {
    letter-spacing: 4px;
  }

  .detail-content,
  .detail-block {
    padding: 24px 20px;
  }
}
</style>
