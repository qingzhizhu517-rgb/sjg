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

  <!-- REAL 主题：信笺式横排 -->
  <div v-else-if="isReal" class="poem-detail poem-detail--real">
    <div v-if="moodBg" class="mood-bg" :style="{ backgroundImage: `url(${moodBg})` }" aria-hidden="true"></div>
    <!-- Back -->
    <div class="detail-top">
      <button class="back-link" @click="$router.back()">← 返回</button>
    </div>

    <!-- 视觉锚点：关联景观图 Hero 带 -->
    <div v-if="moodBg" class="poem-hero-anchor" :style="{ backgroundImage: `url(${moodBg})` }" aria-hidden="true">
      <div class="poem-hero-anchor__veil"></div>
    </div>

    <!-- Poem Header -->
    <div class="poem-header">
      <div class="header-dynasty" v-if="dynasty">{{ dynasty.name }}</div>
      <h1 class="poem-title">{{ poem.title }}</h1>
      <div class="header-meta">
        <router-link v-if="poet" :to="`/poets/${poet.id}`" class="meta-poet">{{ poet.name }}</router-link>
        <span v-if="spot" class="meta-spot">创作于
          <router-link :to="`/regions/${spot.region}`" class="spot-link">{{ spot.name }}</router-link>
        </span>
      </div>
      <div v-if="sentimentTags.length" class="header-tags">
        <span v-for="t in sentimentTags" :key="t" class="header-tag">{{ t }}</span>
      </div>
    </div>

    <!-- Poem Body -->
    <div class="poem-body card">
      <div class="body-ornament top-left">「</div>
      <div class="body-ornament bottom-right">」</div>

      <div class="poem-text">
        <p v-for="(line, i) in poemLines" :key="i" class="poem-line"
           :style="{ animationDelay: `${i * 0.08}s` }">
          {{ line }}
        </p>
      </div>

      <button class="annotation-btn" @click="showAnnotation = !showAnnotation">
        <span class="btn-icon">{{ showAnnotation ? '合' : '注' }}</span>
        {{ showAnnotation ? '隐藏注解' : '显示注解' }}
      </button>

      <transition name="annotation-slide">
        <div v-if="showAnnotation && poem.annotation" class="annotation-panel">
          <h3 class="panel-title">注解</h3>
          <p class="panel-text">{{ poem.annotation }}</p>
        </div>
      </transition>
    </div>

    <!-- Background -->
    <div v-if="poem.background" class="detail-section">
      <h2 class="section-heading">创作背景</h2>
      <div class="background-content">
        <p>{{ poem.background }}</p>
      </div>
    </div>

    <!-- AI Analysis -->
    <PoemAnalysis v-if="poem.id" :poem-id="poem.id" />

    <!-- Media -->
    <div v-if="poem.videoUrl" class="detail-section">
      <h2 class="section-heading">诗词赏析视频</h2>
      <div class="media-wrap">
        <video :src="poem.videoUrl" controls preload="none" class="video-player" />
      </div>
    </div>

    <div v-if="poem.audioUrl" class="detail-section">
      <h2 class="section-heading">诗词朗读</h2>
      <div class="audio-wrap">
        <audio :src="poem.audioUrl" controls class="audio-player" />
      </div>
    </div>
  </div>

  <!-- INKWASH 主题：诗笺式竖排 -->
  <div v-else class="poem-detail poem-detail--inkwash">
    <div v-if="moodBg" class="mood-bg mood-bg--inkwash" :style="{ backgroundImage: `url(${moodBg})` }" aria-hidden="true"></div>

    <!-- Back -->
    <div class="detail-top">
      <button class="back-link" @click="$router.back()">← 返回</button>
    </div>

    <!-- 诗笺主体：竖排布局 -->
    <div class="ink-poem-scroll">
      <!-- 左侧：印章装饰 + 朝代 -->
      <aside class="ink-poem-sidebar">
        <div class="ink-seal-block">
          <span class="ink-seal-char">{{ dynasty?.name?.charAt(0) || '诗' }}</span>
          <span class="ink-seal-dynasty">{{ dynasty?.name }}</span>
        </div>
        <div v-if="poet" class="ink-poet-info">
          <router-link :to="`/poets/${poet.id}`" class="ink-poet-link">{{ poet.name }}</router-link>
        </div>
        <div v-if="spot" class="ink-spot-info">
          <router-link :to="`/regions/${spot.region}`" class="ink-spot-link">{{ spot.name }}</router-link>
        </div>
      </aside>

      <!-- 中央：竖排诗文 -->
      <div class="ink-poem-main">
        <h1 class="ink-poem-title">{{ poem.title }}</h1>
        <div class="ink-poem-body">
          <div class="ink-poem-text">
            <p v-for="(line, i) in poemLines" :key="i" class="ink-poem-line"
               :style="{ animationDelay: `${i * 0.12}s` }">
              {{ line }}
            </p>
          </div>
        </div>
        <!-- 印章落款 -->
        <div class="ink-poem-seal">
          <span class="ink-seal-stamp">诗</span>
        </div>
      </div>

      <!-- 右侧：注解面板 -->
      <aside class="ink-annotation-sidebar">
        <button class="ink-annotation-toggle" @click="showAnnotation = !showAnnotation">
          {{ showAnnotation ? '合' : '注' }}
        </button>
        <transition name="annotation-slide">
          <div v-if="showAnnotation && poem.annotation" class="ink-annotation-panel">
            <h3 class="ink-annotation-title">注解</h3>
            <p class="ink-annotation-text">{{ poem.annotation }}</p>
          </div>
        </transition>
      </aside>
    </div>

    <!-- 标签 -->
    <div v-if="sentimentTags.length" class="ink-tags">
      <span v-for="t in sentimentTags" :key="t" class="ink-tag">{{ t }}</span>
    </div>

    <!-- Background -->
    <div v-if="poem.background" class="detail-section">
      <h2 class="section-heading">创作背景</h2>
      <div class="background-content">
        <p>{{ poem.background }}</p>
      </div>
    </div>

    <!-- AI Analysis -->
    <PoemAnalysis v-if="poem.id" :poem-id="poem.id" />

    <!-- Media -->
    <div v-if="poem.videoUrl" class="detail-section">
      <h2 class="section-heading">诗词赏析视频</h2>
      <div class="media-wrap">
        <video :src="poem.videoUrl" controls preload="none" class="video-player" />
      </div>
    </div>

    <div v-if="poem.audioUrl" class="detail-section">
      <h2 class="section-heading">诗词朗读</h2>
      <div class="audio-wrap">
        <audio :src="poem.audioUrl" controls class="audio-player" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'
