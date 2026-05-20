<template>
  <button class="theme-switcher" @click="toggle" :title="isReal ? '切换到动漫模式' : '切换到写实模式'">
    <transition name="flip" mode="out-in">
      <span v-if="isReal" key="real">📷</span>
      <span v-else key="anime">🖌️</span>
    </transition>
  </button>
</template>

<script setup>
import { useTheme } from '../composables/useTheme'
const { isReal, toggle } = useTheme()
</script>

<style scoped>
.theme-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: var(--card-bg);
  cursor: pointer;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.theme-switcher:hover {
  transform: scale(1.1);
  border-color: var(--accent);
}
.flip-enter-active, .flip-leave-active {
  transition: all 0.3s ease;
}
.flip-enter-from { opacity: 0; transform: rotateY(90deg); }
.flip-leave-to { opacity: 0; transform: rotateY(-90deg); }
</style>
