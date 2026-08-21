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

  <!-- 诗笺式竖排(唯一版式, 一页一貌) -->
  <div v-else class="poem-detail poem-detail--inkwash">
    <div v-if="moodBg" class="mood-bg" :style="{ backgroundImage: `url(${moodBg})` }" aria-hidden="true"></div>

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
          <router-link :to="`/spots/${spot.id}`" class="ink-spot-link">{{ spot.name }}</router-link>
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
        <button class="ink-annotation-toggle" :aria-expanded="String(showAnnotation)"
                aria-controls="ink-annotation-panel" @click="showAnnotation = !showAnnotation">
          {{ showAnnotation ? '合' : '注' }}
        </button>
        <transition name="annotation-slide">
          <div v-if="showAnnotation && poem.annotation" id="ink-annotation-panel" class="ink-annotation-panel">
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
    <div v-if="parsedVideoUrl" class="detail-section">
      <h2 class="section-heading">诗词赏析视频</h2>
      <div class="media-wrap">
        <video :src="parsedVideoUrl" controls preload="none" class="video-player" />
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
import { parseFirstUrl } from '../composables/useImage'
import PoemAnalysis from '../components/PoemAnalysis.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'

const route = useRoute()
const poem = ref(null)
const poet = ref(null)
const dynasty = ref(null)
const spot = ref(null)
const showAnnotation = ref(true)
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

// videoUrl 是 JSON 数组字符串 '["https://...mp4"]'，取首个有效 URL
const parsedVideoUrl = computed(() => parseFirstUrl(poem.value?.videoUrl))

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

/* 意境背景：单一水墨风格 */
.mood-bg {
  filter: blur(70px) grayscale(0.4);
  opacity: 0.12;
}

/* ========== 竖排诗笺布局 ========== */

.poem-detail--inkwash {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 24px 80px;
  position: relative;
}

/* 竖排诗笺主体 */
.ink-poem-scroll {
  display: flex;
  gap: 32px;
  margin: 32px 0;
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
  font-weight: 600;
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
  font-weight: 600;
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
  font-weight: 600;
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
  width: fit-content;      /* 单列诗（62.6%）不再被拉到满宽而左右留白 */
  max-width: 100%;
  margin: 0 auto;
  /* 水墨纹理背景 */
  background-image:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--accent) 1.5%, transparent) 30%, transparent 31%),
    radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--accent) 1.5%, transparent) 30%, transparent 31%);
}

.ink-poem-text {
  display: flex;
  flex-direction: row-reverse; /* 竖排从右到左 */
  gap: 24px;
  justify-content: flex-start;
  max-width: 100%;
  overflow-x: auto;           /* 多段/超长诗横向可滚，不再被 body overflow 裁掉 */
  scroll-snap-type: x proximity;
  padding-bottom: 8px;        /* 给滚动条留位，避免压住末列 */
}

/* 横向可滚提示：内容溢出时右侧渐隐 + 可见滚动条 */
.ink-poem-text::-webkit-scrollbar {
  height: 6px;
}
.ink-poem-text::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 3px;
}

.ink-poem-line {
  writing-mode: vertical-rl;
  text-orientation: upright;             /* 中文竖排正立，数字/拉丁不再侧躺 */
  font-feature-settings: 'vert' 1;       /* 标点竖排变体 */
  font-size: 24px;
  line-height: 2;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 6px;
  max-height: calc(100dvh - 240px);      /* 超长单段（最长 270 字）不再拉出 8000px 竖条 */
  flex-wrap: wrap;                        /* 超出列高自动折成多列 */
  scroll-snap-align: start;
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
  font-weight: 600;
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
  font-weight: 600;
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
  text-orientation: upright;
  background: var(--bg-tertiary);
  border: 1px double var(--accent);
  border-radius: var(--radius-sm);
  padding: 24px 16px;
  max-width: 240px;
  overflow-x: auto;    /* 竖排文字溢出轴是横向，overflow-y 管不住 */
}

.ink-annotation-title {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 600;
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
  font-size: var(--fs-body-sm);
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
    text-orientation: mixed;
    max-height: 200px;
    max-width: none;
    overflow-y: auto;   /* 移动端转横排后溢出轴恢复为纵向 */
  }
}

</style>

