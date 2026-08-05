<template>
  <div
    class="theme-transition"
    :class="[`phase-${transitionPhase}`, `target-${transitionTarget || 'ink'}`]"
    :style="{ '--ox': ox, '--oy': oy }"
    aria-hidden="true"
  >
    <div
      class="mask"
      :class="`mask-${transitionTarget || 'ink'}`"
      ref="maskEl"
      @transitionend="onTransitionEnd"
    ></div>
  </div>
</template>

<script setup>
import { computed, watch, onBeforeUnmount, ref } from 'vue'
import { useTheme } from '../composables/useTheme'

const {
  transitionPhase,
  transitionTarget,
  transitionOrigin,
  notifyCovered,
  notifyExited,
} = useTheme()

const maskEl = ref(null)

// 兜底超时：transitionend 未触发时（标签页后台节流 / 浏览器不支持 clip-path 过渡）
// 强制推进，避免 switchTheme 的 await 永久挂起。
const reduceMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const FALLBACK_MS = reduceMotion ? 600 : 1800

const ox = computed(() => `${(transitionOrigin.value.x * 100).toFixed(2)}%`)
const oy = computed(() => `${(transitionOrigin.value.y * 100).toFixed(2)}%`)

let fallbackTimer = null
let done = false

const clearFallback = () => {
  if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null }
}

const advance = () => {
  if (done) return
  done = true
  clearFallback()
  if (transitionPhase.value === 'enter') notifyCovered()
  else if (transitionPhase.value === 'exit') notifyExited()
}

// CSS 过渡完成 -> 推进状态机。比固定 setTimeout 更精确（CSS 慢则 JS 等，快则不空等），
// 且天然适配 reduced-motion 的 opacity 过渡与不同设备速度。
const onTransitionEnd = (e) => {
  if (e.propertyName !== 'clip-path' && e.propertyName !== 'opacity') return
  advance()
}

watch(transitionPhase, (phase) => {
  clearFallback()
  done = false
  if (phase === 'enter' || phase === 'exit') {
    // 强制重排：phase 类切换时 transition 声明与 clip-path 值同帧应用，
    // 部分浏览器需一次 reflow 才触发过渡（避免"transition 从无到有"陷阱）。
    // flush='post' 确保 DOM 已应用 phase 类后再读布局。
    void maskEl.value?.offsetHeight
    fallbackTimer = setTimeout(advance, FALLBACK_MS)
  }
}, { flush: 'post' })

onBeforeUnmount(() => {
  clearFallback()
  // 组件卸载时让挂起的 switchTheme 解除阻塞，避免死锁
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
}

/* 仅转场进行时提升合成层，idle 不占 GPU */
.phase-enter .mask,
.phase-cover .mask,
.phase-exit .mask {
  will-change: clip-path;
}

/* ---- inkwash：墨晕圆形 clip-path 扩散（以点击处为圆心）----
   注意：transition 声明在 .phase-* 类上而非 .mask-ink，避免 idle 时
   --ox/--oy 变化触发不可见的圆心过渡，干扰 enter 阶段的半径扩散。*/
.mask-ink {
  background:
    radial-gradient(circle at var(--ox, 50%) var(--oy, 50%),
      rgba(50, 50, 50, 0.95) 0%,
      rgba(18, 18, 18, 1) 55%,
      rgba(6, 6, 6, 1) 100%),
    repeating-linear-gradient(45deg,
      rgba(255, 255, 255, 0.02) 0 2px,
      transparent 2px 5px);
  clip-path: circle(0% at var(--ox, 50%) var(--oy, 50%));
}
.phase-enter .mask-ink,
.phase-cover .mask-ink {
  clip-path: circle(150% at var(--ox, 50%) var(--oy, 50%));
  transition: clip-path 450ms cubic-bezier(0.4, 0, 0.2, 1);
}
.phase-exit .mask-ink {
  clip-path: circle(0% at var(--ox, 50%) var(--oy, 50%));
  transition: clip-path 380ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ---- real：暖金光条横扫（inset clip 横向揭开）---- */
.mask-real {
  background: linear-gradient(
    90deg,
    #1a1206 0%,
    #3a2a0a 18%,
    #7a5c16 38%,
    #d9b85a 48%,
    #f3d98a 50%,
    #d9b85a 52%,
    #7a5c16 62%,
    #3a2a0a 82%,
    #1a1206 100%
  );
  clip-path: inset(0 100% 0 0); /* 初始宽度 0（右侧裁 100%） */
}
.phase-enter .mask-real,
.phase-cover .mask-real {
  clip-path: inset(0 0 0 0); /* 铺满 */
  transition: clip-path 450ms cubic-bezier(0.4, 0, 0.2, 1);
}
.phase-exit .mask-real {
  clip-path: inset(0 0 0 100%); /* 从左收缩消失（光带扫出） */
  transition: clip-path 380ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* 降低动效偏好：退化为快速淡入淡出 */
@media (prefers-reduced-motion: reduce) {
  .mask {
    transition: opacity 200ms linear !important;
    clip-path: none !important;
    opacity: 0;
  }
  .phase-enter .mask,
  .phase-cover .mask {
    opacity: 1;
  }
  .phase-exit .mask {
    opacity: 0;
  }
}
</style>
