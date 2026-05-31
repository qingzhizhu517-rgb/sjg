<template>
  <button
    class="theme-switcher"
    @click="toggle"
    :title="isReal ? '切换到水墨模式' : '切换到写实模式'"
    :aria-label="isReal ? '切换到水墨模式' : '切换到写实模式'"
  >
    <transition name="icon-flip" mode="out-in">
      <svg v-if="isReal" key="real" class="switcher-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3C7 3 3 7 3 12" stroke-dasharray="4 3" />
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" opacity="0.3" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke-width="1" />
      </svg>
      <svg v-else key="ink" class="switcher-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20 2L4 18" stroke-width="2" stroke-linecap="round" />
        <path d="M18 4c2 2 3 5 2 8-1 3-4 5-7 5" stroke-width="1.5" />
        <path d="M4 18c-1-1-1-3 0-4s3-1 4 0" fill="currentColor" opacity="0.2" stroke="none" />
        <circle cx="7" cy="17" r="1.5" fill="currentColor" opacity="0.15" stroke="none" />
      </svg>
    </transition>
    <span class="switcher-label">{{ isReal ? '写实' : '水墨' }}</span>
  </button>
</template>

<script setup>
import { useTheme } from '../composables/useTheme'
const { isReal, toggle } = useTheme()
</script>

<style scoped>
.theme-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px 8px 10px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  backdrop-filter: blur(12px);
}

.theme-switcher:hover {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.switcher-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.switcher-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
}

.icon-flip-enter-active,
.icon-flip-leave-active {
  transition: all 0.3s ease;
}
.icon-flip-enter-from {
  opacity: 0;
  transform: rotateY(90deg) scale(0.8);
}
.icon-flip-leave-to {
  opacity: 0;
  transform: rotateY(-90deg) scale(0.8);
}

@media (max-width: 768px) {
  .theme-switcher {
    padding: 6px 10px;
  }
  .switcher-label {
    display: none;
  }
}
</style>
