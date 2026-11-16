<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <div>
        <h1 class="dashboard-title">运营总览</h1>
        <p class="dashboard-subtitle">汇总内容资产、审批待办与数据质量，帮助管理端先把资料库维护扎实。</p>
      </div>
      <el-button class="btn-outline" :loading="loading" @click="loadDashboard">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <div v-if="loading" class="dashboard-loading">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else-if="errorMsg" class="dashboard-error">
      <el-empty :description="errorMsg">
        <el-button class="btn-zhu" type="primary" @click="loadDashboard">重新加载</el-button>
      </el-empty>
    </div>

    <template v-else>
      <section class="kpi-grid">
        <router-link
          v-for="card in kpiCards"
          :key="card.key"
          :to="card.route"
          class="kpi-card"
        >
          <span class="kpi-label">{{ card.label }}</span>
          <strong class="kpi-value">{{ card.value }}</strong>
        </router-link>
      </section>

      <section class="dashboard-grid">
        <div class="dashboard-panel quality-panel">
          <div class="panel-header">
            <h2>数据质量待办</h2>
            <span class="panel-note">优先补齐会影响展示端理解的数据</span>
          </div>
          <div class="quality-list">
            <router-link
              v-for="metric in summary.quality || []"
              :key="metric.key"
              :to="qualityRoute(metric)"
              class="quality-row"
            >
              <div>
                <span class="quality-label">{{ metric.label }}</span>
                <span class="quality-samples">{{ sampleText(metric.samples) }}</span>
              </div>
              <el-tag :type="metric.count > 0 ? 'warning' : 'success'" effect="light">
                {{ metric.count }}
              </el-tag>
            </router-link>
          </div>
        </div>

        <div class="dashboard-panel quick-panel">
          <div class="panel-header">
            <h2>快捷入口</h2>
            <span class="panel-note">常用维护动作</span>
          </div>
          <div class="quick-actions">
            <router-link to="/poets" class="quick-action">
              <el-icon><User /></el-icon>
              <span>维护诗人</span>
            </router-link>
            <router-link to="/spots" class="quick-action">
              <el-icon><Location /></el-icon>
              <span>维护景点</span>
            </router-link>
            <router-link to="/poems" class="quick-action">
              <el-icon><Document /></el-icon>
              <span>维护诗词</span>
            </router-link>
            <router-link to="/users?status=pending" class="quick-action">
              <el-icon><UserFilled /></el-icon>
              <span>审批用户</span>
            </router-link>
          </div>
        </div>
      </section>

      <section class="distribution-grid">
        <div class="dashboard-panel">
          <div class="panel-header">
            <h2>沿黄九市景点分布</h2>
            <span class="panel-note">按地区统计景点数量</span>
          </div>
          <div class="bar-list">
            <div v-for="region in summary.regions || []" :key="region.name" class="bar-row">
              <span class="bar-name">{{ region.name }}</span>
              <div class="bar-track">
                <span class="bar-fill" :style="{ width: `${barWidth(region.spotCount, maxRegionCount)}%` }"></span>
              </div>
              <span class="bar-value">{{ region.spotCount }}</span>
            </div>
          </div>
        </div>

        <div class="dashboard-panel">
          <div class="panel-header">
            <h2>朝代内容分布</h2>
            <span class="panel-note">诗人、诗词、事件覆盖情况</span>
          </div>
          <div class="dynasty-list">
            <div v-for="dynasty in summary.dynasties || []" :key="dynasty.dynastyId" class="dynasty-row">
              <span class="dynasty-name">{{ dynasty.name }}</span>
              <div class="dynasty-tags">
                <el-tag size="small">诗人 {{ dynasty.poetCount }}</el-tag>
                <el-tag size="small" type="success">诗词 {{ dynasty.poemCount }}</el-tag>
                <el-tag size="small" type="warning">事件 {{ dynasty.eventCount }}</el-tag>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../api'
import { buildKpis, maxDistributionValue, qualityRoute } from '../utils/dashboard'

const summary = ref({
  totals: {},
  pending: {},
  quality: [],
  regions: [],
  dynasties: []
})
const loading = ref(false)
const errorMsg = ref('')

const kpiCards = computed(() => buildKpis(summary.value))
const maxRegionCount = computed(() => maxDistributionValue(summary.value.regions || [], 'spotCount'))

const loadDashboard = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    summary.value = await api.get('/admin/dashboard')
  } catch (err) {
    errorMsg.value = err.message || '运营总览加载失败'
  } finally {
    loading.value = false
  }
}

const sampleText = (samples = []) => {
  if (!samples.length) return '暂无待处理样例'
  return samples.map(item => item.name).filter(Boolean).slice(0, 3).join('、')
}

const barWidth = (value, max) => {
  if (!value) return 4
  return Math.max(8, Math.round((value / max) * 100))
}

onMounted(loadDashboard)
</script>

<style scoped>
.dashboard-page {
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.dashboard-title {
  font-family: var(--font-display);
  font-size: 24px;
  color: var(--color-mo);
  letter-spacing: 4px;
  margin: 0 0 8px;
}

.dashboard-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.dashboard-loading,
.dashboard-error,
.dashboard-panel,
.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
}

.dashboard-loading,
.dashboard-error {
  padding: 24px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 92px;
  padding: 16px;
  color: inherit;
  text-decoration: none;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.kpi-label {
  color: var(--text-secondary);
  font-size: 13px;
}

.kpi-value {
  color: var(--color-zhu);
  font-size: 28px;
  line-height: 1;
  font-family: var(--font-mono);
}

.dashboard-grid,
.distribution-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 16px;
  margin-bottom: 16px;
}

.dashboard-panel {
  padding: 18px;
}

.panel-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-header h2 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
  letter-spacing: 1px;
}

.panel-note {
  color: var(--text-muted);
  font-size: 12px;
}

.quality-list,
.bar-list,
.dynasty-list,
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quality-row,
.quick-action {
  color: inherit;
  text-decoration: none;
}

.quality-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: #FAF6EF;
}

.quality-label {
  display: block;
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 4px;
}

.quality-samples {
  display: block;
  color: var(--text-muted);
  font-size: 12px;
  min-height: 18px;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: #FAF6EF;
  color: var(--text-secondary);
}

.quick-action:hover,
.quality-row:hover {
  border-color: var(--color-jin);
  color: var(--color-zhu);
}

.bar-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 36px;
  align-items: center;
  gap: 10px;
}

.bar-name,
.bar-value,
.dynasty-name {
  color: var(--text-secondary);
  font-size: 13px;
}

.bar-track {
  height: 8px;
  border-radius: 99px;
  background: var(--color-xuan-dark);
  overflow: hidden;
}

.bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-zhu), var(--color-jin));
}

.dynasty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 36px;
  border-bottom: 1px solid var(--border-light);
}

.dynasty-row:last-child {
  border-bottom: 0;
}

.dynasty-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

@media (max-width: 1180px) {
  .kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .dashboard-grid,
  .distribution-grid {
    grid-template-columns: 1fr;
  }
}
</style>
