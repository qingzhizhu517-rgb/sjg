<template>
  <div class="pd pd--inkwash folio-page">
    <template v-if="poet">
      <div class="pd-back">
        <router-link :to="backTo" class="pd-back-link folio-back">← 返回名士</router-link>
        <span v-if="previewMode" class="pd-preview-note">水墨设计预览 · 人物样本</span>
      </div>

      <div class="pd-folio">
        <aside class="pd-hero__art" :class="{ 'pd-hero__art--scenery': !avatar || avatarLoadFailed }" :aria-label="`${poet.name}人物画像`">
          <div class="pd-portrait" :class="{ 'pd-portrait--bust': smallPortrait }">
            <img
              v-if="avatar && !avatarLoadFailed"
              :src="avatar"
              :alt="`${poet.name}水墨画像`"
              class="pd-portrait__img"
              :style="{
                objectFit: avatarPresentation.objectFit,
                objectPosition: avatarPresentation.objectPosition,
              }"
              decoding="async"
              fetchpriority="high"
              @error="onAvatarError"
            />
            <!-- 无画像：淡墨山水垫底，避免整栏灰色晕染块 -->
            <img v-else src="/media/inkwash/atlas/river-landscape.webp" alt="" aria-hidden="true" class="pd-portrait__scenery" decoding="async" />
          </div>
          <div v-if="portraitQuote" class="pd-art-inscription">
            <div class="pd-art-inscription__verses" :aria-label="portraitQuote">
              <p v-for="(line, index) in portraitQuoteLines" :key="index">{{ line }}</p>
            </div>
            <span>{{ poet.name }}<i aria-hidden="true">·</i>{{ portraitQuoteTitle }}</span>
          </div>
          <span class="pd-art-caption">山河有迹 · 诗心长存</span>
        </aside>

        <main class="pd-main">
          <header class="pd-heading">
            <div class="pd-name-line">
              <h1 class="pd-name">{{ poet.name }}</h1>
              <span v-if="dynastyLabel" class="pd-era-seal">{{ dynastyLabel }}</span>
            </div>
            <p v-if="poet.style" class="pd-style">{{ poet.style }}</p>
            <div class="pd-heading-rule" aria-hidden="true"></div>
            <dl class="pd-meta">
              <div><dt>字</dt><dd>{{ courtesyName || '待考' }}</dd></div>
              <div><dt>号</dt><dd>{{ artName || '待考' }}</dd></div>
              <div><dt>生卒年</dt><dd>{{ lifeYears || '待考' }}</dd></div>
              <div><dt>籍贯</dt><dd>{{ birthplace || '待考' }}<svg v-if="birthplace" class="pd-location-mark" aria-hidden="true" viewBox="0 0 16 20" fill="none"><path d="M8 18S2 12 2 7a6 6 0 1 1 12 0c0 5-6 11-6 11Z" stroke="currentColor"/><circle cx="8" cy="7" r="2" stroke="currentColor"/></svg></dd></div>
            </dl>
          </header>

          <section class="pd-section folio-section pd-section--bio" aria-labelledby="poet-biography">
            <div class="pd-section-heading"><h2 class="folio-section-title" id="poet-biography">诗人简介</h2><span aria-hidden="true">◇</span></div>
            <div class="pd-bio folio-prose">
              <p v-for="(paragraph, index) in biographyParagraphs" :key="index">{{ paragraph }}</p>
            </div>
          </section>

          <section v-if="milestones.length" class="pd-section folio-section pd-section--life" aria-labelledby="poet-life">
            <div class="pd-section-heading"><h2 class="folio-section-title" id="poet-life">生平经历</h2><span aria-hidden="true">◇</span></div>
            <ol class="pd-timeline" :style="{ '--milestone-count': Math.min(milestones.length, 5) }">
              <li v-for="(milestone, index) in milestones" :key="`${milestone.year}-${index}`" class="pd-milestone">
                <div class="pd-milestone__painting" aria-hidden="true">
                  <img :src="milestone.image || milestoneImages[index % milestoneImages.length]" alt="" loading="lazy" decoding="async" />
                </div>
                <h3>{{ milestone.heading || milestone.title || milestone.year }}</h3>
                <p class="pd-milestone__date" v-if="milestone.year && milestone.year !== (milestone.heading || milestone.title)">{{ milestone.year }}</p>
                <p class="pd-milestone__desc">{{ milestone.desc || milestone.description }}</p>
              </li>
            </ol>
          </section>

          <section class="pd-section folio-section pd-section--works" aria-labelledby="poet-works">
            <div class="pd-section-heading pd-section-heading--works">
              <h2 class="folio-section-title" id="poet-works">代表作品</h2>
              <button v-if="poems.length > 4" class="pd-all-works folio-button folio-button--quiet" @click="showAllPoems = !showAllPoems" :aria-expanded="showAllPoems">
                {{ showAllPoems ? '收起作品' : `全部 ${poems.length} 首` }} <span aria-hidden="true">{{ showAllPoems ? '−' : '→' }}</span>
              </button>
            </div>
            <div v-if="poems.length" class="pd-poems-grid folio-grid">
              <router-link
                v-for="pm in visiblePoems"
                :key="pm.id"
                :to="atlasLink(`/poems/${pm.id}`, route)"
                class="pd-poem-card"
              >
                <h3>《{{ pm.title }}》</h3>
                <p>{{ firstLine(pm.content) }}</p>
                <span class="pd-poem-card__arrow" aria-hidden="true">→</span>
              </router-link>
            </div>
            <p v-else class="pd-empty-poems">暂无诗篇录入，敬请期待。</p>
          </section>

          <section v-if="historicalImpact" class="pd-section folio-section pd-section--impact" aria-labelledby="poet-impact">
            <div class="pd-section-heading"><h2 class="folio-section-title" id="poet-impact">历史影响</h2><span aria-hidden="true">◇</span></div>
            <p class="folio-prose">{{ historicalImpact }}</p>
            <img class="pd-impact-painting" src="/media/inkwash/atlas/mountain-vignette.webp" alt="" aria-hidden="true" loading="lazy" />
          </section>

          <router-link
            v-if="signature && !historicalImpact"
            :to="atlasLink(`/poems/${signature.id}`, route)"
            class="pd-signature__link"
          >
            <span class="pd-signature__label">代表句</span>
            <span class="pd-signature__poem">{{ signature.firstLine }}</span>
            <cite>——《{{ signature.title }}》</cite>
            <span aria-hidden="true">→</span>
          </router-link>

          <SourceList :sources="sources" class="pd-sources" />
          <div class="folio-detail-actions"><p>循着诗文，继续你的阅读。</p><router-link :to="backTo" class="folio-button">返回名士列表 →</router-link></div>
        </main>
      </div>
    </template>

    <div v-else-if="errorMsg" class="pd-state">
      <ErrorState :message="errorMsg" @retry="loadDetail" />
      <router-link :to="backTo" class="pd-back-link folio-back">← 返回名士</router-link>
    </div>
    <div v-else class="pd-state" role="status" aria-label="正在载入人物资料">
      <SkeletonBlock height="360px" />
      <span class="sr-only">正在载入人物资料</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useImage } from '../composables/useImage'
