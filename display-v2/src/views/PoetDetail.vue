<template>
  <div class="pd pd--inkwash">
    <template v-if="poet">
    <!-- 返回 -->
    <div class="pd-back">
      <router-link :to="backTo" class="pd-back-link">← 返回名士</router-link>
    </div>

    <div ref="revealRoot" class="pd-content">
      <!-- 英雄区域 -->
      <div class="pd-hero">
        <div class="pd-hero__wash" aria-hidden="true"></div>
        <div class="pd-hero__content">
          <div class="pd-hero__art">
            <div class="pd-portrait">
              <div class="pd-portrait__frame" :style="{ aspectRatio: avatarPresentation.aspectRatio }">
              <img
                v-if="avatar && !avatarLoadFailed"
                :src="avatar"
                :alt="`${poet.name}画像`"
                class="pd-portrait__img"
                :style="{
                  objectFit: avatarPresentation.objectFit,
                  objectPosition: avatarPresentation.objectPosition,
                }"
                decoding="async"
                @error="onAvatarError"
              />
              <InkPlaceholder v-else :seed="poet.id || poet.name" kind="文" />
              </div>
            </div>
          </div>

          <!-- 右侧信息 -->
          <div class="pd-info">
            <div v-if="dynasty" class="pd-dynasty-row">
              <span class="pd-dynasty" v-if="dynasty">{{ dynasty.name }}</span>
              <span class="pd-dynasty-years" v-if="dynasty?.startYear != null && dynasty?.endYear != null">
                {{ dynasty.startYear }}—{{ dynasty.endYear }}
              </span>
            </div>
            <h1 class="pd-name">{{ poet.name }}</h1>
            <p class="pd-style" v-if="poet.style">{{ poet.style }}</p>
            <div class="pd-meta" v-if="poet.birthYear || poet.birthplace">
              <span v-if="poet.birthYear">{{ poet.birthYear }}-{{ poet.deathYear || '？' }}</span>
              <span v-if="poet.birthYear && poet.birthplace" class="pd-meta__sep">·</span>
              <span v-if="poet.birthplace">{{ poet.birthplace }}</span>
            </div>
            <p v-if="biographyLead" class="pd-lede">{{ biographyLead }}</p>

            <div class="pd-stats">
              <div class="pd-stat">
                <span class="pd-stat__num">{{ poems.length }}</span>
                <span class="pd-stat__label">传世诗篇</span>
              </div>
              <div class="pd-stat" v-if="lifespan">
                <span class="pd-stat__num">{{ lifespan }}</span>
                <span class="pd-stat__label">春秋享年</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主内容 -->
      <main class="pd-main">
        <!-- 生平 -->
        <section class="pd-section pd-section--bio" data-reveal>
          <div class="pd-section__body">
            <div class="pd-section__header">
              <div class="pd-section__icon" aria-hidden="true">传</div>
              <div class="pd-section__title-group">
                <h2 class="pd-section__title">生平</h2>
                <p class="pd-section__subtitle">{{ poet.name }}</p>
              </div>
            </div>
            <div class="pd-bio">{{ biographyText }}</div>
          </div>
        </section>

        <SourceList :sources="sources" class="pd-section" data-reveal />

        <router-link
          v-if="signature"
          :to="`/poems/${signature.id}`"
          class="pd-signature__link"
          data-reveal
        >
          <span class="pd-signature__label">代表句</span>
          <span class="pd-signature__poem">「{{ signature.firstLine }}」</span>
          <cite class="pd-signature__title">——《{{ signature.title }}》</cite>
          <span class="pd-signature__arrow" aria-hidden="true">→</span>
        </router-link>

        <!-- 传世诗篇 -->
        <section class="pd-section" data-reveal>
          <div class="pd-section__header">
            <div class="pd-section__icon" aria-hidden="true">诗</div>
            <div class="pd-section__title-group">
              <h2 class="pd-section__title">传世诗篇</h2>
              <p class="pd-section__subtitle">共收录 {{ poems.length }} 首经典作品</p>
            </div>
          </div>

          <div v-if="poems.length" class="pd-poems-grid">
            <router-link
              v-for="(pm, idx) in poems"
              :key="pm.id"
              :to="`/poems/${pm.id}`"
              class="pd-poem-card hover-lift"
            >
              <span class="pd-poem-card__num">{{ String(idx + 1).padStart(2, '0') }}</span>
              <h3 class="pd-poem-card__title">《{{ pm.title }}》</h3>
              <p class="pd-poem-card__excerpt">{{ firstLine(pm.content) }}</p>
              <span class="pd-poem-card__arrow">阅读全文 →</span>
            </router-link>
          </div>
          <p v-else class="pd-empty-poems">暂无诗篇录入，敬请期待。</p>
        </section>
      </main>
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
import { useImage } from '../composables/useImage'
import { getCuratedPresentation } from '../config/curatedMedia'
import { useReveal } from '../composables/useReveal'
import api from '../api'
import { firstLine, pickSignaturePoem } from '../utils/poem'
import ErrorState from '../components/homepage/ErrorState.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import InkPlaceholder from '../components/InkPlaceholder.vue'
import SourceList from '../components/SourceList.vue'

