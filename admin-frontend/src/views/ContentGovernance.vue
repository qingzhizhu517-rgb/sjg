<template>
  <div class="page-container governance-page">
    <div class="page-heading">
      <div>
        <div class="page-title">内容来源与审核</div>
        <p class="page-subtitle">先登记可核验来源，再关联实体并完成审核，确保公开内容可追溯。</p>
      </div>
      <el-tag type="warning" effect="plain">公开 AI 仅使用已发布内容</el-tag>
    </div>

    <el-tabs v-model="activeTab" class="governance-tabs">
      <el-tab-pane label="来源文献" name="sources">
        <div class="toolbar-row">
          <el-input v-model="sourceKeyword" clearable placeholder="搜索标题或作者/机构" class="search-input" @keyup.enter="loadSources" />
          <el-button class="btn-outline" @click="loadSources"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button type="primary" class="btn-zhu" @click="openSourceDialog()"><el-icon><Plus /></el-icon>新增来源</el-button>
        </div>
        <el-alert v-if="sourceError" type="error" :closable="false" show-icon role="alert" class="page-error">
          <template #title>来源列表加载失败</template>
          <template #default><span>{{ sourceError }}</span><el-button link type="primary" @click="loadSources"><el-icon><Refresh /></el-icon>重试</el-button></template>
        </el-alert>
        <el-empty v-if="sourceLoaded && !sourceLoading && !sourceError && !sources.length" description="暂无已登记来源" />
        <div v-if="!sourceError && !(sourceLoaded && !sourceLoading && !sources.length)" class="table-scroll">
          <el-table v-loading="sourceLoading" :data="sources" stripe class="traditional-table">
            <el-table-column prop="title" label="来源名称" min-width="220" show-overflow-tooltip />
            <el-table-column prop="sourceType" label="类型" width="120" />
            <el-table-column prop="authorOrg" label="作者/机构" min-width="180" show-overflow-tooltip />
            <el-table-column prop="publicationYear" label="年份" width="90" />
            <el-table-column prop="identifier" label="标识" min-width="140" show-overflow-tooltip />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }"><el-button type="primary" link @click="openSourceDialog(row)"><el-icon><Edit /></el-icon>编辑</el-button></template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination v-if="!sourceError && sourceTotal > 0" v-model:current-page="sourcePage" v-model:page-size="sourceSize" class="traditional-pagination" :total="sourceTotal" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @current-change="loadSources" @size-change="loadSources" />
      </el-tab-pane>

      <el-tab-pane label="实体关联" name="links">
        <el-alert title="关联前请确认实体已存在；页码、段落和原文摘录是后续核验的关键证据。" type="info" :closable="false" show-icon />
        <el-alert v-if="sourceOptionsError" type="error" :closable="false" show-icon role="alert" class="page-error">
          <template #title>来源选项加载失败</template>
          <template #default><span>{{ sourceOptionsError }}</span><el-button link type="primary" @click="loadSourceOptions"><el-icon><Refresh /></el-icon>重试</el-button></template>
        </el-alert>
        <el-alert v-if="linkActionError" type="error" :closable="false" show-icon role="alert" class="page-error">
          <template #title>来源关联保存失败</template>
          <template #default><span>{{ linkActionError }}</span><el-button v-if="linkActionRetry" link type="primary" @click="retryLinkAction"><el-icon><Refresh /></el-icon>重试</el-button></template>
        </el-alert>
        <el-form :model="linkForm" label-width="100px" class="link-form">
          <el-form-item label="实体类型" required><el-select v-model="linkForm.entityType"><el-option v-for="item in entityTypes" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
          <el-form-item label="实体 ID" required><el-input-number v-model="linkForm.entityId" :min="1" controls-position="right" /></el-form-item>
          <el-form-item label="来源文献" required><el-select v-model="linkForm.sourceDocumentId" filterable placeholder="选择已登记来源"><el-option v-for="source in sourceOptions" :key="source.id" :label="`${source.title}（${source.id}）`" :value="source.id" /></el-select></el-form-item>
          <el-form-item label="页码/定位"><el-input v-model="linkForm.locator" placeholder="如第 12 页、网页段落标题" /></el-form-item>
          <el-form-item label="原文摘录"><el-input v-model="linkForm.quote" type="textarea" :rows="3" placeholder="粘贴与实体直接相关的原文" /></el-form-item>
          <el-form-item label="关联说明"><el-input v-model="linkForm.note" type="textarea" :rows="2" placeholder="说明这条来源支持实体的哪一项事实" /></el-form-item>
          <el-form-item><el-button type="primary" class="btn-zhu" :loading="linkSaving" @click="submitLink"><el-icon><Link /></el-icon>保存关联</el-button></el-form-item>
        </el-form>

        <div class="linked-heading">已有来源关联</div>
        <div class="linked-query">
          <el-select v-model="linkQuery.entityType"><el-option v-for="item in entityTypes" :key="item.value" :label="item.label" :value="item.value" /></el-select>
          <el-input-number v-model="linkQuery.entityId" :min="1" controls-position="right" />
          <el-button class="btn-outline" :loading="linkLoading" @click="loadLinks"><el-icon><Search /></el-icon>查询</el-button>
        </div>
        <el-alert v-if="linkError" type="error" :closable="false" show-icon role="alert" class="page-error">
          <template #title>来源关联查询失败</template>
          <template #default><span>{{ linkError }}</span><el-button link type="primary" @click="loadLinks"><el-icon><Refresh /></el-icon>重试</el-button></template>
        </el-alert>
        <el-empty v-if="linkLoaded && !links.length && !linkLoading && !linkError" description="暂无来源关联" />
        <div v-if="linkLoading || (linkLoaded && links.length && !linkError)" class="table-scroll">
          <el-table v-loading="linkLoading" :data="links" stripe class="traditional-table">
            <el-table-column prop="sourceId" label="来源 ID" width="90" />
            <el-table-column prop="title" label="来源名称" min-width="220" show-overflow-tooltip />
            <el-table-column prop="locator" label="定位" width="160" show-overflow-tooltip />
            <el-table-column prop="quote" label="原文摘录" min-width="260" show-overflow-tooltip />
            <el-table-column prop="reviewStatus" label="实体审核" width="110"><template #default="{ row }"><el-tag size="small" :type="reviewTag(row.reviewStatus)">{{ reviewLabel(row.reviewStatus) }}</el-tag></template></el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="审核队列" name="reviews">
        <div class="toolbar-row">
          <el-select v-model="reviewEntityType" clearable placeholder="实体类型" class="filter-select" @change="loadReviews"><el-option v-for="item in entityTypes" :key="item.value" :label="item.label" :value="item.value" /></el-select>
          <el-select v-model="reviewStatus" clearable placeholder="审核状态" class="filter-select" @change="loadReviews"><el-option v-for="item in reviewStatuses" :key="item.value" :label="item.label" :value="item.value" /></el-select>
          <el-button class="btn-outline" @click="loadReviews"><el-icon><Refresh /></el-icon>刷新</el-button>
        </div>
        <el-alert v-if="reviewError" type="error" :closable="false" show-icon role="alert" class="page-error">
          <template #title>审核队列加载失败</template>
          <template #default><span>{{ reviewError }}</span><el-button link type="primary" @click="loadReviews"><el-icon><Refresh /></el-icon>重试</el-button></template>
        </el-alert>
        <el-alert v-if="reviewActionError" type="error" :closable="false" show-icon role="alert" class="page-error">
          <template #title>审核状态更新失败</template>
          <template #default><span>{{ reviewActionError }}</span><el-button v-if="reviewRetry" link type="primary" @click="retryReviewAction"><el-icon><Refresh /></el-icon>重试</el-button></template>
        </el-alert>
        <el-empty v-if="reviewLoaded && !reviewLoading && !reviewError && !reviews.length" description="暂无待处理审核" />
        <div v-if="!reviewError && !(reviewLoaded && !reviewLoading && !reviews.length)" class="table-scroll">
          <el-table v-loading="reviewLoading" :data="reviews" stripe class="traditional-table">
            <el-table-column prop="entityType" label="实体类型" width="140"><template #default="{ row }">{{ entityLabel(row.entityType) }}</template></el-table-column>
            <el-table-column prop="entityId" label="实体 ID" width="100" />
            <el-table-column prop="status" label="当前状态" width="120"><template #default="{ row }"><el-tag size="small" :type="reviewTag(row.status)">{{ reviewLabel(row.status) }}</el-tag></template></el-table-column>
            <el-table-column prop="reviewNote" label="审核备注" min-width="260" show-overflow-tooltip />
            <el-table-column label="下一步" width="180" fixed="right"><template #default="{ row }"><el-button v-if="nextStatus(row.status)" type="primary" link @click="transitionReview(row)"><el-icon><Promotion /></el-icon>{{ reviewLabel(nextStatus(row.status)) }}</el-button><span v-else class="muted">已归档</span></template></el-table-column>
          </el-table>
        </div>
        <el-pagination v-if="!reviewError && reviewTotal > 0" v-model:current-page="reviewPage" v-model:page-size="reviewSize" class="traditional-pagination" :total="reviewTotal" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @current-change="loadReviews" @size-change="loadReviews" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="sourceDialogVisible" :title="sourceForm.id ? '编辑来源文献' : '新增来源文献'" width="620px" class="traditional-dialog" :close-on-click-modal="false">
      <el-alert v-if="sourceActionError" type="error" :closable="false" show-icon role="alert" class="page-error">
        <template #title>来源保存失败</template>
        <template #default><span>{{ sourceActionError }}</span><el-button v-if="sourceActionRetry" link type="primary" @click="retrySourceAction"><el-icon><Refresh /></el-icon>重试</el-button></template>
      </el-alert>
      <el-form :model="sourceForm" label-width="100px" class="traditional-form">
        <el-form-item label="来源类型" required><el-select v-model="sourceForm.sourceType"><el-option v-for="item in sourceTypes" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
        <el-form-item label="来源名称" required><el-input v-model="sourceForm.title" /></el-form-item>
        <el-form-item label="作者/机构"><el-input v-model="sourceForm.authorOrg" /></el-form-item>
        <el-form-item label="出版年份"><el-input-number v-model="sourceForm.publicationYear" :min="1" :max="2100" controls-position="right" /></el-form-item>
        <el-form-item label="ISBN/DOI/编号"><el-input v-model="sourceForm.identifier" /></el-form-item>
        <el-form-item label="URL"><el-input v-model="sourceForm.url" /></el-form-item>
        <el-form-item label="规范引用"><el-input v-model="sourceForm.citation" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="版权说明"><el-input v-model="sourceForm.copyrightNote" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer><el-button class="btn-outline" @click="sourceDialogVisible = false">取消</el-button><el-button type="primary" class="btn-zhu" :loading="sourceSaving" @click="submitSource">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const activeTab = ref('sources')
