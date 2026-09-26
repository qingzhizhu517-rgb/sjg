<template>
  <div class="page-container">
    <div class="page-title">诗词探究任务</div>
    <el-alert
      v-if="operationError && !dialogVisible"
      type="error"
      :closable="false"
      show-icon
      role="alert"
      class="task-operation-alert"
    >
      <template #title>任务操作失败</template>
      <template #default>
        <span>{{ operationError }}</span>
        <el-button v-if="pendingOperation" link type="primary" @click="retryOperation"><el-icon><Refresh /></el-icon>重试</el-button>
      </template>
    </el-alert>
    <DataTable ref="table" :fetchFn="fetchTasks" :hideImport="true" :actionWidth="300" @add="openAdd" @edit="openEdit" @delete="handleDelete">
      <template #toolbar="{ search }">
        <el-select v-model="status" placeholder="状态" clearable style="width: 130px" @change="search">
          <el-option label="草稿" value="draft" /><el-option label="已发布" value="published" /><el-option label="已下架" value="archived" />
        </el-select>
      </template>
      <el-table-column type="index" label="序号" width="70" />
      <el-table-column prop="title" label="任务名称" min-width="220" />
      <el-table-column prop="taskCode" label="分享 ID" width="150" />
      <el-table-column prop="city" label="城市" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }"><el-tag size="small" :type="tagType(row.status)">{{ statusLabel(row.status) }}</el-tag></template>
      </el-table-column>
      <template #actions="{ row }">
        <el-button type="info" link class="action-link" @click="copyTask(row)"><el-icon><CopyDocument /></el-icon>复制</el-button>
        <el-button v-if="row.status === 'draft'" type="success" link class="action-link" @click="changeStatus(row, 'published')">发布</el-button>
        <el-button v-if="row.status === 'published'" type="warning" link class="action-link" @click="changeStatus(row, 'archived')">下架</el-button>
        <el-button v-if="row.status === 'archived'" type="info" link class="action-link" @click="changeStatus(row, 'draft')">恢复草稿</el-button>
      </template>
    </DataTable>
    <FormDialog :visible="dialogVisible" :isEdit="isEdit" :initialData="current" :submitFn="handleSubmit" @close="dialogVisible = false" @success="table.fetch()">
      <template #default="{ form }">
        <el-alert
          v-if="operationError && dialogVisible"
          type="error"
          :closable="false"
          show-icon
          role="alert"
          class="task-operation-alert"
        >
          <template #title>任务操作失败</template>
          <template #default>
            <span>{{ operationError }}</span>
            <el-button v-if="pendingOperation" link type="primary" @click="retryOperation"><el-icon><Refresh /></el-icon>重试</el-button>
          </template>
        </el-alert>
        <el-form-item label="任务名称" required><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="分享 ID" required><el-input v-model="form.taskCode" placeholder="如 jinan-poetry-01" :disabled="isEdit" /></el-form-item>
        <el-form-item label="主城市"><el-input v-model="form.city" placeholder="济南或泰安" /></el-form-item>
        <el-form-item label="学习目标"><el-input v-model="form.goal" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="任务背景"><el-input v-model="form.background" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="任务 JSON" required><el-input v-model="form.contentJson" type="textarea" :rows="16" spellcheck="false" /><div class="json-hint">发布前会检查三步类型、问题文本，以及每题的实体 ID 和来源 ID。</div></el-form-item>
      </template>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'
import DataTable from '../components/DataTable.vue'
import FormDialog from '../components/FormDialog.vue'

