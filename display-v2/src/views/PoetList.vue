<template>
  <div class="poets-view" :class="{ 'anime-layout': isAnime }">
    <InkHero
      variant="roster"
      seal-char="名"
      kuan="济南名士多"
      eyebrow="齐鲁文脉"
      title="齐鲁名士"
      subtitle="探寻黄河流域历代齐鲁大家之生平轨迹与文学连结。"
      :stats="heroStats"
    />

    <div ref="revealRoot" class="poets-content">
      <!-- 今日名句 -->
      <section v-if="todayPoem" class="poets-section poets-quote" data-reveal>
        <FeaturedPoemCard :poem="todayPoem" @click="goPoem(todayPoem.id)" />
      </section>

      <!-- 朝代筛选 + 视图切换 -->
      <section class="poets-toolbar" data-reveal>
        <DynastyRail
          :dynasties="dynastyItems"
          :model-value="selectedDynastyId"
          aria-label="按朝代筛选名士"
          @update:model-value="selectedDynastyId = $event"
        />
        <div class="layout-toggle-group" role="tablist" aria-label="文人廊视图切换">
          <button
            class="toggle-btn"
            :class="{ active: activeTab === 'gallery' }"
            role="tab"
            :aria-selected="activeTab === 'gallery'"
            @click="activeTab = 'gallery'"
          >
            书卷长廊
          </button>
          <button
            class="toggle-btn"
            :class="{ active: activeTab === 'all' }"
            role="tab"
            :aria-selected="activeTab === 'all'"
            @click="activeTab = 'all'"
          >
            全名录
          </button>
          <button
            class="toggle-btn"
            :class="{ active: activeTab === 'graph' }"
            role="tab"
            :aria-selected="activeTab === 'graph'"
            @click="activeTab = 'graph'"
          >
            关系图谱
          </button>
        </div>
      </section>

      <Transition name="tab-fade" mode="out-in">
        <div v-if="activeTab === 'gallery'" key="gallery" class="gallery-tab-content">
          <!-- 本期名士（传世最丰者，大卡） -->
          <section v-if="featuredPoets.length" class="poets-section poets-featured" data-reveal>
            <SectionHeading
              eyebrow="本期名士"
              title="传世最丰"
              subtitle="诗篇传世最多的齐鲁文人，附其代表句"
            />
            <div class="poets-featured-grid">
              <FeaturedPoetCard
                v-for="p in featuredPoets"
                :key="p.id"
                :poet="p"
                :dynasty-name="getDynastyName(p.dynastyId)"
                @click="$router.push(`/poets/${p.id}`)"
              />
            </div>
          </section>

          <!-- 名士卡墙 -->
          <section class="poets-section" data-reveal>
            <div class="section-bar">
              <span class="section-bar-title">{{ selectedDynastyName }}</span>
              <span class="section-bar-count">{{ standardPoets.length }} 位</span>
            </div>

            <!-- 名士卡墙骨架 -->
            <div v-if="!poetsLoaded" class="cards-grid-list" aria-busy="true" aria-label="名士加载中">
              <SkeletonBlock v-for="i in 6" :key="`skel-${i}`" height="180px" />
            </div>

            <div class="cards-grid-list" v-else-if="standardPoets.length">
              <article
                v-for="p in standardPoets"
                :key="p.id"
                class="poet-card-wrap card hover-lift"
                tabindex="0"
                role="link"
                @click="$router.push(`/poets/${p.id}`)"
                @keydown.enter="$router.push(`/poets/${p.id}`)"
                :aria-label="`查看 ${p.name} 详情`"
              >
                <div class="poet-avatar-box">
                  <img
                    v-if="getPoetAvatar(p)"
                    :src="getPoetAvatar(p)"
                    :alt="p.name"
                    class="poet-img"
                    loading="lazy"
                    decoding="async"
                    @error="onAvatarError"
                  />
                  <span class="poet-avatar-stamp">{{ p.name ? p.name.charAt(0) : '文' }}</span>
                  <span class="poet-stamp">文</span>
                </div>
                <div class="poet-card-body">
                  <div class="poet-title-row">
                    <h3 class="poet-name-tag">{{ p.name }}</h3>
                    <span class="poet-dynasty-badge">{{ getDynastyName(p.dynastyId) }}</span>
                  </div>
                  <p v-if="p.biography" class="poet-biography">{{ p.biography.substring(0, 80) }}…</p>
                  <blockquote v-else-if="p.signaturePoem && p.signaturePoem.firstLine" class="poet-sigline">
                    「{{ p.signaturePoem.firstLine }}」
                    <cite v-if="p.signaturePoem.title">《{{ p.signaturePoem.title }}》</cite>
                  </blockquote>
                  <p v-else class="poet-biography poet-biography--empty">生平待考，然其诗已传。</p>
                  <div class="poet-style-box">
                    <span class="style-lbl">传世</span>
                    <span class="style-val">{{ p.poemCount || 0 }} 篇</span>
                  </div>
                </div>
              </article>
            </div>

            <EmptyState
              v-if="poetsLoaded && !filteredEnrichedPoets.length"
              icon="名"
              message="该朝代暂无收录诗人"
              hint="换个朝代看看"
            />

            <!-- 折叠: 信息待考的名士(完整度<40), 默认收起 -->
            <div v-if="marginalPoets.length" class="marginal-wrap">
              <button class="marginal-toggle" @click="showMarginal = !showMarginal">
                {{ showMarginal ? '收起' : '展开' }}更多 {{ marginalPoets.length }} 位(信息待考)
                <span class="marginal-arrow" :class="{ open: showMarginal }">▾</span>
              </button>
              <Transition name="tab-fade">
                <div v-show="showMarginal" class="cards-grid-list marginal-grid">
                  <article
                    v-for="p in marginalPoets"
                    :key="p.id"
                    class="poet-card-wrap card hover-lift is-marginal"
                    tabindex="0"
                    role="link"
                    @click="$router.push(`/poets/${p.id}`)"
                    @keydown.enter="$router.push(`/poets/${p.id}`)"
                    :aria-label="`查看 ${p.name} 详情`"
                  >
                    <div class="poet-avatar-box">
                      <img
                        v-if="getPoetAvatar(p)"
                        :src="getPoetAvatar(p)"
                        :alt="p.name"
                        class="poet-img"
                        loading="lazy"
                        decoding="async"
                        @error="onAvatarError"
                      />
                      <span class="poet-avatar-stamp">{{ p.name ? p.name.charAt(0) : '文' }}</span>
                      <span class="poet-stamp">文</span>
                    </div>
                    <div class="poet-card-body">
                      <div class="poet-title-row">
                        <h3 class="poet-name-tag">{{ p.name }}</h3>
                        <span class="poet-dynasty-badge">{{ getDynastyName(p.dynastyId) }}</span>
                      </div>
                      <p class="poet-biography poet-biography--empty">生平待考，然其诗已传。</p>
                      <div class="poet-style-box">
                        <span class="style-lbl">传世</span>
                        <span class="style-val">{{ p.poemCount || 0 }} 篇</span>
                      </div>
                    </div>
                  </article>
                </div>
              </Transition>
            </div>
          </section>
        </div>

        <!-- 全名录 -->
        <div v-else-if="activeTab === 'all'" key="all" class="all-tab-content">
          <section class="poets-section" data-reveal>
            <div class="section-bar">
              <span class="section-bar-title">{{ selectedDynastyName }}</span>
              <span class="section-bar-count">{{ filteredEnrichedPoets.length }} 位</span>
            </div>

            <div v-if="!poetsLoaded" class="cards-grid-list" aria-busy="true" aria-label="名士加载中">
              <SkeletonBlock v-for="i in 6" :key="`skel-${i}`" height="180px" />
            </div>

            <div class="cards-grid-list" v-else-if="filteredEnrichedPoets.length">
              <article
                v-for="p in filteredEnrichedPoets"
                :key="p.id"
                class="poet-card-wrap card hover-lift"
                tabindex="0"
                role="link"
                @click="$router.push(`/poets/${p.id}?from=all`)"
                @keydown.enter="$router.push(`/poets/${p.id}?from=all`)"
                :aria-label="`查看 ${p.name} 详情`"
              >
                <div class="poet-avatar-box">
                  <img
                    v-if="getPoetAvatar(p)"
                    :src="getPoetAvatar(p)"
                    :alt="p.name"
                    class="poet-img"
                    loading="lazy"
                    decoding="async"
                    @error="onAvatarError"
                  />
                  <span class="poet-avatar-stamp">{{ p.name ? p.name.charAt(0) : '文' }}</span>
                  <span class="poet-stamp">文</span>
                </div>
                <div class="poet-card-body">
                  <div class="poet-title-row">
                    <h3 class="poet-name-tag">{{ p.name }}</h3>
                    <span class="poet-dynasty-badge">{{ getDynastyName(p.dynastyId) }}</span>
                  </div>
                  <p v-if="p.biography" class="poet-biography">{{ p.biography.substring(0, 80) }}…</p>
                  <blockquote v-else-if="p.signaturePoem && p.signaturePoem.firstLine" class="poet-sigline">
                    「{{ p.signaturePoem.firstLine }}」
                    <cite v-if="p.signaturePoem.title">《{{ p.signaturePoem.title }}》</cite>
                  </blockquote>
                  <p v-else class="poet-biography poet-biography--empty">生平待考，然其诗已传。</p>
                  <div class="poet-style-box">
                    <span class="style-lbl">传世</span>
                    <span class="style-val">{{ p.poemCount || 0 }} 篇</span>
                  </div>
                </div>
              </article>
            </div>

            <EmptyState
              v-if="poetsLoaded && !filteredEnrichedPoets.length"
              icon="名"
              message="该朝代暂无收录诗人"
              hint="换个朝代看看"
            />
          </section>
        </div>

        <!-- 关系图谱 (AntV G6) -->
        <div v-else key="graph" class="graph-tab-content">
          <div class="graph-panel-inner card">
            <div class="graph-instructions">
              <span class="instruction-tag">互动</span>
              <p class="instruction-desc">
                滚轮缩放 · 拖拽画布 · 悬停诗人聚焦其交游脉络 · 点击诗人查看关系卡片；师承以箭头示方向（师 → 徒），虚线为推断关系。
              </p>
            </div>

            <!-- 关系/朝代 筛选 chips -->
            <div v-if="graphStatus === 'ready'" class="graph-filters">
              <div class="filter-group">
                <span class="filter-label">关系</span>
                <button
                  v-for="rt in relationFilterOptions"
                  :key="rt"
                  class="filter-chip"
                  :class="{ active: relationFilter === rt }"
                  @click="relationFilter = rt"
                >{{ rt }}</button>
                <button
                  v-if="derivedCount"
                  class="filter-chip filter-chip--derived"
                  :class="{ active: derivedVisible }"
                  @click="derivedVisible = !derivedVisible"
                >推断{{ derivedCount }}</button>
              </div>
              <div class="filter-group">
                <span class="filter-label">朝代</span>
                <button
                  v-for="d in graphDynastyOptions"
                  :key="d"
                  class="filter-chip"
                  :class="{ active: dynastyFilter === d }"
                  @click="dynastyFilter = d"
                >{{ d }}</button>
              </div>
            </div>

            <!-- 加载态 -->
            <div v-if="graphStatus === 'loading'" class="graph-status-box graph-status-box--skel" aria-busy="true" aria-label="关系图谱加载中">
              <SkeletonBlock height="560px" />
            </div>

            <!-- 空态 -->
            <div v-else-if="graphStatus === 'empty'" class="graph-status-box">
              <EmptyState icon="谱" message="暂无关系数据" hint="等待学者考证补录" />
            </div>

            <!-- 错误态 -->
            <div v-else-if="graphStatus === 'error'" class="graph-status-box">
              <ErrorState message="关系数据加载失败" @retry="initG6" />
            </div>

            <!-- 图谱画布 + 诗人抽屉 -->
            <div v-show="graphStatus === 'ready'" class="graph-stage">
              <div ref="g6Container" class="g6-container-canvas"></div>

              <Transition name="drawer-slide">
                <aside v-if="drawerPoet" class="graph-drawer" role="dialog" aria-label="诗人关系卡片">
                  <button class="drawer-close" aria-label="关闭卡片" @click="closeDrawer">✕</button>
                  <header class="drawer-head">
                    <h3 class="drawer-name">{{ drawerPoet.name }}</h3>
                    <span class="drawer-dynasty" :style="drawerDynastyStyle">{{ drawerPoet.dynasty }}</span>
                  </header>
                  <p v-if="drawerMeta" class="drawer-meta">{{ drawerMeta }}</p>
                  <p class="drawer-bio">{{ drawerBio }}</p>
                  <ul v-if="drawerRelations.length" class="drawer-relations">
                    <li v-for="(rel, i) in drawerRelations" :key="i" class="drawer-relation">
                      <span class="dr-type" :style="{ borderColor: relationColorOf(rel.type) }">{{ rel.type }}</span>
                      <span class="dr-body">
                        <span class="dr-who">{{ rel.counterpartName }}</span>
                        <span v-if="rel.description" class="dr-desc">{{ rel.description }}</span>
                      </span>
                    </li>
                  </ul>
                  <p v-else class="drawer-relations drawer-relations--empty">暂无关系收录</p>
                  <button class="drawer-primary" @click="goPoetDetail">进入专栏 →</button>
                </aside>
              </Transition>
            </div>

            <!-- 双图例: 关系类型 + 朝代 -->
            <div v-if="graphStatus === 'ready'" class="graph-legend">
              <div class="legend-group">
                <span class="legend-group-title">关系</span>
                <div v-for="lg in relationLegend" :key="lg.key" class="legend-item">
                  <span class="legend-swatch legend-line" :style="legendLineStyle(lg)">{{ lg.arrow ? '→' : '' }}</span>
                  {{ lg.label }}
                </div>
              </div>
              <div class="legend-group">
                <span class="legend-group-title">朝代</span>
                <div v-for="d in legendDynasties" :key="d" class="legend-item">
                  <span class="legend-swatch legend-dot" :style="{ background: dynastyColorByName(d) }"></span>
                  {{ d }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <ErrorState v-if="errorMsg" :message="errorMsg" @retry="loadPoets" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useImage } from '../composables/useImage'