const entityTypes = [
  { value: 'poem', label: '诗词' }, { value: 'poet', label: '诗人' },
  { value: 'scenic_spot', label: '景点' }, { value: 'event', label: '历史事件' },
  { value: 'cultural_item', label: '文化条目' }, { value: 'dynasty', label: '朝代' },
  { value: 'poem_analysis', label: '诗词赏析' },
]
const sourceTypes = [
  { value: 'book', label: '图书' }, { value: 'article', label: '论文/文章' },
  { value: 'official_site', label: '官方网站' }, { value: 'archive', label: '档案' }, { value: 'other', label: '其他' },
]
const reviewStatuses = [
  { value: 'needs_review', label: '待审核' }, { value: 'approved', label: '已通过' },
  { value: 'published', label: '已发布' }, { value: 'archived', label: '已归档' },
]

const sources = ref([]); const sourceOptions = ref([]); const sourceTotal = ref(0); const sourcePage = ref(1); const sourceSize = ref(20); const sourceKeyword = ref(''); const sourceLoading = ref(false); const sourceLoaded = ref(false); const sourceError = ref(''); const sourceOptionsError = ref(''); const sourceActionError = ref(''); const sourceActionRetry = ref(null)
const reviews = ref([]); const reviewTotal = ref(0); const reviewPage = ref(1); const reviewSize = ref(20); const reviewEntityType = ref(''); const reviewStatus = ref(''); const reviewLoading = ref(false); const reviewLoaded = ref(false); const reviewError = ref(''); const reviewActionError = ref(''); const reviewRetry = ref(null)
const links = ref([]); const linkLoading = ref(false); const linkLoaded = ref(false); const linkError = ref(''); const linkSaving = ref(false); const linkActionError = ref(''); const linkActionRetry = ref(null)
const sourceDialogVisible = ref(false); const sourceSaving = ref(false)
const emptySourceForm = () => ({ sourceType: 'book', title: '', authorOrg: '', publicationYear: null, identifier: '', url: '', citation: '', copyrightNote: '' })
const sourceForm = reactive(emptySourceForm())
const linkForm = reactive({ entityType: 'poem', entityId: null, sourceDocumentId: null, locator: '', quote: '', note: '' })
const linkQuery = reactive({ entityType: 'poem', entityId: null })