const table = ref(null); const dialogVisible = ref(false); const isEdit = ref(false); const current = ref({}); const status = ref(''); const operationError = ref(''); const pendingOperation = ref(null)
const sampleJson = JSON.stringify({ version: 1, resources: [
  { id: 'poem-1', entityType: 'poem', entityId: 1, title: '请替换为诗词标题', snippet: '请填写已审核材料摘要', sourceIds: [1], path: '/poems/1' },
  { id: 'spot-1', entityType: 'scenic_spot', entityId: 1, title: '请替换为景观名称', snippet: '请填写景观与诗词关联的证据摘要', sourceIds: [2], path: '/spots/1' },
], steps: [
  { type: 'evidence', title: '证据阅读', prompt: '先从材料中找出可以核实的事实。', questions: [{ id: 'q-evidence-1', type: 'fact', prompt: '这份材料提供了什么信息？', entityRefs: [{ type: 'poem', id: 1 }], sourceIds: [1] }] },
  { type: 'compare', title: '比较分析', prompt: '把两份材料放在一起比较。', questions: [{ id: 'q-compare-1', type: 'compare', prompt: '两份材料的视角有什么不同？', entityRefs: [{ type: 'poem', id: 1 }, { type: 'scenic_spot', id: 1 }], sourceIds: [1, 2] }] },
  { type: 'reflection', title: '反思表达', prompt: '用证据支持你自己的判断。', questions: [{ id: 'q-reflection-1', type: 'reflection', prompt: '你如何理解这座城市与诗词的关系？', entityRefs: [{ type: 'poem', id: 1 }, { type: 'scenic_spot', id: 1 }], sourceIds: [1, 2] }] },
]}, null, 2)
const fetchTasks = (page, size, keyword) => api.get('/admin/learning-tasks', { params: { page, size, keyword, status: status.value || undefined } })
const errorMessage = (error, fallback) => error?.message || (typeof error === 'string' ? error : '') || fallback
const isUserCancel = (error) => error === 'cancel' || error === 'close' || error?.action === 'cancel' || error?.action === 'close'
const clearOperationError = () => { operationError.value = ''; pendingOperation.value = null }
const setOperationError = (error, fallback, retry) => { operationError.value = errorMessage(error, fallback); pendingOperation.value = retry }
const retryOperation = async () => {
  if (typeof pendingOperation.value !== 'function') return
  const retry = pendingOperation.value
  try {
    await retry()
  } catch {
    // 操作函数已将失败保留在页面状态，这里避免重试按钮产生未处理拒绝。
  }
}

const openAdd = () => { clearOperationError(); isEdit.value = false; current.value = { taskCode: '', title: '', city: '', goal: '', background: '', status: 'draft', contentJson: sampleJson }; dialogVisible.value = true }
const openEdit = async row => {
  clearOperationError()
  isEdit.value = true
  try {
    current.value = await api.get(`/admin/learning-tasks/${row.id}`)
    dialogVisible.value = true
  } catch (error) {
    setOperationError(error, '任务详情加载失败，请重试', () => openEdit(row))
  }
}

const retrySubmit = async form => {
  await handleSubmit(form)
  dialogVisible.value = false
  await table.value?.fetch?.()
}

const handleSubmit = async form => {
  clearOperationError()
  try {
    if (isEdit.value) await api.put(`/admin/learning-tasks/${form.id}`, form)
    else await api.post('/admin/learning-tasks', form)
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
  } catch (error) {
    setOperationError(error, isEdit.value ? '任务更新失败，请重试' : '任务创建失败，请重试', () => retrySubmit(form))
    throw error
  }
}

const copyTask = async row => {
  clearOperationError()
  try {
    const copied = await api.post(`/admin/learning-tasks/${row.id}/copy`)
    ElMessage.success('已复制为草稿')
    table.value.fetch()
    isEdit.value = true
    current.value = copied
    dialogVisible.value = true
  } catch (error) {
    setOperationError(error, '任务复制失败，请重试', () => copyTask(row))
  }
}

const changeStatus = async (row, next) => {
  clearOperationError()
  try {
    await api.put(`/admin/learning-tasks/${row.id}/status`, { status: next })
    ElMessage.success(`已${statusLabel(next)}`)
    table.value.fetch()
  } catch (error) {
    setOperationError(error, `任务${statusLabel(next)}失败，请重试`, () => changeStatus(row, next))
  }
}

const handleDelete = async row => {
  clearOperationError()
  try {
    await ElMessageBox.confirm(`确定删除任务「${row.title}」吗？`, '确认删除', { type: 'warning' })
    await api.delete(`/admin/learning-tasks/${row.id}`)
    ElMessage.success('删除成功')
    table.value.fetch()
  } catch (error) {
    if (isUserCancel(error)) return
    setOperationError(error, '任务删除失败，请重试', () => handleDelete(row))
  }
}
const statusLabel = value => ({ draft: '草稿', published: '已发布', archived: '已下架' }[value] || value)
const tagType = value => ({ draft: 'warning', published: 'success', archived: 'info' }[value] || 'info')
</script>

<style scoped>
.task-operation-alert { margin: 0 0 14px; }
.task-operation-alert :deep(.el-alert__content) { min-width: 0; }
.task-operation-alert :deep(.el-button) { margin-left: 10px; }
.json-hint { color: var(--text-secondary); font-size: 12px; line-height: 1.5; margin-top: 6px; }
</style>
