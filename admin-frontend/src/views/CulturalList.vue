<template>
  <div class="page-container">
    <div class="page-title">文化条目管理</div>
    <DataTable ref="table" :fetchFn="fetchItems" :hideImport="true" :actionWidth="280"
      @add="openAdd" @edit="openEdit" @delete="handleDelete">
      <template #toolbar="{ search }">
        <el-select v-model="category" placeholder="类别" style="width: 140px;" @change="search">
          <el-option v-for="c in categories" :key="c.key" :label="c.name" :value="c.key" />
        </el-select>
        <el-select v-model="status" placeholder="状态" clearable style="width: 120px;" @change="search">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
        </el-select>
      </template>
      <el-table-column type="index" label="序号" width="70" />
      <el-table-column prop="title" label="名称" width="180" />
      <el-table-column prop="region" label="区域" width="90">
        <template #default="{ row }">{{ row.region || '全域' }}</template>
      </el-table-column>
      <el-table-column prop="summary" label="简介" show-overflow-tooltip />
      <el-table-column prop="source" label="来源" width="80">
        <template #default="{ row }">
          <el-tag size="small" :type="row.source === 'ai' ? 'info' : 'success'">
            {{ row.source === 'ai' ? 'AI' : '人工' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag size="small" :type="row.status === 'published' ? 'success' : 'warning'" effect="dark">
            {{ row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <template #actions="{ row }">
        <el-button v-if="row.status === 'draft'" type="success" link class="action-link"
          @click="handleStatus(row, 'published')">
          <el-icon><Promotion /></el-icon>发布
        </el-button>
        <el-button v-else type="warning" link class="action-link"
          @click="handleStatus(row, 'draft')">
          <el-icon><Download /></el-icon>下架
        </el-button>
      </template>
    </DataTable>

    <FormDialog :visible="dialogVisible" :isEdit="isEdit" :initialData="current" :submitFn="handleSubmit"
      @close="dialogVisible = false" @success="table.fetch()">
      <template #default="{ form }">
        <el-form-item label="类别" required>
          <el-select v-model="form.category" placeholder="选择类别" :disabled="isEdit">
            <el-option v-for="c in categories" :key="c.key" :label="c.name" :value="c.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.title" placeholder="请输入条目名称" />
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="form.region" placeholder="全域性内容可不选" clearable>
            <el-option v-for="r in regions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.summary" placeholder="一句话简介（卡片用）" />
        </el-form-item>
        <el-form-item label="正文">
          <el-input v-model="form.content" type="textarea" :rows="4" placeholder="详细介绍正文" />
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%;" />
        </el-form-item>
        <template v-if="form.category === 'festival'">
          <el-divider content-position="left">节庆扩展信息</el-divider>
          <el-form-item label="节庆时间">
            <el-input v-model="form.festivalDate" placeholder='如"农历正月初一""每年4月"' />
          </el-form-item>
          <el-form-item label="起源渊源">
            <el-input v-model="form.origin" type="textarea" :rows="2" />
          </el-form-item>
          <el-form-item label="习俗活动">
            <el-input v-model="form.customs" type="textarea" :rows="2" />
          </el-form-item>
          <el-form-item label="节庆饮食">
            <el-input v-model="form.food" type="textarea" :rows="2" />
          </el-form-item>
        </template>
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

const regions = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '滨州', '淄博', '东营']
// 新增类别时在两端注册表同步登记；当前仅 festival 有完整闭环
const categories = [
  { key: 'festival', name: '民俗节庆' },
  { key: 'craft', name: '非遗工艺' },
  { key: 'literature', name: '民间文学' },
  { key: 'food_opera', name: '饮食戏曲' },
]

const table = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const current = ref({})
const category = ref('festival')
const status = ref('')

const fetchItems = (page, size, keyword) =>
  api.get('/admin/cultural', { params: { page, size, keyword, category: category.value, status: status.value || undefined } })

const openAdd = () => {
  isEdit.value = false
  current.value = { category: category.value, sortOrder: 0, status: 'draft', source: 'manual' }
  dialogVisible.value = true
}

const openEdit = async (row) => {
  isEdit.value = true
  const view = await api.get(`/admin/cultural/${row.id}`)
  const detail = view.detail || {}
  current.value = {
    ...view.item,
    festivalDate: detail.festivalDate || '',
    origin: detail.origin || '',
    customs: detail.customs || '',
    food: detail.food || '',
  }
  dialogVisible.value = true
}

const handleSubmit = async (form) => {
  const { festivalDate, origin, customs, food, ...item } = form
  const payload = { item }
  if (item.category === 'festival') {
    payload.festivalDetail = { festivalDate, origin, customs, food }
  }
  if (isEdit.value) await api.put(`/admin/cultural/${form.id}`, payload)
  else await api.post('/admin/cultural', payload)
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
}

const handleStatus = async (row, status) => {
  await api.put(`/admin/cultural/${row.id}/status`, { status })
  ElMessage.success(status === 'published' ? '已发布' : '已下架')
  table.value.fetch()
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文化条目「${row.title}」吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await api.delete(`/admin/cultural/${row.id}`)
    ElMessage.success('删除成功')
    table.value.fetch()
  } catch {
    // 用户取消删除
  }
}
</script>
