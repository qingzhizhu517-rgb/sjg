<template>
  <div class="page-container metrics-page">
    <div class="page-title">AI 运行指标</div>
    <div class="metrics-toolbar">
      <el-select v-model="hours" style="width: 140px" @change="load"><el-option label="最近 24 小时" :value="24" /><el-option label="最近 7 天" :value="168" /><el-option label="最近 30 天" :value="720" /></el-select>
      <el-button class="btn-outline" :loading="loading" @click="load">刷新</el-button>
    </div>
    <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />
    <div v-else class="metric-grid" v-loading="loading">
      <article v-for="item in cards" :key="item.key" class="metric-card">
        <span>{{ item.label }}</span><strong>{{ format(item.key, metrics[item.key]) }}</strong>
      </article>
    </div>
    <div class="metric-note">指标来自 AI 审计记录，不保存 API key 或原始客户端 IP。无证据请求比例可用于定位知识库缺口。</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

const hours = ref(24); const loading = ref(false); const error = ref(''); const metrics = ref({})
const cards = [
  { key: 'totalRequests', label: '请求总数' }, { key: 'successRequests', label: '成功请求' }, { key: 'errorRequests', label: '错误请求' },
  { key: 'errorRate', label: '错误率' }, { key: 'averageLatencyMs', label: '平均耗时' }, { key: 'noEvidenceRequests', label: '无证据请求' }, { key: 'feedbackRate', label: '反馈率' },
  { key: 'helpfulRate', label: '有帮助率' }, { key: 'helpfulFeedbackCount', label: '有帮助' },
  { key: 'unhelpfulFeedbackCount', label: '没帮助' }, { key: 'factualErrorCount', label: '事实有误' },
]
const format = (key, value) => key === 'averageLatencyMs' ? `${value || 0} ms`
  : ['errorRate', 'feedbackRate', 'helpfulRate'].includes(key) ? `${((value || 0) * 100).toFixed(1)}%`
    : (value || 0)
const load = async () => { loading.value = true; error.value = ''; try { metrics.value = await api.get('/admin/ai-metrics/summary', { params: { hours: hours.value } }) } catch (e) { error.value = e.message || '指标暂时无法加载' } finally { loading.value = false } }
onMounted(load)
</script>

<style scoped>
.metrics-toolbar { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 18px; }
.metric-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.metric-card { min-height: 100px; padding: 20px; border: 1px solid var(--border-light); background: #FAF6EF; display: flex; flex-direction: column; justify-content: space-between; }
.metric-card span { color: var(--text-secondary); font-size: 13px; }
.metric-card strong { color: var(--color-zhu); font-family: var(--font-display); font-size: 30px; font-weight: 500; }
.metric-note { margin-top: 18px; color: var(--text-secondary); font-size: 13px; line-height: 1.6; }
@media (max-width: 760px) { .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
