<template>
  <div :class="themeClass" class="app-root">
    <ThemeSwitcher />

    <header class="main-header" :class="{ scrolled: isScrolled }">
      <div class="header-inner">
        <router-link to="/map" class="site-brand">
          <span class="brand-icon">河</span>
          <div class="brand-text">
            <span class="brand-title">文学景观</span>
            <span class="brand-subtitle">黄河流域 · 山东段</span>
          </div>
        </router-link>

        <nav class="main-nav">
          <router-link to="/map" class="nav-link">
            <span class="nav-icon">地</span>
            <span class="nav-label">地图总览</span>
          </router-link>
          <router-link to="/poets" class="nav-link">
            <span class="nav-icon">诗</span>
            <span class="nav-label">诗人长廊</span>
          </router-link>
          <router-link to="/timeline" class="nav-link">
            <span class="nav-icon">史</span>
            <span class="nav-label">朝代年轮</span>
          </router-link>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-slide" mode="out-in">
          <component :is="Component" :key="$route.fullPath + theme" />
        </transition>
      </router-view>
    </main>

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
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from './composables/useTheme'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import './styles/real.css'
import './styles/inkwash.css'

const { theme, themeClass } = useTheme()

const isScrolled = ref(false)
const handleScroll = () => { isScrolled.value = window.scrollY > 20 }
onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
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

/* ===== Header ===== */
.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--nav-height);
  display: flex;
  align-items: center;
  background: rgba(253, 250, 245, 0.85);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.theme-inkwash .main-header {
  background: rgba(244, 239, 228, 0.85);
}

.main-header.scrolled {
  border-bottom-color: var(--border-light);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
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

/* Brand */
.site-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
  border: 2px solid var(--accent);
  border-radius: 4px;
  line-height: 1;
}

.theme-inkwash .brand-icon {
  border-radius: 2px;
  border-width: 2px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.brand-title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 1px;
  line-height: 1.2;
}

/* Navigation */
.main-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.25s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.nav-link.router-link-active {
  color: var(--accent);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
}

.nav-icon {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  opacity: 0.6;
}

.nav-link.router-link-active .nav-icon {
  opacity: 1;
}

/* ===== Main Content ===== */
.main-content {
  flex: 1;
  padding-top: var(--nav-height);
}

/* ===== Footer ===== */
.main-footer {
  margin-top: auto;
  padding: 48px 24px;
  text-align: center;
  border-top: 1px solid var(--border-light);
}

.footer-inner {
  max-width: 600px;
  margin: 0 auto;
}

.footer-text {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--text-secondary);
  letter-spacing: 2px;
  line-height: 1.8;
}

.footer-divider {
  width: 32px;
  height: 1px;
  background: var(--border);
  margin: 16px auto;
}

.footer-copy {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .header-inner {
    padding: 0 20px;
  }
  .brand-subtitle {
    display: none;
  }
  .nav-label {
    display: none;
  }
  .nav-link {
    padding: 8px 12px;
  }
}
</style>
