<template>
  <div v-if="errorMsg" class="poem-state">
    <ErrorState :message="errorMsg" @retry="loadPoem" />
    <router-link :to="readingBack" class="folio-back">← 返回诗词列表</router-link>
  </div>

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
      <router-link :to="readingBack" class="folio-back">← {{ route.query.returnTo ? '返回检索结果' : '返回诗词列表' }}</router-link>
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

    <section v-if="previewMode && poem.appreciation" class="detail-section preview-appreciation">
      <h2 class="section-heading">诗意赏读</h2>
      <p>{{ poem.appreciation }}</p>
    </section>

    <!-- 设计样本仅使用本地内容，实际赏析组件只挂载于正式数据页。 -->
    <PoemAnalysis v-if="!previewMode && poem.id" :poem-id="poem.id" />

    <div class="folio-detail-actions"><p>读过此篇，再寻找一种新的心境。</p><div class="folio-actions"><router-link :to="readingBack" class="folio-button">返回列表</router-link><router-link :to="readingLink" class="folio-button">AI对照阅读 ↗</router-link><router-link :to="atlasLink('/compose', route)" class="folio-button folio-button--primary">写一首自己的诗 →</router-link></div></div>
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
import { safeReturnPath } from '../config/siteNavigation'
import { buildReadingLink } from '../utils/readingLink'
import { parseTags } from '../utils/poem'
import { adaptSpot, adaptPoem } from '../composables/themeAdapter'
import { pickMoodBackdrop } from '../utils/moodBackdrop'
import { parseFirstUrl } from '../composables/useImage'
import { isAtlasPreview, atlasLink, previewPoems, previewPoets, previewDynasties, previewSpot, previewSpots } from '../config/atlasPreview'
import PoemManuscript from '../components/poem/PoemManuscript.vue'
import PoemAnalysis from '../components/PoemAnalysis.vue'
import SourceList from '../components/SourceList.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'

const route = useRoute()
const readingBack = computed(() => atlasLink(safeReturnPath(route.query.returnTo, '/poems'), route))
const previewMode = computed(() => isAtlasPreview(route))
const poem = ref(null)
const poet = ref(null)
const dynasty = ref(null)
const spot = ref(null)
const readingLink = computed(() => buildReadingLink({ poem: poem.value?.id, returnTo: route.fullPath }, route))
const sources = ref([])
const errorMsg = ref(null)
let loadSequence = 0
const previewBackPath = computed(() => spot.value
  ? `/spots/${spot.value.id}`
  : poet.value ? `/poets/${poet.value.id}` : '/')
const previewBackLabel = computed(() => spot.value
  ? `返回${spot.value.name}`
  : poet.value ? `返回${poet.value.name}` : '返回山河图志')

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
  if (previewMode.value) {
    const selected = previewPoems.find((item) => String(item.id) === String(route.params.id))
    if (!selected) {
      errorMsg.value = '这首诗词尚未收录在水墨预览中'
      return
    }
    poem.value = selected
    poet.value = previewPoets.find((item) => item.id === selected.poetId) || null
    dynasty.value = previewDynasties.find((item) => item.id === selected.dynastyId) || null
    spot.value = [previewSpot, ...previewSpots].find((item) => item.id === selected.spotId) || null
    return
  }
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
watch(() => [route.params.id, route.query.preview], loadPoem, { immediate: true })
</script>

<style scoped>
.poem-detail {
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px 24px 80px;
  position: relative;
}

.poem-state {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  text-align: center;
}

.preview-appreciation p {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 2;
  text-align: left;
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
  text-decoration: none;
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
