<template>
  <div>
    <div class="page-title">诗词管理</div>
    <DataTable ref="table" :fetchFn="fetchPoems" @add="openAdd" @edit="openEdit" @delete="handleDelete">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="content" label="内容" show-overflow-tooltip />
    </DataTable>

    <FormDialog :visible="dialogVisible" :isEdit="isEdit" :initialData="current" :submitFn="handleSubmit"
      @close="dialogVisible = false" @success="table.fetch()">
      <template #default="{ form }">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入诗词标题" />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入诗词内容" />
        </el-form-item>
        <el-form-item label="作者">
          <el-select v-model="form.poetId" filterable placeholder="选择诗人">
            <el-option v-for="p in poets" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="朝代">
          <el-select v-model="form.dynastyId" placeholder="选择朝代">
            <el-option v-for="d in dynasties" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="创作地点">
          <el-select v-model="form.spotId" filterable clearable placeholder="选择景点">
            <el-option v-for="s in spots" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="注解">
          <el-input v-model="form.annotation" type="textarea" :rows="3" placeholder="请输入注解" />
        </el-form-item>
        <el-form-item label="创作背景">
          <el-input v-model="form.background" type="textarea" :rows="3" placeholder="请输入创作背景" />
        </el-form-item>
        <el-form-item label="音频URL">
          <el-input v-model="form.audioUrl" placeholder="请输入音频地址" />
        </el-form-item>
        <el-form-item label="视频URL">
          <el-input v-model="form.videoUrl" placeholder="请输入视频地址" />
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
const poets = ref([])
const dynasties = ref([])
const spots = ref([])

const fetchPoems = (page, size, keyword) => api.get('/admin/poems', { params: { page, size, keyword } })
const openAdd = () => { isEdit.value = false; current.value = {}; dialogVisible.value = true }
const openEdit = (row) => { isEdit.value = true; current.value = { ...row }; dialogVisible.value = true }
const handleSubmit = async (form) => {
  if (isEdit.value) await api.put(`/admin/poems/${form.id}`, form)
  else await api.post('/admin/poems', form)
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
}
const handleDelete = async (row) => { await api.delete(`/admin/poems/${row.id}`); ElMessage.success('删除成功'); table.value.fetch() }

onMounted(async () => {
  const [poetRes, spotRes, timelineRes] = await Promise.all([
    api.get('/admin/poets', { params: { page: 1, size: 1000 } }),
    api.get('/admin/spots', { params: { page: 1, size: 1000 } }),
    api.get('/public/timeline'),
  ])
  poets.value = poetRes.records
  spots.value = spotRes.records
  dynasties.value = timelineRes.map(t => t.dynasty)
})
</script>