const errorMessage = (error, fallback) => error?.message || (typeof error === 'string' ? error : '') || fallback
const isUserCancel = (error) => error === 'cancel' || error === 'close' || error?.action === 'cancel' || error?.action === 'close'

const loadSources = async () => {
  sourceLoading.value = true
  sourceError.value = ''
  try {
    const data = await api.get('/admin/source-documents', { params: { page: sourcePage.value, size: sourceSize.value, keyword: sourceKeyword.value || undefined } })
    sources.value = Array.isArray(data?.records) ? data.records : []
    sourceTotal.value = Number(data?.total) || 0
    sourceLoaded.value = true
  } catch (error) {
    sources.value = []
    sourceTotal.value = 0
    sourceLoaded.value = true
    sourceError.value = errorMessage(error, '来源列表暂时无法加载，请重试')
  } finally {
    sourceLoading.value = false
  }
}

const loadSourceOptions = async () => {
  sourceOptionsError.value = ''
  try {
    const data = await api.get('/admin/source-documents', { params: { page: 1, size: 100 } })
    sourceOptions.value = Array.isArray(data?.records) ? data.records : []
  } catch (error) {
    sourceOptions.value = []
    sourceOptionsError.value = errorMessage(error, '来源选项暂时无法加载，请重试')
  }
}

