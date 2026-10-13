<template>
  <div class="poets-view folio-page">
    <PageHeading eyebrow="诗文名士 / 齐鲁名士" :title="region ? `${region}名士，循文脉而行` : '山河之间，遇见故人'" description="按姓名与朝代寻找名士，读生平、品诗文，也可从关系图谱展开探索。">
      <template #actions><router-link :to="atlasLink('/poems', route)" class="folio-button folio-button--quiet">检索诗词 ↗</router-link></template>
    </PageHeading>
    <div ref="revealRoot" class="poets-content">
      <form class="folio-toolbar" role="search" @submit.prevent="searchPoets">
        <label class="folio-field folio-field--search">查找名士<input v-model="poetSearchInput" class="folio-input" type="search" placeholder="输入姓名、字号或生平关键词" /></label>
        <div class="folio-actions"><button type="submit" class="folio-button folio-button--primary">查找名士</button><button type="button" class="folio-button folio-button--quiet" :disabled="!poetSearchInput && selectedDynastyId == null && !region" @click="clearPoetFilters">清除条件</button></div>
      </form>
      <p v-if="region" class="poets-region-note">当前城市 · {{ region }} <button type="button" class="folio-button folio-button--quiet" @click="clearRegion">查看全部城市</button></p>
      <section class="poets-toolbar" aria-label="名士浏览方式">
        <DynastyRail
          :dynasties="dynastyItems"
          :model-value="selectedDynastyId"
          aria-label="按朝代筛选名士"
          @update:model-value="selectDynasty"
        />
        <div class="layout-toggle-group folio-tabs" role="tablist" aria-label="文人廊视图切换">
          <button
            class="toggle-btn"
            :class="{ active: activeTab === 'gallery' }"
            role="tab"
            :aria-selected="activeTab === 'gallery'"
            @click="setTab('gallery')"
          >
            书卷长廊
          </button>
          <button
            class="toggle-btn"
            :class="{ active: activeTab === 'graph' }"
            role="tab"
            :aria-selected="activeTab === 'graph'"
            @click="setTab('graph')"
          >
            关系图谱
          </button>
          <button
            class="toggle-btn"
            :class="{ active: activeTab === 'all' }"
            role="tab"
            :aria-selected="activeTab === 'all'"
            @click="setTab('all')"
          >
            全名录
          </button>
        </div>
      </section>

      <Transition name="tab-fade" mode="out-in">
        <div v-if="activeTab === 'gallery'" key="gallery" class="gallery-tab-content">
          <!-- 本期名士（传世最丰者，大卡） -->
          <section v-if="featuredPoets.length" class="poets-section poets-featured" data-reveal>
            <SectionHeading
              eyebrow="本期名士"
              :title="previewMode ? '名士选读' : '传世最丰'"
              :subtitle="previewMode ? '以四位名士的生平与选文，预览文人长廊'
                : selectedDynastyId == null
                ? '诗篇传世最多的齐鲁文人，附其代表句'
                : `${selectedDynastyName} · 诗篇传世最多`"
            />
            <div class="poets-featured-grid">
              <FeaturedPoetCard
                v-for="p in featuredPoets"
                :key="p.id"
                :poet="p"
                :dynasty-name="getDynastyName(p.dynastyId)"
                :count-suffix="previewMode ? '篇样本文选' : undefined"
                @click="openPoet(p.id)"
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
            <div v-if="!poetsLoaded" class="cards-grid-list folio-grid" aria-busy="true" aria-label="名士加载中">
              <SkeletonBlock v-for="i in 6" :key="`skel-${i}`" height="180px" />
            </div>

            <div class="cards-grid-list folio-grid" v-else-if="standardPoets.length">
              <article
                v-for="p in standardPoets"
                :key="p.id"
                class="poet-card-wrap card hover-lift"
                tabindex="0"
                role="link"
                @click="openPoet(p.id)"
                @keydown.enter="openPoet(p.id)"
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
                    @error="onAvatarError(p.id)"
                  />
                  <span v-else class="poet-avatar-stamp">{{ p.name ? p.name.charAt(0) : '文' }}</span>
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
                    <span class="style-lbl">{{ previewMode ? '样本' : '传世' }}</span>
                    <span class="style-val">{{ p.poemCount || 0 }} 篇</span>
                  </div>
                </div>
              </article>
            </div>

            <EmptyState
              v-if="poetsLoaded && !filteredEnrichedPoets.length"
              icon="名"
              message="没有找到符合条件的名士"
              hint="清除关键词或切换朝代，再看看其他名士"
            />

            <!-- 折叠: 信息待考的名士(完整度<40), 默认收起 -->
            <div v-if="marginalPoets.length" class="marginal-wrap">
              <button class="marginal-toggle" @click="showMarginal = !showMarginal">
                {{ showMarginal ? '收起' : '展开' }}更多 {{ marginalPoets.length }} 位(信息待考)
                <span class="marginal-arrow" :class="{ open: showMarginal }">▾</span>
              </button>
              <Transition name="tab-fade">
                <div v-show="showMarginal" class="cards-grid-list marginal-grid folio-grid">
                  <article
                    v-for="p in marginalPoets"
                    :key="p.id"
                    class="poet-card-wrap card hover-lift is-marginal"
                    tabindex="0"
                    role="link"
                    @click="openPoet(p.id)"
                    @keydown.enter="openPoet(p.id)"
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
                        @error="onAvatarError(p.id)"
                      />
                      <span v-else class="poet-avatar-stamp">{{ p.name ? p.name.charAt(0) : '文' }}</span>
                      <span class="poet-stamp">文</span>
                    </div>
                    <div class="poet-card-body">
                      <div class="poet-title-row">
                        <h3 class="poet-name-tag">{{ p.name }}</h3>
                        <span class="poet-dynasty-badge">{{ getDynastyName(p.dynastyId) }}</span>
                      </div>
                      <p class="poet-biography poet-biography--empty">生平待考，然其诗已传。</p>
                      <div class="poet-style-box">
                        <span class="style-lbl">{{ previewMode ? '样本' : '传世' }}</span>
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

            <div v-if="!poetsLoaded" class="cards-grid-list folio-grid" aria-busy="true" aria-label="名士加载中">
              <SkeletonBlock v-for="i in 6" :key="`skel-${i}`" height="180px" />
            </div>

            <div class="cards-grid-list folio-grid" v-else-if="filteredEnrichedPoets.length">
              <article
                v-for="p in filteredEnrichedPoets"
                :key="p.id"
                class="poet-card-wrap card hover-lift"
                tabindex="0"
                role="link"
                @click="openPoet(p.id, 'all')"
                @keydown.enter="openPoet(p.id, 'all')"
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
                    @error="onAvatarError(p.id)"
                  />
                  <span v-else class="poet-avatar-stamp">{{ p.name ? p.name.charAt(0) : '文' }}</span>
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
                    <span class="style-lbl">{{ previewMode ? '样本' : '传世' }}</span>
                    <span class="style-val">{{ p.poemCount || 0 }} 篇</span>
                  </div>
                </div>
              </article>
            </div>

            <EmptyState
              v-if="poetsLoaded && !filteredEnrichedPoets.length"
              icon="名"
              :message="previewMode ? '暂无符合条件的名士预览样本' : region ? `${region}暂无符合条件的已发布名士` : '该朝代暂无收录诗人'"
              hint="可更换朝代或清除条件"
            />
          </section>
        </div>

        <div v-else-if="previewMode" key="graph-preview" class="graph-tab-content">
          <EmptyState icon="谱" message="预览暂不包含关系数据" hint="可切换书卷长廊或全名录，阅读四位名士的设计样本" />
        </div>

        <!-- 关系图谱 (AntV G6) -->
        <div v-else key="graph" class="graph-tab-content">
          <div class="graph-panel-inner card graph-panel-layout">
            <header class="graph-heading">
              <div><span class="graph-eyebrow">文人之间</span><h2>循一条线，读一段文脉</h2><p>并称、师承、交游与亲缘，串起名字背后的相遇。</p></div>
              <p v-if="graphStatus === 'ready'" class="graph-totals"><strong>{{ graphVisibleCounts.nodes }}</strong> 位名士<span>／</span><strong>{{ graphVisibleCounts.edges }}</strong> 条关系</p>
            </header>
            <div v-if="graphStatus === 'ready'" class="graph-controls">
              <div class="graph-filters">
                <div class="filter-group"><span class="filter-label">关系</span><button v-for="rt in relationFilterOptions" :key="rt" class="filter-chip" :class="{ active: relationFilter === rt }" :aria-pressed="relationFilter === rt" @click="relationFilter = rt">{{ rt }}</button></div>
                <div class="filter-group"><span class="filter-label">朝代</span><button v-for="d in graphDynastyOptions" :key="d" class="filter-chip" :class="{ active: dynastyFilter === d }" :aria-pressed="dynastyFilter === d" @click="setGraphDynasty(d)">{{ d }}</button></div>
              </div>
              <div class="graph-options"><label v-if="derivedCount"><input v-model="derivedVisible" type="checkbox" />包含推断关系 <span>{{ derivedCount }}</span></label><label><input v-model="edgeLabelsVisible" type="checkbox" />显示关系名称</label></div>
            </div>

            <!-- 图谱画布(常驻挂载, 保证容器可测量) + 状态浮层 + 诗人抽屉 -->
            <div class="graph-main">
              <div class="graph-stage">
                <div ref="g6Container" class="g6-container-canvas"></div>

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

                <div v-else-if="graphStatus === 'ready' && graphFilterEmpty" class="graph-status-box" role="status">
                  <EmptyState icon="谱" :message="graphFilterEmptyMessage" hint="可清除城市条件，或更换朝代与关系筛选" />
                </div>

                <div v-if="graphStatus === 'ready' && !graphFilterEmpty" class="graph-viewport-tools" aria-label="图谱视图操作"><button aria-label="缩小图谱" @click="zoomGraph(0.8)">−</button><button aria-label="放大图谱" @click="zoomGraph(1.25)">＋</button><button @click="fitGraph">完整图谱</button></div>
                <p class="graph-stage-hint">拖拽移动 · Ctrl＋滚轮缩放 · 点击姓名读关系</p>
              </div>
              <aside v-if="!drawerPoet" class="graph-reading-panel">
                <span class="graph-eyebrow">读谱起笔</span><h3>从一个名字开始</h3><p>点击姓名，看看与他相连的人。</p>
                <div class="graph-entry-poets"><button v-for="poet in graphEntryPoets" :key="poet.id" @click="openDrawer(poet.id)"><span>{{ poet.name }}</span><small>{{ poet.dynasty }}</small><span aria-hidden="true">↗</span></button></div>
                <div class="graph-side-legend"><h4>线的含义</h4><div v-for="lg in relationLegend" :key="lg.key" class="legend-item"><span class="legend-swatch legend-line" :style="legendLineStyle(lg)">{{ lg.arrow ? '→' : '' }}</span>{{ lg.label }}<small v-if="lg.arrow">师 → 徒</small><small v-if="lg.key === 'derived'">待考</small></div><h4>名字的朝代</h4><div class="graph-dynasty-key"><span v-for="d in legendDynasties" :key="d"><i :style="{ background: dynastyColorByName(d) }"></i>{{ d }}</span></div></div>
              </aside>
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
                        <span class="dr-type" :style="{ borderColor: relationColorOf(rel.type) }">{{ rel.type }}<small v-if="rel.derived"> · 推断</small></span>
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
import { pickSignaturePoem } from '../utils/poem'
import PageHeading from '../components/ui/PageHeading.vue'
import { isAtlasPreview, atlasLink, previewPoets, previewDynasties } from '../config/atlasPreview'
import InkHero from '../components/homepage/InkHero.vue'
import SectionHeading from '../components/homepage/SectionHeading.vue'
import FeaturedPoetCard from '../components/homepage/FeaturedPoetCard.vue'
import DynastyRail from '../components/homepage/DynastyRail.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import EmptyState from '../components/homepage/EmptyState.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'

