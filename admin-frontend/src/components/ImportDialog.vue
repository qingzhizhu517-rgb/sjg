<template>
  <el-dialog
    :model-value="visible"
    title="批量导入"
    @close="$emit('close')"
    width="500px"
    class="traditional-dialog"
  >
    <div class="import-upload-area">
      <el-upload
        drag
        :auto-upload="false"
        :on-change="handleChange"
        accept=".xlsx,.xls"
        class="traditional-upload"
      >
        <div class="upload-content">
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">将 Excel 文件拖到此处</div>
          <div class="upload-hint">或 <em>点击选择文件</em></div>
          <div class="upload-format">支持 .xlsx / .xls 格式</div>
        </div>
      </el-upload>
    </div>

    <el-alert
      v-if="result"
      :type="result.success ? 'success' : 'error'"
      :title="result.message"
      show-icon
      class="import-result"
    />

    <template #footer>
      <el-button class="btn-outline" @click="$emit('close')">取消</el-button>
      <el-button class="btn-zhu" type="primary" :loading="loading" @click="upload">
        <el-icon><Upload /></el-icon>
        开始导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ visible: Boolean, uploadFn: Function })
const emit = defineEmits(['close', 'success'])

const file = ref(null)
const loading = ref(false)
const result = ref(null)

const handleChange = (f) => { file.value = f.raw }

const upload = async () => {
  if (!file.value) return
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file.value)
    result.value = await props.uploadFn(formData)
    emit('success')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.import-upload-area {
  margin-bottom: 16px;
}

.traditional-upload :deep(.el-upload-dragger) {
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  background: #FAFAF5;
  padding: 40px 20px;
  transition: all var(--transition-normal);
}

.traditional-upload :deep(.el-upload-dragger:hover) {
  border-color: var(--color-zhu);
  background: #FDF9F2;
}

.upload-content {
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: var(--border-medium);
  margin-bottom: 12px;
}

.upload-text {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.upload-hint {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-muted);
}

.upload-hint em {
  color: var(--color-zhu);
  font-style: normal;
  cursor: pointer;
}

.upload-format {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
  opacity: 0.7;
}

.import-result {
  margin-top: 16px;
}

.traditional-dialog :deep(.el-dialog) {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.traditional-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid var(--border-light);
  background: #FAF6EF;
}

.traditional-dialog :deep(.el-dialog__title) {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-mo);
  letter-spacing: 2px;
}

.traditional-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
  background: #FAF6EF;
}
</style>