import { usePoetEnrichment } from '../composables/usePoetEnrichment'
import { useReveal } from '../composables/useReveal'
import api from '../api'
import { Graph } from '@antv/g6'
import { cssVar } from '../utils/cssToken'
import InkHero from '../components/homepage/InkHero.vue'
import SectionHeading from '../components/homepage/SectionHeading.vue'
import FeaturedPoemCard from '../components/homepage/FeaturedPoemCard.vue'
import FeaturedPoetCard from '../components/homepage/FeaturedPoetCard.vue'
import DynastyRail from '../components/homepage/DynastyRail.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import EmptyState from '../components/homepage/EmptyState.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'

const router = useRouter()
const route = useRoute()
const { isAnime } = useTheme()
const { getImageUrl } = useImage()
const { map: enrichMap, build, enrich } = usePoetEnrichment()
const { reveal } = useReveal()

// 朝代参考数据（与库一致：4=隋唐 / 5=宋 / 9=金；按起始年排序）
const DYNASTIES = [
  { id: 1, name: '先秦', start: -2070, end: -221 },
  { id: 2, name: '秦汉', start: -221, end: 220 },
  { id: 3, name: '魏晋南北朝', start: 220, end: 589 },
  { id: 4, name: '隋唐', start: 581, end: 907 },
  { id: 5, name: '宋', start: 960, end: 1279 },
  { id: 9, name: '金', start: 1115, end: 1234 },
  { id: 6, name: '元', start: 1271, end: 1368 },
  { id: 7, name: '明', start: 1368, end: 1644 },
  { id: 8, name: '清', start: 1644, end: 1912 },
]

