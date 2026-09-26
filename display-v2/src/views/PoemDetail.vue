<template>
  <ErrorState v-if="errorMsg" :message="errorMsg" @retry="loadPoem" />

  <!-- 诗笺骨架屏：模拟 锚点带 + 标题 + 正文行 -->
  <div v-else-if="!poem" class="poem-skeleton" aria-busy="true" aria-label="诗篇加载中">
    <SkeletonBlock height="38vh" />
    <div class="poem-skeleton__body">
      <SkeletonBlock height="34px" width="42%" />
      <SkeletonBlock height="14px" width="24%" />
      <SkeletonBlock v-for="i in 5" :key="i" height="18px" :width="`${88 - i * 6}%`" />
    </div>
  </div>

  <!-- 横排诗笺：页面负责数据和附加内容，主视觉由组件封装 -->
  <div v-else class="poem-detail poem-detail--inkwash">
    <div class="detail-top">
      <button class="back-link" @click="$router.back()">← 返回</button>
    </div>

    <PoemManuscript
      :poem="poem"
      :poet="poet"
      :dynasty="dynasty"
      :spot="spot"
      :mood-bg="moodBg"
      :tags="sentimentTags"
    />

    <!-- Background -->
    <div v-if="poem.background" class="detail-section">
      <h2 class="section-heading">创作背景</h2>
      <div class="background-content">
        <p>{{ poem.background }}</p>
      </div>
    </div>

    <SourceList :sources="sources" class="detail-section" />

    <!-- AI Analysis -->
    <PoemAnalysis v-if="poem.id" :poem-id="poem.id" />

    <!-- Media -->
    <div v-if="parsedVideoUrl" class="detail-section">
      <h2 class="section-heading">诗词赏析视频</h2>
      <div class="media-wrap">
        <video :src="parsedVideoUrl" controls preload="none" class="video-player" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'
import { parseTags } from '../utils/poem'
import { adaptSpot, adaptPoem } from '../composables/themeAdapter'
import { pickMoodBackdrop } from '../utils/moodBackdrop'
import { parseFirstUrl } from '../composables/useImage'
import PoemManuscript from '../components/poem/PoemManuscript.vue'
import PoemAnalysis from '../components/PoemAnalysis.vue'
import SourceList from '../components/SourceList.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'

const route = useRoute()
const poem = ref(null)
const poet = ref(null)
const dynasty = ref(null)
const spot = ref(null)
const sources = ref([])
const errorMsg = ref(null)
let loadSequence = 0

// 意境背景：优先诗词自身配图，其次关联景点图；占位印章不算
const moodBg = computed(() =>
  pickMoodBackdrop(
    poem.value ? adaptPoem(poem.value).image : null,
    spot.value ? adaptSpot(spot.value).image : null,
  ),
)

const sentimentTags = computed(() => parseTags(poem.value?.sentimentTags))

// videoUrl 是 JSON 数组字符串 '["https://...mp4"]'，取首个有效 URL
const parsedVideoUrl = computed(() => parseFirstUrl(poem.value?.videoUrl))

const loadPoem = async () => {
  const sequence = ++loadSequence
  errorMsg.value = null
  poem.value = null
  poet.value = null
  dynasty.value = null
  spot.value = null
  sources.value = []
  try {
    const data = await api.get(`/poems/${route.params.id}`)
    if (sequence !== loadSequence) return
    poem.value = data.poem
    poet.value = data.poet
    dynasty.value = data.dynasty
    spot.value = data.spot
    sources.value = Array.isArray(data.sources) ? data.sources : []
  } catch (err) {
    if (sequence !== loadSequence) return
    console.error('加载诗词详情失败:', err)
    errorMsg.value = '加载诗词详情失败，请稍后重试'
  }
}

// 同一详情组件会被 Vue Router 复用；参数变化时必须重新取数。
watch(() => route.params.id, loadPoem, { immediate: true })
</script>

<style scoped>
.poem-detail {
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px 24px 80px;
  position: relative;
}

/* Top bar */
.detail-top {
  padding: 16px 0;
}

.back-link {
  min-width: 88px;
  min-height: 44px;
  padding: 10px 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  letter-spacing: 1px;
  transition: color 160ms cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
  font-weight: 600;
}

.back-link:hover {
  color: var(--accent);
}

.back-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

/* Sections */
.detail-section {
  max-width: 960px;
  margin: var(--sp-8) auto 0;
}

.section-heading {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
  letter-spacing: 2px;
  position: relative;
}

.section-heading::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--accent);
}

.background-content p {
  font-size: 16px;
  line-height: 2.2;
  color: var(--text-primary);
  text-indent: 2em;
  text-align: left;
  max-width: var(--measure);
  margin: 0 auto;
}

/* Media styling */
.media-wrap {
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 10%, transparent);
  border: 2px solid var(--accent);
  background: var(--text-primary);
  max-width: 640px;
  margin: 0 auto;
}

.video-player {
  width: 100%;
  max-width: 640px;
  aspect-ratio: 16 / 9;
  object-fit: contain;
  display: block;
}

/* 诗笺骨架屏 */
.poem-skeleton {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.poem-skeleton__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

@media (prefers-reduced-motion: reduce) {
  .back-link {
    transition: none;
  }
}
</style>
