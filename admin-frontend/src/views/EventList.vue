<template>
  <div>
    <DataTable ref="table" :fetchFn="fetchEvents" @add="openAdd" @edit="openEdit" @delete="handleDelete">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="year" label="年份" width="100" />
      <el-table-column prop="significance" label="意义" show-overflow-tooltip />
    </DataTable>
    <FormDialog :visible="dialogVisible" :isEdit="isEdit" :initialData="current" :submitFn="handleSubmit"
      @close="dialogVisible = false" @success="table.fetch()">
      <template #default="{ form }">
        <el-form-item label="标题" required><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="朝代">
          <el-select v-model="form.dynastyId" placeholder="选择朝代">
            <el-option v-for="d in dynasties" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="年份"><el-input-number v-model="form.year" :controls="false" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="历史意义"><el-input v-model="form.significance" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="图片">
          <el-upload :show-file-list="false" :http-request="uploadImage" accept="image/*">
            <el-image v-if="form.imageUrl" :src="form.imageUrl" style="width: 100px;" fit="contain" />
            <el-button v-else>上传</el-button>
          </el-upload>
        </el-form-item>
      </template>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'
import DataTable from '../components/DataTable.vue'
import FormDialog from '../components/FormDialog.vue'

const table = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const current = ref({})
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