const activeTab = ref(route.query.view === 'all' ? 'all' : 'gallery')
const selectedDynastyId = ref(null)
const poets = ref([])
const poetsLoaded = ref(false)
const enrichmentLoaded = ref(false)
const errorMsg = ref(null)
const revealRoot = ref(null)

// ---- 朝代相关 ----
const getDynastyName = (id) => DYNASTIES.find((d) => d.id === id)?.name || '古代'
const countByDynasty = (id) => poets.value.filter((p) => p.dynastyId === id).length

const dynastyItems = computed(() => [
  { id: null, name: '全部', poetCount: poets.value.length },
  ...DYNASTIES.map((d) => ({
    id: d.id,
    name: d.name,
    startYear: d.start,
    endYear: d.end,
    poetCount: countByDynasty(d.id),
  })).filter((d) => d.poetCount > 0),
])

const selectedDynastyName = computed(() => {
  if (selectedDynastyId.value == null) return '全部名士'
  return getDynastyName(selectedDynastyId.value) + '名士'
})

// ---- enrichment ----
const enrichedPoets = computed(() => poets.value.map((p) => enrich(p)))
const filteredEnrichedPoets = computed(() => {
  if (selectedDynastyId.value == null) return enrichedPoets.value
  return enrichedPoets.value.filter((p) => p.dynastyId === selectedDynastyId.value)
})

