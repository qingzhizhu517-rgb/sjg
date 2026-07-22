<template>
  <div class="pd" v-if="poet">
    <!-- 返回 -->
    <div class="pd-back">
      <router-link :to="backTo" class="pd-back-link">← 返回名士</router-link>
    </div>

    <div ref="revealRoot" class="pd-content">
      <!-- 详情头：左肖像 + 右印章/名/元信息/代表作 -->
      <header class="pd-head" data-reveal>
        <div class="pd-portrait">
          <!-- 印章常驻底层、头像在上层；头像 URL 404 时 onAvatarError 隐藏 img，露出印章，避免空框 -->
          <span class="pd-portrait-stamp">{{ poet.name ? poet.name.charAt(0) : '文' }}</span>
          <img v-if="avatar" :src="avatar" :alt="poet.name" class="pd-portrait-img" @error="onAvatarError" />
        </div>

        <div class="pd-head-main">
          <div class="pd-head-top">
            <span class="pd-seal" aria-hidden="true">{{ poet.name ? poet.name.charAt(0) : '文' }}</span>
            <span class="pd-dyn" v-if="dynasty">{{ dynasty.name }}</span>
            <span class="pd-count">{{ poems.length }} 篇传世</span>
          </div>
          <h1 class="pd-name">{{ poet.name }}</h1>
          <div class="pd-meta" v-if="poet.birthYear || poet.birthplace">
            <span v-if="poet.birthYear">{{ poet.birthYear }} 至 {{ poet.deathYear || '？' }}</span>
            <span v-if="poet.birthYear && poet.birthplace" class="pd-meta-sep">·</span>
            <span v-if="poet.birthplace">籍贯 {{ poet.birthplace }}</span>
          </div>
          <blockquote v-if="signature" class="pd-sig">
            <p class="pd-sig-text">「{{ signature.firstLine }}」</p>
            <cite class="pd-sig-cite">—— 《{{ signature.title }}》</cite>
          </blockquote>
        </div>
      </header>

      <!-- 生平 -->
      <section v-if="poet.biography" class="pd-section" data-reveal>
        <SectionHeading title="生平简介" />
        <div class="pd-bio">{{ poet.biography }}</div>
      </section>

      <!-- 传世诗篇 -->
      <section v-if="poems.length" class="pd-section" data-reveal>
        <SectionHeading :title="`传世诗篇 · ${poems.length} 首`" />
        <div class="pd-poems">
          <router-link
            v-for="pm in poems"
            :key="pm.id"
            :to="`/poems/${pm.id}`"
            class="pd-poem hover-lift"
          >
            <div class="pd-poem-head">
              <span class="pd-poem-title">《{{ pm.title }}》</span>
              <span class="pd-poem-arrow">→</span>
            </div>
            <p class="pd-poem-line">{{ firstLine(pm.content) }}</p>
            <div v-if="parseTags(pm.sentimentTags).length" class="pd-poem-tags">
              <span
                v-for="t in parseTags(pm.sentimentTags).slice(0, 5)"
                :key="t"
                class="pd-poem-tag"
              >{{ t }}</span>
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </div>

  <div v-else-if="errorMsg" class="pd-state">
    <ErrorState :message="errorMsg" @retry="loadDetail" />
    <router-link :to="backTo" class="pd-back-link" style="margin-top: 16px;">← 返回名士</router-link>
  </div>

  <div v-else class="pd-state">
    <SkeletonBlock height="220px" />
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
import SectionHeading from '../components/homepage/SectionHeading.vue'
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
const backTo = computed(() => (route.query.from === 'all' ? '/poets/all' : '/poets'))

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

/* 详情头 */
.pd-head {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
  align-items: center;
  padding-bottom: 36px;
  margin-bottom: 48px;
  border-bottom: 1px solid var(--border);
  position: relative;
}
.pd-head::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 96px;
  height: 2px;
  background: var(--accent);
}
.pd-portrait {
  width: 200px;
  height: 260px;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  position: relative;
}
.theme-inkwash .pd-portrait {
  background: #2a2520;
}
.theme-real .pd-portrait {
  border: 6px solid #2b1d12;
}
.pd-portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 2;
}
.pd-portrait-stamp {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 88px;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, #9e2b25, #6b2820);
}
.theme-real .pd-portrait-stamp {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
}
.pd-head-main {
  text-align: left;
}
.pd-head-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.pd-seal {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #9e2b25;
  color: #fff;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 900;
  border-radius: 3px;
  transform: rotate(-3deg);
  flex-shrink: 0;
}
.theme-real .pd-seal {
  background: #b23a2b;
}
.pd-dyn {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 3px 12px;
  border-radius: 2px;
  letter-spacing: 2px;
}
.pd-count {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 1px;
  font-weight: 600;
}
.pd-name {
  font-family: var(--font-display);
  font-size: clamp(44px, 6vw, 68px);
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 8px;
  line-height: 1.05;
  margin: 0 0 12px 0;
}
.pd-meta {
  font-size: 13px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  margin: 0 0 20px 0;
}
.pd-meta-sep {
  margin: 0 8px;
  color: var(--border);
}
.pd-sig {
  margin: 0;
  padding: 0 0 0 16px;
  border-left: 2px solid var(--accent);
}
.pd-sig-text {
  font-family: var(--font-heading);
  font-size: clamp(17px, 1.8vw, 21px);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.8;
  letter-spacing: 2px;
  margin: 0 0 6px 0;
}
.pd-sig-cite {
  font-size: 12px;
  font-style: italic;
  color: var(--text-muted);
  letter-spacing: 1px;
}

/* sections */
.pd-section {
  margin-bottom: 56px;
  text-align: left;
}
.pd-bio {
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

/* 诗篇列表 */
.pd-poems {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.pd-poem {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 22px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.pd-poem:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 10px 24px color-mix(in srgb, var(--text-primary) 0.1%, transparent);
}
.pd-poem-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pd-poem-title {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1px;
}
.pd-poem-arrow {
  font-size: 14px;
  color: var(--text-muted);
  transition: transform 0.25s, color 0.25s;
}
.pd-poem:hover .pd-poem-arrow {
  transform: translateX(4px);
  color: var(--accent);
}
.pd-poem-line {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  letter-spacing: 1px;
  margin: 0;
}
.pd-poem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}
.pd-poem-tag {
  font-size: 10.5px;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--accent) 0.07%, transparent);
  border: 1px solid var(--border-light);
  padding: 2px 8px;
  border-radius: 100px;
  letter-spacing: 1px;
}
.theme-inkwash .pd-poem-tag {
  background: color-mix(in srgb, var(--accent) 0.06%, transparent);
}

.pd-state {
  max-width: 960px;
  margin: 0 auto;
  padding: 64px 48px;
  text-align: center;
}

@media (max-width: 900px) {
  .pd { padding: 24px 32px 80px; }
  .pd-head {
    grid-template-columns: 1fr;
    gap: 28px;
    text-align: left;
  }
  .pd-portrait { width: 160px; height: 210px; }
  .pd-portrait-stamp { font-size: 72px; }
  .pd-poems { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .pd { padding: 20px 16px 64px; }
  .pd-section { margin-bottom: 40px; }
  .pd-bio { padding: 20px; }
  .pd-name { letter-spacing: 4px; }
}
</style>