import { parseTags } from '../utils/poem'
import { adaptSpot, adaptPoem } from '../composables/themeAdapter'
import { pickMoodBackdrop } from '../utils/moodBackdrop'
import { useTheme } from '../composables/useTheme'
import PoemAnalysis from '../components/PoemAnalysis.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'

const route = useRoute()
const { isReal } = useTheme()
const poem = ref(null)
const poet = ref(null)
const dynasty = ref(null)
const spot = ref(null)
const showAnnotation = ref(false)
const errorMsg = ref(null)

// 意境背景：优先诗词自身配图，其次关联景点图；占位印章不算
const moodBg = computed(() =>
  pickMoodBackdrop(
    poem.value ? adaptPoem(poem.value).image : null,
    spot.value ? adaptSpot(spot.value).image : null,
  ),
)

const poemLines = computed(() => poem.value?.content?.split('\n').filter(l => l.trim()) || [])

const sentimentTags = computed(() => parseTags(poem.value?.sentimentTags))

const loadPoem = async () => {
  errorMsg.value = null
  try {
    const data = await api.get(`/poems/${route.params.id}`)
    poem.value = data.poem
    poet.value = data.poet
    dynasty.value = data.dynasty
    spot.value = data.spot
  } catch (err) {
    console.error('加载诗词详情失败:', err)
    errorMsg.value = '加载诗词详情失败，请稍后重试'
  }
}