import { getCuratedPresentation } from '../config/curatedMedia'
import { isAtlasPreview, atlasLink, previewPoets, previewDynasties } from '../config/atlasPreview'
import { mockPoets } from '../config/mockDetailData'
import api from '../api'
import { safeReturnPath } from '../config/siteNavigation'
import { firstLine, pickSignaturePoem } from '../utils/poem'
import ErrorState from '../components/homepage/ErrorState.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import SourceList from '../components/SourceList.vue'

const route = useRoute()
const { resolveFirstImage } = useImage()
const poet = ref(null)
const poems = ref([])
const dynasty = ref(null)
const sources = ref([])
const errorMsg = ref(null)
const avatarLoadFailed = ref(false)
const showAllPoems = ref(false)
let loadSequence = 0

const previewMode = computed(() => isAtlasPreview(route))
const backTo = computed(() => atlasLink(safeReturnPath(route.query.returnTo, route.query.from === 'all' ? '/poets?view=all' : '/poets'), route))
// 设计样本的补充资料只在显式预览中读取。公开页面始终使用 API 的内容与来源。
const profile = computed(() => previewMode.value ? (mockPoets[poet.value?.name] || {}) : (poet.value || {}))
const dynastyLabel = computed(() => dynasty.value?.name || poet.value?.dynastyName || '')
const courtesyName = computed(() => profile.value.zi || poet.value?.courtesyName || poet.value?.biography?.match(/字([^，。；、\s]{1,8})/)?.[1] || '')
const artName = computed(() => profile.value.hao || poet.value?.artName || poet.value?.biography?.match(/(?:自号|号)([^，。；、\s]{1,10})/)?.[1] || '')
const lifeYears = computed(() => {
  if (poet.value?.birthYear != null) return `${poet.value.birthYear}年 — ${poet.value.deathYear ?? '？'}年`
  return profile.value.years || ''
})
const birthplace = computed(() => poet.value?.birthplace || profile.value.place || '')
const biographyParagraphs = computed(() => {
  const text = poet.value?.biography?.trim()
  if (!text) return ['生平待考，然其诗已传。']
  return text.split(/\n+/).filter(Boolean)
})
const historicalImpact = computed(() => profile.value.impact || poet.value?.historicalImpact || '')
const signature = computed(() => pickSignaturePoem(poems.value))
const visiblePoems = computed(() => showAllPoems.value ? poems.value : poems.value.slice(0, 4))
const portraitQuote = computed(() => profile.value.verticalPoetry || signature.value?.firstLine || '')
const portraitQuoteLines = computed(() => portraitQuote.value.split(/[，,。.!！?？；;\n]+/).map(line => line.trim()).filter(Boolean).slice(0, 2))
const portraitQuoteTitle = computed(() => {
  if (previewMode.value && poet.value?.name === '杜甫') return '望岳'
  return signature.value?.title || '诗意'
})