// 卡墙常规层(完整度 40-69): 默认展示
const standardPoets = computed(() =>
  filteredEnrichedPoets.value.filter((p) => {
    const c = p.completeness ?? 0
    return c >= 40 && c < 70
  }),
)
// 卡墙折叠层(完整度 <40): 信息薄, 默认收起
const marginalPoets = computed(() =>
  filteredEnrichedPoets.value.filter((p) => (p.completeness ?? 0) < 40),
)
const showMarginal = ref(false)

const featuredPoets = computed(() => {
  const premium = [...enrichedPoets.value]
    .filter((p) => (p.completeness ?? 0) >= 70)
    .sort((a, b) => (b.poemCount || 0) - (a.poemCount || 0))
  if (premium.length) return premium.slice(0, 6)
  return [...enrichedPoets.value]
    .sort((a, b) => (b.poemCount || 0) - (a.poemCount || 0))
    .slice(0, 3)
})

const todayPoem = computed(() => {
  if (!enrichmentLoaded.value || !enrichedPoets.value.length) return null
  const candidates = enrichedPoets.value
    .filter((p) => p.signaturePoem && p.signaturePoem.firstLine)
    .sort((a, b) => (b.poemCount || 0) - (a.poemCount || 0))
  if (!candidates.length) return null
  const idx = new Date().getDate() % candidates.length
  const p = candidates[idx]
  return {
    id: p.signaturePoem.id,
    line: p.signaturePoem.firstLine,
    title: p.signaturePoem.title,
    poetName: p.name,
    dynastyName: getDynastyName(p.dynastyId),
    sentimentTags: p.signaturePoem.sentimentTags || [],
  }
})

const statsReady = computed(() => poetsLoaded.value && enrichmentLoaded.value)
const heroStats = computed(() => {
  if (!statsReady.value) return []
  const totalPoems = Object.values(enrichMap.value).reduce(
    (s, e) => s + (e.poemCount || 0),
    0,
  )
  const dynastiesWithPoets = DYNASTIES.filter((d) => countByDynasty(d.id) > 0).length
  return [
    { value: poets.value.length, suffix: '位', label: '齐鲁名士' },
    { value: dynastiesWithPoets, suffix: '朝', label: '跨越朝代' },
    { value: totalPoems, suffix: '篇', label: '传世诗卷' },
    { value: dynastiesWithPoets, suffix: '朝', label: '有录可考' },
  ]
})

// ---- 头像 ----
const getPoetAvatar = (poet) => {
  if (!poet) return ''
  const url = isAnime.value ? poet.avatarAnimeUrl || poet.avatarUrl : poet.avatarUrl
  return url ? getImageUrl(url, isAnime.value) : ''
}
const onAvatarError = (e) => {
  e.target.style.display = 'none'
}
const goPoem = (id) => {
  if (id) router.push(`/poems/${id}`)
}

// ==========================================
// AntV G6 Graph — 关系图谱（视觉增强版）
// ==========================================
const g6Container = ref(null)
// graphStatus: 'idle' | 'loading' | 'empty' | 'error' | 'ready'
const graphStatus = ref('idle')
let graphInstance = null
let graphRequestSeq = 0

// ---- 关系类型视觉编码（Phase2 派生边/新类型在此扩展）----
// 并称: 粗实线（最牢固的"齐名"关系；G6 v5 无原生双线，以线宽 4 + 主题 accent 色表达 double）
// 师承: 唯一有向关系，mentor→student 箭头；方向查 MENTOR_DIRECTION，未收录时回退 source→target
// 交游: 细实线（日常交往）
// 亲属: 短虚线（血缘纽带）
const RELATION_STYLES = {
  real: {
    并称: { color: '#b8860b', lineWidth: 4, double: true },
    师承: { color: '#4f8377', lineWidth: 2, arrow: true, dir: 'source→target' },
    交游: { color: '#9a8f7d', lineWidth: 1.5 },
    亲属: { color: '#b87f7f', lineWidth: 1.5, lineDash: [5, 4] },
  },
  inkwash: {
    并称: { color: '#d9a441', lineWidth: 4, double: true },
    师承: { color: '#7fae9f', lineWidth: 2, arrow: true, dir: 'source→target' },
    交游: { color: '#a89e8c', lineWidth: 1.5 },
    亲属: { color: '#c99a9a', lineWidth: 1.5, lineDash: [5, 4] },
  },
}
// 并称色取主题 accent（调用时解析，随主题切换）
const relationPalette = () => {
  const accent = cssVar('--accent')
  const base = RELATION_STYLES[isAnime.value ? 'inkwash' : 'real']
  return {
    ...base,
    并称: { ...base['并称'], color: accent || base['并称'].color },
  }
}

// 朝代莫兰迪色板（节点填充 + 图例共享；未知朝代回退灰）
const DYNASTY_COLORS = {
  1: '#b8a99a', // 先秦 砂灰
  2: '#a9745c', // 秦汉 赭褐
  3: '#93a58d', // 魏晋南北朝 苔绿
  4: '#c4a265', // 隋唐 麦金
  5: '#7c9cb3', // 宋 天青
  6: '#9384ab', // 元 紫灰
  7: '#b06f6f', // 明 绛红
  8: '#6f928e', // 清 黛青
  9: '#b0915a', // 金 鎏金褐
}
const DYNASTY_FALLBACK_COLOR = '#9a9388'