const loadReviews = async () => {
  reviewLoading.value = true
  reviewError.value = ''
  reviewActionError.value = ''
  reviewRetry.value = null
  try {
    const data = await api.get('/admin/content-reviews', { params: { page: reviewPage.value, size: reviewSize.value, entityType: reviewEntityType.value || undefined, status: reviewStatus.value || undefined } })
    reviews.value = Array.isArray(data?.records) ? data.records : []
    reviewTotal.value = Number(data?.total) || 0
    reviewLoaded.value = true
  } catch (error) {
    reviews.value = []
    reviewTotal.value = 0
    reviewLoaded.value = true
    reviewError.value = errorMessage(error, '审核队列暂时无法加载，请重试')
  } finally {
    reviewLoading.value = false
  }
}

const loadLinks = async () => {
  if (!linkQuery.entityId) {
    links.value = []
    linkLoaded.value = false
    linkError.value = ''
    ElMessage.warning('请输入实体 ID')
    return
  }
  linkLoading.value = true
  linkError.value = ''
  linkLoaded.value = false
  links.value = []
  try {
    const data = await api.get(`/admin/source-links/${linkQuery.entityType}/${linkQuery.entityId}`)
    links.value = Array.isArray(data) ? data : []
    linkLoaded.value = true
  } catch (error) {
    links.value = []
    linkLoaded.value = true
    linkError.value = errorMessage(error, '来源关联暂时无法查询，请重试')
  } finally {
    linkLoading.value = false
  }
}

const openSourceDialog = (row) => {
  sourceActionError.value = ''
  sourceActionRetry.value = null
  Object.keys(sourceForm).forEach(key => delete sourceForm[key])
  Object.assign(sourceForm, row ? { ...row } : emptySourceForm())
  sourceDialogVisible.value = true
}
const submitSource = async () => {
  if (!sourceForm.title.trim()) { ElMessage.warning('来源名称不能为空'); return }
  sourceSaving.value = true
  sourceActionError.value = ''
  sourceActionRetry.value = null
  try {
    if (sourceForm.id) await api.put(`/admin/source-documents/${sourceForm.id}`, sourceForm)
    else await api.post('/admin/source-documents', sourceForm)
    ElMessage.success('来源已保存')
    sourceDialogVisible.value = false
    await Promise.all([loadSources(), loadSourceOptions()])
  } catch (error) {
    sourceActionError.value = errorMessage(error, '来源保存失败，请重试')
    sourceActionRetry.value = () => submitSource()
  } finally {
    sourceSaving.value = false
  }
}

const submitLink = async () => {
  if (!linkForm.entityId || !linkForm.sourceDocumentId) { ElMessage.warning('实体 ID 和来源文献不能为空'); return }
  linkSaving.value = true
  linkActionError.value = ''
  linkActionRetry.value = null
  try {
    await api.post('/admin/source-links', linkForm)
    ElMessage.success('来源关联已保存')
    linkQuery.entityType = linkForm.entityType
    linkQuery.entityId = linkForm.entityId
    await loadLinks()
  } catch (error) {
    linkActionError.value = errorMessage(error, '来源关联保存失败，请重试')
    linkActionRetry.value = () => submitLink()
  } finally {
    linkSaving.value = false
  }
}