const router = useRouter()
const route = useRoute()
const previewMode = computed(() => isAtlasPreview(route))
const region = computed(() => typeof route.query.region === 'string' ? route.query.region.trim().replace(/市$/, '') : '')
const clearRegion = () => router.replace({ query: { ...route.query, region: undefined } })
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
const dynastyReference = computed(() => previewMode.value
  ? previewDynasties.map((dynasty) => ({ ...dynasty, start: dynasty.startYear, end: dynasty.endYear }))
  : DYNASTIES)

const openPoet = (id, from) => {
  const target = atlasLink(`/poets/${id}`, route)
  const destination = typeof target === 'string' ? { path: target } : target
  return router.push({ ...destination, query: { ...destination.query, ...(from ? { from } : {}), returnTo: route.fullPath } })
}

// tab 状态与 URL 双向同步: ?view=gallery|all|graph, 刷新/直达/前进后退均保持
const VALID_VIEWS = ['gallery', 'all', 'graph']
const activeTab = ref(VALID_VIEWS.includes(route.query.view) ? route.query.view : 'gallery')
const setTab = (v) => {
  if (!VALID_VIEWS.includes(v)) v = 'gallery'
  activeTab.value = v
  if (route.query.view !== v) {
    router.replace({ query: { ...route.query, view: v } }).catch(() => {})
  }
}
watch(
  () => route.query.view,
  (v) => {
    const next = VALID_VIEWS.includes(v) ? v : 'gallery'
    if (next !== activeTab.value) activeTab.value = next
  },
)
const selectedDynastyId = ref(null)