const route = useRoute()
const { resolveFirstImage } = useImage()
const { reveal } = useReveal()

const poet = ref(null)
const poems = ref([])
const dynasty = ref(null)
const sources = ref([])
const errorMsg = ref(null)
const revealRoot = ref(null)
const avatarLoadFailed = ref(false)

const backTo = computed(() => (route.query.from === 'all' ? '/poets?view=all' : '/poets'))

// 头像：单主题下 avatarAnimeUrl 优先（现有配图入库在 anime 字段），avatarUrl 兜底；
// 无图返回 null，模板改用程序化水墨占位 InkPlaceholder（不再是纯色首字方块）
const avatar = computed(() => {
  if (!poet.value) return ''
  const resolved = resolveFirstImage(
    [poet.value.avatarAnimeUrl, poet.value.avatarUrl],
    '文',
  )
  // resolveImage 无图时会回占位 SVG data-uri；此处只想要真实图，占位交给 InkPlaceholder
  return resolved && !resolved.startsWith('data:') ? resolved : ''
})
const avatarPresentation = computed(() => ({
  ...getCuratedPresentation(avatar.value),
  // 诗人素材统一按竖幅展签呈现，避免未收录素材继承 4:3/cover 默认值。
  aspectRatio: '3 / 4',
  objectFit: 'contain',
}))
const onAvatarError = () => {
  avatarLoadFailed.value = true
}

// 派生统计：填充空荡的 hero 右栏（此前只有"传世诗篇"一项）
const lifespan = computed(() => {
  const b = poet.value?.birthYear
  const d = poet.value?.deathYear
  if (b && d && d > b) return d - b
  return null
})
const biographyText = computed(() =>
  poet.value?.biography?.trim() || '生平待考，然其诗已传。',
)
const biographyLead = computed(() => {
  const text = poet.value?.biography?.trim()
  if (!text) return ''
  const sentence = text.match(/^.*?[。！？]/)?.[0] || text
  return sentence.length > 72 ? `${sentence.slice(0, 72)}…` : sentence
})

const signature = computed(() => pickSignaturePoem(poems.value))

const loadDetail = async () => {
  errorMsg.value = null
  sources.value = []
  try {
    const data = await api.get(`/poets/${route.params.id}`)
    poet.value = data.poet
    avatarLoadFailed.value = false
    poems.value = data.poems || []
    dynasty.value = data.dynasty
    sources.value = Array.isArray(data.sources) ? data.sources : []
    await nextTick()
    if (revealRoot.value) reveal(revealRoot.value)
  } catch (err) {
    console.error('加载诗人详情失败:', err)
    errorMsg.value = '加载诗人详情失败，请稍后重试'
  }
}

onMounted(loadDetail)
</script>

<style scoped>
.pd {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* 返回链接：文档流内，不再 fixed（旧版与导航栏 z-index:100 完全重叠） */
.pd-back {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--sp-4) var(--sp-5);
}

.pd-back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--fs-body-sm);
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.pd-back-link:hover {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--accent);
  transform: translateX(-4px);
}

/* 英雄区域：桌面编辑式左图右栏，画像向宣纸底自然淡出 */
.pd-hero {
  position: relative;
  overflow: hidden;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
}

.pd-hero__wash {
  position: absolute;
  inset: 0;
  background: var(--bg-secondary);
  opacity: 0.72;
  pointer-events: none;
}

