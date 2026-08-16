<!-- display-v2/src/views/CraftWorkshop.vue -->
<!-- 路由页 /crafts：编排 useGlbScene + useCraftProcess + 三组件 -->
<template>
  <div ref="rootRef" class="craft-workshop">
    <!-- 页头 -->
    <header class="cw-hero" data-reveal>
      <span class="cw-hero__tag">文化长廊 · 非遗工艺</span>
      <h1 class="cw-hero__title">匠心传承 · 器物之美</h1>
      <p class="cw-hero__desc">
        一把刻刀，一方葫芦；千刀万凿，方成器物。从选料到成品，跟随匠人之手，体验东昌葫芦雕刻的五道工序。
      </p>
    </header>

    <!-- 主内容区：左 3D 舞台 + 右步骤条 -->
    <div class="cw-main" data-reveal>
      <!-- 3D 舞台 -->
      <div class="cw-stage-wrap">
        <CraftStage
          ref="stageRef"
          :title="config.title"
          :model-url="config.model"
          :fallback-images="config.fallbackImages"
          :step-index="currentStep"
          @ready="onStageReady"
          @error="onStageError"
        />
        <!-- 自由把玩提示 -->
        <Transition name="fade">
          <div v-if="isLast && !loading" class="cw-free-roam-hint">
            <span>自由赏玩</span>
            <span class="cw-free-roam-hint__icon">↕</span>
          </div>
        </Transition>
      </div>

      <!-- 右侧控制面板 -->
      <aside class="cw-panel">
        <StepRail
          :steps="config.steps"
          :current-step="currentStep"
          :step-meta="stepMeta"
          :playing="playing"
          @prev="prev"
          @next="next"
          @toggle-auto="toggleAuto"
          @jump-to="jumpTo"
        />
        <!-- 工艺简介 -->
        <div class="cw-info" data-reveal>
          <h3 class="cw-info__title">{{ config.title }}</h3>
          <p class="cw-info__sub">{{ config.subtitle }}</p>
        </div>
      </aside>
    </div>

    <!-- 知识点卡（自由把玩模式） -->
    <KnowledgeCard
      :info="knowledgeInfo"
      :active="showKnowledge"
      @close="showKnowledge = false"
    />

    <!-- 底部工序详情展开 -->
    <section class="cw-detail" data-reveal>
      <h2 class="cw-detail__heading">工序详解</h2>
      <div class="cw-detail__grid">
        <article
          v-for="(step, i) in config.steps"
          :key="step.key"
          class="cw-detail__card"
          :class="{ 'cw-detail__card--active': i === currentStep }"
          @click="jumpTo(i)"
        >
          <div class="cw-detail__card-icon">{{ step.icon }}</div>
          <h4 class="cw-detail__card-name">{{ step.name }}</h4>
          <p class="cw-detail__card-desc">{{ step.desc }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useReveal } from '../composables/useReveal'
import { useCraftProcess } from '../composables/useCraftProcess'
import CraftStage from '../components/craft/CraftStage.vue'
import StepRail from '../components/craft/StepRail.vue'
import KnowledgeCard from '../components/craft/KnowledgeCard.vue'
import { HULU_PROCESS } from '../content/crafts/dongchang-hulu'

const { reveal } = useReveal()

const config = HULU_PROCESS

const rootRef = ref(null)
const stageRef = ref(null)
const loading = ref(true)
const showKnowledge = ref(false)
const knowledgeInfo = ref(null)

// 工序状态机（延迟绑定 sceneApi）
let processApi = null
const currentStep = ref(0)
const stepMeta = ref(config.steps[0])
const playing = ref(false)
const isLast = computed(() => currentStep.value >= config.steps.length - 1)