onMounted(loadPoem)
</script>

<style scoped>
.poem-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 24px 80px;
  position: relative;
}

/* Top bar */
.detail-top {
  padding: 16px 0;
}

.back-link {
  font-size: 14px;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  letter-spacing: 1px;
  transition: color 0.3s;
  font-family: inherit;
  font-weight: 600;
}

.back-link:hover {
  color: var(--accent);
}

/* Header */
.poem-header {
  text-align: center;
  padding: 32px 0 48px;
}

.header-dynasty {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 3px;
  padding: 3px 14px;
  border: 1px solid var(--accent);
  border-radius: 2px;
  margin-bottom: 20px;
}

.poem-title {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 8px;
  margin-bottom: 20px;
  line-height: 1.3;
}

.header-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-size: 15px;
  color: var(--text-secondary);
}

.meta-poet {
  color: var(--accent);
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 2px;
  transition: opacity 0.3s;
  border-bottom: 1px dashed var(--accent);
}

.meta-poet:hover {
  opacity: 0.7;
}

.spot-link {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1.5px solid var(--accent);
  font-weight: 600;
  transition: opacity 0.3s;
}

.spot-link:hover {
  opacity: 0.7;
}

.header-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}
.header-tag {
  font-size: 11px;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  border: 1px solid var(--border-light);
  padding: 3px 11px;
  border-radius: 100px;
  letter-spacing: 1px;
}
.theme-inkwash .header-tag {
  background: color-mix(in srgb, var(--accent) 6%, transparent);
}

/* Poem Body */
.poem-body {
  position: relative;
  padding: 60px 48px;
  text-align: center;
  margin-bottom: 56px;
  background: var(--card-bg);
  border: 1px solid var(--border);
}

.theme-real .poem-body {
  background-image: linear-gradient(color-mix(in srgb, var(--accent) 2%, transparent) 1px, transparent 1px);
  background-size: 100% 3em;
  border-radius: var(--radius-md);
  box-shadow: var(--card-shadow);
}

.theme-inkwash .poem-body {
  background-image: 
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--accent) 0.015%, transparent) 30%, transparent 31%),
    radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--accent) 0.015%, transparent) 30%, transparent 31%);
  border-radius: var(--radius-sm);
}

.body-ornament {
  position: absolute;
  font-family: var(--font-display);
  font-size: 64px;
  color: var(--accent);
  opacity: 0.16;
  line-height: 1;
  user-select: none;
  transition: all 0.3s;
}

.body-ornament.top-left {
  top: 24px;
  left: 28px;
}

.body-ornament.bottom-right {
  bottom: 24px;
  right: 28px;
}

.poem-text {
  margin-bottom: 40px;
}

.poem-line {
  font-size: 24px;
  line-height: 2.5;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 6px;
  animation: lineReveal 0.8s cubic-bezier(0.1, 0.8, 0.2, 1) both;
}

@keyframes lineReveal {
  from {
    opacity: 0;
    transform: translateY(12px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

/* Annotation button */
.annotation-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px;
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-primary);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  letter-spacing: 2px;
  font-weight: 600;
}

.annotation-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
}

.btn-icon {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 900;
  color: var(--accent);
}

/* Annotation panel (Sayings of the Sages fold-out panel) */
.annotation-panel {
  margin-top: 32px;
  padding: 32px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  text-align: left;
  position: relative;
  /* Concertina fold visual lines */
  background-image: 
    linear-gradient(90deg, color-mix(in srgb, var(--text-primary) 3%, transparent) 1px, transparent 1px),
    linear-gradient(180deg, color-mix(in srgb, var(--text-primary) 2%, transparent) 1px, transparent 1px);
  background-size: 40px 100%, 100% 24px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.04);
}

