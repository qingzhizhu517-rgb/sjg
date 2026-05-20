<template>
  <div :class="themeClass">
    <ThemeSwitcher />
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
