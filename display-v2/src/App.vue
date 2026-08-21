<template>
  <div :class="themeClass" class="app-root">
    <!-- 路由切换顶部进度条 -->
    <RouteProgress :progress="progressValue" :visible="progressVisible" />

    <!-- Main Top Header -->
    <header class="main-header" :class="{ scrolled: isScrolled, 'mobile-menu-open': isMobileMenuOpen }">
      <div class="header-inner">
        <!-- Site Brand：单行中文站名 + 朱砂方印 -->
        <router-link to="/map" class="site-brand" @click="closeMobileMenu">
          <span class="brand-logo-box">黄</span>
          <span class="brand-name">齐鲁文脉</span>
        </router-link>

        <!-- Desktop Navigation：纯文字导航 + 数据大屏外链 -->
        <nav class="main-nav desktop-only">
          <router-link to="/map" class="nav-link" :class="{ active: isMapActive }">山河图志</router-link>
          <router-link to="/poets" class="nav-link" :class="{ active: isPoetsActive }">齐鲁名士</router-link>
          <router-link to="/culture" class="nav-link" :class="{ active: isCultureActive }">文化长廊</router-link>
          <router-link to="/timeline" class="nav-link" :class="{ active: isTimelineActive }">文脉长河</router-link>
          <a class="nav-link nav-link--external" :href="datavUrl" target="_blank" rel="noopener">
            数据大屏<svg class="nav-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10" /></svg>
          </a>
        </nav>

        <!-- Header Right: Dropdown Explorer -->
        <div class="header-right desktop-only">
          <div class="explore-dropdown">
            <button class="explore-btn">
              探索山东
              <svg class="explore-arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4l4 4 4-4" /></svg>
            </button>
            <div class="explore-menu">
              <h4 class="dropdown-title">沿黄九市</h4>
              <div class="explore-grid">
                <router-link
                  v-for="city in cities"
                  :key="city"
                  :to="`/regions/${city}`"
                  class="city-link"
                >
                  <span class="city-name">{{ city }}</span>
                  <span class="city-pinyin">{{ getCityPinyin(city) }}</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Controls (Drawer Hamburger toggle) -->
        <div class="mobile-controls">
          <button class="hamburger-btn" @click="toggleMobileMenu" :aria-label="isMobileMenuOpen ? '关闭菜单' : '打开菜单'">
            <span class="hamburger-line line-1" :class="{ active: isMobileMenuOpen }"></span>
            <span class="hamburger-line line-2" :class="{ active: isMobileMenuOpen }"></span>
            <span class="hamburger-line line-3" :class="{ active: isMobileMenuOpen }"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Drawer Overlay -->
    <transition name="drawer-fade">
      <div class="mobile-drawer-overlay" v-if="isMobileMenuOpen" @click="closeMobileMenu"></div>
    </transition>

    <!-- Mobile Drawer Navigation Panel -->
    <transition name="drawer-slide">
      <aside class="mobile-drawer" v-if="isMobileMenuOpen">
        <div class="drawer-header">
          <span class="drawer-title">文旅导航</span>
        </div>
        <nav class="drawer-nav">
          <router-link to="/map" class="drawer-nav-link" :class="{ active: isMapActive }" @click="closeMobileMenu">山河图志</router-link>
          <router-link to="/poets" class="drawer-nav-link" :class="{ active: isPoetsActive }" @click="closeMobileMenu">齐鲁名士</router-link>
          <router-link to="/culture" class="drawer-nav-link" :class="{ active: isCultureActive }" @click="closeMobileMenu">文化长廊</router-link>
          <router-link to="/timeline" class="drawer-nav-link" :class="{ active: isTimelineActive }" @click="closeMobileMenu">文脉长河</router-link>
          <a class="drawer-nav-link drawer-nav-link--external" :href="datavUrl" target="_blank" rel="noopener" @click="closeMobileMenu">数据大屏 ↗</a>
        </nav>

        <div class="drawer-cities-section">
          <span class="drawer-section-title">沿黄城市探索</span>
          <div class="drawer-cities-grid">
            <router-link
              v-for="city in cities"
              :key="city"
              :to="`/regions/${city}`"
              class="drawer-city-badge"
              @click="closeMobileMenu"
            >
              {{ city }}
            </router-link>
          </div>
        </div>
      </aside>
    </transition>

    <!-- Main View Component Router -->
    <!-- 注意: 不用 mode="out-in"。out-in 需等待旧页 leave 过渡完成才挂载新页,
         详情页返回时若 leave 的 transitionend 丢失, 新页永不挂载 → 整页空白。
         默认 mode 下新旧页并发过渡, 即使 leave 卡住新页也已挂载。 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition :name="navTransition">
          <component :is="Component" :key="$route.fullPath" />
        </transition>
      </router-view>
    </main>

    <!-- Global Footer -->
    <footer class="main-footer">
      <div class="footer-inner">
        <p class="footer-text">数字人文视域下黄河流域（山东段）文学景观构建与教学应用研究</p>
        <div class="footer-divider"></div>
        <p class="footer-copy">Digital Humanities · Literary Landscapes of the Yellow River Basin</p>
      </div>
    </footer>

    <!-- AI 小文全局挂载 -->
    <AiChatBox />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from './composables/useTheme'