// 朝代筛选与 URL 双向同步: ?dynasty=<id>, 刷新/前进后退均保持; 非法值回退"全部"
const initDynastyFromQuery = () => {
  const q = Number(route.query.dynasty)
  selectedDynastyId.value = dynastyReference.value.some((d) => d.id === q) ? q : null
}
initDynastyFromQuery()

// 顶部朝代线点击(与图谱 tab 共用这一入口)
const selectDynasty = (id) => {
  const next = id == null ? null : Number(id)
  selectedDynastyId.value = next
  const query = { ...route.query }
  if (next == null) delete query.dynasty
  else query.dynasty = String(next)
  router.replace({ query }).catch(() => {})
  // 列表视图下滚回内容区顶部, 让筛选结果立即可见(图谱 tab 原地更新不滚动)
  if (activeTab.value !== 'graph') {
    revealRoot.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }
}
watch(
  () => route.query.dynasty,
  () => {
    const q = Number(route.query.dynasty)
    const next = dynastyReference.value.some((d) => d.id === q) ? q : null
    if (next !== selectedDynastyId.value) selectedDynastyId.value = next
  },
)
const poets = ref([])
const poetsLoaded = ref(false)
const enrichmentLoaded = ref(false)
const errorMsg = ref(null)
const revealRoot = ref(null)
let rosterRequestSeq = 0

// ---- 朝代相关 ----
const getDynastyName = (id) => dynastyReference.value.find((d) => d.id === id)?.name || '古代'
const countByDynasty = (id) => poets.value.filter((p) => p.dynastyId === id).length

const dynastyItems = computed(() => [
  { id: null, name: '全部', poetCount: poets.value.length },
  ...dynastyReference.value.map((d) => ({
    id: d.id,
    name: d.name,
    startYear: d.start,
    endYear: d.end,
    poetCount: countByDynasty(d.id),
  })).filter((d) => d.poetCount > 0),
])

const selectedDynastyName = computed(() => {
  const city = region.value ? `${region.value} · ` : ''
  if (selectedDynastyId.value == null) return city + '全部名士'
  return city + getDynastyName(selectedDynastyId.value) + '名士'
})

// ---- enrichment ----
const poetSearchInput = ref(typeof route.query.keyword === 'string' ? route.query.keyword : '')
const searchPoets = () => router.replace({ query: { ...route.query, view: 'all', keyword: poetSearchInput.value.trim() || undefined } })
const clearPoetFilters = () => { poetSearchInput.value = ''; router.replace({ query: { ...route.query, keyword: undefined, dynasty: undefined, region: undefined } }) }
watch(() => route.query.keyword, value => { poetSearchInput.value = typeof value === 'string' ? value : '' })
const enrichedPoets = computed(() => (previewMode.value ? poets.value : poets.value.map((p) => enrich(p))).filter(p => !route.query.keyword || `${p.name} ${p.zi || ''} ${p.hao || ''} ${p.biography || ''}`.includes(String(route.query.keyword))))
const filteredEnrichedPoets = computed(() => {
  if (selectedDynastyId.value == null) return enrichedPoets.value
  return enrichedPoets.value.filter((p) => p.dynastyId === selectedDynastyId.value)
})

// 卡墙常规层(完整度 40-69): 默认展示
const standardPoets = computed(() => previewMode.value
  ? filteredEnrichedPoets.value.filter((poet) => !featuredPoets.value.some((featured) => featured.id === poet.id))
  : filteredEnrichedPoets.value.filter((p) => {
    const c = p.completeness ?? 0
    return c >= 40 && c < 70
  }),
)
// 卡墙折叠层(完整度 <40): 信息薄, 默认收起
const marginalPoets = computed(() => previewMode.value
  ? []
  : filteredEnrichedPoets.value.filter((p) => (p.completeness ?? 0) < 40),
)
const showMarginal = ref(false)

const featuredPoets = computed(() => {
  // 尊重朝代筛选: 选中朝代时仅在改朝内取"传世最丰"(此前直接全量, 点朝代后大卡不变 → "没筛选"的错觉)
  const pool =
    selectedDynastyId.value == null
      ? enrichedPoets.value
      : enrichedPoets.value.filter((p) => p.dynastyId === selectedDynastyId.value)
  if (previewMode.value) return pool.slice(0, 2)
  const premium = [...pool]
    .filter((p) => (p.completeness ?? 0) >= 70)
    .sort((a, b) => (b.poemCount || 0) - (a.poemCount || 0))
  if (premium.length) return premium.slice(0, 6)
  return [...pool]
    .sort((a, b) => (b.poemCount || 0) - (a.poemCount || 0))
    .slice(0, 3)
})