.theme-inkwash .annotation-panel {
  background: var(--bg-tertiary);
  border: 1px double var(--accent);
}

.panel-title {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 16px;
  letter-spacing: 3px;
  border-bottom: 1.5px solid var(--accent);
  padding-bottom: 6px;
  display: inline-block;
}

.panel-text {
  font-size: 15px;
  line-height: 2.2;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.annotation-slide-enter-active,
.annotation-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.annotation-slide-enter-from,
.annotation-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Sections */
.detail-section {
  margin-bottom: 48px;
}

.section-heading {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
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
  text-align: justify;
}

/* Media styling */
.media-wrap {
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  border: 8px solid #2b1d12; /* Mahogany frame */
  outline: 1px solid var(--accent-light);
  outline-offset: -3px;
  background: #000;
  max-width: 640px;
  margin: 0 auto;
}

.theme-inkwash .media-wrap {
  border: 2px solid var(--accent);
  outline: none;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 0.1%, transparent);
  border-radius: var(--radius-sm);
}

.video-player {
  width: 100%;
  max-width: 640px;
  display: block;
}

.audio-wrap {
  background: var(--bg-secondary);
  padding: 20px 24px;
  border-radius: var(--radius-md);
  border: 2px solid #2b1d12;
  box-shadow: var(--card-shadow);
  display: flex;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  justify-content: center;
  position: relative;
}

.theme-inkwash .audio-wrap {
  border: 1px solid var(--accent);
  background: var(--card-bg);
  border-radius: var(--radius-sm);
  box-shadow: none;
}

.audio-player {
  width: 100%;
}

/* Inkwash specific */
.theme-inkwash .poem-line {
  letter-spacing: 8px;
}

.theme-inkwash .body-ornament {
  opacity: 0.12;
}

@media (max-width: 768px) {
  .poem-title {
    font-size: 32px;
    letter-spacing: 4px;
  }
  .poem-body {
    padding: 40px 20px;
  }
  .poem-line {
    font-size: 18px;
    letter-spacing: 3px;
    line-height: 2.2;
  }
  .body-ornament {
    display: none;
  }
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

/* 意境背景：关联图模糊铺底，内容层之上无交互 */
.mood-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-size: cover;
  background-position: center;
  filter: blur(60px) saturate(0.85);
  opacity: 0.16;
  pointer-events: none;
}

:global(.theme-inkwash) .mood-bg {
  filter: blur(70px) grayscale(0.4);
  opacity: 0.12;
}

/* 视觉锚点 Hero 带 */
.poem-hero-anchor {
  position: relative;
  height: 38vh;
  min-height: 220px;
  margin: 0 calc(50% - 50vw); /* 破容器全宽 */
  background-size: cover;
  background-position: center 35%;
}

.poem-hero-anchor__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--bg-primary) 0%, transparent 30%, transparent 70%, var(--bg-primary) 100%);
}

/* ========== INKWASH 竖排诗笺布局 ========== */

.poem-detail--inkwash {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 24px 80px;
  position: relative;
}

.mood-bg--inkwash {
  filter: blur(70px) grayscale(0.4);
  opacity: 0.12;
}

/* 竖排诗笺主体 */
.ink-poem-scroll {
  display: flex;
  gap: 32px;
  margin: 32px 0;
  min-height: 500px;
}

/* 左侧：印章装饰 */
.ink-poem-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 24px 16px;
  width: 80px;
  flex-shrink: 0;
}

.ink-seal-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.ink-seal-char {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
  text-shadow: 2px 2px 4px color-mix(in srgb, var(--accent) 30%, transparent);
}

.ink-seal-dynasty {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 2px;
  writing-mode: vertical-rl;
}