import RouteProgress from './components/RouteProgress.vue'
import AiChatBox from './components/AiChatBox.vue'
import { resolveNavDirection, createProgress } from './utils/routeFeedback'
import './styles/theme.css'

const route = useRoute()
const router = useRouter()
const { theme, themeClass } = useTheme()

// ===== 路由反馈：顶部进度条 + 方向感过渡 =====
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

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Custom route matching for child directories/subpages
const isMapActive = computed(() => {
  return route.path === '/map' || route.path.startsWith('/regions') || route.path.startsWith('/spots')
})

const isPoetsActive = computed(() => {
  return route.path.startsWith('/poets') || route.path.startsWith('/poems')
})

const isTimelineActive = computed(() => {
  return route.path === '/timeline'
})

// 文化长廊: 聚合页 + 五类列表/详情 + 每城文化页均高亮
const isCultureActive = computed(() => {
  return (
    route.path === '/culture' ||
    route.path.startsWith('/festivals') ||
    route.path.startsWith('/crafts') ||
    route.path.startsWith('/literature') ||
    route.path.startsWith('/food-opera') ||
    route.path.startsWith('/cities')
  )
})

// Cities mapping list
const cities = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '滨州', '淄博', '东营']

// 数据大屏入口地址：可经 .env 覆盖，避免硬编码 localhost（部署/隧道环境下必然 404）
const datavUrl = import.meta.env.VITE_DATAV_URL || 'http://localhost:5180'

const getCityPinyin = (city) => {
  const mapping = {
    '菏泽': 'HEZE',
    '济宁': 'JINING',
    '泰安': 'TAIAN',
    '聊城': 'LIAOCHENG',
    '济南': 'JINAN',
    '德州': 'DEZHOU',
    '滨州': 'BINZHOU',
    '淄博': 'ZIBO',
    '东营': 'DONGYING'
  }
  return mapping[city] || ''
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })

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
  window.removeEventListener('scroll', handleScroll)
  routerHookCleanups.forEach((remove) => remove())
  clearInterval(progressTimer)
  clearTimeout(progressHideTimer)
  stuckSweepTimers.forEach(clearTimeout)
  stuckSweepTimers = []
})
</script>

<style>
/* Global page transition: 前进=推入 */
.page-slide-enter-active, .page-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
/* 默认 mode(非 out-in): 离开中的旧页绝对定位叠在底层, 避免占位导致新页下跳 */
.page-slide-leave-active,
.page-pop-leave-active,
.page-fade-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
.page-slide-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.page-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 返回=浮出（逆向轻量位移 + 缩放） */
.page-pop-enter-active, .page-pop-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-pop-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.995);
}
.page-pop-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 同级/replace=纯淡入 */
.page-fade-enter-active, .page-fade-leave-active {
  transition: opacity 0.28s ease;
}
.page-fade-enter-from, .page-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-slide-enter-active, .page-slide-leave-active,
  .page-pop-enter-active, .page-pop-leave-active,
  .page-fade-enter-active, .page-fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .page-slide-enter-from, .page-slide-leave-to,
  .page-pop-enter-from, .page-pop-leave-to {
    transform: none;
  }
}
</style>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ===== Header & Navigation ===== */
.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-header);
  height: var(--nav-height);
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid transparent;
  /* 不再动画 height（旧版滚动时 64→54px 造成整行垂直位移 5px，
     且 `all` 把 backdrop-filter 也纳入过渡导致每帧重合成） */
  transition: border-color 0.3s, box-shadow 0.3s;
}

.main-header.scrolled {
  border-bottom-color: var(--border);
  box-shadow: 0 4px 16px var(--shadow-a1);
}

.header-inner {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Site Brand Logo styling */
.site-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-logo-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-on-accent);
  background: var(--accent);
  border-radius: var(--radius-sm);
  transition: transform 0.3s;
}

.site-brand:hover .brand-logo-box {
  transform: rotate(-6deg);
}

.brand-name {
  font-family: var(--font-heading);
  font-size: var(--fs-body);
  font-weight: 600;
  letter-spacing: 4px;
  color: var(--text-primary);
}

/* Main Navigation Menu */
.main-nav {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-3);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: var(--fs-body-sm);
  font-weight: 600;
  letter-spacing: 2px;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover {
  color: var(--text-primary);
}

/* 单一激活提示：文字变朱砂 + 与文字等宽下划线（旧版叠了背景填充 + inset 阴影 + 字重变化，
   合成加粗使激活项变宽，路由切换时导航项横向抖动） */
.nav-link.active {
  color: var(--accent);
}

/* Underline link sliding animation */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: var(--sp-3);
  right: var(--sp-3);
  height: 1.5px;
  background: var(--accent);
  border-radius: 1px;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link:hover::after,
.nav-link.active::after {
  transform: scaleX(1);
}