const milestoneImages = [
  '/media/inkwash/atlas/spot-daimiao.webp',
  '/media/inkwash/atlas/spot-taishan.webp',
  '/media/inkwash/atlas/spot-hongmen.webp',
  '/media/inkwash/atlas/spot-zhongtianmen.webp',
  '/media/inkwash/atlas/spot-yuhuangding.webp',
]
const milestones = computed(() => {
  const entries = profile.value.milestones || poet.value?.lifeEvents
  if (Array.isArray(entries) && entries.length) return entries
  const result = []
  if (poet.value?.birthYear) result.push({ year: `${poet.value.birthYear}年`, title: '诞生', desc: poet.value.birthplace || '' })
  if (poet.value?.deathYear) result.push({ year: `${poet.value.deathYear}年`, title: '辞世', desc: '' })
  return result
})
const avatar = computed(() => {
  if (!poet.value) return ''
  const atlasPortrait = poet.value.name === '杜甫' ? '/media/inkwash/atlas/dufu-portrait.webp' : ''
  const resolved = resolveFirstImage([atlasPortrait, poet.value.avatarAnimeUrl, poet.value.avatarUrl], '文')
  return resolved && !resolved.startsWith('data:') ? resolved : ''
})
const avatarPresentation = computed(() => ({
  ...getCuratedPresentation(avatar.value),
  objectFit: 'contain',
  objectPosition: 'center top',
}))
const smallPortrait = computed(() => /\/atlas\/poet-/.test(avatar.value))
const onAvatarError = () => { avatarLoadFailed.value = true }

