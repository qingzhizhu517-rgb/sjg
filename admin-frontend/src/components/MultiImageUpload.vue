<template>
  <div class="multi-upload">
    <div class="image-list">
      <div v-for="(url, index) in modelValue" :key="index" class="image-card" @click="handlePreview(index)">
        <el-image :src="url" fit="cover" class="image-thumb" />
        <div class="image-overlay">
          <el-icon class="overlay-btn" @click.stop="openPreview(index)"><ZoomIn /></el-icon>
          <el-icon class="overlay-btn" @click.stop="confirmRemove(index)"><Delete /></el-icon>
        </div>
      </div>
      <el-upload
        v-if="modelValue.length < limit"
        :show-file-list="false"
        :http-request="handleUpload"
        :accept="accept"
      >
        <div class="add-card" v-loading="uploading">
          <el-icon><Plus /></el-icon>
          <span>上传</span>
        </div>
      </el-upload>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="80%" :close-on-click-modal="true" destroy-on-close>
      <div class="preview-wrap">
        <el-image :src="previewUrl" fit="contain" style="width:100%;max-height:70vh;" :preview-src-list="[previewUrl]" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  directory: { type: String, default: 'images' },
  accept: { type: String, default: 'image/*' },
  limit: { type: Number, default: 10 },
})

const emit = defineEmits(['update:modelValue'])
const uploading = ref(false)
const previewVisible = ref(false)
const previewUrl = ref('')

const openPreview = (index) => {
  previewUrl.value = props.modelValue[index]
  previewVisible.value = true
}

const handlePreview = (index) => {
  // 点击整张图片 → 如果有 preview-src-list，el-image 内部已处理
  // 这里也可以打开对话框
  openPreview(index)
}

const handleUpload = async ({ file }) => {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('directory', props.directory)
    const response = await api.post('/admin/upload', formData)
    const url = response && response.url ? response.url : response
    const currentList = Array.isArray(props.modelValue) ? props.modelValue : []
    emit('update:modelValue', [...currentList, url])
    ElMessage.success('上传成功')
  } catch (e) {
    console.error('Upload error:', e)
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const confirmRemove = (index) => {
  ElMessageBox.confirm('确定要删除这张图片吗？删除后不可恢复。', '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger',
  }).then(() => {
    handleRemove(index)
    ElMessage.success('已删除')
  }).catch(() => {})
}

const handleRemove = (index) => {
  const newList = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newList)
}
</script>

<style scoped>
.multi-upload .image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.multi-upload .image-card {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-light);
  cursor: pointer;
}

.multi-upload .image-card .image-thumb {
  width: 100%;
  height: 100%;
}

.multi-upload .image-card .image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.multi-upload .image-card:hover .image-overlay {
  opacity: 1;
}

.multi-upload .overlay-btn {
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.multi-upload .overlay-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.multi-upload .add-card {
  width: 120px;
  height: 120px;
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all var(--transition-normal);
  background: #FAFAF5;
  color: var(--text-muted);
  font-size: 13px;
}

.multi-upload .add-card:hover {
  border-color: var(--color-zhu);
  background: #FDF9F2;
  color: var(--color-zhu);
}

.multi-upload .add-card .el-icon {
  font-size: 22px;
}

.preview-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  border-radius: 8px;
  min-height: 200px;
}
</style>