.pd-hero__content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 58fr) minmax(420px, 42fr);
  align-items: center;
  gap: 0;
  max-width: var(--container-max);
  min-height: 580px;
  margin: 0 auto;
  padding: var(--sp-6) var(--sp-5);
  width: 100%;
}

.pd-hero__art {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
}

.pd-hero__art::after {
  content: '';
  position: absolute;
  z-index: 3;
  inset: 0 calc(var(--sp-9) * -1) 0 28%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--bg-primary) 20%, transparent) 36%,
    color-mix(in srgb, var(--bg-primary) 76%, transparent) 70%,
    var(--bg-primary) 100%
  );
  pointer-events: none;
}

.pd-portrait {
  position: relative;
  z-index: 1;
  width: clamp(360px, 32vw, 440px);
  flex-shrink: 0;
}

.pd-portrait__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 0;
  box-shadow: var(--card-shadow);
  background: var(--bg-secondary);
}

.pd-portrait__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 2;
}

/* 诗人信息 */
.pd-info {
  position: relative;
  z-index: 4;
  padding-left: var(--sp-6);
  color: var(--text-primary);
}

.pd-dynasty-row {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-bottom: var(--sp-4);
}

.pd-dynasty-row::before {
  content: '';
  width: var(--sp-5);
  height: 1px;
  background: var(--accent);
}

.pd-dynasty {
  display: inline-block;
  padding: var(--sp-1) var(--sp-4);
  background: var(--accent-faint);
  border: 1px solid var(--accent-a35);
  border-radius: var(--radius-lg);
  font-size: var(--fs-caption);
  font-weight: 600;
  letter-spacing: 3px;
  margin-bottom: 0;
  color: var(--accent-dark);
}

.pd-dynasty-years {
  color: var(--text-muted);
  font-size: var(--fs-caption);
  letter-spacing: 1px;
}

.pd-name {
  font-family: var(--font-display);
  font-size: var(--fs-h1);
  font-weight: 600;
  letter-spacing: 8px;
  line-height: var(--lh-tight);
  margin-bottom: var(--sp-2);
}

.pd-style {
  font-size: var(--fs-body);
  color: var(--text-muted);
  letter-spacing: 2px;
  margin-bottom: var(--sp-4);
  font-style: italic;
}

.pd-meta {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  font-size: var(--fs-body-sm);
  color: var(--text-secondary);
  margin-bottom: var(--sp-4);
  letter-spacing: 1px;
}

.pd-meta__sep {
  width: 4px;
  height: 4px;
  background: var(--border);
  border-radius: 50%;
}

.pd-lede {
  inline-size: min(var(--measure), 100%);
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
}

.pd-stats {
  display: flex;
  gap: var(--sp-7);
  margin-top: var(--sp-5);
  padding-top: var(--sp-4);
  border-top: 1px solid var(--border);
}

.pd-stat {
  min-width: 96px;
  text-align: left;
}

.pd-stat__num {
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 600;
  display: block;
  line-height: 1;
  margin-bottom: var(--sp-1);
  color: var(--text-primary);
}

.pd-stat__label {
  font-size: var(--fs-caption);
  color: var(--text-muted);
  letter-spacing: 2px;
}

/* 主内容 */
.pd-main {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--sp-9) var(--sp-5) var(--sp-10);
}

/* 代表句：保留为轻量的横向引用链接 */
.pd-signature__link {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: baseline;
  gap: var(--sp-4);
  margin-bottom: var(--sp-9);
  padding: var(--sp-5) 0;
  color: inherit;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  text-decoration: none;
}

.pd-signature__link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.pd-signature__label {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--fs-caption);
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 3px;
  margin: 0;
}

.pd-signature__poem {
  font-family: var(--font-heading);
  font-size: var(--fs-lead);
  font-weight: 600;
  line-height: var(--lh-body);
  color: var(--text-primary);
  letter-spacing: 2px;
}

.pd-signature__title {
  font-style: normal;
  color: var(--text-muted);
  font-size: var(--fs-body-sm);
  letter-spacing: 1px;
  white-space: nowrap;
}

