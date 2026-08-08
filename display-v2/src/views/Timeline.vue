<template>
  <div class="timeline-page" :class="themeClass">
    <TimelineHero :stats="heroStats" />

    <div ref="revealRoot" class="timeline-content">
      <!-- 双布局分支 -->
      <InkTimeline v-if="isAnime" :data="timeline" @select-dynasty="onSelectDynasty" />
      <RealTimeline v-else :data="timeline" :loaded="loaded" :error-msg="errorMsg" @load="loadTimeline" />

      <ErrorState v-if="errorMsg" :message="errorMsg" @retry="loadTimeline" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import api from '../api'
import TimelineHero from '../components/homepage/TimelineHero.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import InkTimeline from '../components/timeline/InkTimeline.vue'
import RealTimeline from '../components/timeline/RealTimeline.vue'
import { useTheme } from '../composables/useTheme'
import { useReveal } from '../composables/useReveal'

const { isAnime, themeClass } = useTheme()
const { reveal } = useReveal()

const timeline = ref([])
const loaded = ref(false)
const errorMsg = ref(null)
const revealRoot = ref(null)

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
  // 可用于联动其他组件
  console.log('选择朝代:', dynasty.name)
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

@media (max-width: 1024px) {
  .timeline-content { padding: 40px 32px 80px; }
}
@media (max-width: 640px) {
  .timeline-content { padding: 32px 16px 64px; }
}
</style>