const onStageReady = async (sceneApi) => {
  if (!sceneApi) {
    // 降级模式：仅用步骤条切换文案
    loading.value = false
    return
  }

  // 初始化工序状态机
  processApi = useCraftProcess(config, {
    setVisible: sceneApi.setVisible,
    getObject: sceneApi.getObject,
    applyCameraPose: sceneApi.applyCameraPose,
    setFreeRoam: sceneApi.setFreeRoam,
  })

  processApi.setPartNames(config.allParts)

  // 同步状态到模板
  const syncState = () => {
    currentStep.value = processApi.currentStep.value
    stepMeta.value = processApi.stepMeta.value
    playing.value = processApi.playing.value
  }

  // watch currentStep 变化
  const watchInterval = setInterval(syncState, 100)

  // 部件交互：hover 高亮 + click 弹知识点
  sceneApi.onPartHover((name) => {
    if (!name || !processApi.isLast.value) return
    const obj = sceneApi.getObject(name)
    if (obj) {
      obj.scale.setScalar(1.05)
      setTimeout(() => obj.scale.setScalar(1), 200)
    }
  })

  sceneApi.onPartClick((name) => {
    if (!name || !processApi.isLast.value) return
    const info = config.knowledge[name]
    if (info) {
      knowledgeInfo.value = info
      showKnowledge.value = true
    }
  })

  // 进入第一步
  processApi.enter(0)
  syncState()
  loading.value = false

  // 清理
  onBeforeUnmount(() => {
    clearInterval(watchInterval)
    processApi?.dispose()
  })
}

const onStageError = () => {
  loading.value = false
}

const next = () => processApi?.next()
const prev = () => processApi?.prev()
const toggleAuto = () => processApi?.toggleAuto()
const jumpTo = (i) => processApi?.enter(i)

onMounted(async () => {
  await nextTick()
  if (rootRef.value) reveal(rootRef.value)
})
</script>

<style scoped>
.craft-workshop {
  min-height: 100vh;
  padding: 0 1.5rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页头 */
.cw-hero {
  text-align: center;
  padding: 3rem 0 2rem;
}

.cw-hero__tag {
  display: inline-block;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  color: var(--accent, #C5A55A);
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  font-family: var(--font-heading, serif);
}

.cw-hero__title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-family: var(--font-heading, serif);
  color: var(--text-primary, #2D2D2D);
  margin: 0 0 0.75rem;
  line-height: 1.3;
}

.cw-hero__desc {
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: var(--text-muted, #A0896C);
  margin: 0;
  line-height: 1.6;
  max-width: 480px;
  margin-inline: auto;
}

/* 主内容区 */
.cw-main {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.cw-stage-wrap {
  position: relative;
}

.cw-free-roam-hint {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  color: var(--accent, #C5A55A);
  background: var(--card-bg, rgba(255, 255, 255, 0.9));
  border-radius: 6px;
  border: 1px solid var(--accent, #C5A55A);
  pointer-events: none;
}

.cw-free-roam-hint__icon {
  animation: bounce 1.5s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.cw-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cw-info {
  padding: 1rem;
  background: var(--card-bg, rgba(255, 255, 255, 0.06));
  border-radius: 12px;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
}

.cw-info__title {
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
  font-family: var(--font-heading, serif);
  color: var(--text-primary, #2D2D2D);
}

.cw-info__sub {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted, #A0896C);
}

/* 工序详解 */
.cw-detail {
  margin-top: 2rem;
}

.cw-detail__heading {
  font-size: 1.25rem;
  font-family: var(--font-heading, serif);
  color: var(--text-primary, #2D2D2D);
  margin: 0 0 1.25rem;
  text-align: center;
}

.cw-detail__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.cw-detail__card {
  padding: 1.25rem;
  background: var(--card-bg, rgba(255, 255, 255, 0.06));
  border-radius: 12px;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.cw-detail__card:hover {
  border-color: var(--accent, #C5A55A);
  transform: translateY(-2px);
}

.cw-detail__card--active {
  border-color: var(--accent, #C5A55A);
  background: var(--accent-glow, rgba(197, 165, 90, 0.08));
}

.cw-detail__card-icon {
  font-size: 1.75rem;
  font-family: var(--font-heading, serif);
  color: var(--accent, #C5A55A);
  margin-bottom: 0.5rem;
}

.cw-detail__card-name {
  margin: 0 0 0.375rem;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--font-heading, serif);
  color: var(--text-primary, #2D2D2D);
}

.cw-detail__card-desc {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-muted, #A0896C);
}

/* 过渡 */
.fade-enter-active { transition: opacity 0.3s; }
.fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 移动端 */
@media (max-width: 768px) {
  .craft-workshop {
    padding: 0 1rem 3rem;
  }

  .cw-main {
    grid-template-columns: 1fr;
  }

  .cw-detail__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .cw-detail__grid {
    grid-template-columns: 1fr;
  }
}
</style>
