<template>
  <div class="skel" :style="{ height: height, width: width }">
    <div class="skel__shimmer"></div>
  </div>
</template>

<script setup>
defineProps({
  height: { type: String, default: '120px' },
  width: { type: String, default: '100%' },
})
</script>

<style scoped>
.skel {
  position: relative;
  background: color-mix(in srgb, var(--text-primary) 5%, transparent);
  border: 1px solid var(--border-light);
  border-radius: 4px;
  overflow: hidden;
}
.theme-inkwash .skel {
  background: rgba(0, 0, 0, 0.05);
}
.skel__shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.55),
    transparent
  );
  animation: skel-shimmer 1.6s infinite;
}
@keyframes skel-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
@media (prefers-reduced-motion: reduce) {
  .skel__shimmer { animation: none; opacity: 0.4; }
}
</style>
