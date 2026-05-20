<template>
  <el-dialog :model-value="visible" title="批量导入" @close="$emit('close')" width="500px">
    <el-upload
      drag
      :auto-upload="false"
      :on-change="handleChange"
      accept=".xlsx,.xls"
    >
      <el-icon style="font-size: 48px; color: #c0c4cc;"><UploadFilled /></el-icon>
      <div>将 Excel 文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <el-alert v-if="result" :type="result.success ? 'success' : 'error'" :title="result.message" style="margin-top: 16px;" />
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="upload">开始导入</el-button>
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
