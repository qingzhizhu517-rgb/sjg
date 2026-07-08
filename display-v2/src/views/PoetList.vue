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

      <!-- 经典案例 -->
      <section v-if="showcasePoets.length" class="poets-section" data-reveal>
        <SectionHeading
          eyebrow="经典案例"
          title="典型名士"
          subtitle="传世诗篇最丰的几位齐鲁大家，独特化展示其经典"
        />
        <div class="showcase-grid">
          <ShowcasePoetCard
            v-for="(p, i) in showcasePoets"
            :key="p.id"
            :poet="p"
            :poems="p.poems || []"
            :dynasty-name="getDynastyName(p.dynastyId)"
            :featured="i === 0"
            @click="$router.push(`/poets/${p.id}`)"
          />
        </div>
      </section>

      <!-- 查看全部 -->
      <section class="poets-section poets-more" data-reveal>
        <router-link to="/poets/all" class="more-btn">
          <span class="more-btn__text">查看全部 {{ poets.length }} 位名士</span>
          <span class="more-btn__arrow">→</span>
        </router-link>
        <p class="more-btn__hint">按朝代筛选 · 关系图谱 · 全量诗人卡墙</p>
      </section>

      <ErrorState v-if="errorMsg" :message="errorMsg" @retry="loadPoets" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { usePoetEnrichment } from '../composables/usePoetEnrichment'
import { useReveal } from '../composables/useReveal'
import api from '../api'
import InkHero from '../components/homepage/InkHero.vue'
import SectionHeading from '../components/homepage/SectionHeading.vue'
import FeaturedPoemCard from '../components/homepage/FeaturedPoemCard.vue'
import ShowcasePoetCard from '../components/homepage/ShowcasePoetCard.vue'
import ErrorState from '../components/homepage/ErrorState.vue'

const router = useRouter()
const { isAnime } = useTheme()
const { map: enrichMap, build, enrich } = usePoetEnrichment()
const { reveal } = useReveal()

const DYNASTIES = [
  { id: 1, name: '先秦' }, { id: 2, name: '秦汉' }, { id: 3, name: '魏晋南北朝' },
  { id: 4, name: '隋唐' }, { id: 5, name: '宋' }, { id: 9, name: '金' },
  { id: 6, name: '元' }, { id: 7, name: '明' }, { id: 8, name: '清' },
]

const poets = ref([])
const poetsLoaded = ref(false)
const enrichmentLoaded = ref(false)
const errorMsg = ref(null)
const revealRoot = ref(null)

const getDynastyName = (id) => DYNASTIES.find((d) => d.id === id)?.name || '古代'

const enrichedPoets = computed(() => poets.value.map((p) => enrich(p)))

// 经典案例：传世诗篇最丰的 5 位典型名士
const showcasePoets = computed(() => {
  if (!enrichmentLoaded.value) return []
  return [...enrichedPoets.value]
    .sort((a, b) => (b.poemCount || 0) - (a.poemCount || 0))
    .slice(0, 5)
})

// 今日名句：从传世最丰的诗人中按日轮换取代表句
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
  const dynastiesWithPoets = DYNASTIES.filter(
    (d) => poets.value.some((p) => p.dynastyId === d.id),
  ).length
  return [
    { value: poets.value.length, suffix: '位', label: '齐鲁名士' },
    { value: DYNASTIES.length, suffix: '朝', label: '跨越朝代' },
    { value: totalPoems, suffix: '篇', label: '传世诗卷' },
    { value: dynastiesWithPoets, suffix: '朝', label: '有录可考' },
  ]
})

const goPoem = (id) => {
  if (id) router.push(`/poems/${id}`)
}

const loadPoets = async () => {
  errorMsg.value = null
  try {
    const data = await api.get('/poets', { params: { size: 200 } })
    poets.value = data.records || []
    poetsLoaded.value = true
  } catch (e) {
    errorMsg.value = '名士数据加载失败，请稍后重试'
    poetsLoaded.value = true
  }
}

onMounted(async () => {
  await loadPoets()
  await build()
  enrichmentLoaded.value = true
  await nextTick()
  if (revealRoot.value) reveal(revealRoot.value)
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

.poets-section {
  max-width: 1200px;
  margin: 0 auto 56px;
}
.poets-quote {
  margin-bottom: 64px;
}

/* 经典案例网格 */
.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  align-items: stretch;
}

/* 查看全部按钮 */
.poets-more {
  text-align: center;
  padding: 24px 0 0;
}
.more-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 40px;
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--text-primary);
  border-radius: 2px;
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 3px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.more-btn:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(61, 43, 31, 0.15);
}
.more-btn:active {
  transform: translateY(0);
}
.more-btn__arrow {
  transition: transform 0.3s;
}
.more-btn:hover .more-btn__arrow {
  transform: translateX(6px);
}
.more-btn__hint {
  margin: 14px 0 0 0;
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 2px;
}

@media (max-width: 1024px) {
  .poets-content { padding: 40px 32px 80px; }
}
@media (max-width: 768px) {
  .showcase-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .poets-content { padding: 32px 16px 64px; }
  .poets-section { margin-bottom: 40px; }
  .more-btn { padding: 13px 28px; font-size: 13px; letter-spacing: 2px; }
}
</style>
