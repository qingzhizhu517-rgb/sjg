<template>
  <div :class="themeClass" class="app-root">
    <!-- Main Top Header -->
    <header class="main-header" :class="{ scrolled: isScrolled, 'mobile-menu-open': isMobileMenuOpen }">
      <div class="header-inner">
        <!-- Site Brand -->
        <router-link to="/map" class="site-brand" @click="closeMobileMenu">
          <div class="brand-logo-box">黄</div>
          <div class="brand-text">
            <span class="brand-title">SHANDONG</span>
            <span class="brand-subtitle">YELLOW RIVER</span>
          </div>
        </router-link>

        <!-- Desktop Navigation: Simplified & Exact Routing -->
        <nav class="main-nav desktop-only">
          <router-link to="/map" class="nav-link" :class="{ active: isMapActive }">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
              </svg>
            </span>
            <span class="nav-label">山河图志</span>
          </router-link>
          <router-link to="/poets" class="nav-link" :class="{ active: isPoetsActive }">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
            <span class="nav-label">齐鲁名士</span>
          </router-link>
          <router-link to="/timeline" class="nav-link" :class="{ active: isTimelineActive }">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 2h14M5 22h14M19 2v4c0 3.3-2.7 6-6 6h-2c-3.3 0-6-2.7-6-6V2M5 22v-4c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6v4" />
              </svg>
            </span>
            <span class="nav-label">文脉长河</span>
          </router-link>
        </nav>

        <!-- Header Right: Dropdown Explorer + Theme Switcher inline -->
        <div class="header-right desktop-only">
          <div class="explore-dropdown">
            <button class="explore-btn">
              探索山东 <span class="explore-arrow">▼</span>
            </button>
            <div class="explore-menu card">
              <h4 class="dropdown-title">沿黄九市文学景观</h4>
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
          <ThemeSwitcher />
        </div>

        <!-- Mobile Controls (Theme Switcher + Drawer Hamburger toggle) -->
        <div class="mobile-controls">
          <ThemeSwitcher />
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
          <router-link to="/map" class="drawer-nav-link" :class="{ active: isMapActive }" @click="closeMobileMenu">
            <span class="drawer-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
              </svg>
            </span>
            <span class="drawer-nav-label">山河图志</span>
          </router-link>
          <router-link to="/poets" class="drawer-nav-link" :class="{ active: isPoetsActive }" @click="closeMobileMenu">
            <span class="drawer-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
            <span class="drawer-nav-label">齐鲁名士</span>
          </router-link>
          <router-link to="/timeline" class="drawer-nav-link" :class="{ active: isTimelineActive }" @click="closeMobileMenu">
            <span class="drawer-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 2h14M5 22h14M19 2v4c0 3.3-2.7 6-6 6h-2c-3.3 0-6-2.7-6-6V2M5 22v-4c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6v4" />
              </svg>
            </span>
            <span class="drawer-nav-label">文脉长河</span>
          </router-link>
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
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-slide" mode="out-in">
          <component :is="Component" :key="$route.fullPath + theme" />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from './composables/useTheme'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import './styles/real.css'
import './styles/inkwash.css'

const route = useRoute()
const { theme, themeClass } = useTheme()

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

// Cities mapping list
const cities = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '滨州', '淄博', '东营']

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
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
/* Global page transition */
.page-slide-enter-active, .page-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.page-slide-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.page-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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
  z-index: 100;
  height: var(--nav-height);
  display: flex;
  align-items: center;
  background: rgba(253, 250, 245, 0.82);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid transparent;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.theme-inkwash class.main-header,
.theme-inkwash .main-header {
  background: rgba(244, 239, 228, 0.85);
  border-bottom: 1px solid rgba(200, 192, 176, 0.3);
}

.main-header.scrolled {
  border-bottom-color: var(--border-light);
  box-shadow: 0 4px 20px rgba(61, 43, 31, 0.05);
  height: calc(var(--nav-height) - 10px);
}

