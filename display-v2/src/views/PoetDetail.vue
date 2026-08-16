<template>
  <!-- 诗人详情: 单一根节点(路由过渡期间根不被替换, 防止 enter 类残留导致整页透明) -->
  <div class="pd pd--inkwash">
    <!-- 人物小传卷(唯一版式, 一页一貌) -->
    <template v-if="poet">
    <!-- 返回 -->
    <div class="pd-back">
      <router-link :to="backTo" class="pd-back-link">← 返回名士</router-link>
    </div>

    <div ref="revealRoot" class="pd-content">
      <!-- 小传卷主体 -->
      <div class="ink-scroll-layout">        <!-- 左侧：竖排信息栏 -->
        <aside class="ink-scroll-sidebar">
          <!-- 印章头像 -->
          <div class="ink-portrait-frame">
            <span class="ink-portrait-stamp">{{ poet.name ? poet.name.charAt(0) : '文' }}</span>
            <img v-if="avatar" :src="avatar" :alt="poet.name" class="ink-portrait-img" decoding="async" @error="onAvatarError" />
          </div>

          <!-- 竖排基本信息 -->
          <div class="ink-info-vertical">
            <span class="ink-dynasty-seal" v-if="dynasty">{{ dynasty.name }}</span>
            <span class="ink-poet-name">{{ poet.name }}</span>
            <span class="ink-poem-count">{{ poems.length }} 篇</span>
          </div>

          <!-- 代表作印章 -->
          <div v-if="signature" class="ink-signature-seal">
            <span class="ink-sig-char">诗</span>
          </div>
        </aside>

        <!-- 中央：小传内容 -->
        <main class="ink-scroll-main">
          <!-- 标题区 -->
          <header class="ink-scroll-header">
            <h1 class="ink-scroll-title">{{ poet.name }}</h1>
            <div class="ink-scroll-meta" v-if="poet.birthYear || poet.birthplace">
              <span v-if="poet.birthYear">{{ poet.birthYear }}-{{ poet.deathYear || '？' }}</span>
              <span v-if="poet.birthYear && poet.birthplace" class="ink-meta-sep">·</span>
              <span v-if="poet.birthplace">{{ poet.birthplace }}</span>
            </div>
          </header>

          <!-- 代表作（竖排） -->
          <div v-if="signature" class="ink-signature-block">
            <div class="ink-sig-text-vertical">
              <p class="ink-sig-line">「{{ signature.firstLine }}」</p>
            </div>
            <cite class="ink-sig-cite">《{{ signature.title }}》</cite>
          </div>

          <!-- 生平（横排） -->
          <section v-if="poet.biography" class="ink-section" data-reveal>
            <h2 class="ink-section-title">生平</h2>
            <div class="ink-bio">{{ poet.biography }}</div>
          </section>

          <!-- 传世诗篇 -->
          <section v-if="poems.length" class="ink-section" data-reveal>
            <h2 class="ink-section-title">传世诗篇 · {{ poems.length }} 首</h2>
            <div class="ink-poems-grid">
              <router-link
                v-for="pm in poems"
                :key="pm.id"
                :to="`/poems/${pm.id}`"
                class="ink-poem-card hover-lift"
              >
                <span class="ink-poem-title">《{{ pm.title }}》</span>
                <p class="ink-poem-line">{{ firstLine(pm.content) }}</p>
              </router-link>
            </div>
          </section>
        </main>
      </div>
    </div>
    </template>

  <div v-else-if="errorMsg" class="pd-state">
    <ErrorState :message="errorMsg" @retry="loadDetail" />
    <router-link :to="backTo" class="pd-back-link" style="margin-top: 16px;">← 返回名士</router-link>
  </div>

  <div v-else class="pd-state">
    <SkeletonBlock height="220px" />
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useImage } from '../composables/useImage'
import { useReveal } from '../composables/useReveal'
import api from '../api'
import { parseTags, firstLine, pickSignaturePoem } from '../utils/poem'
import ErrorState from '../components/homepage/ErrorState.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import dufuPortrait from '../assets/illustrations/10-poet-dufu.png'

// 核心诗人国画立像（无 API 头像时的本地 fallback）
const LOCAL_PORTRAITS = {
  杜甫: dufuPortrait,
}

const route = useRoute()
const { isAnime } = useTheme()
const { getImageUrl } = useImage()
const { reveal } = useReveal()

const poet = ref(null)
const poems = ref([])
const dynasty = ref(null)
const errorMsg = ref(null)
const revealRoot = ref(null)

// 从哪来回哪去：从 /poets/all 进来则回全量列表，否则回 showcase。
// 用 query.from 标记（SPA pushState 不更新 document.referrer，原先的 referrer 判断永不成立）。
// 注意直接给 /poets?view=all, 不走 /poets/all 重定向(过渡期间二次导航会加剧路由过渡卡死)。
const backTo = computed(() => (route.query.from === 'all' ? '/poets?view=all' : '/poets'))

const avatar = computed(() => {
  if (!poet.value) return ''
  const url = isAnime.value ? poet.value.avatarAnimeUrl || poet.value.avatarUrl : poet.value.avatarUrl
  if (url) return getImageUrl(url, isAnime.value)
  // 无 API 头像：查本地国画立像（如杜甫），仍无则空 → 露出印章
  return LOCAL_PORTRAITS[poet.value.name] || ''
})
const onAvatarError = (e) => {
  e.target.style.display = 'none'
}

