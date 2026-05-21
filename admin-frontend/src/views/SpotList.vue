<template>
  <div>
    <div class="page-title">景点管理</div>
    <DataTable ref="table" :fetchFn="fetchSpots" @add="openAdd" @edit="openEdit" @delete="handleDelete">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="名称" width="180" />
      <el-table-column prop="region" label="地区" width="100" />
      <el-table-column prop="address" label="地址" />
      <el-table-column label="图片" width="80">
        <template #default="{ row }">
          <el-image v-if="row.imageUrl" :src="row.imageUrl" style="width: 48px; height: 48px; border-radius: 4px;" fit="cover" />
          <div v-else class="avatar-placeholder">
            <el-icon><Location /></el-icon>
          </div>
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
          <el-upload :show-file-list="false" :http-request="(o) => uploadImage(o, 'imageUrl')" accept="image/*">
            <div class="upload-area">
              <el-image v-if="form.imageUrl" :src="form.imageUrl" class="preview-img" fit="contain" />
              <div v-else class="upload-placeholder">
                <el-icon><Plus /></el-icon>
                <span>上传图片</span>
              </div>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="图片(动漫)">
          <el-upload :show-file-list="false" :http-request="(o) => uploadImage(o, 'imageAnimeUrl')" accept="image/*">
            <div class="upload-area">
              <el-image v-if="form.imageAnimeUrl" :src="form.imageAnimeUrl" class="preview-img" fit="contain" />
              <div v-else class="upload-placeholder">
                <el-icon><Plus /></el-icon>
                <span>上传图片</span>
              </div>
            </div>
          </el-upload>
        </el-form-item>
      </template>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'
import DataTable from '../components/DataTable.vue'
import FormDialog from '../components/FormDialog.vue'

const regions = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '滨州', '淄博', '东营']
const table = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const current = ref({})

const fetchSpots = (page, size, keyword) => api.get('/admin/spots', { params: { page, size, keyword } })
const openAdd = () => { isEdit.value = false; current.value = {}; dialogVisible.value = true }
const openEdit = (row) => { isEdit.value = true; current.value = { ...row }; dialogVisible.value = true }
const handleSubmit = async (form) => {
  if (isEdit.value) await api.put(`/admin/spots/${form.id}`, form)
  else await api.post('/admin/spots', form)
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
}
const handleDelete = async (row) => { await api.delete(`/admin/spots/${row.id}`); ElMessage.success('删除成功'); table.value.fetch() }
const uploadImage = async ({ file }, field) => {
  const formData = new FormData(); formData.append('file', file); formData.append('directory', 'spots')
  const { url } = await api.post('/admin/upload', formData)
  current.value[field] = url
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
