<template>
  <div class="page-container">
    <div class="page-title">用户管理</div>
    <el-tabs v-model="statusFilter" @tab-change="handleTabChange" class="status-tabs">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="待审批" name="pending" />
      <el-tab-pane label="已批准" name="approved" />
      <el-tab-pane label="已拒绝" name="rejected" />
      <el-tab-pane label="已禁用" name="disabled" />
    </el-tabs>
    <DataTable ref="table" :fetchFn="fetchUsers">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 'pending'">
            <el-button type="success" link class="action-link" @click="handleApprove(row)">
              <el-icon><Check /></el-icon> 批准
            </el-button>
            <el-button type="danger" link class="action-link" @click="handleReject(row)">
              <el-icon><Close /></el-icon> 拒绝
            </el-button>
          </template>
          <template v-else-if="row.status === 'approved'">
            <el-button type="warning" link class="action-link" @click="handleDisable(row)">
              <el-icon><Lock /></el-icon> 禁用
            </el-button>
            <el-button type="primary" link class="action-link" @click="openResetPassword(row)">
              <el-icon><Key /></el-icon> 重置密码
            </el-button>
          </template>
          <template v-else-if="row.status === 'disabled'">
            <el-button type="success" link class="action-link" @click="handleEnable(row)">
              <el-icon><Unlock /></el-icon> 启用
            </el-button>
            <el-button type="primary" link class="action-link" @click="openResetPassword(row)">
              <el-icon><Key /></el-icon> 重置密码
            </el-button>
          </template>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="resetDialogVisible" title="重置密码" width="400px">
      <el-form :model="resetForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input :value="resetForm.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" required>
          <el-input v-model="resetForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="resetLoading" @click="handleResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'
import DataTable from '../components/DataTable.vue'

const table = ref(null)
const statusFilter = ref('')
const resetDialogVisible = ref(false)
const resetLoading = ref(false)
const resetForm = ref({ id: null, username: '', newPassword: '' })

const fetchUsers = (page, size, keyword) =>
  api.get('/admin/users', { params: { page, size, keyword, status: statusFilter.value || undefined } })

const handleTabChange = () => {
  table.value.fetch()
}

const statusTagType = (status) => {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger', disabled: 'info' }
  return map[status] || 'info'
}

const statusLabel = (status) => {
  const map = { pending: '待审批', approved: '已批准', rejected: '已拒绝', disabled: '已禁用' }
  return map[status] || status
}

const handleApprove = async (row) => {
  await ElMessageBox.confirm(`确定批准用户 "${row.username}"？`, '确认操作')
  await api.put(`/admin/users/${row.id}/approve`)
  ElMessage.success('已批准')
  table.value.fetch()
}

const handleReject = async (row) => {
  await ElMessageBox.confirm(`确定拒绝用户 "${row.username}"？`, '确认操作')
  await api.put(`/admin/users/${row.id}/reject`)
  ElMessage.success('已拒绝')
  table.value.fetch()
}

const handleDisable = async (row) => {
  await ElMessageBox.confirm(`确定禁用用户 "${row.username}"？`, '确认操作')
  await api.put(`/admin/users/${row.id}/disable`)
  ElMessage.success('已禁用')
  table.value.fetch()
}

const handleEnable = async (row) => {
  await ElMessageBox.confirm(`确定启用用户 "${row.username}"？`, '确认操作')
  await api.put(`/admin/users/${row.id}/enable`)
  ElMessage.success('已启用')
  table.value.fetch()
}

const openResetPassword = (row) => {
  resetForm.value = { id: row.id, username: row.username, newPassword: '' }
  resetDialogVisible.value = true
}

const handleResetPassword = async () => {
  if (!resetForm.value.newPassword) {
    ElMessage.error('请输入新密码')
    return
  }
  resetLoading.value = true
  try {
    await api.put(`/admin/users/${resetForm.value.id}/reset-password`, {
      newPassword: resetForm.value.newPassword
    })
    ElMessage.success('密码重置成功')
    resetDialogVisible.value = false
  } finally {
    resetLoading.value = false
  }
}
</script>

<style scoped>
.status-tabs {
  margin-bottom: 16px;
}

.status-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.status-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.action-link {
  padding: 4px 8px;
}

.action-link .el-icon {
  margin-right: 2px;
}
</style>
