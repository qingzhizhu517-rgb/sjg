<template>
  <div
    class="route-progress"
    :class="{ 'route-progress--done': progress >= 1 }"
    :style="{ transform: `scaleX(${progress})`, opacity: visible ? 1 : 0 }"
    aria-hidden="true"
  ></div>
</template>

<script setup>
defineProps({
  progress: { type: Number, default: 0 }, // 0-1
  visible: { type: Boolean, default: false },
})
</script>

<style scoped>
.route-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 200;
  background: var(--accent);
  transform-origin: left center;
  transition:
    transform 0.2s ease-out,
    opacity 0.3s ease 0.15s;
  box-shadow: 0 0 6px color-mix(in srgb, var(--accent) 55%, transparent);
  pointer-events: none;
}

.route-progress--done {
  transition:
    transform 0.15s ease-in,
    opacity 0.3s ease 0.2s;
}

@media (prefers-reduced-motion: reduce) {
  .route-progress {
    transition: opacity 0.1s;
  }
}
</style>
