<template>
  <div class="poem-composer-view">
    <div class="view-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h1 class="view-title">AI 诗人</h1>
    </div>
    <PoemComposer />
  </div>
</template>

<script setup>
import PoemComposer from '../components/PoemComposer.vue'
</script>

<style scoped>
.poem-composer-view {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 20px;
}

.view-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.back-btn {
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: var(--bg-hover);
}

.view-title {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}
</style>
