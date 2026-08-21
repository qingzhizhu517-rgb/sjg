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
        <div class="pd-hero__bg"></div>
        <div class="pd-hero__content">
          <!-- 左侧头像 -->
          <div class="pd-portrait">
            <div class="pd-portrait__frame">
              <img v-if="avatar" :src="avatar" :alt="poet.name" class="pd-portrait__img" decoding="async" @error="onAvatarError" />
              <InkPlaceholder v-else :seed="poet.id || poet.name" kind="文" />
            </div>
            <div class="pd-portrait__seal" v-if="dynasty">{{ dynasty.name }}</div>
          </div>

          <!-- 右侧信息 -->
          <div class="pd-info">
            <span class="pd-dynasty" v-if="dynasty">{{ dynasty.name }}</span>
            <h1 class="pd-name">{{ poet.name }}</h1>
            <p class="pd-style" v-if="poet.style">{{ poet.style }}</p>
            <div class="pd-meta" v-if="poet.birthYear || poet.birthplace">
              <span v-if="poet.birthYear">{{ poet.birthYear }}-{{ poet.deathYear || '？' }}</span>
              <span v-if="poet.birthYear && poet.birthplace" class="pd-meta__sep">·</span>
              <span v-if="poet.birthplace">{{ poet.birthplace }}</span>
            </div>

            <div class="pd-stats">
              <div class="pd-stat">
                <span class="pd-stat__num">{{ poems.length }}</span>
                <span class="pd-stat__label">传世诗篇</span>
              </div>
              <div class="pd-stat" v-if="lifespan">
                <span class="pd-stat__num">{{ lifespan }}</span>
                <span class="pd-stat__label">春秋享年</span>
              </div>
              <div class="pd-stat" v-if="dynastySpan">
                <span class="pd-stat__num">{{ dynastySpan }}</span>
                <span class="pd-stat__label">{{ dynasty.name }}国祚(年)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主内容 -->
      <main class="pd-main">
        <!-- 代表作 -->
        <section v-if="signature" class="pd-signature">
          <div class="pd-signature__label">
            <span>✦</span>
            代表作
          </div>
          <p class="pd-signature__poem">「{{ signature.firstLine }}」</p>
          <cite class="pd-signature__title">——《{{ signature.title }}》</cite>
        </section>

        <!-- 生平 -->
        <section class="pd-section" data-reveal>
          <div class="pd-section__header">
            <div class="pd-section__icon">传</div>
            <div class="pd-section__title-group">
              <h2 class="pd-section__title">生平</h2>
              <p class="pd-section__subtitle">{{ dynasty ? `${dynasty.name} · ${poet.name}` : poet.name }}</p>
            </div>
          </div>
          <div class="pd-bio">{{ poet.biography || '生平待考，然其诗已传。' }}</div>
        </section>

        <!-- 传世诗篇 -->
        <section class="pd-section" data-reveal>
          <div class="pd-section__header">
            <div class="pd-section__icon">诗</div>
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
import { useReveal } from '../composables/useReveal'
import api from '../api'
import { firstLine, pickSignaturePoem } from '../utils/poem'
import ErrorState from '../components/homepage/ErrorState.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import InkPlaceholder from '../components/InkPlaceholder.vue'

const route = useRoute()
const { resolveImage } = useImage()
const { reveal } = useReveal()

const poet = ref(null)
const poems = ref([])
const dynasty = ref(null)
const errorMsg = ref(null)
const revealRoot = ref(null)

const backTo = computed(() => (route.query.from === 'all' ? '/poets?view=all' : '/poets'))

// 头像：单主题下 avatarAnimeUrl 优先（现有配图入库在 anime 字段），avatarUrl 兜底；
// 无图返回 null，模板改用程序化水墨占位 InkPlaceholder（不再是纯色首字方块）
const avatar = computed(() => {
  if (!poet.value) return ''
  const raw = poet.value.avatarAnimeUrl || poet.value.avatarUrl
  if (!raw) return ''
  const resolved = resolveImage(raw, '文')
  // resolveImage 无图时会回占位 SVG data-uri；此处只想要真实图，占位交给 InkPlaceholder
  return resolved && !resolved.startsWith('data:') ? resolved : ''
})
const onAvatarError = (e) => {
  e.target.style.display = 'none'
}