// 师承方向表（mentor id）: key = 两端 id 升序 "a-b"
const MENTOR_DIRECTION = {
  '17-18': '17', // 苏轼 → 黄庭坚（苏黄）
  '24-25': '24', // 宋濂 → 方孝孺
  '17-52': '17', // 苏轼 → 晁补之
  '17-108': '17', // 苏轼 → 陈师道
  '7-109': '7', // 元好问 → 王恽
  '31-129': '129', // 施闰章 → 蒲松龄
}

// 原始图谱数据（筛选/抽屉复用）
const graphRawData = ref({ nodes: [], edges: [] })
const graphNodeMap = computed(() => {
  const m = {}
  ;(graphRawData.value.nodes || []).forEach((n) => {
    m[n.id] = n
  })
  return m
})

// ---- 轻量筛选（为 Phase2 节点爆炸铺路）----
const relationFilter = ref('全部')
const derivedVisible = ref(true)
const dynastyFilter = ref('全部')
const relationFilterOptions = ['全部', '并称', '师承', '交游', '亲属']
const graphDynastyOptions = computed(() => {
  const set = new Set()
  ;(graphRawData.value.nodes || []).forEach((n) => {
    if (n.dynasty) set.add(n.dynasty)
  })
  const ordered = DYNASTIES.map((d) => d.name).filter((name) => set.has(name))
  const rest = [...set].filter((name) => !ordered.includes(name))
  return ['全部', ...ordered, ...rest]
})
const derivedCount = computed(
  () => (graphRawData.value.edges || []).filter((e) => e.origin === 'derived').length,
)

// ---- 诗人抽屉（点击节点 → 侧栏卡片，跳转详情为次要动作）----
const drawerPoet = ref(null)
const drawerMeta = computed(() => {
  if (!drawerPoet.value) return ''
  return [drawerPoet.value.dynasty, drawerPoet.value.style, drawerPoet.value.birthplace]
    .filter(Boolean)
    .join(' · ')
})
const drawerBio = computed(() => {
  const bio = drawerPoet.value?.bio
  if (!bio) return '生平待考，然其诗已传。'
  return bio.length > 110 ? bio.substring(0, 110) + '…' : bio
})
const drawerRelations = computed(() => {
  if (!drawerPoet.value) return []
  const id = drawerPoet.value.id
  const map = graphNodeMap.value
  return (graphRawData.value.edges || [])
    .filter((e) => e.source === id || e.target === id)
    .map((e) => {
      const other = e.source === id ? e.target : e.source
      return {
        type: e.relationType,
        counterpartName: map[other]?.name || other,
        description: e.description || '',
        derived: e.origin === 'derived',
      }
    })
})
const drawerDynastyStyle = computed(() => ({
  background: dynastyColorOf(drawerPoet.value?.dynastyId),
  color: '#fff',
}))

function openDrawer(nodeId) {
  const node = graphNodeMap.value[nodeId]
  if (!node) return
  const poet = poets.value.find((p) => String(p.id) === String(nodeId)) || {}
  drawerPoet.value = { ...node, bio: poet.biography || '' }
}
const closeDrawer = () => {
  drawerPoet.value = null
}
const goPoetDetail = () => {
  if (drawerPoet.value?.id) {
    router.push(`/poets/${drawerPoet.value.id}`)
    closeDrawer()
  }
}

// ---- 图例/取色工具 ----
const dynastyColorOf = (dynastyId) =>
  DYNASTY_COLORS[Number(dynastyId)] || DYNASTY_FALLBACK_COLOR
const dynastyColorByName = (name) => {
  const n = (graphRawData.value.nodes || []).find((x) => x.dynasty === name)
  return dynastyColorOf(n?.dynastyId)
}
const relationColorOf = (type) => {
  const p = relationPalette()
  return (p[type] || {}).color || '#9a9388'
}
const relationLegend = computed(() => {
  const palette = relationPalette()
  const items = Object.entries(palette).map(([key, st]) => ({
    key,
    label: key,
    color: st.color,
    lineWidth: st.lineWidth,
    dashed: !!st.lineDash,
    arrow: !!st.arrow,
  }))
  if (derivedCount.value) {
    items.push({
      key: 'derived',
      label: '推断',
      color: (palette['交游'] || {}).color || '#9a9388',
      lineWidth: 1,
      dashed: true,
      arrow: false,
    })
  }
  return items
})
const legendDynasties = computed(() => {
  const set = new Set()
  ;(graphRawData.value.nodes || []).forEach((n) => {
    if (n.dynasty) set.add(n.dynasty)
  })
  return DYNASTIES.map((d) => d.name).filter((name) => set.has(name))
})
const legendLineStyle = (lg) => {
  if (lg.arrow) {
    return { background: 'transparent', color: lg.color, fontSize: '13px', lineHeight: 1 }
  }
  return {
    background: lg.dashed
      ? `repeating-linear-gradient(90deg, ${lg.color} 0 5px, transparent 5px 10px)`
      : lg.color,
    height: `${Math.max(2, lg.lineWidth)}px`,
  }
}

const handleGraphResize = () => {
  if (graphInstance && g6Container.value) {
    const width = g6Container.value.clientWidth || 800
    const height = g6Container.value.clientHeight || 600
    graphInstance.setSize(width, height)
  }
}

