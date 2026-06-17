<template>
  <div class="page-container">
    <div class="page-title">事件管理</div>
    <DataTable ref="table" :fetchFn="fetchEvents" @add="openAdd" @edit="openEdit" @delete="handleDelete" @import="showImport = true">
      <el-table-column type="index" label="序号" width="70" />
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="year" label="年份" width="100" />
      <el-table-column prop="significance" label="意义" show-overflow-tooltip />
      <el-table-column label="图片" width="80">
        <template #default="{ row }">
          <el-image v-if="getFirstImage(row.imageUrl)" :src="getFirstImage(row.imageUrl)" style="width: 48px; height: 48px; border-radius: 4px;" fit="cover" />
          <div v-else class="avatar-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <FormDialog :visible="dialogVisible" :isEdit="isEdit" :initialData="current" :submitFn="handleSubmit"
      @close="dialogVisible = false" @success="table.fetch()">
      <template #default="{ form }">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入事件标题" />
        </el-form-item>
        <el-form-item label="朝代">
          <el-select v-model="form.dynastyId" placeholder="选择朝代">
            <el-option v-for="d in dynasties" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="年份">
          <el-input-number v-model="form.year" :controls="false" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入事件描述" />
        </el-form-item>
        <el-form-item label="历史意义">
          <el-input v-model="form.significance" type="textarea" :rows="3" placeholder="请输入历史意义" />
        </el-form-item>
        <el-form-item label="图片">
          <MultiImageUpload v-model="form.imageUrlArray" directory="events" />
        </el-form-item>
      </template>
    </FormDialog>

    <ImportDialog :visible="showImport" :uploadFn="importEvents" @close="showImport = false" @success="table.fetch()" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'
import DataTable from '../components/DataTable.vue'
import FormDialog from '../components/FormDialog.vue'
import ImportDialog from '../components/ImportDialog.vue'
import MultiImageUpload from '../components/MultiImageUpload.vue'

const table = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const current = ref({})
const showImport = ref(false)
const dynasties = ref([])

const getFirstImage = (json) => {
  if (!json) return ''
  try {
    const arr = JSON.parse(json)
    if (Array.isArray(arr)) {
      return arr.length > 0 ? arr[0] : ''
    }
    if (typeof arr === 'string' && arr.trim() !== '' && arr !== '[]') {
      return arr
    }
    return ''
  } catch {
    if (typeof json === 'string') {
      const trimmed = json.trim()
      if (trimmed === '[]' || trimmed === '') return ''
      return trimmed
    }
    return ''
  }
}

const parseImageUrls = (json) => {
  if (!json) return []
  if (Array.isArray(json)) return json
  try {
    const arr = JSON.parse(json)
    if (Array.isArray(arr)) {
      return arr.filter(url => typeof url === 'string' && url.trim() !== '')
    }
    if (typeof arr === 'string' && arr.trim() !== '') {
      return [arr.trim()]
    }
    return []
  } catch {
    if (typeof json === 'string') {
      const trimmed = json.trim()
      if (trimmed === '' || trimmed === '[]') return []
      return [trimmed]
    }
    return []
  }
}

const fetchEvents = (page, size, keyword) => api.get('/admin/events', { params: { page, size, keyword } })

const openAdd = () => {
  isEdit.value = false
  current.value = { imageUrlArray: [] }
  dialogVisible.value = true
}

const openEdit = (row) => {
  isEdit.value = true
  current.value = {
    ...row,
    imageUrlArray: parseImageUrls(row.imageUrl)
  }
  dialogVisible.value = true
}

const handleSubmit = async (form) => {
  const payload = {
    ...form,
    imageUrl: JSON.stringify(form.imageUrlArray || [])
  }
  delete payload.imageUrlArray
  if (isEdit.value) await api.put(`/admin/events/${form.id}`, payload)
  else await api.post('/admin/events', payload)
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
}

const handleDelete = async (row) => { await api.delete(`/admin/events/${row.id}`); ElMessage.success('删除成功'); table.value.fetch() }
const importEvents = async (formData) => {
  return await api.post('/admin/events/import', formData)
}

onMounted(async () => {
  const timeline = await api.get('/public/timeline')
  dynasties.value = timeline.map(t => t.dynasty)
})
</script>

<style scoped>
.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  background: var(--color-xuan-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 20px;
}
</style>