/* 数据大屏外链：末尾加外链角标，不参与 active 态 */
.nav-link--external {
  color: var(--text-muted);
}
.nav-link--external::after {
  display: none;
}
.nav-link--external:hover {
  color: var(--accent);
}
.nav-external {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
}

/* Header Right Panel */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Explore Dropdown: 3D perspective fold down */
.explore-dropdown {
  position: relative;
  perspective: 1000px;
}

.explore-btn {
  padding: 8px 16px;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: var(--fs-body-sm);
  font-weight: 600;
  border-radius: var(--radius-lg);
  background: transparent;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.3s, border-color 0.3s, background 0.3s;
  letter-spacing: 1px;
}

.explore-btn:hover {
  background: var(--accent-faint);
  color: var(--accent);
  border-color: var(--accent);
}

.explore-arrow {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  transition: transform 0.3s;
}

.explore-btn:hover .explore-arrow {
  transform: translateY(2px);
}

.explore-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 12px;
  width: 320px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 18px;
  box-shadow: 0 12px 36px var(--shadow-soft);
  opacity: 0;
  visibility: hidden;
  transform: translateY(15px) rotateX(-12deg);
  transform-origin: top right;
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.4s;
  z-index: var(--z-float);
}

.explore-dropdown:hover .explore-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) rotateX(0);
}

.dropdown-title {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 14px 0;
  border-left: 3px solid var(--accent);
  padding-left: 8px;
  text-align: left;
}

.explore-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.city-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
  border-radius: 4px;
  text-decoration: none;
  background: var(--accent-faint);
  border: 1px solid var(--border-light);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.city-link:hover {
  background: var(--accent-faint);
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px color-mix(in srgb, var(--accent) 8%, transparent);
}

.city-name {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.city-pinyin {
  font-size: 9px;
  color: var(--text-muted);
  font-weight: bold;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

/* Mobile responsive menu */
.desktop-only {
  display: flex;
}

.mobile-controls {
  display: none;
}

.hamburger-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0;
}

.hamburger-line {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 1px;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.hamburger-line.line-1.active {
  transform: translateY(7px) rotate(45deg);
}

.hamburger-line.line-2.active {
  opacity: 0;
}

.hamburger-line.line-3.active {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile Drawer Styles */
.mobile-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  z-index: 140;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 270px;
  background: var(--card-bg);
  border-left: 1px solid var(--border);
  z-index: 150;
  padding: 36px 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-shadow: -8px 0 24px rgba(0,0,0,0.12);
  text-align: left;
}

.drawer-header {
  border-bottom: 2px solid var(--accent);
  padding-bottom: 12px;
}

.drawer-title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 2px;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drawer-nav-link {
  display: block;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: var(--fs-body);
  font-weight: 600;
  letter-spacing: 2px;
  border: 1px solid transparent;
  transition: color 0.25s, background 0.25s, border-color 0.25s;
}

.drawer-nav-link:hover,
.drawer-nav-link.active {
  color: var(--accent);
  background: var(--accent-faint);
  border-color: var(--accent);
}

.drawer-nav-link--external {
  color: var(--text-muted);
}

.drawer-cities-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px dashed var(--border);
  padding-top: 24px;
}

.drawer-section-title {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.drawer-cities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.drawer-city-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--accent-faint);
  border: 1px solid var(--border-light);
  text-decoration: none;
  transition: all 0.2s;
}

.drawer-city-badge:hover {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--accent);
}

/* Drawer Transitions */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
  opacity: 0.8;
}

/* ===== Main Content ===== */
.main-content {
  flex: 1;
  padding-top: var(--nav-height);
  position: relative;
}

/* ===== Footer ===== */
.main-footer {
  margin-top: auto;
  padding: 56px 24px;
  text-align: center;
  border-top: 1px solid var(--border-light);
  background: rgba(253, 250, 245, 0.5);
}

.main-footer {
  border-top: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg-primary) 50%, transparent);
}

.footer-inner {
  max-width: var(--container-max);
  margin: 0 auto;
}

.footer-text {
  font-family: var(--font-heading);
  font-size: 15px;
  color: var(--text-secondary);
  letter-spacing: 2px;
  line-height: 1.8;
}

.footer-divider {
  width: 48px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  margin: 20px auto;
}

.footer-copy {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 1.5px;
}

/* ===== Responsive Adaptations ===== */
@media (max-width: 1024px) {
  .header-inner {
    padding: 0 var(--sp-5);
  }
}

/* 导航栏只在 <820px 收进汉堡。旧版在 1024px 就砍掉全部导航，
   实测此时品牌+导航+右侧约 755px 内容，769–1024px 明明放得下却只剩汉堡 */
@media (max-width: 820px) {
  .desktop-only {
    display: none !important;
  }
  .mobile-controls {
    display: flex;
    align-items: center;
    gap: var(--sp-4);
  }
}

@media (max-width: 768px) {
  .main-footer {
    padding: 40px 16px;
  }
  .footer-text {
    font-size: 13px;
  }
}
</style>
