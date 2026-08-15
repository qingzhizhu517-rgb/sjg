<template>
  <div class="poem-analysis detail-section">
    <h2 class="section-heading">AI 赏析</h2>

    <!-- 分析维度标签页 -->
    <div class="analysis-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

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

    <!-- 内容 -->
    <div v-else class="analysis-content">
      <!-- 综合赏析（默认） -->
      <div v-if="activeTab === 'comprehensive'" class="analysis-comprehensive">
        <!-- 逐句解读 -->
        <div v-if="analysis.lines?.length" class="analysis-lines">
          <h3 class="sub-heading">逐句解读</h3>
          <div v-for="item in analysis.lines" :key="item.line" class="analysis-line">
            <p class="line-text">{{ item.line }}</p>
            <p class="line解读">{{ item.解读 }}</p>
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

      <!-- 情感分析 -->
      <div v-if="activeTab === 'sentiment'" class="analysis-tab-content">
        <div v-if="sentimentAnalysis" class="sentiment-detail">
          <h3 class="sub-heading">情感分析</h3>
          <p class="section-text">{{ sentimentAnalysis }}</p>
        </div>
        <div v-else class="analysis-empty">
          <p>暂无情感分析数据</p>
        </div>
      </div>

      <!-- 意象分析 -->
      <div v-if="activeTab === 'imagery'" class="analysis-tab-content">
        <div v-if="imageryAnalysis" class="imagery-detail">
          <h3 class="sub-heading">核心意象</h3>
          <div v-for="item in imageryAnalysis.core" :key="item.image" class="imagery-item">
            <span class="imagery-name">{{ item.image }}</span>
            <span class="imagery-meaning">{{ item.meaning }}</span>
          </div>
          <h3 class="sub-heading">意象组合</h3>
          <p class="section-text">{{ imageryAnalysis.composition }}</p>
        </div>
        <div v-else class="analysis-empty">
          <p>暂无意象分析数据</p>
        </div>
      </div>

      <!-- 手法分析 -->
      <div v-if="activeTab === 'technique'" class="analysis-tab-content">
        <div v-if="techniqueAnalysis" class="technique-detail">
          <h3 class="sub-heading">修辞手法</h3>
          <div v-for="item in techniqueAnalysis.rhetoric" :key="item.technique" class="technique-item">
            <span class="technique-name">{{ item.technique }}</span>
            <span class="technique-example">{{ item.example }}</span>
          </div>
          <h3 class="sub-heading">表现手法</h3>
          <p class="section-text">{{ techniqueAnalysis.expression }}</p>
        </div>
        <div v-else class="analysis-empty">
          <p>暂无手法分析数据</p>
        </div>
      </div>

      <!-- 翻译赏析 -->
      <div v-if="activeTab === 'translation'" class="analysis-tab-content">
        <div v-if="translationAnalysis" class="translation-detail">
          <h3 class="sub-heading">白话文翻译</h3>
          <p class="section-text">{{ translationAnalysis.modern }}</p>
          <h3 class="sub-heading">英文翻译</h3>
          <p class="section-text">{{ translationAnalysis.english }}</p>
          <h3 class="sub-heading">赏析</h3>
          <p class="section-text">{{ translationAnalysis.appreciation }}</p>
        </div>
        <div v-else class="analysis-empty">
          <p>暂无翻译赏析数据</p>
        </div>
      </div>

      <!-- 相关诗词 -->
      <div v-if="activeTab === 'related'" class="analysis-tab-content">
        <div v-if="relatedPoems?.length" class="related-poems">
          <div v-for="poem in relatedPoems" :key="poem.id" class="related-poem-item">
            <h4 class="related-poem-title">{{ poem.title }}</h4>
            <p class="related-poem-author">{{ poem.poet }} · {{ poem.dynasty }}</p>
            <p class="related-poem-reason">{{ poem.reason }}</p>
          </div>
        </div>
        <div v-else class="analysis-empty">
          <p>暂无相关诗词推荐</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import api from '../api'

const props = defineProps({
  poemId: { type: Number, required: true },
})

const loading = ref(false)
const error = ref(null)
const analysis = ref(null)
const activeTab = ref('comprehensive')

// 标签页配置
const tabs = [
  { key: 'comprehensive', label: '综合赏析' },
  { key: 'sentiment', label: '情感分析' },
  { key: 'imagery', label: '意象分析' },
  { key: 'technique', label: '手法分析' },
  { key: 'translation', label: '翻译赏析' },
  { key: 'related', label: '相关诗词' },
]

// 计算属性：提取各维度分析数据（后端返回 {analysis:{...},model,generatedAt}）
const sentimentAnalysis = computed(() => analysis.value?.sentiment || '')
const imageryAnalysis = computed(() => analysis.value?.imagery)
const techniqueAnalysis = computed(() => analysis.value?.technique)
const translationAnalysis = computed(() => analysis.value?.translation)
const relatedPoems = computed(() => analysis.value?.related_poems)

async function fetchAnalysis() {
  if (!props.poemId) return
  loading.value = true
  error.value = null
  analysis.value = null
  try {
    // 请求综合分析接口，包含所有维度
    const data = await api.get(`/poems/${props.poemId}/analysis`)
    // 接口返回 {analysis, model, generatedAt}: 取内层 analysis 对象
    analysis.value = (data && data.analysis) || data
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
  border-bottom: 1px solid var(--border-color);
}

.analysis-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  background: var(--bg-hover);
}

.tab-btn.active {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--accent);
}

.analysis-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
}

.analysis-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.analysis-error {
  text-align: center;
  padding: 40px 0;
}

.error-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: var(--accent);
  color: var(--text-on-accent);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.analysis-content {
  line-height: 1.8;
}

.sub-heading {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 24px 0 12px;
}

.section-text {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.analysis-line {
  margin-bottom: 16px;
  padding-left: 16px;
  border-left: 3px solid var(--accent);
}

.line-text {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.line解读 {
  color: var(--text-secondary);
}

.analysis-annotation {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.word {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 60px;
}

.meaning {
  color: var(--text-secondary);
}

.imagery-item,
.technique-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.imagery-name,
.technique-name {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 80px;
}

.imagery-meaning,
.technique-example {
  color: var(--text-secondary);
}

.related-poem-item {
  padding: 16px;
  margin-bottom: 12px;
  background: var(--bg-secondary);
  border-radius: 4px;
  border-left: 3px solid var(--accent);
}

.related-poem-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.related-poem-author {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.related-poem-reason {
  color: var(--text-secondary);
  font-size: 14px;
}

.analysis-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--text-muted);
}

/* 响应式 */
@media (max-width: 768px) {
  .analysis-tabs {
    gap: 4px;
  }
  
  .tab-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
