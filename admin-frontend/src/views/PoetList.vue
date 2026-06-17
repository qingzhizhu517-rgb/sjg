<template>
  <div class="page-container">
    <div class="page-title">诗人管理</div>
    <DataTable ref="table" :fetchFn="fetchPoets" @add="openAdd" @edit="openEdit" @delete="handleDelete" @import="showImport = true">
      <el-table-column type="index" label="序号" width="70" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="birthplace" label="籍贯" min-width="150" />
      <el-table-column prop="style" label="风格" min-width="150" />
      <el-table-column label="头像" width="80">
        <template #default="{ row }">
          <el-image v-if="getFirstImage(row.avatarUrl)" :src="getFirstImage(row.avatarUrl)" style="width: 48px; height: 48px; border-radius: 4px;" fit="cover" />
          <div v-else class="avatar-placeholder">
            <el-icon><User /></el-icon>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <FormDialog
      :visible="dialogVisible"
      :isEdit="isEdit"
      :initialData="currentPoet"
      :submitFn="handleSubmit"
      @close="dialogVisible = false"
      @success="table.fetch()"
    >
      <template #default="{ form }">
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" placeholder="请输入诗人姓名" />
        </el-form-item>
        <el-form-item label="朝代">
          <el-select v-model="form.dynastyId" placeholder="选择朝代">
            <el-option v-for="d in dynasties" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="籍贯">
          <el-input v-model="form.birthplace" placeholder="请输入籍贯" />
        </el-form-item>
        <el-form-item label="出生年">
          <el-input-number v-model="form.birthYear" :controls="false" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="去世年">
          <el-input-number v-model="form.deathYear" :controls="false" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="风格">
          <el-input v-model="form.style" placeholder="如：豪放派、婉约派" />
        </el-form-item>
        <el-form-item label="生平简介">
          <el-input v-model="form.biography" type="textarea" :rows="4" placeholder="请输入诗人生平简介" />
        </el-form-item>
        <el-form-item label="头像(真实)">
          <MultiImageUpload v-model="form.avatarUrlArray" directory="poets" />
        </el-form-item>
        <el-form-item label="头像(动漫)">
          <MultiImageUpload v-model="form.avatarAnimeUrlArray" directory="poets/anime" />
        </el-form-item>
      </template>
    </FormDialog>

    <ImportDialog :visible="showImport" :uploadFn="importPoets" @close="showImport = false" @success="table.fetch()" />
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

const table = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentPoet = ref({})
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

const fetchPoets = (page, size, keyword) =>
  api.get('/admin/poets', { params: { page, size, keyword } })

const openAdd = () => {
  isEdit.value = false
  currentPoet.value = { avatarUrlArray: [], avatarAnimeUrlArray: [] }
  dialogVisible.value = true
}

const openEdit = (row) => {
  isEdit.value = true
  currentPoet.value = {
    ...row,
    avatarUrlArray: parseImageUrls(row.avatarUrl),
    avatarAnimeUrlArray: parseImageUrls(row.avatarAnimeUrl)
  }
  dialogVisible.value = true
}

const handleSubmit = async (form) => {
  const payload = {
    ...form,
    avatarUrl: JSON.stringify(form.avatarUrlArray || []),
    avatarAnimeUrl: JSON.stringify(form.avatarAnimeUrlArray || [])
  }
  delete payload.avatarUrlArray
  delete payload.avatarAnimeUrlArray
  if (isEdit.value) {
    await api.put(`/admin/poets/${form.id}`, payload)
  } else {
    await api.post('/admin/poets', payload)
  }
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
}

const handleDelete = async (row) => {
  await api.delete(`/admin/poets/${row.id}`)
  ElMessage.success('删除成功')
  table.value.fetch()
}

const importPoets = async (formData) => {
  formData.append('directory', 'poets')
  return await api.post('/admin/poets/import', formData)
}

api.get('/public/timeline').then(data => {
  dynasties.value = data.map(item => item.dynasty)
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
