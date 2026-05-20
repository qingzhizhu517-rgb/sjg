<template>
  <div>
    <DataTable ref="table" :fetchFn="fetchPoets" @add="openAdd" @edit="openEdit" @delete="handleDelete" @import="showImport = true">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="birthplace" label="籍贯" />
      <el-table-column prop="style" label="风格" />
      <el-table-column label="头像" width="100">
        <template #default="{ row }">
          <el-image v-if="row.avatarUrl" :src="row.avatarUrl" style="width: 50px; height: 50px;" fit="cover" />
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
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="朝代">
          <el-select v-model="form.dynastyId" placeholder="选择朝代">
            <el-option v-for="d in dynasties" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="籍贯">
          <el-input v-model="form.birthplace" />
        </el-form-item>
        <el-form-item label="出生年">
          <el-input-number v-model="form.birthYear" :controls="false" />
        </el-form-item>
        <el-form-item label="去世年">
          <el-input-number v-model="form.deathYear" :controls="false" />
        </el-form-item>
        <el-form-item label="风格">
          <el-input v-model="form.style" />
        </el-form-item>
        <el-form-item label="生平简介">
          <el-input v-model="form.biography" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="头像(真实)">
          <el-upload :show-file-list="false" :http-request="uploadAvatar" accept="image/*">
            <el-image v-if="form.avatarUrl" :src="form.avatarUrl" style="width: 100px;" fit="contain" />
            <el-button v-else>上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="头像(动漫)">
          <el-upload :show-file-list="false" :http-request="uploadAvatarAnime" accept="image/*">
            <el-image v-if="form.avatarAnimeUrl" :src="form.avatarAnimeUrl" style="width: 100px;" fit="contain" />
            <el-button v-else>上传</el-button>
          </el-upload>
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

const table = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentPoet = ref({})
const showImport = ref(false)
const dynasties = ref([])

const fetchPoets = (page, size, keyword) =>
  api.get('/admin/poets', { params: { page, size, keyword } })

const openAdd = () => { isEdit.value = false; currentPoet.value = {}; dialogVisible.value = true }
const openEdit = (row) => { isEdit.value = true; currentPoet.value = { ...row }; dialogVisible.value = true }

const handleSubmit = async (form) => {
  if (isEdit.value) {
    await api.put(`/admin/poets/${form.id}`, form)
  } else {
    await api.post('/admin/poets', form)
  }
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
}

const handleDelete = async (row) => {
  await api.delete(`/admin/poets/${row.id}`)
  ElMessage.success('删除成功')
  table.value.fetch()
}

const uploadAvatar = async ({ file }) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('directory', 'poets')
  const { url } = await api.post('/admin/upload', formData)
  currentPoet.value.avatarUrl = url
}

const uploadAvatarAnime = async ({ file }) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('directory', 'poets/anime')
  const { url } = await api.post('/admin/upload', formData)
  currentPoet.value.avatarAnimeUrl = url
}

const importPoets = async (formData) => {
  formData.append('directory', 'poets')
  return await api.post('/admin/poets/import', formData)
}

// Load dynasties for select
api.get('/public/timeline').then(data => {
  dynasties.value = data.map(item => item.dynasty)
})
</script>