const statsReady = computed(() => poetsLoaded.value && enrichmentLoaded.value)
const heroStats = computed(() => {
  if (!statsReady.value) return []
  const totalPoems = (previewMode.value ? poets.value : Object.values(enrichMap.value)).reduce(
    (s, e) => s + (e.poemCount || 0),
    0,
  )
  const dynastiesWithPoets = dynastyReference.value.filter((d) => countByDynasty(d.id) > 0).length
  const withBio = poets.value.filter((p) => p.biography && p.biography.trim()).length
  return [
    { value: poets.value.length, suffix: '位', label: '齐鲁名士' },
    { value: dynastiesWithPoets, suffix: '朝', label: '跨越朝代' },
    { value: totalPoems, suffix: '篇', label: previewMode.value ? '样本文选' : '传世诗卷' },
    { value: withBio, suffix: '位', label: '有传可考' },
  ]
})

// ---- 头像 ----
const failedAvatarIds = ref(new Set())
const getPoetAvatar = (poet) => {
  if (!poet || failedAvatarIds.value.has(String(poet.id))) return ''
  const url = poet.avatarUrl
  return url ? getImageUrl(url, isAnime.value) : ''
}
const onAvatarError = (id) => {
  failedAvatarIds.value = new Set([...failedAvatarIds.value, String(id)])
}

// ==========================================
// AntV G6 Graph — 关系图谱（视觉增强版）
// ==========================================
const g6Container = ref(null)
// graphStatus: 'idle' | 'loading' | 'empty' | 'error' | 'ready'
const graphStatus = ref('idle')
const graphFilterEmpty = ref(false)
const graphFilterEmptyMessage = computed(() => `${region.value}暂无符合筛选条件的关系数据`)
let graphInstance = null
let graphRequestSeq = 0
// 画布 Ctrl+滚轮缩放监听的清理句柄(随 graph 生命周期挂载/卸载)
let disposeGraphWheel = null
const clearGraphWheel = () => {
  if (disposeGraphWheel) {
    disposeGraphWheel()
    disposeGraphWheel = null
  }
}
// 防御性销毁: 图谱卸载异常不能阻塞路由过渡(否则 out-in 过渡卡死, 新页面空白)
// 销毁同时使在途的 initG6 请求作废(seq 递增), 避免请求返回后向已卸载容器建图
const safeDestroyGraph = () => {
  graphRequestSeq++
  graphFilterEmpty.value = false
  if (graphInstance) {
    try {
      graphInstance.destroy()
    } catch (err) {
      console.error('图谱销毁异常(已忽略):', err)
    }
    graphInstance = null
  }
}