// 代表作：统一用 pickSignaturePoem，与 ShowcasePoetCard / PoetAllList 一致
const signature = computed(() => pickSignaturePoem(poems.value))

const loadDetail = async () => {
  errorMsg.value = null
  try {
    const data = await api.get(`/poets/${route.params.id}`)
    poet.value = data.poet
    poems.value = data.poems || []
    dynasty.value = data.dynasty
    await nextTick()
    if (revealRoot.value) reveal(revealRoot.value)
  } catch (err) {
    console.error('加载诗人详情失败:', err)
    errorMsg.value = '加载诗人详情失败，请稍后重试'
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.pd {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 48px 96px;
}
.pd-back {
  margin-bottom: 24px;
  text-align: left;
}
.pd-back-link {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 1px;
  transition: color 0.25s;
}
.pd-back-link:hover {
  color: var(--accent);
}
.pd-content {
  max-width: 960px;
}
.pd-state {
  max-width: 960px;
  margin: 0 auto;
  padding: 64px 48px;
  text-align: center;
}

@media (max-width: 900px) {
  .pd { padding: 24px 32px 80px; }
}
@media (max-width: 600px) {
  .pd { padding: 20px 16px 64px; }
}

/* ========== INKWASH 人物小传卷布局 ========== */

.pd--inkwash {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 48px 96px;
}

/* 小传卷主体：左侧竖排信息 + 中央内容 */
.ink-scroll-layout {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

/* 左侧：竖排信息栏 */
.ink-scroll-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 120px;
  flex-shrink: 0;
  position: sticky;
  top: 100px;
}

/* 印章头像框 */
.ink-portrait-frame {
  width: 100px;
  height: 130px;
  border: 2px solid var(--accent);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  background: #2a2520;
}

.ink-portrait-stamp {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 64px;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
}

.ink-portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 2;
}

/* 竖排基本信息 */
.ink-info-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  writing-mode: vertical-rl;
}

.ink-dynasty-seal {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 3px 8px;
  letter-spacing: 3px;
}

.ink-poet-name {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 6px;
}

.ink-poem-count {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 2px;
}

/* 代表作印章 */
.ink-signature-seal {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--accent);
  border-radius: 4px;
  transform: rotate(-5deg);
}

.ink-sig-char {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 900;
  color: var(--accent);
}

/* 中央：小传内容 */
.ink-scroll-main {
  flex: 1;
  min-width: 0;
}

/* 标题区 */
.ink-scroll-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.ink-scroll-title {
  font-family: var(--font-display);
  font-size: clamp(44px, 6vw, 68px);
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 8px;
  line-height: 1.05;
  margin: 0 0 12px 0;
}

.ink-scroll-meta {
  font-size: 13px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

.ink-meta-sep {
  margin: 0 8px;
  color: var(--border);
}

/* 代表作（竖排） */
.ink-signature-block {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 40px;
  padding: 24px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.ink-sig-text-vertical {
  writing-mode: vertical-rl;
}

.ink-sig-line {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 2;
  letter-spacing: 4px;
  margin: 0;
}

.ink-sig-cite {
  font-size: 12px;
  font-style: italic;
  color: var(--text-muted);
  letter-spacing: 1px;
  writing-mode: vertical-rl;
}

/* 小传内容区块 */
.ink-section {
  margin-bottom: 40px;
}

.ink-section-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
  letter-spacing: 2px;
}

.ink-section-title::after {
  content: '';
  display: block;
  width: 40px;
  height: 2px;
  background: var(--accent);
  margin-top: -2px;
}

.ink-bio {
  font-size: 15px;
  line-height: 2;
  color: var(--text-primary);
  text-indent: 2em;
  letter-spacing: 0.5px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 0 4px 4px 0;
  padding: 28px 32px;
}

/* 诗篇网格 */
.ink-poems-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.ink-poem-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.ink-poem-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 10px 24px color-mix(in srgb, var(--text-primary) 0.1%, transparent);
}

.ink-poem-title {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1px;
}

.ink-poem-line {
  font-family: var(--font-heading);
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  letter-spacing: 1px;
  margin: 0;
}

/* 响应式 */
@media (max-width: 900px) {
  .pd--inkwash { padding: 24px 32px 80px; }

  .ink-scroll-layout {
    flex-direction: column;
    gap: 24px;
  }

  .ink-scroll-sidebar {
    flex-direction: row;
    width: 100%;
    position: static;
    flex-wrap: wrap;
    justify-content: center;
  }

  .ink-info-vertical {
    writing-mode: horizontal-tb;
    flex-direction: row;
    gap: 16px;
  }

  .ink-signature-block {
    flex-direction: column;
    gap: 16px;
  }

  .ink-sig-text-vertical {
    writing-mode: horizontal-tb;
  }

  .ink-sig-cite {
    writing-mode: horizontal-tb;
  }

  .ink-poems-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .pd--inkwash { padding: 20px 16px 64px; }
  .ink-scroll-title { letter-spacing: 4px; }
  .ink-bio { padding: 20px; }
}
</style>