const loadDetail = async () => {
  const sequence = ++loadSequence
  errorMsg.value = null
  poet.value = null
  poems.value = []
  dynasty.value = null
  sources.value = []
  showAllPoems.value = false
  avatarLoadFailed.value = false
  if (previewMode.value) {
    const preview = previewPoets.find(item => String(item.id) === String(route.params.id))
    if (!preview) {
      errorMsg.value = '该人物尚未纳入本次设计预览。请返回名士浏览已收录人物。'
      return
    }
    poet.value = preview
    poems.value = preview.poems || []
    dynasty.value = previewDynasties.find(item => item.id === preview.dynastyId) || null
    return
  }
  try {
    const data = await api.get(`/poets/${route.params.id}`)
    if (sequence !== loadSequence) return
    if (!data?.poet) throw new Error('人物资料不存在')
    poet.value = data.poet
    poems.value = data.poems || []
    dynasty.value = data.dynasty
    sources.value = Array.isArray(data.sources) ? data.sources : []
  } catch (err) {
    if (sequence !== loadSequence) return
    console.error('加载诗人详情失败:', err)
    errorMsg.value = '加载诗人详情失败，请稍后重试'
  }
}
watch(() => [route.params.id, route.query.preview], loadDetail, { immediate: true })
</script>

<style scoped>
.pd {
  --pd-ink: #382d24;
  --pd-muted: #80776a;
  --pd-rule: rgba(111, 96, 75, 0.16);
  --pd-gold: #987744;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--pd-ink);
}
.pd-back {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 14px 3.6% 0;
}
.pd-back-link { display: inline-flex; padding: 5px 0; color: var(--pd-muted); font-size: 12px; letter-spacing: .09em; }
.pd-back-link:hover { color: var(--pd-ink); }
.pd-preview-note { color: var(--pd-muted); font-size: 11px; letter-spacing: .08em; }
.pd-folio { display: grid; grid-template-columns: minmax(0, 41fr) minmax(0, 59fr); max-width: 1600px; margin: 0 auto; }
.pd-hero__art { position: relative; align-self: stretch; min-height: 990px; isolation: isolate; overflow: hidden; }
.pd-hero__art::after { content: ''; position: absolute; z-index: 1; inset: 0; background: linear-gradient(90deg, transparent 87%, var(--bg-primary) 100%), linear-gradient(0deg, var(--bg-primary), transparent 12%, transparent 96%, var(--bg-primary)); pointer-events: none; }
.pd-portrait { position: absolute; inset: 0; }
.pd-portrait--bust { inset: 18% 7% auto auto; width: 66%; height: min(560px, 65%); }
.pd-portrait__img { height: 100%; width: 100%; object-fit: contain; object-position: center top; mix-blend-mode: multiply; }
.pd-portrait__scenery { position: absolute; left: 0; right: 0; bottom: 8%; width: 100%; height: 46%; object-fit: cover; object-position: center bottom; opacity: .5; mix-blend-mode: multiply; mask-image: linear-gradient(to bottom, transparent, #000 30%, #000 80%, transparent); }
.pd-hero__art--scenery { min-height: 760px; }
.pd-art-inscription { position: absolute; z-index: 2; top: 6%; left: 8%; display: flex; flex-direction: row-reverse; align-items: flex-start; gap: 17px; max-height: 350px; }
.pd-art-inscription__verses { display: flex; flex-direction: row-reverse; gap: 12px; }
.pd-art-inscription__verses > p { writing-mode: vertical-rl; white-space: nowrap; font-family: var(--font-display); font-size: clamp(24px, 2.45vw, 36px); line-height: 1.4; letter-spacing: .21em; }
.pd-art-inscription > span { writing-mode: vertical-rl; padding-top: 158px; font-size: 13px; line-height: 1.7; letter-spacing: .18em; }
.pd-art-inscription i { margin: 7px 0; font-style: normal; }
.pd-art-caption { position: absolute; z-index: 2; bottom: 25px; left: 9%; font-size: 11px; letter-spacing: .35em; color: var(--pd-muted); }
.pd-main { position: relative; min-width: 0; padding: 18px 5.8% 38px 6.5%; }
.pd-heading { margin-bottom: 26px; }
.pd-name-line { display: flex; gap: 17px; align-items: center; }
.pd-name { font-family: var(--font-heading); font-size: clamp(48px, 4.6vw, 70px); font-weight: 600; line-height: 1.3; letter-spacing: .05em; }
.pd-era-seal { display: inline-flex; writing-mode: vertical-rl; padding: 5px 2px; margin-top: 15px; color: #f7f0e7; background: #b96359; border: 1px solid #c78277; outline: 1px solid #b96359; outline-offset: 2px; font-size: 10px; line-height: 1.15; letter-spacing: .06em; }
.pd-style { margin-top: 5px; font-size: clamp(15px, 1.65vw, 23px); letter-spacing: .06em; line-height: 1.7; }
.pd-heading-rule { height: 1px; position: relative; background: var(--pd-rule); margin: 14px 0 20px; }
.pd-heading-rule::before { content: ''; position: absolute; width: 34px; height: 2px; top: 0; left: 0; background: var(--pd-gold); }
.pd-meta { display: grid; grid-template-columns: .75fr .95fr 1.15fr 1.45fr; gap: 0; }
.pd-meta > div { padding: 0 18px; border-right: 1px solid var(--pd-rule); min-width: 0; }
.pd-meta > div:first-child { padding-left: 0; }
.pd-meta > div:last-child { padding-right: 0; border: none; }
.pd-meta dt { color: var(--pd-gold); font-size: 13px; margin-bottom: 6px; }
.pd-meta dd { font-size: 14px; line-height: 1.8; overflow-wrap: anywhere; }
.pd-location-mark { display: inline-block; width: 12px; height: 16px; margin-left: 7px; vertical-align: -3px; color: #a29484; }
.pd-section { position: relative; margin-top: 26px; }
.pd-section-heading { display: flex; align-items: center; gap: 6px; position: relative; padding-bottom: 7px; margin-bottom: 13px; border-bottom: 1px solid var(--pd-rule); }
.pd-section-heading h2 { font-size: 21px; font-family: var(--font-heading); font-weight: 600; line-height: 1.5; letter-spacing: .06em; }
.pd-section-heading > span { font-size: 14px; color: #b29b7d; }
.pd-bio { max-width: var(--measure-wide); font-size: 14px; line-height: 2.05; letter-spacing: .035em; }
.pd-bio p + p { margin-top: 1px; }
.pd-timeline { display: grid; grid-template-columns: repeat(var(--milestone-count, 5), minmax(0, 1fr)); list-style: none; gap: 13px; margin: 0; padding: 4px 0 0; }
.pd-milestone { text-align: center; min-width: 0; }
.pd-milestone__painting { position: relative; width: 78px; height: 78px; margin: 0 auto 12px; border: 1px solid rgba(139, 123, 102, .26); border-radius: 50%; padding: 4px; }
.pd-milestone__painting::after { content: ''; position: absolute; inset: -5px 4px 7px -4px; border-radius: 50%; border: 1px solid rgba(139, 123, 102, .1); transform: rotate(-14deg); }
.pd-milestone__painting img { height: 100%; width: 100%; object-fit: cover; mix-blend-mode: multiply; border-radius: 50%; opacity: .8; filter: saturate(.45); }
.pd-milestone h3 { font-size: 15px; font-weight: 600; line-height: 1.6; letter-spacing: .015em; }
.pd-milestone__date { font-size: 11px; color: var(--pd-muted); margin-top: 3px; }
.pd-milestone__desc { margin-top: 5px; font-size: 12px; line-height: 1.8; color: #685f53; }
.pd-section--works { margin-top: 26px; }
.pd-section-heading--works { justify-content: space-between; }
.pd-all-works { padding: 5px 0 5px 12px; color: var(--pd-muted); font-size: 11px; letter-spacing: .05em; }
.pd-all-works:hover { color: var(--pd-ink); }
.pd-poems-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.pd-poem-card { position: relative; min-width: 0; min-height: 112px; padding: 16px 13px 20px; background: rgba(251, 249, 244, .38); border: 1px solid var(--pd-rule); box-shadow: 3px 3px 0 rgba(130, 111, 82, .025); transition: border-color .2s, background-color .2s; }
.pd-poem-card::before { content: ''; position: absolute; inset: 3px; border: 1px solid rgba(111,96,75,.055); pointer-events: none; }
.pd-poem-card:hover { background: rgba(251,249,244,.75); border-color: rgba(138,107,63,.5); }
.pd-poem-card h3 { font-size: 14px; font-weight: 600; line-height: 1.8; margin-bottom: 8px; }
.pd-poem-card p { font-size: 12px; line-height: 1.9; color: #6c6357; }
.pd-poem-card__arrow { position: absolute; bottom: 5px; right: 12px; font-size: 13px; color: #a58f70; opacity: 0; transition: opacity .2s; }
.pd-poem-card:hover .pd-poem-card__arrow, .pd-poem-card:focus-visible .pd-poem-card__arrow { opacity: 1; }
.pd-section--impact { min-height: 170px; padding-bottom: 36px; margin-top: 26px; }
.pd-section--impact > p { position: relative; z-index: 1; width: 82%; font-size: 14px; line-height: 2.1; letter-spacing: .025em; }
.pd-impact-painting { position: absolute; width: 235px; height: 150px; object-fit: contain; right: -28px; bottom: -35px; opacity: .6; mix-blend-mode: multiply; mask-image: linear-gradient(90deg, transparent, #000 40%); pointer-events: none; }
.pd-signature__link { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 30px; padding: 18px 0; border-top: 1px solid var(--pd-rule); border-bottom: 1px solid var(--pd-rule); }
.pd-signature__label { font-size: 11px; color: var(--pd-muted); }
.pd-signature__poem { font-family: var(--font-display); font-size: 23px; }
.pd-signature__link cite { font-size: 12px; font-style: normal; }
.pd-sources { position: relative; z-index: 1; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--pd-rule); }
.pd-sources :deep(.source-list__entry) { grid-template-columns: 1fr; gap: 14px; }
.pd-empty-poems { font-size: 14px; color: var(--pd-muted); padding: 10px 0 20px; }
.pd-state { padding: 8vh 6%; max-width: 1000px; margin: 0 auto; min-height: 70vh; }
.pd-state .pd-back-link { margin-top: 18px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (min-width: 1500px) { .pd-main { padding-top: 30px; } .pd-hero__art { min-height: 1040px; } .pd-section { margin-top: 30px; } }
@media (max-width: 1100px) {
  .pd-folio { grid-template-columns: minmax(0, 36fr) minmax(0, 64fr); }
  .pd-main { padding-left: 5%; padding-right: 5%; }
  .pd-art-inscription { left: 6%; top: 6%; gap: 9px; }
  .pd-art-inscription__verses { gap: 8px; }
  .pd-art-inscription__verses > p { font-size: 25px; }
  .pd-art-inscription > span { padding-top: 115px; font-size: 10px; }
  .pd-meta > div { padding: 0 10px; }
  .pd-meta dd { font-size: 12px; }
  .pd-timeline { gap: 8px; }
  .pd-milestone__painting { height: 60px; width: 60px; }
  .pd-milestone__desc { font-size: 11px; }
  .pd-poems-grid { gap: 8px; }
  .pd-poem-card { padding: 14px 9px 20px; }
  .pd-poem-card h3 { font-size: 12px; }
}
@media (max-width: 800px) {
  .pd-back { padding: 12px 5% 0; }
  .pd-folio { display: block; }
  .pd-hero__art { min-height: 0; height: clamp(460px, 75vw, 620px); }
  .pd-portrait { width: 80%; left: auto; }
  .pd-portrait--bust { inset: 12% 3% 7% 30%; width: auto; height: auto; }
  .pd-hero__art::after { background: linear-gradient(0deg, var(--bg-primary), transparent 25%, transparent 95%, var(--bg-primary)), linear-gradient(90deg, var(--bg-primary), transparent 25%, transparent 95%, var(--bg-primary)); }
  .pd-art-inscription { top: 13%; left: 8%; }
  .pd-art-inscription__verses > p { font-size: 34px; }
  .pd-art-inscription > span { font-size: 12px; }
  .pd-art-caption { bottom: 20px; left: 7%; }
  .pd-main { padding: 10px 6% 65px; }
  .pd-name { font-size: 57px; }
  .pd-style { font-size: 20px; }
  .pd-heading { margin-bottom: 32px; }
  .pd-meta dd { font-size: 14px; }
  .pd-milestone__painting { height: 72px; width: 72px; }
  .pd-milestone__desc { font-size: 12px; }
  .pd-poem-card { padding: 18px 13px 24px; }
  .pd-poem-card h3 { font-size: 14px; }
}
@media (max-width: 480px) {
  .pd-back { padding: 8px 6% 0; }
  .pd-preview-note { font-size: 9px; letter-spacing: 0; }
  .pd-hero__art { height: 450px; }
  .pd-portrait { width: 78%; }
  .pd-portrait--bust { width: auto; }
  .pd-art-inscription { top: 10%; left: 5%; }
  .pd-art-inscription__verses > p { font-size: 24px; }
  .pd-art-inscription > span { font-size: 10px; padding-top: 105px; }
  .pd-art-caption { font-size: 9px; bottom: 7px; }
  .pd-main { padding-top: 5px; }
  .pd-name { font-size: 48px; }
  .pd-style { font-size: 16px; }
  .pd-heading-rule { margin-bottom: 17px; }
  .pd-meta { grid-template-columns: .8fr 1.2fr; row-gap: 17px; }
  .pd-meta > div { padding: 0 15px; }
  .pd-meta > div:nth-child(odd) { padding-left: 0; }
  .pd-meta > div:nth-child(even) { border: 0; }
  .pd-meta dt { margin-bottom: 2px; font-size: 12px; }
  .pd-meta dd { font-size: 13px; }
  .pd-section { margin-top: 30px; }
  .pd-section-heading h2 { font-size: 20px; }
  .pd-bio { font-size: 13px; line-height: 2.1; }
  .pd-timeline { display: flex; flex-direction: column; gap: 0; padding-left: 8px; }
  .pd-milestone { position: relative; text-align: left; min-height: 103px; padding: 0 0 20px 89px; }
  .pd-milestone:not(:last-child)::after { content: ''; position: absolute; top: 66px; bottom: 5px; left: 31px; border-left: 1px solid var(--pd-rule); }
  .pd-milestone__painting { position: absolute; top: 0; left: 0; width: 63px; height: 63px; }
  .pd-milestone h3 { padding-top: 3px; }
  .pd-milestone__date { display: inline; margin-right: 6px; }
  .pd-milestone__desc { font-size: 12px; line-height: 1.8; margin-top: 2px; }
  .pd-poems-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .pd-poem-card { min-height: 128px; }
  .pd-section--impact > p { width: 100%; font-size: 13px; }
  .pd-impact-painting { width: 180px; right: -10px; bottom: -32px; opacity: .35; }
  .pd-section--impact { padding-bottom: 60px; }
}
@media (prefers-reduced-motion: reduce) { .pd-poem-card, .pd-poem-card__arrow { transition: none; } }
/* 内容列沿用共享节奏；插画保留独立构图。 */
.pd-back { padding: 0; margin-bottom: var(--sp-4); }
.pd-main { padding: 0 0 0 var(--layout-gap); }
.pd-poems-grid { --folio-card-min: 200px; }
.pd-poem-card { padding: var(--sp-4); }
.pd-poem-card h3 { font-size: var(--fs-body); }
.pd-poem-card p { font-size: var(--fs-body-sm); }
@media (max-width: 800px) { .pd-main { padding: var(--sp-5) 0 0; } }
</style>