.theme-inkwash .main-header.scrolled {
  border-bottom-color: var(--border);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.header-inner {
  width: 100%;
  max-width: 1400px;
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
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  background: var(--accent);
  border-radius: 4px;
  line-height: 1;
  transition: all 0.3s;
}

.theme-real .brand-logo-box {
  background: #c23a2b;
}

.site-brand:hover .brand-logo-box {
  transform: rotate(-8deg) scale(1.06);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  text-align: left;
}

.brand-title {
  font-family: 'Times New Roman', Georgia, serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1px;
  line-height: 1.1;
}

.brand-subtitle {
  font-family: 'Times New Roman', Georgia, serif;
  font-size: 10px;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  line-height: 1.1;
  font-weight: 600;
}

/* Main Navigation Menu */
.main-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(61, 43, 31, 0.04);
}

.theme-inkwash .nav-link:hover {
  background: rgba(194, 58, 43, 0.04);
}

.nav-link.active {
  color: var(--accent);
}

.theme-real .nav-link.active {
  background: rgba(184, 134, 11, 0.05);
  box-shadow: inset 0 0 10px rgba(184, 134, 11, 0.05);
}

.theme-inkwash .nav-link.active {
  background: var(--card-bg);
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(194, 58, 43, 0.08);
}

/* Underline link sliding animation */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 24px;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link:hover::after,
.nav-link.active::after {
  transform: translateX(-50%) scaleX(1);
}

/* Micro-animations for page icons */
.nav-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
}

.nav-link:hover:nth-child(1) .nav-icon {
  animation: spin 1.2s ease-in-out;
}

.nav-link:hover:nth-child(2) .nav-icon {
  animation: wiggle 0.6s ease-in-out infinite;
}

.nav-link:hover:nth-child(3) .nav-icon {
  animation: flip 0.8s ease-in-out;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  25% { transform: rotate(-8deg) translateY(-2px); }
  75% { transform: rotate(8deg) translateY(1px); }
}

@keyframes flip {
  0% { transform: scaleY(1); }
  50% { transform: scaleY(-1); }
  100% { transform: scaleY(1); }
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
  border: 1px solid var(--accent);
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
  border-radius: 20px;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 1px;
}

.explore-btn:hover {
  background: var(--accent);
  color: #fff;
}

.explore-arrow {
  font-size: 8px;
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
  box-shadow: 0 12px 36px rgba(61, 43, 31, 0.12);
  opacity: 0;
  visibility: hidden;
  transform: translateY(15px) rotateX(-12deg);
  transform-origin: top right;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 120;
  backdrop-filter: blur(20px);
}

.explore-dropdown:hover .explore-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) rotateX(0);
}

.dropdown-title {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
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
  background: rgba(0, 0, 0, 0.01);
  border: 1px solid var(--border-light);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.city-link:hover {
  background: rgba(142, 53, 46, 0.04);
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(142, 53, 46, 0.08);
}

.theme-real .city-link:hover {
  background: rgba(184, 134, 11, 0.04);
  box-shadow: 0 4px 10px rgba(184, 134, 11, 0.08);
}

.city-name {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
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
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 2px;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drawer-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 700;
  border: 1px solid transparent;
  transition: all 0.25s;
}

.drawer-nav-link:hover,
.drawer-nav-link.active {
  color: var(--accent);
  background: rgba(142, 53, 46, 0.04);
  border-color: var(--accent);
}

.theme-real .drawer-nav-link:hover,
.theme-real .drawer-nav-link.active {
  background: rgba(184, 134, 11, 0.04);
}

.drawer-nav-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-nav-icon svg {
  width: 100%;
  height: 100%;
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
  font-weight: 700;
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
  font-weight: 700;
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--border-light);
  text-decoration: none;
  transition: all 0.2s;
}

.drawer-city-badge:hover {
  background: var(--accent);
  color: #fff;
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
}

/* ===== Footer ===== */
.main-footer {
  margin-top: auto;
  padding: 56px 24px;
  text-align: center;
  border-top: 1px solid var(--border-light);
  background: rgba(253, 250, 245, 0.5);
}

.theme-inkwash .main-footer {
  border-top: 1px solid var(--border);
  background: rgba(244, 239, 228, 0.5);
}

.footer-inner {
  max-width: 700px;
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
    padding: 0 24px;
  }
  .desktop-only {
    display: none !important;
  }
  .mobile-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .brand-subtitle {
    display: none;
  }
  .main-footer {
    padding: 40px 16px;
  }
  .footer-text {
    font-size: 13px;
  }
}
</style>
