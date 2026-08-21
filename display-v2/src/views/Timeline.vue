<template>
  <div class="timeline-page">
    <TimelineHero :stats="heroStats" />

    <div ref="revealRoot" class="timeline-content">
      <!-- 错误优先，与长卷互斥（此前 ErrorState 在长卷之后，空长卷与错误并存） -->
      <ErrorState v-if="errorMsg" :message="errorMsg" @retry="loadTimeline" />

      <!-- 加载骨架：避免加载中与真空数据视觉无法区分 -->
      <div v-else-if="!loaded" class="timeline-skeleton" aria-busy="true" aria-label="朝代长卷加载中">
        <SkeletonBlock height="400px" />
        <SkeletonBlock height="180px" />
      </div>

      <!-- 恒水墨长卷(一页一貌) -->
      <InkTimeline
        v-else
        :data="timeline"
        :initial-dynasty-id="initialDynastyId"
        @select-dynasty="onSelectDynasty"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'
import TimelineHero from '../components/homepage/TimelineHero.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import InkTimeline from '../components/timeline/InkTimeline.vue'
import { useReveal } from '../composables/useReveal'

const { reveal } = useReveal()
const route = useRoute()
const router = useRouter()

const timeline = ref([])
const loaded = ref(false)
const errorMsg = ref(null)
const revealRoot = ref(null)

// 深链接 ?dynasty=<id>（初始值，长卷首帧定位用）
const initialDynastyId = ref(route.query.dynasty || null)

const heroStats = computed(() => {
  if (!loaded.value || !timeline.value.length) return []
  const totalPoets = timeline.value.reduce((s, t) => s + t.poets.length, 0)
  const totalPoems = timeline.value.reduce((s, t) => s + t.poems.length, 0)
  const firstStart = Math.min(...timeline.value.map((t) => t.dynasty.startYear || 0))
  const lastEnd = Math.max(...timeline.value.map((t) => t.dynasty.endYear || 0))
  const span = lastEnd - firstStart
  return [
    { value: timeline.value.length, suffix: '朝', label: '朝代跨度' },
    { value: totalPoets, suffix: '位', label: '历代名士' },
    { value: totalPoems, suffix: '篇', label: '传世诗卷' },
    { value: span, suffix: '年', label: '文脉绵延' },
  ]
})

const loadTimeline = async () => {
  errorMsg.value = null
  loaded.value = false
  try {
    const { data } = await api.swrGet('/timeline')
    timeline.value = data
  } catch (e) {
    console.error('加载朝代时间线失败:', e)
    errorMsg.value = '加载朝代数据失败，请稍后重试'
  } finally {
    loaded.value = true
  }
}

const onSelectDynasty = (dynasty) => {
  // 深链接双向同步：选中朝代写回 URL，刷新可保持
  const query = { ...route.query, dynasty: dynasty.id }
  router.replace({ query }).catch(() => {})
}

onMounted(async () => {
  await loadTimeline()
  await nextTick()
  if (revealRoot.value) reveal(revealRoot.value)
})
</script>

<style scoped>
.timeline-page {
  max-width: 1280px;
  margin: 0 auto;
}
.timeline-content {
  padding: 56px 48px 96px;
}
.timeline-skeleton {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 1024px) {
  .timeline-content { padding: 40px 32px 80px; }
}
@media (max-width: 640px) {
  .timeline-content { padding: 32px 16px 64px; }
}
</style>