const initG6 = async () => {
  if (!g6Container.value) return
  if (graphInstance) {
    graphInstance.destroy()
    graphInstance = null
  }
  drawerPoet.value = null

  const currentSeq = ++graphRequestSeq

  const width = g6Container.value.clientWidth || 800
  const height = g6Container.value.clientHeight || 600

  const graphTheme = isAnime.value
    ? {
        edgeColor: '#7a7a7a',
        textPrimary: '#e8e4d8',
        accent: cssVar('--accent'),
        textSecondary: '#9a9484',
        cardBg: '#2a2520',
        nodeStroke: '#c9c2b0',
        lineDash: [4, 4],
      }
    : {
        edgeColor: '#c5b8a5',
        textPrimary: cssVar('--text-primary'),
        accent: cssVar('--accent'),
        textSecondary: '#8a7e6b',
        cardBg: cssVar('--bg-primary'),
        nodeStroke: '#8a7e6b',
        lineDash: [4, 4],
      }

  // 从后端拉真实关系图谱(/api/public/poet-relations), 转 G6 nodes/edges
  graphStatus.value = 'loading'
  let raw = { nodes: [], edges: [] }
  try {
    const g = await api.get('/poet-relations')

    if (currentSeq !== graphRequestSeq) {
      return
    }

    const inNodes = (g && g.nodes) || []
    const inEdges = (g && g.edges) || []

    if (!inNodes.length) {
      graphStatus.value = 'empty'
      return
    }

    // 统计节点度数（全量），用于大小/字号
    const degree = {}
    inEdges.forEach((e) => {
      degree[e.source] = (degree[e.source] || 0) + 1
      degree[e.target] = (degree[e.target] || 0) + 1
    })

    const palette = relationPalette()

    raw = {
      nodes: inNodes.map((n) => {
        const nid = String(n.poetId ?? n.id)
        return {
          id: nid,
          poetId: nid,
          name: n.name,
          label: n.name,
          dynasty: n.dynasty || '未知',
          dynastyId: n.dynastyId ?? null,
          style: n.style || '',
          birthplace: n.birthplace || '',
          size: Math.min(64, 36 + (degree[nid] || 0) * 7),
          labelSize: (degree[nid] || 0) >= 2 ? 13 : 12,
        }
      }),
      edges: inEdges.map((e) => {
        const type = e.relationType || '交游'
        const derived = e.origin === 'derived'
        const st = palette[type] || palette['交游']
        const s = String(e.source)
        const t = String(e.target)
        let arrowAtTarget = false
        let arrowAtSource = false
        if (st.arrow) {
          const key = [Number(s), Number(t)].sort((a, b) => a - b).join('-')
          const mentor = MENTOR_DIRECTION[key]
          // 未收录方向时回退配置默认 source→target
          const mentorId = mentor !== undefined ? String(mentor) : s
          arrowAtTarget = mentorId === s
          arrowAtSource = mentorId === t
        }
        return {
          source: s,
          target: t,
          relationType: type,
          description: e.description || type,
          origin: e.origin || 'seed',
          eStroke: st.color,
          eLineWidth: derived ? 1 : st.lineWidth,
          eLineDash: derived ? [2, 4] : st.lineDash,
          eOpacity: derived ? 0.55 : 1,
          eEndArrow: arrowAtTarget,
          eStartArrow: arrowAtSource,
        }
      }),
    }
    graphRawData.value = raw
  } catch (err) {
    console.error('关系图谱加载失败:', err)
    graphStatus.value = 'error'
    return
  }
  graphStatus.value = 'ready'
  const data = raw

  if (currentSeq !== graphRequestSeq) {
    return
  }

  // 重新检查 container（组件可能已卸载）
  if (!g6Container.value) {
    graphStatus.value = 'idle'
    return
  }

  graphInstance = new Graph({
    container: g6Container.value,
    width,
    height,
    data,
    layout: {
      type: 'force',
      preventOverlap: true,
      nodeSize: 55,
      linkDistance: 180,
      nodeStrength: 30,
      collideStrength: 1,
      alpha: 0.3,
      alphaDecay: 0.02,
      alphaMin: 0.01,
    },
    node: {
      type: 'circle',
      style: (d) => ({
        fill: dynastyColorOf(d.dynastyId),
        stroke: graphTheme.nodeStroke,
        lineWidth: 1.5,
        size: d.size || 50,
      }),
      labelText: (d) => d.label,
      labelPlacement: 'bottom',
      labelOffsetY: 6,
      labelFontSize: (d) => d.labelSize || 13,
      labelFontWeight: 600,
      labelFill: graphTheme.textPrimary,
      state: {
        active: { lineWidth: 3, stroke: graphTheme.accent },
        inactive: { opacity: 0.15 },
      },
    },
    edge: {
      style: (d) => {
        const stroke = d.eStroke || graphTheme.edgeColor
        return {
          stroke,
          lineWidth: d.eLineWidth || 1.5,
          lineDash: d.eLineDash,
          opacity: d.eOpacity ?? 1,
          endArrow: !!d.eEndArrow,
          endArrowType: 'triangle',
          endArrowSize: 9,
          endArrowFill: stroke,
          endArrowStroke: stroke,
          startArrow: !!d.eStartArrow,
          startArrowType: 'triangle',
          startArrowSize: 9,
          startArrowFill: stroke,
          startArrowStroke: stroke,
        }
      },
      // 边标签默认隐藏，仅悬停聚焦态显示 description（减少 clutter）
      labelText: (d) => d.description || '',
      labelAutoRotate: true,
      labelFontSize: 10,
      labelFill: graphTheme.textSecondary,
      labelOpacity: 0,
      labelBackgroundFill: graphTheme.cardBg,
      labelBackgroundPadding: [2, 4],
      labelBackgroundRadius: 2,
      state: {
        active: { opacity: 1, labelOpacity: 1 },
        inactive: { opacity: 0.08 },
      },
    },
    behaviors: [
      'drag-canvas',
      'zoom-canvas',
      'drag-element',
      // 悬停聚焦: 高亮悬停节点及其邻接节点/边, 其余淡化
      { type: 'hover-activate', degree: 1, direction: 'both', inactiveState: 'inactive' },
    ],
  })

  graphInstance.render()

  graphInstance.on('node:click', (evt) => {
    const modelId = evt.target?.id
    if (modelId) openDrawer(modelId)
  })
  graphInstance.on('canvas:click', (evt) => {
    if (evt.targetType === 'canvas') closeDrawer()
  })

  // 主题切换重建后，恢复当前筛选状态（默认全量时跳过，避免二次布局）
  applyGraphFilter()
}