const retrySourceAction = async () => {
  if (typeof sourceActionRetry.value === 'function') await sourceActionRetry.value()
}

const retryLinkAction = async () => {
  if (typeof linkActionRetry.value === 'function') await linkActionRetry.value()
}

const transitionReview = async (row) => {
  const next = nextStatus(row.status)
  if (!next) return
  reviewActionError.value = ''
  reviewRetry.value = null
  let value
  try {
    ({ value } = await ElMessageBox.prompt('可选：填写本次审核备注', '推进审核状态', { inputPlaceholder: '如已核对页码和原文摘录' }))
  } catch (error) {
    if (isUserCancel(error)) return
    reviewActionError.value = errorMessage(error, '审核备注窗口无法打开，请重试')
    reviewRetry.value = () => transitionReview(row)
    return
  }
  try {
    await api.put(`/admin/content-reviews/${row.entityType}/${row.entityId}`, { status: next, reviewNote: value || undefined })
    ElMessage.success(`已更新为${reviewLabel(next)}`)
    await loadReviews()
  } catch (error) {
    reviewActionError.value = errorMessage(error, '审核状态更新失败，请重试')
    reviewRetry.value = () => transitionReview(row)
  }
}

const retryReviewAction = async () => {
  if (typeof reviewRetry.value === 'function') await reviewRetry.value()
}

const entityLabel = value => entityTypes.find(item => item.value === value)?.label || value
const reviewLabel = value => ({ draft: '草稿', needs_review: '待审核', approved: '已通过', published: '已发布', archived: '已归档' }[value] || '未知')
const reviewTag = value => ({ needs_review: 'warning', approved: 'success', published: 'success', archived: 'info', draft: 'info' }[value] || 'info')
const nextStatus = value => ({ draft: 'needs_review', needs_review: 'approved', approved: 'published', published: 'archived' }[value] || '')

onMounted(async () => { await Promise.all([loadSources(), loadSourceOptions(), loadReviews()]) })
</script>

<style scoped>
.governance-page { max-width: 1440px; min-width: 0; }
.page-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
.page-subtitle { margin: 8px 0 0; color: var(--text-secondary); font-size: 13px; }
.governance-tabs { background: rgba(255, 255, 255, .52); border: 1px solid var(--border-light); padding: 6px 18px 20px; min-width: 0; }
.governance-tabs :deep(.el-tabs__nav-wrap) { overflow-x: auto; }
.toolbar-row, .linked-query { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 4px 0 16px; }
.search-input { width: 280px; }
.filter-select { width: 150px; }
.page-error { margin: 0 0 12px; }
.page-error :deep(.el-alert__content) { min-width: 0; }
.page-error :deep(.el-button) { margin-left: 10px; }
.table-scroll { width: 100%; min-width: 0; overflow-x: auto; }
.table-scroll :deep(.el-table) { min-width: 700px; }
.traditional-table :deep(.el-table__header th) { background: #FAF6EF !important; color: var(--text-secondary); font-weight: 600; }
.traditional-pagination { margin-top: 18px; justify-content: flex-end; }
.link-form { max-width: 760px; padding: 22px 0 8px; }
.link-form :deep(.el-select), .link-form :deep(.el-input-number) { width: 100%; }
.linked-heading { border-top: 1px solid var(--border-light); padding-top: 22px; margin-top: 12px; font-family: var(--font-display); color: var(--color-mo); font-size: 18px; }
.linked-query :deep(.el-select) { width: 160px; }
.linked-query :deep(.el-input-number) { width: 160px; }
.muted { color: var(--text-muted); font-size: 13px; }
@media (max-width: 680px) { .page-heading { display: block; } .page-heading .el-tag { margin-top: 12px; } .governance-tabs { padding: 4px 10px 16px; } .search-input, .filter-select { width: 100%; } .toolbar-row > .el-button { flex: 1; } .link-form { padding-top: 18px; } .linked-query > * { width: 100% !important; } .table-scroll :deep(.el-table) { min-width: 680px; } .traditional-pagination { justify-content: flex-start; overflow-x: auto; } }
</style>
