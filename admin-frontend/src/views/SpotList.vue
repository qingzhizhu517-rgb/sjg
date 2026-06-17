<template>
  <div class="page-container">
    <div class="page-title">景点管理</div>
    <DataTable ref="table" :fetchFn="fetchSpots" @add="openAdd" @edit="openEdit" @delete="handleDelete" @import="showImport = true">
      <el-table-column type="index" label="序号" width="70" />
      <el-table-column prop="name" label="名称" width="180" />
      <el-table-column prop="region" label="地区" width="100" />
      <el-table-column prop="address" label="地址" />
      <el-table-column label="图片" width="80">
        <template #default="{ row }">
          <el-image v-if="getFirstImage(row.imageUrl)" :src="getFirstImage(row.imageUrl)" style="width: 48px; height: 48px; border-radius: 4px;" fit="cover" />
          <div v-else class="avatar-placeholder">
            <el-icon><Location /></el-icon>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="视频" width="80">
        <template #default="{ row }">
          <template v-if="getFirstImage(row.videoUrl)">
            <el-icon style="color: var(--color-zhu); font-size: 18px;"><VideoCamera /></el-icon>
            <span style="font-size:12px;color:var(--text-muted);margin-left:4px;">{{ videoCount(row.videoUrl) }}</span>
          </template>
          <span v-else style="color: var(--text-muted);">—</span>
        </template>
      </el-table-column>
    </DataTable>

    <FormDialog :visible="dialogVisible" :isEdit="isEdit" :initialData="current" :submitFn="handleSubmit"
      @close="dialogVisible = false" @success="table.fetch()">
      <template #default="{ form }">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="请输入景点名称" />
        </el-form-item>
        <el-form-item label="地区">
          <el-select v-model="form.region" placeholder="选择地区">
            <el-option v-for="r in regions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input-number v-model="form.longitude" :precision="7" :step="0.001" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input-number v-model="form.latitude" :precision="7" :step="0.001" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入景点介绍" />
        </el-form-item>
        <el-form-item label="图片(真实)">
          <MultiImageUpload v-model="form.imageUrlArray" directory="spots" />
        </el-form-item>
        <el-form-item label="图片(动漫)">
          <MultiImageUpload v-model="form.imageAnimeUrlArray" directory="spots/anime" />
        </el-form-item>
        <el-form-item label="视频">
          <VideoUpload v-model="form.videoUrl" directory="spots/videos" />
        </el-form-item>
      </template>
    </FormDialog>

    <ImportDialog :visible="showImport" :uploadFn="importSpots" @close="showImport = false" @success="table.fetch()" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'
import DataTable from '../components/DataTable.vue'
import FormDialog from '../components/FormDialog.vue'
import ImportDialog from '../components/ImportDialog.vue'
import MultiImageUpload from '../components/MultiImageUpload.vue'
import VideoUpload from '../components/VideoUpload.vue'

const regions = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '滨州', '淄博', '东营']
const table = ref(null)
const showImport = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const current = ref({})

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

const videoCount = (json) => {
  const urls = parseImageUrls(json)
  return urls.length > 1 ? `${urls.length}个` : ''
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

const fetchSpots = (page, size, keyword) => api.get('/admin/spots', { params: { page, size, keyword } })

const openAdd = () => {
  isEdit.value = false
  current.value = { imageUrlArray: [], imageAnimeUrlArray: [] }
  dialogVisible.value = true
}

const openEdit = (row) => {
  isEdit.value = true
  current.value = {
    ...row,
    imageUrlArray: parseImageUrls(row.imageUrl),
    imageAnimeUrlArray: parseImageUrls(row.imageAnimeUrl),
    videoUrlArray: parseImageUrls(row.videoUrl)
  }
  dialogVisible.value = true
}

const handleSubmit = async (form) => {
  const payload = {
    ...form,
    imageUrl: JSON.stringify(form.imageUrlArray || []),
    imageAnimeUrl: JSON.stringify(form.imageAnimeUrlArray || []),
    videoUrl: JSON.stringify(form.videoUrlArray || [])
  }
  delete payload.imageUrlArray
  delete payload.imageAnimeUrlArray
  delete payload.videoUrlArray
  if (isEdit.value) await api.put(`/admin/spots/${form.id}`, payload)
  else await api.post('/admin/spots', payload)
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
}

const handleDelete = async (row) => { await api.delete(`/admin/spots/${row.id}`); ElMessage.success('删除成功'); table.value.fetch() }
const importSpots = async (formData) => {
  return await api.post('/admin/spots/import', formData)
}
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