// 按当前 chip 状态裁剪图谱数据并重渲染
const applyGraphFilter = () => {
  if (!graphInstance || graphStatus.value !== 'ready') return
  const { nodes, edges } = graphRawData.value
  if (!nodes.length) return

  const isDefault =
    relationFilter.value === '全部' && derivedVisible.value && dynastyFilter.value === '全部'

  const relOK = (e) => {
    if (relationFilter.value !== '全部' && e.relationType !== relationFilter.value) return false
    if (!derivedVisible.value && e.origin === 'derived') return false
    return true
  }
  const dynOK = (n) => dynastyFilter.value === '全部' || n.dynasty === dynastyFilter.value
  const dynOkIds = new Set(nodes.filter(dynOK).map((n) => n.id))
  const visibleEdges = edges.filter((e) => relOK(e) && dynOkIds.has(e.source) && dynOkIds.has(e.target))
  const touched = new Set()
  visibleEdges.forEach((e) => {
    touched.add(e.source)
    touched.add(e.target)
  })
  const visibleNodes =
    relationFilter.value === '全部'
      ? nodes.filter(dynOK)
      : nodes.filter((n) => dynOK(n) && touched.has(n.id))

  if (isDefault && visibleNodes.length === nodes.length && visibleEdges.length === edges.length) {
    return
  }

  graphInstance.setData({ nodes: visibleNodes, edges: visibleEdges })
  graphInstance.render()
}

watch([relationFilter, derivedVisible, dynastyFilter], () => {
  closeDrawer()
  applyGraphFilter()
})

watch([activeTab, isAnime], () => {
  if (activeTab.value === 'graph') {
    nextTick(() => {
      setTimeout(() => {
        initG6()
      }, 100)
    })
  } else {
    if (graphInstance) {
      graphInstance.destroy()
      graphInstance = null
    }
    graphStatus.value = 'idle'
  }
})

const loadPoets = async () => {
  errorMsg.value = null
  try {
    const { data } = await api.swrGet('/poets', { size: 200 })
    poets.value = data.records || []
    poetsLoaded.value = true
  } catch (e) {
    errorMsg.value = '名士数据加载失败，请稍后重试'
    poetsLoaded.value = true
  }
}

onMounted(async () => {
  window.addEventListener('resize', handleGraphResize)
  await loadPoets()
  await build()
  enrichmentLoaded.value = true
  await nextTick()
  if (revealRoot.value) reveal(revealRoot.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleGraphResize)
  if (graphInstance) {
    graphInstance.destroy()
    graphInstance = null
  }
})
</script>

<style scoped>
.poets-view {
  max-width: 1440px;
  margin: 0 auto;
}
.poets-content {
  padding: 56px 48px 96px;
}

