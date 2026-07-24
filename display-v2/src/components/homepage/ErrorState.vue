<template>
  <div class="err">
    <p class="err__icon">墨</p>
    <p class="err__text">{{ message || '数据加载失败，请稍后重试' }}</p>
    <button v-if="retry" class="err__btn" @click="$emit('retry')">重新加载</button>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: '' },
  retry: { type: Boolean, default: true },
})
defineEmits(['retry'])
</script>

<style scoped>
.err {
  text-align: center;
  padding: 56px 20px;
}
.err__icon {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 900;
  color: var(--accent);
  opacity: 0.4;
  margin: 0 0 14px 0;
  line-height: 1;
}
.err__text {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 18px 0;
  letter-spacing: 1px;
}
.err__btn {
  padding: 8px 22px;
  background: none;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s;
}
.err__btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}
</style>