// ---- 关系类型视觉编码（Phase2 派生边/新类型在此扩展）----
// 并称: 朱红实线；关系说明在侧栏阅读，画布保持简洁
// 师承: 唯一有向关系，mentor→student 箭头；方向查 MENTOR_DIRECTION，未收录时回退 source→target
// 交游: 细实线（日常交往）
// 亲属: 短虚线（血缘纽带）
const RELATION_STYLES = {
  real: {
    并称: { color: '#b8860b', lineWidth: 2, double: true },
    师承: { color: '#4f8377', lineWidth: 1.4, arrow: true, dir: 'source→target' },
    交游: { color: '#9a8f7d', lineWidth: 1.5 },
    亲属: { color: '#b87f7f', lineWidth: 1.5, lineDash: [5, 4] },
  },
  inkwash: {
    并称: { color: '#d9a441', lineWidth: 2, double: true },
    师承: { color: '#7fae9f', lineWidth: 1.4, arrow: true, dir: 'source→target' },
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
const graphVisibleCounts = ref({ nodes: 0, edges: 0 })
const graphVisibleNodes = ref([])
const graphEntryPoets = computed(() => graphVisibleNodes.value
  .filter(n => dynastyFilter.value === '全部' || n.dynasty === dynastyFilter.value)
  .slice().sort((a, b) => b.degree - a.degree).slice(0, 5))
const fitGraph = () => graphInstance?.fitView()
const zoomGraph = (factor) => { if (graphInstance) graphInstance.zoomTo(Math.min(2.5, Math.max(0.25, graphInstance.getZoom() * factor))) }
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
// 图谱朝代筛选与顶部 DynastyRail 共用 selectedDynastyId 单一数据源(图谱侧按朝代名匹配)
const dynastyFilter = computed(() =>
  selectedDynastyId.value == null ? '全部' : getDynastyName(selectedDynastyId.value),
)
const setGraphDynasty = (name) => {
  const id = name === '全部' ? null : dynastyReference.value.find((x) => x.name === name)?.id ?? null
  selectDynasty(id)
}
const relationFilterOptions = ['全部', '并称', '师承', '交游', '亲属']
// 连线关系说明文字开关（默认关: 悬停聚焦可见; 开启后常显）
const edgeLabelsVisible = ref(false)
const graphDynastyOptions = computed(() => {
  const set = new Set()
  ;(graphRawData.value.nodes || []).forEach((n) => {
    if (n.dynasty) set.add(n.dynasty)
  })
  const ordered = dynastyReference.value.map((d) => d.name).filter((name) => set.has(name))
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
  return [drawerPoet.value.dynasty, drawerPoet.value.literaryStyle, drawerPoet.value.birthplace]
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
    openPoet(drawerPoet.value.id)
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
  return dynastyReference.value.map((d) => d.name).filter((name) => set.has(name))
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
    fitGraph()
  }
}

const initG6 = async () => {
  if (previewMode.value) {
    clearGraphWheel()
    safeDestroyGraph()
    graphRawData.value = { nodes: [], edges: [] }
    graphStatus.value = 'empty'
    closeDrawer()
    return
  }
  if (!g6Container.value) return
  clearGraphWheel()
  safeDestroyGraph()
  drawerPoet.value = null

  const currentSeq = ++graphRequestSeq

  const width = g6Container.value.clientWidth || 800
  const height = g6Container.value.clientHeight || 600

  const graphTheme = {
    edgeColor: '#b5aa97', textPrimary: '#352f27', accent: '#ac5143',
    accentText: '#9c4035', textSecondary: '#766e61', cardBg: '#f8f5ee', nodeStroke: '#d3c7b5',
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

    // 统计节点度数（全量），用于节点大小与阅读入口排序
    const degree = {}
    inEdges.forEach((e) => {
      degree[e.source] = (degree[e.source] || 0) + 1
      degree[e.target] = (degree[e.target] || 0) + 1
    })

    const palette = relationPalette()

    raw = {
      nodes: inNodes.map((n) => {
        const nid = String(n.poetId ?? n.id)
        const dynasty = n.dynasty || '未知'
        return {
          id: nid,
          poetId: nid,
          name: n.name,
          dynasty,
          dynastyId: n.dynastyId ?? null,
          literaryStyle: n.style || '',
          birthplace: n.birthplace || '',
          size: Math.min(76, 58 + (degree[nid] || 0) * 3),
          degree: degree[nid] || 0,
        }
      }),
      edges: inEdges.map((e, i) => {
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
          id: `rel-${i}`,
          source: s,
          target: t,
          relationType: type,
          description: e.description || type,
          origin: e.origin || 'seed',
          eStroke: st.color,
          eLineWidth: derived ? 1 : st.lineWidth,
          eLineDash: derived ? [2, 4] : st.lineDash,
          eOpacity: derived ? 0.4 : 0.65,
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
  graphVisibleNodes.value = raw.nodes
  graphVisibleCounts.value = { nodes: raw.nodes.length, edges: raw.edges.length }
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
    autoFit: 'view',
    padding: [48, 52, 64, 52],
    animation: false,
    layout: {
      type: 'force',
      // G6 v5 'force' = 经典力导向(库伦斥力+胡克引力):
      // nodeStrength 正数=斥力(默认1000, 旧值30过弱致聚团); 度数越高斥力略增
      nodeStrength: (d) => 500 + (d.degree || 0) * 80,
      // nodeSize 按真实节点尺寸+标签区占位(直径口径, collide 半径=size/2), 防叠真正生效
      nodeSize: (d) => (d.size || 50) + 26,
      preventOverlap: true,
      collideStrength: 1,
      // 保留姓名与朝代的呼吸空间，再由 autoFit 适配全图
      linkDistance: (_d, s, t) =>
        140 + Math.max(0, (s?.size || 58) - 58) + Math.max(0, (t?.size || 58) - 58),
      // 向心锚定画布中心, 不漂移(经典实现原生参数; alpha* 为 d3-force 专属故移除)
      gravity: 10,
      center: [width / 2, height / 2],
    },
    node: {
      type: 'circle',
      style: (d) => ({
        fill: '#faf7f0',
        stroke: dynastyColorOf(d.dynastyId),
        lineWidth: 1.8,
        size: d.size || 58,
        opacity: 1,
        cursor: 'pointer',
        labelText: d.name?.replaceAll('·', '\n'),
        labelPlacement: 'center',
        labelFontFamily: '"Noto Serif SC", "Songti SC", serif',
        labelFontSize: 18,
        labelLineHeight: 20,
        labelFontWeight: 600,
        labelFill: graphTheme.textPrimary,
        labelOpacity: 1,
        labelBackground: false,
        badges: [{ text: d.dynasty, placement: 'bottom', offsetY: 10, fontSize: 10, fill: graphTheme.textSecondary, background: false, padding: 0 }],
      }),
      state: {
        // 聚焦态: 光晕+粗描边提亮节点本体(不改 fill, 保留朝代色维度); 标签同时变色加粗放大
        active: {
          lineWidth: 2.5,
          stroke: graphTheme.accent,
          shadowColor: graphTheme.accent,
          shadowBlur: 0,
          labelFill: graphTheme.accentText,
          labelFontWeight: 700,
          labelFontSize: 19,
        },
        // 淡化态: 元素级 opacity 会随 Group 级联到 label/badge, 无需再叠 labelOpacity(避免双重衰减)
        inactive: { opacity: 0.6 },
      },
    },
    edge: {
      // 注意: G6 v5 只读取 edge 配置的 style/state/palette 等键,
      // 顶层平铺的 label* 键不会进入样式合并链(死配置), 标签样式必须写在 style 回调里。
      // 运行时切换仍由 applyEdgeLabelVisibility 走 updateEdgeData(数据层样式)实现。
      style: (d) => {
        const stroke = d.eStroke || graphTheme.edgeColor
        return {
          stroke,
          lineWidth: d.eLineWidth || 1.5,
          lineDash: d.eLineDash,
          opacity: d.eOpacity ?? 1,
          endArrow: !!d.eEndArrow,
          endArrowType: 'triangle',
          endArrowSize: 5,
          endArrowFill: stroke,
          endArrowStroke: stroke,
          startArrow: !!d.eStartArrow,
          startArrowType: 'triangle',
          startArrowSize: 5,
          startArrowFill: stroke,
          startArrowStroke: stroke,
          // 关系说明默认隐藏(受「关系说明」开关控制常显); labelText 常驻非空,
          // 关闭时 hover 聚焦态(active labelOpacity:1)仍可临时显示
          labelText: d.relationType || '',
          labelAutoRotate: false,
          labelFontSize: 10,
          labelFill: graphTheme.textSecondary,
          labelOpacity: edgeLabelsVisible.value ? 1 : 0,
          labelBackgroundFill: graphTheme.cardBg,
          labelBackgroundPadding: [3, 5],
          labelBackgroundRadius: 2,
        }
      },
      state: {
        active: { opacity: 1, labelOpacity: 1 },
        inactive: { opacity: 0.08 },
      },
    },
    behaviors: [
      'drag-canvas',
      // 仅保留触屏双指缩放; 滚轮缩放改由下方自管监听实现(Ctrl+滚轮),
      // 避免 zoom-canvas 的 preventDefault 拦截普通滚轮导致页面无法滚动
      { type: 'zoom-canvas', trigger: ['pinch'] },
      'drag-element',
      // 悬停聚焦: 高亮悬停节点及其邻接节点/边, 其余淡化
      { type: 'hover-activate', degree: 1, direction: 'both', inactiveState: 'inactive' },
    ],
  })

  const renderedGraph = graphInstance
  try {
    await renderedGraph.render()
  } catch (err) {
    if (currentSeq !== graphRequestSeq) return
    graphStatus.value = 'error'
    console.error('关系图谱渲染失败:', err)
    return
  }
  if (currentSeq !== graphRequestSeq || graphInstance !== renderedGraph) return

  graphInstance.on('node:click', (evt) => {
    const modelId = evt.target?.id
    if (modelId) openDrawer(modelId)
  })
  graphInstance.on('canvas:click', (evt) => {
    if (evt.targetType === 'canvas') closeDrawer()
  })

  // 兜底: 指针移出窗口等场景可能丢失 element pointerleave, 悬停态残留导致全图卡灰;
  // 指针回到画布空白处时清扫所有残留的 active/inactive 状态。
  // 注意必须限定 targetType==='canvas': 否则悬停节点/边上触发的 pointermove
  // 会把 hover-activate 刚设置的 active/inactive 状态一并清掉, 悬停聚焦失效
  graphInstance.on('canvas:pointermove', (evt) => {
    if (evt.targetType !== 'canvas') return
    const leftovers = {}
    // 注意: getElementData(参数) 的参数是元素 ID 而非类型, 取全部元素须用
    // getNodeData()/getEdgeData()(无参) —— 误传 'node'/'edge' 会抛
    // "Unknown element type of id: node/edge"
    ;[...graphInstance.getNodeData(), ...graphInstance.getEdgeData()].forEach((d) => {
      if (d && d.id && (graphInstance.getElementState(d.id) || []).length) {
        leftovers[d.id] = []
      }
    })
    const keys = Object.keys(leftovers)
    if (keys.length) graphInstance.setElementState(leftovers)
  })

  // Ctrl/Cmd+滚轮才缩放图谱; 普通滚轮不做拦截, 交还页面滚动(修复滚轮劫持)
  const wheelEl = g6Container.value
  const onGraphWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    if (!graphInstance) return
    const zoom = graphInstance.getZoom()
    graphInstance.zoomTo(zoom * (1 - e.deltaY * 0.0022))
  }
  wheelEl.addEventListener('wheel', onGraphWheel, { passive: false })
  disposeGraphWheel = () => wheelEl.removeEventListener('wheel', onGraphWheel)

  // 节点 hover 生平 tooltip（纯增强: 图谱接口无 biography, 复用 /poets 列表数据）
  // 注意: G6 v5 插件必须由 Graph 注入 context 构造, 以选项对象形式交给 setPlugins,
  // 直接 new Tooltip({...}) 会导致 context.canvas 为 undefined 在构造期抛 TypeError
  graphInstance.setPlugins((plugins) => [
    ...plugins,
    {
      type: 'tooltip',
      key: 'poet-bio-tooltip',
      offset: [14, 14],
      // 外层 .tooltip 包装默认白底, 覆盖为透明, 视觉完全交给 getContent 的内联样式
      style: {
        '.tooltip': {
          visibility: 'hidden',
          background: 'transparent',
          padding: '0',
          border: 'none',
          boxShadow: 'none',
        },
      },
      enable: (evt) => evt.targetType === 'node',
      getContent: (_evt, items) => {
        const n = items && items[0]
        if (!n || !n.id) return null
        const poet = poets.value.find((p) => String(p.id) === String(n.id)) || {}
        const bio = poet.biography || ''
        const bioText = bio
          ? bio.length > 60
            ? bio.substring(0, 60) + '…'
            : bio
          : '生平待考，然其诗已传。'
        const meta = [n.dynasty, n.literaryStyle, n.birthplace].filter(Boolean).join(' · ')
        const dynasty = dynastyColorOf(n.dynastyId)
        return [
          `<div style="min-width:200px;max-width:240px;background:${graphTheme.cardBg};border:1px solid ${dynasty};border-radius:4px;padding:10px 12px;box-shadow:0 6px 18px rgba(0,0,0,.18);font-size:12px;line-height:1.65;">`,
          `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">`,
          `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${dynasty};flex-shrink:0;"></span>`,
          `<b style="font-size:14px;letter-spacing:2px;color:${graphTheme.textPrimary};">${n.name || ''}</b>`,
          `</div>`,
          meta ? `<div style="color:${graphTheme.textSecondary};margin-bottom:6px;">${meta}</div>` : '',
          `<div style="color:${graphTheme.textSecondary};">${bioText}</div>`,
          `<div style="margin-top:6px;color:${graphTheme.accent};font-size:11px;letter-spacing:1px;">点击查看关系卡片</div>`,
          `</div>`,
        ].join('')
      },
    },
  ])

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
  const regionIds = new Set(poets.value.map(poet => String(poet.id)))
  const dynOK = (n) => (!region.value || regionIds.has(String(n.poetId ?? n.id))) && (dynastyFilter.value === '全部' || n.dynasty === dynastyFilter.value)
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

  graphVisibleNodes.value = visibleNodes
  graphVisibleCounts.value = { nodes: visibleNodes.length, edges: visibleEdges.length }
  graphFilterEmpty.value = !visibleNodes.length
  if (graphFilterEmpty.value) closeDrawer()
  // 初始全量已交给 Graph；从筛选空态返回全量时仍须恢复其数据。
  if (isDefault && visibleNodes.length === nodes.length && visibleEdges.length === edges.length
    && graphInstance.getNodeData().length === nodes.length && graphInstance.getEdgeData().length === edges.length) {
    return
  }

  graphInstance.setData({ nodes: visibleNodes, edges: visibleEdges })
  graphInstance.render()
}

// 「关系说明」开关: 运行时切换当前画布上所有边的 label 显隐
// (关闭时仅置 labelOpacity=0, labelText 保留 → hover 聚焦态仍可见)
const applyEdgeLabelVisibility = () => {
  if (!graphInstance || graphStatus.value !== 'ready') return
  const vis = edgeLabelsVisible.value
  // getEdgeData() 无参 = 全部边; 勿用 getElementData('edge')(参数是元素 ID)
  const displayedIds = new Set(graphInstance.getEdgeData().map((e) => e.id))
  const updates = (graphRawData.value.edges || [])
    .filter((e) => displayedIds.has(e.id))
    .map((e) => ({
      id: e.id,
      style: { labelText: e.relationType || '', labelOpacity: vis ? 1 : 0 },
    }))
  if (updates.length) {
    graphInstance.updateEdgeData(updates)
    graphInstance.draw()
  }
}

watch(edgeLabelsVisible, () => {
  applyEdgeLabelVisibility()
})

watch([relationFilter, derivedVisible, dynastyFilter], () => {
  closeDrawer()
  applyGraphFilter()
})

// 等待图谱容器挂载并完成布局获得真实尺寸(替换盲目 setTimeout;
// tab 切换走 mode="out-in" 过渡, 新 tab 内容约 250ms 后才插入 DOM)
const waitForGraphContainerSize = async (timeoutMs = 3000) => {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const el = g6Container.value
    if (el && el.clientWidth > 0 && el.clientHeight > 0) return true
    if (Date.now() >= deadline) return false
    await new Promise((r) => setTimeout(r, 50))
  }
}

const enterGraphTab = async () => {
  if (previewMode.value) {
    clearGraphWheel()
    safeDestroyGraph()
    graphRawData.value = { nodes: [], edges: [] }
    graphStatus.value = 'empty'
    closeDrawer()
    return
  }
  graphStatus.value = 'loading'
  await nextTick()
  if (!(await waitForGraphContainerSize())) {
    // 超时未取到容器尺寸: 置错误态(可重试), 避免永久转圈
    graphStatus.value = 'error'
    return
  }
  if (activeTab.value !== 'graph') return
  initG6()
}

watch([activeTab, isAnime], () => {
  if (activeTab.value === 'graph') {
    enterGraphTab()
  } else {
    clearGraphWheel()
    safeDestroyGraph()
    graphStatus.value = 'idle'
  }
})

const loadPoets = async () => {
  const currentSeq = ++rosterRequestSeq
  failedAvatarIds.value = new Set()
  errorMsg.value = null
  poetsLoaded.value = false
  enrichmentLoaded.value = false
  poets.value = []
  if (previewMode.value) {
    poets.value = previewPoets.filter((poet) => !region.value || `${poet.birthplace || ''} ${poet.biography || ''}`.includes(region.value)).map((poet) => ({
      ...poet,
      ...(poet.name === '杜甫' ? {
        avatarUrl: '/media/inkwash/atlas/poet-dufu.webp',
        avatarAnimeUrl: '/media/inkwash/atlas/poet-dufu.webp',
      } : {}),
      poemCount: poet.poems?.length || 0,
      signaturePoem: pickSignaturePoem(poet.poems || []),
    }))
    poetsLoaded.value = true
    enrichmentLoaded.value = true
    return
  }
  try {
    const { data } = await api.swrGet('/poets', { size: 200, ...(region.value ? { region: region.value } : {}) })
    if (currentSeq !== rosterRequestSeq) return
    poets.value = data.records || []
    poetsLoaded.value = true
    await build()
    if (currentSeq !== rosterRequestSeq) return
    enrichmentLoaded.value = true
    applyGraphFilter()
  } catch (e) {
    if (currentSeq !== rosterRequestSeq) return
    errorMsg.value = '名士数据加载失败，请稍后重试'
    poetsLoaded.value = true
  }
}

watch([previewMode, region], async () => {
  initDynastyFromQuery()
  clearGraphWheel()
  safeDestroyGraph()
  closeDrawer()
  graphRawData.value = { nodes: [], edges: [] }
  if (activeTab.value === 'graph') enterGraphTab()
  await loadPoets()
  await nextTick()
  if (revealRoot.value) reveal(revealRoot.value)
})

onMounted(async () => {
  window.addEventListener('resize', handleGraphResize)
  // 直接访问 /poets?view=graph 时 watch 不触发, 需显式初始化;
  // 不 await: 与诗人列表加载并行, 尽早呈现 loading→图谱
  if (activeTab.value === 'graph') {
    enterGraphTab()
  }
  await loadPoets()
  await nextTick()
  if (revealRoot.value) reveal(revealRoot.value)
})

onBeforeUnmount(() => {
  rosterRequestSeq++
  window.removeEventListener('resize', handleGraphResize)
  clearGraphWheel()
  safeDestroyGraph()
})
</script>

<style scoped>
.poets-region-note { display: flex; align-items: center; gap: 16px; color: var(--text-secondary); font-size: 13px; margin: 16px 0; }
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
  border: 1px solid var(--line, var(--border));
  border-radius: 2px;
  box-shadow: none;
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
  transform: translateY(-2px);
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
  background: #f3f0e8;
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
  color: var(--accent-dark);
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
/* 上下布局: 顶部控制面板(多行) + 下方画布, 免横向滑动找筛选 */
.graph-panel-layout {
  flex-direction: column;
  gap: 18px;
  align-items: stretch;
}
.graph-main {
  flex: 1;
  min-width: 0;
}
/* 控制面板: 说明/筛选/图例 每行独立, 行内自动换行 */
.graph-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  min-height: 520px; /* 兜底: 极端布局下避免 0 尺寸画布 */
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

/* graph loading / empty status (浮层覆盖在常驻画布之上) */
.graph-status-box {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  /* 图谱控制面板窄屏: 行内更紧凑 */
  .graph-panel-layout { flex-direction: column; }
  .graph-controls__row { gap: 8px 14px; }
  .graph-controls .legend-group + .legend-group {
    border-left: none;
    padding-left: 0;
    border-top: 1px dashed var(--border-light);
    padding-top: 10px;
    width: 100%;
  }
}
@media (max-width: 640px) {
  .poets-content { padding: 32px 16px 64px; }
  .poets-section { margin-bottom: 40px; }
  .poets-featured-grid { grid-template-columns: 1fr; }
  .poet-card-wrap { padding: 16px; gap: 14px; min-height: 180px; }
  .poet-avatar-box { width: 64px; height: 84px; }
  .poet-avatar-stamp { font-size: 28px; }
  .poet-name-tag { font-size: 18px; }
  .g6-container-canvas { height: 440px; min-height: 420px; }
  .graph-legend { flex-wrap: wrap; gap: 12px 18px; }
  .legend-group + .legend-group { border-left: none; padding-left: 0; }
  .graph-instructions { flex-direction: column; align-items: flex-start; gap: 8px; }
  .graph-drawer { width: 230px; padding: 14px; }
}
.poets-view { max-width: 1360px; padding: 32px var(--page-gutter) 0; }
.poets-content { padding: 0 0 70px; }
.poets-toolbar { display: flex; flex-direction: column; align-items: stretch; gap: 20px; margin: 0 0 28px; }
.layout-toggle-group { align-self: flex-end; margin: 0; background: var(--bg-secondary); border-color: var(--border-light); }
.layout-toggle-group .toggle-btn { min-height: 42px; background: transparent; color: var(--text-secondary); border-radius: 2px; }
.layout-toggle-group .toggle-btn.active { background: var(--card-bg); color: var(--accent); box-shadow: none; }
.poets-featured-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
@media(max-width:640px) { .poets-view { padding-top: 18px; } .poets-content { padding: 0 0 45px; } .poets-featured-grid { grid-template-columns: 1fr; } .layout-toggle-group { align-self: stretch; } }

/* 纸面关系图：姓名居中，阅读卡片与画布并列。 */
.graph-panel-inner.card { padding: 0; border: 1px solid var(--border); border-radius: 2px; background: var(--card-bg); box-shadow: none; }
.graph-panel-layout { gap: 0; }
.graph-heading { display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: 26px 30px 20px; border-bottom: 1px solid var(--border-light); }
.graph-eyebrow { color: var(--accent); font-size: 11px; letter-spacing: .2em; }
.graph-heading h2 { margin: 8px 0 9px; font-size: clamp(22px, 2.1vw, 30px); font-weight: 500; letter-spacing: .06em; }
.graph-heading p { margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.7; }
.graph-heading .graph-totals { flex-shrink: 0; font-size: 12px; color: var(--text-muted); }
.graph-totals strong { font-size: 27px; font-weight: 400; color: var(--text-primary); font-variant-numeric: tabular-nums; margin-right: 4px; }
.graph-totals span { margin: 0 12px; color: var(--border); }
.graph-controls { padding: 16px 30px; gap: 12px; border-bottom: 1px solid var(--border-light); }
.graph-filters { margin: 0; gap: 10px 30px; }
.graph-controls .filter-group { gap: 5px; }
.graph-controls .filter-label { margin-right: 8px; }
.graph-controls .filter-chip { border: 0; border-radius: 2px; padding: 6px 11px; letter-spacing: .02em; }
.graph-controls .filter-chip.active { background: var(--accent-soft); color: var(--accent); }
.graph-options { display: flex; flex-wrap: wrap; gap: 20px; font-size: 11px; color: var(--text-muted); }
.graph-options label { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
.graph-options input { accent-color: var(--accent); }
.graph-options span { font-variant-numeric: tabular-nums; }
.graph-main { display: grid; grid-template-columns: minmax(0, 1fr) 240px; }
.graph-stage { min-width: 0; background: #f8f5ee; }
.g6-container-canvas { height: 690px; min-height: 560px; border: 0; border-radius: 0; background: radial-gradient(ellipse at center, #fcfaf5 0%, #f4f0e6 100%); }
.graph-viewport-tools { position: absolute; bottom: 22px; left: 22px; display: flex; align-items: center; background: #faf7f0; border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.graph-viewport-tools button { border: 0; border-right: 1px solid var(--border-light); background: transparent; color: var(--text-secondary); min-width: 36px; min-height: 36px; padding: 0 11px; font-family: inherit; font-size: 12px; cursor: pointer; }
.graph-viewport-tools button:last-child { border-right: 0; }
.graph-viewport-tools button:hover { color: var(--accent); background: var(--accent-soft); }
.graph-stage-hint { position: absolute; right: 20px; bottom: 22px; font-size: 10px; color: var(--text-muted); margin: 0; pointer-events: none; }
.graph-reading-panel, .graph-drawer { border-left: 1px solid var(--border-light); padding: 25px 22px; background: var(--card-bg); }
.graph-reading-panel h3 { font-size: 19px; font-weight: 500; margin: 13px 0 10px; }
.graph-reading-panel > p { font-size: 12px; color: var(--text-muted); line-height: 1.8; }
.graph-entry-poets { margin: 20px 0 28px; display: grid; }
.graph-entry-poets button { display: flex; align-items: center; gap: 10px; text-align: left; padding: 11px 0; border: 0; border-bottom: 1px solid var(--border-light); background: transparent; color: var(--text-primary); font-family: inherit; font-size: 15px; cursor: pointer; }
.graph-entry-poets small { font-size: 10px; color: var(--text-muted); margin-left: auto; }
.graph-entry-poets button:hover { color: var(--accent); }
.graph-side-legend h4 { margin: 23px 0 14px; font-size: 11px; letter-spacing: .1em; font-weight: 500; color: var(--text-muted); }
.graph-side-legend .legend-item { gap: 12px; margin: 11px 0; font-size: 12px; color: var(--text-secondary); }
.graph-side-legend small { font-size: 10px; color: var(--text-muted); margin-left: auto; }
.graph-dynasty-key { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; font-size: 11px; color: var(--text-secondary); }
.graph-dynasty-key span { display: inline-flex; align-items: center; gap: 9px; }
.graph-dynasty-key i { width: 6px; height: 6px; border-radius: 50%; }
.graph-main .graph-drawer { position: relative; top: auto; right: auto; width: auto; max-height: 690px; box-shadow: none; border-radius: 0; border-top: 0; border-bottom: 0; border-right: 0; overflow-y: auto; }
.graph-drawer .drawer-close { top: 13px; right: 12px; }
.graph-drawer .drawer-head { padding-top: 14px; }
.graph-drawer .dr-type small { font-size: 9px; }
@media (max-width: 900px) {
  .graph-main { grid-template-columns: minmax(0, 1fr) 205px; }
  .graph-heading, .graph-controls { padding-left: 20px; padding-right: 20px; }
  .graph-reading-panel, .graph-main .graph-drawer { padding: 22px 16px; }
  .graph-stage-hint { display: none; }
}
@media (max-width: 640px) {
  .graph-heading { align-items: flex-start; flex-direction: column; gap: 12px; }
  .graph-heading .graph-totals strong { font-size: 21px; }
  .graph-main { grid-template-columns: minmax(0, 1fr); }
  .g6-container-canvas { height: 570px; min-height: 570px; }
  .graph-reading-panel, .graph-main .graph-drawer { border-left: 0; border-top: 1px solid var(--border-light); }
  .graph-reading-panel .graph-side-legend { display: none; }
  .graph-entry-poets { grid-template-columns: 1fr 1fr; column-gap: 20px; margin-bottom: 0; }
  .graph-filters { row-gap: 12px; }
}
</style>