/* ---------- sections ---------- */
.poets-section {
  max-width: 1200px;
  margin: 0 auto 56px;
}
.poets-quote {
  margin-top: 56px;
}
.poets-featured-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* ---------- toolbar ---------- */
.poets-toolbar {
  max-width: 1200px;
  margin: 0 auto 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.layout-toggle-group {
  display: inline-flex;
  gap: 0;
  background: var(--card-bg);
  padding: 4px;
  border-radius: 4px;
  border: 1px solid var(--border);
  align-self: flex-start;
}
.toggle-btn {
  padding: 8px 20px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
  letter-spacing: 1px;
}
.toggle-btn:hover {
  color: var(--text-primary);
  background: color-mix(in srgb, var(--accent) 5%, transparent);
}
.toggle-btn.active {
  background: var(--accent-dark);
  color: #fff;
  box-shadow: 0 2px 6px color-mix(in srgb, var(--accent) 0.2%, transparent);
}

/* ---------- section bar ---------- */
.section-bar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}
.section-bar-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
}
.section-bar-count {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

/* ---------- cards grid ---------- */
.cards-grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}
.poet-card-wrap {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 22px;
  cursor: pointer;
  display: flex;
  gap: 20px;
  text-align: left;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-height: 200px;
}
.poet-card-wrap:hover {
  border-color: var(--accent);
}
.poet-avatar-box {
  position: relative;
  width: 80px;
  height: 104px;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--bg-primary);
}
.theme-inkwash .poet-avatar-box {
  background: #2a2520;
}
.poet-img {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.poet-card-wrap:hover .poet-img {
  transform: scale(1.05);
}
.poet-avatar-stamp {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
}
.theme-real .poet-avatar-stamp {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
}
.poet-stamp {
  position: absolute;
  bottom: 4px;
  right: 4px;
  z-index: 3;
  width: 18px;
  height: 18px;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.poet-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.poet-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.poet-name-tag {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 2px;
  line-height: 1.1;
}
.poet-dynasty-badge {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 1px;
  padding: 2px 8px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border-radius: 2px;
  white-space: nowrap;
}
.poet-biography {
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.poet-biography--empty {
  font-style: italic;
  color: var(--text-muted);
}
.poet-sigline {
  margin: 0 0 12px 0;
  padding: 0;
  border: none;
  flex: 1;
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.7;
  letter-spacing: 1px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.poet-sigline cite {
  font-size: 11px;
  font-style: italic;
  color: var(--text-muted);
  font-weight: 400;
}
.poet-style-box {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 11px;
  border-top: 1px dashed var(--border-light);
  padding-top: 8px;
  margin-top: auto;
}
.style-lbl {
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 1px;
}
.style-val {
  color: var(--text-secondary);
  font-weight: 600;
}

/* ---------- marginal folded ---------- */
.marginal-wrap {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px dashed var(--border-light);
}
.marginal-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  padding: 8px 22px;
  background: var(--card-bg);
  border: 1px dashed var(--border);
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 1px;
  transition: all 0.25s;
}
.marginal-toggle:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}
.marginal-arrow {
  transition: transform 0.25s;
  font-size: 11px;
}
.marginal-arrow.open {
  transform: rotate(180deg);
}
.marginal-grid {
  margin-top: 20px;
}
.is-marginal {
  opacity: 0.85;
}

/* ---------- graph tab ---------- */
.graph-panel-inner {
  padding: 28px;
  display: flex;
  flex-direction: column;
  position: relative;
}
.graph-instructions {
  display: flex;
  align-items: center;
  gap: 14px;
  background: color-mix(in srgb, var(--accent) 4%, transparent);
  border-left: 3px solid var(--accent);
  padding: 12px 18px;
  margin-bottom: 20px;
  border-radius: 0 4px 4px 0;
  text-align: left;
}
.instruction-tag {
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  background: var(--accent);
  padding: 3px 8px;
  border-radius: 2px;
  letter-spacing: 1px;
  flex-shrink: 0;
}
.instruction-desc {
  font-size: 12.5px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* 筛选 chips */
.graph-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 32px;
  margin-bottom: 14px;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.filter-label {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--text-muted);
  flex-shrink: 0;
}
.filter-chip {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.filter-chip:hover {
  color: var(--text-primary);
  border-color: var(--accent);
}
.filter-chip.active {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  border-color: var(--accent);
  color: var(--text-primary);
  font-weight: 600;
}
.filter-chip--derived {
  opacity: 0.9;
}

/* 图谱画布与抽屉舞台 */
.graph-stage {
  position: relative;
}
.g6-container-canvas {
  width: 100%;
  height: 560px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--card-bg);
}

/* 诗人抽屉（点击节点弹出） */
.graph-drawer {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 264px;
  max-height: calc(100% - 24px);
  overflow-y: auto;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 18px;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 6%, rgba(0, 0, 0, 0.35));
  z-index: 2;
}
.drawer-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 4px;
}
.drawer-close:hover {
  color: var(--accent);
}
.drawer-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  padding-right: 20px;
}
.drawer-name {
  font-family: var(--font-heading);
  font-size: 18px;
  letter-spacing: 2px;
  margin: 0;
  color: var(--text-primary);
}
.drawer-dynasty {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 1px;
  flex-shrink: 0;
}
.drawer-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 10px;
  line-height: 1.6;
}
.drawer-bio {
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 14px;
}
.drawer-relations {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.drawer-relation {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 12px;
}
.dr-type {
  flex-shrink: 0;
  padding: 1px 6px;
  border: 1px solid;
  border-radius: 3px;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--text-primary);
}
.dr-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dr-who {
  font-weight: 600;
  color: var(--text-primary);
}
.dr-desc {
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
}
.drawer-relations--empty {
  color: var(--text-muted);
  font-size: 12px;
}
.drawer-primary {
  width: 100%;
  padding: 9px 0;
  border: 1px solid var(--accent);
  border-radius: 3px;
  background: transparent;
  color: var(--accent);
  font-size: 13px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}
.drawer-primary:hover {
  background: var(--accent);
  color: #fff;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

/* 双图例: 关系类型 + 朝代 */
.graph-legend {
  display: flex;
  gap: 24px;
  padding: 14px 0 0;
  border-top: 1px dashed var(--border-light);
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}
.legend-group {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.legend-group + .legend-group {
  border-left: 1px solid var(--border-light);
  padding-left: 24px;
}
.legend-group-title {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--text-muted);
  margin-right: 2px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 1px;
}
.legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid currentColor;
  flex-shrink: 0;
}
.legend-line {
  width: 22px;
  height: auto;
  border: none;
  border-radius: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.legend-dot {
  width: 12px;
  height: 12px;
  border: none;
}

/* graph loading / empty status */
.graph-status-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 560px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--card-bg);
  gap: 16px;
}
.graph-status-box--skel {
  padding: 24px;
  align-items: stretch;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.tab-fade-enter-from { opacity: 0; transform: translateY(8px); }
.tab-fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* ---------- responsive ---------- */
@media (min-width: 1600px) {
  .poets-view { max-width: 1560px; }
}
@media (max-width: 1024px) {
  .poets-content { padding: 40px 32px 80px; }
  .poets-featured-grid { grid-template-columns: repeat(2, 1fr); }
  .cards-grid-list { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
}
@media (max-width: 640px) {
  .poets-content { padding: 32px 16px 64px; }
  .poets-section { margin-bottom: 40px; }
  .poets-featured-grid { grid-template-columns: 1fr; }
  .poet-card-wrap { padding: 16px; gap: 14px; min-height: 180px; }
  .poet-avatar-box { width: 64px; height: 84px; }
  .poet-avatar-stamp { font-size: 28px; }
  .poet-name-tag { font-size: 18px; }
  .g6-container-canvas { height: 440px; }
  .graph-status-box { height: 440px; }
  .graph-legend { flex-wrap: wrap; gap: 12px 18px; }
  .legend-group + .legend-group { border-left: none; padding-left: 0; }
  .graph-instructions { flex-direction: column; align-items: flex-start; gap: 8px; }
  .graph-drawer { width: 230px; padding: 14px; }
}
</style>
