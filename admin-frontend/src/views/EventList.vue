<template>
  <div class="page-container">
    <div class="page-title">事件管理</div>
    <DataTable ref="table" :fetchFn="fetchEvents" @add="openAdd" @edit="openEdit" @delete="handleDelete" @import="showImport = true">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="year" label="年份" width="100" />
      <el-table-column prop="significance" label="意义" show-overflow-tooltip />
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
          <el-upload :show-file-list="false" :http-request="uploadImage" accept="image/*">
            <div class="upload-area">
              <el-image v-if="form.imageUrl" :src="form.imageUrl" class="preview-img" fit="contain" />
              <div v-else class="upload-placeholder">
                <el-icon><Plus /></el-icon>
                <span>上传图片</span>
              </div>
            </div>
          </el-upload>
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

const table = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const current = ref({})
const showImport = ref(false)
const dynasties = ref([])

const fetchEvents = (page, size, keyword) => api.get('/admin/events', { params: { page, size, keyword } })
const openAdd = () => { isEdit.value = false; current.value = {}; dialogVisible.value = true }
const openEdit = (row) => { isEdit.value = true; current.value = { ...row }; dialogVisible.value = true }
const handleSubmit = async (form) => {
  if (isEdit.value) await api.put(`/admin/events/${form.id}`, form)
  else await api.post('/admin/events', form)
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
}
const handleDelete = async (row) => { await api.delete(`/admin/events/${row.id}`); ElMessage.success('删除成功'); table.value.fetch() }
const importEvents = async (formData) => {
  return await api.post('/admin/events/import', formData)
}
const uploadImage = async ({ file }) => {
  const formData = new FormData(); formData.append('file', file); formData.append('directory', 'events')
  const { url } = await api.post('/admin/upload', formData)
  current.value.imageUrl = url
}

onMounted(async () => {
  const timeline = await api.get('/public/timeline')
  dynasties.value = timeline.map(t => t.dynasty)
})
</script>

<style scoped>
.upload-area {
  width: 120px;
  height: 120px;
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  background: #FAFAF5;
  overflow: hidden;
}

.upload-area:hover {
  border-color: var(--color-zhu);
  background: #FDF9F2;
}

.upload-area .preview-img {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.upload-placeholder .el-icon {
  font-size: 24px;
}
</style>
