<template>
  <div class="poem-analysis detail-section">
    <h2 class="section-heading">AI 赏析</h2>

    <!-- 加载态 -->
    <div v-if="loading" class="analysis-loading">
      <div class="analysis-spinner"></div>
      <p>赏析生成中...</p>
    </div>

    <!-- 错误态 -->
    <div v-else-if="error" class="analysis-error">
      <p class="error-icon">!</p>
      <p>赏析加载失败</p>
      <button class="retry-btn" @click="fetchAnalysis">重试</button>
    </div>

    <!-- 空态 -->
    <div v-else-if="!analysis" class="analysis-empty">
      <p>暂无赏析内容</p>
    </div>

    <!-- 内容 -->
    <div v-else class="analysis-content">
      <!-- 逐句解读 -->
      <div v-if="analysis.lines?.length" class="analysis-lines">
        <h3 class="sub-heading">逐句解读</h3>
        <div v-for="item in analysis.lines" :key="item.line" class="analysis-line">
          <p class="line-text">{{ item.line }}</p>
          <p class="line-解读">{{ item.解读 }}</p>
        </div>
      </div>

      <!-- 情感分析 -->
      <div v-if="analysis.sentiment" class="analysis-sentiment">
        <h3 class="sub-heading">情感分析</h3>
        <p class="section-text">{{ analysis.sentiment }}</p>
      </div>

      <!-- 创作背景 -->
      <div v-if="analysis.background" class="analysis-background">
        <h3 class="sub-heading">创作背景</h3>
        <p class="section-text">{{ analysis.background }}</p>
      </div>

      <!-- 字词注解 -->
      <div v-if="analysis.annotations?.length" class="analysis-annotations">
        <h3 class="sub-heading">字词注解</h3>
        <div v-for="item in analysis.annotations" :key="item.word" class="analysis-annotation">
          <span class="word">{{ item.word }}</span>
          <span class="meaning">{{ item.meaning }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../api'

const props = defineProps({
  poemId: { type: Number, required: true },
})

const loading = ref(false)
const error = ref(null)
const analysis = ref(null)

async function fetchAnalysis() {
  if (!props.poemId) return
  loading.value = true
  error.value = null
  analysis.value = null
  try {
    const data = await api.get(`/poems/${props.poemId}/analysis`)
    analysis.value = data
  } catch (err) {
    console.error('加载赏析失败:', err)
    error.value = err.message || '赏析加载失败'
  } finally {
    loading.value = false
  }
}

watch(() => props.poemId, fetchAnalysis, { immediate: true })
</script>

<style scoped>
.poem-analysis {
  margin-bottom: 48px;
}

.section-heading {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
  letter-spacing: 2px;
  position: relative;
}

.section-heading::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--accent);
}

/* Loading */
.analysis-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px;
  gap: 16px;
}

.analysis-loading p {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.analysis-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--border-light);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.analysis-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px;
  gap: 8px;
}

.analysis-error .error-icon {
  font-size: 36px;
  font-weight: 900;
  color: var(--accent);
  opacity: 0.5;
  line-height: 1;
  margin-bottom: 4px;
}

.analysis-error p {
  font-size: 13px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

.retry-btn {
  margin-top: 12px;
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

.retry-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

/* Empty */
.analysis-empty {
  padding: 48px 20px;
  text-align: center;
}

.analysis-empty p {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

/* Sub headings */
.sub-heading {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 16px;
  letter-spacing: 2px;
  border-bottom: 1px dashed var(--border-light);
  padding-bottom: 8px;
  display: inline-block;
}

/* Section text */
.section-text {
  font-size: 15px;
  line-height: 2.2;
  color: var(--text-primary);
  text-indent: 2em;
  text-align: justify;
}

/* Lines */
.analysis-lines {
  margin-bottom: 32px;
}

.analysis-line {
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent);
}

.analysis-line .line-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 4px;
  margin-bottom: 8px;
  line-height: 1.8;
}

.analysis-line .line-解读 {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 2;
  text-indent: 2em;
}

/* Sentiment */
.analysis-sentiment {
  margin-bottom: 32px;
}

/* Background */
.analysis-background {
  margin-bottom: 32px;
}

/* Annotations */
.analysis-annotations {
  margin-bottom: 16px;
}

.analysis-annotation {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--border-light);
  align-items: baseline;
}

.analysis-annotation:last-child {
  border-bottom: none;
}

.analysis-annotation .word {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
  min-width: 60px;
  letter-spacing: 2px;
}

.analysis-annotation .meaning {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.8;
}

/* Inkwash theme overrides */
.theme-inkwash .analysis-line {
  border-left: 2px solid var(--accent);
  background: var(--bg-tertiary);
}

.theme-inkwash .sub-heading {
  border-bottom-style: solid;
}

.theme-inkwash .analysis-spinner {
  border-style: double;
  border-width: 4px;
  border-color: var(--border-light);
  border-top-color: var(--accent);
}

@media (max-width: 768px) {
  .analysis-line {
    padding: 12px 16px;
  }
  .analysis-line .line-text {
    font-size: 16px;
    letter-spacing: 2px;
  }
}
</style>
