<template>
  <div :class="themeClass">
    <ThemeSwitcher />
    <nav class="main-nav">
      <router-link to="/map" class="nav-link">地图</router-link>
      <router-link to="/poets" class="nav-link">诗人</router-link>
      <router-link to="/timeline" class="nav-link">时间线</router-link>
    </nav>
    <transition name="page-fade" mode="out-in">
      <router-view :key="theme" />
    </transition>
  </div>
</template>

<script setup>
import { useTheme } from './composables/useTheme'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import './styles/real.css'
import './styles/inkwash.css'

const { theme, themeClass } = useTheme()
</script>

<style>
.page-fade-enter-active, .page-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.page-fade-enter-from { opacity: 0; transform: scale(0.98); }
.page-fade-leave-to { opacity: 0; transform: scale(1.02); }
</style>

<style scoped>
.main-nav {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  display: flex;
  gap: 8px;
  background: var(--card-bg);
  padding: 8px 16px;
  border-radius: 24px;
  border: 1px solid var(--border);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.nav-link {
  padding: 8px 20px;
  border-radius: 16px;
  text-decoration: none;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
}
.nav-link:hover, .nav-link.router-link-active {
  background: var(--accent);
  color: #fff;
}
</style>
