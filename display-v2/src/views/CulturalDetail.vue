<template>
  <div class="cd folio-page">
    <div class="cd-back">
      <router-link :to="backTo" class="cd-back-link folio-back">← {{ returnLabel }}</router-link>
    </div>

    <div v-if="!loaded" class="cd-state">
      <SkeletonBlock height="260px" />
    </div>

    <div v-else-if="errorMsg" class="cd-state">
      <ErrorState :message="errorMsg" @retry="load" />
    </div>

    <div v-else-if="item" class="cd-content">
      <header class="cd-head">
        <div v-if="heroImage && !realAssets.length" class="cd-head-media" :style="{ aspectRatio: heroPresentation.aspectRatio }">
          <img
            v-if="heroImage && !heroFailed"
            :src="heroImage"
            :alt="item.title"
            class="cd-hero-img"
            :style="{ objectFit: heroPresentation.objectFit, objectPosition: heroPresentation.objectPosition }"
            @error="heroFailed = true"
          />
          <p v-else class="cd-image-missing">图像暂未载入</p>
          <span v-if="enrichment" class="cd-art-label">{{ heroImage && !heroFailed ? (enrichment.realAssets?.some(asset => asset.kind === 'image' && asset.inlineVerified === true) ? '来源图像' : '文化插画') : '影像待补' }}</span>
        </div>
        <div class="cd-head-main">
          <span class="cd-category">{{ categoryLabel(item.category) }}</span>
          <h1 class="cd-title">{{ item.title }}</h1>
          <p class="cd-meta">
            <span v-if="item.region">{{ item.region }}</span>
            <span v-if="item.region && item.summary" class="cd-meta-sep">·</span>
            <span v-if="item.summary">{{ item.summary }}</span>
          </p>
        </div>
      </header>

      <aside v-if="enrichment?.researchNotes?.length" class="cd-reading-notes" aria-label="阅读与核验提示"><h2>阅读提示</h2><p v-for="note in enrichment.researchNotes" :key="note">{{ note }}</p></aside>
      <CultureMediaGallery v-if="realAssets.length" :key="item.title" :assets="realAssets" :item-title="item.title" />
      <CultureExperience v-if="enrichment?.experience && ['story', 'craft'].includes(enrichment.experience.kind)" :key="`${item.category}:${item.title}`" :experience="enrichment.experience" :item-title="item.title" />
      <CultureMediaResources v-if="resources.length" :media="resources" :item-title="item.title" class="cd-section folio-section" />

      <section v-if="item.content" class="cd-section folio-section">
        <h2 class="cd-section-title folio-section-title">详细介绍</h2>
        <p class="cd-text folio-prose">{{ item.content }}</p>
      </section>

      <section v-if="detailFields.length" class="cd-section folio-section">
        <h2 class="cd-section-title folio-section-title">详情档案</h2>
        <dl class="cd-fields">
          <div v-for="f in detailFields" :key="f.label" class="cd-field">
            <dt class="cd-field-label">{{ f.label }}</dt>
            <dd class="cd-field-value">{{ f.value }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="tagsOf(item).length" class="cd-section folio-section">
        <h2 class="cd-section-title folio-section-title">标签</h2>
        <div class="cd-tags">
          <span v-for="t in tagsOf(item)" :key="t" class="cd-tag">{{ t }}</span>
        </div>
      </section>

      <SourceList show-missing v-if="sources.length || !supplementalSources.length" :sources="sources" class="cd-section folio-section" />
      <section v-if="supplementalSources.length" class="cd-section folio-section">
        <p class="cd-source-context">下列为本次逐项核验的扩展资料与影像出处，帮助观察和比较；正文中的“待考”信息仍需继续复核。</p>
        <SourceList :sources="supplementalSources" heading="扩展资料与素材出处" heading-id="culture-research-sources" description="图像、节目与文献由来源机构提供，可打开原页继续查看。" />
      </section>
      <div class="folio-detail-actions"><p>继续循着风物，了解这座城。</p><div class="folio-actions"><router-link :to="backTo" class="folio-button">返回浏览结果</router-link><router-link v-if="item.region" :to="atlasLink(`/cities/${item.region}`, route)" class="folio-button folio-button--primary">走进{{ item.region }} →</router-link></div></div>
    </div>

    <!-- 加载完成但无数据（item===null）: 此前整页空白只剩返回链接 -->
    <div v-else class="cd-state">
      <EmptyState message="未找到该文化条目" hint="它可能已被移除，返回文化长廊看看其他内容" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'
import { atlasLink, isAtlasPreview } from '../config/atlasPreview'
import { culturePreviewItems } from '../config/culturePreview'
import { safeReturnPath } from '../config/siteNavigation'
import { useImage } from '../composables/useImage'
import { getCuratedPresentation } from '../config/curatedMedia'
import { CATEGORY_LABELS } from '../config/culturalCategories'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import EmptyState from '../components/homepage/EmptyState.vue'
import SourceList from '../components/SourceList.vue'
import CultureMediaGallery from '../components/culture/CultureMediaGallery.vue'
import CultureExperience from '../components/culture/CultureExperience.vue'
import CultureMediaResources from '../components/culture/CultureMediaResources.vue'
import { getCultureEnrichment, cultureMedia, mergeCultureSources } from '../utils/cultureEnrichment.js'

const route = useRoute()
const { resolveFirstImage } = useImage()

const item = ref(null)
const detail = ref(null)
const sources = ref([])
const loaded = ref(false)
const errorMsg = ref('')
const heroFailed = ref(false)
const enrichment = computed(() => getCultureEnrichment(item.value))
const realAssets = computed(() => enrichment.value?.realAssets?.filter(asset => asset.inlineVerified) || [])
const resources = computed(() => cultureMedia(enrichment.value).filter(media => !realAssets.value.some(asset => asset.sourceUrl === media.url)))
const supplementalSources = computed(() => mergeCultureSources([], enrichment.value).filter(source => !sources.value.some(existing => existing.url === source.url)))

// 详情路由统一: /festivals/:id /crafts/:id /literature/:id /food-opera/:id 共用本组件
// /crafts 是非遗工艺列表，东昌葫芦 3D/插画专题工坊在 /crafts/workshop。
const CATEGORY_BACK = {
  '/festivals': '/festivals',
  '/crafts': '/crafts',
  '/literature': '/literature',
  '/food-opera': '/food-opera',
}
const backTo = computed(() => {
  const prefix = Object.keys(CATEGORY_BACK).find((p) => route.path.startsWith(p))
  return atlasLink(safeReturnPath(route.query.returnTo, prefix ? CATEGORY_BACK[prefix] : '/culture'), route)
})

const returnLabel = computed(() => route.query.returnTo ? '返回浏览结果' : '返回文化栏目')

const CATEGORY_LABELS_LOCAL = CATEGORY_LABELS
const categoryLabel = (c) => CATEGORY_LABELS_LOCAL[c] || c

// 主表配图：imageAnimeUrl 优先（库里现有数据在 anime 字段），imageUrl 兜底
const heroImage = computed(() =>
  resolveFirstImage(
    [item.value?.imageAnimeUrl, item.value?.imageUrl, realAssets.value.find(asset => asset.kind === 'image')?.url, enrichment.value?.image],
    '文',
    { placeholder: false },
  ),
)
const heroPresentation = computed(() => getCuratedPresentation(heroImage.value))

// 各 detail 表的字段中文标签(与后端实体字段对应)
const DETAIL_LABELS = {
  festival: [
    ['festivalDate', '举办时间'], ['origin', '起源渊源'], ['customs', '习俗活动'], ['food', '节庆饮食'],
  ],
  craft: [
    ['craftCategory', '工艺类别'], ['materials', '所需材料'], ['tools', '所需工具'],
    ['process', '工艺流程'], ['inheritors', '传承人介绍'],
    ['representativeWorks', '代表作品'], ['difficultyLevel', '难度等级'],
    ['learningResources', '学习资源'],
  ],
  literature: [
    ['genre', '体裁'], ['originRegion', '流传地区'], ['mainCharacters', '主要人物'],
    ['plotSummary', '故事梗概'], ['culturalSignificance', '文化价值'],
    ['relatedScenicSpots', '关联景点'], ['collectionSource', '采集来源'],
  ],
  food_opera: [
    ['subCategory', '子类别'], ['cuisineType', '菜系/剧种'], ['ingredients', '食材/要求'],
    ['preparationMethod', '制作方法/表演技巧'], ['representativeDishes', '代表菜品/剧目'],
    ['historicalOrigin', '历史渊源'], ['currentStatus', '现状'], ['preservationLevel', '保护级别'],
  ],
}

const detailFields = computed(() => {
  const d = detail.value
  if (!d) return []
  const labels = DETAIL_LABELS[item.value?.category] || []
  return labels
    .map(([key, label]) => ({ label, value: d[key] }))
    .filter((f) => f.value !== null && f.value !== undefined && f.value !== '')
})

function tagsOf(it) {
  const t = it && it.tags
  if (Array.isArray(t)) return t
  if (typeof t === 'string') {
    try {
      const p = JSON.parse(t)
      return Array.isArray(p) ? p : []
    } catch {
      return []
    }
  }
  return []
}

let loadSequence = 0
async function load() {
  const sequence = ++loadSequence
  item.value = null
  detail.value = null
  loaded.value = false
  errorMsg.value = ''
  sources.value = []
  heroFailed.value = false
  if (isAtlasPreview(route)) {
    const categories = { festivals: 'festival', literature: 'literature', crafts: 'craft', 'food-opera': 'food_opera' }
    item.value = culturePreviewItems.find(it => String(it.id) === String(route.params.id) && it.category === categories[route.path.split('/')[1]]) || null
    loaded.value = true
    return
  }
  try {
    const data = await api.get(`/cultural/${route.params.id}`)
    if (sequence !== loadSequence) return
    item.value = data.item
    detail.value = data.detail
    sources.value = Array.isArray(data.sources) ? data.sources : []
  } catch (err) {
    if (sequence !== loadSequence) return
    console.error('加载文化详情失败:', err)
    errorMsg.value = err.message || '加载失败'
  } finally {
    if (sequence === loadSequence) loaded.value = true
  }
}

watch(() => [route.params.id, route.query.preview], load, { immediate: true })
</script>

<style scoped>
.cd {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 48px 96px;
}
.cd-back { margin-bottom: 24px; }
.cd-head-media { position:relative; }
.cd-art-label { position:absolute; bottom:8px; left:8px; padding:3px 7px; background:var(--bg-primary); color:var(--text-secondary); font-size:11px; }
.cd-source-context { color:var(--text-secondary); font-size:var(--fs-caption); line-height:1.8; margin-bottom:24px; }
.cd-reading-notes { margin:24px 0; padding:20px 24px; border-left:2px solid var(--accent); background:var(--accent-faint); }
.cd-reading-notes h2 { margin:0 0 10px; font:600 17px var(--font-heading); }
.cd-reading-notes p { margin:8px 0; font-size:13px; line-height:1.9; color:var(--text-secondary); }
.cd-back-link {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 1px;
}
.cd-back-link:hover { color: var(--accent); }
.cd-state { min-height: 300px; display: flex; align-items: center; justify-content: center; }
.cd-head {
  display: flex;
  gap: 24px;
  align-items: center;
  padding-bottom: 28px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border);
}
.cd-head-media {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}
.cd-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.cd-head-main { text-align: left; }
.cd-category {
  display: inline-block;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 999px;
  padding: 2px 10px;
  margin-bottom: 10px;
}
.cd-title {
  font-family: var(--font-heading);
  font-size: 30px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--text-primary);
  letter-spacing: 2px;
}
.cd-meta { margin: 0; color: var(--text-secondary); font-size: 14px; line-height: 1.7; }
.cd-meta-sep { margin: 0 8px; color: var(--text-muted); }
/* 日式留白: 区块间距 ≥80px(原 32px 偏挤) */
.cd-section { margin-bottom: 80px; }
.cd-section-title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 2px;
  border-left: 3px solid var(--accent);
  padding-left: 10px;
  margin: 0 0 16px;
}
.cd-text { color: var(--text-secondary); line-height: 2; font-size: 15px; margin: 0; white-space: pre-wrap; }
.cd-fields { margin: 0; display: flex; flex-direction: column; gap: 10px; }
.cd-field {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 16px;
  align-items: baseline;
}
.cd-field-label { font-size: 13px; color: var(--text-muted); letter-spacing: 1px; }
.cd-field-value { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.8; white-space: pre-wrap; }
.cd-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.cd-tag {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--accent-faint, color-mix(in srgb, var(--accent) 6%, transparent));
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 3px 12px;
}
@media (max-width: 640px) {
  .cd { padding: 24px 16px 72px; }
  .cd-head { flex-direction: column; align-items: flex-start; }
  .cd-field { grid-template-columns: 1fr; gap: 4px; }
}
.cd { max-width:1160px; padding:24px var(--page-gutter) 70px; } .cd-head { gap:36px; border-bottom:1px solid var(--border-light); padding-bottom:32px; } .cd-head-media { max-height:320px; } .cd-title { font-family:var(--font-display); font-weight:500; } .cd-category { background:transparent; color:var(--reading-green); border:0; padding-left:0; }
</style>
