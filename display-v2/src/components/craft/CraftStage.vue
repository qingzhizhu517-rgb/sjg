<!-- display-v2/src/components/craft/CraftStage.vue -->
<!-- 3D 舞台容器：canvas + 加载态 + WebGL 降级静态图 -->
<template>
  <div ref="stageRef" class="craft-stage" :class="{ 'craft-stage--fallback': fallback }">
    <!-- 3D Canvas -->
    <canvas
      v-show="!fallback"
      ref="canvasRef"
      class="craft-stage__canvas"
      :aria-label="`${title} 3D 模型`"
    />

    <!-- 降级静态图序列 -->
    <div v-if="fallback" class="craft-stage__fallback">
      <img
        v-if="fallbackSrc"
        :src="fallbackSrc"
        :alt="`${title} 第${stepIndex + 1}步`"
        class="craft-stage__fallback-img"
      />
      <div v-else class="craft-stage__fallback-placeholder">
        <span class="craft-stage__fallback-icon">葫</span>
        <span class="craft-stage__fallback-text">{{ title }}</span>
      </div>
    </div>

    <!-- 加载进度条 -->
    <div v-if="loading" class="craft-stage__progress" role="progressbar" :aria-valuenow="progress">
      <div class="craft-stage__progress-bar" :style="{ width: `${progress * 100}%` }" />
      <span class="craft-stage__progress-label">加载中 {{ Math.round(progress * 100) }}%</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useGlbScene, canUseWebGL } from '../../composables/useGlbScene'

const props = defineProps({
  title: { type: String, default: '' },
  modelUrl: { type: String, default: '' },
  fallbackImages: { type: Array, default: () => [] },
  stepIndex: { type: Number, default: 0 },
})

const emit = defineEmits(['ready', 'error', 'progress'])

const stageRef = ref(null)
const canvasRef = ref(null)
const loading = ref(true)
const progress = ref(0)
const fallback = ref(false)
const fallbackSrc = ref('')

let sceneApi = null
let io = null

/** 暴露 sceneApi 给父组件 */
defineExpose({
  getSceneApi: () => sceneApi,
})

const initScene = async () => {
  if (!canUseWebGL()) {
    activateFallback()
    return
  }

  sceneApi = useGlbScene()
  sceneApi.setOnProgress((ratio) => {
    progress.value = ratio
    emit('progress', ratio)
  })

  try {
    await sceneApi.init(canvasRef.value)
    emit('ready', sceneApi)
  } catch (e) {
    console.warn('[CraftStage] init failed:', e)
    activateFallback()
    emit('error', e)
  }
}

const activateFallback = () => {
  fallback.value = true
  loading.value = false
  emit('ready', null)
}

const loadModel = async () => {
  if (!sceneApi || !props.modelUrl) return
  loading.value = true
  progress.value = 0
  try {
    const { partNames } = await sceneApi.load(props.modelUrl)
    loading.value = false
    return partNames
  } catch (e) {
    console.warn('[CraftStage] GLB load failed, fallback:', e)
    activateFallback()
    emit('error', e)
    return null
  }
}

// 更新降级图
const updateFallbackImage = () => {
  fallbackSrc.value = props.fallbackImages[props.stepIndex] || ''
}

// IntersectionObserver：滚出视口暂停渲染
const setupIO = () => {
  if (!stageRef.value || fallback.value) return
  io = new IntersectionObserver(([entry]) => {
    if (!sceneApi) return
    entry.isIntersecting ? sceneApi.resume() : sceneApi.pause()
  }, { threshold: 0.1 })
  io.observe(stageRef.value)
}

onMounted(async () => {
  await initScene()
  if (!fallback.value) {
    await loadModel()
    setupIO()
  } else {
    updateFallbackImage()
  }
  loading.value = false
})

watch(() => props.stepIndex, () => {
  if (fallback.value) updateFallbackImage()
})

onBeforeUnmount(() => {
  io?.disconnect()
  sceneApi?.dispose()
})
</script>

<style scoped>
.craft-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  background: var(--craft-stage-bg, #1a1a1a);
}

.craft-stage__canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}

/* 降级模式 */
.craft-stage--fallback {
  background: var(--craft-stage-fallback-bg, #F5F0E8);
}

.craft-stage__fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.craft-stage__fallback-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
}

.craft-stage__fallback-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.craft-stage__fallback-icon {
  font-size: 4rem;
  font-family: var(--font-heading, serif);
  color: var(--accent, #C5A55A);
  opacity: 0.5;
}

.craft-stage__fallback-text {
  font-size: 0.875rem;
  color: var(--text-muted, #A0896C);
}

/* 加载进度条 */
.craft-stage__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.2);
}

.craft-stage__progress-bar {
  height: 100%;
  background: var(--accent, #C5A55A);
  transition: width 0.3s ease;
}

.craft-stage__progress-label {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 0.75rem;
  color: var(--text-muted, #A0896C);
}
</style>
