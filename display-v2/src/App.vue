<template>
  <div :class="themeClass" class="app-root">
    <RouteProgress :progress="progressValue" :visible="progressVisible" />
    <SiteHeader />
    <main id="main-content" class="main-content" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition :name="navTransition" :duration="180">
          <div :key="pageKey" class="route-page"><component :is="Component" /></div>
        </transition>
      </router-view>
    </main>
    <footer class="site-footer">
      <div><span class="site-footer__title">山河有迹 · 文脉有声</span><p>数字人文视域下黄河流域（山东段）文学景观构建与教学应用研究</p></div>
      <nav aria-label="页脚导航"><router-link :to="atlasLink('/poems', route)">检索诗词</router-link><router-link :to="atlasLink('/reading', route)">AI对照阅读</router-link><router-link :to="atlasLink('/learn', route)">探究任务</router-link><router-link :to="atlasLink('/compose', route)">诗词创作</router-link></nav>
      <small>SHANDONG · LITERARY LANDSCAPES OF THE YELLOW RIVER</small>
    </footer>
    <div v-if="isAtlasPreview(route)" class="atlas-preview-bar" role="status"><span>设计预览 · 样本内容</span><router-link :to="{ path: route.path, query: { ...route.query, preview: undefined } }" aria-label="退出设计预览">退出预览 ↗</router-link></div>
    <AiChatBox v-if="route.name !== 'ReadingWorkspace'" />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from './composables/useTheme'
import RouteProgress from './components/RouteProgress.vue'
import SiteHeader from './components/layout/SiteHeader.vue'
import AiChatBox from './components/AiChatBox.vue'
import { resolveNavDirection, createProgress } from './utils/routeFeedback'
import { atlasLink, isAtlasPreview } from './config/atlasPreview'
import './styles/theme.css'
import './styles/interactions.css'
import './styles/layout.css'
const route = useRoute(), router = useRouter()
const { themeClass } = useTheme()
// Filter changes stay within the current page, preserving input and graph state.
const pageKey = computed(() => `${route.path}:${isAtlasPreview(route)}`)
const progress = createProgress()
const progressValue = ref(0)
const progressVisible = ref(false)
const navDirection = ref('fade')
let progressTimer = null
let progressHideTimer = null
let lastPos = null
let routerHookCleanups = []

// ===== 路由过渡残留类清扫 =====
// 已知问题: 动态组件 + out-in 过渡下, 若子组件根节点在过渡期间被替换
// (如详情页数据到达后由骨架/注释切换为真实根节点), enter-from 类可能残留,
// 使页面永远停在 opacity:0 —— DOM 存在但整页"空白/像被遮挡"。
// 过渡时长 ≤350ms, 在 800ms/1600ms 两个时点清扫任何残留类, 保证内容必然可见。
const STUCK_TRANSITION_CLASSES = [
  'page-slide-enter-from', 'page-slide-enter-active', 'page-slide-leave-to', 'page-slide-leave-active',
  'page-pop-enter-from', 'page-pop-enter-active', 'page-pop-leave-to', 'page-pop-leave-active',
  'page-fade-enter-from', 'page-fade-enter-active', 'page-fade-leave-to', 'page-fade-leave-active',
]
let stuckSweepTimers = []
const sweepStuckTransition = () => {
  document
    .querySelectorAll('.main-content [class*="page-slide"], .main-content [class*="page-pop"], .main-content [class*="page-fade"]')
    .forEach((el) => {
      el.classList.remove(...STUCK_TRANSITION_CLASSES)
    })
}

const navTransition = computed(
  () => ({ forward: 'page-slide', back: 'page-pop', fade: 'page-fade' })[navDirection.value],
)

onMounted(() => {

  // 路由进度条：beforeEach 起步细流，afterEach 收满淡出
  const removeBefore = router.beforeEach((to, from, next) => {
    navDirection.value = resolveNavDirection(lastPos, window.history.state?.position ?? null)
    lastPos = window.history.state?.position ?? lastPos
    // 清掉上一轮导航遗留的淡出定时器，防快速连跳时进度条被中途掐灭
    clearTimeout(progressHideTimer)
    progress.start()
    progressValue.value = progress.value()
    progressVisible.value = true
    clearInterval(progressTimer)
    progressTimer = setInterval(() => {
      progress.tick()
      progressValue.value = progress.value()
    }, 200)
    next()
  })
  const removeAfter = router.afterEach(() => {
    clearInterval(progressTimer)
    progressTimer = null
    progress.finish()
    progressValue.value = 1
    progressHideTimer = setTimeout(() => {
      progressVisible.value = false
      progress.reset()
      progressValue.value = 0
    }, 350)
    // 过渡残留类清扫(800ms 与 1600ms 双保险)
    stuckSweepTimers.forEach(clearTimeout)
    stuckSweepTimers = [800, 1600].map((ms) => setTimeout(sweepStuckTransition, ms))
  })
  routerHookCleanups = [removeBefore, removeAfter]
})

onUnmounted(() => {
  routerHookCleanups.forEach((remove) => remove())
  clearInterval(progressTimer)
  clearTimeout(progressHideTimer)
  stuckSweepTimers.forEach(clearTimeout)
  stuckSweepTimers = []
})
</script>
<style>
.main-content { position: relative; min-height: 65vh; outline: none; }
.route-page { width: 100%; }
.page-slide-enter-active,.page-slide-leave-active,.page-pop-enter-active,.page-pop-leave-active,.page-fade-enter-active,.page-fade-leave-active { transition: opacity .18s ease, transform .18s ease; }
.page-slide-enter-from,.page-pop-enter-from,.page-fade-enter-from,.page-slide-leave-to,.page-pop-leave-to,.page-fade-leave-to { opacity: 0; }
.page-slide-enter-from { transform: translateY(7px); }
.page-slide-leave-active,.page-pop-leave-active,.page-fade-leave-active { position: absolute; inset: 0; pointer-events: none; }
.site-footer { border-top: 1px solid var(--border); padding: 38px var(--page-gutter) 52px; display: grid; grid-template-columns: 1fr auto; gap: 25px; max-width: 1500px; margin: auto; }
.site-footer__title { font: 25px var(--font-display); letter-spacing: 3px; }
.site-footer p { color: var(--text-muted); font-size: 12px; margin-top: 10px; }
.site-footer nav { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 24px; font-size: 13px; }
.site-footer nav a { padding-block: 10px; white-space: nowrap; }
.site-footer small { grid-column: 1/-1; color: var(--text-secondary); font: 9px Georgia,serif; letter-spacing: 2px; }
.atlas-preview-bar { position: fixed; z-index: 190; left: 16px; bottom: 12px; display: flex; gap: 14px; align-items: center; border: 1px solid var(--border); padding: 7px 12px; background: #f5f2ebf0; border-radius: 3px; font-size: 11px; color: var(--text-muted); backdrop-filter: blur(8px); }
.atlas-preview-bar a { color: var(--accent); padding-block: 4px; }
@media(max-width:700px) { .site-footer { grid-template-columns: 1fr; padding-bottom: 85px; } .site-footer nav { gap: 20px; } .atlas-preview-bar { left: 8px; bottom: 8px; font-size: 10px; } }
@media(prefers-reduced-motion:reduce) { .route-page { transition: none; } }
</style>
