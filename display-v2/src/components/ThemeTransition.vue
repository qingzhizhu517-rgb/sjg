<template>
  <div
    class="theme-transition"
    :class="[`phase-${transitionPhase}`]"
    aria-hidden="true"
    ref="containerRef"
  >
    <div class="mask" ref="maskEl"></div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useTheme } from '../composables/useTheme'
import gsap from 'gsap'

const {
  transitionPhase,
  transitionTarget,
  notifyCovered,
  notifyExited,
} = useTheme()

const containerRef = ref(null)
const maskEl = ref(null)

const reduceMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let fallbackTimer = null
const FALLBACK_MS = reduceMotion ? 600 : 1800

const clearFallback = () => {
  if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null }
}

// GSAP 淡入：enter 阶段
const animateEnter = () => {
  if (!maskEl.value) return
  gsap.set(maskEl.value, { opacity: 0 })
  gsap.to(maskEl.value, {
    opacity: 1,
    duration: reduceMotion ? 0.15 : 0.4,
    ease: 'power2.inOut',
    onComplete: () => {
      clearFallback()
      notifyCovered()
    },
  })
  fallbackTimer = setTimeout(() => {
    clearFallback()
    notifyCovered()
  }, FALLBACK_MS)
}

// GSAP 淡出：exit 阶段
const animateExit = () => {
  if (!maskEl.value) return
  gsap.to(maskEl.value, {
    opacity: 0,
    duration: reduceMotion ? 0.15 : 0.35,
    ease: 'power2.inOut',
    onComplete: () => {
      clearFallback()
      notifyExited()
    },
  })
  fallbackTimer = setTimeout(() => {
    clearFallback()
    notifyExited()
  }, FALLBACK_MS)
}

watch(transitionPhase, (phase) => {
  clearFallback()
  if (phase === 'enter') {
    // 确保 mask 可见
    if (containerRef.value) containerRef.value.style.display = ''
    animateEnter()
  } else if (phase === 'exit') {
    animateExit()
  } else if (phase === 'idle') {
    // 隐藏容器
    if (containerRef.value) containerRef.value.style.display = 'none'
  }
})

onBeforeUnmount(() => {
  clearFallback()
  gsap.killTweensOf(maskEl.value)
  notifyCovered()
  notifyExited()
})
</script>

<style scoped>
.theme-transition {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  display: none; /* idle 时隐藏 */
}

/* 转场进行中拦截点击（锁重复切换） */
.theme-transition.phase-enter,
.theme-transition.phase-cover,
.theme-transition.phase-exit {
  pointer-events: auto;
}

.mask {
  position: absolute;
  inset: 0;
  opacity: 0;
}

/* inkwash 暗色遮罩 */
.target-inkwash .mask {
  background:
    radial-gradient(circle at 50% 50%,
      rgba(50, 50, 50, 0.95) 0%,
      rgba(18, 18, 18, 1) 55%,
      rgba(6, 6, 6, 1) 100%);
}

/* real 暖金色遮罩 */
.target-real .mask {
  background:
    radial-gradient(circle at 50% 50%,
      rgba(120, 90, 30, 0.95) 0%,
      rgba(60, 45, 15, 1) 55%,
      rgba(30, 22, 8, 1) 100%);
}

/* 降低动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .mask {
    transition: opacity 200ms linear !important;
  }
}
</style>