// 派生统计：填充空荡的 hero 右栏（此前只有"传世诗篇"一项）
const lifespan = computed(() => {
  const b = poet.value?.birthYear
  const d = poet.value?.deathYear
  if (b && d && d > b) return d - b
  return null
})
const dynastySpan = computed(() => {
  const s = dynasty.value?.startYear
  const e = dynasty.value?.endYear
  if (s != null && e != null && e > s) return e - s
  return null
})

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

/* 英雄区域：宣纸底 + 朱砂细线框（旧版深棕渐变与宣纸主题脱节） */
.pd-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--bg-secondary);
  border-bottom: 2px solid var(--accent);
}

.pd-hero__bg {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.pd-hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: var(--sp-8);
  max-width: var(--container-max);
  padding: var(--sp-8) var(--sp-5);
  width: 100%;
}

/* 头像区域 */
.pd-portrait {
  position: relative;
  flex-shrink: 0;
}

.pd-portrait__frame {
  position: relative;
  width: 240px;
  height: 320px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--card-shadow-hover);
  border: 2px solid var(--border);
}

.pd-portrait__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
}

.pd-portrait__seal {
  position: absolute;
  bottom: -16px;
  right: -16px;
  width: 72px;
  height: 72px;
  background: var(--accent);
  color: var(--text-on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  border-radius: var(--radius-md);
  transform: rotate(-5deg);
  box-shadow: var(--card-shadow);
  border: 2px solid var(--accent-light);
  letter-spacing: 2px;
}

/* 诗人信息 */
.pd-info {
  flex: 1;
  color: var(--text-primary);
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
  margin-bottom: var(--sp-4);
  color: var(--accent-dark);
}

.pd-name {
  font-family: var(--font-display);
  font-size: clamp(40px, 5vw, 64px);
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
  margin-bottom: var(--sp-5);
  letter-spacing: 1px;
}

.pd-meta__sep {
  width: 4px;
  height: 4px;
  background: var(--border);
  border-radius: 50%;
}

.pd-stats {
  display: flex;
  gap: var(--sp-5);
  margin-top: var(--sp-5);
}

.pd-stat {
  text-align: center;
  padding: var(--sp-3) var(--sp-5);
  background: var(--card-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.pd-stat__num {
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 600;
  display: block;
  line-height: 1;
  margin-bottom: var(--sp-1);
  color: var(--accent);
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

/* 代表作区块 */
.pd-signature {
  position: relative;
  margin-bottom: var(--sp-9);
  padding: var(--sp-7);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
  overflow: hidden;
}

.pd-signature::before {
  content: '诗';
  position: absolute;
  top: -20px;
  right: 20px;
  font-family: var(--font-display);
  font-size: 200px;
  font-weight: 600;
  color: var(--accent);
  opacity: 0.05;
  line-height: 1;
}

.pd-signature__label {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--fs-caption);
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 3px;
  margin-bottom: var(--sp-5);
  padding: var(--sp-1) var(--sp-3);
  background: var(--accent-faint);
  border-radius: var(--radius-lg);
}

.pd-signature__poem {
  font-family: var(--font-heading);
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 600;
  line-height: 2;
  color: var(--text-primary);
  letter-spacing: 4px;
  margin-bottom: var(--sp-5);
  position: relative;
  z-index: 1;
}

.pd-signature__title {
  font-style: italic;
  color: var(--text-muted);
  font-size: var(--fs-body-sm);
  letter-spacing: 2px;
  position: relative;
  z-index: 1;
}

/* 区块样式 */
.pd-section {
  margin-bottom: var(--sp-9);
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
  padding: var(--sp-6) var(--sp-7);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  font-size: var(--fs-body);
  line-height: var(--lh-loose);
  color: var(--text-secondary);
  text-indent: 2em;
  letter-spacing: 0.5px;
  max-width: var(--measure);
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
    flex-direction: column;
    text-align: center;
    gap: var(--sp-6);
    padding: var(--sp-7) var(--sp-5);
  }

  .pd-portrait__frame {
    width: 200px;
    height: 270px;
  }

  .pd-meta {
    justify-content: center;
  }

  .pd-stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .pd-hero__content {
    padding: var(--sp-6) var(--sp-4);
  }

  .pd-portrait__frame {
    width: 160px;
    height: 220px;
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

  .pd-signature,
  .pd-bio {
    padding: var(--sp-5);
  }

  .pd-poems-grid {
    grid-template-columns: 1fr;
  }
}
</style>