.ink-poet-info {
  writing-mode: vertical-rl;
}

.ink-poet-link {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
  text-decoration: none;
  letter-spacing: 4px;
  border-bottom: 1px dashed var(--accent);
  padding-bottom: 4px;
  transition: opacity 0.3s;
}

.ink-poet-link:hover {
  opacity: 0.7;
}

.ink-spot-info {
  writing-mode: vertical-rl;
}

.ink-spot-link {
  font-size: 12px;
  color: var(--text-muted);
  text-decoration: none;
  letter-spacing: 2px;
  transition: color 0.3s;
}

.ink-spot-link:hover {
  color: var(--accent);
}

/* 中央：竖排诗文 */
.ink-poem-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.ink-poem-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 8px;
  text-align: center;
  margin: 0;
}

.ink-poem-body {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 48px 40px;
  position: relative;
  /* 水墨纹理背景 */
  background-image:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--accent) 0.015%, transparent) 30%, transparent 31%),
    radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--accent) 0.015%, transparent) 30%, transparent 31%);
}

.ink-poem-text {
  display: flex;
  flex-direction: row-reverse; /* 竖排从右到左 */
  gap: 24px;
  justify-content: center;
}

.ink-poem-line {
  writing-mode: vertical-rl;
  font-size: 24px;
  line-height: 2;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 6px;
  animation: inkLineReveal 0.8s cubic-bezier(0.1, 0.8, 0.2, 1) both;
}

@keyframes inkLineReveal {
  from {
    opacity: 0;
    transform: translateX(12px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0);
  }
}

/* 印章落款 */
.ink-poem-seal {
  display: flex;
  justify-content: center;
}

.ink-seal-stamp {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
  color: var(--accent);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--accent);
  border-radius: 4px;
  transform: rotate(-5deg);
  box-shadow: 2px 2px 8px color-mix(in srgb, var(--accent) 30%, transparent);
}

/* 右侧：注解面板 */
.ink-annotation-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 60px;
  flex-shrink: 0;
}

.ink-annotation-toggle {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 900;
  color: var(--accent);
  background: none;
  border: 1px solid var(--accent);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.ink-annotation-toggle:hover {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}

.ink-annotation-panel {
  writing-mode: vertical-rl;
  background: var(--bg-tertiary);
  border: 1px double var(--accent);
  border-radius: var(--radius-sm);
  padding: 24px 16px;
  max-height: 400px;
  overflow-y: auto;
}

.ink-annotation-title {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  margin: 0 0 12px 0;
  letter-spacing: 3px;
  border-bottom: 1.5px solid var(--accent);
  padding-bottom: 4px;
}

.ink-annotation-text {
  font-size: 14px;
  line-height: 2;
  color: var(--text-primary);
  letter-spacing: 0.5px;
  margin: 0;
}

/* 标签 */
.ink-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 24px 0;
}

.ink-tag {
  font-size: 11px;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--accent) 6%, transparent);
  border: 1px solid var(--border-light);
  padding: 3px 11px;
  border-radius: 100px;
  letter-spacing: 1px;
}

/* 响应式 */
@media (max-width: 768px) {
  .ink-poem-scroll {
    flex-direction: column;
    gap: 24px;
  }

  .ink-poem-sidebar {
    flex-direction: row;
    width: 100%;
    padding: 16px;
  }

  .ink-seal-dynasty {
    writing-mode: horizontal-tb;
  }

  .ink-poet-info,
  .ink-spot-info {
    writing-mode: horizontal-tb;
  }

  .ink-poem-text {
    gap: 16px;
  }

  .ink-poem-line {
    font-size: 18px;
    letter-spacing: 4px;
  }

  .ink-annotation-sidebar {
    flex-direction: row;
    width: 100%;
  }

  .ink-annotation-panel {
    writing-mode: horizontal-tb;
    max-height: 200px;
  }
}

</style>

