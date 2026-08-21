<template>
  <div class="cd">
    <div class="cd-back">
      <router-link :to="backTo" class="cd-back-link">← 返回文化长廊</router-link>
    </div>

    <div v-if="!loaded" class="cd-state">
      <SkeletonBlock height="260px" />
    </div>

    <div v-else-if="errorMsg" class="cd-state">
      <ErrorState :message="errorMsg" @retry="load" />
    </div>

    <div v-else-if="item" class="cd-content">
      <header class="cd-head">
        <div class="cd-head-media">
          <img v-if="heroImage" :src="heroImage" :alt="item.title" class="cd-hero-img" />
          <InkPlaceholder v-else :seed="item.id || item.title" :kind="item.category || '文'" />
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

      <section v-if="item.content" class="cd-section">
        <h2 class="cd-section-title">详细介绍</h2>
        <p class="cd-text">{{ item.content }}</p>
      </section>

      <section v-if="detailFields.length" class="cd-section">
        <h2 class="cd-section-title">详情档案</h2>
        <dl class="cd-fields">
          <div v-for="f in detailFields" :key="f.label" class="cd-field">
            <dt class="cd-field-label">{{ f.label }}</dt>
            <dd class="cd-field-value">{{ f.value }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="tagsOf(item).length" class="cd-section">
        <h2 class="cd-section-title">标签</h2>
        <div class="cd-tags">
          <span v-for="t in tagsOf(item)" :key="t" class="cd-tag">{{ t }}</span>
        </div>
      </section>
    </div>

    <!-- 加载完成但无数据（item===null）: 此前整页空白只剩返回链接 -->
    <div v-else class="cd-state">
      <EmptyState message="未找到该文化条目" hint="它可能已被移除，返回文化长廊看看其他内容" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'
import { parseFirstUrl } from '../composables/useImage'
import { CATEGORY_LABELS } from '../config/culturalCategories'
import InkPlaceholder from '../components/InkPlaceholder.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import EmptyState from '../components/homepage/EmptyState.vue'

const route = useRoute()

const item = ref(null)
const detail = ref(null)
const loaded = ref(false)
const errorMsg = ref('')

// 详情路由统一: /festivals/:id /crafts/:id /literature/:id /food-opera/:id 共用本组件
// 注意: /crafts 路由是「东昌葫芦雕刻」3D 专题页而非工艺列表,
// 工艺详情返回指回文化长廊聚合页 /culture, 与链接文案「返回文化长廊」一致。
const CATEGORY_BACK = {
  '/festivals': '/festivals',
  '/crafts': '/culture',
  '/literature': '/literature',
  '/food-opera': '/food-opera',
}
const backTo = computed(() => {
  const prefix = Object.keys(CATEGORY_BACK).find((p) => route.path.startsWith(p))
  return prefix ? CATEGORY_BACK[prefix] : '/literature'
})

const CATEGORY_LABELS_LOCAL = CATEGORY_LABELS
const categoryLabel = (c) => CATEGORY_LABELS_LOCAL[c] || c

// 主表配图：imageAnimeUrl 优先（库里现有数据在 anime 字段），imageUrl 兜底
const heroImage = computed(() =>
  parseFirstUrl(item.value?.imageAnimeUrl) || parseFirstUrl(item.value?.imageUrl) || null,
)

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

async function load() {
  loaded.value = false
  errorMsg.value = ''
  try {
    const data = await api.get(`/cultural/${route.params.id}`)
    item.value = data.item
    detail.value = data.detail
  } catch (err) {
    console.error('加载文化详情失败:', err)
    errorMsg.value = err.message || '加载失败'
  } finally {
    loaded.value = true
  }
}

onMounted(load)
</script>

<style scoped>
.cd {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 48px 96px;
}
.cd-back { margin-bottom: 24px; }
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
</style>