.pd-signature__arrow {
  color: var(--accent);
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.pd-signature__link:hover .pd-signature__arrow,
.pd-signature__link:focus-visible .pd-signature__arrow {
  transform: translateX(var(--sp-1));
}

/* 区块样式 */
.pd-section {
  margin-bottom: var(--sp-9);
}

.pd-section--bio .pd-section__header {
  margin-bottom: 0;
}

.pd-section--bio .pd-section__body {
  display: grid;
  grid-template-columns: minmax(180px, 0.28fr) minmax(0, 1fr);
  gap: var(--sp-7);
  align-items: start;
}

.pd-section__header {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  margin-bottom: var(--sp-6);
}

.pd-section__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--text-on-accent);
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 600;
}

.pd-section__title-group {
  flex: 1;
}

.pd-section__title {
  font-family: var(--font-heading);
  font-size: var(--fs-h2);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 4px;
  margin-bottom: var(--sp-1);
}

.pd-section__subtitle {
  font-size: var(--fs-caption);
  color: var(--text-muted);
  letter-spacing: 1px;
}

/* 生平区块 */
.pd-bio {
  position: relative;
  padding: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
  font-size: var(--fs-body);
  line-height: var(--lh-loose);
  color: var(--text-secondary);
  text-indent: 2em;
  letter-spacing: 0.5px;
  max-width: var(--measure-wide);
}

/* 诗篇网格 */
.pd-poems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--sp-5);
  margin-top: var(--sp-6);
}

.pd-empty-poems {
  margin-top: var(--sp-6);
  padding: var(--sp-7);
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  letter-spacing: 2px;
  background: var(--card-bg);
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
}

.pd-poem-card {
  position: relative;
  padding: var(--sp-5);
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.pd-poem-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.pd-poem-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--card-shadow-hover);
  border-color: var(--accent);
}

.pd-poem-card:hover::before {
  transform: scaleX(1);
}

.pd-poem-card__num {
  position: absolute;
  top: var(--sp-4);
  right: var(--sp-4);
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 600;
  color: var(--accent);
  opacity: 0.08;
  line-height: 1;
}

.pd-poem-card__title {
  font-family: var(--font-heading);
  font-size: var(--fs-body);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--sp-3);
  letter-spacing: 2px;
  position: relative;
  z-index: 1;
}

.pd-poem-card__excerpt {
  font-size: var(--fs-body-sm);
  line-height: var(--lh-body);
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
}

.pd-poem-card__arrow {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  margin-top: var(--sp-4);
  font-size: var(--fs-caption);
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 1px;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.pd-poem-card:hover .pd-poem-card__arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 响应式 */
@media (max-width: 1024px) {
  .pd-hero__content {
    grid-template-columns: 1fr;
    min-height: auto;
    text-align: center;
    gap: var(--sp-6);
    padding: var(--sp-7) var(--sp-5);
  }

  .pd-hero__art {
    min-height: auto;
    justify-content: center;
  }

  .pd-hero__art::after {
    inset: 45% 0 calc(var(--sp-7) * -1);
    background: linear-gradient(180deg, transparent 0%, var(--bg-primary) 100%);
  }

  .pd-portrait {
    width: clamp(240px, 45vw, 360px);
  }

  .pd-info {
    padding-left: 0;
  }

  .pd-dynasty-row,
  .pd-meta,
  .pd-stats {
    justify-content: center;
  }

  .pd-lede {
    margin: 0 auto;
  }

  .pd-section--bio .pd-section__body {
    grid-template-columns: 1fr;
    gap: var(--sp-5);
  }

  .pd-signature__link {
    grid-template-columns: 1fr;
    text-align: left;
  }

  .pd-signature__title {
    white-space: normal;
  }
}

@media (max-width: 768px) {
  .pd-hero__content {
    padding: var(--sp-6) var(--sp-4);
  }

  .pd-portrait {
    width: 160px;
  }

  .pd-stats {
    flex-wrap: wrap;
    gap: var(--sp-4);
  }

  .pd-stat {
    flex: 1;
    min-width: 100px;
  }

  .pd-main {
    padding: var(--sp-6) var(--sp-4) var(--sp-9);
  }

  .pd-poems-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pd-back-link,
  .pd-poem-card,
  .pd-poem-card::before,
  .pd-poem-card__arrow,
  .pd-signature__arrow {
    transition-duration: 0.01ms;
  }
}
</style>
